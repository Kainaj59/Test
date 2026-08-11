import { Download, Filter } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Badge } from "@/components/Badge";
import { leads } from "@/lib/data";
import type { LeadStatus } from "@/lib/types";

const statusTone: Record<LeadStatus, string> = {
  nouveau: "brand",
  qualifié: "success",
  "en discussion": "warning",
  gagné: "success",
  perdu: "danger",
};

function scoreColor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 60) return "var(--warning)";
  return "var(--danger)";
}

export default function LeadsPage() {
  const pipeline = leads
    .filter((l) => l.status !== "perdu")
    .reduce((s, l) => s + l.value, 0);

  return (
    <>
      <Topbar
        title="Leads"
        subtitle={`${leads.length} contacts · ${pipeline.toLocaleString("fr-FR")} € de pipeline`}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex items-center justify-end gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground">
            <Filter size={16} />
            Filtrer
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground">
            <Download size={16} />
            Exporter
          </button>
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
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition-colors hover:bg-surface-2">
                    <td className="px-5 py-4">
                      <p className="font-medium">{lead.name}</p>
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
