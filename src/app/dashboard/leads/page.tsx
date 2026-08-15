import Link from "next/link";
import { Download, Sparkles } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { getLeads } from "@/lib/store";
import type { LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

const statusTone: Record<LeadStatus, string> = {
  nouveau: "brand",
  qualifié: "success",
  "en discussion": "warning",
  gagné: "success",
  perdu: "danger",
};

const FILTERS: { label: string; value: string }[] = [
  { label: "Tous", value: "" },
  { label: "Nouveau", value: "nouveau" },
  { label: "Qualifié", value: "qualifié" },
  { label: "En discussion", value: "en discussion" },
  { label: "Gagné", value: "gagné" },
  { label: "Perdu", value: "perdu" },
];

function scoreColor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 60) return "var(--warning)";
  return "var(--danger)";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.value === status && f.value) ? status! : "";

  const all = await getLeads();
  const leads = active ? all.filter((l) => l.status === active) : all;
  const pipeline = leads
    .filter((l) => l.status !== "perdu")
    .reduce((s, l) => s + l.value, 0);

  const exportHref = active
    ? `/api/leads/export?status=${encodeURIComponent(active)}`
    : "/api/leads/export";

  return (
    <>
      <Topbar
        title="Leads"
        subtitle={`${leads.length} contact${leads.length > 1 ? "s" : ""} · ${pipeline.toLocaleString("fr-FR")} € de pipeline`}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => {
            const on = f.value === active;
            return (
              <Link
                key={f.label}
                href={f.value ? `/dashboard/leads?status=${encodeURIComponent(f.value)}` : "/dashboard/leads"}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  on
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border bg-surface text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
          <a
            href={exportHref}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <Download size={16} />
            Exporter CSV
          </a>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Valeur</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Activité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                      Aucun lead pour ce filtre.
                    </td>
                  </tr>
                )}
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-surface-2">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{lead.name}</p>
                        {lead.source === "Agent Sofia" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                            <Sparkles size={10} /> IA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{lead.company}</p>
                    </td>
                    <td className="px-5 py-4 text-muted">{lead.source}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${lead.score}%`,
                              background: scoreColor(lead.score),
                            }}
                          />
                        </div>
                        <span className="tabular-nums text-muted">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 tabular-nums">
                      {lead.value > 0 ? `${lead.value.toLocaleString("fr-FR")} €` : "—"}
                    </td>
                    <td className="px-5 py-4 text-muted">{lead.agent}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted">
                      {lead.lastActivity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
