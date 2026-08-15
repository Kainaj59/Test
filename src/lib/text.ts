// Utilitaires purs (sans dépendances) — réutilisés par les endpoints et testés.

// Normalise pour une recherche insensible aux accents et à la casse.
export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

// Échappe une cellule CSV (séparateur « ; »).
export function csvCell(v: string | number): string {
  const s = String(v ?? "");
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Extrait une valeur numérique (€) d'un budget en texte libre.
export function parseBudget(budget: string): number {
  const digits = budget.replace(/[^\d]/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}
