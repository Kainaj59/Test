"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Users, Share2, Mail, Loader2 } from "lucide-react";

type LeadHit = { id: string; name: string; company: string; status: string };
type ContentHit = {
  id: string;
  agent: "Nora" | "Max";
  kind: "post" | "email";
  label: string;
  snippet: string;
};

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [leads, setLeads] = useState<LeadHit[]>([]);
  const [content, setContent] = useState<ContentHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ferme au changement de page.
  useEffect(() => setOpen(false), [pathname]);

  // Ferme au clic extérieur / Échap.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Recherche débouncée.
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setLeads([]);
      setContent([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setLeads(data.leads ?? []);
        setContent(data.content ?? []);
      } catch {
        setLeads([]);
        setContent([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const hasResults = leads.length > 0 || content.length > 0;
  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
        <Search size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un lead, un contenu…"
          className="w-56 bg-transparent outline-none placeholder:text-muted"
        />
        {loading && <Loader2 size={14} className="animate-spin" />}
      </div>

      {showPanel && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-96 w-96 overflow-y-auto rounded-xl border border-border bg-surface p-2 shadow-2xl">
          {!hasResults && !loading && (
            <p className="px-3 py-4 text-center text-sm text-muted">
              Aucun résultat pour « {q.trim()} ».
            </p>
          )}

          {leads.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                Leads
              </p>
              {leads.map((l) => (
                <Link
                  key={l.id}
                  href="/dashboard/leads"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2"
                >
                  <Users size={15} className="shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{l.name}</span>
                    <span className="block truncate text-xs text-muted">{l.company}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{l.status}</span>
                </Link>
              ))}
            </div>
          )}

          {content.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                Contenus
              </p>
              {content.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/content?agent=${c.agent}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2"
                >
                  {c.agent === "Nora" ? (
                    <Share2 size={15} className="shrink-0 text-brand" />
                  ) : (
                    <Mail size={15} className="shrink-0 text-brand" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.label}</span>
                    <span className="block truncate text-xs text-muted">{c.snippet}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
