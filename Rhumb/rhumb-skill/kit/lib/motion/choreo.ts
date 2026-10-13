import { ScrollTrigger } from './gsap';
import { sections } from '$lib/chart';
import { ui } from '$lib/state.svelte.ts';
import { skyBus } from '$lib/gl/sky/bus';
import { cine } from './cine';

export interface ChartSection {
	id: string;
	time: number;
	role?: string;
	span?: [number, number];
	n?: string;
	type?: string;
	label?: string;
	icon?: string;
}

export interface SectionBox {
	top: number;
	h: number;
}

export interface ChoreoMeasurement {
	vh: number;
	box: Record<string, SectionBox>;
	foot: number;
}

export interface ChoreoController {
	update: () => void;
	measure: () => void;
	destroy: () => void;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const lin = (a: number, b: number, v: number): number => clamp01((v - a) / (b - a));
const smooth = (a: number, b: number, v: number): number => {
	const t = lin(a, b, v);
	return t * t * (3 - 2 * t);
};

/** Height of the dawn front, in viewport heights from the bottom (matches sky.frag.glsl). */
export const paperFront = (paper: number): number => paper * 1.5 - 0.25;

// Fifteen degrees an hour: how far the sky turns around the pole.
const TURN_PER_MIN = (15 / 60) * (Math.PI / 180);

/**
 * One place maps scroll position to everything that isn't local to a section: the sky's
 * scene values, the ship's clock, the active section, day/night and the chrome flags.
 * Measured from the DOM on every ScrollTrigger refresh; evaluated every frame.
 *
 * Driven by `sections` in chart.ts (written by roll.mjs), in page order: { id, time, role? }.
 *   time  ship's minutes; past midnight keeps counting (02:15 is 26 * 60 + 15)
 *   role  'hero'     first section: the planet, the dive and the letterbox (required)
 *         'globe'    the bearing globe and its ship sail across this section
 *         'log'      a pinned night log; needs span: [startMin, endMin], star trails turn over it
 *         'dawn'     dawn starts climbing at this section's top (default: the section before landfall)
 *         'landfall' last section: the dither resolves into paper (required)
 * The footer must be `footer.foot`.
 */
export function createChoreo(): ChoreoController {
	let m: ChoreoMeasurement | null = null;
	const secList: ChartSection[] = sections;
	const byRole = (role: string): ChartSection | undefined => secList.find((s) => s.role === role);
	const hero: ChartSection = byRole('hero') ?? secList[0];
	const globe: ChartSection | undefined = byRole('globe');
	const log: ChartSection | undefined = byRole('log');
	const landfall: ChartSection = byRole('landfall') ?? secList[secList.length - 1];
	const dawn: ChartSection = byRole('dawn') ?? secList[Math.max(secList.indexOf(landfall) - 1, 0)];

	function measure(): void {
		const vh = window.innerHeight;
		const y0 = window.scrollY;
		const box: Record<string, SectionBox> = {};
		for (const s of secList) {
			const el = document.getElementById(s.id);
			if (!el) {
				console.warn(`[choreo] no element with id "${s.id}"`);
				continue;
			}
			const r = el.getBoundingClientRect();
			box[s.id] = { top: r.top + y0, h: el.offsetHeight };
		}
		const f = document.querySelector('footer.foot');
		m = { vh, box, foot: f ? f.getBoundingClientRect().top + y0 : 0 };
	}

	ScrollTrigger.addEventListener('refresh', measure);
	measure();

	let lastSection = -1;

	function update(): void {
		if (!m) return;
		const { vh, box } = m;
		const y = window.scrollY;
		const top = (s: ChartSection): number => box[s.id]?.top ?? 0;
		const bot = (s: ChartSection): number => (box[s.id] ? box[s.id].top + box[s.id].h : 0);
		const pin = (s: ChartSection): number => Math.max(bot(s) - vh - top(s), 1);
		// The paper sweeps over landfall's pin. When landfall isn't pinned (reduced motion
		// releases it), the sweep runs while it scrolls into view instead, finishing as its top
		// reaches the top of the screen, so its text inks while it can still be read.
		const pinned = bot(landfall) - vh - top(landfall) >= 0.9 * vh;
		const paperStart = top(landfall) + (pinned ? 0.55 : -0.7) * vh;
		const paperEnd = top(landfall) + (pinned ? 1.45 : 0) * vh;
		const paperAt = (): number => lin(paperStart, paperEnd, y);
		const dawnStart = Math.min(top(dawn) - 0.2 * vh, paperStart - 0.1 * vh);

		// ---- sky
		const sky = skyBus.sky;
		if (sky) {
			const s = sky.state;
			// Under reduced motion the hero is no longer tall; keep a short stretch for the dive
			// so the page still opens on the planet instead of already past it.
			const heroPin = Math.max(pin(hero), 0.3 * vh);
			s.dive = smooth(0.1 * vh, heroPin + 0.05 * vh, y - top(hero));
			s.planetOn = 1 - lin(heroPin, heroPin + 0.3 * vh, y - top(hero));

			if (globe) {
				const gIn = smooth(top(globe) - 0.75 * vh, top(globe) - 0.1 * vh, y);
				const gOut = 1 - smooth(bot(globe) - 0.95 * vh, bot(globe) - 0.35 * vh, y);
				s.globeOn = gIn * gOut;
				s.ship = lin(top(globe) - 0.6 * vh, bot(globe) - 0.4 * vh, y);
			}

			if (log && log.span) {
				const lp = lin(0, pin(log), y - top(log));
				s.trailsOn = smooth(top(log) - 0.6 * vh, top(log) - 0.05 * vh, y) * (1 - smooth(bot(log) - 0.7 * vh, bot(log) - 0.1 * vh, y));
				s.trailSpan = lp * (log.span[1] - log.span[0]) * TURN_PER_MIN;
			}

			s.dawn = smooth(dawnStart, paperStart, y);
			s.paper = paperAt();
			s.starsOn = 1;
		}

		// ---- letterbox: the bars close as the camera starts to fall and part again as it
		// comes out of the cloud deck onto the night side
		if (!ui.reduced) {
			const hp = pin(hero);
			const hy = y - top(hero);
			cine.scroll = smooth(0.12 * vh, 0.42 * vh, hy) * (1 - smooth(hp * 0.78, hp + 0.2 * vh, hy));
		}

		// ---- ship's clock: each section's time lands just before its top; the log runs its
		// span across its pin; landfall's time lands as the paper finishes
		const keys: [number, number][] = [];
		for (const s of secList) {
			if (s === secList[0]) keys.push([top(s), s.time]);
			else if (s === log && log.span) keys.push([top(s), log.span[0]], [top(s) + pin(s), log.span[1]]);
			else if (s === landfall) keys.push([paperEnd, s.time]);
			else keys.push([top(s) - 0.3 * vh, s.time]);
		}
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
		for (let i = 0; i < secList.length; i++) {
			if (y + vh * 0.4 >= top(secList[i])) idx = i;
		}
		if (idx !== lastSection) {
			lastSection = idx;
			ui.section = idx;
		}

		// Day arrives when the dawn front has swept past the nav at the top of the view.
		const paper = sky ? sky.state.paper : paperAt();
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
		destroy(): void {
			ScrollTrigger.removeEventListener('refresh', measure);
		}
	};
}
