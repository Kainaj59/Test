import { promises as fs } from "fs";
import path from "path";
import { leads as seedLeads } from "./data";
import type { Lead } from "./types";
import type { Qualification } from "./sofia";

// Couche de persistance des leads.
//
// Implémentation actuelle : fichier JSON local (`.data/leads.json`), qui
// fonctionne immédiatement en `npm run dev` et sur un hébergement Node
// persistant. Sur un runtime serverless au système de fichiers éphémère
// (ex. Vercel), l'écriture échoue silencieusement et on retombe sur un cache
// mémoire — voir README pour brancher une vraie base (Supabase/Postgres) :
// il suffit de réimplémenter getLeads() / addLead() ci-dessous.

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "leads.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

// Cache mémoire de secours si le disque n'est pas inscriptible.
let memoryLeads: Lead[] | null = null;

async function readFile(): Promise<Lead[] | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Lead[];
  } catch {
    return null;
  }
}

async function writeFile(list: Lead[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function getLeads(): Promise<Lead[]> {
  const fromDisk = await readFile();
  if (fromDisk) return fromDisk;
  if (memoryLeads) return memoryLeads;

  // Première lecture : on amorce le store avec les données de démo.
  const seeded = [...seedLeads];
  const persisted = await writeFile(seeded);
  if (!persisted) memoryLeads = seeded;
  return seeded;
}

export async function addLead(lead: Lead): Promise<Lead> {
  const current = await getLeads();
  const next = [lead, ...current];
  const persisted = await writeFile(next);
  if (!persisted) memoryLeads = next;
  return lead;
}

// Estime une valeur (€) à partir d'un budget en texte libre.
function parseBudget(budget: string): number {
  const digits = budget.replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

// Transforme une qualification produite par Sofia en lead persistable.
export function qualificationToLead(q: Qualification): Lead {
  return {
    id: `sofia-${Date.now()}`,
    name: q.name || "Contact",
    company: q.company || "—",
    email: "—",
    source: "Agent Sofia",
    status: q.status,
    score: q.score,
    value: parseBudget(q.budget),
    agent: "Sofia",
    lastActivity: "à l'instant",
  };
}

// --- Contenus générés (posts Nora, emails Max) ---------------------------

export type ContentItem = {
  id: string;
  agent: "Nora" | "Max";
  kind: "post" | "email";
  label: string; // ex : « Instagram · Fun » ou « Réponse · Amical · Court »
  body: string;
  createdAt: string; // ISO
};

let memoryContent: ContentItem[] | null = null;
const MAX_CONTENT = 100;

export async function getContent(): Promise<ContentItem[]> {
  try {
    const raw = await fs.readFile(CONTENT_FILE, "utf8");
    return JSON.parse(raw) as ContentItem[];
  } catch {
    return memoryContent ?? [];
  }
}

export async function addContent(
  item: Omit<ContentItem, "id" | "createdAt">,
): Promise<ContentItem> {
  const full: ContentItem = {
    ...item,
    id: `${item.agent.toLowerCase()}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [full, ...(await getContent())].slice(0, MAX_CONTENT);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CONTENT_FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    memoryContent = next;
  }
  return full;
}
