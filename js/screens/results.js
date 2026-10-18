// Results: score, stars, coins, new badges and what opened up. The round was already
// recorded by the play screen; this screen only shows it.
import { h, screen, bruno, art, starsRow, coinPill } from "../ui.js";
import { icon } from "../icons.js";
import { LEVELS, ROUND_LENGTH, PERFECT_BONUS } from "../data/levels.js";
import { BADGES } from "../data/shop.js";
import { isLevelUnlocked } from "../progress.js";

export function render(root, ctx) {
  const { level, summary, newBadges = [], unlockedNext = null, gradeDone = null } = ctx.params;
  if (!summary) return ctx.navigate("path");
  const nextId = level + 1;
  const canGoNext = nextId <= LEVELS.length && isLevelUnlocked(ctx.state, nextId);
  const badges = newBadges.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);

  const view = screen(
    h("div", { class: "topbar" }, h("span", { class: "pill" }, ctx.t("levelTitle", { n: level })), coinPill(ctx)),
    h("h1", { tabindex: "-1" }, ctx.t("scoreOutOf", { score: summary.score, total: ROUND_LENGTH })),
    h("div", { class: "result-stars" },
      starsRow(summary.stars),
      h("span", { class: "sr-only" }, ctx.t("starsLabel", { n: summary.stars }))),
    bruno(ctx, ctx.t(`result${summary.stars}`)),
    h("p", { class: "pill earned" }, icon("coin"), ctx.t("coinsEarned", { n: summary.coins })),
    summary.perfect ? h("p", { class: "banner" }, icon("celebrate"), ctx.t("perfectBonus", { n: PERFECT_BONUS })) : null,
    gradeDone ? h("p", { class: "banner" }, icon("celebrate"), ctx.t(`gradeDone${gradeDone}`)) : null,
    unlockedNext ? h("p", { class: "banner" }, icon("unlock"), ctx.t("levelOpen", { n: unlockedNext })) : null,
    badges.length
      ? h("div", { class: "new-badges" },
        h("h2", {}, ctx.t("newBadge")),
        h("div", { class: "row" }, badges.map((b) =>
          h("div", { class: "badge-card" }, art("badges", b), h("span", {}, ctx.localized(b.name))))))
      : null,
    h("div", { class: "row result-buttons" },
      h("button", { "data-focus": "again", onclick: () => ctx.navigate("play", { level }) },
        icon("playAgain"), ctx.t("playAgain")),
      canGoNext
        ? h("button", { class: "btn-primary", "data-focus": "next", onclick: () => ctx.navigate("play", { level: nextId }) },
          ctx.t("nextLevel"), icon("next"))
        : null,
      h("button", { "data-focus": "path", onclick: () => ctx.navigate("path") }, icon("path"), ctx.t("toPath"))),
  );
  view.classList.add("results-screen");
  root.append(view);
  if (summary.perfect && !ctx.quiet) ctx.audio.sfx("fanfare");
}
