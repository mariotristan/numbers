// Settings for grown-ups: language, sound, Bruno's voice, reset (with a confirm) and credits.
import { h, screen, bruno, backButton, languageToggle, confirmDialog } from "../ui.js";
import { setSetting, resetProgress } from "../progress.js";
import { CREDITS } from "../data/credits.js";
import { icon } from "../icons.js";

export function render(root, ctx) {
  const toggle = (key, label) =>
    h("div", { class: "setting-row" },
      h("span", {}, label),
      h("button", {
        "aria-label": label,
        "data-focus": `setting-${key}`,
        "aria-pressed": String(ctx.state.settings[key]),
        onclick: () => {
          ctx.update((s) => setSetting(s, key, !s.settings[key]));
          ctx.rerender();
        },
      }, ctx.state.settings[key] ? ctx.t("on") : ctx.t("off")));

  const reset = h("button", {
    class: "btn-danger",
    "data-focus": "reset",
    onclick: () => confirmDialog(ctx, view, ctx.t("resetConfirm"), () => {
      ctx.update(resetProgress);
      ctx.navigate("path");
    }),
  }, icon("reset"), ctx.t("resetProgress"));

  const link = (href, text) => h("a", { href, target: "_blank", rel: "noopener" }, text);

  const view = screen(
    h("div", { class: "topbar" }, backButton(ctx, "path")),
    h("h1", { tabindex: "-1" }, icon("settings"), ctx.t("settings")),
    bruno(ctx, ctx.t("settingsHello")),
    h("div", { class: "setting-row" }, h("span", {}, ctx.t("language")), languageToggle(ctx)),
    toggle("sfx", ctx.t("soundEffects")),
    toggle("voice", ctx.t("brunoVoice")),
    h("div", { class: "setting-row" }, h("span", {}, ctx.t("resetProgress")), reset),
    h("div", { class: "credits" },
      h("h2", {}, ctx.t("credits")),
      h("p", {}, ctx.t("creditsIntro")),
      h("ul", {}, CREDITS.map((c) =>
        h("li", {},
          `${ctx.localized(c.use)}: `, link(c.source, c.title), ` — ${c.author} · ${c.license} (`,
          link(c.licenseFile, ctx.t("license")), ")")))),
  );
  view.classList.add("settings-screen");
  root.append(view);
}
