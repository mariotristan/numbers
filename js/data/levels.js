// The fourteen-level path. Names come from the design spec's level table.
export const ROUND_LENGTH = 10;
export const PASS_SCORE = 7;
export const MAX_BONUS = 3;
export const PERFECT_BONUS = 5;

const L = (id, en, es, answer, gradeDone = null) => ({ id, name: { en, es }, answer, gradeDone });

export const LEVELS = [
  L(1, "Adding within 20", "Sumas hasta 20", "choices"),
  L(2, "Subtracting within 20", "Restas hasta 20", "choices"),
  L(3, "2-digit adding", "Sumas de 2 cifras", "choices"),
  L(4, "2-digit subtracting", "Restas de 2 cifras", "choices"),
  L(5, "Adding with carrying", "Sumas llevando", "choices"),
  L(6, "Subtracting with borrowing", "Restas pidiendo prestado", "choices"),
  L(7, "3-digit add & subtract", "Sumas y restas de 3 cifras", "choices", 2),
  L(8, "Times 2, 5, 10", "Tablas del 2, 5 y 10", "keypad"),
  L(9, "3-digit adding with carrying", "Sumas de 3 cifras llevando", "keypad"),
  L(10, "3-digit subtracting with borrowing", "Restas de 3 cifras pidiendo prestado", "keypad"),
  L(11, "Times 3, 4, 6", "Tablas del 3, 4 y 6", "keypad"),
  L(12, "Times 7, 8, 9", "Tablas del 7, 8 y 9", "keypad", 3),
  L(13, "2-digit × 1-digit", "2 cifras por 1 cifra", "keypad"),
  L(14, "Mixed challenge", "Desafío mezclado", "keypad", 4),
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id);
}
