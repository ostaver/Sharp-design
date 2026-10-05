#!/usr/bin/env node
// roll.mjs — the chart for one Rhumb build.
//
// Every build rolls its own colours (a green signal, a cool rim, the night, the paper, one day
// ink, the sky's dither ramps), fonts, clock, bearing, sky scene, section line-up and layout,
// so no two builds share a look. Nothing visual is hand-picked: run this once per build.
//
//   node roll.mjs                        print a fresh chart (random seed)
//   node roll.mjs --out <project>        …and write it into the project
//   node roll.mjs --seed <text> --out …  reproduce an earlier chart exactly
//
// With --out it writes src/tokens.css, src/lib/sky.config.js, src/lib/chart.js,
// src/routes/+layout.svelte, static/favicon.svg and rhumb.chart.json, and patches the
// theme-color in src/app.html and the Fontsource dependencies in package.json if they exist.
// Run it after copying kit/ into src/.

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
const r2 = (v) => Math.round(v * 100) / 100;
const r3 = (v) => Math.round(v * 1000) / 1000;

// ---- colour (OKLCH → sRGB, chroma reduced until it fits the gamut) ------------------

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
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	].map((x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
}
function srgb(L, C, h) {
	let c = C;
	let rgb = oklchToRgb(L, c, h);
	while (rgb.some((v) => v < -0.0005 || v > 1.0005) && c > 0.0005) {
		c *= 0.95;
		rgb = oklchToRgb(L, c, h);
	}
	return rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255));
}
const hex = (L, C, h) => '#' + srgb(L, C, h).map((v) => v.toString(16).padStart(2, '0')).join('');
const rgba = (L, C, h, a) => `rgba(${srgb(L, C, h).join(', ')}, ${a})`;

// ---- palette ----------------------------------------------------------------------
// Hues are OKLCH degrees. Signal: chartreuse-green through emerald. Rim: starlight blue.

const sig = { h: between(128, 162), L: between(0.8, 0.87), C: between(0.17, 0.23) };
const rimH = between(222, 268);
const cast = { h: pick([sig.h, rimH]), C: between(0.004, 0.012) };
const nightL = between(0.115, 0.14);
const paperP = { h: between(72, 95), L: between(0.925, 0.945), C: between(0.018, 0.036) };
const inkFamily = pick([
	{ name: 'blue', h: between(252, 268), C: between(0.12, 0.16) },
	{ name: 'oxblood', h: between(16, 28), C: between(0.11, 0.14) },
	{ name: 'bottle green', h: between(150, 166), C: between(0.07, 0.1) },
	{ name: 'iron-gall', h: between(55, 70), C: between(0.05, 0.07) }
]);
const inkL = between(0.37, 0.43);

const css = {
	night: hex(nightL, cast.C, cast.h),
	'night-1': hex(nightL + 0.03, cast.C * 1.2, cast.h),
	'night-2': hex(nightL + 0.06, cast.C * 1.4, cast.h),
	panel: rgba(nightL + 0.015, cast.C, cast.h, 0.78),
	hair: rgba(0.965, 0.006, cast.h, 0.085),
	'hair-2': rgba(0.965, 0.006, cast.h, 0.15),
	'hair-3': rgba(0.965, 0.006, cast.h, 0.26),
	text: hex(0.965, 0.006, cast.h),
	'text-2': hex(0.84, 0.01, cast.h),
	dim: hex(0.75, 0.012, cast.h),
	muted: hex(0.63, 0.012, cast.h),
	faint: hex(0.41, 0.012, cast.h),
	signal: hex(sig.L, sig.C, sig.h),
	'signal-2': hex(sig.L - 0.14, sig.C * 1.05, sig.h + between(-4, 4)),
	'signal-glow': rgba(sig.L, sig.C, sig.h, 0.18),
	rim: hex(0.75, between(0.11, 0.15), rimH),
	ok: hex(0.86, 0.1, sig.h + between(18, 30)),
	warn: hex(0.83, 0.12, between(62, 78)),
	bad: hex(0.7, 0.16, between(14, 26)),
	paper: hex(paperP.L, paperP.C, paperP.h),
	'paper-2': hex(paperP.L - 0.03, paperP.C + 0.01, paperP.h),
	'day-accent': hex(inkL, inkFamily.C, inkFamily.h),
	'day-accent-2': hex(inkL + 0.13, inkFamily.C * 0.9, inkFamily.h),
	ink: hex(0.27, inkFamily.C * 0.6, inkFamily.h),
	'ink-2': hex(0.46, inkFamily.C * 0.35, inkFamily.h),
	'vignette-night': rgba(0.03, 0.005, cast.h, 0.42),
	'vignette-day': rgba(0.42, 0.05, paperP.h, 0.13),
	bars: hex(0.06, 0.004, cast.h),
	'flag-r': hex(0.64, 0.2, between(20, 28)),
	'flag-b': hex(0.53, 0.17, between(258, 268)),
	'flag-y': hex(0.86, 0.15, between(85, 92)),
	'flag-w': hex(0.94, 0.008, cast.h),
	'flag-k': hex(0.14, 0.01, cast.h)
};
const contrast = {
	dim: hex(0.87, 0.01, cast.h),
	muted: hex(0.78, 0.01, cast.h),
	hair: rgba(0.965, 0.006, cast.h, 0.3),
	'hair-2': rgba(0.965, 0.006, cast.h, 0.45)
};

const dawnTilt = between(-10, 10);
const dawnK = between(0.8, 1.1);
const palette = {
	bg: css.night,
	grain: hex(nightL + 0.045, cast.C * 1.5, cast.h),
	white: hex(0.955, 0.02, rimH),
	paper: css.paper,
	paperGrain: hex(paperP.L - 0.03, paperP.C + 0.005, paperP.h),
	body: [
		css.night,
		hex(0.24, sig.C * 0.38, sig.h),
		hex(0.4, sig.C * 0.6, sig.h),
		css['signal-2'],
		css.signal,
		hex(0.93, sig.C * 0.45, sig.h)
	],
	rim: [
		hex(sig.L - 0.02, sig.C * 0.85, sig.h),
		hex(0.78, 0.13, (sig.h + rimH) / 2),
		css.rim,
		hex(0.87, 0.07, rimH),
		hex(0.97, 0.018, rimH)
	],
	dawn: [
		css.night,
		hex(0.22, 0.07 * dawnK, 280 + dawnTilt),
		hex(0.32, 0.1 * dawnK, 318 + dawnTilt),
		hex(0.46, 0.14 * dawnK, 352 + dawnTilt),
		hex(0.62, 0.15 * dawnK, 18 + dawnTilt),
		hex(0.74, 0.14 * dawnK, 45 + dawnTilt),
		hex(0.85, 0.1 * dawnK, 68 + dawnTilt),
		hex(0.93, 0.045, paperP.h + 5)
	]
};

// ---- fonts --------------------------------------------------------------------------

const V = '^5.3.0';
const SANS = [
	{ family: 'Geist Variable', pkg: '@fontsource-variable/geist', css: ['wght.css'], features: "'ss01', 'cv11'" },
	{ family: 'Inter Tight Variable', pkg: '@fontsource-variable/inter-tight', css: ['wght.css'], features: "'ss01', 'cv11'" },
	{ family: 'Hanken Grotesk Variable', pkg: '@fontsource-variable/hanken-grotesk', css: ['wght.css'], features: 'normal' },
	{ family: 'Schibsted Grotesk Variable', pkg: '@fontsource-variable/schibsted-grotesk', css: ['wght.css'], features: 'normal' },
	{ family: 'Onest Variable', pkg: '@fontsource-variable/onest', css: ['wght.css'], features: 'normal' }
];
const MONO = [
	{ family: 'Geist Mono Variable', pkg: '@fontsource-variable/geist-mono', css: ['wght.css'] },
	{ family: 'JetBrains Mono Variable', pkg: '@fontsource-variable/jetbrains-mono', css: ['wght.css'] },
	{ family: 'Red Hat Mono Variable', pkg: '@fontsource-variable/red-hat-mono', css: ['wght.css'] }
];
const SERIF = [
	{ family: 'Instrument Serif', pkg: '@fontsource/instrument-serif', css: ['latin-400.css', 'latin-400-italic.css'] },
	{ family: 'Newsreader Variable', pkg: '@fontsource-variable/newsreader', css: ['wght.css', 'wght-italic.css'] },
	{ family: 'Fraunces Variable', pkg: '@fontsource-variable/fraunces', css: ['wght.css', 'wght-italic.css'] },
	{ family: 'EB Garamond Variable', pkg: '@fontsource-variable/eb-garamond', css: ['wght.css', 'wght-italic.css'] }
];
let fonts;
do {
	fonts = { sans: pick(SANS), mono: pick(MONO), serif: pick(SERIF) };
	// never the reference build's trio
} while (fonts.sans.family === 'Geist Variable' && fonts.mono.family === 'Geist Mono Variable' && fonts.serif.family === 'Instrument Serif');

const fontVars = {
	'f-sans': `'${fonts.sans.family}', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`,
	'f-mono': `'${fonts.mono.family}', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace`,
	'f-serif': `'${fonts.serif.family}', 'Iowan Old Style', 'Times New Roman', serif`,
	'f-features': fonts.sans.features
};

// ---- bearing, clock, coordinates ----------------------------------------------------

const bearing = chance(0.5) ? int(11, 79) : int(281, 349);
const start = int(19 * 12, 21 * 12) * 5; // 19:00–21:00 in 5-minute steps
const landfallT = (30 + int(0, 2)) * 60 + int(0, 5) * 5 + (chance(0.5) ? 30 : 0); // 06:00–08:55
const end = Math.min(landfallT, 32 * 60 + 30);
const coord = `${int(1, 68)}°${String(int(0, 59)).padStart(2, '0')}′ ${pick(['N', 'S'])} · ${int(1, 179)}°${String(int(0, 59)).padStart(2, '0')}′ ${pick(['E', 'W'])}`;

// ---- sections -------------------------------------------------------------------------

const TYPES = {
	handoff: { pinned: true, icon: 'handoff', labels: ['Hand-off', 'The brief', 'Taking the watch', 'Casting off'] },
	instruments: { pinned: false, icon: 'instruments', labels: ['Instruments', 'The bridge', 'Gauges', 'On the bridge'] },
	bearing: { pinned: true, icon: 'bearing', role: 'globe', labels: ['Bearing', 'The course', 'Rhumb line', 'Holding course'] },
	night: { pinned: true, icon: 'night', role: 'log', labels: ['The night', 'The log', 'Middle watch', 'Night log'] },
	signals: { pinned: false, icon: 'signals', labels: ['Signals', 'Hoists', 'Word from the fleet', 'Colours'] },
	charter: { pinned: false, icon: 'charter', labels: ['Charter', 'Terms', 'Articles', 'Charter party'] }
};
const HERO_LABELS = ['Heading', 'Dusk', 'Departure', 'Evening'];
const LANDFALL_LABELS = ['Landfall', 'First light', 'Making port', 'Dawn'];
const SCENES = ['bearing', 'night'];

function lineUpOk(order) {
	const pins = ['hero', ...order, 'landfall'].map((t) => t === 'hero' || t === 'landfall' || TYPES[t].pinned);
	for (let i = 2; i < pins.length; i++) if (pins[i] && pins[i - 1] && pins[i - 2]) return false;
	const lastScene = Math.max(...order.map((t, i) => (SCENES.includes(t) ? i : -1)));
	if (lastScene < 0 || lastScene === order.length - 1) return false; // dawn needs a free section after the scenes
	// the hand-off is the brief at dusk: it comes before the night turns; the charter is settled
	// in the morning, after it
	const pivot = order.includes('night') ? order.indexOf('night') : order.indexOf('bearing');
	if (order.includes('handoff') && order.indexOf('handoff') > pivot) return false;
	return !order.includes('charter') || order.indexOf('charter') > pivot;
}
let order = null;
for (let tries = 0; !order && tries < 2000; tries++) {
	const count = int(3, 6);
	let chosen = shuffle(Object.keys(TYPES)).slice(0, count);
	if (!chosen.some((t) => SCENES.includes(t))) chosen[chosen.length - 1] = pick(SCENES);
	chosen = shuffle(chosen);
	if (lineUpOk(chosen)) order = chosen;
}
if (!order) throw new Error('roll: could not find a valid line-up');

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const step5 = (a, b) => int(a / 5, b / 5) * 5;
const sections = [{ type: 'hero', id: '', label: pick(HERO_LABELS), icon: 'heading', role: 'hero', time: start }];
const pivot = order.includes('night') ? order.indexOf('night') : order.indexOf('bearing');
// Evening sections up to the pivot count forward from dusk; morning sections count back from landfall.
let t = start;
const evening = order.slice(0, pivot + 1).map((type) => {
	t += step5(10, 25);
	return { type, time: t };
});
let m = end;
const morning = order
	.slice(pivot + 1)
	.reverse()
	.map((type) => {
		m -= step5(15, 40);
		return { type, time: m };
	})
	.reverse();
for (const s of [...evening, ...morning]) {
	const T = TYPES[s.type];
	const entry = { type: s.type, id: '', label: pick(T.labels), icon: T.icon, time: s.time };
	if (T.role) entry.role = T.role;
	if (s.type === 'night') {
		const before = evening.length > 1 ? evening[evening.length - 2].time : start;
		const s0 = Math.max(s.time, before + 10);
		const after = morning.length ? morning[0].time : end;
		const s1 = after - step5(10, 25);
		entry.time = s0;
		entry.span = [s0, s1];
	}
	sections.push(entry);
}
sections.push({ type: 'landfall', id: '', label: pick(LANDFALL_LABELS), icon: 'landfall', role: 'landfall', time: end });

// dawn starts on the first free section after the last scene
const lastScene = Math.max(...sections.map((s, i) => (s.role === 'globe' || s.role === 'log' ? i : -1)));
sections[lastScene + 1].role ??= 'dawn';
const used = new Set();
sections.forEach((s, i) => {
	let id = slug(s.label) || s.type;
	while (used.has(id)) id += '-2';
	used.add(id);
	s.id = id;
	s.n = String(i + 1).padStart(2, '0');
});

// ---- layout and sky scene ---------------------------------------------------------------

const heroCopy = pick(['left', 'right']);
const globeSide = pick(['left', 'right']);
const instrumentsCount = pick([3, 4, 6]);
const charterForm = pick(['columns', 'ledger']);
const charterTiers = charterForm === 'columns' ? 3 : pick([3, 4]);
const layout = {
	chrome: { rail: pick(['left', 'right']), navClock: pick(['center', 'left']) },
	hero: { copy: heroCopy, lines: pick([2, 3]), helm: chance(0.6) },
	handoff: { terminal: pick(['left', 'right']), steps: pick([3, 4]) },
	instruments: { count: instrumentsCount, columns: instrumentsCount === 4 ? 2 : instrumentsCount === 6 ? pick([2, 3]) : 3, head: pick(['split', 'stacked']) },
	bearing: { copy: globeSide === 'left' ? 'right' : 'left', stats: pick([2, 3]), definition: chance(0.7) },
	night: { marker: int(28, 40), pxPerMin: pick([8, 9, 10]), entries: int(8, 12), first: pick(['above', 'below']) },
	signals: { quote: pick(['left', 'right']), quotes: int(3, 5), dwell: r2(between(6, 9)) },
	charter: { form: charterForm, tiers: charterTiers, featured: int(1, charterTiers - 1) },
	landfall: { rose: pick(['left', 'right']), aside: chance(0.75) },
	footer: { columns: int(3, 5) },
	preloader: { points: pick([4, 8, 16]) }
};
const skyConfig = {
	bearing,
	cssCell: chance(0.7) ? 2 : 3,
	palette,
	layout: { planet: heroCopy === 'left' ? 'right' : 'left', planetScale: r2(between(0.85, 1.15)), globe: globeSide },
	scene: {
		grid: pick([15, 20, 30, 45]),
		loxodromes: int(4, 8),
		stars: r2(between(0.7, 1.5)),
		meteorEvery: r2(between(6, 14)),
		band: [r2(between(-0.6, 0.6)), r2(between(0.15, 0.55))],
		tilt: [r3(between(0.2, 0.5)), r3(between(-0.3, 0.3))]
	}
};

const chart = {
	seed,
	signal: { hex: css.signal, oklchHue: Math.round(sig.h) },
	dayInk: inkFamily.name,
	fonts: { sans: fonts.sans.family, mono: fonts.mono.family, serif: fonts.serif.family },
	bearing: String(bearing).padStart(3, '0') + '°',
	clock: { start, landfall: end },
	coordinates: coord,
	sections: sections.map(({ type, id, n, label, time, role, span }) => ({ type, id, n, label, time, ...(role && { role }), ...(span && { span }) })),
	layout,
	tokens: css,
	sky: skyConfig
};

// ---- files ------------------------------------------------------------------------------

const block = (o, pad = '\t') => Object.entries(o).map(([k, v]) => `${pad}--${k}: ${v};`).join('\n');
// Content keeps clear of the fixed section rail on whichever side it was rolled to.
const railClear = 'clamp(0px, 5vw, 64px)';
const railVars = {
	'rail-clear-start': layout.chrome.rail === 'left' ? railClear : '0px',
	'rail-clear-end': layout.chrome.rail === 'right' ? railClear : '0px'
};
const tokensCss = `/* Rolled by roll.mjs (seed ${seed}). Do not hand-edit: roll again instead. */
:root {
${block(css)}
${block(fontVars)}
${block(railVars)}
}

/* the rail is hidden here, so nothing needs to keep clear of it */
@media (max-width: 1023px), (max-height: 520px) {
	:root {
		--rail-clear-start: 0px;
		--rail-clear-end: 0px;
	}
}

@media (prefers-contrast: more) {
	:root {
${block(contrast, '\t\t')}
	}
}
`;

const chartJs = `// Rolled by roll.mjs (seed ${seed}). Import from here; never re-decide what this file says.
// sections: the line-up in page order. Ship's minutes keep counting past midnight (02:15 is 26 * 60 + 15).
// layout:   each section's variant (and the chrome's). coordinates: for the colophon.
export const seed = ${JSON.stringify(seed)};
export const sections = ${JSON.stringify(
	sections.map(({ type, id, n, label, time, icon, role, span }) => ({ id, n, type, label, time, icon, ...(role && { role }), ...(span && { span }) })),
	null,
	'\t'
)};
export const layout = ${JSON.stringify(layout, null, '\t')};
export const coordinates = ${JSON.stringify(coord)};
`;

const skyJs = `// Rolled by roll.mjs (seed ${seed}). The sky's palette, bearing, pixel size, layout and scene.
// palette.bg equals --night and palette.paper equals --paper in tokens.css, character for character.
export const skyConfig = ${JSON.stringify(skyConfig, null, '\t')};
`;

const layoutSvelte = `<script>
${[fonts.sans, fonts.mono, fonts.serif].flatMap((f) => f.css.map((c) => `\timport '${f.pkg}/${c}';`)).join('\n')}
	import '../tokens.css';
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}
`;

// The mark: a wind rose with its needle on the bearing.
const roseMark = (points) => {
	const kite = 'M16 1.2 17.9 14.1 16 16 14.1 14.1Z';
	const half = 'M16 7.4 17.1 14.9 16 16 14.9 14.9Z';
	const quarter = 'M16 10.6 16.6 15.2 16 16 15.4 15.2Z';
	const parts = [0, 90, 180, 270].map((a) => `<path d="${kite}" transform="rotate(${a} 16 16)"/>`);
	if (points >= 8) parts.push(...[45, 135, 225, 315].map((a) => `<path d="${half}" transform="rotate(${a} 16 16)"/>`));
	if (points >= 16) parts.push(...[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((a) => `<path d="${quarter}" transform="rotate(${a} 16 16)"/>`));
	return parts.join('');
};
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" fill="${css.night}"/>
<g transform="translate(16 16) scale(.82) translate(-16 -16)">
<g fill="${css.text}">${roseMark(Math.min(layout.preloader.points, 8))}</g>
<path d="M16 2.6 17.7 14.3 16 16 14.3 14.3Z" fill="${css.signal}" transform="rotate(${bearing} 16 16)"/>
<circle cx="16" cy="16" r="1.5" fill="${css.night}"/>
</g>
</svg>
`;

function write(rel, text) {
	const p = join(out, rel);
	mkdirSync(dirname(p), { recursive: true });
	writeFileSync(p, text);
	return rel;
}

const written = [];
if (out) {
	written.push(write('src/tokens.css', tokensCss));
	written.push(write('src/lib/sky.config.js', skyJs));
	written.push(write('src/lib/chart.js', chartJs));
	written.push(write('src/routes/+layout.svelte', layoutSvelte));
	written.push(write('static/favicon.svg', favicon));
	written.push(write('rhumb.chart.json', JSON.stringify(chart, null, '\t') + '\n'));

	const appHtml = join(out, 'src/app.html');
	if (existsSync(appHtml)) {
		const html = readFileSync(appHtml, 'utf8').replace(/(<meta name="theme-color" content=")[^"]*(")/, `$1${css.night}$2`);
		writeFileSync(appHtml, html);
		written.push('src/app.html (theme-color)');
	}
	const pkgPath = join(out, 'package.json');
	if (existsSync(pkgPath)) {
		const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
		const deps = Object.fromEntries(Object.entries(pkg.dependencies ?? {}).filter(([k]) => !k.startsWith('@fontsource')));
		for (const f of [fonts.sans, fonts.mono, fonts.serif]) deps[f.pkg] = V;
		pkg.dependencies = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
		writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		written.push('package.json (fonts)');
	}
}

process.stdout.write(JSON.stringify(out ? { written, chart } : chart, null, 2) + '\n');
