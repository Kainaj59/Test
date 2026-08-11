import { Plus } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { AgentCard } from "@/components/AgentCard";
import { agents } from "@/lib/data";

export default function AgentsPage() {
  const active = agents.filter((a) => a.status === "active").length;

  return (
    <>
      <Topbar
        title="Agents IA"
        subtitle={`${active} agents actifs · ${agents.length} disponibles`}
      />

      <div className="space-y-6 p-5 lg:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Chaque agent travaille en autonomie et vous transmet les points
            importants.
          </p>
          <button className="brand-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25">
            <Plus size={16} />
            Nouvel agent
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </>
  );
}
