// Place-value blocks and the explanation visuals. Pure helpers (blockCounts, placeOf,
// originalTop) run anywhere; the render* functions build DOM and only run in the browser.
// Ones are green cubes (.cube.ones), tens blue sticks of 10 (.stick.tens), hundreds red
// 10x10 flats (.flat.hundreds). Trades between places animate with .snap and .crack,
// cubes leaving or arriving use .hop. Styles live in css/style.css.
import { h } from "./ui.js";
import { digitsOf } from "./math/problems.js";

const PLACES = ["ones", "tens", "hundreds"];
const SHOWN_OP = { "+": "+", "-": "−", "×": "×" };
const PIECE = { ones: "cube", tens: "stick", hundreds: "flat" };

export function blockCounts(n) {
  return { hundreds: Math.floor(n / 100), tens: Math.floor(n / 10) % 10, ones: n % 10 };
}

// Place value of column i in a most-significant-first row `width` columns wide.
export function placeOf(i, width) {
  return PLACES[width - 1 - i];
}

// The top digits before any borrowing, for drawing the struck-out originals. A crossed
// column received a ten exactly when its current value is 9 or more (a borrow adds 10 to
// a digit 0-9, and lending afterwards takes at most 1); a column lent one exactly when
// the column to its right received.
export function originalTop({ top, crossed }) {
  const received = top.map((t, i) => crossed[i] && t != null && t >= 9);
  return top.map((t, i) =>
    t == null || !crossed[i] ? t : t - (received[i] ? 10 : 0) + (received[i + 1] ? 1 : 0));
}

// The trade sound for explanation step i: "snap" or "crack" on the step whose visual starts
// a trade, else null. The make-ten snap stays on screen for the next step; it sounds once.
export function tradeSound(steps, i) {
  const kind = (v) => {
    if (v?.type === "column") return v.action ?? null;
    if (v?.type === "cubes") return v.snapTen ? "snap" : null;
    if (v?.type === "takeAway") return v.breakTen && v.remove === 0 ? "crack" : null;
    return null;
  };
  const now = kind(steps[i]?.visual);
  if (!now || (steps[i].visual.type === "cubes" && kind(steps[i - 1]?.visual) === now)) return null;
  return now;
}

// ---- DOM ----

const piece = (place, extra = "", i = null) =>
  h("span", { class: `${PIECE[place]} ${place}${extra}`, style: i == null ? null : `--i: ${i}` });

const pieces = (place, count, extra = "") =>
  Array.from({ length: count }, () => piece(place, extra));

const group = (place, children) =>
  children.length ? h("span", { class: `block-group ${place}-group` }, children) : null;

// A number with each digit colored by its place value.
function numberEl(n) {
  const digits = digitsOf(n);
  return h("span", { class: "num" },
    digits.map((d, i) => h("span", { class: `digit ${placeOf(i, digits.length)}` }, d)));
}

export function renderBlocks(n, extraClass = "") {
  const c = blockCounts(n);
  return h("div", { class: `blocks${extraClass ? ` ${extraClass}` : ""}`, "aria-hidden": "true" },
    group("hundreds", pieces("hundreds", c.hundreds)),
    group("tens", pieces("tens", c.tens)),
    group("ones", pieces("ones", c.ones)));
}

// Ten pieces of `place` snap into one piece of the next place, or one cracks into ten.
// With reduced motion only the final state is drawn.
function trade(kind, place, reducedMotion) {
  const big = PLACES[PLACES.indexOf(place) + 1];
  if (!big) return null;
  const ten = h("span", { class: `pieces ${place}-pieces` }, pieces(place, 10));
  const one = h("span", { class: "pieces" }, piece(big));
  const [from, to] = kind === "snap" ? [ten, one] : [one, ten];
  if (reducedMotion) return h("span", { class: "trade static" }, h("span", { class: "trade-to" }, to));
  return h("span", { class: `trade ${kind}` },
    h("span", { class: "trade-from" }, from), h("span", { class: "trade-to" }, to));
}

// Add within 20: two groups slide together; when the ones reach ten they snap into a stick.
function cubesVisual({ groups: [a, b], snapTen }, { reducedMotion }) {
  if (!snapTen) {
    return [
      renderBlocks(a),
      h("span", { class: "op" }, "+"),
      renderBlocks(b, reducedMotion ? "" : "slide-in"),
    ];
  }
  const tens = Math.floor(a / 10) + Math.floor(b / 10);
  const rest = (a % 10) + (b % 10) - 10;
  return h("div", { class: "blocks", "aria-hidden": "true" },
    group("tens", [...pieces("tens", tens), trade("snap", "ones", reducedMotion)]),
    group("ones", pieces("ones", rest)));
}

// Subtract within 20: a stick may crack into ten cubes first, then cubes hop away.
function takeAwayVisual({ from, remove, breakTen }, { reducedMotion }) {
  let { tens, ones } = blockCounts(from);
  const cracking = breakTen && remove === 0;
  if (breakTen) { tens -= 1; ones += 10; }
  const goneTens = Math.floor(remove / 10);
  const goneOnes = remove % 10;
  const leaving = (place, count, gone) => Array.from({ length: count }, (_, i) => {
    const k = i - (count - gone);
    return k >= 0 ? piece(place, reducedMotion ? " gone" : " gone hop", k) : piece(place);
  });
  return h("div", { class: "blocks", "aria-hidden": "true" },
    group("tens", leaving("tens", tens, goneTens)),
    cracking ? trade("crack", "ones", reducedMotion) : null,
    group("ones", leaving("ones", cracking ? ones - 10 : ones, goneOnes)));
}

function digitCell(d, place, extra = "") {
  return h("span", { class: `cell ${place}${extra}` }, d == null ? "" : d);
}

// The worked column: carry row, top (with cross-outs), operator and bottom, rule, results.
function columnGrid(v) {
  const width = v.top.length;
  const original = originalTop(v);
  const cols = Array.from({ length: width }, (_, i) => i);
  const at = (i) => `${placeOf(i, width)}${v.focus === i ? " focus" : ""}`;
  const firstShown = v.result.findIndex((d, i) => d !== 0 || i === width - 1);
  const cells = [
    h("span", { class: "cell" }),
    cols.map((i) => h("span", { class: `cell carry ${at(i)}` }, v.carry[i] ?? "")),
    h("span", { class: "cell" }),
    cols.map((i) => v.crossed[i]
      ? h("span", { class: `cell digit crossed ${at(i)}` },
        h("span", { class: "new" }, v.top[i]), h("s", { class: "old" }, original[i]))
      : digitCell(v.top[i], `digit ${at(i)}`)),
    h("span", { class: "cell op" }, SHOWN_OP[v.op]),
    cols.map((i) => digitCell(v.bottom[i], `digit ${at(i)}`)),
    h("span", { class: "rule" }),
    h("span", { class: "cell" }),
    cols.map((i) => (v.result[i] === 0 && i < firstShown
      ? h("span", { class: `cell lead ${at(i)}` })
      : h("span", { class: `cell box ${at(i)}` }, v.result[i] ?? ""))),
  ];
  return h("div", { class: "column", style: `--cols: ${width}` }, cells);
}

function columnVisual(v, { reducedMotion }) {
  let action = null;
  if (v.action && v.focus != null) {
    const width = v.top.length;
    const at = v.action === "crack" && !v.crossed[v.focus] ? v.focus - 1 : v.focus;
    action = trade(v.action, placeOf(at, width), reducedMotion);
  }
  return [columnGrid(v), action ? h("div", { class: "blocks", "aria-hidden": "true" }, action) : null];
}

// Times tables: rows of cubes fill in one by one while Bruno skip-counts.
function arrayVisual({ rows, cols, filledRows }, { reducedMotion }) {
  return Array.from({ length: rows }, (_, r) => {
    const filled = r < filledRows;
    const extra = filled ? (r === filledRows - 1 && !reducedMotion ? " hop" : "") : " ghost";
    return h("div", { class: "array-row" },
      Array.from({ length: cols }, (_, c) => piece("ones", extra, c)),
      h("span", { class: "skip-count" }, filled ? (r + 1) * cols : ""));
  });
}

// 2-digit x 1-digit: the tens part (sticks) and the ones part (cubes), each times the factor.
function splitVisual({ tens, ones, factor, partials }) {
  const part = (n, partial, place) => h("div", { class: `split-part ${place}-part` },
    h("div", { class: "split-eq" }, numberEl(n), h("span", { class: "op" }, "×"), numberEl(factor),
      partial == null ? null : [h("span", { class: "op" }, "="), numberEl(partial)]),
    renderBlocks(n, "mini"));
  return [
    part(tens, partials?.[0], "tens"),
    h("span", { class: "op split-plus" }, "+"),
    part(ones, partials?.[1], "ones"),
  ];
}

function answerVisual({ problem, value }) {
  return h("div", { class: "equation" },
    numberEl(problem.a), h("span", { class: "op" }, SHOWN_OP[problem.op]), numberEl(problem.b),
    h("span", { class: "op" }, "="), h("span", { class: "answer-big" }, numberEl(value)));
}

const VISUALS = {
  cubes: cubesVisual,
  takeAway: takeAwayVisual,
  column: columnVisual,
  array: arrayVisual,
  split: splitVisual,
  answer: answerVisual,
};

export function renderVisual(visual, { reducedMotion = false } = {}) {
  const draw = VISUALS[visual?.type];
  return h("div", { class: `visual visual-${visual?.type ?? "none"}`, "aria-hidden": "true" },
    draw ? draw(visual, { reducedMotion }) : null);
}

// The question: "34 + 25 = ?" in a row, or stacked in columns. Digits use place-value colors.
export function renderProblem(problem, { showBlocks = false } = {}) {
  const { a, b, op, answer } = problem;
  const shown = SHOWN_OP[op];
  let body;
  if (problem.layout === "vertical") {
    const width = Math.max(digitsOf(a).length, digitsOf(b).length, digitsOf(answer).length);
    const padded = (n) => [...Array(width - digitsOf(n).length).fill(null), ...digitsOf(n)];
    const row = (n) => padded(n).map((d, i) => digitCell(d, `digit ${placeOf(i, width)}`));
    body = h("div", { class: "column", style: `--cols: ${width}` },
      h("span", { class: "cell" }), row(a),
      h("span", { class: "cell op" }, shown), row(b),
      h("span", { class: "rule" }));
  } else {
    body = h("div", { class: "equation" },
      numberEl(a), h("span", { class: "op" }, shown), numberEl(b),
      h("span", { class: "op" }, "="), h("span", { class: "unknown" }, "?"));
  }
  const blocks = showBlocks && op !== "×"
    ? h("div", { class: "problem-blocks" }, renderBlocks(a, "mini"), h("span", { class: "op" }, shown), renderBlocks(b, "mini"))
    : null;
  return h("div", { class: `problem ${problem.layout === "vertical" ? "vertical" : "horizontal"}` }, body, blocks);
}
