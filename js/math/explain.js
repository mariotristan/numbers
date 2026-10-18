// Pure step-by-step explanations: explain(problem) -> Step[].
// Step = { say: { key, vars }, visual }. The last step is always { type: "answer" }.
// Column visuals: every array is most-significant-first and as wide as the widest of
// a, b and the answer (that is the answer's width, except when a subtraction result has
// fewer digits, e.g. 452 − 387). Missing digits are null so the renderer leaves blanks:
// `bottom` is null left of a shorter operand, `carry` is null where nothing was carried,
// and `result` is null until that column has been written (and stays null for a leading
// zero, e.g. the hundreds of 452 − 387 = 65). `top` holds the current
// (post-borrow) digits; `crossed` marks columns whose top digit borrowing changed.
import { digitsOf } from "./problems.js";

const SHOWN_OP = { "+": "+", "-": "−", "×": "×" };

const step = (key, vars, visual) => ({ say: { key, vars }, visual });

function answerStep(p) {
  return step("exAnswer", { a: p.a, op: SHOWN_OP[p.op], b: p.b, answer: p.answer }, { type: "answer", problem: p, value: p.answer });
}

// Add within 20: two groups of cubes slide together; make ten when the ones overflow.
function cubesSteps(p) {
  const { a, b, answer } = p;
  const cubes = (snapTen) => ({ type: "cubes", groups: [a, b], snapTen });
  const steps = [step("exTwoGroups", { a, b }, cubes(false))];
  if ((a % 10) + (b % 10) >= 10) {
    const need = 10 - (a % 10);
    const ten = a + need;
    steps.push(step("exMakeTen", { a, need, ten }, cubes(true)));
    if (answer > ten) steps.push(step("exTenAndMore", { ten, rest: answer - ten, sum: answer }, cubes(true)));
  } else {
    steps.push(step("exCountOn", { a, b, sum: answer }, cubes(false)));
  }
  return steps;
}

// Subtract within 20: show a cubes, break the ten if the ones run short, b hop away.
function takeAwaySteps(p) {
  const { a, b, answer } = p;
  const breakTen = a >= 10 && a % 10 < b % 10;
  const visual = (remove, brk) => ({ type: "takeAway", from: a, remove, breakTen: brk });
  const steps = [step("exStartWith", { a }, visual(0, false))];
  if (breakTen) steps.push(step("exBreakTen", {}, visual(0, true)));
  steps.push(step("exTakeAway", { b }, visual(b, breakTen)));
  steps.push(step("exLeft", { diff: answer }, visual(b, breakTen)));
  return steps;
}

// Column arithmetic, right to left. Places: 0 = ones, 1 = tens, 2 = hundreds.
const ADD_KEYS = ["exOnesAdd", "exTensAdd", "exHundredsAdd"];
const ADD_CARRY_KEYS = ["exOnesAdd", "exTensAddCarry", "exHundredsAddCarry"];
const CARRY_KEYS = ["exCarry", "exCarryHundred"];
const SUB_KEYS = ["exOnesSub", "exTensSub", "exHundredsSub"];
const NOTHING_LEFT_KEYS = [null, "exNothingLeftTens", "exNothingLeftHundreds"];

function pad(n, width) {
  const d = digitsOf(n);
  return [...Array(width - d.length).fill(null), ...d];
}

function columnSteps(op, a, b, answer) {
  const width = Math.max(digitsOf(a).length, digitsOf(b).length, digitsOf(answer).length);
  const top = pad(a, width);
  const bottom = pad(b, width);
  const carry = Array(width).fill(null);
  const crossed = Array(width).fill(false);
  const result = Array(width).fill(null);
  const leading = width - digitsOf(answer).length; // columns left of the answer's first digit
  const steps = [];
  const snap = (key, vars, focus, action = null) =>
    steps.push(step(key, vars, {
      type: "column", op, top: [...top], bottom: [...bottom], carry: [...carry],
      crossed: [...crossed], result: [...result], focus, action,
    }));

  for (let i = width - 1; i >= 0; i--) {
    const place = width - 1 - i;
    const y = bottom[i];
    if (op === "+") {
      const x = top[i] ?? 0;
      const carried = carry[i] ?? 0;
      const sum = x + (y ?? 0) + carried;
      // A carry writes its digit in the snap step, after Bruno explains it.
      if (sum < 10) result[i] = sum;
      if (y === null && !carried) snap("exBringDown", { x }, i);
      else if (y === null && top[i] === null) snap("exCarryDown", {}, i);
      else if (y === null) snap("exAddCarryOnly", { x, sum }, i);
      else snap(carried ? ADD_CARRY_KEYS[place] : ADD_KEYS[place], { x, y, sum }, i);
      // width includes the answer, so a column that reaches 10 always has one to its left.
      if (sum >= 10) {
        carry[i - 1] = 1;
        result[i] = sum % 10;
        snap(CARRY_KEYS[place], { sum, digit: sum % 10 }, i, "snap");
      }
    } else {
      if (y !== null && top[i] < y) {
        const x = top[i];
        if (top[i - 1] === 0 && i - 2 >= 0) {
          // Across a zero (403 − 158): break a hundred into tens, then a ten into ones.
          top[i - 2] -= 1; top[i - 1] += 10; crossed[i - 2] = crossed[i - 1] = true;
          snap("exBorrowAcrossZero", { x, y }, i, "crack");
          top[i - 1] -= 1; top[i] += 10; crossed[i] = true;
          snap("exBorrowThen", { x: top[i] }, i, "crack");
        } else {
          top[i - 1] -= 1; top[i] += 10; crossed[i - 1] = crossed[i] = true;
          snap(place === 0 ? "exBorrow" : "exBorrowHundred", { x, y, now: top[i] }, i, "crack");
        }
      }
      const x = top[i];
      if (i < leading) {
        snap(NOTHING_LEFT_KEYS[place], {}, i); // a leading zero: the box stays empty
        continue;
      }
      result[i] = x - (y ?? 0);
      if (y === null) snap("exColumnSub", { x }, i);
      else snap(SUB_KEYS[place], { x, y, diff: result[i] }, i);
    }
  }
  return steps;
}

// Times tables: one row per step up to 5 rows, then jump to the full array.
function arraySteps(p) {
  const { a: rows, b: cols, answer } = p;
  const visual = (filledRows) => ({ type: "array", rows, cols, filledRows });
  const steps = [];
  if (rows === 1) {
    steps.push(step("exOneRow", { b: cols }, visual(1)));
  } else {
    steps.push(step("exRows", { a: rows, b: cols }, visual(1)));
    for (let r = 2; r < Math.min(rows, 6); r++) {
      steps.push(step("exSkipCount", { rows: r, count: r * cols }, visual(r)));
    }
    steps.push(step("exRowsTotal", { rows, cols, total: answer }, visual(rows)));
  }
  if (rows === 10 || cols === 10) {
    steps.push(step("exTimes10", { n: rows === 10 ? cols : rows, total: answer }, visual(rows)));
  } else if (rows === 5 || cols === 5) {
    steps.push(step("exTimes5", { total: answer }, visual(rows)));
  }
  return steps;
}

// 2-digit × 1-digit: break apart into tens and ones, multiply each, then column-add.
// A multiple of ten (30 × 4) has nothing to split: 3 tens × 4 = 12 tens = 120.
function splitSteps(p) {
  const { a, b: factor } = p;
  const ones = a % 10;
  const tens = a - ones;
  if (ones === 0) {
    const t = tens / 10;
    const visual = (partials) => ({ type: "split", tens, ones, factor, partials });
    return [
      step("exTensOnly", { a, t }, visual(null)),
      step("exTensTimes", { t, f: factor, n: t * factor, total: p.answer }, visual([p.answer, 0])),
    ];
  }
  const partials = [tens * factor, ones * factor];
  const visual = (withPartials) => ({ type: "split", tens, ones, factor, partials: withPartials ? partials : null });
  return [
    step("exSplit", { a, tens, ones }, visual(false)),
    step("exPartials", { tens, ones, f: factor, p1: partials[0], p2: partials[1] }, visual(true)),
    ...columnSteps("+", partials[0], partials[1], p.answer),
  ];
}

export function explain(problem) {
  const { op, level, a, b, answer } = problem;
  let steps;
  if (op === "+" && level === 1) steps = cubesSteps(problem);
  else if (op === "-" && level === 2) steps = takeAwaySteps(problem);
  else if (op === "×" && level === 13) steps = splitSteps(problem);
  else if (op === "×") steps = arraySteps(problem);
  else steps = columnSteps(op, a, b, answer);
  return [...steps, answerStep(problem)];
}

// A missed bonus try shows the explanation again, briefly: the answer step and the one before it.
export function briefly(steps) {
  return steps.slice(-2);
}
