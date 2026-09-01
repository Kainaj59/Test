// Lumibnb — moteur de retouche photo & de diaporama vidéo (fonctions pures).
// Utilisé côté client (studio) et testé dans tests/photo.test.ts.

export type Adjustments = {
  /** Luminosité — 1 = neutre. */
  brightness: number;
  /** Contraste — 1 = neutre. */
  contrast: number;
  /** Saturation — 1 = neutre. */
  saturation: number;
  /** Température — 0 = neutre, positif = plus chaud, négatif = plus froid. */
  warmth: number;
};

export const ADJUSTMENT_RANGES = {
  brightness: { min: 0.7, max: 1.4 },
  contrast: { min: 0.7, max: 1.4 },
  saturation: { min: 0.5, max: 1.6 },
  warmth: { min: -0.3, max: 0.4 },
} as const;

export const NEUTRAL_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  warmth: 0,
};

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Ramène chaque réglage dans sa plage autorisée (utile pour les valeurs venant de l'IA). */
export function clampAdjustments(a: Partial<Adjustments>): Adjustments {
  return {
    brightness: clamp(
      a.brightness ?? 1,
      ADJUSTMENT_RANGES.brightness.min,
      ADJUSTMENT_RANGES.brightness.max,
    ),
    contrast: clamp(
      a.contrast ?? 1,
      ADJUSTMENT_RANGES.contrast.min,
      ADJUSTMENT_RANGES.contrast.max,
    ),
    saturation: clamp(
      a.saturation ?? 1,
      ADJUSTMENT_RANGES.saturation.min,
      ADJUSTMENT_RANGES.saturation.max,
    ),
    warmth: clamp(
      a.warmth ?? 0,
      ADJUSTMENT_RANGES.warmth.min,
      ADJUSTMENT_RANGES.warmth.max,
    ),
  };
}

/** Filtre CSS appliqué à l'aperçu ET à l'export canvas (ctx.filter) — même rendu. */
export function cssFilter(a: Adjustments): string {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `brightness(${r(a.brightness)}) contrast(${r(a.contrast)}) saturate(${r(a.saturation)})`;
}

/** Voile de température (posé en mix-blend-mode / composite « soft-light »). */
export function warmthOverlay(warmth: number): { color: string; opacity: number } {
  return {
    color: warmth >= 0 ? "#ff9d3b" : "#3b82ff",
    opacity: Math.round(Math.min(Math.abs(warmth), 1) * 1000) / 1000,
  };
}

/**
 * Retouche par pixels (repli quand `ctx.filter` n'est pas supporté, ex. vieux Safari).
 * Modifie `data` (RGBA, 0–255) en place et le renvoie.
 */
export function applyPixelAdjustments(
  data: Uint8ClampedArray,
  a: Adjustments,
): Uint8ClampedArray {
  const warmR = a.warmth * 50;
  const warmB = -a.warmth * 50;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r *= a.brightness;
    g *= a.brightness;
    b *= a.brightness;

    r = (r - 128) * a.contrast + 128;
    g = (g - 128) * a.contrast + 128;
    b = (b - 128) * a.contrast + 128;

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = luma + (r - luma) * a.saturation;
    g = luma + (g - luma) * a.saturation;
    b = luma + (b - luma) * a.saturation;

    data[i] = clamp(r + warmR, 0, 255);
    data[i + 1] = clamp(g, 0, 255);
    data[i + 2] = clamp(b + warmB, 0, 255);
  }
  return data;
}

export type Preset = { id: string; label: string; adjustments: Adjustments };

// Presets calibrés pour la photo d'intérieur (annonces de location).
export const PRESETS: Preset[] = [
  { id: "naturel", label: "Naturel +", adjustments: { brightness: 1.05, contrast: 1.03, saturation: 1.05, warmth: 0.03 } },
  { id: "lumineux", label: "Lumineux", adjustments: { brightness: 1.14, contrast: 1.04, saturation: 1.06, warmth: 0.05 } },
  { id: "chaleureux", label: "Chaleureux", adjustments: { brightness: 1.07, contrast: 1.04, saturation: 1.08, warmth: 0.2 } },
  { id: "eclatant", label: "Éclatant", adjustments: { brightness: 1.08, contrast: 1.14, saturation: 1.25, warmth: 0.04 } },
  { id: "epure", label: "Épuré", adjustments: { brightness: 1.1, contrast: 1.06, saturation: 0.85, warmth: -0.06 } },
];

// ---------------------------------------------------------------------------
// Diaporama vidéo — formats, mouvement Ken Burns et chronologie.
// ---------------------------------------------------------------------------

export type VideoFormat = { id: string; label: string; width: number; height: number };

export const VIDEO_FORMATS: VideoFormat[] = [
  { id: "16:9", label: "Paysage 16:9 — site & YouTube", width: 1280, height: 720 },
  { id: "9:16", label: "Vertical 9:16 — Reels & TikTok", width: 720, height: 1280 },
  { id: "1:1", label: "Carré 1:1 — Instagram", width: 960, height: 960 },
];

export type KenBurnsKeyframe = { scale: number; x: number; y: number };
export type KenBurnsMotion = { from: KenBurnsKeyframe; to: KenBurnsKeyframe };

/**
 * Mouvement de la photo `index` : 4 motifs alternés (zoom avant, zoom arrière,
 * travelling gauche→droite, droite→gauche). x/y en fraction de la marge disponible (-1..1).
 */
export function kenBurnsMotion(index: number): KenBurnsMotion {
  const patterns: KenBurnsMotion[] = [
    { from: { scale: 1.05, x: 0, y: 0 }, to: { scale: 1.18, x: 0, y: 0 } },
    { from: { scale: 1.18, x: 0, y: 0 }, to: { scale: 1.05, x: 0, y: 0 } },
    { from: { scale: 1.12, x: -1, y: 0 }, to: { scale: 1.12, x: 1, y: 0 } },
    { from: { scale: 1.12, x: 1, y: 0.3 }, to: { scale: 1.12, x: -1, y: -0.3 } },
  ];
  return patterns[((index % patterns.length) + patterns.length) % patterns.length];
}

export function easeInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function kenBurnsAt(motion: KenBurnsMotion, t: number): KenBurnsKeyframe {
  const e = easeInOut(t);
  return {
    scale: motion.from.scale + (motion.to.scale - motion.from.scale) * e,
    x: motion.from.x + (motion.to.x - motion.from.x) * e,
    y: motion.from.y + (motion.to.y - motion.from.y) * e,
  };
}

export function videoDuration(photoCount: number, secondsPerPhoto: number): number {
  return Math.max(0, photoCount) * secondsPerPhoto;
}

export type SlideState = {
  /** Photo affichée. */
  index: number;
  /** Avancement dans la diapo (0..1) — pilote le Ken Burns. */
  progress: number;
  /** Photo suivante en fondu enchaîné (ou -1). */
  nextIndex: number;
  /** Opacité de la photo suivante (0..1). */
  nextAlpha: number;
};

/** État du diaporama à l'instant `t` (secondes). Le fondu chevauche la fin de chaque diapo. */
export function slideAt(
  t: number,
  photoCount: number,
  secondsPerPhoto: number,
  fadeSeconds: number,
): SlideState {
  const total = videoDuration(photoCount, secondsPerPhoto);
  const time = clamp(t, 0, Math.max(0, total - 0.001));
  const index = Math.min(photoCount - 1, Math.floor(time / secondsPerPhoto));
  const local = time - index * secondsPerPhoto;
  const progress = local / secondsPerPhoto;

  const fade = Math.min(fadeSeconds, secondsPerPhoto / 2);
  const fadeStart = secondsPerPhoto - fade;
  const hasNext = index < photoCount - 1;
  const inFade = hasNext && local >= fadeStart;

  return {
    index,
    progress,
    nextIndex: inFade ? index + 1 : -1,
    nextAlpha: inFade ? clamp((local - fadeStart) / fade, 0, 1) : 0,
  };
}
