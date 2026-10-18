// Small DOM helpers shared by screens.
import { setLanguage } from "./progress.js";
import { BRUNO_SVG } from "./bruno.js";
import { icon, flag } from "./icons.js";

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") el.className = value;
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

export function screen(...children) {
  return h("section", { class: "screen" }, ...children);
}

// A bundled picture. Falls back to the emoji if the file can't load.
export function art(kind, item, className = "art") {
  const img = h("img", {
    class: className,
    src: `art/${kind}/${item.id}.webp`,
    alt: "",
    width: "256",
    height: "256",
    decoding: "async",
    draggable: "false",
  });
  img.addEventListener(
    "error",
    () => img.replaceWith(h("span", { class: `${className} art-fallback`, "aria-hidden": "true" }, item.emoji)),
    { once: true },
  );
  return img;
}

export function starsRow(n, max = 3) {
  return h("span", { class: "stars-row", "aria-hidden": "true" },
    Array.from({ length: max }, (_, i) => icon(i < n ? "star" : "starEmpty")));
}

// Turns trusted SVG markup (our own drawings) into an element.
export function svgElement(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

// Restart the bubble's little "pop" so kids notice Bruno said something new.
function popBubble(bubble) {
  bubble.classList.remove("pop");
  void bubble.offsetWidth;
  bubble.classList.add("pop");
}

// Animated Bruno with a speech bubble. Tap Bruno to hear the line again.
export function bruno(ctx, text, { speakNow = true } = {}) {
  const bubble = h("p", { class: "bubble pop", "aria-live": "polite" }, text);
  const face = h(
    "button",
    { class: "bruno-face", "aria-label": ctx.t("brunoRepeat"), onclick: () => ctx.audio.speak(bubble.textContent) },
    svgElement(BRUNO_SVG),
  );
  const el = h("div", { class: "bruno" }, face, bubble);
  el.say = (line) => {
    bubble.textContent = line;
    popBubble(bubble);
    return ctx.audio.speak(line);
  };
  if (speakNow && !ctx.quiet) ctx.audio.speak(text);
  return el;
}

export function backButton(ctx, to, params = {}) {
  return h("button", { "aria-label": ctx.t("back"), onclick: () => ctx.navigate(to, params) }, icon("back"));
}

export function languageToggle(ctx, { onChange } = {}) {
  const option = (lang, label) =>
    h(
      "button",
      {
        lang,
        "data-focus": `lang-${lang}`,
        "aria-pressed": String(ctx.lang === lang),
        onclick: () => {
          ctx.update((s) => setLanguage(s, lang));
          ctx.rerender();
          onChange?.();
        },
      },
      flag(lang),
      label,
    );
  return h("div", { class: "row", role: "group", "aria-label": ctx.t("language") },
    option("en", "English"), option("es", "Español"));
}
