// Button icons (Phosphor, MIT) and small drawn flags. Icons take the button's text color.
import { ICONS } from "./icons-data.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export const ICON_NAMES = [
  "back", "stickers", "settings", "sound", "close", "enter", "playAgain", "map",
  "reset", "lock", "unlock", "check", "star", "starEmpty", "celebrate",
  "coin", "shop", "backspace", "blocks", "next", "path", "replay",
];

// Simplified flags drawn for the language buttons (flag emoji show as letters on Windows).
export const FLAGS = {
  en: `<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#b22234"/><g fill="#fff"><rect y="2.86" width="30" height="2.86"/><rect y="8.57" width="30" height="2.86"/><rect y="14.29" width="30" height="2.86"/></g><rect width="13" height="11.43" fill="#3c3b6e"/><g fill="#fff"><circle cx="3" cy="3" r="1"/><circle cx="6.5" cy="3" r="1"/><circle cx="10" cy="3" r="1"/><circle cx="4.75" cy="5.7" r="1"/><circle cx="8.25" cy="5.7" r="1"/><circle cx="3" cy="8.4" r="1"/><circle cx="6.5" cy="8.4" r="1"/><circle cx="10" cy="8.4" r="1"/></g></svg>`,
  // Mexico: green, white, red stripes with a simplified emblem (brown eagle body on a green wreath).
  es: `<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#ffffff"/><rect x="20" width="10" height="20" fill="#ce1126"/><path d="M11.6 11.5a3.4 3.4 0 0 0 6.8 0" fill="none" stroke="#3f8f3f" stroke-width="0.9" stroke-linecap="round"/><ellipse cx="15" cy="9.6" rx="1.9" ry="2.3" fill="#8b5a2b"/><circle cx="15.9" cy="7" r="0.9" fill="#8b5a2b"/><path d="M13 9.2l-1.6-1.4M17 9.2l1.6-1.4" stroke="#8b5a2b" stroke-width="0.8" stroke-linecap="round"/></svg>`,
};

function svgFrom(markup) {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return template.content.firstElementChild;
}

export function icon(name) {
  if (!Object.hasOwn(ICONS, name)) throw new Error(`Unknown icon: ${name}`);
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 256 256");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("class", `icon icon-${name}`);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = ICONS[name];
  return svg;
}

export function flag(lang) {
  const svg = svgFrom(FLAGS[lang]);
  svg.setAttribute("class", "flag");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  return svg;
}
