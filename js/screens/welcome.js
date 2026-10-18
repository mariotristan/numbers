import { h, screen } from "../ui.js";
import { icon } from "../icons.js";

// Placeholder until the welcome screen is built: a way into the path.
export function render(root, ctx) {
  root.append(screen(
    h("h1", { tabindex: "-1" }, ctx.t("appTitle")),
    h("div", { class: "row" },
      h("button", { class: "btn-primary", onclick: () => ctx.navigate("path") }, icon("enter"), ctx.t("enter"))),
  ));
}
