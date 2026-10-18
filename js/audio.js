// All audio is fail-safe: errors are logged and the game keeps going.

let settings = { sfx: true, voice: true };
let audioCtor = null;
let audioContext = null;
let currentUtterance = null;

export function configureAudio(next) {
  settings = { ...settings, ...next };
  if (!settings.voice) cancelSpeech();
}

export function pickVoice(voices, lang) {
  const tagOf = (v) => (v.lang ?? "").toLowerCase().replace("_", "-");
  return (
    (lang === "es" ? voices.find((v) => tagOf(v) === "es-mx") : null) ??
    voices.find((v) => tagOf(v).startsWith(`${lang}-`)) ??
    voices.find((v) => tagOf(v) === lang) ??
    null
  );
}

const WORDS = {
  en: { plus: "plus", minus: "minus", times: "times", equals: "equals" },
  es: { plus: "más", minus: "menos", times: "por", equals: "es igual a" },
};

// Math symbols are read aloud only when they sit between numbers or spaces,
// so "T-Rex" and "2nd-grade" are left alone.
export function speakable(text, lang = "en") {
  const w = WORDS[lang] ?? WORDS.en;
  const between = (sym, word) => (str) => str.replace(new RegExp(`(?<=[\\d\\s])${sym}(?=[\\d\\s])`, "g"), ` ${word} `);
  return [between("\\+", w.plus), between("[−-]", w.minus), between("×", w.times), between("=", w.equals)]
    .reduce((str, fn) => fn(str), text)
    .replace(/\p{Extended_Pictographic}|‍|️/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cancelSpeech() {
  try {
    globalThis.speechSynthesis?.cancel();
  } catch {
    // ignore
  }
}

export function stopAll() {
  cancelSpeech();
}

export function speak(text, lang, { maxMs = 6000 } = {}) {
  const synth = globalThis.speechSynthesis;
  const words = speakable(text ?? "", lang);
  if (!settings.voice || !synth || typeof SpeechSynthesisUtterance === "undefined" || !words) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    let done = false;
    let utterance = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (currentUtterance === utterance) currentUtterance = null;
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, maxMs);
    try {
      synth.cancel();
      utterance = new SpeechSynthesisUtterance(words);
      utterance.lang = lang === "es" ? "es-MX" : "en-US";
      const voice = pickVoice(synth.getVoices(), lang);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.onend = finish;
      utterance.onerror = finish;
      currentUtterance = utterance; // keep a reference so it is not garbage-collected before onend
      synth.speak(utterance);
    } catch (err) {
      console.warn("Speech failed:", err);
      finish();
    }
  });
}

// Synthesized effects: [type, freq, start, duration, peak gain] per tone, or a noise burst.
const TONES = {
  coin: [["square", 1318.5, 0, 0.08, 0.12], ["square", 1760, 0.08, 0.14, 0.12]],
  correct: [["sine", 523.25, 0, 0.25, 0.25], ["sine", 659.25, 0.12, 0.25, 0.25], ["sine", 783.99, 0.24, 0.25, 0.25]],
  oops: [["sine", 392, 0, 0.25, 0.12], ["sine", 330, 0.14, 0.3, 0.12]],
  fanfare: [523.25, 659.25, 783.99, 1046.5, 1318.5].map((f, i) => ["triangle", f, i * 0.11, i === 4 ? 0.5 : 0.22, 0.25]),
};
const NOISE = { snap: [0.04, 3000, 0.3], crack: [0.09, 900, 0.4] }; // [seconds, filter Hz, gain]

function getContext() {
  const Ctor = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext || audioCtor !== Ctor) {
    audioContext = new Ctor();
    audioCtor = Ctor;
  }
  return audioContext;
}

function envelope(ctx, start, duration, peak) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  gain.connect(ctx.destination);
  return gain;
}

export function sfx(kind) {
  if (!settings.sfx) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume()?.catch(() => {});
    const now = ctx.currentTime;
    for (const [type, freq, at, dur, peak] of TONES[kind] ?? []) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(envelope(ctx, now + at, dur, peak));
      osc.start(now + at);
      osc.stop(now + at + dur + 0.05);
    }
    const noise = NOISE[kind];
    if (noise) {
      const [dur, hz, peak] = noise;
      const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = hz;
      src.connect(filter).connect(envelope(ctx, now, dur, peak));
      src.start(now);
    }
  } catch (err) {
    console.warn("Sound effect failed:", err);
  }
}
