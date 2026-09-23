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

// The fixed night sky behind the whole page. One fragment shader, drawn into a buffer
// with one texel per dither pixel; the browser scales it up with `image-rendering: pixelated`.
export class Sky {
	/** Scroll-driven scene values, tweened by GSAP from the sections. */
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

	constructor(canvas, { reduced = false, cssCell = 2 } = {}) {
		this.canvas = canvas;
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
		this.renderer = new Renderer({
			canvas: this.canvas,
			webgl: 2,
			dpr: 1,
			alpha: false,
			depth: false,
			antialias: false,
			powerPreference: 'high-performance'
		});
		const gl = (this.gl = this.renderer.gl);
		gl.clearColor(0.0196, 0.0196, 0.0275, 1);

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
			uGlobe: { value: [0, 0, 1] },
			uGlobeOn: { value: 0 },
			uGlobeSpin: { value: 0 },
			uShip: { value: 0 },
			uPole: { value: [0, 0] },
			uTrailsOn: { value: 0 },
			uTrailSpan: { value: 0 },
			uStarsOn: { value: 1 },
			uDawn: { value: 0 },
			uPaper: { value: 0 },
			uTrail: { value: trail },
			uTrailDir: { value: trailDir },
			uMouse: { value: [0, 0, 0] }
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
		this.dirty = true;
	}

	#layout() {
		const W = this.vw;
		const H = this.vh;
		const portrait = H > W;
		const s = Math.max(Math.min(W, H * 1.6), H * 0.72);
		this.planetBase = portrait
			? { x: W + 0.16 * s, y: -0.38 * s, r: 0.8 * s }
			: { x: W + 0.13 * s, y: -0.4 * s, r: 0.78 * s };
		const gr = portrait ? Math.min(W * 0.46, H * 0.3) : Math.min(W * 0.225, H * 0.35);
		this.globe = portrait ? { x: W * 0.62, y: H * 0.7, r: gr } : { x: W * 0.75, y: H * 0.47, r: gr };
		this.pole = portrait ? { x: W * 0.62, y: H * 1.02 } : { x: W * 0.74, y: H * 1.08 };
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
		// The camera falls toward the limb: the disc rises, swells and sweeps off to the left.
		u.uPlanet.value = [pb.x - e * 0.2 * this.vw, pb.y + e * (this.vh * 1.25 + pb.r * 0.55), pb.r * (1 + 0.95 * e)];
		u.uPlanetOn.value = s.planetOn;
		u.uDive.value = dive;
		u.uSpin.value = this.time * 0.012 + dive * 0.6;

		// The globe turns to keep the ship in view, so the rhumb line always runs across the front.
		u.uGlobe.value = [this.globe.x, this.globe.y, this.globe.r];
		u.uGlobeOn.value = s.globeOn;
		const latS = -1.15 + 2.3 * s.ship;
		const lonS = Math.tan((47 * Math.PI) / 180) * Math.atanh(Math.sin(latS));
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
		this.dirty = false;
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
		const tb = Math.tan((47 * Math.PI) / 180);
		const lon = tb * Math.atanh(Math.sin(lat));
		const s = [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
		const M = mul(mul(rotY(spin), rotX(0.38)), rotZ(-0.2));
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
