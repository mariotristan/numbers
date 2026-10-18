import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState, addCoins, recordRound, isLevelUnlocked, currentLevel, canBuy, buy, toggleWear,
  earnedBadges, awardBadges, validate, load, save, memoryStorage, resetProgress, STORAGE_KEY,
  setLanguage, withBrowserLanguage,
} from "../js/progress.js";

const play = (s, id, score) => recordRound(s, id, { score, problemKeys: ["a"] });

test("level 1 is open; level 2 opens at a best of 7, not 6", () => {
  let s = freshState();
  assert.ok(isLevelUnlocked(s, 1));
  assert.ok(!isLevelUnlocked(s, 2));
  s = play(s, 1, 6);
  assert.ok(!isLevelUnlocked(s, 2));
  assert.equal(currentLevel(s), 1);
  s = play(s, 1, 7);
  assert.ok(isLevelUnlocked(s, 2));
  assert.equal(currentLevel(s), 2);
});

test("recordRound keeps the best score and stars", () => {
  let s = play(freshState(), 1, 9);
  s = play(s, 1, 4);
  assert.deepEqual(s.levels[1], { bestScore: 9, bestStars: 2, rounds: 2 });
  assert.equal(s.roundsPlayed, 2);
  assert.deepEqual(s.lastProblems[1], ["a"]);
  assert.equal(s.coins, 0);
});

test("addCoins raises coins and lifetimeCoins; spending lowers only coins", () => {
  let s = addCoins(freshState(), 20);
  s = buy(s, "pencil");
  assert.equal(s.coins, 5);
  assert.equal(s.lifetimeCoins, 20);
});

test("buy fails without enough coins and when already owned", () => {
  assert.equal(buy(freshState(), "pencil"), null);
  assert.equal(buy(addCoins(freshState(), 100), "nope"), null);
  const s = buy(addCoins(freshState(), 100), "pencil");
  assert.equal(buy(s, "pencil"), null);
  assert.ok(!canBuy(s, "pencil"));
});

test("buying a sticker adds it to stickers, a closet item to owned", () => {
  let s = addCoins(freshState(), 40);
  s = buy(s, "rocket");
  s = buy(s, "cape");
  assert.deepEqual(s.stickers, ["rocket"]);
  assert.deepEqual(s.owned, ["cape"]);
  assert.equal(s.coins, 0);
});

test("toggleWear wears an owned item in its slot, replaces the slot, and removes on second tap; ignores unowned", () => {
  let s = addCoins(freshState(), 100);
  assert.equal(toggleWear(s, "party-hat"), s);
  s = buy(buy(s, "party-hat"), "wizard-hat");
  s = toggleWear(s, "party-hat");
  assert.equal(s.worn.hat, "party-hat");
  s = toggleWear(s, "wizard-hat");
  assert.equal(s.worn.hat, "wizard-hat");
  s = toggleWear(s, "wizard-hat");
  assert.equal(s.worn.hat, null);
});

test("badges: first-perfect, grade-2 at level 7 passed, grade-3 at 12, grade-4 at 14, coins-100 by lifetime, rounds-10", () => {
  assert.deepEqual(earnedBadges(freshState()), []);
  assert.deepEqual(earnedBadges(play(freshState(), 1, 10)), ["first-perfect"]);
  assert.ok(!earnedBadges(play(freshState(), 7, 6)).includes("grade-2"));
  assert.deepEqual(earnedBadges(play(freshState(), 7, 7)), ["grade-2"]);
  assert.deepEqual(earnedBadges(play(freshState(), 12, 8)), ["grade-3"]);
  assert.deepEqual(earnedBadges(play(freshState(), 14, 9)), ["grade-4"]);
  assert.deepEqual(earnedBadges(addCoins(freshState(), 100)), ["coins-100"]);
  let s = freshState();
  for (let i = 0; i < 10; i++) s = play(s, 1, 0);
  assert.deepEqual(earnedBadges(s), ["rounds-10"]);
});

test("awardBadges returns only new ids", () => {
  const a = awardBadges(play(freshState(), 1, 10));
  assert.deepEqual(a.newIds, ["first-perfect"]);
  assert.deepEqual(a.state.badges, ["first-perfect"]);
  const b = awardBadges(a.state);
  assert.deepEqual(b.newIds, []);
  assert.deepEqual(b.state.badges, ["first-perfect"]);
});

test("spending never re-locks a level", () => {
  let s = addCoins(play(freshState(), 1, 8), 50);
  s = buy(s, "rocket");
  assert.ok(isLevelUnlocked(s, 2));
});

test("validate sanitizes: worn-but-unowned -> null, coins -5 -> 0, 2.5 -> 2, unknown sticker ids dropped, bestScore 99 dropped, bad lang -> null state", () => {
  const raw = {
    ...freshState(),
    coins: -5, lifetimeCoins: 2.5,
    owned: ["cape", "cape", "bogus"],
    worn: { hat: "wizard-hat", glasses: null, neck: "cape", held: "cape" },
    stickers: ["rocket", "bogus", "rocket"],
    badges: ["grade-2", "nope"],
    levels: { 1: { bestScore: 8, bestStars: 3, rounds: -2 }, 2: { bestScore: 99 }, 99: { bestScore: 5 } },
    lastProblems: { 1: ["a", 5, "b"], 77: ["x"] },
  };
  const s = validate(raw);
  assert.equal(s.coins, 0);
  assert.equal(s.lifetimeCoins, 2);
  assert.deepEqual(s.owned, ["cape"]);
  assert.deepEqual(s.worn, { hat: null, glasses: null, neck: "cape", held: null });
  assert.deepEqual(s.stickers, ["rocket"]);
  assert.deepEqual(s.badges, ["grade-2"]);
  assert.deepEqual(s.levels, { 1: { bestScore: 8, bestStars: 2, rounds: 0 } });
  assert.deepEqual(s.lastProblems, { 1: ["a", "b"] });
  assert.equal(validate({ ...freshState(), coins: 2.5 }).coins, 2);
  assert.equal(validate({ ...freshState(), lang: "fr" }), null);
  assert.equal(validate({ ...freshState(), version: 0 }), null);
  assert.equal(validate(null), null);
  assert.deepEqual(validate(freshState()), freshState());
});

test("load falls back to fresh state on garbage JSON; save returns false when storage throws", () => {
  const st = memoryStorage();
  st.setItem(STORAGE_KEY, "{not json");
  assert.deepEqual(load(st), freshState());
  const s = addCoins(freshState(), 3);
  assert.ok(save(st, s));
  assert.deepEqual(load(st), s);
  assert.equal(save({ setItem() { throw new Error("full"); } }, s), false);
});

test("resetProgress keeps lang and settings", () => {
  let s = { ...addCoins(freshState(), 9), lang: "es" };
  s = resetProgress(s);
  assert.equal(s.lang, "es");
  assert.equal(s.coins, 0);
});

test("withBrowserLanguage picks es for a Spanish browser only until a language is chosen", () => {
  const fresh = freshState();
  assert.equal(fresh.langChosen, false);
  assert.equal(withBrowserLanguage(fresh, "es-MX").lang, "es");
  assert.equal(withBrowserLanguage(fresh, "en-US").lang, "en");
  assert.equal(withBrowserLanguage(fresh, undefined).lang, "en");
  const chosen = setLanguage(fresh, "en");
  assert.equal(chosen.langChosen, true);
  assert.equal(withBrowserLanguage(chosen, "es-ES").lang, "en");
  assert.equal(setLanguage(fresh, "fr"), fresh);
  // The choice survives a save/load round trip and a reset; a bogus flag is cleaned.
  assert.equal(validate(JSON.parse(JSON.stringify(chosen))).langChosen, true);
  assert.equal(resetProgress(chosen).langChosen, true);
  assert.equal(validate({ ...fresh, langChosen: "yes" }).langChosen, false);
  const old = { ...fresh };
  delete old.langChosen;
  assert.equal(validate(old).langChosen, false);
});
