export type AgentStatus = "active" | "paused" | "training";

export type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  channel: "Téléphone" | "Réseaux sociaux" | "Email" | "Chat" | "SMS";
  tasksDone: number;
  successRate: number; // 0-100
  hoursSaved: number; // per week
  accent: string; // css color var name
  demoHref?: string; // lien vers une démo fonctionnelle de l'agent
};

export type LeadStatus = "nouveau" | "qualifié" | "en discussion" | "gagné" | "perdu";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  status: LeadStatus;
  score: number; // 0-100
  value: number; // € potential
  agent: string;
  lastActivity: string;
};

export type Conversation = {
  id: string;
  contact: string;
  channel: Agent["channel"];
  agent: string;
  preview: string;
  unread: boolean;
  time: string;
  sentiment: "positif" | "neutre" | "négatif";
};

export type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
};

export type ActivityItem = {
  id: string;
  agent: string;
  action: string;
  detail: string;
  time: string;
};
