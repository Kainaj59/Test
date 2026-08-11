import type {
  Agent,
  Lead,
  Conversation,
  Integration,
  ActivityItem,
} from "./types";

export const agents: Agent[] = [
  {
    id: "tom",
    name: "Léo",
    role: "Agent téléphonique",
    description:
      "Répond, qualifie et transfère vos appels entrants 24/7, puis relaie les messages importants à votre équipe.",
    status: "active",
    channel: "Téléphone",
    tasksDone: 1284,
    successRate: 94,
    hoursSaved: 18,
    accent: "var(--brand)",
  },
  {
    id: "john",
    name: "Nora",
    role: "Agent réseaux sociaux",
    description:
      "Crée des visuels, rédige et publie vos posts sur LinkedIn, Instagram et TikTok, et répond aux commentaires.",
    status: "active",
    channel: "Réseaux sociaux",
    tasksDone: 642,
    successRate: 89,
    hoursSaved: 12,
    accent: "var(--brand-2)",
  },
  {
    id: "sofia",
    name: "Sofia",
    role: "Qualification de leads",
    description:
      "Analyse chaque nouveau contact, le score selon vos critères et transmet les opportunités chaudes au commercial.",
    status: "active",
    channel: "Chat",
    tasksDone: 3120,
    successRate: 91,
    hoursSaved: 9,
    accent: "#22c55e",
    demoHref: "/dashboard/agents/sofia",
  },
  {
    id: "max",
    name: "Max",
    role: "Assistant email",
    description:
      "Trie, classe et rédige des réponses à votre boîte de réception, et planifie les relances automatiquement.",
    status: "paused",
    channel: "Email",
    tasksDone: 908,
    successRate: 87,
    hoursSaved: 7,
    accent: "#f59e0b",
  },
  {
    id: "ava",
    name: "Ava",
    role: "Prise de rendez-vous",
    description:
      "Propose des créneaux, confirme et rappelle les rendez-vous en se synchronisant avec votre agenda.",
    status: "training",
    channel: "SMS",
    tasksDone: 214,
    successRate: 82,
    hoursSaved: 4,
    accent: "#38bdf8",
  },
];

export const leads: Lead[] = [
  {
    id: "l1",
    name: "Camille Fontaine",
    company: "Studio Éclat",
    email: "camille@studioeclat.fr",
    source: "Formulaire site",
    status: "qualifié",
    score: 92,
    value: 8400,
    agent: "Sofia",
    lastActivity: "il y a 12 min",
  },
  {
    id: "l2",
    name: "Julien Marchand",
    company: "Marchand & Fils",
    email: "j.marchand@mf-pro.fr",
    source: "Appel entrant",
    status: "en discussion",
    score: 78,
    value: 15200,
    agent: "Léo",
    lastActivity: "il y a 40 min",
  },
  {
    id: "l3",
    name: "Inès Bouaziz",
    company: "Néroli Cosmetics",
    email: "ines@neroli.co",
    source: "Instagram",
    status: "nouveau",
    score: 61,
    value: 5300,
    agent: "Nora",
    lastActivity: "il y a 1 h",
  },
  {
    id: "l4",
    name: "Thomas Weber",
    company: "Weber Logistik",
    email: "t.weber@weberlog.de",
    source: "LinkedIn",
    status: "gagné",
    score: 96,
    value: 24000,
    agent: "Sofia",
    lastActivity: "il y a 3 h",
  },
  {
    id: "l5",
    name: "Sarah Nkemba",
    company: "BrightPath",
    email: "sarah@brightpath.io",
    source: "Formulaire site",
    status: "qualifié",
    score: 84,
    value: 11800,
    agent: "Sofia",
    lastActivity: "il y a 5 h",
  },
  {
    id: "l6",
    name: "Antoine Rey",
    company: "Rey Immobilier",
    email: "antoine@rey-immo.fr",
    source: "Appel entrant",
    status: "perdu",
    score: 34,
    value: 0,
    agent: "Léo",
    lastActivity: "hier",
  },
  {
    id: "l7",
    name: "Mélanie Dubois",
    company: "Atelier Verso",
    email: "melanie@verso.studio",
    source: "TikTok",
    status: "nouveau",
    score: 57,
    value: 4200,
    agent: "Nora",
    lastActivity: "hier",
  },
  {
    id: "l8",
    name: "Karim Haddad",
    company: "Haddad Consulting",
    email: "k.haddad@hconsult.fr",
    source: "Email",
    status: "en discussion",
    score: 71,
    value: 9600,
    agent: "Max",
    lastActivity: "hier",
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    contact: "Camille Fontaine",
    channel: "Chat",
    agent: "Sofia",
    preview:
      "Parfait, je note un budget autour de 8 000 €. Je transmets à un conseiller pour un devis détaillé.",
    unread: true,
    time: "12:41",
    sentiment: "positif",
  },
  {
    id: "c2",
    contact: "Julien Marchand",
    channel: "Téléphone",
    agent: "Léo",
    preview:
      "Appel de 4 min qualifié — rappel demandé demain à 10h. RDV proposé dans l'agenda.",
    unread: true,
    time: "12:08",
    sentiment: "neutre",
  },
  {
    id: "c3",
    contact: "@neroli.co",
    channel: "Réseaux sociaux",
    agent: "Nora",
    preview:
      "Merci pour votre message ! Nos coffrets sont dispo en édition limitée, je vous envoie le lien 💜",
    unread: false,
    time: "11:52",
    sentiment: "positif",
  },
  {
    id: "c4",
    contact: "Karim Haddad",
    channel: "Email",
    agent: "Max",
    preview:
      "Bonjour Karim, suite à votre demande voici une proposition de créneau pour un audit gratuit…",
    unread: false,
    time: "10:20",
    sentiment: "neutre",
  },
  {
    id: "c5",
    contact: "Antoine Rey",
    channel: "Téléphone",
    agent: "Léo",
    preview:
      "Le prospect n'était pas dans notre cible (hors zone). Marqué comme perdu, aucune relance.",
    unread: false,
    time: "hier",
    sentiment: "négatif",
  },
];

export const integrations: Integration[] = [
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    description: "Synchronisez leads et opportunités avec votre CRM.",
    connected: true,
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Email",
    description: "Laissez vos agents trier et répondre à vos emails.",
    connected: true,
  },
  {
    id: "gcal",
    name: "Google Calendar",
    category: "Agenda",
    description: "Prise de rendez-vous et rappels automatiques.",
    connected: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "Réseaux sociaux",
    description: "Publication et gestion des messages et commentaires.",
    connected: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Réseaux sociaux",
    description: "Publication de contenu et prospection sortante.",
    connected: false,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Notifications",
    description: "Recevez les alertes et handoffs de vos agents.",
    connected: false,
  },
];

export const activity: ActivityItem[] = [
  {
    id: "a1",
    agent: "Sofia",
    action: "a qualifié un lead",
    detail: "Camille Fontaine · score 92",
    time: "il y a 12 min",
  },
  {
    id: "a2",
    agent: "Léo",
    action: "a traité un appel",
    detail: "Julien Marchand · 4 min · rappel planifié",
    time: "il y a 40 min",
  },
  {
    id: "a3",
    agent: "Nora",
    action: "a publié un post",
    detail: "Instagram · « Coffret édition limitée »",
    time: "il y a 1 h",
  },
  {
    id: "a4",
    agent: "Ava",
    action: "a confirmé un RDV",
    detail: "Démo produit · jeudi 14h",
    time: "il y a 2 h",
  },
  {
    id: "a5",
    agent: "Max",
    action: "a rédigé 6 réponses",
    detail: "Boîte de réception commerciale",
    time: "il y a 3 h",
  },
];

// 14 derniers jours — tâches automatisées / jour
export const tasksSeries = [
  120, 138, 96, 145, 168, 152, 190, 174, 205, 188, 221, 209, 244, 268,
];

// Répartition des tâches par canal (%)
export const channelBreakdown = [
  { label: "Téléphone", value: 34, color: "var(--brand)" },
  { label: "Réseaux sociaux", value: 26, color: "var(--brand-2)" },
  { label: "Chat", value: 22, color: "#22c55e" },
  { label: "Email", value: 12, color: "#f59e0b" },
  { label: "SMS", value: 6, color: "#38bdf8" },
];

export const kpis = {
  hoursSaved: 41,
  leadsQualified: 128,
  callsHandled: 342,
  messagesHandled: 1960,
};
