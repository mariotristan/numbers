import { h, screen } from "../ui.js";

export function render(root, ctx) {
  root.append(screen(h("h1", { tabindex: "-1" }, ctx.t("appTitle"))));
}
