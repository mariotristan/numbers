import test from "node:test";
import assert from "node:assert/strict";
import { seededRng } from "./helpers.js";
import { LEVELS, getLevel } from "../js/data/levels.js";
import { generate, buildRound, digitsOf, hasCarry, hasBorrow, borrowsAcrossZero } from "../js/math/problems.js";

const N = 1000;
const sample = (lv) => { const r = seededRng(lv); return Array.from({ length: N }, () => generate(lv, r)); };
const countBy = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
const is2 = (n) => n >= 10 && n <= 99;
const is3 = (n) => n >= 100 && n <= 999;

test("level data", () => {
  assert.equal(LEVELS.length, 14);
  assert.deepEqual(LEVELS.filter((l) => l.gradeDone).map((l) => [l.id, l.gradeDone]), [[7, 2], [12, 3], [14, 4]]);
  assert.deepEqual(LEVELS.map((l) => l.answer === "choices"), LEVELS.map((l) => l.id <= 7));
  assert.equal(getLevel(5).name.es, "Sumas llevando");
  for (const l of LEVELS) assert.ok(l.name.en && l.name.es);
});

test("every problem's answer is correct and non-negative", () => {
  for (const lv of LEVELS) for (const p of sample(lv.id)) {
    const want = p.op === "+" ? p.a + p.b : p.op === "-" ? p.a - p.b : p.a * p.b;
    assert.equal(p.answer, want); assert.ok(p.answer >= 0 && p.answer <= 999);
    assert.equal(p.key, `${p.a}${p.op}${p.b}`);
  }
});
test("level 1", () => { for (const p of sample(1)) { assert.ok(p.a >= 1 && p.b >= 1 && p.answer <= 20 && p.op === "+" && p.layout === "horizontal"); } });
test("level 2", () => { for (const p of sample(2)) { assert.ok(p.b >= 1 && p.b <= p.a && p.a <= 20 && p.op === "-" && p.layout === "horizontal"); } });
test("level 3", () => { for (const p of sample(3)) {
  assert.ok(p.a >= 10 && p.a <= 89 && p.b >= 10 && p.b <= 89 && !hasCarry(p.a, p.b) && p.answer <= 99 && p.layout === "vertical"); } });
test("level 4", () => { for (const p of sample(4)) {
  assert.ok(is2(p.a) && is2(p.b) && !hasBorrow(p.a, p.b) && p.answer >= 1 && p.layout === "vertical"); } });
test("level 5", () => { for (const p of sample(5)) {
  assert.ok(is2(p.a) && is2(p.b) && p.a % 10 + p.b % 10 >= 10 && p.answer <= 99 && p.layout === "vertical"); } });
test("level 6", () => { for (const p of sample(6)) {
  assert.ok(is2(p.a) && is2(p.b) && p.a % 10 < p.b % 10 && p.answer >= 1 && p.layout === "vertical"); } });
test("level 7", () => {
  const ps = sample(7);
  for (const p of ps) {
    assert.ok(is3(p.a) && is3(p.b) && p.answer >= 100 && p.answer <= 999 && p.layout === "vertical");
    assert.ok(p.op === "+" ? !hasCarry(p.a, p.b) : !hasBorrow(p.a, p.b));
  }
  const adds = ps.filter((p) => p.op === "+").length / N;
  assert.ok(adds >= 0.4 && adds <= 0.6);
});
test("levels 8/11/12", () => {
  for (const [lv, set] of [[8, [2, 5, 10]], [11, [3, 4, 6]], [12, [7, 8, 9]]]) {
    const ps = sample(lv);
    for (const p of ps) {
      assert.equal(p.op, "×"); assert.equal(p.layout, "horizontal");
      assert.ok((set.includes(p.a) && p.b >= 1 && p.b <= 10) || (set.includes(p.b) && p.a >= 1 && p.a <= 10));
    }
    assert.ok(ps.some((p) => set.includes(p.a) && !set.includes(p.b)));
    assert.ok(ps.some((p) => set.includes(p.b) && !set.includes(p.a)));
  }
});
test("level 9", () => { for (const p of sample(9)) {
  assert.ok(is3(p.a) && (is2(p.b) || is3(p.b)) && hasCarry(p.a, p.b) && p.answer <= 999 && p.layout === "vertical"); } });
test("level 10", () => {
  const ps = sample(10);
  for (const p of ps) assert.ok(is3(p.a) && (is2(p.b) || is3(p.b)) && p.answer >= 1 && hasBorrow(p.a, p.b) && p.layout === "vertical");
  const z = ps.filter((p) => borrowsAcrossZero(p.a, p.b)).length / N;
  assert.ok(z >= 0.2 && z <= 0.4, `across-zero share ${z}`);
});
test("level 13", () => { for (const p of sample(13)) {
  assert.ok(p.a >= 11 && p.a <= 99 && p.b >= 2 && p.b <= 9 && p.answer <= 999 && p.op === "×" && p.layout === "vertical"); } });
test("level 14 round", () => {
  const round = buildRound(14, seededRng(1));
  assert.equal(round.length, 10);
  assert.deepEqual(countBy(round, (p) => p.level), { 5: 1, 6: 1, 9: 2, 10: 2, 12: 2, 13: 2 });
  assert.equal(new Set(round.map((p) => p.key)).size, 10);
  assert.ok([5, 6, 9, 10, 12, 13].includes(generate(14, seededRng(2)).level));
});
test("digitsOf", () => { assert.deepEqual(digitsOf(407), [4, 0, 7]); assert.deepEqual(digitsOf(5), [5]); });
test("hasCarry / hasBorrow / borrowsAcrossZero on known cases", () => {
  assert.equal(hasCarry(47, 38), true); assert.equal(hasCarry(34, 25), false);
  assert.equal(hasBorrow(52, 27), true); assert.equal(hasBorrow(58, 23), false);
  assert.equal(borrowsAcrossZero(403, 158), true); assert.equal(borrowsAcrossZero(453, 158), false);
});
test("buildRound returns 10 distinct problems and avoids last round when possible", () => {
  const r = seededRng(7); const first = buildRound(5, r);
  const second = buildRound(5, r, first.map((p) => p.key));
  assert.equal(new Set(second.map((p) => p.key)).size, 10);
  assert.ok(second.every((p) => !first.some((q) => q.key === p.key)));
});
function allKeysOfLevel8() {
  const keys = new Set();
  for (const f of [2, 5, 10]) for (let n = 1; n <= 10; n++) { keys.add(`${f}×${n}`); keys.add(`${n}×${f}`); }
  return [...keys];
}
test("buildRound still returns 10 distinct problems when avoid covers most of a small level", () => {
  const all = allKeysOfLevel8();
  const round = buildRound(8, seededRng(3), all.slice(0, all.length - 4));
  assert.equal(round.length, 10); assert.equal(new Set(round.map((p) => p.key)).size, 10);
});
