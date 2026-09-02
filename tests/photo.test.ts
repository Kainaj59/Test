import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampAdjustments,
  cssFilter,
  warmthOverlay,
  applyPixelAdjustments,
  kenBurnsMotion,
  kenBurnsAt,
  easeInOut,
  slideAt,
  videoDuration,
  NEUTRAL_ADJUSTMENTS,
  PRESETS,
  ADJUSTMENT_RANGES,
} from "../src/lib/photo.ts";

test("clampAdjustments — borne les valeurs hors plage (ex. venant de l'IA)", () => {
  const a = clampAdjustments({ brightness: 9, contrast: 0, saturation: -2, warmth: 3 });
  assert.equal(a.brightness, ADJUSTMENT_RANGES.brightness.max);
  assert.equal(a.contrast, ADJUSTMENT_RANGES.contrast.min);
  assert.equal(a.saturation, ADJUSTMENT_RANGES.saturation.min);
  assert.equal(a.warmth, ADJUSTMENT_RANGES.warmth.max);
});

test("clampAdjustments — valeurs manquantes ou NaN → neutre / min", () => {
  const a = clampAdjustments({ brightness: NaN });
  assert.equal(a.brightness, ADJUSTMENT_RANGES.brightness.min);
  assert.equal(a.contrast, 1);
  assert.equal(a.saturation, 1);
  assert.equal(a.warmth, 0);
});

test("cssFilter — construit un filtre CSS valide", () => {
  assert.equal(
    cssFilter(NEUTRAL_ADJUSTMENTS),
    "brightness(1) contrast(1) saturate(1)",
  );
  assert.equal(
    cssFilter({ brightness: 1.125, contrast: 0.9, saturation: 1.2, warmth: 0.1 }),
    "brightness(1.125) contrast(0.9) saturate(1.2)",
  );
});

test("warmthOverlay — chaud = orange, froid = bleu, neutre = invisible", () => {
  assert.equal(warmthOverlay(0).opacity, 0);
  assert.equal(warmthOverlay(0.2).color, "#ff9d3b");
  assert.equal(warmthOverlay(-0.2).color, "#3b82ff");
  assert.equal(warmthOverlay(0.25).opacity, 0.25);
});

test("applyPixelAdjustments — neutre ne change rien", () => {
  const data = new Uint8ClampedArray([10, 100, 200, 255]);
  applyPixelAdjustments(data, NEUTRAL_ADJUSTMENTS);
  assert.deepEqual(Array.from(data), [10, 100, 200, 255]);
});

test("applyPixelAdjustments — la luminosité éclaircit, la chaleur pousse le rouge", () => {
  const bright = new Uint8ClampedArray([100, 100, 100, 255]);
  applyPixelAdjustments(bright, { ...NEUTRAL_ADJUSTMENTS, brightness: 1.2 });
  assert.equal(bright[0], 120);

  const warm = new Uint8ClampedArray([100, 100, 100, 255]);
  applyPixelAdjustments(warm, { ...NEUTRAL_ADJUSTMENTS, warmth: 0.2 });
  assert.ok(warm[0] > 100, "rouge renforcé");
  assert.ok(warm[2] < 100, "bleu réduit");
});

test("presets — tous dans les plages autorisées", () => {
  for (const p of PRESETS) {
    assert.deepEqual(clampAdjustments(p.adjustments), p.adjustments, p.id);
  }
});

test("kenBurnsMotion — motifs alternés et déterministes", () => {
  assert.deepEqual(kenBurnsMotion(0), kenBurnsMotion(4));
  assert.notDeepEqual(kenBurnsMotion(0), kenBurnsMotion(1));
});

test("kenBurnsAt — interpole entre from et to avec easing", () => {
  const m = kenBurnsMotion(0);
  assert.deepEqual(kenBurnsAt(m, 0), m.from);
  assert.deepEqual(kenBurnsAt(m, 1), m.to);
  const mid = kenBurnsAt(m, 0.5);
  assert.ok(mid.scale > m.from.scale && mid.scale < m.to.scale);
});

test("easeInOut — bornes et monotonie", () => {
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.ok(easeInOut(0.25) < easeInOut(0.75));
});

test("videoDuration — n photos × durée", () => {
  assert.equal(videoDuration(5, 3), 15);
  assert.equal(videoDuration(0, 3), 0);
});

test("slideAt — bonne diapo, fondu uniquement en fin de diapo", () => {
  // 3 photos, 3 s chacune, fondu 0,6 s.
  const early = slideAt(1, 3, 3, 0.6);
  assert.equal(early.index, 0);
  assert.equal(early.nextIndex, -1);
  assert.equal(early.nextAlpha, 0);

  const fading = slideAt(2.7, 3, 3, 0.6);
  assert.equal(fading.index, 0);
  assert.equal(fading.nextIndex, 1);
  assert.ok(fading.nextAlpha > 0 && fading.nextAlpha <= 1);

  const second = slideAt(3.1, 3, 3, 0.6);
  assert.equal(second.index, 1);

  // Pas de fondu après la dernière photo.
  const last = slideAt(8.9, 3, 3, 0.6);
  assert.equal(last.index, 2);
  assert.equal(last.nextIndex, -1);
});

test("slideAt — t hors bornes reste exploitable", () => {
  assert.equal(slideAt(-5, 3, 3, 0.6).index, 0);
  assert.equal(slideAt(999, 3, 3, 0.6).index, 2);
});
