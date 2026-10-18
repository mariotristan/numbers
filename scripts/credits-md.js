// Regenerates CREDITS.md from js/data/credits.js. Run from the repo root: node scripts/credits-md.js
import { writeFileSync } from "node:fs";
import { CREDITS } from "../js/data/credits.js";

const rows = CREDITS.map((c) =>
  `| ${c.use.en} | [${c.title}](${c.source}) | ${c.author} | ${c.license} — see \`${c.licenseFile}\` | ${c.note} |`);

const md = `# Credits

Bruno's Numbers has no recorded sounds: every sound effect is synthesized in the browser.
Bruno, his outfits and the place-value blocks are drawn in SVG/CSS for this game.
The artwork below is shared under open licenses.

| Used for | Artwork | Author | License | Notes |
|---|---|---|---|---|
${rows.join("\n")}
`;

writeFileSync("CREDITS.md", md);
console.log(`Wrote CREDITS.md (${CREDITS.length} entries)`);
