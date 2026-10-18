import { test } from "node:test";
import assert from "node:assert/strict";
import { sceneryMarkup, variantForLevel, SCENE_VARIANTS } from "../js/scenery.js";

test("there are three variants: day, afternoon and sunset", () => {
  assert.deepEqual(SCENE_VARIANTS, ["day", "afternoon", "sunset"]);
});

test("every variant draws one hidden svg, and each looks different", () => {
  const drawings = SCENE_VARIANTS.map((v) => sceneryMarkup(v));
  for (const svg of drawings) {
    assert.match(svg, /^<svg [^>]*aria-hidden="true"/);
    assert.match(svg, /<\/svg>$/);
  }
  assert.equal(new Set(drawings).size, SCENE_VARIANTS.length);
});

test("unknown variants fall back to day", () => {
  assert.equal(sceneryMarkup("midnight"), sceneryMarkup("day"));
  assert.equal(sceneryMarkup(undefined), sceneryMarkup("day"));
});

test("the scene has drifting clouds, bobbing balloons and a spinning globe", () => {
  for (const v of SCENE_VARIANTS) {
    const svg = sceneryMarkup(v);
    for (const cls of ["scene-cloud", "scene-balloon", "scene-globe-land"]) {
      assert.ok(svg.includes(`class="${cls}"`), `${v} has ${cls}`);
    }
  }
});

test("balloons carry + − × = as text, and clouds carry math facts", () => {
  const svg = sceneryMarkup("day");
  const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
  for (const symbol of ["+", "−", "×", "="]) assert.ok(texts.includes(symbol), `balloon ${symbol}`);
  for (const fact of ["7×8", "10+5", "100"]) assert.ok(texts.includes(fact), `cloud ${fact}`);
});

test("scenery loads nothing from outside the game", () => {
  for (const v of SCENE_VARIANTS) {
    assert.doesNotMatch(sceneryMarkup(v), /https?:\/\/(?!www\.w3\.org)|href=|<image|<script|\son\w+=/i, v);
  }
});

test("levels 1–7 are day, 8–12 afternoon, 13–14 sunset", () => {
  const cases = [[1, "day"], [7, "day"], [8, "afternoon"], [12, "afternoon"], [13, "sunset"], [14, "sunset"], [undefined, "day"], [99, "day"]];
  for (const [level, variant] of cases) assert.equal(variantForLevel(level), variant, `level ${level}`);
});
