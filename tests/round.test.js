import test from "node:test";
import assert from "node:assert/strict";
import { seededRng } from "./helpers.js";
import { startRound, current, answer, advance, nextStep, prevStep, summary, starsFor } from "../js/round.js";

const wrongOf = (p) => p.answer + 1;
function play(r, plan) {
  // plan(problem, mainIndex|null) -> value
  let total = 0;
  while (r.phase !== "done") {
    const res = answer(r, plan(current(r), r.inBonus));
    total += res.coinsDelta;
    r = advance(res.round);
  }
  return { r, total };
}

test("a perfect round scores 10, 3 stars, 10 + 5 coins", () => {
  const { r, total } = play(startRound(1, seededRng(1), []), (p) => p.answer);
  const s = summary(r);
  assert.deepEqual([s.score, s.stars, s.coins, s.perfect, s.problemKeys.length], [10, 3, 15, true, 10]);
  assert.equal(total, 10);
  assert.equal(current(r), null);
});

test("starsFor: 10→3, 9→2, 8→2, 7→1, 6→0, 0→0", () => {
  assert.deepEqual([10, 9, 8, 7, 6, 0].map(starsFor), [3, 2, 2, 1, 0, 0]);
});

test("wrong answer goes to explain, earns nothing, and returns as a bonus at the end", () => {
  let r = startRound(1, seededRng(2), []);
  const first = current(r);
  const res = answer(r, wrongOf(first));
  assert.equal(res.correct, false);
  assert.equal(res.coinsDelta, 0);
  assert.equal(res.round.phase, "explain");
  assert.equal(res.round.awaitingNext, true);
  r = advance(res.round);
  assert.equal(r.awaitingNext, false);
  while (r.index < 10) r = advance(answer(r, current(r).answer).round);
  assert.equal(r.inBonus, true);
  assert.equal(current(r).key, first.key);
});

test("at most 3 bonus problems even with 6 misses", () => {
  let r = startRound(1, seededRng(3), []);
  for (let i = 0; i < 10; i++) r = advance(answer(r, i < 6 ? wrongOf(current(r)) : current(r).answer).round);
  assert.equal(r.bonus.length, 3);
});

test("bonus answers earn a coin but never change score", () => {
  let r = startRound(1, seededRng(4), []);
  for (let i = 0; i < 10; i++) r = advance(answer(r, i < 2 ? wrongOf(current(r)) : current(r).answer).round);
  assert.equal(r.inBonus, true);
  const before = summary(r).score;
  const good = answer(r, current(r).answer);
  assert.equal(good.coinsDelta, 1);
  r = advance(good.round);
  const bad = answer(r, wrongOf(current(r)));
  assert.equal(bad.coinsDelta, 0);
  assert.equal(bad.round.phase, "explain");
  r = advance(bad.round);
  assert.equal(r.phase, "done");
  assert.equal(r.bonus.length, 2);
  assert.equal(summary(r).score, before);
  assert.equal(summary(r).score, 8);
  assert.equal(summary(r).perfect, false);
});

test("answer is ignored while awaiting next (double tap)", () => {
  let r = startRound(1, seededRng(1), []);
  const first = answer(r, current(r).answer);
  const again = answer(first.round, current(first.round).answer);
  assert.equal(again.coinsDelta, 0);
  assert.deepEqual(again.round, first.round);
});

test("null answer (empty pad) is ignored", () => {
  const r = startRound(1, seededRng(1), []);
  const res = answer(r, null);
  assert.equal(res.coinsDelta, 0);
  assert.deepEqual(res.round, r);
  assert.equal(res.round.results.length, 0);
});

test("steps clamp at 0 and reset on each explanation", () => {
  let r = answer(startRound(1, seededRng(5), []), 9999).round;
  assert.equal(prevStep(r).explainStep, 0);
  r = nextStep(nextStep(r));
  assert.equal(r.explainStep, 2);
  r = advance(r);
  r = answer(r, wrongOf(current(r))).round;
  assert.equal(r.explainStep, 0);
});

test("round survives JSON round-trip mid-explanation", () => {
  const plan = (p) => p.answer;
  let r = answer(startRound(2, seededRng(6), []), 99999).round;
  r = nextStep(nextStep(r));
  const copy = JSON.parse(JSON.stringify(r));
  assert.deepEqual(copy, r);
  const a = play(advance(r), plan).r;
  const b = play(advance(copy), plan).r;
  assert.deepEqual(summary(b), summary(a));
  assert.equal(summary(a).score, 9);
});
