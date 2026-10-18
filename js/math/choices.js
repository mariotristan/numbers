// Three answer choices: the answer plus two plausible wrong ones. Pure; rng injected.
import { digitsOf, hasCarry, hasBorrow } from "./problems.js";

function columnSlip(a, b, combine) {
  const da = digitsOf(a).reverse();
  const db = digitsOf(b).reverse();
  const n = Math.max(da.length, db.length);
  let out = "";
  for (let i = n - 1; i >= 0; i--) out += combine(da[i] ?? 0, db[i] ?? 0);
  return Number(out);
}

function swapDigits(n) {
  const d = digitsOf(n);
  if (d.length < 2) return n;
  [d[d.length - 1], d[d.length - 2]] = [d[d.length - 2], d[d.length - 1]];
  return Number(d.join(""));
}

function slipAnswer(p) {
  if (p.op === "+" && hasCarry(p.a, p.b)) return columnSlip(p.a, p.b, (x, y) => (x + y) % 10);
  if (p.op === "-" && hasBorrow(p.a, p.b)) return columnSlip(p.a, p.b, (x, y) => Math.abs(x - y));
  return null;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function choicesFor(problem, rng) {
  const { answer } = problem;
  const candidates = [slipAnswer(problem), answer + 10, answer - 10, answer + 1, answer - 1, swapDigits(answer)];
  for (let k = 2; k <= 30; k++) candidates.push(answer + k); // guarantees enough for tiny answers
  const picked = [];
  for (const c of candidates) {
    if (c === null || !Number.isInteger(c) || c < 0 || c === answer || picked.includes(c)) continue;
    picked.push(c);
    if (picked.length === 2) break;
  }
  return shuffle([answer, ...picked], rng);
}
