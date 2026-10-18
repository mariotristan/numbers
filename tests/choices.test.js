import test from "node:test";
import assert from "node:assert/strict";
import { seededRng } from "./helpers.js";
import { generate } from "../js/math/problems.js";
import { choicesFor } from "../js/math/choices.js";

test("choices: 3 distinct non-negative numbers including the answer", () => {
  for (let lv = 1; lv <= 7; lv++) {
    const r = seededRng(lv);
    for (let i = 0; i < 500; i++) {
      const p = generate(lv, r);
      const c = choicesFor(p, r);
      assert.equal(c.length, 3);
      assert.equal(new Set(c).size, 3, p.key);
      assert.ok(c.includes(p.answer), p.key);
      assert.ok(c.every((n) => Number.isInteger(n) && n >= 0), p.key);
    }
  }
});

test("choices prefer the forgot-to-carry answer when there is a carry", () => {
  const p = { level: 5, op: "+", a: 47, b: 38, answer: 85, layout: "vertical", key: "47+38" };
  assert.ok(choicesFor(p, seededRng(1)).includes(75));
});

test("choices prefer the forgot-to-borrow answer when there is a borrow", () => {
  const p = { level: 6, op: "-", a: 52, b: 27, answer: 25, layout: "vertical", key: "52-27" };
  assert.ok(choicesFor(p, seededRng(1)).includes(35));
});

test("choices never go negative for tiny answers", () => {
  const p = { level: 2, op: "-", a: 1, b: 1, answer: 0, layout: "horizontal", key: "1-1" };
  const c = choicesFor(p, seededRng(3));
  assert.equal(new Set(c).size, 3);
  assert.ok(c.every((n) => n >= 0) && c.includes(0));
});

test("choices stay total for multiplication", () => {
  const p = { level: 8, op: "×", a: 2, b: 1, answer: 2, layout: "horizontal", key: "2×1" };
  const c = choicesFor(p, seededRng(4));
  assert.equal(new Set(c).size, 3);
  assert.ok(c.every((n) => n >= 0));
});
