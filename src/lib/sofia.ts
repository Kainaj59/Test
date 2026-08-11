// Configuration de l'agent IA « Sofia » — qualification de leads.
// Utilisé côté serveur uniquement (src/app/api/qualify/route.ts).

export const SOFIA_MODEL = "claude-opus-5";

export const SOFIA_SYSTEM = `Tu es Sofia, l'agent IA de qualification de leads de Nexora AI.
Tu discutes avec un visiteur d'une PME qui découvre Nexora (une plateforme d'agents IA autonomes : agent téléphonique, réseaux sociaux, qualification de leads, prise de rendez-vous, intégrations HubSpot/Gmail/Google Calendar).

Ton objectif : qualifier ce lead de façon naturelle et chaleureuse, en français, tutoiement.

Déroulé :
- Pose UNE question à la fois, courte. Ne fais pas de longs paragraphes.
- Cherche à comprendre : le prénom, l'entreprise et son secteur, le besoin/problème principal, la taille approximative de l'équipe, le budget ou l'ordre de grandeur, et l'échéance envisagée.
- Reste concis et concret. Reformule brièvement si utile. N'invente jamais d'informations à la place du visiteur.
- Ne promets pas de tarifs précis ni d'engagements ; propose plutôt une démo ou un échange avec un conseiller.

Quand tu as assez d'éléments (au minimum : entreprise + besoin + un signal de budget OU d'échéance), appelle l'outil "record_qualification" pour enregistrer le lead qualifié, puis termine par un message chaleureux proposant la prochaine étape (démo / mise en relation).

Barème du score (0-100) : besoin clair et urgent + budget identifié + décideur = score élevé. Besoin vague, pas de budget, pas d'échéance = score bas.`;

export const QUALIFICATION_TOOL = {
  name: "record_qualification",
  description:
    "Enregistre le lead une fois qu'il est suffisamment qualifié. À n'appeler qu'une seule fois, quand tu disposes d'assez d'informations.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Prénom (ou nom) du contact" },
      company: { type: "string", description: "Nom de l'entreprise" },
      sector: { type: "string", description: "Secteur d'activité" },
      need: {
        type: "string",
        description: "Besoin ou problème principal, en une phrase",
      },
      budget: {
        type: "string",
        description: "Budget ou ordre de grandeur évoqué (ou 'non précisé')",
      },
      timeline: {
        type: "string",
        description: "Échéance envisagée (ou 'non précisé')",
      },
      score: {
        type: "integer",
        description: "Score de qualification de 0 à 100",
      },
      status: {
        type: "string",
        enum: ["qualifié", "en discussion", "perdu"],
        description: "Statut du lead",
      },
      summary: {
        type: "string",
        description: "Résumé en une phrase pour le commercial",
      },
    },
    required: [
      "name",
      "company",
      "sector",
      "need",
      "budget",
      "timeline",
      "score",
      "status",
      "summary",
    ],
    additionalProperties: false,
  },
};

export type Qualification = {
  name: string;
  company: string;
  sector: string;
  need: string;
  budget: string;
  timeline: string;
  score: number;
  status: "qualifié" | "en discussion" | "perdu";
  summary: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
