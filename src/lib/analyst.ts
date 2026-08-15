// Configuration de l'agent IA « Léo » — analyse d'appels & réunions (Zoom, Meet…).
// Utilisé côté serveur (src/app/api/analyze-call/route.ts).

export const LEO_MODEL = "claude-opus-5";

export const LEO_SYSTEM = `Tu es Léo, l'agent IA d'analyse d'appels et de réunions de Nexora AI. On te fournit le transcript (texte brut ou format VTT/sous-titres) d'un appel ou d'une visioconférence (Zoom, Google Meet, Teams…), en français ou non.

Ta mission : produire une analyse claire et actionnable, en français, en appelant l'outil "record_analysis". Tu DOIS toujours appeler cet outil.

Consignes :
- Ignore les horodatages, marqueurs de locuteurs répétitifs et le bruit du format VTT.
- Résume fidèlement : n'invente rien qui ne soit pas dans le transcript.
- Les actions doivent être concrètes ; précise le responsable si le transcript le laisse deviner, sinon « à définir ».
- Le sentiment reflète la tonalité générale de l'échange.`;

export const ANALYSIS_TOOL = {
  name: "record_analysis",
  description:
    "Enregistre l'analyse structurée de l'appel / de la réunion à partir du transcript fourni.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description: "Titre court résumant le sujet de la réunion",
      },
      summary: {
        type: "string",
        description: "Résumé en 2 à 4 phrases",
      },
      participants: {
        type: "array",
        description: "Participants identifiés (peut être vide)",
        items: { type: "string" },
      },
      key_points: {
        type: "array",
        description: "Points clés et décisions abordés",
        items: { type: "string" },
      },
      action_items: {
        type: "array",
        description: "Actions à réaliser",
        items: {
          type: "object",
          properties: {
            task: { type: "string", description: "L'action à réaliser" },
            owner: {
              type: "string",
              description: "Responsable (ou « à définir »)",
            },
          },
          required: ["task", "owner"],
          additionalProperties: false,
        },
      },
      sentiment: {
        type: "string",
        enum: ["positif", "neutre", "négatif"],
        description: "Tonalité générale de l'échange",
      },
      next_steps: {
        type: "array",
        description: "Prochaines étapes recommandées",
        items: { type: "string" },
      },
    },
    required: [
      "title",
      "summary",
      "participants",
      "key_points",
      "action_items",
      "sentiment",
      "next_steps",
    ],
    additionalProperties: false,
  },
};

export type CallAnalysis = {
  title: string;
  summary: string;
  participants: string[];
  key_points: string[];
  action_items: { task: string; owner: string }[];
  sentiment: "positif" | "neutre" | "négatif";
  next_steps: string[];
};

// Analyse de démonstration (affichée quand aucune clé API n'est configurée).
export const DEMO_ANALYSIS: CallAnalysis = {
  title: "(Démo) Découverte — Cabinet immobilier",
  summary:
    "Ceci est une analyse de démonstration. Ajoute ANTHROPIC_API_KEY pour analyser tes vrais transcripts. Le prospect gère un cabinet de 6 personnes et perd des appels le midi et le week-end ; il cherche à automatiser la prise de rendez-vous.",
  participants: ["Vous", "Julien (prospect)"],
  key_points: [
    "6 collaborateurs, beaucoup d'appels manqués hors horaires",
    "Besoin : filtrer les urgences et être prévenu en temps réel",
    "Budget évoqué : à confirmer",
  ],
  action_items: [
    { task: "Envoyer une proposition de démo", owner: "Vous" },
    { task: "Communiquer une grille tarifaire", owner: "Vous" },
  ],
  sentiment: "positif",
  next_steps: [
    "Planifier une démo de 30 min",
    "Préparer un cas d'usage adapté à l'immobilier",
  ],
};
