import { getLeads } from "@/lib/store";
import type { LeadStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: LeadStatus[] = [
  "nouveau",
  "qualifié",
  "en discussion",
  "gagné",
  "perdu",
];

// Échappe une cellule CSV (séparateur « ; », compatible Excel FR).
function cell(v: string | number) {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  let leads = await getLeads();
  if (status && (STATUSES as string[]).includes(status)) {
    leads = leads.filter((l) => l.status === status);
  }

  const header = [
    "Nom",
    "Entreprise",
    "Email",
    "Source",
    "Statut",
    "Score",
    "Valeur (€)",
    "Agent",
    "Activité",
  ];
  const rows = leads.map((l) => [
    l.name,
    l.company,
    l.email,
    l.source,
    l.status,
    l.score,
    l.value,
    l.agent,
    l.lastActivity,
  ]);

  // BOM UTF-8 pour que les accents s'affichent bien dans Excel.
  const csv =
    "﻿" +
    [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-nexora.csv"',
      "Cache-Control": "no-store",
    },
  });
}
