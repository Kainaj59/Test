// Configuration de l'agent IA « Max » — rédaction de réponses email.
// Utilisé côté serveur (src/app/api/draft-email/route.ts).

export const MAX_MODEL = "claude-opus-5";

export const TONES = ["Professionnel", "Amical", "Direct"] as const;
export const LENGTHS = ["Court", "Moyen", "Détaillé"] as const;

export type Tone = (typeof TONES)[number];
export type Length = (typeof LENGTHS)[number];

export const MAX_SYSTEM = `Tu es Max, l'agent IA email de Nexora AI. Tu rédiges des réponses email en français, prêtes à envoyer.

Règles :
- Commence par une ligne « Objet : … » puis une ligne vide, puis le corps.
- Structure le corps : salutation, message clair, formule de politesse, et signature « Studio Nexora ».
- Écris directement la réponse, sans préambule ni méta-commentaire (pas de « Voici… »).
- Réponds au contexte fourni : si c'est un email reçu, tiens compte de son contenu.
- Respecte le ton et la longueur demandés.
- N'invente pas d'engagements, de prix ou de dates non fournis ; si une information manque, reste général ou propose un échange.`;

export function buildUserPrompt(
  context: string,
  goal: string,
  tone: Tone,
  length: Length,
) {
  return `Email reçu / contexte :
${context}

Objectif de ma réponse : ${goal || "(répondre de façon adaptée)"}
Ton : ${tone}
Longueur : ${length}

Rédige la réponse.`;
}
