"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import type { Qualification } from "@/lib/sofia";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING =
  "Bonjour 👋 Je suis Sofia, l'assistante IA de Nexora. Je peux t'aider à voir comment nos agents s'adapteraient à ton entreprise. Pour commencer : tu fais quoi, et qu'est-ce qui t'amène ?";

const OPENERS = [
  "On est une agence immo, on rate trop d'appels",
  "Je veux automatiser mes réseaux sociaux",
  "On croule sous les emails de prospects",
];

const statusTone: Record<Qualification["status"], string> = {
  qualifié: "success",
  "en discussion": "warning",
  perdu: "danger",
};

export default function SofiaChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [qualification, setQualification] = useState<Qualification | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setPending(true);

    // On envoie la conversation à partir du premier message visiteur.
    const firstUser = next.findIndex((m) => m.role === "user");
    const payload = next.slice(firstUser);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok || !res.body) {
        throw new Error("stream indisponible");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamed = "";
      let assistantAdded = false;

      const pushDelta = (delta: string) => {
        streamed += delta;
        setPending(false);
        const firstChunk = !assistantAdded;
        assistantAdded = true; // synchrone : lisible par le repli après la boucle
        setMessages((m) => {
          const copy = [...m];
          if (firstChunk) {
            copy.push({ role: "assistant", content: streamed });
          } else {
            copy[copy.length - 1] = { role: "assistant", content: streamed };
          }
          return copy;
        });
      };

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
          let obj: {
            type: string;
            value?: string;
            qualification?: Qualification | null;
            needsKey?: boolean;
          };
          try {
            obj = JSON.parse(raw);
          } catch {
            continue;
          }
          if (obj.type === "text" && obj.value) {
            pushDelta(obj.value);
          } else if (obj.type === "meta") {
            if (obj.needsKey) setNeedsKey(true);
            if (obj.qualification) setQualification(obj.qualification);
          }
        }
      }

      if (!assistantAdded) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Peux-tu m'en dire un peu plus ?" },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Oups, je n'ai pas pu répondre. Réessaie." },
      ]);
    } finally {
      setPending(false);
      setLoading(false);
    }
  }

  return (
    <>
      <Topbar title="Sofia — Qualification de leads" subtitle="Agent IA en direct" />

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
              dans tes variables d'environnement pour activer Sofia pour de vrai.
            </p>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Chat */}
          <div className="card flex h-[68vh] flex-col lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#22c55e] text-sm font-semibold text-white">
                So
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">Sofia</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> en ligne
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user"
                        ? "brand-gradient text-white"
                        : "bg-surface-2 text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl bg-surface-2 px-4 py-3">
                    <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-2">
                {OPENERS.map((o) => (
                  <button
                    key={o}
                    onClick={() => send(o)}
                    className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:border-brand hover:text-brand"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écris ton message…"
                className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="brand-gradient grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Panneau qualification */}
          <div className="card h-fit p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand" />
              <p className="font-semibold">Qualification en direct</p>
            </div>

            {!qualification ? (
              <p className="mt-4 text-sm text-muted">
                Discute avec Sofia comme un vrai prospect. Dès qu'elle a assez
                d'informations, elle score le lead et le remplit ici
                automatiquement.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-16 w-16 place-items-center">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke={qualification.score >= 70 ? "var(--success)" : qualification.score >= 45 ? "var(--warning)" : "var(--danger)"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${(qualification.score / 100) * 94.2} 94.2`}
                      />
                    </svg>
                    <span className="absolute text-sm font-semibold">{qualification.score}</span>
                  </div>
                  <div>
                    <Badge tone={statusTone[qualification.status]} dot>
                      {qualification.status}
                    </Badge>
                    <p className="mt-1 text-sm font-medium">{qualification.name}</p>
                    <p className="text-xs text-muted">{qualification.company}</p>
                  </div>
                </div>

                <dl className="space-y-2 border-t border-border pt-4 text-sm">
                  <Row label="Secteur" value={qualification.sector} />
                  <Row label="Besoin" value={qualification.need} />
                  <Row label="Budget" value={qualification.budget} />
                  <Row label="Échéance" value={qualification.timeline} />
                </dl>

                <div className="rounded-xl bg-surface-2 p-3 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 size={13} /> Transmis au commercial
                  </p>
                  {qualification.summary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}
