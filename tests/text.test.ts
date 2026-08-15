import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeText, csvCell, parseBudget } from "../src/lib/text.ts";

test("normalizeText — insensible aux accents et à la casse", () => {
  assert.equal(normalizeText("Immobilière"), "immobiliere");
  assert.equal(normalizeText("  QUALIFIÉ "), "qualifie");
  assert.equal(normalizeText("Éclat"), "eclat");
});

test("normalizeText — permet une recherche partielle", () => {
  assert.ok(normalizeText("Rey Immobilier").includes(normalizeText("immo")));
});

test("csvCell — échappe séparateurs, guillemets et retours ligne", () => {
  assert.equal(csvCell("simple"), "simple");
  assert.equal(csvCell("a;b"), '"a;b"');
  assert.equal(csvCell('dit "bonjour"'), '"dit ""bonjour"""');
  assert.equal(csvCell("ligne1\nligne2"), '"ligne1\nligne2"');
  assert.equal(csvCell(8400), "8400");
});

test("parseBudget — extrait un nombre du texte libre", () => {
  assert.equal(parseBudget("environ 8 000 €"), 8000);
  assert.equal(parseBudget("12000"), 12000);
  assert.equal(parseBudget("non précisé"), 0);
  assert.equal(parseBudget(""), 0);
});
