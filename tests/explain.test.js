import test from "node:test";
import assert from "node:assert/strict";
import { seededRng } from "./helpers.js";
import { STRINGS } from "../js/data/strings.js";
import { LEVELS } from "../js/data/levels.js";
import { generate } from "../js/math/problems.js";
import { explain } from "../js/math/explain.js";

const LAYOUT = { 1: "horizontal", 2: "horizontal", 8: "horizontal", 11: "horizontal", 12: "horizontal" };
const P = (op, a, b, level) => {
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { level, op, a, b, answer, layout: LAYOUT[level] ?? "vertical", key: `${a}${op}${b}` };
};
const deepEq = (x, y) => { try { assert.deepEqual(x, y); return true; } catch { return false; } };
const last = (steps) => steps.at(-1);
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);

// 200 seeded problems per level (level 14 problems carry their source level).
const ALL = LEVELS.flatMap((lv) => {
  const r = seededRng(lv.id * 7 + 1);
  return Array.from({ length: 200 }, () => generate(lv.id, r));
});

test("every explanation ends with the answer step", () => {
  for (const p of ALL) {
    const steps = explain(p);
    assert.equal(last(steps).visual.type, "answer", p.key);
    assert.equal(last(steps).visual.value, p.answer, p.key);
    assert.equal(last(steps).visual.problem, p, p.key);
    assert.equal(steps.filter((s) => s.visual.type === "answer").length, 1, p.key);
  }
});

test("explanations stay short: at most 8 steps", () => {
  for (const p of ALL) assert.ok(explain(p).length <= 8, `${p.key}: ${explain(p).length}`);
});

test("column explanations finish with the answer's digits", () => {
  for (const p of ALL) {
    const cols = explain(p).filter((s) => s.visual.type === "column");
    if (!cols.length) continue;
    const v = cols.at(-1).visual;
    const want = String(p.answer).padStart(v.result.length, "0").split("").map(Number);
    assert.deepEqual(v.result, want, p.key);
    for (const s of cols) {
      const n = s.visual.result.length;
      for (const k of ["top", "bottom", "carry", "crossed"]) assert.equal(s.visual[k].length, n, `${p.key} ${k}`);
    }
  }
});

test("every say.key exists in STRINGS and its placeholders are filled by vars", () => {
  for (const p of ALL) {
    for (const { say } of explain(p)) {
      assert.ok(Object.hasOwn(STRINGS, say.key), say.key);
      for (const name of placeholders(STRINGS[say.key].en)) {
        assert.ok(name in say.vars, `${say.key} needs {${name}} (${p.key})`);
      }
    }
  }
});

test("47 + 38 carries 1 into the tens and gives 85", () => {
  const steps = explain(P("+", 47, 38, 5));
  const cols = steps.filter((s) => s.visual.type === "column");
  assert.ok(cols.some((s) => s.visual.action === "snap" && s.visual.carry[0] === 1));
  assert.deepEqual(cols.at(-1).visual.result, [8, 5]);
  assert.equal(last(steps).visual.value, 85);
});

test("403 − 158 borrows across the zero: top becomes 3,9,13 and result 245", () => {
  const cols = explain(P("-", 403, 158, 10)).filter((s) => s.visual.type === "column");
  assert.ok(cols.some((s) => deepEq(s.visual.top, [3, 10, 3])));
  assert.ok(cols.some((s) => deepEq(s.visual.top, [3, 9, 13])));
  assert.deepEqual(cols.at(-1).visual.result, [2, 4, 5]);
  assert.ok(cols.some((s) => s.say.key === "exBorrowAcrossZero"));
  assert.deepEqual(cols.at(-1).visual.crossed, [true, true, true]);
});

test("452 − 87 pads the missing bottom digit with null", () => {
  const cols = explain(P("-", 452, 87, 10)).filter((s) => s.visual.type === "column");
  assert.deepEqual(cols[0].visual.bottom, [null, 8, 7]);
  assert.deepEqual(cols.at(-1).visual.result, [3, 6, 5]);
});

test("7 × 8 builds 7 rows of 8 and skip-counts to 56", () => {
  const arr = explain(P("×", 7, 8, 12)).filter((s) => s.visual.type === "array");
  assert.equal(arr.at(-1).visual.filledRows, 7);
  assert.equal(arr.at(-1).visual.cols, 8);
  assert.equal(arr.at(-1).visual.rows, 7);
});

test("23 × 4 splits into 80 + 12 = 92", () => {
  const steps = explain(P("×", 23, 4, 13));
  const split = steps.find((s) => s.visual.type === "split" && s.visual.partials);
  assert.deepEqual(split.visual.partials, [80, 12]);
  const cols = steps.filter((s) => s.visual.type === "column");
  assert.deepEqual(cols.at(-1).visual.result, [9, 2]);
  assert.equal(last(steps).visual.value, 92);
});

test("8 + 5 makes ten (snapTen)", () => {
  const steps = explain(P("+", 8, 5, 1));
  assert.ok(steps.some((s) => s.visual.type === "cubes" && s.visual.snapTen && s.say.key === "exMakeTen"));
  const mk = steps.find((s) => s.say.key === "exMakeTen");
  assert.deepEqual(mk.say.vars, { a: 8, need: 2, ten: 10 });
});

test("3 + 4 counts on without a ten", () => {
  const steps = explain(P("+", 3, 4, 1));
  assert.ok(steps.every((s) => s.visual.type !== "cubes" || !s.visual.snapTen));
  assert.ok(steps.some((s) => s.say.key === "exCountOn"));
});

test("13 − 5 breaks a ten", () => {
  const steps = explain(P("-", 13, 5, 2));
  assert.ok(steps.some((s) => s.visual.type === "takeAway" && s.visual.breakTen && s.say.key === "exBreakTen"));
  const take = steps.filter((s) => s.visual.type === "takeAway");
  assert.deepEqual(take.at(-1).visual, { type: "takeAway", from: 13, remove: 5, breakTen: true });
});

test("15 − 3 takes away without breaking a ten", () => {
  const steps = explain(P("-", 15, 3, 2));
  assert.ok(steps.every((s) => s.visual.type !== "takeAway" || !s.visual.breakTen));
});

test("×10 and ×5 problems include the pattern line", () => {
  assert.ok(explain(P("×", 10, 7, 8)).some((s) => s.say.key === "exTimes10"));
  assert.ok(explain(P("×", 3, 10, 8)).some((s) => s.say.key === "exTimes10"));
  assert.ok(explain(P("×", 5, 6, 8)).some((s) => s.say.key === "exTimes5"));
  assert.ok(explain(P("×", 2, 6, 8)).every((s) => !["exTimes10", "exTimes5"].includes(s.say.key)));
});

test("no explanation string says wrong/no/incorrecto", () => {
  const banned = /\b(wrong|no|incorrect|incorrecto|incorrecta|mal|error)\b/iu;
  const keys = Object.keys(STRINGS).filter((k) => /^(ex[A-Z]|encourage)/.test(k));
  assert.ok(keys.length >= 20);
  assert.ok(keys.filter((k) => k.startsWith("encourage")).length >= 3);
  for (const k of keys) for (const lang of ["en", "es"]) {
    assert.ok(!banned.test(STRINGS[k][lang]), `${k}.${lang}: ${STRINGS[k][lang]}`);
  }
});
