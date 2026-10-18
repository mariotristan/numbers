// Shop: Bruno's closet (drawn outfit pieces) and stickers (Fluent art). Tab and Bruno's
// last line live in ctx.params so a language switch or re-render keeps them.
import { h, screen, bruno, backButton, coinPill, art, svgElement, confirmDialog } from "../ui.js";
import { icon } from "../icons.js";
import { brunoSvg } from "../bruno.js";
import { CLOSET, STICKERS } from "../data/shop.js";
import { buy, toggleWear } from "../progress.js";

// Part of Bruno's 120x162 drawing to show on each closet card.
const SLOT_VIEW = { hat: "22 -14 76 82", glasses: "22 -4 76 72", neck: "8 30 104 100", held: "0 -12 120 162" };

export function render(root, ctx) {
  const tab = ctx.params.tab === "stickers" ? "stickers" : "closet";
  const line = ctx.params.line ?? "shopHello";
  const brunoEl = bruno(ctx, ctx.t(line, ctx.params.lineVars));
  if (tab === "closet") brunoEl.classList.add("bruno-mannequin");
  const isCloset = (item) => CLOSET.includes(item);

  // Re-render with Bruno saying `key` out loud (navigate speaks; rerender is quiet).
  const say = (key, vars) => ctx.navigate("shop", { tab, line: key, lineVars: vars });

  const purchase = (item) => {
    const name = ctx.localized(item.name);
    confirmDialog(ctx, view, ctx.t("buyConfirm", { item: name, price: item.price }), () => {
      const bought = buy(ctx.state, item.id);
      if (!bought) return;
      ctx.update(() => (isCloset(item) && bought.worn[item.slot] !== item.id ? toggleWear(bought, item.id) : bought));
      ctx.audio.sfx("coin");
      say(isCloset(item) ? "thanksCloset" : "thanksSticker");
    });
  };

  const action = (item) => {
    const name = ctx.localized(item.name);
    const owned = isCloset(item) ? ctx.state.owned.includes(item.id) : ctx.state.stickers.includes(item.id);
    if (owned && !isCloset(item)) {
      return h("span", { class: "owned-label" }, icon("check"), ctx.t("inBook"));
    }
    if (owned) {
      const worn = ctx.state.worn[item.slot] === item.id;
      return h("button", {
        class: "wear-btn",
        "data-focus": `item-${item.id}`,
        "aria-pressed": String(worn),
        "aria-label": ctx.t("wearItem", { item: name }),
        onclick: () => {
          ctx.update((s) => toggleWear(s, item.id));
          ctx.rerender();
        },
      }, worn ? ctx.t("remove") : ctx.t("wear"));
    }
    const short = item.price - ctx.state.coins;
    if (short > 0) {
      return h("button", {
        class: "buy-btn",
        "aria-disabled": "true",
        "data-focus": `item-${item.id}`,
        onclick: () => brunoEl.say(ctx.t("needCoins", { n: short })),
      }, icon("coin"), ctx.t("moreCoins", { n: short }));
    }
    return h("button", {
      class: "buy-btn",
      "data-focus": `item-${item.id}`,
      "aria-label": ctx.t("buyFor", { item: name, price: item.price }),
      onclick: () => purchase(item),
    }, icon("coin"), String(item.price));
  };

  // A closet item is shown on a small Bruno wearing just that piece, zoomed in on its slot.
  const picture = (item) => {
    if (!isCloset(item)) return art("stickers", item);
    const svg = svgElement(brunoSvg({ [item.slot]: item.id }));
    svg.setAttribute("viewBox", SLOT_VIEW[item.slot]);
    return h("span", { class: "art closet-art", "aria-hidden": "true" }, svg);
  };

  const card = (item) => h("li", {
    class: `shop-card${isCloset(item) && ctx.state.worn[item.slot] === item.id ? " worn" : ""}`,
  }, picture(item), h("span", { class: "label" }, ctx.localized(item.name)), action(item));

  const tabButton = (id, iconName, label) => h("button", {
    "data-focus": `tab-${id}`,
    "aria-pressed": String(tab === id),
    onclick: () => {
      ctx.params.tab = id;
      ctx.rerender();
    },
  }, icon(iconName), label);

  const view = screen(
    h("div", { class: "topbar" }, backButton(ctx, "path"), coinPill(ctx)),
    h("h1", { tabindex: "-1" }, icon("shop"), ctx.t("shop")),
    h("div", { class: "row tabs", role: "group", "aria-label": ctx.t("shop") },
      tabButton("closet", "shop", ctx.t("closet")),
      tabButton("stickers", "stickers", ctx.t("stickersTab"))),
    h("div", { class: `shop-body shop-${tab}` },
      brunoEl,
      h("ul", { class: "grid shop-grid" }, (tab === "closet" ? CLOSET : STICKERS).map(card))),
  );
  view.classList.add("shop-screen");
  root.append(view);
}
