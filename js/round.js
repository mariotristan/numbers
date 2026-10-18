// Pure round state machine. State is plain JSON (survives router params / rerender).
import { buildRound } from "./math/problems.js";
import { ROUND_LENGTH, MAX_BONUS, PERFECT_BONUS } from "./data/levels.js";

export function starsFor(score) {
  if (score >= 10) return 3;
  if (score >= 8) return 2;
  if (score >= 7) return 1;
  return 0;
}

export function startRound(levelId, rng, avoidKeys = []) {
  return {
    level: levelId,
    problems: buildRound(levelId, rng, avoidKeys),
    index: 0,
    phase: "question",
    results: [],
    bonus: [],
    bonusIndex: 0,
    inBonus: false,
    coins: 0,
    explainStep: 0,
    awaitingNext: false,
  };
}

export function current(round) {
  if (round.phase === "done") return null;
  return (round.inBonus ? round.bonus[round.bonusIndex] : round.problems[round.index]) || null;
}

export function answer(round, value) {
  const ignored = { round, correct: false, coinsDelta: 0 };
  if (round.awaitingNext || round.phase === "done" || value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return ignored;
  const problem = current(round);
  if (!problem) return ignored;
  const correct = Number(value) === problem.answer;
  const next = { ...round, awaitingNext: true, explainStep: 0 };
  let coinsDelta = 0;
  if (round.inBonus) {
    if (correct) coinsDelta = 1;
  } else {
    next.results = [...round.results, correct];
    if (correct) coinsDelta = 1;
    else if (round.bonus.length < MAX_BONUS) next.bonus = [...round.bonus, problem];
  }
  next.phase = correct ? "feedback" : "explain";
  next.coins = round.coins + coinsDelta;
  return { round: next, correct, coinsDelta };
}

// Only meaningful in the "explain" phase. Clamps at 0; the max step is the caller's concern.
export function nextStep(round) {
  if (round.phase !== "explain") return round;
  return { ...round, explainStep: round.explainStep + 1 };
}

export function prevStep(round) {
  if (round.phase !== "explain") return round;
  return { ...round, explainStep: Math.max(0, round.explainStep - 1) };
}

export function advance(round) {
  if (!round.awaitingNext) return round;
  const next = { ...round, awaitingNext: false, phase: "question", explainStep: 0 };
  if (round.inBonus) {
    next.bonusIndex = round.bonusIndex + 1;
    if (next.bonusIndex >= round.bonus.length) next.phase = "done";
    return next;
  }
  next.index = round.index + 1;
  if (next.index >= ROUND_LENGTH) {
    if (round.bonus.length) {
      next.inBonus = true;
      next.bonusIndex = 0;
    } else next.phase = "done";
  }
  return next;
}

// coins includes PERFECT_BONUS when perfect; the caller awards that bonus once (answer/advance never do).
export function summary(round) {
  const score = round.results.filter(Boolean).length;
  const perfect = round.results.length === ROUND_LENGTH && score === ROUND_LENGTH;
  return {
    score,
    stars: starsFor(score),
    coins: round.coins + (perfect ? PERFECT_BONUS : 0),
    perfect,
    problemKeys: round.problems.map((p) => p.key),
  };
}
