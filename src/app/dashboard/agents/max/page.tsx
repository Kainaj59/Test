"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { SaveContentButton } from "@/components/SaveContentButton";
import { TONES, LENGTHS, type Tone, type Length } from "@/lib/max";

const SAMPLE = `Bonjour,

J'ai vu votre agent téléphonique IA et je gère un cabinet de 6 personnes. On rate pas mal d'appels le midi et le week-end. Est-ce que ça peut filtrer les urgences et nous prévenir ? Et c'est quel budget en gros ?

Merci,
Julien`;

export default function MaxStudioPage() {
  const [context, setContext] = useState("");
  const [goal, setGoal] = useState("");
  const [tone, setTone] = useState<Tone>("Professionnel");
  const [length, setLength] = useState<Length>("Moyen");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    const c = context.trim();
    if (!c || loading) return;
    setLoading(true);
    setDraft("");
    setCopied(false);

    try {
      const res = await fetch("/api/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: c, goal: goal.trim(), tone, length }),
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
          const raw = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (!raw.trim()) continue;
          let obj: { type: string; value?: string; needsKey?: boolean };
          try {
            obj = JSON.parse(raw);
          } catch {
            continue;
          }
          if (obj.type === "text" && obj.value) {
            acc += obj.value;
            setDraft(acc);
          } else if (obj.type === "meta" && obj.needsKey) {
            setNeedsKey(true);
          }
        }
      }
    } catch {
      setDraft("Oups, la rédaction a échoué. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard indisponible */
    }
  }

  // Sépare « Objet : … » du corps pour un rendu email propre.
  const firstBreak = draft.indexOf("\n");
  const firstLine = firstBreak >= 0 ? draft.slice(0, firstBreak) : draft;
  const hasSubject = /^objet\s*:/i.test(firstLine.trim());
  const subject = hasSubject ? firstLine.replace(/^objet\s*:/i, "").trim() : "";
  const bodyText = hasSubject ? draft.slice(firstBreak + 1).replace(/^\s+/, "") : draft;

  return (
    <>
      <Topbar title="Max — Assistant email" subtitle="Agent IA en direct" />

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
              pour rédiger de vraies réponses.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Panneau de commande */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Email reçu / contexte</label>
              <button
                onClick={() => setContext(SAMPLE)}
                className="text-xs text-brand hover:underline"
              >
                Charger un exemple
              </button>
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={7}
              placeholder="Colle ici l'email auquel répondre, ou décris le contexte…"
              className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
            />

            <label className="mt-4 block text-sm font-medium">
              Objectif de la réponse <span className="text-muted">(optionnel)</span>
            </label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex : rassurer, proposer une démo, demander une précision…"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
            />

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Ton</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Longueur</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {LENGTHS.map((l) => (
                    <Chip key={l} active={length === l} onClick={() => setLength(l)}>
                      {l}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || !context.trim()}
              className="brand-gradient mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Max rédige…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> {draft ? "Régénérer" : "Rédiger la réponse"}
                </>
              )}
            </button>
          </div>

          {/* Aperçu email */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Brouillon</p>
              {draft && !loading && (
                <div className="flex items-center gap-2">
                  <SaveContentButton
                    agent="Max"
                    kind="email"
                    label={`Réponse · ${tone} · ${length}`}
                    body={draft}
                  />
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copié" : "Copier"}
                  </button>
                </div>
              )}
            </div>

            {!draft ? (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-muted">
                <Mail size={22} className="mb-2 text-brand" />
                Colle un email, précise l'objectif, le ton et la longueur — Max
                rédige une réponse prête à envoyer.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-xs text-muted">Objet</p>
                  <p className="text-sm font-semibold">
                    {subject || (loading ? "…" : "Réponse")}
                  </p>
                </div>
                <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed">
                  {bodyText}
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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-brand bg-brand-soft text-brand"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
