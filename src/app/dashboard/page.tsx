import { Clock, Users, Phone, MessageSquare } from "lucide-react";
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

export default function OverviewPage() {
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
          <StatCard icon={Users} label="Leads qualifiés" value={`${kpis.leadsQualified}`} delta="+8%" />
          <StatCard icon={Phone} label="Appels traités" value={`${kpis.callsHandled}`} delta="+21%" />
          <StatCard icon={MessageSquare} label="Messages gérés" value={kpis.messagesHandled.toLocaleString("fr-FR")} delta="+5%" />
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
              {activity.map((a) => (
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
