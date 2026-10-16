#!/usr/bin/env node
// roll.mjs — the press settings for one Stoicism build.
//
// Every build rolls its own paper and key-ink hue (always blue-violet: lavender monumentalism),
// its four drum inks, its three typefaces, its temple, its section line-up and every section's
// layout variant, so no two builds share a look. Nothing visual is hand-picked: run it once.
//
//   node roll.mjs                        print a fresh roll (random seed)
//   node roll.mjs --out <project>        …and write it into the project
//   node roll.mjs --seed <text> --out …  reproduce an earlier roll exactly
//
// With --out it writes src/theme.ts, src/chart.ts, src/fonts.ts, src/styles/tokens.css,
// public/favicon.svg and stoicism.chart.json, and patches the theme-color in index.html and
// the Fontsource dependencies in package.json if they exist. Run it after copying kit/ into src/.

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

// ---- args -------------------------------------------------------------------------

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const seed = opt('seed') ?? randomUUID();
const out = opt('out') ? resolve(opt('out')) : null;

// ---- seeded randomness ------------------------------------------------------------

function hash32(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}
function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(hash32(seed));
const between = (a, b) => a + (b - a) * rand();
const int = (a, b) => Math.floor(between(a, b + 1));
const pick = (list) => list[Math.floor(rand() * list.length)];
const chance = (p) => rand() < p;
const shuffle = (list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---- colour (OKLCH ↔ sRGB, chroma reduced until it fits the gamut) -------------------

function oklchToRgb(L, C, h) {
  const hr = (((h % 360) + 360) % 360) * (Math.PI / 180);
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
}
function srgb(L, C, h) {
  let c = C;
  for (let i = 0; i < 60; i++) {
    const rgb = oklchToRgb(L, c, h);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
    c *= 0.95;
  }
  return oklchToRgb(L, 0, h).map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
}
const hex = (L, C, h) => '#' + srgb(L, C, h).map((v) => v.toString(16).padStart(2, '0')).join('');
function toOklch(hx) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const n = parseInt(hx.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => lin(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
const hueGap = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

// ---- palette ------------------------------------------------------------------------
// One hue carries every paper and the key ink. It is always blue-violet (OKLCH 258°–300°:
// cornflower through periwinkle to iris). Lightness and chroma keep the reference profile.

const H = between(258, 300);
const K = between(0.86, 1.12); // chroma
const dL = between(-0.012, 0.012);
const tone = (L, C, dh) => hex(L + dL, C * K, H + dh);
const palette = {
  midnight: tone(0.241, 0.1, 1.1),
  indigo: tone(0.34, 0.164, -2.1),
  blue: tone(0.446, 0.186, -1.5),
  periwinkle: tone(0.616, 0.154, 0),
  periSoft: tone(0.653, 0.14, 0.5),
  lavender: tone(0.775, 0.093, 2.9),
  mist: tone(0.876, 0.048, 10.4),
  paper: tone(0.93, 0.022, 33.3),
  dust: tone(0.923, 0.034, 16.8),
};

// The second drum: pastel riso inks that read against both the key ink and the papers.
const INKS = [
  { name: 'Fluorescent Pink', code: 'RZ-S-0087', hex: '#F6D0EA' },
  { name: 'Sunflower', code: 'RZ-S-0114', hex: '#FFD86B' },
  { name: 'Aqua', code: 'RZ-S-0032', hex: '#9EEBE0' },
  { name: 'Bright Red', code: 'RZ-S-0021', hex: '#FF8A8A' },
  { name: 'Orange', code: 'RZ-S-0110', hex: '#FFB27A' },
  { name: 'Mint', code: 'RZ-S-0215', hex: '#B6EFC8' },
  { name: 'Coral', code: 'RZ-S-0175', hex: '#FF9F8E' },
  { name: 'Yellow', code: 'RZ-S-0101', hex: '#FFEF8A' },
  { name: 'Peach', code: 'RZ-S-0063', hex: '#FFC9A8' },
  { name: 'Light Lime', code: 'RZ-S-0242', hex: '#DDF29B' },
  { name: 'Flat Gold', code: 'RZ-S-0156', hex: '#EDCF8E' },
  { name: 'Turquoise', code: 'RZ-S-0091', hex: '#8FE3F2' },
].map((k) => ({ ...k, hue: toOklch(k.hex).h }));

const inks = [];
for (const k of shuffle(INKS)) {
  if (inks.length === 4) break;
  if (inks.every((x) => hueGap(x.hue, k.hue) > 34)) inks.push(k);
}
const drum = toOklch(inks[0].hex);
// the top of the ramp is the paper the first drum has stained
const ramp = [palette.midnight, palette.blue, palette.periwinkle, palette.lavender, hex(0.915, Math.min(0.06, drum.C * 0.72), drum.h)];

// ---- fonts --------------------------------------------------------------------------
// display: inscriptional capitals · serif: a book face with italics · mono: the printer's slug.
// adv is the measured mean advance of a capital, in em: the hero sizes the name with it
// (--display-advance) so a long name never runs off the page in a wide face.

const DISPLAY = [
  { family: 'Marcellus', pkg: '@fontsource/marcellus', files: ['400.css'], adv: 0.626 },
  { family: 'Cinzel Variable', pkg: '@fontsource-variable/cinzel', files: ['index.css'], adv: 0.668 },
  { family: 'Forum', pkg: '@fontsource/forum', files: ['400.css'], adv: 0.543 },
  { family: 'Tenor Sans', pkg: '@fontsource/tenor-sans', files: ['400.css'], adv: 0.709 },
  { family: 'Bellefair', pkg: '@fontsource/bellefair', files: ['400.css'], adv: 0.64 },
];
const SERIF = [
  { family: 'Cormorant Garamond', pkg: '@fontsource/cormorant-garamond', files: ['400.css', '500.css', '400-italic.css', '500-italic.css'] },
  { family: 'EB Garamond Variable', pkg: '@fontsource-variable/eb-garamond', files: ['index.css', 'wght-italic.css'] },
  { family: 'Cormorant Variable', pkg: '@fontsource-variable/cormorant', files: ['index.css', 'wght-italic.css'] },
  { family: 'Newsreader Variable', pkg: '@fontsource-variable/newsreader', files: ['index.css', 'wght-italic.css'] },
];
const MONO = [
  { family: 'IBM Plex Mono', pkg: '@fontsource/ibm-plex-mono', files: ['400.css', '500.css'] },
  { family: 'DM Mono', pkg: '@fontsource/dm-mono', files: ['400.css', '500.css'] },
  { family: 'JetBrains Mono Variable', pkg: '@fontsource-variable/jetbrains-mono', files: ['index.css'] },
  { family: 'Geist Mono Variable', pkg: '@fontsource-variable/geist-mono', files: ['index.css'] },
];
// Greek capitals (ΣΤΟΑ, χαῖρε) from a face that has them; only the Greek subset is loaded
const GREEK = { family: 'Noto Serif Display', pkg: '@fontsource/noto-serif-display', files: ['greek-400.css'] };
const FONT_VERSION = '^5.3.0';

let fonts;
do {
  fonts = { display: pick(DISPLAY), serif: pick(SERIF), mono: pick(MONO) };
  // never the reference trio
} while (fonts.display.family === 'Marcellus' && fonts.serif.family === 'Cormorant Garamond' && fonts.mono.family === 'IBM Plex Mono');

// ---- temple -------------------------------------------------------------------------

const layoutHeroSide = pick(['left', 'right']);
const temple = {
  columns: pick([
    [6, 13], // Hephaisteion
    [8, 17], // Parthenon
    [6, 14], // Poseidon at Paestum
  ]),
  // the monument stands opposite the name
  mirror: layoutHeroSide === 'right',
};

// ---- sections -----------------------------------------------------------------------

const LABELS = {
  manifesto: ['Manifesto', 'Credo', 'Creed'],
  colonnade: ['Colonnade', 'Portico', 'Arcade', 'Peristyle'],
  orders: ['Orders', 'Capitals', 'Proportions'],
  press: ['Press', 'Pressroom', 'Drum', 'Atelier'],
  ascent: ['Ascent', 'Stair', 'Steps', 'Climb'],
  finale: ['Inscribe', 'Dedicate', 'Carve', 'Tablet'],
};
const IDS = { hero: 'top', manifesto: 'manifesto', colonnade: 'works', orders: 'craft', press: 'press', ascent: 'ascent', finale: 'contact' };
const GROUNDS = {
  hero: ['periSoft'],
  manifesto: ['periSoft', 'mist'],
  colonnade: ['mist', 'lavender'],
  orders: ['lavender', 'mist'],
  press: ['midnight'],
  ascent: ['periSoft'],
  finale: ['midnight'],
};

function lineUp() {
  for (let tries = 0; tries < 500; tries++) {
    const count = int(3, 5);
    const middle = shuffle(['manifesto', 'colonnade', 'orders', 'press', 'ascent']).slice(0, count);
    const m = middle.indexOf('manifesto');
    if (m > 1) continue; // the statement follows the name: first or second
    if (middle[0] === 'ascent') continue; // two periwinkle papers would meet under the hero
    if (middle[middle.length - 1] === 'press') continue; // two dark grounds would merge before the finale
    const order = ['hero', ...middle, 'finale'];
    const grounds = [];
    let ok = true;
    for (const t of order) {
      const options = GROUNDS[t].filter((g) => g !== grounds[grounds.length - 1] || t === 'hero');
      if (!options.length) {
        ok = false;
        break;
      }
      grounds.push(pick(options));
    }
    if (ok) return { order, grounds };
  }
  throw new Error('no line-up found');
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const { order, grounds } = lineUp();
let chapter = 0;
const sections = order.map((type, i) => {
  const nav = type !== 'hero' && type !== 'manifesto';
  const n = nav ? ++chapter : 0;
  return {
    id: IDS[type],
    type,
    n,
    numeral: ROMAN[n],
    label: type === 'hero' ? 'Introduction' : pick(LABELS[type]),
    ground: grounds[i],
    next: grounds[i + 1] ?? null,
    nav,
  };
});

const layout = {
  hero: { side: layoutHeroSide },
  manifesto: { pills: int(1, 3), plate: chance(0.7), numeral: chance(0.6) },
  colonnade: { count: int(4, 7), shape: pick(['arch', 'arch', 'pill']), stagger: chance(0.7) },
  orders: { rise: pick(['stepped', 'level']), marquee: chance(0.65) },
  press: { frame: pick(['left', 'right']) },
  ascent: { steps: int(4, 7) },
  finale: { greeting: pick(['XAIPE', 'SALVE', 'AVE']), plate: chance(0.6) },
  chrome: { level: chance(0.75) ? 'right' : 'left' },
};

// ---- outputs ------------------------------------------------------------------------

const theme = {
  seed,
  palette,
  ramp,
  inks: inks.map(({ name, code, hex: h }) => ({ name, code, hex: h })),
  fonts: { display: fonts.display.family, serif: fonts.serif.family, mono: fonts.mono.family },
  temple,
};

const stack = {
  display: `'${fonts.display.family}', '${GREEK.family}', Georgia, serif`,
  serif: `'${fonts.serif.family}', Georgia, serif`,
  mono: `'${fonts.mono.family}', '${GREEK.family}', ui-monospace, Menlo, monospace`,
};

const tokens = `/* Rolled by roll.mjs — seed ${seed}. Do not edit by hand: roll again. */
:root {
  --midnight: ${palette.midnight};
  --indigo: ${palette.indigo};
  --blue: ${palette.blue};
  --periwinkle: ${palette.periwinkle};
  --peri-soft: ${palette.periSoft};
  --lavender: ${palette.lavender};
  --mist: ${palette.mist};
  --paper: ${palette.paper};
  --dust: ${palette.dust};
  /* the second drum; setInk() rewrites it live */
  --ink-hi: ${inks[0].hex};

  --f-display: ${stack.display};
  --f-serif: ${stack.serif};
  --f-mono: ${stack.mono};
  /* mean advance of one display capital, in em: size a name to fit with it */
  --display-advance: ${fonts.display.adv};
}

@media (prefers-contrast: more) {
  :root {
    --lavender: ${hex(0.84 + dL, 0.06 * K, H + 2.9)};
    --mist: ${hex(0.93 + dL, 0.03 * K, H + 10.4)};
    --peri-soft: ${hex(0.72 + dL, 0.12 * K, H + 0.5)};
  }
}
`;

const ts = (v) => JSON.stringify(v, null, 2);
const themeTs = `// Rolled by roll.mjs — seed ${seed}. Do not edit by hand: roll again.
import type { Theme } from './lib/types';

export const theme: Theme = ${ts(theme)};
`;
const chartTs = `// Rolled by roll.mjs — seed ${seed}. Do not edit by hand: roll again.
import type { ChartSection, Layout } from './lib/types';

export const sections: ChartSection[] = ${ts(sections)};

export const layout: Layout = ${ts(layout)};

export const seed = ${JSON.stringify(seed)};
`;
const fontImports = [fonts.display, fonts.serif, fonts.mono, GREEK].flatMap((f) => f.files.map((file) => `import '${f.pkg}/${file}';`));
const fontsTs = `// Rolled by roll.mjs — seed ${seed}. Self-hosted faces; imported once from main.tsx.
${fontImports.join('\n')}
`;

const mark = (fill) => `<g fill="${fill}">
    <path d="M10 22 32 10l22 12z"/><rect x="12" y="24" width="40" height="4"/>
    <rect x="15" y="30" width="5" height="20"/><rect x="25" y="30" width="5" height="20"/><rect x="35" y="30" width="5" height="20"/><rect x="45" y="30" width="5" height="20"/>
    <rect x="10" y="51" width="44" height="4"/>
  </g>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${palette.periSoft}"/>
  <g transform="translate(2.2 1.6)">${mark(inks[0].hex)}</g>
  ${mark(palette.midnight)}
</svg>
`;

const chart = { seed, theme, fonts: { ...theme.fonts, packages: [fonts.display.pkg, fonts.serif.pkg, fonts.mono.pkg, GREEK.pkg] }, sections, layout };

const summary = [
  `seed       ${seed}`,
  `hue        ${H.toFixed(1)}°  (chroma ×${K.toFixed(2)})`,
  `papers     periSoft ${palette.periSoft} · lavender ${palette.lavender} · mist ${palette.mist} · paper ${palette.paper}`,
  `key ink    ${palette.midnight}`,
  `drums      ${theme.inks.map((k) => `${k.name} ${k.hex}`).join(' · ')}`,
  `fonts      ${theme.fonts.display} / ${theme.fonts.serif} / ${theme.fonts.mono}`,
  `temple     ${temple.columns.join(' × ')} columns, monument ${temple.mirror ? 'left' : 'right'}`,
  `line-up    ${sections.map((s) => `${s.numeral ? s.numeral + '. ' : ''}${s.label} [${s.type}/${s.ground}]`).join(' → ')}`,
  `layout     ${Object.entries(layout)
    .map(([k, v]) => `${k} ${Object.entries(v).map(([a, b]) => `${a}=${b}`).join(',')}`)
    .join(' · ')}`,
].join('\n');

if (!out) {
  console.log(summary);
  process.exit(0);
}

const write = (rel, text) => {
  const p = join(out, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
};
write('src/styles/tokens.css', tokens);
write('src/theme.ts', themeTs);
write('src/chart.ts', chartTs);
write('src/fonts.ts', fontsTs);
write('public/favicon.svg', favicon);
write('stoicism.chart.json', JSON.stringify(chart, null, 2) + '\n');

const html = join(out, 'index.html');
if (existsSync(html)) {
  const src = readFileSync(html, 'utf8');
  writeFileSync(html, src.replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${palette.periSoft}$2`));
}
const pkgPath = join(out, 'package.json');
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = Object.fromEntries(Object.entries(pkg.dependencies ?? {}).filter(([k]) => !k.startsWith('@fontsource')));
  for (const f of [fonts.display, fonts.serif, fonts.mono, GREEK]) deps[f.pkg] = FONT_VERSION;
  pkg.dependencies = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}
console.log(summary);
console.log(`\nwrote src/theme.ts, src/chart.ts, src/fonts.ts, src/styles/tokens.css, public/favicon.svg, stoicism.chart.json`);
