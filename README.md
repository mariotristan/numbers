# Bruno's Numbers

A free math-practice game for kids, in English and Spanish. Play it at
<https://mariotristan.github.io/numbers/>. It is plain HTML, CSS and JavaScript: no framework,
no build step, no dependencies.

## How to play

Bruno leads you along a path of 14 levels. Each round has 10 questions; get 7 right to pass and
unlock the next level. Early levels offer answer choices, later ones use a number pad. If a
question is tricky, Bruno explains it step by step with place-value blocks
(hundreds are red, tens are blue, ones are green). Coins earned in rounds buy stickers and
outfits for Bruno in the shop. Stars (1 to 3) show how well each round went.

## The 14 levels

1. Adding within 20
2. Subtracting within 20
3. 2-digit adding
4. 2-digit subtracting
5. Adding with carrying
6. Subtracting with borrowing
7. 3-digit add & subtract
8. Times 2, 5, 10
9. 3-digit adding with carrying
10. 3-digit subtracting with borrowing
11. Times 3, 4, 6
12. Times 7, 8, 9
13. 2-digit × 1-digit
14. Mixed challenge

## Install on an iPad or iPhone

Open the game in Safari, tap Share, then Add to Home Screen. After the first visit it works
offline, like an app. (On Android, use the browser's Install app option.)

## Privacy

No accounts, no ads, no tracking, no analytics. Progress, coins and stickers are saved only on
the device (in local storage) and never sent anywhere.

## Run locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. To test the real `/numbers/` path, serve the parent folder
and open <http://localhost:8000/numbers/>.

## Tests

```sh
npm test
```

Uses Node's built-in test runner (`node --test`); there is nothing to install.

## Adding things

- **A shop item (outfit):** add it to `CLOSET` in `js/data/shop.js` (id, slot, price, en/es names), add its SVG
  layer to `OUTFIT_LAYERS` in `js/bruno.js`, and add any new strings to `js/data/strings.js`.
- **A sticker:** add an `S(...)` line to `STICKERS` in `js/data/shop.js` with its Fluent Emoji name, then run
  `bash scripts/fetch-art.sh` (needs `curl` and `cwebp`) to download the picture into `art/stickers/`.
- After adding or changing any file, update `PRECACHE` in `sw.js` (`npm test` tells you what is missing)
  and bump the `CACHE` version so installed copies refresh.
- App icons are rebuilt with `bash scripts/make-icons.sh` (macOS, Google Chrome).

## Credits

Artwork and icon licenses are listed in [CREDITS.md](CREDITS.md): sticker and badge pictures are
Microsoft Fluent Emoji (MIT) and button icons are Phosphor Icons (MIT). Sounds are synthesized in the browser.
The code is MIT licensed; see [LICENSE](LICENSE).
