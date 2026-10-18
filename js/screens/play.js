// Play: one round of ten questions (plus bonus tries), with Bruno's step-by-step explanation
// after a miss. Everything in progress lives in ctx.params ({ level, round, entry, choices,
// showBlocks, cheer, encourage, finished }) so ctx.rerender() (a language switch) restores it.
import { h, screen, bruno, backButton, coinPill, languageToggle } from "../ui.js";
import { icon } from "../icons.js";
import { LEVELS, getLevel, ROUND_LENGTH, PASS_SCORE, PERFECT_BONUS } from "../data/levels.js";
import { startRound, current, answer, nextStep, prevStep, advance, summary } from "../round.js";
import { addCoins, recordRound, awardBadges, isLevelUnlocked } from "../progress.js";
import { choicesFor } from "../math/choices.js";
import { createEntry, press, backspace, select, entryValue, canCheck } from "../math/entry.js";
import { explain, briefly } from "../math/explain.js";
import { renderProblem, renderVisual, placeOf, tradeSound } from "../blocks.js";

const NEXT_DELAY_MS = 1200;
const TAP_GUARD_MS = 350; // a double tap on "Got it!" must not answer the next question
const SHOWN_OP = { "+": "+", "-": "−", "×": "×" };
const CHEERS = ["cheer1", "cheer2", "cheer3", "cheer4"];
const ENCOURAGE = ["encourage1", "encourage2", "encourage3", "encourage4"];
const BOX_LABEL = { ones: "boxOnes", tens: "boxTens", hundreds: "boxHundreds" };
const KEY_ROWS = [[1, 2, 3], [4, 5, 6, 7], [8, 9, 0]];
const pick = (keys) => keys[Math.floor(Math.random() * keys.length)];
const width = (p) => Math.max(...[p.a, p.b, p.answer].map((n) => String(n).length));

// "Show me" for multiplication: an array of cubes, or tens-and-ones parts for 2-digit × 1-digit.
function timesHint(problem) {
  const visual = problem.a >= 10 && problem.layout === "vertical"
    ? { type: "split", tens: problem.a - (problem.a % 10), ones: problem.a % 10, factor: problem.b, partials: null }
    : { type: "array", rows: problem.a, cols: problem.b, filledRows: problem.a };
  return h("div", { class: "times-hint" }, renderVisual(visual, { reducedMotion: true }));
}

export function render(root, ctx) {
  const p = ctx.params;
  const level = getLevel(p.level);
  if (!level || !isLevelUnlocked(ctx.state, level.id) || p.finished) return ctx.navigate("path");
  p.round ??= startRound(level.id, Math.random, ctx.state.lastProblems[level.id] ?? []);
  p.choices ??= {};
  const keypad = level.answer === "keypad";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const view = screen();
  view.classList.add("play-screen");
  root.append(view);
  let shownAt = 0;
  const tooSoon = () => performance.now() - shownAt < TAP_GUARD_MS;

  function finish() {
    if (p.finished) return;
    p.finished = true; // set first: a re-render or double tap can't record the round twice
    const result = summary(p.round);
    const before = ctx.state;
    const nextId = level.id + 1;
    const hasNext = nextId <= LEVELS.length;
    const hadNext = hasNext && isLevelUnlocked(before, nextId);
    const passedBefore = (before.levels[level.id]?.bestScore ?? 0) >= PASS_SCORE;
    ctx.update((s) => recordRound(s, level.id, result));
    if (result.perfect) ctx.update((s) => addCoins(s, PERFECT_BONUS));
    let newBadges = [];
    ctx.update((s) => {
      const awarded = awardBadges(s);
      newBadges = awarded.newIds;
      return awarded.state;
    });
    ctx.navigate("results", {
      level: level.id,
      summary: result,
      newBadges,
      unlockedNext: hasNext && !hadNext && isLevelUnlocked(ctx.state, nextId) ? nextId : null,
      gradeDone: level.gradeDone && !passedBefore && result.score >= PASS_SCORE ? level.gradeDone : null,
    });
  }

  function goNext() {
    p.round = advance(p.round);
    p.entry = null;
    p.cheer = null;
    p.encourage = null;
    show();
  }

  function submit(value) {
    if (p.round.phase !== "question" || tooSoon()) return;
    const result = answer(p.round, value);
    if (result.round === p.round) return; // ignored (blank, or already answered)
    p.round = result.round;
    if (result.correct) {
      ctx.audio.sfx("correct");
      ctx.audio.sfx("coin");
      ctx.update((s) => addCoins(s, result.coinsDelta));
      p.cheer = pick(CHEERS);
      show({ earned: true });
    } else {
      ctx.audio.sfx("oops");
      p.encourage = pick(ENCOURAGE);
      show();
    }
  }

  const progressDots = (round) => {
    const n = Math.min(round.index + 1, ROUND_LENGTH);
    return h("div", { class: "progress" },
      h("span", { class: "sr-only" }, round.inBonus
        ? ctx.t("bonusTryOf", { n: round.bonusIndex + 1, total: round.bonus.length })
        : ctx.t("questionOf", { n, total: ROUND_LENGTH })),
      h("span", { class: "dots", "aria-hidden": "true" },
        Array.from({ length: ROUND_LENGTH }, (_, i) => {
          const done = i < round.results.length ? (round.results[i] ? " ok" : " miss") : "";
          return h("span", { class: `dot${done}${!round.inBonus && i === round.index ? " now" : ""}` });
        })),
      round.inBonus ? h("span", { class: "bonus-label" }, ctx.t("bonusTry")) : null);
  };

  const topbar = (round, earned) => {
    const coins = coinPill(ctx);
    if (earned && !reducedMotion) {
      coins.classList.add("bump");
      coins.append(h("span", { class: "coin-fly", "aria-hidden": "true" }, "+1"));
    }
    return h("div", { class: "topbar" }, backButton(ctx, "path"), progressDots(round), coins);
  };

  const askLine = (round, problem) => {
    const ask = ctx.t("askProblem", { a: problem.a, op: SHOWN_OP[problem.op], b: problem.b });
    if (round.inBonus) return `${ctx.t("bonusIntro")} ${ask}`;
    if (round.index === 0) return `${ctx.t("levelIntro", { n: level.id, name: ctx.localized(level.name) })} ${ask}`;
    return ask;
  };

  function choiceButtons(round, problem) {
    const key = `${round.inBonus ? "bonus:" : ""}${problem.key}`;
    p.choices[key] ??= choicesFor(problem, Math.random);
    const answered = round.phase !== "question";
    return h("div", { class: "choices" }, p.choices[key].map((value, i) =>
      h("button", {
        class: `choice${answered && value === problem.answer ? " correct" : ""}`,
        "data-focus": `choice-${i}`,
        disabled: answered,
        onclick: () => submit(value),
      }, value)));
  }

  // The number pad. Vertical problems get one tappable box under each answer column.
  function numberPad(round, problem, problemEl) {
    p.entry ??= createEntry(problem);
    const answered = round.phase !== "question";
    const cols = width(problem);
    let boxes = [];
    const check = h("button", {
      class: "btn-primary key-check", "data-focus": "key-check",
      onclick: () => { if (canCheck(p.entry)) submit(entryValue(p.entry)); },
    }, icon("check"), ctx.t("check"));
    const unknown = problemEl.querySelector(".unknown");

    const paint = () => {
      const e = p.entry;
      if (e.layout === "vertical") {
        boxes.forEach((box, i) => {
          box.textContent = e.digits[i] ?? "";
          box.classList.toggle("cursor", !answered && i === e.cursor);
        });
      } else if (unknown) {
        const typed = e.digits.filter((d) => d !== null).join("");
        unknown.textContent = typed || "?";
        unknown.classList.toggle("typed", Boolean(typed));
      }
      check.disabled = answered || !canCheck(e);
    };
    const edit = (fn) => {
      if (p.round.phase !== "question" || tooSoon()) return;
      p.entry = fn(p.entry);
      paint();
    };

    if (p.entry.layout === "vertical") {
      const column = problemEl.querySelector(".column");
      const blanks = Array.from({ length: cols - p.entry.boxes + 1 }, () => h("span", { class: "cell" }));
      boxes = Array.from({ length: p.entry.boxes }, (_, i) => {
        const place = placeOf(i, p.entry.boxes);
        return h("button", {
          class: `cell box entry-box ${place}`,
          "data-focus": `box-${i}`,
          "aria-label": ctx.t(BOX_LABEL[place]),
          disabled: answered,
          onclick: () => edit((e) => select(e, i)),
        });
      });
      column.append(...blanks, ...boxes); // the op column, then any columns wider than the answer
    }

    const key = (d) => h("button", {
      class: "key", "data-focus": `key-${d}`, disabled: answered, onclick: () => edit((e) => press(e, d)),
    }, d);
    const pad = h("div", { class: "keypad" },
      KEY_ROWS.map((row) => h("div", { class: "key-row" }, row.map(key))),
      h("div", { class: "key-row" },
        h("button", {
          class: "key", "data-focus": "key-back", "aria-label": ctx.t("deleteDigit"), disabled: answered,
          onclick: () => edit(backspace),
        }, icon("backspace")),
        check));
    paint();
    return pad;
  }

  function questionView(round, problem, { speakNow }) {
    const line = round.phase === "feedback" && p.cheer ? ctx.t(p.cheer) : askLine(round, problem);
    const showBlocks = level.id <= 6 || Boolean(p.showBlocks);
    const problemEl = renderProblem(problem, { showBlocks });
    if (showBlocks && problem.op === "×") problemEl.append(timesHint(problem));
    const showMe = level.id >= 7
      ? h("button", {
        class: "show-me", "data-focus": "show-me", "aria-pressed": String(showBlocks),
        onclick: () => { p.showBlocks = !p.showBlocks; show({ speakNow: false, focusKey: "show-me" }); },
      }, icon("blocks"), ctx.t("showMe"))
      : null;
    return [
      h("h1", { tabindex: "-1", class: "play-title" }, ctx.t("levelTitle", { n: level.id })),
      bruno(ctx, line, { speakNow }),
      h("div", { class: "problem-card" }, problemEl, showMe),
      keypad ? numberPad(round, problem, problemEl) : choiceButtons(round, problem),
    ];
  }

  function explainView(round, problem, { speakNow }) {
    // A missed bonus try shows the explanation again, briefly (spec: bonus tries).
    const steps = round.inBonus ? briefly(explain(problem)) : explain(problem);
    const i = Math.min(Math.max(round.explainStep, 0), steps.length - 1);
    const step = steps[i];
    const last = i === steps.length - 1;
    const said = ctx.t(step.say.key, step.say.vars);
    const line = i === 0 && p.encourage ? `${ctx.t(p.encourage)} ${said}` : said;
    const sound = tradeSound(steps, i);
    if (sound && speakNow && !ctx.quiet) ctx.audio.sfx(sound);
    const setStep = (fn) => { p.round = fn(p.round); show(); };
    return h("div", { class: "explain-card", role: "region", "aria-labelledby": "explain-title" },
      h("h1", { id: "explain-title", tabindex: "-1" }, ctx.t("explainTitle")),
      h("p", { class: "step-count" }, ctx.t("stepOf", { n: i + 1, total: steps.length })),
      bruno(ctx, line, { speakNow }),
      renderVisual(step.visual, { reducedMotion }),
      h("div", { class: "row explain-buttons" },
        h("button", {
          "data-focus": "ex-back", disabled: i === 0, onclick: () => setStep(prevStep),
        }, icon("back"), ctx.t("back")),
        h("button", {
          "data-focus": "ex-again", onclick: () => show({ focusKey: "ex-again" }),
        }, icon("replay"), ctx.t("again")),
        last
          ? h("button", { class: "btn-primary", "data-focus": "ex-next", onclick: () => goNext() },
            icon("check"), ctx.t("gotIt"))
          : h("button", {
            class: "btn-primary", "data-focus": "ex-next",
            onclick: () => { if (p.round.explainStep < steps.length - 1) setStep(nextStep); },
          }, ctx.t("stepNext"), icon("next"))));
  }

  // Draws the screen for the round's current phase. Correct answers move on by themselves.
  function show({ speakNow = true, focusKey = null, earned = false } = {}) {
    const round = p.round;
    if (round.phase === "done") return finish();
    const problem = current(round);
    const body = round.phase === "explain"
      ? explainView(round, problem, { speakNow })
      : questionView(round, problem, { speakNow });
    view.replaceChildren(
      topbar(round, earned),
      ...[body].flat(),
      h("div", { class: "play-footer" }, languageToggle(ctx)),
    );
    shownAt = performance.now();
    const target = (focusKey && view.querySelector(`[data-focus="${focusKey}"]`))
      ?? (round.phase === "explain" ? view.querySelector('[data-focus="ex-next"]') : view.querySelector("h1"));
    target?.focus();

    if (round.phase === "feedback") {
      const scheduled = round;
      setTimeout(() => {
        if (!view.isConnected || ctx.params.round !== scheduled) return; // left, or already moved on
        goNext();
      }, NEXT_DELAY_MS);
    }
  }

  show();
}
