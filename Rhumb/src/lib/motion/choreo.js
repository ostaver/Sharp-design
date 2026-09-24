import { ScrollTrigger } from './gsap.js';
import { sections } from '$lib/content.js';
import { ui } from '$lib/state.svelte.js';
import { skyBus } from '$lib/gl/sky/bus.js';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lin = (a, b, v) => clamp01((v - a) / (b - a));
const smooth = (a, b, v) => {
	const t = lin(a, b, v);
	return t * t * (3 - 2 * t);
};

// The night runs 21:00 → 06:00 across the pinned log.
export const NIGHT_START = 21 * 60;
export const NIGHT_END = 30 * 60;

/** Height of the dawn front, in viewport heights from the bottom (matches sky.frag.glsl). */
export const paperFront = (paper) => paper * 1.5 - 0.25;

/**
 * One place maps scroll position to everything that isn't local to a section:
 * the sky's scene values, the ship's clock, the active section and day/night.
 * Measured from the DOM on every ScrollTrigger refresh; evaluated every frame.
 */
export function createChoreo() {
	let m = null;

	function measure() {
		const vh = window.innerHeight;
		const y0 = window.scrollY;
		const box = {};
		for (const s of sections) {
			const el = document.getElementById(s.id);
			if (!el) continue;
			const r = el.getBoundingClientRect();
			box[s.id] = { top: r.top + y0, h: el.offsetHeight };
		}
		const f = document.querySelector('footer.foot');
		m = { vh, box, foot: f ? f.getBoundingClientRect().top + y0 : 0 };
	}

	ScrollTrigger.addEventListener('refresh', measure);
	measure();

	let lastSection = -1;

	function update() {
		if (!m) return;
		const { vh, box } = m;
		const y = window.scrollY;
		const top = (id) => box[id]?.top ?? 0;
		const bot = (id) => (box[id] ? box[id].top + box[id].h : 0);

		// ---- sky
		const sky = skyBus.sky;
		if (sky) {
			const s = sky.state;
			const heroPin = Math.max(bot('heading') - vh - top('heading'), 1);
			s.dive = smooth(0.1 * vh, heroPin + 0.05 * vh, y - top('heading'));
			s.planetOn = 1 - lin(heroPin, heroPin + 0.3 * vh, y - top('heading'));

			const bIn = smooth(top('bearing') - 0.75 * vh, top('bearing') - 0.1 * vh, y);
			const bOut = 1 - smooth(bot('bearing') - 0.95 * vh, bot('bearing') - 0.35 * vh, y);
			s.globeOn = bIn * bOut;
			s.ship = lin(top('bearing') - 0.6 * vh, bot('bearing') - 0.4 * vh, y);

			const nightPin = Math.max(bot('night') - vh - top('night'), 1);
			const np = lin(0, nightPin, y - top('night'));
			s.trailsOn = smooth(top('night') - 0.6 * vh, top('night') - 0.05 * vh, y) * (1 - smooth(bot('night') - 0.7 * vh, bot('night') - 0.1 * vh, y));
			s.trailSpan = np * 2.36; // nine hours at fifteen degrees an hour

			s.dawn = smooth(top('signals') - 0.2 * vh, top('landfall') + 0.55 * vh, y);
			s.paper = lin(top('landfall') + 0.55 * vh, top('landfall') + 1.45 * vh, y);
			s.starsOn = 1;
		}

		// ---- ship's clock: keyed to section tops, and to the pinned night log
		const nightPin = Math.max(bot('night') - vh - top('night'), 1);
		const keys = [
			[top('heading'), 20 * 60],
			[top('hand-off') - 0.3 * vh, 20 * 60 + 10],
			[top('instruments') - 0.3 * vh, 20 * 60 + 20],
			[top('bearing') - 0.3 * vh, 20 * 60 + 40],
			[top('night'), NIGHT_START],
			[top('night') + nightPin, NIGHT_END],
			[top('signals') - 0.2 * vh, 30 * 60 + 30],
			[top('charter') - 0.3 * vh, 31 * 60 + 15],
			[top('landfall') + 1.45 * vh, 32 * 60]
		];
		let clock = keys[0][1];
		for (let i = 0; i < keys.length - 1; i++) {
			const [ya, ta] = keys[i];
			const [yb, tb] = keys[i + 1];
			if (y >= ya) clock = ta + (tb - ta) * lin(ya, yb, y);
		}
		const c = Math.floor(clock);
		if (c !== ui.clock) ui.clock = c;

		// ---- active section
		let idx = 0;
		for (let i = 0; i < sections.length; i++) {
			if (y + vh * 0.4 >= top(sections[i].id)) idx = i;
		}
		if (idx !== lastSection) {
			lastSection = idx;
			ui.section = idx;
		}

		// Day arrives when the dawn front has swept past the nav at the top of the view.
		const paper = sky ? sky.state.paper : lin(top('landfall') + 0.55 * vh, top('landfall') + 1.45 * vh, y);
		const day = paperFront(paper) > 0.96;
		if (day !== ui.day) ui.day = day;

		const scrolled = y > 24;
		if (scrolled !== ui.scrolled) ui.scrolled = scrolled;

		const footEl = m.foot;
		const foot = footEl ? y + vh * 0.45 > footEl : false;
		if (foot !== ui.foot) ui.foot = foot;
		// once the opaque footer fills the view there is no sky left to draw
		if (sky) sky.covered = footEl > 0 && y >= footEl;
	}

	return {
		update,
		measure,
		destroy() {
			ScrollTrigger.removeEventListener('refresh', measure);
		}
	};
}
