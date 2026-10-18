// Number-pad entry state. Plain JSON; every function returns a new object.
const HORIZONTAL_BOXES = 3;

// Same width as the problem's columns, so the box count never hints at the answer.
const verticalWidth = (p) => Math.max(...[p.a ?? 0, p.b ?? 0, p.answer].map((n) => String(n).length));

export function createEntry(problem) {
  const vertical = problem.layout === "vertical";
  const boxes = vertical ? verticalWidth(problem) : HORIZONTAL_BOXES;
  return {
    layout: problem.layout,
    boxes,
    digits: Array(boxes).fill(null),
    cursor: vertical ? boxes - 1 : 0,
  };
}

const typedCount = (e) => e.digits.filter((d) => d !== null).length;

export function press(entry, digit) {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return entry;
  const digits = [...entry.digits];
  if (entry.layout === "vertical") {
    digits[entry.cursor] = digit;
    return { ...entry, digits, cursor: Math.max(0, entry.cursor - 1) };
  }
  if (entry.cursor >= entry.boxes) return entry;
  digits[entry.cursor] = digit;
  return { ...entry, digits, cursor: typedCount({ digits }) };
}

export function backspace(entry) {
  const digits = [...entry.digits];
  if (entry.layout === "vertical") {
    // Typed ones-first, so the leftmost digit is the newest; the cursor lands on its box.
    const last = digits.findIndex((d) => d !== null);
    if (last === -1) return entry.cursor === entry.boxes - 1 ? entry : { ...entry, cursor: entry.boxes - 1 };
    digits[last] = null;
    return { ...entry, digits, cursor: last };
  }
  const n = typedCount(entry);
  if (n === 0) return entry;
  digits[n - 1] = null;
  return { ...entry, digits, cursor: n - 1 };
}

export function select(entry, index) {
  if (!Number.isInteger(index) || index < 0 || index >= entry.boxes) return entry;
  // Horizontal boxes fill left to right, so only typed boxes or the next one can be chosen.
  if (entry.layout !== "vertical" && index > typedCount(entry)) return entry;
  return { ...entry, cursor: index };
}

export function entryValue(entry) {
  const typed = entry.digits.filter((d) => d !== null);
  return typed.length === 0 ? null : Number(typed.join(""));
}

// Vertical answers are typed ones-first, so Check waits for the ones box (R4).
export function canCheck(entry) {
  if (entry.layout === "vertical" && entry.digits[entry.boxes - 1] === null) return false;
  return entryValue(entry) !== null;
}
