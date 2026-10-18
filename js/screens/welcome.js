// Welcome: big Bruno, the title, language buttons with flags, and Start.
import { h, screen, bruno, languageToggle } from "../ui.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const brunoEl = bruno(ctx, ctx.t("welcomeHello"));
  brunoEl.classList.add("bruno-hero");
  const view = screen(
    h("h1", { tabindex: "-1" }, ctx.t("appTitle")),
    brunoEl,
    languageToggle(ctx, { onChange: () => ctx.audio.speak(ctx.t("welcomeHello")) }),
    h("div", { class: "row" },
      h("button", { class: "btn-primary start-btn", "data-focus": "start", onclick: () => ctx.navigate("path") },
        icon("enter"), ctx.t("start"))),
  );
  view.classList.add("welcome-screen");
  root.append(view);
}
