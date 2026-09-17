import { Renderer, Program, Mesh, Plane, Texture, Transform } from 'ogl';
import { riso } from './riso.glsl.js';

/*
  One fixed, transparent OGL canvas that re-prints every <RisoImage> on the page.
  Each DOM element is mirrored by a plane placed in CSS pixels every frame, so images
  scroll, pin and transform with the layout while being inked, stippled and bent by
  scroll velocity in the GPU.
*/

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform vec4 uRect;      // x, y, w, h in CSS px
uniform vec2 uViewport;  // CSS px
uniform float uBend;
uniform float uHover;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec2 p = position.xy + 0.5;
  float x = uRect.x + p.x * uRect.z;
  float y = uRect.y + (1.0 - p.y) * uRect.w;
  // entasis bend: planes bow with scroll velocity like a column's swelling
  y += sin(p.x * 3.14159) * uBend;
  x += sin(p.y * 3.14159) * uBend * 0.15;
  vec2 clip = vec2(x / uViewport.x * 2.0 - 1.0, 1.0 - y / uViewport.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
}`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uImage, uPlane, uMouse;
uniform float uTime, uSeed, uHover, uGrain, uMisreg, uDensity, uReveal, uLoaded, uZoom, uSmear, uPull, uPixel, uShape, uRaw;
uniform vec4 uInset; // top, right, bottom, left — fractions of the plate held shut
uniform vec2 uFade;  // top, bottom — CSS px dissolved into the page
uniform vec3 uInk;
varying vec2 vUv;
${riso}

vec2 coverUv(vec2 uv) {
  vec2 ratio = vec2(
    min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0),
    min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0)
  );
  return vec2(uv.x * ratio.x + (1.0 - ratio.x) * 0.5, uv.y * ratio.y + (1.0 - ratio.y) * 0.5);
}

float toneAt(vec2 uv) {
  float l = luma(texture2D(tMap, uv).rgb);
  return l;
}

// silhouette in CSS px: 0 rectangle, 1 round-headed arch, 2 pill
float shapeSdf() {
  vec2 p = vUv * uPlane;
  if (uShape > 1.5) {
    float r = min(uPlane.x, uPlane.y) * 0.5;
    vec2 q = abs(p - uPlane * 0.5) - (uPlane * 0.5 - r);
    return length(max(q, 0.0)) - r;
  }
  if (uShape > 0.5) {
    float r = uPlane.x * 0.5;
    if (p.y < uPlane.y - r) return -1e4;
    return length(p - vec2(r, uPlane.y - r)) - r;
  }
  return -1e4;
}

void main() {
  // doors: the plate opens from an inset rectangle; its edges stay stippled like the silhouettes
  vec2 pp = vUv * uPlane;
  vec2 lo = vec2(uInset.w, uInset.z) * uPlane;
  vec2 hi = vec2(1.0 - uInset.y, 1.0 - uInset.x) * uPlane;
  vec2 bq = abs(pp - (lo + hi) * 0.5) - max((hi - lo) * 0.5, 0.0);
  float box = length(max(bq, 0.0)) + min(max(bq.x, bq.y), 0.0);
  // a rough, stippled edge — ink never quite reaches the silhouette cleanly
  if (max(shapeSdf(), box) > -hash12(floor(gl_FragCoord.xy / uGrain)) * 2.5) discard;
  // top and bottom edges dissolve into the page as a stochastic dither locked to the plate
  // capped to a share of the plate so small screens keep most of the picture
  float fadeT = min(uFade.x, uPlane.y * 0.16);
  float fadeB = min(uFade.y, uPlane.y * 0.16);
  float ft = fadeT > 0.0 ? smoothstep(0.0, fadeT, uPlane.y - pp.y) : 1.0;
  float fb = fadeB > 0.0 ? smoothstep(0.0, fadeB, pp.y) : 1.0;
  if (hash12(floor(pp * uPixel / (uGrain * 1.4)) + 3.7) > ft * fb) discard;
  vec2 uv = vUv;
  // lens smear under the cursor
  vec2 d = uv - uMouse;
  d.x *= uPlane.x / uPlane.y;
  float lens = exp(-dot(d, d) * 14.0) * uHover;
  uv -= normalize(d + 1e-5) * lens * 0.03 * uSmear;

  uv = (uv - 0.5) * (1.0 - uZoom * 0.06 - uHover * 0.05) + 0.5;
  vec2 cuv = coverUv(uv);

  vec2 fc = gl_FragCoord.xy;
  float blot = fbm(vUv * vec2(3.0, 2.2) + uSeed * 0.01);
  float l = toneAt(cuv);
  l = smoothstep(0.06, 0.94, l);
  l = clamp((l - 0.5) * uDensity + 0.5 + (blot - 0.5) * 0.1, 0.0, 1.0);
  float n = grain(fc, uGrain, uSeed);
  vec3 col = risoRamp(l, n);

  vec2 off = vec2(uMisreg, -uMisreg * 0.7) * (1.0 + uHover * 2.2 + lens * 6.0) / uPlane;
  float lh = smoothstep(0.06, 0.94, toneAt(coverUv(uv + off / uPixel)));
  float h = smoothstep(0.6, 0.95, lh + (blot - 0.5) * 0.08);
  float n2 = grain(fc + 7.0, uGrain, uSeed + 2.7);
  col = mix(col, uInk, step(n2, h) * 0.95);

  // house plates keep most of their own print; live grain keeps them breathing with the page
  vec3 rawc = texture2D(tMap, cuv).rgb * (0.93 + 0.14 * n);
  col = mix(col, rawc, uRaw);

  // paper stock shows until the drum has laid ink (reveal) and the texture has arrived
  float edge = uReveal * 1.2 - 0.1 + (vnoise(vec2(vUv.x * 14.0, uTime * 0.5)) - 0.5) * 0.12;
  float inked = step(1.0 - vUv.y, edge) * uLoaded;
  vec3 paper = mix(INK2, INK3, step(n, 0.42));
  col = mix(paper, col, inked);

  // a fresh pull: a bright band of wet ink sweeps across the sheet
  float band = smoothstep(0.1, 0.0, abs(vUv.y - (1.2 - uPull * 1.4)));
  col = mix(col, uInk, band * step(n, 0.7) * step(0.001, uPull) * step(uPull, 0.999));

  gl_FragColor = vec4(col, 1.0);
}`;

class Gallery {
  constructor() {
    this.items = new Set();
    this.velocity = 0;
    this.enabled = false;
  }

  init() {
    if (this.renderer || typeof window === 'undefined') return this.enabled;
    try {
      this.dpr = Math.min(window.devicePixelRatio, 1.6);
      this.renderer = new Renderer({ dpr: this.dpr, alpha: true, premultipliedAlpha: false, antialias: false });
      const gl = this.renderer.gl;
      if (!gl) throw new Error('no gl');
      this.gl = gl;
      gl.clearColor(0, 0, 0, 0);
      const c = gl.canvas;
      c.className = 'riso-gallery';
      c.setAttribute('aria-hidden', 'true');
      document.body.appendChild(c);
      this.geometry = new Plane(gl, { widthSegments: 12, heightSegments: 12 });
      this.scene = new Transform();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.start = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.enabled = true;
    } catch (e) {
      this.enabled = false;
    }
    return this.enabled;
  }

  resize() {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.renderer.setSize(this.vw, this.vh);
  }

  setVelocity(v) {
    this.velocity = v;
  }

  add(el, src, opts = {}) {
    if (!this.enabled) return null;
    const gl = this.gl;
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
    const uniforms = {
      tMap: { value: texture },
      uImage: { value: [1, 1] },
      uPlane: { value: [1, 1] },
      uRect: { value: [0, 0, 1, 1] },
      uViewport: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uTime: { value: 0 },
      uSeed: { value: 0 },
      uHover: { value: 0 },
      uGrain: { value: Math.max(1, 1.5 * this.dpr) },
      uMisreg: { value: 3.0 },
      uDensity: { value: 1.15 },
      uReveal: { value: opts.reveal ?? 1 },
      uLoaded: { value: 0 },
      uZoom: { value: 0 },
      uSmear: { value: 1 },
      uPull: { value: 0 },
      uBend: { value: 0 },
      uPixel: { value: this.dpr },
      uShape: { value: { rect: 0, arch: 1, pill: 2 }[opts.shape] ?? 0 },
      uRaw: { value: opts.raw ?? 0 },
      uInset: { value: opts.inset ?? [0, 0, 0, 0] },
      uFade: { value: opts.fade ?? [0, 0] },
      uInk: { value: [0.965, 0.816, 0.918] },
    };
    const program = new Program(gl, { vertex, fragment, uniforms, transparent: false, cullFace: null, depthTest: false });
    const mesh = new Mesh(gl, { geometry: this.geometry, program });
    mesh.frustumCulled = false;

    const item = { el, mesh, uniforms, hover: 0, hoverTarget: 0, mouse: [0.5, 0.5], bend: opts.bend ?? 1, loaded: 0 };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      texture.image = img;
      uniforms.uImage.value = [img.naturalWidth, img.naturalHeight];
      item.loaded = 1;
      opts.onLoad?.();
    };
    img.onerror = () => opts.onLoad?.();
    img.src = src;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      item.mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    const onEnter = () => (item.hoverTarget = 1);
    const onLeave = () => (item.hoverTarget = 0);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);

    this.items.add(item);
    return {
      uniforms,
      item,
      remove: () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        this.items.delete(item);
        program.remove?.();
        texture.image = null;
      },
    };
  }

  loop() {
    requestAnimationFrame(this.loop);
    const t = (performance.now() - this.start) / 1000;
    const seed = Math.floor(t * 12) % 64;
    const bend = Math.max(-40, Math.min(40, this.velocity * 0.9));

    // measure first; when nothing is on screen (and nothing was last frame) skip the GPU entirely
    const visible = [];
    for (const it of this.items) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > this.vh + 50 || r.right < -50 || r.left > this.vw + 50 || r.width < 2) continue;
      visible.push([it, r]);
    }
    if (!visible.length && !this.drewLast) return;
    this.drewLast = visible.length > 0;
    this.renderer.render({ scene: this.scene, clear: true }); // clears the canvas

    for (const [it, r] of visible) {
      const u = it.uniforms;
      it.hover += (it.hoverTarget - it.hover) * 0.08;
      u.uHover.value = it.hover;
      const m = u.uMouse.value;
      m[0] += (it.mouse[0] - m[0]) * 0.15;
      m[1] += (it.mouse[1] - m[1]) * 0.15;
      u.uLoaded.value = it.loaded;
      u.uRect.value = [r.left, r.top, r.width, r.height];
      u.uPlane.value = [r.width, r.height];
      u.uViewport.value = [this.vw, this.vh];
      u.uTime.value = t;
      u.uSeed.value = seed;
      u.uBend.value = bend * it.bend;
      it.mesh.draw({});
      if (it.capture) this.readPlate(it, r);
    }
  }

  // Resolves with a small JPEG of a plate exactly as printed this frame.
  capture(handle, maxWidth = 260) {
    return new Promise((resolve) => {
      handle.item.capture = { resolve, maxWidth };
    });
  }

  readPlate(it, r) {
    const { resolve, maxWidth } = it.capture;
    it.capture = null;
    const gl = this.gl;
    const dpr = this.dpr;
    const bw = gl.drawingBufferWidth;
    const bh = gl.drawingBufferHeight;
    const x = Math.max(0, Math.floor(r.left * dpr));
    const w = Math.min(bw, Math.floor(r.right * dpr)) - x;
    const top = Math.max(0, Math.floor(r.top * dpr));
    const bottom = Math.min(bh, Math.floor(r.bottom * dpr));
    const h = bottom - top;
    if (w < 4 || h < 4) return resolve(null);
    const px = new Uint8ClampedArray(w * h * 4);
    gl.readPixels(x, bh - bottom, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    // GL rows run bottom-up
    const flipped = new Uint8ClampedArray(px.length);
    for (let row = 0; row < h; row++) {
      flipped.set(px.subarray((h - 1 - row) * w * 4, (h - row) * w * 4), row * w * 4);
    }
    const full = document.createElement('canvas');
    full.width = w;
    full.height = h;
    full.getContext('2d').putImageData(new ImageData(flipped, w, h), 0, 0);
    const scale = Math.min(1, maxWidth / w);
    const thumb = document.createElement('canvas');
    thumb.width = Math.round(w * scale);
    thumb.height = Math.round(h * scale);
    const ctx = thumb.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(full, 0, 0, thumb.width, thumb.height);
    resolve(thumb.toDataURL('image/jpeg', 0.88));
  }
}

export const gallery = new Gallery();

if (import.meta.env.DEV && typeof window !== 'undefined') window.__gallery = gallery;
