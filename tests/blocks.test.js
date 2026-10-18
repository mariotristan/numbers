import { test } from "node:test";
import assert from "node:assert/strict";
import { blockCounts, originalTop, placeOf } from "../js/blocks.js";
import { explain } from "../js/math/explain.js";
import { digitsOf } from "../js/math/problems.js";

test("blockCounts", () => {
  assert.deepEqual(blockCounts(403), { hundreds: 4, tens: 0, ones: 3 });
  assert.deepEqual(blockCounts(0), { hundreds: 0, tens: 0, ones: 0 });
  assert.deepEqual(blockCounts(19), { hundreds: 0, tens: 1, ones: 9 });
  assert.deepEqual(blockCounts(999), { hundreds: 9, tens: 9, ones: 9 });
});

test("placeOf names the place value of each column, most-significant first", () => {
  assert.deepEqual([0, 1, 2].map((i) => placeOf(i, 3)), ["hundreds", "tens", "ones"]);
  assert.deepEqual([0, 1].map((i) => placeOf(i, 2)), ["tens", "ones"]);
});

const sub = (a, b) => ({ level: 10, op: "-", a, b, answer: a - b, layout: "vertical", key: `${a}-${b}` });

test("originalTop recovers the struck-out digits in every borrow step", () => {
  for (const [a, b] of [[52, 27], [403, 158], [452, 187], [412, 197], [300, 1], [700, 456], [905, 8], [452, 387], [100, 1]]) {
    const width = Math.max(digitsOf(a).length, digitsOf(b).length);
    const want = [...Array(width - digitsOf(a).length).fill(null), ...digitsOf(a)];
    for (const { visual } of explain(sub(a, b))) {
      if (visual.type !== "column") continue;
      assert.deepEqual(originalTop(visual), want, `${a} - ${b} at focus ${visual.focus}`);
    }
  }
});

test("blocks.js imports without a DOM", async () => {
  const mod = await import("../js/blocks.js");
  for (const name of ["renderBlocks", "renderVisual", "renderProblem"]) assert.equal(typeof mod[name], "function", name);
});
