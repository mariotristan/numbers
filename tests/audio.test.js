import { test } from "node:test";
import assert from "node:assert/strict";
import { pickVoice, speakable, sfx, speak, configureAudio, stopAll } from "../js/audio.js";

const KINDS = ["coin", "snap", "crack", "correct", "oops", "fanfare"];

test("pickVoice prefers es-MX, then any es-*", () => {
  const voices = [{ lang: "en-GB", name: "a" }, { lang: "es-ES", name: "e" }, { lang: "es_MX", name: "b" }, { lang: "es", name: "c" }];
  assert.equal(pickVoice(voices, "es").name, "b");
  assert.equal(pickVoice(voices.filter((v) => v.name !== "b"), "es").name, "e");
  assert.equal(pickVoice(voices, "en").name, "a");
  assert.equal(pickVoice([{ lang: "ES", name: "d" }], "es").name, "d");
  assert.equal(pickVoice(voices, "fr"), null);
  assert.equal(pickVoice([], "en"), null);
});

test("speakable strips emoji and squeezes spaces", () => {
  assert.equal(speakable("Almost! Listen again 👂"), "Almost! Listen again");
  assert.equal(speakable("🐻‍❄️ Polar  bear ⭐"), "Polar bear");
});

test("speakable reads math in English", () => assert.equal(speakable("34 + 25 = 59", "en"), "34 plus 25 equals 59"));
test("speakable reads math in Spanish", () => assert.equal(speakable("52 − 27 = 25", "es"), "52 menos 27 es igual a 25"));

test("× and the ASCII - between numbers are read too", () => {
  assert.equal(speakable("7 × 8", "en"), "7 times 8");
  assert.equal(speakable("7 × 8", "es"), "7 por 8");
  assert.equal(speakable("9 - 4", "en"), "9 minus 4");
  assert.equal(speakable("9-4", "es"), "9 menos 4");
  assert.equal(speakable("3 + 4", "es"), "3 más 4");
});

test("hyphenated words are untouched", () => {
  assert.equal(speakable("T-Rex", "en"), "T-Rex");
  assert.equal(speakable("2nd-grade", "en"), "2nd-grade");
  assert.equal(speakable("well-done 5", "en"), "well-done 5");
});

test("speak is a safe no-op without speech synthesis", async () => {
  await speak("Hello", "en");
});

test("sfx never throws: no AudioContext, sound off, or a throwing AudioContext", () => {
  const saved = { a: globalThis.AudioContext, w: globalThis.webkitAudioContext };
  try {
    configureAudio({ sfx: true, voice: true });
    for (const k of KINDS) sfx(k);
    configureAudio({ sfx: false, voice: true });
    for (const k of KINDS) sfx(k);
    configureAudio({ sfx: true, voice: true });
    globalThis.AudioContext = function () {
      throw new Error("boom");
    };
    const warn = console.warn;
    console.warn = () => {};
    try {
      for (const k of KINDS) sfx(k);
      sfx("unknown");
    } finally {
      console.warn = warn;
    }
    stopAll();
  } finally {
    if (saved.a === undefined) delete globalThis.AudioContext; else globalThis.AudioContext = saved.a;
    if (saved.w === undefined) delete globalThis.webkitAudioContext; else globalThis.webkitAudioContext = saved.w;
    configureAudio({ sfx: true, voice: true });
  }
});

test("sfx builds nodes for every kind with a fake AudioContext", () => {
  const saved = globalThis.AudioContext;
  let started = 0;
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect: (n) => n, frequency: param(), gain: param(), start() { started++; }, stop() {} });
  globalThis.AudioContext = function () {
    return {
      state: "running", currentTime: 0, sampleRate: 8000, destination: {},
      createOscillator: node, createGain: node, createBufferSource: node, createBiquadFilter: node,
      createBuffer: (c, n) => ({ getChannelData: () => new Float32Array(n) }),
    };
  };
  try {
    for (const k of KINDS) sfx(k);
    assert.ok(started >= KINDS.length);
  } finally {
    if (saved === undefined) delete globalThis.AudioContext; else globalThis.AudioContext = saved;
  }
});

test("js sources use no regex lookbehind (old Safari throws a SyntaxError)", async () => {
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const root = new URL("../js", import.meta.url).pathname;
  const files = (dir) => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".js") ? [p] : [];
  });
  for (const f of files(root)) assert.doesNotMatch(readFileSync(f, "utf8"), /\(\?<[=!]/, f);
});

test("speakable still reads symbols between numbers, chained and unspaced", () => {
  assert.equal(speakable("34 + 25 = 59"), "34 plus 25 equals 59");
  assert.equal(speakable("1+2+3"), "1 plus 2 plus 3");
  assert.equal(speakable("T-Rex 2nd-grade"), "T-Rex 2nd-grade");
});
