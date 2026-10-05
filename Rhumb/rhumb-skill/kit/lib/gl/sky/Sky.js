import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { glsl, fullscreenVert } from '../glsl.js';
import frag from './sky.frag.glsl?raw';

const TRAIL = 16;

// Row-major equivalents of the GLSL rotation helpers in common.glsl.
const rotY = (a) => {
	const c = Math.cos(a), s = Math.sin(a);
	return [[c, 0, s], [0, 1, 0], [-s, 0, c]];
};
const rotX = (a) => {
	const c = Math.cos(a), s = Math.sin(a);
	return [[1, 0, 0], [0, c, -s], [0, s, c]];
};
const rotZ = (a) => {
	const c = Math.cos(a), s = Math.sin(a);
	return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};
const mul = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));

// '#rrggbb' → [r, g, b] in 0..1. The shader writes these straight to the screen, so they
// are the same sRGB values as the CSS tokens.
const rgb = (hex) => {
	const m = /^#?([0-9a-f]{6})$/i.exec(hex);
	if (!m) throw new Error(`sky: bad colour "${hex}"`);
	const n = parseInt(m[1], 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const ramp = (list, len, name) => {
	if (!Array.isArray(list) || list.length !== len) throw new Error(`sky: palette.${name} needs ${len} colours`);
	return list.flatMap(rgb); // OGL resolves `name[0]` array uniforms from plain flat arrays
};

// The fixed night sky behind the whole page. One fragment shader, drawn into a buffer
// with one texel per dither pixel; the browser scales it up with `image-rendering: pixelated`.
export class Sky {
	/** Scroll-driven scene values, written every frame by choreo.js (intro by the preloader). */
	state = {
		intro: 0,
		planetOn: 1,
		dive: 0,
		globeOn: 0,
		ship: 0,
		trailsOn: 0,
		trailSpan: 0,
		starsOn: 1,
		dawn: 0,
		paper: 0
	};

	/**
	 * Everything visual comes from the build's rolled sky config (src/lib/sky.config.js,
	 * written by roll.mjs). Nothing here has a default look of its own.
	 * @param {HTMLCanvasElement} canvas
	 * @param {object} opts
	 *   palette  { bg, grain, white, paper, paperGrain, body: [6], rim: [5], dawn: [8] } as '#rrggbb'
	 *   bearing  the course in degrees clockwise from north (the brand's signature bearing)
	 *   cssCell  CSS px per dither pixel (2 or 3)
	 *   layout   { planet: 'left'|'right', planetScale, globe: 'left'|'right' }
	 *   scene    { grid (deg), loxodromes (1..8), stars (density ×), meteorEvery (s), band: [slope, offset], tilt: [x, z] (rad) }
	 *   reduced  freeze time (prefers-reduced-motion)
	 */
	constructor(canvas, { palette, bearing, cssCell, layout, scene, reduced = false } = {}) {
		const missing = Object.entries({ palette, bearing, cssCell, layout, scene })
			.filter(([, v]) => v == null)
			.map(([k]) => k);
		if (missing.length) throw new Error(`sky: sky.config.js is missing ${missing.join(', ')} (run roll.mjs)`);
		this.canvas = canvas;
		this.palette = palette;
		this.bearing = (bearing * Math.PI) / 180;
		this.layout = layout;
		this.scene = scene;
		this.reduced = reduced;
		this.cssCell = cssCell;
		this.visible = true;
		this.time = 0;
		this.trail = Array.from({ length: TRAIL }, () => ({ x: -9999, y: -9999, t: -99, speed: 0, dx: 0, dy: 0 }));
		this.trailHead = 0;
		this.pointer = { x: -9999, y: -9999, on: 0, lastT: 0 };

		this.#build();
		this.resize();

		this.onPointer = this.onPointer.bind(this);
		this.onLeave = () => (this.pointer.on = 0);
		window.addEventListener('pointermove', this.onPointer, { passive: true });
		document.documentElement.addEventListener('pointerleave', this.onLeave);

		this.onLost = (e) => {
			e.preventDefault();
			this.lost = true;
		};
		this.onRestored = () => {
			this.lost = false;
			this.#build();
			this.resize();
		};
		canvas.addEventListener('webglcontextlost', this.onLost);
		canvas.addEventListener('webglcontextrestored', this.onRestored);
	}

	#build() {
		// No powerPreference: asking for the discrete GPU forces a GPU switch on dual-GPU
		// laptops, which is itself a hitch.
		this.renderer = new Renderer({
			canvas: this.canvas,
			webgl: 2,
			dpr: 1,
			alpha: false,
			depth: false,
			antialias: false
		});
		const gl = (this.gl = this.renderer.gl);
		const p = this.palette;
		const bg = rgb(p.bg);
		gl.clearColor(bg[0], bg[1], bg[2], 1);

		// OGL only resolves `name[0]` array uniforms from plain arrays, not typed arrays.
		const trail = new Array(TRAIL * 4).fill(0);
		const trailDir = new Array(TRAIL * 2).fill(0);
		this.uniforms = {
			uRes: { value: [1, 1] },
			uView: { value: [1, 1] },
			uScale: { value: 2 },
			uTime: { value: 0 },
			uIntro: { value: 0 },
			uPlanet: { value: [0, 0, 1] },
			uPlanetOn: { value: 1 },
			uDive: { value: 0 },
			uSpin: { value: 0 },
			uSide: { value: this.layout.planet === 'left' ? -1 : 1 },
			uGlobe: { value: [0, 0, 1] },
			uGlobeOn: { value: 0 },
			uGlobeSpin: { value: 0 },
			uShip: { value: 0 },
			uBearing: { value: this.bearing },
			uTilt: { value: this.scene.tilt },
			uGrid: { value: (this.scene.grid * Math.PI) / 180 },
			uLoxo: { value: Math.min(8, Math.max(1, Math.round(this.scene.loxodromes))) },
			uPole: { value: [0, 0] },
			uTrailsOn: { value: 0 },
			uTrailSpan: { value: 0 },
			uStarsOn: { value: 1 },
			uStarDensity: { value: this.scene.stars },
			uMeteor: { value: this.scene.meteorEvery },
			uBand: { value: this.scene.band },
			uDawn: { value: 0 },
			uPaper: { value: 0 },
			uTrail: { value: trail },
			uTrailDir: { value: trailDir },
			uMouse: { value: [0, 0, 0] },
			uBg: { value: bg },
			uGrain: { value: rgb(p.grain) },
			uWhite: { value: rgb(p.white) },
			uPaperCol: { value: rgb(p.paper) },
			uPaperGrain: { value: rgb(p.paperGrain) },
			uBody: { value: ramp(p.body, 6, 'body') },
			uRim: { value: ramp(p.rim, 5, 'rim') },
			uDawnRamp: { value: ramp(p.dawn, 8, 'dawn') }
		};
		this.trailBuf = trail;
		this.trailDirBuf = trailDir;

		const program = new Program(gl, {
			vertex: fullscreenVert,
			fragment: glsl(frag),
			uniforms: this.uniforms,
			depthTest: false,
			depthWrite: false
		});
		this.mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
	}

	resize() {
		const probe = document.getElementById('lvh-probe');
		const w = window.innerWidth;
		const h = probe ? probe.offsetHeight || window.innerHeight : window.innerHeight;
		const dpr = Math.min(window.devicePixelRatio || 1, 3);
		const cell = Math.max(1, Math.round(this.cssCell * dpr));
		const bw = Math.ceil((w * dpr) / cell);
		const bh = Math.ceil((h * dpr) / cell);
		this.scale = cell / dpr;
		this.vw = w;
		this.vh = h;

		this.canvas.width = bw;
		this.canvas.height = bh;
		this.canvas.style.width = `${(bw * cell) / dpr}px`;
		this.canvas.style.height = `${(bh * cell) / dpr}px`;
		this.renderer.width = bw;
		this.renderer.height = bh;

		const u = this.uniforms;
		u.uRes.value = [bw, bh];
		u.uView.value = [bw * this.scale, bh * this.scale];
		u.uScale.value = this.scale;
		this.#layout();
	}

	#layout() {
		const W = this.vw;
		const H = this.vh;
		const portrait = H > W;
		const s = Math.max(Math.min(W, H * 1.6), H * 0.72);
		const left = this.layout.planet === 'left';
		const k = this.layout.planetScale;
		// The planet is a huge limb rising from a bottom corner, mostly off screen.
		const px = (portrait ? 0.16 : 0.13) * s;
		this.planetBase = {
			x: left ? -px : W + px,
			y: (portrait ? -0.38 : -0.4) * s,
			r: (portrait ? 0.8 : 0.78) * s * k
		};
		// The globe sits on its own side; copy goes on the other. The pole sits just above it.
		const g = this.layout.globe === 'left' ? -1 : 1;
		const gx = (f) => W * (0.5 + g * (f - 0.5));
		const gr = portrait ? Math.min(W * 0.46, H * 0.3) : Math.min(W * 0.225, H * 0.35);
		this.globe = portrait ? { x: gx(0.62), y: H * 0.7, r: gr } : { x: gx(0.75), y: H * 0.47, r: gr };
		this.pole = portrait ? { x: gx(0.62), y: H * 1.02 } : { x: gx(0.74), y: H * 1.08 };
	}

	onPointer(e) {
		if (e.pointerType === 'touch') return;
		const now = performance.now() / 1000;
		const x = e.clientX;
		const y = this.vh - e.clientY;
		const p = this.pointer;
		const dt = Math.max(now - p.lastT, 1 / 240);
		const dx = x - p.x;
		const dy = y - p.y;
		const dist = Math.hypot(dx, dy);
		p.on = 1;
		if (now - p.lastT < 1 / 60 && dist < 6) return;
		const speed = p.lastT > 0 && dist < 400 ? dist / dt : 0;
		p.x = x;
		p.y = y;
		p.lastT = now;
		const slot = this.trail[this.trailHead];
		slot.x = x;
		slot.y = y;
		slot.t = now;
		slot.speed = speed;
		slot.dx = dist > 0 ? dx / dist : 0;
		slot.dy = dist > 0 ? dy / dist : 0;
		this.trailHead = (this.trailHead + 1) % TRAIL;
	}

	/** Called by the shared GSAP ticker; `dt` in seconds. */
	render(dt) {
		if (this.lost || !this.visible || this.covered) return;
		const u = this.uniforms;
		const s = this.state;
		const still = this.reduced;

		if (!still) this.time += dt;
		u.uTime.value = this.time;
		u.uIntro.value = s.intro;

		const dive = s.dive;
		const e = dive * dive * (3 - 2 * dive);
		const pb = this.planetBase;
		// The camera falls toward the limb: the disc rises, swells and sweeps in toward the middle.
		const side = u.uSide.value;
		u.uPlanet.value = [pb.x - side * e * 0.2 * this.vw, pb.y + e * (this.vh * 1.25 + pb.r * 0.55), pb.r * (1 + 0.95 * e)];
		u.uPlanetOn.value = s.planetOn;
		u.uDive.value = dive;
		u.uSpin.value = this.time * 0.012 + dive * 0.6;

		// The globe turns to keep the ship in view, so the rhumb line always runs across the front.
		u.uGlobe.value = [this.globe.x, this.globe.y, this.globe.r];
		u.uGlobeOn.value = s.globeOn;
		const latS = -1.15 + 2.3 * s.ship;
		const lonS = Math.tan(this.bearing) * Math.atanh(Math.sin(latS));
		u.uGlobeSpin.value = lonS - 0.3 + Math.sin(this.time * 0.15) * 0.04;
		u.uShip.value = s.ship;

		u.uPole.value = [this.pole.x, this.pole.y];
		u.uTrailsOn.value = s.trailsOn;
		u.uTrailSpan.value = s.trailSpan;
		u.uStarsOn.value = s.starsOn;
		u.uDawn.value = s.dawn;
		u.uPaper.value = s.paper;

		// Pointer trail → uniforms (ages relative to now).
		const now = performance.now() / 1000;
		for (let i = 0; i < TRAIL; i++) {
			const p = this.trail[i];
			const age = still ? 99 : now - p.t;
			this.trailBuf[i * 4] = p.x;
			this.trailBuf[i * 4 + 1] = p.y;
			this.trailBuf[i * 4 + 2] = age;
			this.trailBuf[i * 4 + 3] = p.speed;
			this.trailDirBuf[i * 2] = p.dx;
			this.trailDirBuf[i * 2 + 1] = p.dy;
		}
		u.uMouse.value = [this.pointer.x, this.pointer.y, this.pointer.on];

		this.renderer.render({ scene: this.mesh });
	}

	/**
	 * Where the ship on the bearing globe is, in CSS px from the top-left of the viewport.
	 * Mirrors the rotation in sky.frag.glsl so DOM labels can ride along with it.
	 */
	shipScreen() {
		const u = this.uniforms;
		const [gx, gy, R] = u.uGlobe.value;
		const spin = u.uGlobeSpin.value;
		const lat = -1.15 + 2.3 * u.uShip.value;
		const tb = Math.tan(this.bearing);
		const lon = tb * Math.atanh(Math.sin(lat));
		const s = [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
		const [tx, tz] = this.scene.tilt;
		const M = mul(mul(rotY(spin), rotX(tx)), rotZ(tz));
		// view = transpose(M) * s
		const v = [0, 1, 2].map((i) => M[0][i] * s[0] + M[1][i] * s[1] + M[2][i] * s[2]);
		return { x: gx + v[0] * R, y: this.vh - (gy + v[1] * R), visible: v[2] > 0, r: R, cx: gx, cy: this.vh - gy };
	}

	destroy() {
		window.removeEventListener('pointermove', this.onPointer);
		document.documentElement.removeEventListener('pointerleave', this.onLeave);
		this.canvas.removeEventListener('webglcontextlost', this.onLost);
		this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
		this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
	}
}
