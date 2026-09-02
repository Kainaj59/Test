// Lumibnb — configuration de l'analyse IA de photos d'annonces (Claude vision).
// Utilisé côté serveur (src/app/api/lumibnb/analyze/route.ts).

import type { Adjustments } from "@/lib/photo";

export const LUMIBNB_MODEL = "claude-opus-5";

export const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

// ~4 Mo d'image encodée en base64 — largement au-dessus des aperçus 1280px envoyés par le studio.
export const MAX_IMAGE_BASE64_LENGTH = 6_000_000;

export const LUMIBNB_SYSTEM = `Tu es l'œil expert de Lumibnb : photographe professionnel spécialisé dans les annonces de locations courte durée (Airbnb, Booking…). On te montre une photo destinée à une annonce.

Ta mission : aider l'hôte à obtenir plus de réservations grâce à cette photo. Tu réponds en français, de façon concrète et bienveillante, en appelant l'outil "record_photo_review". Tu DOIS toujours appeler cet outil.

Consignes :
- Juge la photo comme un voyageur qui fait défiler des annonces : donne-t-elle envie de cliquer ?
- Les conseils doivent être actionnables SANS matériel pro : heure de la prise de vue, rangement, angle, hauteur, lumières à allumer, objets à ajouter/retirer…
- Les réglages de retouche suggérés doivent rester subtils et réalistes (une photo trop retouchée déçoit à l'arrivée et coûte des avis négatifs).
- La légende suggérée met en avant un bénéfice concret pour le voyageur, sans superlatifs creux.
- Si la photo ne montre pas un logement (personne, document, etc.), dis-le dans le verdict et adapte tes conseils.`;

export const PHOTO_REVIEW_TOOL = {
  name: "record_photo_review",
  description:
    "Enregistre l'évaluation structurée de la photo d'annonce et les conseils pour l'améliorer.",
  strict: true,
  input_schema: {
    type: "object" as const,
    properties: {
      score: {
        type: "integer",
        description: "Note globale d'attractivité de la photo pour une annonce (0 à 100)",
      },
      verdict: {
        type: "string",
        description: "Verdict en une phrase, direct et utile",
      },
      scores: {
        type: "object",
        description: "Sous-notes sur 10",
        properties: {
          lumiere: { type: "integer", description: "Qualité de la lumière (0-10)" },
          cadrage: { type: "integer", description: "Cadrage et composition (0-10)" },
          attrait: { type: "integer", description: "Envie de réserver (0-10)" },
        },
        required: ["lumiere", "cadrage", "attrait"],
        additionalProperties: false,
      },
      strengths: {
        type: "array",
        description: "Ce qui fonctionne déjà (1 à 3 points)",
        items: { type: "string" },
      },
      improvements: {
        type: "array",
        description: "Conseils concrets pour améliorer la photo (2 à 4 points, sans matériel pro)",
        items: { type: "string" },
      },
      caption: {
        type: "string",
        description: "Légende suggérée pour cette photo dans l'annonce (1 phrase)",
      },
      adjustments: {
        type: "object",
        description:
          "Réglages de retouche suggérés, subtils. brightness/contrast : 0.7-1.4 (1 = neutre). saturation : 0.5-1.6 (1 = neutre). warmth : -0.3 à 0.4 (0 = neutre, positif = plus chaud).",
        properties: {
          brightness: { type: "number" },
          contrast: { type: "number" },
          saturation: { type: "number" },
          warmth: { type: "number" },
        },
        required: ["brightness", "contrast", "saturation", "warmth"],
        additionalProperties: false,
      },
    },
    required: [
      "score",
      "verdict",
      "scores",
      "strengths",
      "improvements",
      "caption",
      "adjustments",
    ],
    additionalProperties: false,
  },
};

export type PhotoReview = {
  score: number;
  verdict: string;
  scores: { lumiere: number; cadrage: number; attrait: number };
  strengths: string[];
  improvements: string[];
  caption: string;
  adjustments: Adjustments;
};

// Évaluation de démonstration (affichée quand aucune clé API n'est configurée).
export const DEMO_REVIEW: PhotoReview = {
  score: 62,
  verdict:
    "(Démo) Une pièce accueillante mais sous-exposée : plus de lumière et un cadrage plus bas la transformeraient.",
  scores: { lumiere: 5, cadrage: 6, attrait: 6 },
  strengths: [
    "La disposition du mobilier rend la pièce lisible d'un coup d'œil",
    "Les textiles apportent une touche chaleureuse",
  ],
  improvements: [
    "Reprends la photo en fin de matinée, rideaux ouverts et toutes les lampes allumées",
    "Baisse l'appareil à hauteur de poitrine et cadre bien droit (verticales parallèles)",
    "Retire les objets du quotidien visibles (chargeurs, bouteilles, torchons)",
  ],
  caption: "Un salon baigné de lumière pour se poser après une journée de visites.",
  adjustments: { brightness: 1.12, contrast: 1.05, saturation: 1.06, warmth: 0.08 },
};
