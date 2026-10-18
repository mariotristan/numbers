import { t, localized, setLang, getLang } from "./i18n.js";
import { load, save, browserStorage } from "./progress.js";
import { configureAudio, speak, chime, stopAll } from "./audio.js";
import * as welcome from "./screens/welcome.js";
import * as path from "./screens/path.js";
import * as play from "./screens/play.js";
import * as results from "./screens/results.js";
import * as shop from "./screens/shop.js";
import * as stickers from "./screens/stickers.js";
import * as settings from "./screens/settings.js";

const SCREENS = { welcome, path, play, results, shop, stickers, settings };

export function start() {
  const root = document.getElementById("app");
  const storage = browserStorage();
  let state = load(storage);
  let current = { name: "welcome", params: {} };

  const applyState = () => {
    setLang(state.lang);
    configureAudio(state.settings);
    document.documentElement.lang = state.lang;
    document.title = t("appTitle");
  };

  let quietRender = false;

  const renderCurrent = ({ quiet = false } = {}) => {
    stopAll();
    const focusKey = document.activeElement?.dataset?.focus;
    root.replaceChildren();
    quietRender = quiet;
    try {
      (SCREENS[current.name] ?? path).render(root, ctx);
    } finally {
      quietRender = false;
    }
    const target = focusKey && root.querySelector(`[data-focus="${focusKey}"]`);
    (target ?? root.querySelector("h1"))?.focus();
  };

  const ctx = {
    get state() { return state; },
    get params() { return current.params; },
    get lang() { return getLang(); },
    get quiet() { return quietRender; },
    t,
    localized,
    // Task 7 replaces this sfx shim with real sound effects.
    audio: {
      speak: (text) => speak(text, getLang()),
      sfx: (kind) => chime(kind === "correct" || kind === "coin" || kind === "fanfare" ? "correct" : "wrong"),
      stop: stopAll,
    },
    update(fn) {
      state = fn(state);
      save(storage, state);
      applyState();
    },
    navigate(name, params = {}) {
      current = { name, params };
      renderCurrent();
    },
    rerender: () => renderCurrent({ quiet: true }),
  };

  applyState();
  renderCurrent();
}

// Offline support for the installed app. If it fails, the game still works online.
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch((err) => {
    console.warn("Offline support unavailable:", err);
  });
}

if (typeof document !== "undefined") {
  start();
  registerServiceWorker();
}
