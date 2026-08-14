"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Briefcase,
  Camera,
  Music2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { PLATFORMS, TONES, type Platform, type Tone } from "@/lib/nora";

const platformMeta: Record<
  Platform,
  { icon: LucideIcon; color: string; handle: string }
> = {
  LinkedIn: { icon: Briefcase, color: "#0a66c2", handle: "Studio Nexora" },
  Instagram: { icon: Camera, color: "#e1306c", handle: "@studio.nexora" },
  TikTok: { icon: Music2, color: "#111", handle: "@studionexora" },
};

const EXAMPLES = [
  "Lancement de notre nouvel agent téléphonique IA",
  "3 signes qu'il faut automatiser sa prospection",
  "Coulisses : comment on fait gagner 40h/mois à nos clients",
];

export default function NoraStudioPage() {
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState<Platform>("LinkedIn");
  const [tone, setTone] = useState<Tone>("Professionnel");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    const b = brief.trim();
    if (!b || loading) return;
    setLoading(true);
    setPost("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: b, platform, tone }),
      });
      if (!res.ok || !res.body) throw new Error("stream indisponible");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const raw = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!raw) continue;
          let obj: { type: string; value?: string; needsKey?: boolean };
          try {
            obj = JSON.parse(raw);
          } catch {
            continue;
          }
          if (obj.type === "text" && obj.value) {
            acc += obj.value;
            setPost(acc);
          } else if (obj.type === "meta" && obj.needsKey) {
            setNeedsKey(true);
          }
        }
      }
    } catch {
      setPost("Oups, la génération a échoué. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  }

  const meta = platformMeta[platform];
  const PIcon = meta.icon;

  return (
    <>
      <Topbar title="Nora — Studio de contenu" subtitle="Agent IA en direct" />

      <div className="p-5 lg:p-8">
        <Link
          href="/dashboard/agents"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} /> Retour aux agents
        </Link>

        {needsKey && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
            <p>
              La clé API Claude n'est pas configurée. Ajoute{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5">ANTHROPIC_API_KEY</code>{" "}
              pour générer de vrais posts.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Panneau de commande */}
          <div className="card p-5">
            <label className="block text-sm font-medium">Sujet du post</label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={3}
              placeholder="De quoi veux-tu parler ?"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setBrief(ex)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand"
                >
                  {ex}
                </button>
              ))}
            </div>

            <p className="mt-5 text-sm font-medium">Plateforme</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => {
                const Icon = platformMeta[p].icon;
                const active = platform === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={16} /> {p}
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-sm font-medium">Ton</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {TONES.map((t) => {
                const active = tone === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-brand bg-brand-soft text-brand"
                        : "border-border bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <button
              onClick={generate}
              disabled={loading || !brief.trim()}
              className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Nora rédige…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> {post ? "Régénérer" : "Générer le post"}
                </>
              )}
            </button>
          </div>

          {/* Aperçu */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Aperçu</p>
              {post && !loading && (
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copié" : "Copier"}
                </button>
              )}
            </div>

            {!post ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-muted">
                <Sparkles size={22} className="mb-2 text-brand" />
                Décris ton sujet, choisis la plateforme et le ton, puis laisse
                Nora rédiger le post.
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full text-white"
                    style={{ background: meta.color }}
                  >
                    <PIcon size={18} />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">{meta.handle}</p>
                    <p className="text-xs text-muted">{platform} · maintenant</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {renderPost(post)}
                  {loading && <span className="ml-0.5 animate-pulse">▍</span>}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Met les hashtags en couleur de marque.
function renderPost(text: string) {
  return text.split(/(#[\p{L}0-9_]+)/gu).map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="font-medium text-brand">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
