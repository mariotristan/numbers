// Home: the winding path of fourteen levels, with coins, Shop and Sticker Book on top.
import { h, screen, bruno, backButton, coinPill, starsRow } from "../ui.js";
import { icon } from "../icons.js";
import { LEVELS, PASS_SCORE } from "../data/levels.js";
import { isLevelUnlocked, currentLevel } from "../progress.js";

// Horizontal offsets that make the path wind left and right.
const WIND = ["mid", "right", "mid", "left"];

export function render(root, ctx) {
  const here = currentLevel(ctx.state);
  const brunoEl = bruno(ctx, ctx.t("pathHello"));
  let currentNode = null;

  const node = (level, i) => {
    const open = isLevelUnlocked(ctx.state, level.id);
    const stars = ctx.state.levels[level.id]?.bestStars ?? 0;
    const name = ctx.localized(level.name);
    const btn = h("button", {
      class: `level-node${open ? "" : " locked"}${level.id === here ? " current" : ""}`,
      "data-focus": `level-${level.id}`,
      "aria-label": open
        ? ctx.t("nodeLabel", { n: level.id, name, stars })
        : ctx.t("nodeLocked", { n: level.id, name }),
      onclick: () => {
        if (open) ctx.navigate("play", { level: level.id });
        else brunoEl.say(ctx.t("lockedLevel", { n: level.id - 1 }));
      },
    },
    h("span", { class: "node-num" }, level.id),
    open ? starsRow(stars) : icon("lock"));
    if (level.id === here) currentNode = btn;
    return h("li", { class: `path-step wind-${WIND[i % WIND.length]}` },
      btn,
      h("span", { class: "node-name", "aria-hidden": "true" }, name));
  };

  const steps = [];
  LEVELS.forEach((level, i) => {
    steps.push(node(level, i));
    if (level.gradeDone) {
      const done = (ctx.state.levels[level.id]?.bestScore ?? 0) >= PASS_SCORE;
      steps.push(h("li", { class: `grade-banner${done ? " done" : ""}` },
        icon(done ? "celebrate" : "star"), ctx.t(`gradeDone${level.gradeDone}`)));
    }
  });

  const view = screen(
    h("div", { class: "topbar" },
      backButton(ctx, "welcome"),
      coinPill(ctx),
      h("div", { class: "row" },
        h("button", { "data-focus": "shop", onclick: () => ctx.navigate("shop") }, icon("shop"), ctx.t("shop")),
        h("button", { "data-focus": "stickers", onclick: () => ctx.navigate("stickers") }, icon("stickers"), ctx.t("stickerBook")),
        h("button", { "aria-label": ctx.t("settings"), "data-focus": "settings", onclick: () => ctx.navigate("settings") }, icon("settings")))),
    h("h1", { tabindex: "-1" }, ctx.t("appTitle")),
    brunoEl,
    h("ol", { class: "level-path" }, steps),
  );
  view.classList.add("path-screen");
  root.append(view);

  // After the router focuses the title, bring the current level into view.
  requestAnimationFrame(() => {
    if (!view.isConnected || !currentNode) return;
    currentNode.scrollIntoView({ block: "center" });
  });
}
