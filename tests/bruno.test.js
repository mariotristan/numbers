import { test } from "node:test";
import assert from "node:assert/strict";
import { brunoSvg, BRUNO_SVG, OUTFIT_LAYERS } from "../js/bruno.js";
import { CLOSET } from "../js/data/shop.js";

const EMOJI = /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]/u;
const outfit = (slot) => CLOSET.filter((i) => i.slot === slot).map((i) => i.id);

test("every closet item has an outfit layer", () => {
  for (const i of CLOSET) assert.ok(OUTFIT_LAYERS[i.id], i.id);
});

test("default Bruno wears the cap and pencil; a hat replaces the cap", () => {
  assert.match(brunoSvg(), /class="bruno-cap"/);
  assert.match(brunoSvg(), /class="bruno-pencil"/);
  const s = brunoSvg({ hat: "wizard-hat" });
  assert.doesNotMatch(s, /bruno-cap/);
  assert.match(s, /outfit-wizard-hat/);
  assert.match(s, /class="bruno-pencil"/);
});

test("a held item replaces the pencil; glasses and neck items add on top", () => {
  for (const id of outfit("held")) {
    const s = brunoSvg({ held: id });
    assert.doesNotMatch(s, /bruno-pencil/, id);
    assert.match(s, new RegExp(`class="outfit-${id}`), id);
    assert.match(s, /class="bruno-cap"/, id);
  }
  for (const id of [...outfit("glasses"), ...outfit("neck")]) {
    const s = brunoSvg({ glasses: id.includes("glasses") ? id : null, neck: id.includes("glasses") ? null : id });
    assert.match(s, new RegExp(`class="outfit-${id}`), id);
    assert.match(s, /class="bruno-cap"/, id);
    assert.match(s, /class="bruno-pencil"/, id);
  }
});

test("a full outfit wears one layer per slot and ignores unknown ids", () => {
  const s = brunoSvg({ hat: "party-hat", glasses: "sunglasses", neck: "cape", held: "balloon" });
  for (const id of ["party-hat", "sunglasses", "cape", "balloon"]) assert.match(s, new RegExp(`outfit-${id}`));
  assert.doesNotMatch(s, /bruno-cap|bruno-pencil/);
  assert.equal(brunoSvg({ hat: "nope", held: "missing" }), brunoSvg());
  assert.equal(brunoSvg(null), brunoSvg());
});

test("brunoSvg keeps the wave and blink groups and has no emoji", () => {
  for (const worn of [{}, { hat: "astronaut-helmet", glasses: "star-glasses", neck: "scarf", held: "telescope" }]) {
    const s = brunoSvg(worn);
    assert.match(s, /^<svg viewBox="0 -12 120 162"/);
    assert.match(s, /<g class="bruno-wave">/);
    assert.match(s, /<g class="bruno-eyes">/);
    assert.doesNotMatch(s, EMOJI);
    assert.equal((s.match(/<g\b/g) ?? []).length, (s.match(/<\/g>/g) ?? []).length);
  }
  assert.equal(BRUNO_SVG, brunoSvg());
});
