// Sticker Book: every sticker and badge. Ones you don't have yet are silhouettes;
// stickers show their price and badges show how to earn them.
import { h, screen, bruno, backButton, coinPill, art } from "../ui.js";
import { icon } from "../icons.js";
import { STICKERS, BADGES } from "../data/shop.js";

export function render(root, ctx) {
  const ownedCount = ctx.state.stickers.length + ctx.state.badges.length;

  const card = (kind, item, owned, extra) => h("li", { class: `sticker${owned ? "" : " unknown"}` },
    art(kind, item),
    h("span", { class: "label" }, ctx.localized(item.name)),
    owned ? null : extra);

  const view = screen(
    h("div", { class: "topbar" },
      backButton(ctx, "path"),
      h("span", { class: "pill" }, ctx.t("stickerCount", { n: ownedCount, total: STICKERS.length + BADGES.length })),
      coinPill(ctx)),
    h("h1", { tabindex: "-1" }, icon("stickers"), ctx.t("stickerBook")),
    bruno(ctx, ctx.t("stickerBookHello")),
    h("h2", {}, ctx.t("badgesHeading")),
    h("ul", { class: "grid sticker-grid" }, BADGES.map((b) =>
      card("badges", b, ctx.state.badges.includes(b.id), h("span", { class: "hint" }, ctx.localized(b.hint))))),
    h("h2", {}, ctx.t("stickersHeading")),
    h("ul", { class: "grid sticker-grid" }, STICKERS.map((s) =>
      card("stickers", s, ctx.state.stickers.includes(s.id),
        h("span", { class: "pill price" }, icon("coin"), h("span", { "aria-hidden": "true" }, s.price),
          h("span", { class: "sr-only" }, ctx.t("coinsLabel", { n: s.price })))))),
    h("div", { class: "row" },
      h("button", { "data-focus": "to-shop", onclick: () => ctx.navigate("shop", { tab: "stickers" }) },
        icon("shop"), ctx.t("shop"))),
  );
  view.classList.add("stickers-screen");
  root.append(view);
}
