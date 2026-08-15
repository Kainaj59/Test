import { Clock, Users, Wallet, Phone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { AreaChart, Donut } from "@/components/charts";
import { Badge } from "@/components/Badge";
import {
  kpis,
  tasksSeries,
  channelBreakdown,
  activity,
  agents,
} from "@/lib/data";
import { getLeads } from "@/lib/store";
import type { ActivityItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vue d'ensemble · Nexora AI" };

export default async function OverviewPage() {
  // Métriques live pilotées par le store (cohérentes avec la page Leads).
  const leads = await getLeads();
  const qualifiedCount = leads.filter(
    (l) => l.status === "qualifié" || l.status === "gagné",
  ).length;
  const pipeline = leads
    .filter((l) => l.status !== "perdu")
    .reduce((s, l) => s + l.value, 0);

  // Les leads qualifiés par Sofia (chat) alimentent le flux d'activité.
  const sofiaActivity: ActivityItem[] = leads
    .filter((l) => l.source === "Agent Sofia")
    .slice(0, 3)
    .map((l) => ({
      id: l.id,
      agent: "Sofia",
      action: "a qualifié un lead",
      detail: `${l.name} · score ${l.score}`,
      time: l.lastActivity,
    }));
  const feed = [...sofiaActivity, ...activity].slice(0, 6);

  return (
    <>
      <Topbar
        title="Vue d'ensemble"
        subtitle="Lundi 11 août — vos agents ont déjà traité 47 tâches aujourd'hui"
      />

      <div className="space-y-6 p-5 lg:p-8">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Clock} label="Heures économisées / sem." value={`${kpis.hoursSaved} h`} delta="+12%" />
          <StatCard icon={Users} label="Leads qualifiés" value={`${qualifiedCount}`} />
          <StatCard icon={Wallet} label="Pipeline" value={`${pipeline.toLocaleString("fr-FR")} €`} />
          <StatCard icon={Phone} label="Appels traités" value={`${kpis.callsHandled}`} delta="+21%" />
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Tâches automatisées</p>
                <p className="text-sm text-muted">14 derniers jours</p>
              </div>
              <Badge tone="success" dot>
                +22% vs. période précédente
              </Badge>
            </div>
            <div className="mt-4">
              <AreaChart data={tasksSeries} />
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold">Répartition par canal</p>
            <p className="text-sm text-muted">Ce mois-ci</p>
            <div className="mt-6 flex justify-center">
              <Donut data={channelBreakdown} />
            </div>
          </div>
        </div>

        {/* Activité + top agents */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <p className="font-semibold">Activité récente</p>
            <ul className="mt-4 divide-y divide-border">
              {feed.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className="brand-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white">
                    {a.agent.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{a.agent}</span>{" "}
                      <span className="text-muted">{a.action}</span>
                    </p>
                    <p className="truncate text-sm text-muted">{a.detail}</p>
                  </div>
                  <span className="ml-auto whitespace-nowrap text-xs text-muted">
                    {a.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <p className="font-semibold">Agents les plus actifs</p>
            <ul className="mt-4 space-y-4">
              {[...agents]
                .sort((a, b) => b.tasksDone - a.tasksDone)
                .slice(0, 4)
                .map((agent) => (
                  <li key={agent.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{agent.name}</span>
                      <span className="text-muted tabular-nums">
                        {agent.tasksDone.toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(agent.tasksDone / 3120) * 100}%`,
                          background: agent.accent,
                        }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
