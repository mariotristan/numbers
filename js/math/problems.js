// Pure problem generators. Every function takes an injected rng() in [0, 1).
import { ROUND_LENGTH } from "../data/levels.js";

export function digitsOf(n) {
  return String(Math.abs(n)).split("").map(Number);
}

// Column digits, least-significant first, padded to the same length.
function columns(a, b) {
  const da = digitsOf(a).reverse();
  const db = digitsOf(b).reverse();
  const n = Math.max(da.length, db.length);
  return Array.from({ length: n }, (_, i) => [da[i] ?? 0, db[i] ?? 0]);
}

export const hasCarry = (a, b) => columns(a, b).some(([x, y]) => x + y >= 10);
// "No borrow" means every top digit >= the digit under it.
export const hasBorrow = (a, b) => columns(a, b).some(([x, y]) => x < y);
// A ones borrow when the top number has a 0 in the tens (403 - 158).
export const borrowsAcrossZero = (a, b) =>
  a >= 100 && digitsOf(a).at(-2) === 0 && digitsOf(a).at(-1) < digitsOf(b).at(-1);

const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

function make(level, op, a, b, layout) {
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  return { level, op, a, b, answer, layout, key: `${a}${op}${b}` };
}

const TABLES = { 8: [2, 5, 10], 11: [3, 4, 6], 12: [7, 8, 9] };

// Each level: draw(rng) -> [op, a, b] (maybe invalid), ok(a, b, op), fallback example.
const SPECS = {
  1: { op: "+", layout: "horizontal", draw: (r) => [int(r, 1, 19), int(r, 1, 19)], ok: (a, b) => a + b <= 20, fallback: [8, 7] },
  2: { op: "-", layout: "horizontal", draw: (r) => [int(r, 1, 20), int(r, 1, 20)], ok: (a, b) => b <= a, fallback: [15, 8] },
  3: {
    op: "+", layout: "vertical", draw: (r) => [int(r, 10, 89), int(r, 10, 89)],
    ok: (a, b) => !hasCarry(a, b) && a + b <= 99, fallback: [34, 25],
  },
  4: {
    op: "-", layout: "vertical", draw: (r) => [int(r, 10, 99), int(r, 10, 99)],
    ok: (a, b) => a > b && !hasBorrow(a, b), fallback: [58, 23],
  },
  5: {
    op: "+", layout: "vertical", draw: (r) => [int(r, 10, 99), int(r, 10, 99)],
    ok: (a, b) => (a % 10) + (b % 10) >= 10 && a + b <= 99, fallback: [47, 38],
  },
  6: {
    op: "-", layout: "vertical", draw: (r) => [int(r, 10, 99), int(r, 10, 99)],
    ok: (a, b) => a > b && (a % 10) < (b % 10), fallback: [52, 27],
  },
  9: {
    op: "+", layout: "vertical",
    draw: (r) => [int(r, 100, 999), r() < 0.5 ? int(r, 10, 99) : int(r, 100, 999)],
    ok: (a, b) => hasCarry(a, b) && a + b <= 999, fallback: [276, 158],
  },
  13: {
    op: "×", layout: "vertical", draw: (r) => [int(r, 11, 99), int(r, 2, 9)],
    ok: (a, b) => a * b <= 999, fallback: [24, 6],
  },
};

function generateLevel7(rng) {
  const op = rng() < 0.5 ? "+" : "-";
  for (let i = 0; i < 1000; i++) {
    const a = int(rng, 100, 999);
    const b = int(rng, 100, 999);
    const ok = op === "+" ? !hasCarry(a, b) && a + b <= 999 : a > b && !hasBorrow(a, b) && a - b >= 100;
    if (ok) return make(7, op, a, b, "vertical");
  }
  return op === "+" ? make(7, "+", 342, 231, "vertical") : make(7, "-", 758, 321, "vertical");
}

function generateTimes(level, rng) {
  const f = pick(rng, TABLES[level]);
  const n = int(rng, 1, 10);
  return rng() < 0.5 ? make(level, "×", f, n, "horizontal") : make(level, "×", n, f, "horizontal");
}

function generateLevel10(rng) {
  const acrossZero = rng() < 0.3;
  for (let i = 0; i < 1000; i++) {
    let a = int(rng, 100, 999);
    if (acrossZero) a = Math.floor(a / 100) * 100 + (a % 10); // tens digit 0
    const b = rng() < 0.5 ? int(rng, 10, 99) : int(rng, 100, 999);
    if (a > b && hasBorrow(a, b) && (!acrossZero || borrowsAcrossZero(a, b))) {
      return make(10, "-", a, b, "vertical");
    }
  }
  return acrossZero ? make(10, "-", 403, 158, "vertical") : make(10, "-", 452, 187, "vertical");
}

const MIXED = [5, 6, 9, 10, 12, 13];
const MIXED_PLAN = [5, 6, 9, 9, 10, 10, 12, 12, 13, 13];

export function generate(levelId, rng) {
  if (levelId === 7) return generateLevel7(rng);
  if (levelId === 10) return generateLevel10(rng);
  if (TABLES[levelId]) return generateTimes(levelId, rng);
  if (levelId === 14) return generate(pick(rng, MIXED), rng);
  const s = SPECS[levelId];
  for (let i = 0; i < 1000; i++) {
    const [a, b] = s.draw(rng);
    if (s.ok(a, b)) return make(levelId, s.op, a, b, s.layout);
  }
  return make(levelId, s.op, s.fallback[0], s.fallback[1], s.layout);
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildRound(levelId, rng, avoidKeys = []) {
  const plan = levelId === 14 ? MIXED_PLAN : Array(ROUND_LENGTH).fill(levelId);
  const used = new Set();
  const avoid = new Set(avoidKeys);
  const round = [];
  for (const src of plan) {
    let failures = 0;
    for (;;) {
      const p = generate(src, rng);
      if (!used.has(p.key) && (failures >= 500 || !avoid.has(p.key))) {
        used.add(p.key);
        round.push(p);
        break;
      }
      failures++;
    }
  }
  return levelId === 14 ? shuffle(round, rng) : round;
}
