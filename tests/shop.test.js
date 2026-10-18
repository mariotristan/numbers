import test from "node:test";
import assert from "node:assert/strict";
import { CLOSET, STICKERS, BADGES, getItem } from "../js/data/shop.js";

test("shop data: 12 closet items, 4 slots, prices 15-60; 24 stickers at 10; ids unique; en/es names", () => {
  assert.equal(CLOSET.length, 12);
  assert.deepEqual([...new Set(CLOSET.map((i) => i.slot))].sort(), ["glasses", "hat", "held", "neck"]);
  for (const i of CLOSET) assert.ok(i.price >= 15 && i.price <= 60);
  assert.equal(STICKERS.length, 24);
  for (const s of STICKERS) { assert.equal(s.price, 10); assert.ok(s.emoji && s.fluent); }
  assert.equal(BADGES.length, 6);
  const all = [...CLOSET, ...STICKERS, ...BADGES];
  assert.equal(new Set(all.map((x) => x.id)).size, all.length);
  for (const x of all) {
    assert.ok(x.name.en && x.name.es);
    if (x.hint) assert.ok(x.hint.en && x.hint.es);
  }
  for (const s of [...STICKERS, ...BADGES]) assert.match(s.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(getItem("cape").slot, "neck");
  assert.equal(getItem("nope"), null);
});
