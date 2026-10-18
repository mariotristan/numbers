// "Number Town": the drawn background behind every screen. A sky with a sun, a spinning globe,
// clouds that carry math facts, balloons with + − × =, and rolling hills with a little town
// on a ruler road. Everything is our own SVG; the animation lives in css/style.css.
//
// The scene is one outer <svg> that fills the screen, with smaller <svg> boxes pinned to its
// corners and edges. Each box keeps its own shape, so the sun and globe stay in the top corners,
// the balloons hug the sides, and the hills stay along the bottom on phones, iPads and desktops.

export const SCENE_VARIANTS = ["day", "afternoon", "sunset"];

// Same drawing, different light. Colors stay a little softer than the place-value colors
// so the math on top always stands out.
const PALETTES = {
  day: {
    sky: ["#5ec8ff", "#9fdcff", "#dcf5ff"],
    sun: "#ffd23f",
    glow: "#fff3a0",
    sunY: 92,
    cloud: "#ffffff",
    hillBack: "#8fdc6a",
    hillFront: "#5cbf55",
    walls: ["#f6c28b", "#ffe0b5", "#fbd0a0"],
    window: "#bfe6ff",
    road: "#ffd23f",
    tick: "#8a6d00",
  },
  afternoon: {
    sky: ["#79c3ee", "#ffd98a", "#fff0c9"],
    sun: "#ffc23a",
    glow: "#ffe7a0",
    sunY: 140,
    cloud: "#fffaf0",
    hillBack: "#88cf5c",
    hillFront: "#55ac48",
    walls: ["#f0b97f", "#f9d6a6", "#f3c592"],
    window: "#ffe9a8",
    road: "#f7c934",
    tick: "#7d6000",
  },
  sunset: {
    sky: ["#f18bb0", "#ffa877", "#ffd9ad"],
    sun: "#ff8a3d",
    glow: "#ffc48f",
    sunY: 190,
    cloud: "#fff1ea",
    hillBack: "#73b257",
    hillFront: "#4b9146",
    walls: ["#dca574", "#ecc394", "#e3b383"],
    window: "#ffd27a",
    road: "#efbd2c",
    tick: "#6e5400",
  },
};

const ROOFS = ["#e46a5f", "#5b95e6", "#4fb876", "#f2a541"];

// A nested box pinned inside the full-screen scene.
const box = (x, y, w, h, viewBox, fit, body) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}" preserveAspectRatio="${fit}" overflow="visible">${body}</svg>`;

function sun(p) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = 62;
    const r2 = 84;
    const f = (n) => n.toFixed(1);
    return `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}"/>`;
  }).join("");
  return box(
    "60%", "0", "40%", "42%", "0 0 300 300", "xMaxYMin meet",
    `<g transform="translate(205 ${p.sunY})">` +
      `<circle r="100" fill="url(#nt-glow)"/>` +
      `<g class="scene-sun-rays" stroke="${p.sun}" stroke-width="8" stroke-linecap="round" opacity=".8">${rays}</g>` +
      `<circle r="48" fill="${p.sun}"/>` +
      `<circle cx="-14" cy="-14" r="16" fill="#fff" opacity=".35"/>` +
    `</g>`,
  );
}

// Continents drawn twice, 200 units apart, so sliding them left by 200 loops seamlessly.
const LAND =
  "M-60 -38 q16 -18 36 -10 q14 8 4 24 q-10 12 -6 30 q-4 10 -14 0 q-8 -14 -22 -14 q-12 -8 2 -30z" +
  "M-4 18 q14 -8 22 4 q8 14 -2 30 q-10 8 -16 -4 q-8 -16 -4 -30z" +
  "M28 -50 q20 -8 34 4 q10 12 24 6 q14 4 8 20 q-10 10 -26 6 q-16 6 -22 22 q-12 6 -14 -10 q-2 -18 -12 -26 q-6 -14 8 -22z" +
  "M80 30 q14 -4 22 6 q2 12 -12 14 q-14 -4 -10 -20z" +
  "M120 -8 q12 -10 24 0 q8 12 -4 20 q-14 4 -20 -20z";

function globe() {
  const land = `<path d="${LAND}"/><path d="${LAND}" transform="translate(200 0)"/>`;
  return box(
    "0", "0", "36%", "30%", "0 0 300 240", "xMinYMin meet",
    `<g transform="translate(118 112)">` +
      `<circle r="78" fill="#fff" opacity=".35"/>` +
      `<circle r="70" fill="#4f93ea"/>` +
      `<g clip-path="url(#nt-globe-clip)"><g class="scene-globe-land" fill="#52b96f">${land}</g></g>` +
      `<circle r="70" fill="url(#nt-globe-shade)"/>` +
      `<ellipse rx="70" ry="22" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>` +
      `<path d="M0 -70 v140" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>` +
    `</g>`,
  );
}

// Clouds drift across a 1000-wide band. Each one starts at x = -250 and its negative delay
// puts it at its resting spot `x` on load (the reduced-motion view pauses it right there).
const DRIFT = 1500;
function cloud(p, { x, y, s, dur, fact }) {
  const delay = -(((x + 250) / DRIFT) * dur).toFixed(1);
  const label = fact
    ? `<text x="0" y="6" text-anchor="middle" font-size="30" font-weight="800" fill="#2f80ed" font-family="Trebuchet MS, sans-serif">${fact}</text>`
    : "";
  return (
    `<g transform="translate(-250 ${y})"><g class="scene-cloud" style="--dur:${dur}s;--delay:${delay}s">` +
      `<g transform="scale(${s})"><g fill="${p.cloud}">` +
        `<ellipse cx="0" cy="8" rx="78" ry="24"/><ellipse cx="-30" cy="-6" rx="34" ry="26"/><ellipse cx="18" cy="-14" rx="40" ry="32"/><ellipse cx="52" cy="4" rx="28" ry="20"/>` +
      `</g>${label}</g>` +
    `</g></g>`
  );
}

const CLOUDS = [
  { x: 330, y: 70, s: 1, dur: 70, fact: "7×8" },
  { x: 690, y: 170, s: 0.9, dur: 85, fact: "10+5" },
  { x: 90, y: 230, s: 0.85, dur: 95, fact: "100" },
  { x: 880, y: 60, s: 0.7, dur: 60 },
  { x: 520, y: 280, s: 0.6, dur: 110 },
];

function clouds(p) {
  return box("0", "2%", "100%", "48%", "0 0 1000 400", "xMidYMin slice", CLOUDS.map((c) => cloud(p, c)).join(""));
}

function balloon({ x, y, color, symbol, ink = "#fff", delay }) {
  return (
    `<g transform="translate(${x} ${y})"><g class="scene-balloon" style="--delay:${delay}s">` +
      `<path d="M0 34 q-8 20 4 40 q8 18 -2 40" fill="none" stroke="#7a6a5a" stroke-width="2"/>` +
      `<path d="M-5 36 h10 l-5 -6z" fill="${color}"/>` +
      `<ellipse rx="28" ry="34" fill="${color}"/>` +
      `<ellipse cx="-10" cy="-14" rx="7" ry="11" fill="#fff" opacity=".45"/>` +
      `<text y="12" text-anchor="middle" font-size="34" font-weight="800" fill="${ink}" font-family="Trebuchet MS, sans-serif">${symbol}</text>` +
    `</g></g>`
  );
}

function balloons() {
  const left = [
    balloon({ x: 50, y: 80, color: "#ec6b62", symbol: "+", delay: 0 }),
    balloon({ x: 110, y: 230, color: "#5b95e6", symbol: "×", delay: -1.6 }),
  ].join("");
  const right = [
    balloon({ x: 110, y: 60, color: "#4fb876", symbol: "=", delay: -0.8 }),
    balloon({ x: 50, y: 210, color: "#f5cf4a", symbol: "−", ink: "#6b4f00", delay: -2.4 }),
  ].join("");
  return (
    box("0", "26%", "18%", "42%", "0 0 160 340", "xMinYMid meet", left) +
    box("82%", "26%", "18%", "42%", "0 0 160 340", "xMaxYMid meet", right)
  );
}

function house(p, { x, y, w, h, wall, roof }) {
  const door = `<rect x="${x + w / 2 - 7}" y="${y + h - 22}" width="14" height="22" rx="3" fill="#8a5a3b"/>`;
  const win = `<rect x="${x + 8}" y="${y + 10}" width="13" height="13" rx="2" fill="${p.window}"/><rect x="${x + w - 21}" y="${y + 10}" width="13" height="13" rx="2" fill="${p.window}"/>`;
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.walls[wall]}"/>` +
    `<path d="M${x - 6} ${y + 2} L${x + w / 2} ${y - h * 0.7} L${x + w + 6} ${y + 2}Z" fill="${ROOFS[roof]}"/>` +
    win + door
  );
}

function school(p, x, y) {
  return (
    `<rect x="${x}" y="${y}" width="110" height="60" fill="${p.walls[1]}"/>` +
    `<path d="M${x - 8} ${y + 2} L${x + 55} ${y - 34} L${x + 118} ${y + 2}Z" fill="${ROOFS[0]}"/>` +
    `<rect x="${x + 40}" y="${y - 62}" width="30" height="40" fill="${p.walls[1]}"/>` +
    `<path d="M${x + 36} ${y - 60} L${x + 55} ${y - 80} L${x + 74} ${y - 60}Z" fill="${ROOFS[1]}"/>` +
    `<circle cx="${x + 55}" cy="${y - 42}" r="9" fill="#fff" stroke="#8a5a3b" stroke-width="2"/>` +
    `<path d="M${x + 55} ${y - 42} v-6 M${x + 55} ${y - 42} h5" stroke="#8a5a3b" stroke-width="2"/>` +
    `<path d="M${x + 55} ${y - 80} v-34" stroke="#7a6a5a" stroke-width="3"/>` +
    `<path d="M${x + 56} ${y - 114} h26 l-6 8 l6 8 h-26z" fill="${ROOFS[2]}"/>` +
    [12, 78].map((dx) => `<rect x="${x + dx}" y="${y + 14}" width="20" height="16" rx="2" fill="${p.window}"/>`).join("") +
    `<rect x="${x + 45}" y="${y + 30}" width="20" height="30" rx="3" fill="#8a5a3b"/>`
  );
}

const tree = (x, y, color) =>
  `<rect x="${x - 3}" y="${y - 6}" width="6" height="20" fill="#8a5a3b"/><circle cx="${x}" cy="${y - 18}" r="18" fill="${color}"/>`;

function ground(p) {
  const back = `<path d="M0 180 Q200 110 420 160 T820 150 T1220 140 T1600 150 V400 H0Z" fill="${p.hillBack}"/>`;
  const town = [
    house(p, { x: 120, y: 180, w: 60, h: 46, wall: 0, roof: 0 }),
    house(p, { x: 200, y: 168, w: 52, h: 56, wall: 1, roof: 1 }),
    tree(290, 212, p.hillFront),
    house(p, { x: 560, y: 190, w: 56, h: 44, wall: 2, roof: 3 }),
    tree(650, 222, p.hillFront),
    school(p, 900, 172),
    house(p, { x: 1060, y: 180, w: 54, h: 50, wall: 0, roof: 2 }),
    tree(1150, 214, p.hillFront),
    house(p, { x: 1330, y: 170, w: 60, h: 52, wall: 1, roof: 0 }),
    house(p, { x: 1410, y: 184, w: 50, h: 42, wall: 2, roof: 1 }),
  ].join("");
  const front = `<path d="M0 260 Q260 200 560 250 T1100 245 T1600 240 V400 H0Z" fill="${p.hillFront}"/>`;
  const ticks = Array.from({ length: 33 }, (_, i) => {
    const x = i * 50;
    const tall = i % 2 === 0;
    return `<line x1="${x}" y1="352" x2="${x}" y2="${tall ? 368 : 362}"/>`;
  }).join("");
  const road =
    `<rect x="0" y="350" width="1600" height="30" fill="${p.road}"/>` +
    `<rect x="0" y="350" width="1600" height="3" fill="#fff" opacity=".5"/>` +
    `<g stroke="${p.tick}" stroke-width="3" stroke-linecap="round">${ticks}</g>` +
    `<rect x="0" y="380" width="1600" height="20" fill="${p.hillFront}"/>`;
  return box("0", "58%", "100%", "42%", "0 0 1600 400", "xMidYMax slice", back + town + front + road);
}

function defs(p) {
  const [top, mid, bottom] = p.sky;
  return (
    `<defs>` +
      `<linearGradient id="nt-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>` +
      `<radialGradient id="nt-glow"><stop offset=".4" stop-color="${p.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="nt-globe-shade" cx=".35" cy=".3" r=".8"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>` +
      `<clipPath id="nt-globe-clip"><circle r="70"/></clipPath>` +
    `</defs>`
  );
}

// Trusted markup: our own drawing, no user data goes in here.
export function sceneryMarkup(variant) {
  const name = SCENE_VARIANTS.includes(variant) ? variant : "day";
  const p = PALETTES[name];
  return (
    `<svg class="scene scene-${name}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" aria-hidden="true" focusable="false">` +
      defs(p) +
      `<rect width="100%" height="100%" fill="url(#nt-sky)"/>` +
      sun(p) + clouds(p) + globe() + ground(p) + balloons() +
    `</svg>`
  );
}

// Grade 2 levels play in the morning, grade 3 in the afternoon, grade 4 at sunset.
export function variantForLevel(levelId) {
  const n = Number(levelId);
  if (n >= 8 && n <= 12) return "afternoon";
  if (n >= 13 && n <= 14) return "sunset";
  return "day";
}
