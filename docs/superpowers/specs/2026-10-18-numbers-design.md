# Bruno's Numbers — Design

## Intent
Kids in 2nd–4th grade practice math at home after school, and it should feel like a game, not homework. Bruno Tristan, the family mascot, guides them. When they get something wrong, Bruno shows the right answer **in a fun way and explains why**. The point is to learn from the mistake, not just retry. The game covers addition and subtraction up to 3 digits and simple multiplication, and follows a standard US elementary sequence (Common Core style).

Success: a kid opens it after school, plays a few 10-question rounds, keeps moving up an easy-to-hard path, spends coins dressing up Bruno, and understands carrying, borrowing and times tables a bit better each time.

## Goals
- One path of 14 levels from easy to hard. Everyone starts at level 1.
- Rounds of 10 questions.
- Coins earned for correct answers, spent in a shop on Bruno outfit items and stickers.
- Every wrong answer gets a short, animated, step-by-step explanation with place-value blocks.
- English and Spanish, offline, installable, iPad-first.

## Non-goals
- No grade picker, no teacher/parent dashboard, no accounts, no multiplayer, no leaderboards.
- No division, fractions, or numbers beyond 999 (even though 4th-grade standards go further).
- No adaptive difficulty engine. The fixed path is the progression.

## Anti-goals (failure even if it "works")
- Timers or speed pressure.
- A kid getting stuck, or shopping locking them out of progress.
- Explanations that are just "The answer is 85." Every miss must show *why*.
- Feeling like a worksheet. Feeling like a copy of Numberblocks (see Art).

## Family defaults (from the `building-kids-learning-games` skill; all apply)
Plain HTML/CSS/JS ES modules, no build step, no runtime deps. Tests with `node --test` only (`package.json` just for `npm test`). GitHub Pages from `main` `/`, `.nojekyll`, relative paths, served at `https://mariotristan.github.io/numbers/`. English + Spanish switchable and saved; every string in both; Spanish is neutral Latin American and gender-neutral toward the child. Installable PWA with `sw.js` precache, `CACHE = "numbers-v1"`, and an activate step that deletes only caches starting with the `numbers-` prefix. Unique `STORAGE_KEY = "bruno-numbers"`. No ads, analytics, CDNs or web fonts. Real `<button>`s, localized `aria-label`s, ≥64 px targets, works from 360 px up, `prefers-reduced-motion` stops all animation. Phosphor fill icons for buttons, no device emoji in UI (`emoji-guard` test). MIT license, `CREDITS.md` + in-game credits. Commit as `mariotristan`.

Start from `~/.claude/skills/building-kids-learning-games/templates/` and keep the pitfall fixes listed in the skill (SW Range/206 for audio, network-first code, speech utterance reference, `speakable()`, double-tap guard in `answer()`, `view.isConnected` guard on timeouts, storage probe, `validate()`).

**Deliberate change from the family default:** the Zoo's "wrong answer → dim and retry" loop is replaced by "wrong answer → Bruno explains → continue" (the user's call).

## The level path
Fourteen levels, in this order. The **Answer** column is the user's choice C: 3 answer buttons in levels 1–7, a number pad from level 8 on. Ranges are inclusive. "No carry" means no column sums to ≥10. "No borrow" means every top digit is ≥ the digit under it.

| # | Level (en / es) | Problems | Answer | Layout |
|---|---|---|---|---|
| 1 | Adding within 20 / Sumas hasta 20 | a + b, a,b ≥ 1, sum ≤ 20 | choices | horizontal |
| 2 | Subtracting within 20 / Restas hasta 20 | a − b, 1 ≤ b ≤ a ≤ 20 | choices | horizontal |
| 3 | 2-digit adding / Sumas de 2 cifras | 10–89 + 10–89, no carry, sum ≤ 99 | choices | vertical |
| 4 | 2-digit subtracting / Restas de 2 cifras | 2-digit − 2-digit, no borrow, result ≥ 1 | choices | vertical |
| 5 | Adding with carrying / Sumas llevando | 2-digit + 2-digit, ones carry, sum ≤ 99 | choices | vertical |
| 6 | Subtracting with borrowing / Restas pidiendo prestado | 2-digit − 2-digit, ones borrow, result ≥ 1 | choices | vertical |
| 7 | 3-digit add & subtract / Sumas y restas de 3 cifras | 3-digit ± 3-digit, no regrouping, results 100–999 (50/50 add/sub) | choices | vertical |
| 8 | Times 2, 5, 10 / Tablas del 2, 5 y 10 | f × n, f ∈ {2,5,10}, n 1–10, either order | keypad | horizontal |
| 9 | 3-digit adding with carrying / Sumas de 3 cifras llevando | 3-digit + 3-digit (or 2-digit), ≥ 1 carry, sum ≤ 999 | keypad | vertical |
| 10 | 3-digit subtracting with borrowing / Restas de 3 cifras pidiendo prestado | 3-digit − 2/3-digit, ≥ 1 borrow; ~30% have a 0 in the top number's tens (403 − 158) | keypad | vertical |
| 11 | Times 3, 4, 6 / Tablas del 3, 4 y 6 | as level 8 with {3,4,6} | keypad | horizontal |
| 12 | Times 7, 8, 9 / Tablas del 7, 8 y 9 | as level 8 with {7,8,9} | keypad | horizontal |
| 13 | 2-digit × 1-digit / 2 cifras por 1 cifra | 11–99 × 2–9, product ≤ 999 | keypad | vertical |
| 14 | Mixed challenge / Desafío mezclado | 10 problems: 2 each from levels 9, 10, 12, 13 and 1 each from 5, 6 (shuffled) | keypad | per problem |

Grade markers on the path: after level 7 "2nd grade done!", after 12 "3rd grade done!", after 14 "4th grade done!".

Within a round, no problem repeats, and the same problem doesn't appear in back-to-back rounds when avoidable. Generators are pure and take an injected RNG (as `quiz.js` does in the template).

**Answer choices (levels 1–7):** three buttons in random order: the correct answer plus two distinct, non-negative near-misses. Prefer the common-slip answers: the "forgot to carry/borrow" result where it applies, ±10, ±1, then a tens/ones digit swap. A wrong tap shows the explanation right away (no retry on that question).

**Number pad (levels 8–14):** big 0–9 keys, a delete key and a check key. Horizontal problems fill left to right like normal typing. Vertical (column) problems show one answer box under each column. Typing starts in the **ones** box and moves left, the way kids work on paper. Tapping a box selects it to fix a digit. A vertical problem shows as many boxes as the correct answer has digits, so the box count never gives a hint the kid couldn't get from the problem itself (builder may instead use the maximum possible digit count for the level). Check is enabled once there's at least one digit. Leading blank boxes count as empty.

**Blocks under the problem:** levels 1–6 always show place-value blocks under the problem. From level 7 on there's a "Show me" button that shows them. Multiplication shows an array (rows × columns of cubes) in place of place-value blocks.

## Round flow
1. Bruno says the level's intro line, then question 1 appears. The progress dots show 10 questions.
2. **Correct:** a cheer sound, +1 coin (with a coin animation flying to the counter), a short Bruno praise line, then auto-advance after about 1.2 s.
3. **Wrong:** Bruno says an encouraging line ("Almost! Let's figure it out together.") and the **explanation** plays (below). It ends with a "Got it!" button that goes to the next question. No coin.
4. **Second chance:** after question 10, up to 3 missed problems come back once each as "Bonus try" questions (same numbers, choices reshuffled). A correct bonus gives +1 coin. It doesn't change the score. A wrong bonus shows the explanation again, briefly.
5. **Results:** score out of 10, stars, coins earned this round (+5 bonus for 10/10), any new stickers/badges, a Bruno line, and the buttons "Play again", "Next level" (if unlocked) and "Path".

**Score → stars and unlocking:** 10 → 3★, 8–9 → 2★, 7 → 1★, below 7 → 0★. A level unlocks once the previous level has a best score of **7 or more**. The level keeps its best stars. Below 7, Bruno is encouraging ("Let's practice this one again. You're getting closer!"), never negative. Coins are still earned. Spending coins never affects unlocking.

## Explanations (the heart of the game)
Each explanation is a short sequence of **steps**. Each step has one Bruno line (shown in the bubble and spoken) and one visual change. The kid taps "Next" to advance, or steps auto-advance after speech ends (builder's call, but the kid must be able to read at their own pace and replay with a "Again" button). The right answer is always shown big at the end. Steps come from a pure function `explain(problem) → steps[]` so they can be unit-tested.

Color code everywhere (problem, blocks, column digits): **hundreds red, tens blue, ones green**.

| Problem type | Explanation |
|---|---|
| Add within 20 | Two groups of green cubes slide together. If the total is ≥10, "make ten": cubes fill a ten-stick (10 cubes **snap** into a blue stick), then count the rest. "8 needs 2 more to make 10… 10 and 3 more is 13!" |
| Subtract within 20 | Show a cubes; b cubes hop away one by one (or a stick breaks into ones first if needed); count what's left. |
| Column add (levels 3, 5, 7, 9, 13's final sum) | Walk the columns right to left: "Ones first: 7 + 8 = 15." When ≥10: "That's too many ones! 10 of them become 1 ten." 10 green cubes snap into a blue stick, which hops over the tens column as a small red carry digit. Write the digit, move left. |
| Column subtract (4, 6, 7, 10) | Right to left: "Can we take 8 from 2? Not enough ones!" Borrow: one blue stick breaks into 10 green cubes (and a hundred flat into 10 sticks), the top digits update with cross-outs. **Across a zero** (403 − 158): "No tens to borrow! We ask the hundreds first." A flat breaks into 10 sticks, then a stick into 10 cubes. |
| Times tables (8, 11, 12) | An array of n rows × f cubes builds row by row while Bruno skip-counts ("6, 12, 18, 24 — 4 rows of 6 is 24!"). For ×10 and ×5, also mention the pattern ("times 10: just add a zero!"). |
| 2-digit × 1-digit (13) | Break apart: 23 × 4 → (20 × 4) + (3 × 4) → 80 + 12 → 92. The array is split into a tens part (blue sticks) and a ones part (green cubes), then combined with a column add (carry shown if needed). |

Bruno never says "wrong" or "no". Lines like "Almost!", "Good try!" and "Let's see why…" rotate (several per language). With reduced motion, every step shows its final state instantly.

## Coins, shop, stickers
- **Earning:** coins are added the moment they're earned, so a kid who leaves mid-round keeps them (the round itself isn't scored). +1 per correct answer, +1 per correct bonus try, +5 for a perfect 10/10. Store the coin balance and lifetime coins earned.
- **Shop** has two tabs:
  - **Bruno's closet:** about 12 items in 4 slots (hat, glasses, neck, held item), e.g. wizard hat, astronaut helmet, party hat, sunglasses, star glasses, cape, bow tie, scarf, magic wand, pencil, balloon, telescope. Prices 15–60 coins. Bought items are owned forever. Tap an owned item to wear or remove it, one per slot. Bruno wears his outfit on every screen. Items are SVG layers added to `bruno.js` (drawn, not emoji).
  - **Stickers:** about 24 stickers at 10 coins each, using Fluent Emoji 3D art (fun everyday subjects: rocket, dinosaur, pizza, rainbow, etc.).
  - Can't afford it: the button shows how many more coins are needed and Bruno says so kindly. Buying asks a simple "Buy wizard hat for 20 coins?" confirm.
- **Earned badges** (can't be bought, shown in the Sticker Book with silhouettes until earned): First perfect round, 2nd grade done (pass level 7), 3rd grade done (pass 12), 4th grade done (pass 14), 100 coins earned, 10 rounds played. *Builder may add a few more.*
- **Sticker Book** shows all stickers and badges. Unowned items appear as silhouettes; buyable ones show their price.

## Bruno
Reuse the template's SVG Bruno (float, wave, blink, speech bubble that pops, tap to repeat, `speechSynthesis`). His default outfit is a math look in place of the zookeeper outfit: a green cap and a pencil behind his ear. Shop items layer on top or replace the slot's default (a hat replaces the cap).

Speech must read math aloud correctly: `speakable()` turns `+` / `−` / `×` / `=` into "plus / minus / times / equals" and "más / menos / por / es igual a", and still strips emoji.

## Art and visual style
- **Blocks (Numberblocks-inspired, our own design):** chunky, rounded, bright cubes with a slight shade edge. Ones are green cubes (tiny friendly eyes are optional), tens are blue sticks of 10, hundreds are red 10×10 flats. Drawn in CSS/SVG, no image files. **Must not copy Numberblocks:** no characters, no names, no numerals on heads, and not their one-color-per-number scheme (ours is by place value).
- Bright sky-to-cream gradient background, rounded "Trebuchet MS"-style system font (no web fonts), big numbers.
- Home is a **winding level path** (nodes with number, stars, lock). The current level is highlighted, and the coin counter, Shop and Sticker Book buttons are on the same screen. The approved mockup is `.superpowers/brainstorm/26481-1792347220/content/screens.html`. Where the mockup and this doc differ (e.g. the mockup's crown), this doc wins.
- Sticker art: Fluent Emoji 3D WebP (MIT), fetched with the template's `fetch-art.sh`. App icon: Bruno's face with a few blocks.

## Sound
No recordings. Every effect is synthesized in `audio.js` (oscillator + gain, like the template's `chime()`): coin clink, block "snap" (carry), "crack" (borrow), cheer on correct, soft low "boop" on wrong, fanfare on a perfect round. Settings has sound on/off. With no sound files, `sounds.test.js` is dropped and `credits.js` has only art credits.

## Screens
Welcome (first visit + language), Path (home), Play (question + explanation overlay), Results, Shop, Sticker Book, Settings (language, sound, speech on/off, credits, reset progress with confirmation). Adapt from the template's `welcome`, `map`, `quiz`, `results`, `stickers` and `settings` screens. Drop `zone.js`, the explore loop and the sound quizzes.

## Saved progress (localStorage, `bruno-numbers`, versioned + `validate()`)
`{ version, lang, sound, speech, levels: { [n]: { bestScore, bestStars, rounds } }, coins, lifetimeCoins, roundsPlayed, owned: [itemIds], worn: { hat, glasses, neck, held }, stickers: [ids], badges: [ids], lastProblems: { [level]: [keys] } }`

## Tests (`node --test`)
- **Generators:** for every level, about 1,000 seeded problems satisfy that level's constraints (digit counts, carry/borrow present or absent, range limits, no negatives, across-zero share in level 10, level 14 mix). No repeats within a round.
- **Choices:** 3 distinct, non-negative options, including the correct one.
- **Explanations:** `explain()` produces the right carry/borrow digits and final answer for known cases (47+38, 403−158, 7×8, 23×4).
- **Number pad logic:** right-to-left fill for vertical, left-to-right for horizontal.
- **Progress:** stars from score, unlock at ≥7, best kept, coins math, purchase rules (can't overspend, owned forever, one item per slot), badge triggers, `validate()` sanitizing.
- Template tests kept/adapted: i18n completeness (en/es everywhere), pwa (precache == files on disk, prefix-scoped cache delete), emoji-guard, modules, icons, art.

## Left to the builder
Exact Bruno lines and their Spanish versions; animation timings; shop item list and prices within the ranges above; which 24 sticker subjects (all must exist in Fluent Emoji 3D); layout details at each breakpoint; whether explanation steps auto-advance (as long as reading at your own pace and replay both work).

## Verification before done
Per the skill: `npm test` green. Play every level and every explanation type in both languages at iPad landscape, iPad portrait and phone sizes (Playwright screenshots, not a dependency). No console errors. Broken sticker image falls back to emoji. Offline reload works. Reduced motion shows static explanations.

## Publishing
Ask before creating the `mariotristan/numbers` GitHub repo or pushing (skill's Publishing steps, switching gh accounts).
