// Bruno Tristan in his math look, drawn as an SVG in a 120x162 viewBox (offset y -12).
// CSS animates the parts with classes: .bruno-wave (right arm) and .bruno-eyes (blink).
// Default outfit: a green cap (.bruno-cap) and a pencil behind his ear (.bruno-pencil).
// Shop items are layers wrapped in <g class="outfit-<id>">: a worn hat replaces the cap,
// a worn held item replaces the pencil, glasses and neck items go on top.

// Points of a five-pointed star centered at (cx, cy).
function star(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

const SKIN = "#e3a77a";
const SKIN_SHADE = "#c98b62";
const LINE = `stroke="#5a3d2b" stroke-opacity=".45" stroke-width="1.2"`;

// Held items sit in Bruno's lower hand at (22, 104); the fist is redrawn on top so he grips them.
const FIST = `<circle cx="22" cy="104" r="7" fill="${SKIN}" ${LINE}/>
<path d="M17 105.5 h7 M17.5 108.5 h6" stroke="${SKIN_SHADE}" stroke-width="1.2" stroke-linecap="round"/>
<ellipse cx="27.5" cy="101.5" rx="2.6" ry="3.8" fill="${SKIN}" ${LINE} transform="rotate(-20 27.5 101.5)"/>`;

export const OUTFIT_LAYERS = {
  "wizard-hat": `<path d="M33 22 Q60 15 87 22 L64 -9 Q60 -13 56 -8Z" fill="#2b3a8f"/>
<ellipse cx="60" cy="21" rx="31" ry="5.5" fill="#1f2a6b"/>
<polygon points="${star(62, 5, 5.5, 2.4)}" fill="#ffd23f"/>
<polygon points="${star(49, 14, 3, 1.3)}" fill="#ffd23f"/>`,
  "astronaut-helmet": `<circle cx="60" cy="34" r="29" fill="#cfe9ff" fill-opacity=".35" stroke="#e8eef5" stroke-width="4.5"/>
<path d="M42 20 Q48 11 58 9" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<rect x="38" y="57" width="44" height="8" rx="4" fill="#dfe6ee" stroke="#aab6c3"/>
<rect x="57" y="1" width="6" height="5" rx="1" fill="#aab6c3"/>`,
  "party-hat": `<polygon points="44,20 76,20 60,-8" fill="#ff6fa5"/>
<path d="M48.5 12 L71.5 12 M53 4 L67 4" stroke="#fff" stroke-width="3"/>
<circle cx="60" cy="-8" r="4.5" fill="#ffd23f"/>
<rect x="43" y="18" width="34" height="4" rx="2" fill="#e04d8a"/>`,
  sunglasses: `<path d="M41 32 H79" stroke="#222" stroke-width="2.5"/>
<rect x="42" y="30" width="16" height="11" rx="4" fill="#222"/>
<rect x="62" y="30" width="16" height="11" rx="4" fill="#222"/>
<path d="M45 33 l4 0 M65 33 l4 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  "star-glasses": `<path d="M58 35 H62 M42 35 L37 37 M78 35 L83 37" stroke="#e0a000" stroke-width="2.5"/>
<polygon points="${star(51, 36, 10, 5)}" fill="#ffcc33" stroke="#e0a000" stroke-width="1.5" stroke-linejoin="round"/>
<polygon points="${star(69, 36, 10, 5)}" fill="#ffcc33" stroke="#e0a000" stroke-width="1.5" stroke-linejoin="round"/>
<circle cx="51" cy="36.5" r="4" fill="#ff9ec7" fill-opacity=".85"/>
<circle cx="69" cy="36.5" r="4" fill="#ff9ec7" fill-opacity=".85"/>`,
  cape: `<path d="M44 58 L52 66 L60 62 L68 66 L76 58Z" fill="#c62f3a"/>
<circle cx="60" cy="63" r="3.5" fill="#ffd23f" stroke="#c99a00"/>`,
  "bow-tie": `<polygon points="47,57 59,63 47,69" fill="#ff5a8a"/>
<polygon points="73,57 61,63 73,69" fill="#ff5a8a"/>
<rect x="56.5" y="59.5" width="7" height="7" rx="2" fill="#e04d8a"/>`,
  scarf: `<rect x="43" y="55" width="34" height="10" rx="5" fill="#16a3a3"/>
<rect x="64" y="59" width="10" height="25" rx="3" fill="#16a3a3"/>
<path d="M51 55 v10 M59 55 v10 M64 72 h10 M64 80 h10" stroke="#bff0ec" stroke-width="2.5"/>`,
  "magic-wand": `<path d="M22 106 L8 72" stroke="#333" stroke-width="3.5" stroke-linecap="round"/>
<path d="M10.5 78 L8 72" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
<polygon points="${star(7, 69, 8, 3.5)}" fill="#ffd23f" stroke="#e0a000" stroke-linejoin="round"/>
${FIST}`,
  pencil: `<g transform="rotate(-22 22 104)">
<rect x="18.5" y="78" width="7" height="38" fill="#f6c343"/>
<rect x="18.5" y="114" width="7" height="6" rx="1.5" fill="#ff8fa3"/>
<polygon points="18.5,78 25.5,78 22,68" fill="#f1d3a8"/>
<polygon points="20.6,72.2 23.4,72.2 22,68" fill="#333"/>
</g>
${FIST}`,
  balloon: `<path d="M22 104 Q12 80 16 46" stroke="#555" stroke-width="1.5" fill="none"/>
<ellipse cx="16" cy="32" rx="12" ry="14" fill="#ff6f91"/>
<polygon points="13,48 19,48 16,44" fill="#e0567a"/>
<ellipse cx="11.5" cy="26" rx="3" ry="5" fill="#fff" opacity=".5"/>
${FIST}`,
  telescope: `<g transform="rotate(-14 22 104)">
<rect x="19" y="98" width="6" height="16" rx="1.5" fill="#6b4a2b"/>
<rect x="17" y="76" width="10" height="24" rx="2" fill="#c58b46"/>
<rect x="14.5" y="56" width="15" height="22" rx="2" fill="#a86f32"/>
<rect x="13.5" y="54" width="17" height="5" rx="2" fill="#e8c15a"/>
<rect x="16" y="76" width="12" height="3" fill="#e8c15a"/>
</g>
${FIST}`,
};

// Pieces drawn behind Bruno's body (the cape's back hangs behind him).
const BEHIND = {
  cape: `<path d="M42 60 L78 60 L104 138 Q60 147 16 138Z" fill="#d63b3b"/>`,
};

const CAP = `<g class="bruno-cap">
<path d="M38 22 Q38 1 60 0 Q82 1 82 22Z" fill="#2e9d4f"/>
<path d="M60 0 V21 M48 3 Q45 12 46 21 M72 3 Q75 12 74 21" stroke="#24803f" stroke-width="1.5" fill="none"/>
<circle cx="60" cy="0" r="2.5" fill="#24803f"/>
<path d="M36 21 Q60 15 84 21 Q86 27 80 28 Q60 23 40 28 Q34 27 36 21Z" fill="#1f7a3a"/>
<path d="M60 8 v8 M56 12 h8" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
</g>`;

// Tucked behind the left ear: drawn before the head, so the head and ear hide its middle.
const PENCIL = `<g class="bruno-pencil">
<g transform="rotate(32 36 34)">
<rect x="33" y="12" width="6" height="36" fill="#f6c343"/>
<rect x="33" y="10" width="6" height="5" rx="1.5" fill="#ff8fa3"/>
<polygon points="33,48 39,48 36,57" fill="#f1d3a8"/>
<polygon points="34.8,53.4 37.2,53.4 36,57" fill="#333"/>
</g>
</g>`;

const SHIRT = "#8a66cf";
const SLEEVE = "#7a57bf";
const PANTS = "#3d4a6b";

const SNEAKER = (x, flip) => {
  const toe = flip ? `M${x} 132 h24 v5 a5 5 0 0 1 -5 5 h-17 a4 4 0 0 1 -4 -4z` : `M${x} 132 h24 v6 a4 4 0 0 1 -4 4 h-17 a5 5 0 0 1 -5 -5z`;
  const lace = x + 12;
  return `<path d="${toe}" fill="#e46a5f" ${LINE}/>
<rect x="${x - 0.5}" y="138.5" width="25" height="4" rx="2" fill="#fff" ${LINE}/>
<path d="M${lace - 5} 133.5 l4 2.5 M${lace - 1} 133.5 l-4 2.5 M${lace + 1} 133.5 l4 2.5 M${lace + 5} 133.5 l-4 2.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>`;
};

const BODY = `<rect x="40" y="104" width="17" height="30" rx="6" fill="${PANTS}" ${LINE}/>
<rect x="63" y="104" width="17" height="30" rx="6" fill="${PANTS}" ${LINE}/>
<path d="M44 110 v18 M76 110 v18" stroke="#fff" stroke-opacity=".15" stroke-width="2" stroke-linecap="round"/>
${SNEAKER(36, false)}
${SNEAKER(60, true)}
<rect x="14" y="66" width="17" height="34" rx="8" fill="${SLEEVE}" ${LINE}/>
<rect x="14" y="94" width="17" height="5" rx="2.5" fill="#6a49ad"/>
<circle cx="22" cy="104" r="7" fill="${SKIN}" ${LINE}/>
<path d="M17 105.5 h7 M17.5 108.5 h6" stroke="${SKIN_SHADE}" stroke-width="1.2" stroke-linecap="round"/>
<ellipse cx="27.5" cy="101.5" rx="2.6" ry="3.8" fill="${SKIN}" ${LINE} transform="rotate(-20 27.5 101.5)"/>
<g class="bruno-wave">
<rect x="89" y="40" width="17" height="38" rx="8" fill="${SLEEVE}" ${LINE}/>
<rect x="89" y="41" width="17" height="5" rx="2.5" fill="#6a49ad"/>
<g fill="${SKIN}" ${LINE}>
<rect x="91" y="24.5" width="3.6" height="9" rx="1.8"/>
<rect x="95.2" y="22.5" width="3.6" height="10" rx="1.8"/>
<rect x="99.4" y="23.5" width="3.6" height="9.5" rx="1.8"/>
<rect x="103.2" y="27" width="3.4" height="8" rx="1.7"/>
<circle cx="97" cy="36" r="7.5"/>
<ellipse cx="89.5" cy="35" rx="2.6" ry="4" transform="rotate(30 89.5 35)"/>
</g>
</g>
<rect x="30" y="60" width="60" height="50" rx="14" fill="${SHIRT}" ${LINE}/>
<path d="M90 74 V96 a14 14 0 0 1 -14 14 h-6 Q84 100 84 62 Q90 64 90 74Z" fill="#000" opacity=".12"/>
<path d="M35 72 q1 -6 6 -9" stroke="#fff" stroke-opacity=".35" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M48 60 L60 72 L72 60Z" fill="#fff"/>
<path d="M45 59 L58 61 L52 69.5Z M75 59 L62 61 L68 69.5Z" fill="#a184e0" ${LINE} stroke-linejoin="round"/>
<rect x="35" y="71" width="10" height="9" rx="2" fill="#7f5cc4" ${LINE}/>
<path d="M35 74 h10" stroke="#6a49ad" stroke-width="1.2"/>
<path d="M68 101 q4 -2.5 9 -1" stroke="#000" stroke-opacity=".18" stroke-width="1.5" fill="none" stroke-linecap="round"/>
<rect x="40" y="86" width="40" height="11" rx="3" fill="#2e7d32"/>
<text x="60" y="94.5" text-anchor="middle" font-size="8.5" font-weight="bold" font-family="Trebuchet MS, sans-serif" fill="#fff">BRUNO</text>
<rect x="30" y="102" width="60" height="6" fill="${PANTS}"/>
<rect x="57" y="103" width="6" height="4" rx="1" fill="#c9a03a"/>
<rect x="53" y="52" width="14" height="10" fill="${SKIN}"/>
<path d="M53 55 h14 v3 q-7 3 -14 0z" fill="${SKIN_SHADE}" opacity=".6"/>`;

// Hair: a brown top with a short fringe and sideburns that peek out under the cap or any hat.
const HAIR = `<path d="M38 36 Q35 12 60 13 Q85 12 82 36 Q80 29 77 27 Q73 30 69 27.5 Q65 30 61 27.5 Q57 30 53 27.5 Q49 30 45 27.5 Q41 29 38 36Z" fill="#5a3a24"/>`;

const HEAD = `<circle cx="60" cy="36" r="22" fill="${SKIN}" ${LINE}/>
<path d="M76 21 A22 22 0 0 1 60 58 A24 24 0 0 0 76 21Z" fill="${SKIN_SHADE}" opacity=".4"/>
${HAIR}
<circle cx="38" cy="38" r="5" fill="${SKIN}" ${LINE}/>
<circle cx="82" cy="38" r="5" fill="${SKIN}" ${LINE}/>
<path d="M38.5 35.5 q-2 2.5 0 5 M81.5 35.5 q2 2.5 0 5" stroke="${SKIN_SHADE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M46.5 30.8 q4.5 -2.6 9 -0.4 M64.5 30.4 q4.5 -2.2 9 0.4" stroke="#5a3a24" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<g class="bruno-eyes"><circle cx="51" cy="36" r="3.2" fill="#2b2118"/><circle cx="69" cy="36" r="3.2" fill="#2b2118"/><circle cx="52.1" cy="34.9" r="1" fill="#fff"/><circle cx="70.1" cy="34.9" r="1" fill="#fff"/></g>
<path d="M60 37.5 q2.8 3.2 -0.3 4.6" stroke="${SKIN_SHADE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<circle cx="45" cy="44" r="4" fill="#f29b8a" opacity=".6"/>
<circle cx="75" cy="44" r="4" fill="#f29b8a" opacity=".6"/>
<path d="M51 45 q9 8 18 0" stroke="#7a3b2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;

const wrap = (id, markup, extra = "") => `<g class="outfit-${id}${extra}">\n${markup}\n</g>`;

export function brunoSvg(worn = {}) {
  const pick = (slot) => (worn && OUTFIT_LAYERS[worn[slot]] ? worn[slot] : null);
  const [hat, glasses, neck, held] = ["hat", "glasses", "neck", "held"].map(pick);
  return [
    `<svg viewBox="0 -12 120 162" aria-hidden="true" focusable="false">`,
    neck && BEHIND[neck] ? wrap(neck, BEHIND[neck], " outfit-back") : "",
    BODY,
    held ? "" : PENCIL,
    HEAD,
    glasses ? wrap(glasses, OUTFIT_LAYERS[glasses]) : "",
    hat ? wrap(hat, OUTFIT_LAYERS[hat]) : CAP,
    neck ? wrap(neck, OUTFIT_LAYERS[neck]) : "",
    held ? wrap(held, OUTFIT_LAYERS[held]) : "",
    `</svg>`,
  ].filter(Boolean).join("\n");
}

// Kept for older imports: Bruno in his default math outfit.
export const BRUNO_SVG = brunoSvg();
