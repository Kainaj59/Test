"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Wand2,
  Clapperboard,
  Download,
  RefreshCw,
  AlertTriangle,
  Eye,
  RotateCcw,
  Camera,
  Film,
  ImagePlus,
  type LucideIcon,
} from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import {
  type Adjustments,
  ADJUSTMENT_RANGES,
  NEUTRAL_ADJUSTMENTS,
  PRESETS,
  VIDEO_FORMATS,
  clampAdjustments,
  cssFilter,
  warmthOverlay,
  applyPixelAdjustments,
  kenBurnsMotion,
  kenBurnsAt,
  slideAt,
  videoDuration,
} from "@/lib/photo";
import type { PhotoReview } from "@/lib/lumibnb";

type Photo = { id: string; name: string; url: string; type: string };
type Tab = "retouche" | "analyse" | "video";

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "retouche", label: "Retouche", icon: Wand2 },
  { id: "analyse", label: "Analyse IA", icon: Sparkles },
  { id: "video", label: "Vidéo", icon: Clapperboard },
];

const FADE_SECONDS = 0.6;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "lumibnb"
  );
}

export default function LumibnbStudioPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, Adjustments>>({});
  const [reviews, setReviews] = useState<Record<string, PhotoReview>>({});
  const [tab, setTab] = useState<Tab>("retouche");
  const [dragOver, setDragOver] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [error, setError] = useState("");

  const [videoFormat, setVideoFormat] = useState(VIDEO_FORMATS[1].id);
  const [secondsPerPhoto, setSecondsPerPhoto] = useState(3);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoSubtitle, setVideoSubtitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const active = photos.find((p) => p.id === activeId) ?? null;
  const activeAdjustments = (active && adjustments[active.id]) || NEUTRAL_ADJUSTMENTS;
  const activeReview = active ? reviews[active.id] : undefined;

  const addFiles = useCallback((list: FileList | File[]) => {
    const accepted = Array.from(list).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type),
    );
    if (!accepted.length) return;
    const added: Photo[] = accepted.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name.replace(/\.[^.]+$/, ""),
      url: URL.createObjectURL(f),
      type: f.type,
    }));
    setPhotos((prev) => [...prev, ...added]);
    setActiveId((prev) => prev ?? added[0].id);
  }, []);

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.url);
        imageCache.current.delete(photo.url);
      }
      const next = prev.filter((p) => p.id !== id);
      setActiveId((cur) => (cur === id ? (next[0]?.id ?? null) : cur));
      return next;
    });
  }

  function movePhoto(id: string, dir: -1 | 1) {
    setPhotos((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function setActiveAdjustments(a: Adjustments) {
    if (!active) return;
    setAdjustments((prev) => ({ ...prev, [active.id]: a }));
  }

  async function loadImage(url: string): Promise<HTMLImageElement> {
    const cached = imageCache.current.get(url);
    if (cached) return cached;
    const img = new Image();
    img.src = url;
    await img.decode();
    imageCache.current.set(url, img);
    return img;
  }

  function supportsCtxFilter(ctx: CanvasRenderingContext2D): boolean {
    ctx.filter = "brightness(1.01)";
    const ok = ctx.filter !== "none" && ctx.filter !== "";
    ctx.filter = "none";
    return ok;
  }

  function drawAdjusted(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    a: Adjustments,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
  ) {
    if (supportsCtxFilter(ctx)) {
      ctx.filter = cssFilter(a);
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.filter = "none";
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
      const pixels = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      applyPixelAdjustments(pixels.data, { ...a, warmth: 0 });
      ctx.putImageData(pixels, 0, 0);
    }
    const overlay = warmthOverlay(a.warmth);
    if (overlay.opacity > 0) {
      const prev = ctx.globalCompositeOperation;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = prevAlpha * overlay.opacity;
      ctx.fillStyle = overlay.color;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalCompositeOperation = prev;
      ctx.globalAlpha = prevAlpha;
    }
  }

  async function downloadPhoto() {
    if (!active) return;
    const img = await loadImage(active.url);
    const max = 2560;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawAdjusted(ctx, img, activeAdjustments, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${slugify(active.name)}-lumibnb.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      },
      "image/jpeg",
      0.92,
    );
  }

  async function analyze() {
    if (!active || analyzing) return;
    setAnalyzing(true);
    setError("");
    try {
      const img = await loadImage(active.url);
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);

      const res = await fetch("/api/lumibnb/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (data.needsKey) setNeedsKey(true);
      if (data.error) setError(data.error);
      if (data.review) {
        setReviews((prev) => ({ ...prev, [active.id]: data.review }));
      }
    } catch {
      setError("L'analyse a échoué. Réessaie.");
    } finally {
      setAnalyzing(false);
    }
  }

  function applyReviewAdjustments() {
    if (!activeReview) return;
    setActiveAdjustments(clampAdjustments(activeReview.adjustments));
    setTab("retouche");
  }

  async function generateVideo() {
    if (photos.length < 2 || generating) return;
    if (typeof MediaRecorder === "undefined") {
      setError("Ton navigateur ne permet pas l'enregistrement vidéo (MediaRecorder).");
      return;
    }
    setGenerating(true);
    setError("");
    setVideoProgress(0);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl("");
    }

    try {
      const images = await Promise.all(photos.map((p) => loadImage(p.url)));
      const format = VIDEO_FORMATS.find((f) => f.id === videoFormat) ?? VIDEO_FORMATS[0];
      const W = format.width;
      const H = format.height;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");

      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 8_000_000,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      const total = videoDuration(photos.length, secondsPerPhoto);
      const title = videoTitle.trim();
      const subtitle = videoSubtitle.trim();

      const drawSlide = (photoIndex: number, progress: number, alpha: number) => {
        const img = images[photoIndex];
        const kb = kenBurnsAt(kenBurnsMotion(photoIndex), progress);
        const base = Math.max(W / img.naturalWidth, H / img.naturalHeight) * kb.scale;
        const dw = img.naturalWidth * base;
        const dh = img.naturalHeight * base;
        const mx = Math.max(0, (dw - W) / 2);
        const my = Math.max(0, (dh - H) / 2);
        const dx = (W - dw) / 2 + kb.x * mx;
        const dy = (H - dh) / 2 + kb.y * my;
        ctx.globalAlpha = alpha;
        const a = adjustments[photos[photoIndex].id] ?? NEUTRAL_ADJUSTMENTS;
        drawAdjusted(ctx, img, a, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      };

      const fitFont = (text: string, weight: number, size: number, maxWidth: number) => {
        let s = size;
        do {
          ctx.font = `${weight} ${s}px system-ui, sans-serif`;
          if (ctx.measureText(text).width <= maxWidth) break;
          s -= 2;
        } while (s > 14);
        return s;
      };

      const drawTitleOverlay = (alpha: number) => {
        if (!title && !subtitle) return;
        ctx.globalAlpha = alpha;
        const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.75)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, H * 0.55, W, H * 0.45);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        if (title) {
          fitFont(title, 700, Math.round(W * 0.055), W * 0.86);
          ctx.fillText(title, W * 0.07, H - (subtitle ? H * 0.1 : H * 0.07));
        }
        if (subtitle) {
          ctx.globalAlpha = alpha * 0.85;
          fitFont(subtitle, 400, Math.round(W * 0.032), W * 0.86);
          ctx.fillText(subtitle, W * 0.07, H - H * 0.055);
        }
        ctx.globalAlpha = 1;
      };

      const drawOutro = (alpha: number) => {
        ctx.globalAlpha = alpha * 0.65;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        const line = title || "Votre prochain séjour";
        fitFont(line, 700, Math.round(W * 0.06), W * 0.84);
        ctx.fillText(line, W / 2, H / 2 - W * 0.01);
        ctx.globalAlpha = alpha * 0.9;
        fitFont("Réservez vite — les meilleures dates partent en premier", 400, Math.round(W * 0.03), W * 0.84);
        ctx.fillText(
          "Réservez vite — les meilleures dates partent en premier",
          W / 2,
          H / 2 + W * 0.05,
        );
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
      };

      recorder.start();
      const start = performance.now();

      await new Promise<void>((resolve) => {
        const frame = () => {
          const t = (performance.now() - start) / 1000;
          if (t >= total) {
            resolve();
            return;
          }
          const s = slideAt(t, photos.length, secondsPerPhoto, FADE_SECONDS);
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, W, H);
          drawSlide(s.index, s.progress, 1);
          if (s.nextIndex >= 0) {
            const nextLocal = (s.nextAlpha * FADE_SECONDS) / secondsPerPhoto;
            drawSlide(s.nextIndex, nextLocal, s.nextAlpha);
          }
          if (t < 2.8 && s.index === 0) {
            drawTitleOverlay(t < 0.4 ? t / 0.4 : t > 2.4 ? (2.8 - t) / 0.4 : 1);
          }
          const outroStart = total - Math.min(2, secondsPerPhoto * 0.66);
          if (t > outroStart) {
            drawOutro(Math.min(1, (t - outroStart) / 0.5));
          }
          setVideoProgress(Math.min(1, t / total));
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });

      recorder.stop();
      const blob = await done;
      setVideoUrl(URL.createObjectURL(blob));
      setVideoProgress(1);
    } catch {
      setError("La génération de la vidéo a échoué. Réessaie.");
    } finally {
      setGenerating(false);
    }
  }

  const range = (key: keyof Adjustments) => ADJUSTMENT_RANGES[key];

  return (
    <div className="min-h-screen">
      {/* Barre du haut */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3.5">
          <Link
            href="/lumibnb"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft size={16} /> Lumibnb
          </Link>
          <span className="text-border">/</span>
          <h1 className="flex items-center gap-2 text-sm font-semibold">
            <Camera size={15} className="text-brand" /> Studio
          </h1>
          <p className="ml-auto hidden text-xs text-muted sm:block">
            Vos photos restent sur votre appareil
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5">
        {needsKey && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p>
              La clé API Claude n&apos;est pas configurée — l&apos;analyse affichée est une
              démonstration. Ajoute{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5">ANTHROPIC_API_KEY</code>{" "}
              pour analyser tes vraies photos.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Colonne photos */}
          <div className="card flex flex-col p-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
                dragOver ? "border-brand bg-brand-soft" : "border-border hover:border-brand/50"
              }`}
            >
              <Upload size={20} className="mb-2 text-brand" />
              <p className="font-medium">Déposez vos photos</p>
              <p className="mt-1 text-xs text-muted">JPEG, PNG ou WebP — ou cliquez ici</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {photos.length > 0 && (
              <ul className="mt-3 space-y-2 overflow-y-auto">
                {photos.map((p, i) => (
                  <li
                    key={p.id}
                    className={`flex items-center gap-2 rounded-xl border p-2 ${
                      p.id === activeId ? "border-brand bg-brand-soft" : "border-border"
                    }`}
                  >
                    <button
                      onClick={() => setActiveId(p.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.name}
                        className="size-12 shrink-0 rounded-lg object-cover"
                        style={{ filter: cssFilter(adjustments[p.id] ?? NEUTRAL_ADJUSTMENTS) }}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium">{p.name}</span>
                        <span className="text-[11px] text-muted">
                          Photo {i + 1}
                          {reviews[p.id] ? ` · IA ${reviews[p.id].score}/100` : ""}
                        </span>
                      </span>
                    </button>
                    <span className="flex shrink-0 flex-col">
                      <button
                        onClick={() => movePhoto(p.id, -1)}
                        disabled={i === 0}
                        aria-label="Monter la photo"
                        className="text-muted hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => movePhoto(p.id, 1)}
                        disabled={i === photos.length - 1}
                        aria-label="Descendre la photo"
                        className="text-muted hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronDown size={15} />
                      </button>
                    </span>
                    <button
                      onClick={() => removePhoto(p.id)}
                      aria-label="Retirer la photo"
                      className="shrink-0 text-muted hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Zone de travail */}
          <div className="card flex min-h-[70vh] flex-col p-4">
            <div className="mb-4 flex gap-1 rounded-xl bg-surface-2 p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    tab === t.id ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
                  }`}
                >
                  <t.icon size={15} className={tab === t.id ? "text-brand" : ""} /> {t.label}
                </button>
              ))}
            </div>

            {error && (
              <p className="mb-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </p>
            )}

            {photos.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-muted">
                <ImagePlus size={24} className="mb-2 text-brand" />
                Ajoutez les photos de votre annonce pour commencer : retouche,
                analyse IA et vidéo se débloquent aussitôt.
              </div>
            ) : tab === "retouche" ? (
              /* ------------------------------ RETOUCHE ------------------------------ */
              <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_260px]">
                <div className="flex items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
                  {active && (
                    <div className="relative max-h-[62vh]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={active.url}
                        alt={active.name}
                        className="max-h-[62vh] w-auto rounded-lg"
                        style={{
                          filter: showOriginal ? "none" : cssFilter(activeAdjustments),
                        }}
                      />
                      {!showOriginal && warmthOverlay(activeAdjustments.warmth).opacity > 0 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: warmthOverlay(activeAdjustments.warmth).color,
                            opacity: warmthOverlay(activeAdjustments.warmth).opacity,
                            mixBlendMode: "soft-light",
                          }}
                        />
                      )}
                      {showOriginal && (
                        <span className="absolute left-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                          Original
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Presets
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setActiveAdjustments(preset.adjustments)}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(
                      [
                        ["brightness", "Luminosité"],
                        ["contrast", "Contraste"],
                        ["saturation", "Saturation"],
                        ["warmth", "Température"],
                      ] as [keyof Adjustments, string][]
                    ).map(([key, label]) => (
                      <label key={key} className="block text-xs">
                        <span className="flex justify-between font-medium">
                          {label}
                          <span className="text-muted">
                            {activeAdjustments[key].toFixed(2)}
                          </span>
                        </span>
                        <input
                          type="range"
                          min={range(key).min}
                          max={range(key).max}
                          step={0.01}
                          value={activeAdjustments[key]}
                          onChange={(e) =>
                            setActiveAdjustments({
                              ...activeAdjustments,
                              [key]: Number(e.target.value),
                            })
                          }
                          className="mt-1 w-full accent-[var(--brand)]"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="mt-auto space-y-2">
                    <button
                      onPointerDown={() => setShowOriginal(true)}
                      onPointerUp={() => setShowOriginal(false)}
                      onPointerLeave={() => setShowOriginal(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-medium hover:bg-surface-2"
                    >
                      <Eye size={15} /> Maintenir pour voir l&apos;original
                    </button>
                    <button
                      onClick={() => setActiveAdjustments(NEUTRAL_ADJUSTMENTS)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-medium hover:bg-surface-2"
                    >
                      <RotateCcw size={15} /> Réinitialiser
                    </button>
                    <button
                      onClick={downloadPhoto}
                      className="brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
                    >
                      <Download size={15} /> Télécharger la photo
                    </button>
                  </div>
                </div>
              </div>
            ) : tab === "analyse" ? (
              /* ------------------------------ ANALYSE IA ------------------------------ */
              <div className="grid flex-1 gap-4 lg:grid-cols-2">
                <div className="flex flex-col items-center justify-center rounded-xl bg-black/40 p-2">
                  {active && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={active.url}
                      alt={active.name}
                      className="max-h-[52vh] w-auto rounded-lg"
                    />
                  )}
                  <button
                    onClick={analyze}
                    disabled={analyzing || !active}
                    className="brand-gradient mt-4 flex items-center justify-center gap-2 self-stretch rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Analyse en cours…
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        {activeReview ? "Ré-analyser cette photo" : "Analyser cette photo"}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-col">
                  {!activeReview ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-muted">
                      <Sparkles size={22} className="mb-2 text-brand" />
                      L&apos;IA note la photo comme un voyageur qui fait défiler
                      les annonces, puis vous dit exactement quoi améliorer.
                    </div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto">
                      <div className="flex items-center gap-4">
                        <span className="brand-gradient flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-lg shadow-brand/25">
                          <span className="text-xl font-bold leading-none">
                            {activeReview.score}
                          </span>
                          <span className="text-[10px] opacity-80">/ 100</span>
                        </span>
                        <p className="text-sm">{activeReview.verdict}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            ["lumiere", "Lumière"],
                            ["cadrage", "Cadrage"],
                            ["attrait", "Attrait"],
                          ] as const
                        ).map(([key, label]) => (
                          <div key={key} className="rounded-xl border border-border p-3">
                            <p className="text-xs text-muted">{label}</p>
                            <p className="mt-0.5 text-sm font-semibold">
                              {activeReview.scores[key]}/10
                            </p>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                              <div
                                className="brand-gradient h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, activeReview.scores[key] * 10)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="mb-2 text-sm font-semibold">Ce qui fonctionne</p>
                        <ul className="space-y-1.5 text-sm">
                          {activeReview.strengths.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-success">✓</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-border pt-3">
                        <p className="mb-2 text-sm font-semibold">À améliorer</p>
                        <ul className="space-y-1.5 text-sm">
                          {activeReview.improvements.map((s, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-brand">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Légende suggérée</p>
                          <CopyButton text={activeReview.caption} />
                        </div>
                        <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm italic">
                          « {activeReview.caption} »
                        </p>
                      </div>

                      <button
                        onClick={applyReviewAdjustments}
                        className="brand-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5"
                      >
                        <Wand2 size={16} /> Appliquer les réglages suggérés
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ------------------------------ VIDÉO ------------------------------ */
              <div className="grid flex-1 gap-4 lg:grid-cols-[280px_1fr]">
                <div className="flex flex-col gap-4">
                  <label className="block text-xs">
                    <span className="font-medium">Format</span>
                    <select
                      value={videoFormat}
                      onChange={(e) => setVideoFormat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
                    >
                      {VIDEO_FORMATS.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-xs">
                    <span className="flex justify-between font-medium">
                      Durée par photo
                      <span className="text-muted">{secondsPerPhoto} s</span>
                    </span>
                    <input
                      type="range"
                      min={2}
                      max={5}
                      step={0.5}
                      value={secondsPerPhoto}
                      onChange={(e) => setSecondsPerPhoto(Number(e.target.value))}
                      className="mt-1 w-full accent-[var(--brand)]"
                    />
                  </label>

                  <label className="block text-xs">
                    <span className="font-medium">Titre (nom du logement)</span>
                    <input
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Le Nid — cœur de Nice"
                      maxLength={60}
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                  </label>

                  <label className="block text-xs">
                    <span className="font-medium">Sous-titre (optionnel)</span>
                    <input
                      value={videoSubtitle}
                      onChange={(e) => setVideoSubtitle(e.target.value)}
                      placeholder="2 chambres · 4 voyageurs · terrasse"
                      maxLength={70}
                      className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                  </label>

                  <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">
                    {photos.length} photo{photos.length > 1 ? "s" : ""} ·{" "}
                    {videoDuration(photos.length, secondsPerPhoto).toFixed(0)} s · vos
                    retouches sont reprises dans la vidéo.
                  </p>

                  <button
                    onClick={generateVideo}
                    disabled={generating || photos.length < 2}
                    className="brand-gradient flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
                  >
                    {generating ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Génération…{" "}
                        {Math.round(videoProgress * 100)}%
                      </>
                    ) : (
                      <>
                        <Film size={16} /> Générer la vidéo
                      </>
                    )}
                  </button>
                  {photos.length < 2 && (
                    <p className="text-xs text-muted">
                      Ajoutez au moins 2 photos pour créer une vidéo.
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl bg-black/40 p-4">
                  {generating ? (
                    <div className="w-full max-w-sm text-center">
                      <p className="mb-3 text-sm text-muted">
                        La vidéo s&apos;enregistre en temps réel dans votre navigateur…
                      </p>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="brand-gradient h-full rounded-full transition-[width]"
                          style={{ width: `${Math.round(videoProgress * 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : videoUrl ? (
                    <div className="flex w-full flex-col items-center gap-3">
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        className={`max-h-[55vh] rounded-lg ${
                          videoFormat === "9:16" ? "w-auto" : "w-full max-w-2xl"
                        }`}
                      />
                      <a
                        href={videoUrl}
                        download={`${slugify(videoTitle || "annonce")}-lumibnb.webm`}
                        className="brand-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25"
                      >
                        <Download size={15} /> Télécharger la vidéo
                      </a>
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted">
                      <Clapperboard size={22} className="mx-auto mb-2 text-brand" />
                      Effet Ken Burns, fondus enchaînés, titre et carte de fin —
                      la vidéo est générée ici, sans envoyer vos photos.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
