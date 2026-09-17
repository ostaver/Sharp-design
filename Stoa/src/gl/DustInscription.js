import { Renderer, Geometry, Program, Mesh, Transform } from 'ogl';

/*
  The dust that the wind stripped from the hero temple returns at the end of the page and
  settles into an inscription. Text is rasterised off-screen, stochastically sampled into
  target points, and a few thousand grains spring toward them. The cursor is a chisel of
  wind: grains flee it and settle back; a click strikes the stone.
  Every grain is printed twice — key ink and an out-of-register highlight ink.
*/

const vertex = /* glsl */ `
attribute vec2 position;
attribute float aSeed;
attribute float aKind;
uniform vec2 uRes;
uniform vec2 uOffset;
uniform float uSize, uTime, uDpr;
varying float vA;

float h(float n) { return fract(sin(n) * 43758.5453); }

void main() {
  vec2 p = position + uOffset;
  // breathing stone: a sub-pixel tremor that never lets the letters sit perfectly still
  p += vec2(sin(uTime * 1.3 + aSeed * 40.0), cos(uTime * 1.1 + aSeed * 31.0)) * 0.35;
  gl_Position = vec4(p.x / uRes.x * 2.0 - 1.0, 1.0 - p.y / uRes.y * 2.0, 0.0, 1.0);
  float flick = h(aSeed * 91.7 + floor(uTime * 12.0) * 0.173);
  float size = mix(0.7, 1.0, aKind) * (0.75 + 0.5 * h(aSeed * 13.1));
  gl_PointSize = max(1.0, uSize * size * uDpr);
  vA = mix(0.32, 1.0, aKind) * (0.72 + 0.28 * flick);
}`;

const fragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
varying float vA;
void main() {
  gl_FragColor = vec4(uColor, vA * uAlpha);
}`;

const hexToVec = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export class DustInscription {
  constructor(canvas, { count = 7000, font = 'Marcellus', key = '#E6E2FB', ink = '#F6D0EA' } = {}) {
    this.canvas = canvas;
    this.count = count;
    this.font = font;
    this.text = '';
    this.assemble = 0;
    this.pointer = { x: -9999, y: -9999, on: false };
    this.running = false;
    this.start0 = performance.now();

    this.renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2), alpha: true, premultipliedAlpha: false, antialias: false });
    const gl = (this.gl = this.renderer.gl);
    gl.clearColor(0, 0, 0, 0);

    // simulation state (CSS px)
    this.pos = new Float32Array(count * 2);
    this.vel = new Float32Array(count * 2);
    this.target = new Float32Array(count * 2);
    this.scatter = new Float32Array(count * 2);
    this.home = new Float32Array(count * 2);
    this.delay = new Float32Array(count);
    this.kind = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) seed[i] = Math.random();
    this.seed = seed;

    this.geometry = new Geometry(gl, {
      position: { size: 2, data: this.pos, usage: gl.DYNAMIC_DRAW },
      aSeed: { size: 1, data: seed },
      aKind: { size: 1, data: this.kind, usage: gl.DYNAMIC_DRAW },
    });

    const make = (color, offset, alpha, order) => {
      const program = new Program(gl, {
        vertex,
        fragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uRes: { value: [1, 1] },
          uOffset: { value: offset },
          uSize: { value: 2 },
          uTime: { value: 0 },
          uDpr: { value: this.renderer.dpr },
          uColor: { value: hexToVec(color) },
          uAlpha: { value: alpha },
        },
      });
      const mesh = new Mesh(gl, { mode: gl.POINTS, geometry: this.geometry, program });
      mesh.renderOrder = order;
      mesh.frustumCulled = false;
      return mesh;
    };
    this.scene = new Transform();
    this.hi = make(ink, [2.6, 2.1], 0.95, 0);
    this.key = make(key, [0, 0], 1, 1);
    this.hi.setParent(this.scene);
    this.key.setParent(this.scene);

    this.sampler = document.createElement('canvas');
    this.sctx = this.sampler.getContext('2d', { willReadFrequently: true });

    this.resize();
    this._tick = this.tick.bind(this);
  }

  /* ───────── layout ───────── */

  resize() {
    // measure the host, not the canvas: the renderer writes an inline pixel size onto the canvas
    const r = (this.canvas.parentElement ?? this.canvas).getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width));
    const h = Math.max(2, Math.round(r.height));
    if (w === this.w && h === this.h) return;
    const first = !this.w;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h);
    const size = Math.max(1.6, Math.min(2.6, w / 520));
    [this.hi, this.key].forEach((m) => {
      m.program.uniforms.uRes.value = [w, h];
      m.program.uniforms.uSize.value = size;
    });
    for (let i = 0; i < this.count; i++) {
      // grains waiting on the wind, off to the east of the stone
      this.scatter[i * 2] = w * (1.02 + Math.random() * 0.9);
      this.scatter[i * 2 + 1] = h * (-0.6 + Math.random() * 2.2);
      this.home[i * 2] = Math.random() * w;
      this.home[i * 2 + 1] = Math.random() * h;
      if (first) {
        this.pos[i * 2] = this.scatter[i * 2];
        this.pos[i * 2 + 1] = this.scatter[i * 2 + 1];
      }
    }
    if (this.text) this.setText(this.text, true);
  }

  /* ───────── text → targets ───────── */

  setText(text, force = false) {
    const t = (text || '').toUpperCase();
    if (t === this.text && !force) return;
    this.text = t;
    const { w, h, sctx: ctx, sampler } = this;
    const scale = 0.5; // sample at half resolution — plenty for stipple
    const sw = Math.max(2, Math.round(w * scale));
    const sh = Math.max(2, Math.round(h * scale));
    sampler.width = sw;
    sampler.height = sh;
    ctx.clearRect(0, 0, sw, sh);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    let size = sh * 0.78;
    ctx.font = `${size}px ${this.font}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(size * 0.04)}px`;
    const m = ctx.measureText(t);
    const maxW = sw * 0.9;
    if (m.width > maxW) {
      size *= maxW / m.width;
      ctx.font = `${size}px ${this.font}`;
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(size * 0.04)}px`;
    }
    const mm = ctx.measureText(t);
    const capH = mm.actualBoundingBoxAscent || size * 0.7;
    ctx.fillText(t, sw / 2, sh / 2 + capH / 2);

    const data = ctx.getImageData(0, 0, sw, sh).data;
    const filled = [];
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        if (data[(y * sw + x) * 4 + 3] > 140) filled.push(x, y);
      }
    }
    const pixels = filled.length / 2;
    // one grain per ~1.5 sampled pixels at most, the rest drift as ambient dust
    const textCount = Math.min(this.count, Math.floor(pixels / 1.5));
    const order = new Uint32Array(this.count);
    for (let i = 0; i < this.count; i++) order[i] = i;
    for (let i = this.count - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
    for (let k = 0; k < this.count; k++) {
      const i = order[k];
      if (k < textCount && pixels > 0) {
        const p = ((Math.random() * pixels) | 0) * 2;
        this.target[i * 2] = (filled[p] + Math.random()) / scale;
        this.target[i * 2 + 1] = (filled[p + 1] + Math.random()) / scale;
        this.kind[i] = 1;
        // the wind returns from the east: right-hand letters settle first
        this.delay[i] = (1 - this.target[i * 2] / w) * 0.45 + Math.random() * 0.12;
      } else {
        this.target[i * 2] = -1;
        this.kind[i] = 0;
        this.delay[i] = Math.random() * 0.5;
      }
    }
    this.geometry.attributes.aKind.needsUpdate = true;
  }

  setInk(hex) {
    this.hi.program.uniforms.uColor.value = hexToVec(hex);
  }

  setAssemble(v) {
    this.assemble = v;
  }

  setPointer(x, y, on = true) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.on = on;
  }

  strike(x, y, power = 1) {
    const R = 240 * power;
    for (let i = 0; i < this.count; i++) {
      const dx = this.pos[i * 2] - x;
      const dy = this.pos[i * 2 + 1] - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < R) {
        const f = (1 - d / R) * 16 * power;
        this.vel[i * 2] += (dx / d) * f;
        this.vel[i * 2 + 1] += (dy / d) * f - f * 0.3;
      }
    }
  }

  // a gust that throws every grain back to the east
  gust() {
    for (let i = 0; i < this.count; i++) {
      this.vel[i * 2] += 10 + Math.random() * 30;
      this.vel[i * 2 + 1] += (Math.random() - 0.6) * 12;
    }
  }

  /* ───────── loop ───────── */

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  tick(now) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this._tick);
    const dt = Math.min((now - this.last) / 16.667, 3);
    this.last = now;
    const t = (now - this.start0) / 1000;

    const { pos, vel, target, scatter, home, delay, kind, count, w, h } = this;
    const px = this.pointer.x;
    const py = this.pointer.y;
    const pon = this.pointer.on;
    const R = Math.max(70, w * 0.07);
    const R2 = R * R;
    const a = this.assemble;
    const spring = 0.05 * dt;
    const damp = Math.pow(0.86, dt);

    for (let i = 0; i < count; i++) {
      const i2 = i * 2;
      let tx;
      let ty;
      if (kind[i] > 0.5) {
        // settle from the scattered position as the section assembles
        let s = Math.min(Math.max((a * 1.5 - delay[i]) / 0.55, 0), 1);
        s = s * s * (3 - 2 * s);
        tx = scatter[i2] + (target[i2] - scatter[i2]) * s;
        ty = scatter[i2 + 1] + (target[i2 + 1] - scatter[i2 + 1]) * s;
      } else {
        // ambient grains drift like motes in a sunbeam
        const s = Math.min(Math.max(a * 1.4 - delay[i], 0), 1);
        const hx = home[i2] + Math.sin(t * 0.21 + this.seed[i] * 40) * 26;
        const hy = home[i2 + 1] + Math.cos(t * 0.17 + this.seed[i] * 30) * 18;
        tx = scatter[i2] + (hx - scatter[i2]) * s;
        ty = scatter[i2 + 1] + (hy - scatter[i2 + 1]) * s;
      }
      let ax = (tx - pos[i2]) * spring;
      let ay = (ty - pos[i2 + 1]) * spring;
      if (pon) {
        const dx = pos[i2] - px;
        const dy = pos[i2 + 1] - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * (1 - d / R) * 3.2 * dt;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      vel[i2] = vel[i2] * damp + ax;
      vel[i2 + 1] = vel[i2 + 1] * damp + ay;
      pos[i2] += vel[i2] * dt;
      pos[i2 + 1] += vel[i2 + 1] * dt;
    }
    this.geometry.attributes.position.needsUpdate = true;

    this.hi.program.uniforms.uTime.value = t;
    this.key.program.uniforms.uTime.value = t;
    this.renderer.render({ scene: this.scene });
  }

  dispose() {
    this.stop();
    this.geometry.remove?.();
    this.hi.program.remove?.();
    this.key.program.remove?.();
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
