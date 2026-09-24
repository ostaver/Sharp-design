import { Renderer, Program, Mesh, Triangle, RenderTarget } from 'ogl';
import { glsl, fullscreenVert } from '../glsl.js';
import sceneChunk from './scene.glsl?raw';
import staticFrag from './static.frag.glsl?raw';
import plateFrag from './plate.frag.glsl?raw';

const HORIZON = 0.36;
const withScene = (src) => glsl(src.replace(/^[ \t]*#include scene[ \t]*$/m, sceneChunk));

// The engraved harbour under the footer. Two passes: the still parts of the plate are
// drawn once into a tone map (per resize); every frame the sea, sky, boat and gulls are
// added and the whole plate is engraved.
export class Plate {
	visible = false;
	enter = 0;

	constructor(canvas, { reduced = false } = {}) {
		this.canvas = canvas;
		this.reduced = reduced;
		this.time = 40; // start mid-morning: the boat is already under way
		this.frame = 0;
		this.ripples = Array.from({ length: 6 }, () => ({ x: 0, y: 0, t: 99, s: 0 }));
		this.rippleHead = 0;
		this.#build();
		this.resize();

		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(canvas.parentElement);

		this.onDown = this.onDown.bind(this);
		canvas.closest('footer')?.addEventListener('pointerdown', this.onDown);

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
		const tri = new Triangle(gl);

		this.staticUniforms = {
			uRes: { value: [1, 1] },
			uWin: { value: [0, 0, 1.6, 1] }
		};
		this.staticMesh = new Mesh(gl, {
			geometry: tri,
			program: new Program(gl, {
				vertex: fullscreenVert,
				fragment: withScene(staticFrag),
				uniforms: this.staticUniforms,
				depthTest: false,
				depthWrite: false
			})
		});

		this.rt = new RenderTarget(gl, {
			width: 4,
			height: 4,
			depth: false,
			minFilter: gl.NEAREST,
			magFilter: gl.NEAREST
		});

		this.uniforms = {
			uRes: { value: [1, 1] },
			uWin: { value: [0, 0, 1.6, 1] },
			uPPW: { value: 900 },
			uTime: { value: 0 },
			uEnter: { value: 0 },
			uStatic: { value: this.rt.texture },
			uBoat: { value: 0.3 },
			uRipples: { value: new Array(24).fill(0) },
			uDpr: { value: 1 }
		};
		this.mesh = new Mesh(gl, {
			geometry: tri,
			program: new Program(gl, {
				vertex: fullscreenVert,
				fragment: withScene(plateFrag),
				uniforms: this.uniforms,
				depthTest: false,
				depthWrite: false
			})
		});
	}

	resize() {
		if (this.lost) return;
		const host = this.canvas.parentElement;
		const cw = host.clientWidth;
		const ch = host.clientHeight;
		if (!cw || !ch) return;
		// Fine lines need real pixels, but the plate is large: cap the density.
		const dpr = Math.min(window.devicePixelRatio || 1, cw * ch > 1.6e6 ? 1.35 : 1.6);
		const bw = Math.round(cw * dpr);
		const bh = Math.round(ch * dpr);
		if (bw === this.bw && bh === this.bh) return;
		this.bw = bw;
		this.bh = bh;
		this.cssW = cw;
		this.cssH = ch;
		this.canvas.width = bw;
		this.canvas.height = bh;
		this.canvas.style.width = `${cw}px`;
		this.canvas.style.height = `${ch}px`;
		this.renderer.width = bw;
		this.renderer.height = bh;

		// Frame the world: landscape shows the whole bay; portrait closes in on the headland.
		const A = cw / ch;
		let winW, winH, x0, y0;
		if (A >= 1.25) {
			winW = 1.6;
			winH = winW / A;
			y0 = HORIZON - 0.36 * winH;
			x0 = 0;
		} else {
			winH = A < 0.8 ? 1.3 : 1.18;
			winW = A * winH;
			x0 = Math.max(0, Math.min(1.6 - winW, 1.37 - winW * 0.56));
			y0 = HORIZON - 0.3 * winH;
		}
		this.win = [x0, y0, winW, winH];

		this.staticUniforms.uRes.value = [bw, bh];
		this.staticUniforms.uWin.value = this.win;
		this.uniforms.uRes.value = [bw, bh];
		this.uniforms.uWin.value = this.win;
		this.uniforms.uPPW.value = bw / winW;
		this.uniforms.uDpr.value = bw / cw;

		this.rt.setSize(bw, bh);
		this.renderer.render({ scene: this.staticMesh, target: this.rt });
		this.dirty = true;
	}

	onDown(e) {
		if (e.target.closest('a, button')) return;
		const r = this.canvas.getBoundingClientRect();
		const u = (e.clientX - r.left) / r.width;
		const v = 1 - (e.clientY - r.top) / r.height;
		const x = this.win[0] + u * this.win[2];
		const y = this.win[1] + v * this.win[3];
		if (y > HORIZON - 0.004) return;
		const rp = this.ripples[this.rippleHead];
		rp.x = x;
		rp.y = y;
		rp.t = 0;
		rp.s = 1;
		this.rippleHead = (this.rippleHead + 1) % this.ripples.length;
	}

	render(dt) {
		if (this.lost || !this.visible || !this.bw) return;
		// The plate moves slowly; every other frame is plenty and spares the GPU.
		this.frame++;
		const settled = this.enter >= 1 && !this.reduced;
		if (settled && this.frame % 2 === 1) {
			this.acc = (this.acc || 0) + dt;
			return;
		}
		const step = dt + (this.acc || 0);
		this.acc = 0;
		if (!this.reduced) this.time += step;

		const u = this.uniforms;
		u.uTime.value = this.time;
		u.uEnter.value = this.reduced ? 1 : this.enter;
		// the sloop crosses the bay in a few minutes, then comes round again
		u.uBoat.value = 0.08 + ((this.time / 260) % 1) * 0.86;
		const rv = u.uRipples.value;
		this.ripples.forEach((r, i) => {
			r.t += step;
			rv[i * 4] = r.x;
			rv[i * 4 + 1] = r.y;
			rv[i * 4 + 2] = r.t;
			rv[i * 4 + 3] = r.t < 6 ? r.s : 0;
		});
		this.renderer.render({ scene: this.mesh });
	}

	destroy() {
		this.ro?.disconnect();
		this.canvas.closest('footer')?.removeEventListener('pointerdown', this.onDown);
		this.canvas.removeEventListener('webglcontextlost', this.onLost);
		this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
		this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
	}
}
