"use client";

import { useState } from "react";
import { Phone, Share2, MessageCircle, Mail, Smartphone } from "lucide-react";
import type { Agent } from "@/lib/types";
import { Badge } from "./Badge";

const channelIcon = {
  Téléphone: Phone,
  "Réseaux sociaux": Share2,
  Chat: MessageCircle,
  Email: Mail,
  SMS: Smartphone,
} as const;

const statusMeta = {
  active: { tone: "success", label: "Actif" },
  paused: { tone: "warning", label: "En pause" },
  training: { tone: "brand", label: "Entraînement" },
} as const;

export function AgentCard({ agent }: { agent: Agent }) {
  const [status, setStatus] = useState(agent.status);
  const Icon = channelIcon[agent.channel];
  const on = status === "active";
  const meta = statusMeta[status];

  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
          style={{ background: agent.accent }}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{agent.name}</p>
          <p className="text-sm text-muted">{agent.role}</p>
        </div>
        <div className="ml-auto">
          <Badge tone={meta.tone} dot>
            {meta.label}
          </Badge>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{agent.description}</p>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
        <Metric value={agent.tasksDone.toLocaleString("fr-FR")} label="tâches" />
        <Metric value={`${agent.successRate}%`} label="réussite" />
        <Metric value={`${agent.hoursSaved}h`} label="/semaine" />
      </div>

      <button
        onClick={() => setStatus(on ? "paused" : "active")}
        className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-brand-soft"
      >
        <span>{on ? "Mettre en pause" : "Activer l'agent"}</span>
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${
            on ? "bg-brand" : "bg-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
              on ? "left-4" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
