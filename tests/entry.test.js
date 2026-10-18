import test from "node:test";
import assert from "node:assert/strict";
import { createEntry, press, backspace, select, entryValue, canCheck } from "../js/math/entry.js";

const V = (answer) => createEntry({ answer, layout: "vertical" });
const H = (answer) => createEntry({ answer, layout: "horizontal" });

test("vertical entry fills ones first, then moves left", () => {
  let e = V(85);
  e = press(e, 5); e = press(e, 8);
  assert.deepEqual(e.digits, [8, 5]);
  assert.equal(entryValue(e), 85);
});

test("vertical: only ones typed reads as that digit", () => {
  assert.equal(entryValue(press(V(85), 5)), 5);
});

test("horizontal entry types left to right", () => {
  let e = H(56);
  e = press(e, 5); e = press(e, 6);
  assert.equal(e.boxes, 3);
  assert.equal(entryValue(e), 56);
});

test("extra digits beyond the boxes are ignored", () => {
  let e = V(85);
  for (const d of [1, 2, 3]) e = press(e, d);
  assert.equal(entryValue(e), 31); // cursor stays at the leftmost box and replaces it
  let h = H(56);
  for (const d of [1, 2, 3, 4]) h = press(h, d);
  assert.equal(entryValue(h), 123);
});

test("backspace on empty entry is a no-op; canCheck false when empty", () => {
  for (const e of [V(85), H(56)]) {
    assert.deepEqual(backspace(e), e);
    assert.equal(canCheck(e), false);
    assert.equal(entryValue(e), null);
  }
});

test("backspace removes the last typed digit", () => {
  let e = press(press(V(85), 5), 8);
  e = backspace(e);
  assert.deepEqual(e.digits, [null, 5]);
  assert.equal(e.cursor, 0);
  let h = press(press(H(56), 5), 6);
  h = backspace(h);
  assert.equal(entryValue(h), 5);
  assert.equal(canCheck(backspace(h)), false);
});

test("select moves the cursor; pressing replaces that digit", () => {
  let e = press(press(V(85), 5), 8);
  e = select(e, 1);
  e = press(e, 9);
  assert.deepEqual(e.digits, [8, 9]);
  assert.equal(entryValue(e), 89);
  assert.deepEqual(select(e, 7), e);
});

test("leading zero reads as a number: horizontal 0,8,5 → 85", () => {
  let e = H(85);
  for (const d of [0, 8, 5]) e = press(e, d);
  assert.equal(entryValue(e), 85);
});

test("vertical leading zero in the leftmost box reads numerically", () => {
  let e = press(press(V(85), 5), 0);
  assert.deepEqual(e.digits, [0, 5]);
  assert.equal(entryValue(e), 5);
});

test("entry survives a JSON round-trip and does not mutate", () => {
  const e = V(85);
  const f = press(e, 5);
  assert.deepEqual(e.digits, [null, null]);
  assert.deepEqual(JSON.parse(JSON.stringify(f)), f);
});

test("vertical: Check needs the ones box; a blank tens box reads as empty", () => {
  let e = select(V(85), 0);
  e = press(e, 8); // tens typed, ones still blank
  assert.deepEqual(e.digits, [8, null]);
  assert.equal(canCheck(e), false);
  const onesOnly = press(V(85), 5);
  assert.deepEqual(onesOnly.digits, [null, 5]);
  assert.equal(canCheck(onesOnly), true);
  assert.equal(entryValue(onesOnly), 5);
});

test("horizontal: Check is enabled after any digit", () => {
  assert.equal(canCheck(press(H(56), 5)), true);
});
