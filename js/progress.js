// Pure progress state. Every function returns a new state; storage is injected.
import { LEVELS, PASS_SCORE } from "./data/levels.js";
import { CLOSET, STICKERS, BADGES, SLOTS } from "./data/shop.js";
import { starsFor } from "./round.js";

export const VERSION = 1;
export const STORAGE_KEY = "bruno-numbers";
const LANGS = ["en", "es"];
const MAX_SCORE = 10;
const closetItem = (id) => CLOSET.find((i) => i.id === id);
const stickerItem = (id) => STICKERS.find((s) => s.id === id);

export function freshState() {
  return {
    version: VERSION,
    lang: "en",
    settings: { sfx: true, voice: true },
    levels: {},
    coins: 0,
    lifetimeCoins: 0,
    roundsPlayed: 0,
    owned: [],
    worn: { hat: null, glasses: null, neck: null, held: null },
    stickers: [],
    badges: [],
    lastProblems: {},
  };
}

export function addCoins(state, n) {
  const add = Math.max(0, Math.floor(n));
  return { ...state, coins: state.coins + add, lifetimeCoins: state.lifetimeCoins + add };
}

export function recordRound(state, levelId, { score, problemKeys }) {
  const old = state.levels[levelId] ?? { bestScore: 0, bestStars: 0, rounds: 0 };
  const bestScore = Math.max(old.bestScore, score);
  return {
    ...state,
    roundsPlayed: state.roundsPlayed + 1,
    levels: {
      ...state.levels,
      [levelId]: { bestScore, bestStars: starsFor(bestScore), rounds: old.rounds + 1 },
    },
    lastProblems: { ...state.lastProblems, [levelId]: [...problemKeys] },
  };
}

export function isLevelUnlocked(state, id) {
  if (id === 1) return true;
  return (state.levels[id - 1]?.bestScore ?? 0) >= PASS_SCORE;
}

export function currentLevel(state) {
  let best = 1;
  for (const l of LEVELS) if (isLevelUnlocked(state, l.id)) best = l.id;
  return best;
}

export function canBuy(state, id) {
  const item = closetItem(id) ?? stickerItem(id);
  if (!item) return false;
  const have = closetItem(id) ? state.owned : state.stickers;
  return !have.includes(id) && state.coins >= item.price;
}

export function buy(state, id) {
  if (!canBuy(state, id)) return null;
  const item = closetItem(id) ?? stickerItem(id);
  const coins = state.coins - item.price;
  return closetItem(id)
    ? { ...state, coins, owned: [...state.owned, id] }
    : { ...state, coins, stickers: [...state.stickers, id] };
}

export function toggleWear(state, itemId) {
  const item = closetItem(itemId);
  if (!item || !state.owned.includes(itemId)) return state;
  const next = state.worn[item.slot] === itemId ? null : itemId;
  return { ...state, worn: { ...state.worn, [item.slot]: next } };
}

const BADGE_RULES = {
  "first-perfect": (s) => Object.values(s.levels).some((l) => l.bestScore === MAX_SCORE),
  "grade-2": (s) => (s.levels[7]?.bestScore ?? 0) >= PASS_SCORE,
  "grade-3": (s) => (s.levels[12]?.bestScore ?? 0) >= PASS_SCORE,
  "grade-4": (s) => (s.levels[14]?.bestScore ?? 0) >= PASS_SCORE,
  "coins-100": (s) => s.lifetimeCoins >= 100,
  "rounds-10": (s) => s.roundsPlayed >= 10,
};

export function earnedBadges(state) {
  return BADGES.map((b) => b.id).filter((id) => BADGE_RULES[id](state));
}

export function awardBadges(state) {
  const newIds = earnedBadges(state).filter((id) => !state.badges.includes(id));
  if (!newIds.length) return { state, newIds };
  return { state: { ...state, badges: [...state.badges, ...newIds] }, newIds };
}

export function setLanguage(state, lang) {
  if (!LANGS.includes(lang)) return state;
  return { ...state, lang };
}

export function setSetting(state, key, value) {
  return { ...state, settings: { ...state.settings, [key]: Boolean(value) } };
}

export function resetProgress(state) {
  return { ...freshState(), lang: state.lang, settings: { ...state.settings } };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const count = (v) => (Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0);

function knownIds(list, known) {
  if (!Array.isArray(list)) return [];
  return [...new Set(list.filter((id) => typeof id === "string" && known.some((k) => k.id === id)))];
}

function cleanLevels(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const l of LEVELS) {
    const e = raw[l.id];
    if (!isObject(e) || !Number.isInteger(e.bestScore) || e.bestScore < 0 || e.bestScore > MAX_SCORE) continue;
    out[l.id] = { bestScore: e.bestScore, bestStars: starsFor(e.bestScore), rounds: count(e.rounds) };
  }
  return out;
}

function cleanLastProblems(raw) {
  const out = {};
  if (!isObject(raw)) return out;
  for (const l of LEVELS) {
    const keys = raw[l.id];
    if (Array.isArray(keys)) out[l.id] = keys.filter((k) => typeof k === "string").slice(0, 10);
  }
  return out;
}

// Returns a clean state, or null if the shape or version is wrong.
export function validate(raw) {
  if (!isObject(raw) || raw.version !== VERSION || !LANGS.includes(raw.lang)) return null;
  if (!isObject(raw.settings)) return null;
  const owned = knownIds(raw.owned, CLOSET);
  const rawWorn = isObject(raw.worn) ? raw.worn : {};
  const worn = {};
  for (const slot of SLOTS) {
    const id = rawWorn[slot];
    worn[slot] = owned.includes(id) && closetItem(id).slot === slot ? id : null;
  }
  const coins = count(raw.coins);
  return {
    version: VERSION,
    lang: raw.lang,
    settings: { sfx: raw.settings.sfx !== false, voice: raw.settings.voice !== false },
    levels: cleanLevels(raw.levels),
    coins,
    lifetimeCoins: Math.max(coins, count(raw.lifetimeCoins)),
    roundsPlayed: count(raw.roundsPlayed),
    owned,
    worn,
    stickers: knownIds(raw.stickers, STICKERS),
    badges: knownIds(raw.badges, BADGES),
    lastProblems: cleanLastProblems(raw.lastProblems),
  };
}

export function load(storage) {
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (!text) return freshState();
    return validate(JSON.parse(text)) ?? freshState();
  } catch (err) {
    console.warn("Could not load progress; starting fresh.", err);
    return freshState();
  }
}

export function save(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn("Could not save progress.", err);
    return false;
  }
}

export function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => void map.set(key, String(value)),
    removeItem: (key) => void map.delete(key),
  };
}

// localStorage if it works (it can throw in private mode), else in-memory.
export function browserStorage() {
  try {
    const storage = globalThis.localStorage;
    const probe = "__bruno_numbers_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return memoryStorage();
  }
}
