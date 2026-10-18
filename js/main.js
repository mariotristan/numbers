import { t, localized, setLang, getLang } from "./i18n.js";
import { load, save, browserStorage, withBrowserLanguage } from "./progress.js";
import { configureAudio, speak, sfx, stopAll } from "./audio.js";
import { sceneryMarkup, variantForLevel } from "./scenery.js";
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
  const sceneryLayer = document.getElementById("scenery");
  const storage = browserStorage();
  let state = withBrowserLanguage(load(storage), globalThis.navigator?.language);
  let current = { name: "welcome", params: {} };

  const applyState = () => {
    setLang(state.lang);
    configureAudio(state.settings);
    document.documentElement.lang = state.lang;
    document.title = t("appTitle");
  };

  let quietRender = false;
  let sceneVariant = null;

  // Number Town behind every screen: rounds take on their level's time of day.
  // Only swap the drawing when the light changes, so clouds don't jump on every render.
  const showScenery = () => {
    const leveled = current.name === "play" || current.name === "results";
    const next = leveled ? variantForLevel(current.params.level) : "day";
    if (!sceneryLayer || next === sceneVariant) return;
    sceneVariant = next;
    sceneryLayer.innerHTML = sceneryMarkup(next);
  };

  const renderCurrent = ({ quiet = false } = {}) => {
    stopAll();
    const focusKey = document.activeElement?.dataset?.focus;
    showScenery();
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
    audio: {
      speak: (text) => speak(text, getLang()),
      sfx,
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
