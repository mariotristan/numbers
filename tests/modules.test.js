import { test } from "node:test";
import assert from "node:assert/strict";

const SCREENS = ["welcome", "path", "play", "results", "shop", "stickers", "settings"];

test("every screen module loads and exports render()", async () => {
  for (const name of SCREENS) {
    const mod = await import(`../js/screens/${name}.js`);
    assert.equal(typeof mod.render, "function", name);
  }
});

test("main.js and ui.js load without a DOM", async () => {
  const main = await import("../js/main.js");
  assert.equal(typeof main.start, "function");
  const ui = await import("../js/ui.js");
  for (const name of ["art", "starsRow", "bruno", "svgElement"]) {
    assert.equal(typeof ui[name], "function", name);
  }
});
