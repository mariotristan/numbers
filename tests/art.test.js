import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { STICKERS, BADGES } from "../js/data/shop.js";

const MAX_BYTES = 30 * 1024;

function assertWebp(path) {
  assert.ok(existsSync(path), `missing ${path}`);
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `${path} is not RIFF`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `${path} is not WebP`);
  assert.ok(statSync(path).size < MAX_BYTES, `${path} is over 30 KB`);
}

test("every sticker has a WebP picture under 30 KB", () => {
  for (const s of STICKERS) assertWebp(`art/stickers/${s.id}.webp`);
});

test("every badge has a WebP picture under 30 KB", () => {
  for (const b of BADGES) assertWebp(`art/badges/${b.id}.webp`);
});

test("stickers and badges use different Fluent art", () => {
  const stickerArt = new Set(STICKERS.map((s) => s.fluent));
  for (const b of BADGES) assert.ok(!stickerArt.has(b.fluent), `${b.id} reuses sticker art ${b.fluent}`);
  assert.equal(new Set([...STICKERS, ...BADGES].map((i) => i.fluent)).size, STICKERS.length + BADGES.length);
});

test("the art licenses are included", () => {
  const fluent = readFileSync("art/LICENSE-fluentui-emoji.txt", "utf8");
  assert.match(fluent, /MIT License/);
  assert.match(fluent, /Microsoft/);
  assert.match(readFileSync("art/LICENSE-phosphor-icons.txt", "utf8"), /MIT/);
});
