"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Users,
  ListChecks,
  CheckSquare,
  ArrowRightCircle,
  FileText,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import type { CallAnalysis } from "@/lib/analyst";

const SAMPLE = `[00:00] Vous : Bonjour Julien, merci d'avoir pris le temps. Vous m'avez dit gérer un cabinet immobilier ?
[00:08] Julien : Oui, on est 6. Le problème c'est qu'on rate pas mal d'appels le midi et le week-end, et du coup on perd des prospects.
[00:20] Vous : D'accord. Idéalement vous voudriez quoi ? Qu'on filtre les urgences ?
[00:27] Julien : Exactement. Filtrer les urgences, prendre les coordonnées, et nous prévenir en temps réel. Le reste peut attendre le lundi.
[00:41] Vous : Très clair. Côté budget vous êtes sur quel ordre de grandeur ?
[00:48] Julien : Faut que j'en parle à mon associé, mais si ça nous fait gagner des mandats, on est prêts à investir.
[00:58] Vous : Parfait, je vous prépare une démo adaptée à l'immobilier et une proposition tarifaire cette semaine.
[01:05] Julien : Super, ça marche.`;

const sentimentTone: Record<CallAnalysis["sentiment"], string> = {
  positif: "success",
  neutre: "neutral",
  négatif: "danger",
};

function toText(a: CallAnalysis): string {
  return [
    a.title,
    "",
    "RÉSUMÉ",
    a.summary,
    "",
    a.participants.length ? "PARTICIPANTS : " + a.participants.join(", ") : "",
    "",
    "POINTS CLÉS",
    ...a.key_points.map((p) => "- " + p),
    "",
    "ACTIONS",
    ...a.action_items.map((i) => `- ${i.task} (${i.owner})`),
    "",
    "PROCHAINES ÉTAPES",
    ...a.next_steps.map((s) => "- " + s),
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export default function LeoStudioPage() {
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    const t = transcript.trim();
    if (t.length < 40 || loading) return;
    setLoading(true);
    setAnalysis(null);
    setError("");

    try {
      const res = await fetch("/api/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: t }),
      });
      const data = await res.json();
      if (data.needsKey) setNeedsKey(true);
      if (data.error) setError(data.error);
      if (data.analysis) setAnalysis(data.analysis);
    } catch {
      setError("L'analyse a échoué. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Léo — Analyse d'appels & réunions" subtitle="Agent IA en direct" />

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
              La clé API Claude n'est pas configurée — ceci est une analyse de
              démonstration. Ajoute{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5">ANTHROPIC_API_KEY</code>{" "}
              pour analyser tes vrais appels.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Entrée */}
          <div className="card flex flex-col p-5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Transcript de l'appel / de la réunion
              </label>
              <button
                onClick={() => setTranscript(SAMPLE)}
                className="text-xs text-brand hover:underline"
              >
                Charger un exemple
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Colle le transcript exporté depuis Zoom, Google Meet ou Teams
              (texte ou sous-titres VTT).
            </p>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={14}
              placeholder="Colle ici le transcript de ta visio…"
              className="mt-2 w-full flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-xs leading-relaxed outline-none focus:border-brand"
            />
            <button
              onClick={analyze}
              disabled={loading || transcript.trim().length < 40}
              className="brand-gradient mt-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Léo analyse…
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyser
                </>
              )}
            </button>
          </div>

          {/* Résultat */}
          <div className="card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Analyse</p>
              {analysis && <CopyButton text={toText(analysis)} />}
            </div>

            {error && !analysis && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </p>
            )}

            {!analysis && !error && (
              <div className="flex flex-1 flex-col items-center justify-center py-16 text-center text-sm text-muted">
                <FileText size={22} className="mb-2 text-brand" />
                Colle un transcript et Léo en tire un résumé, les points clés,
                les actions et les prochaines étapes.
              </div>
            )}

            {analysis && (
              <div className="space-y-5 overflow-y-auto">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{analysis.title}</h2>
                    <Badge tone={sentimentTone[analysis.sentiment]} dot>
                      {analysis.sentiment}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{analysis.summary}</p>
                  {analysis.participants.length > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                      <Users size={13} /> {analysis.participants.join(", ")}
                    </p>
                  )}
                </div>

                <Section icon={ListChecks} title="Points clés">
                  <ul className="space-y-1.5 text-sm">
                    {analysis.key_points.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section icon={CheckSquare} title="Actions">
                  <ul className="space-y-1.5 text-sm">
                    {analysis.action_items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckSquare size={15} className="mt-0.5 shrink-0 text-brand" />
                        <span>
                          {it.task}{" "}
                          <span className="text-xs text-muted">— {it.owner}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section icon={ArrowRightCircle} title="Prochaines étapes">
                  <ul className="space-y-1.5 text-sm">
                    {analysis.next_steps.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border pt-4">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon size={15} className="text-brand" /> {title}
      </p>
      {children}
    </div>
  );
}
