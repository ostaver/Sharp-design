import { Renderer, Program, Mesh, Plane, Texture, Transform, type OGLRenderingContext } from 'ogl';
import { riso } from './riso.glsl';

/*
  One fixed, transparent OGL canvas that re-prints every <RisoImage> on the page. Each DOM
  placeholder is mirrored by a plane placed in CSS pixels every frame, so images scroll, pin
  and transform with the layout while being inked, stippled and bent by scroll velocity on the
  GPU. When nothing is on screen the GPU is skipped entirely. On context loss every image
  falls back to its real <img> until the context comes back.
*/

const vertex = /* glsl */ `
attribute vec3 position;
attribute vec2 uv;
uniform vec4 uRect;      // x, y, w, h in CSS px
uniform vec2 uViewport;  // CSS px
uniform float uBend;
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
uniform float uTime, uSeed, uHover, uGrain, uMisreg, uDensity, uReveal, uLoaded, uZoom, uSmear, uPull, uPixel, uShape, uRaw, uGamma;
uniform vec4 uInset; // top, right, bottom, left: fractions of the plate held shut
uniform vec2 uFade;  // top, bottom: CSS px dissolved into the page
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

// gamma > 1 pulls a high-key photograph's midtones down into the darker inks
float toneAt(vec2 uv) {
  return pow(luma(texture2D(tMap, uv).rgb), uGamma);
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
  // a rough, stippled edge: ink never quite reaches the silhouette cleanly
  if (max(shapeSdf(), box) > -hash12(floor(gl_FragCoord.xy / uGrain)) * 2.5) discard;
  // top and bottom edges dissolve into the page as a dither locked to the plate,
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

export type Shape = 'rect' | 'arch' | 'pill';
export type Quad = [number, number, number, number];

export interface PlateOptions {
  /** how strongly scroll velocity bows the plane (1 = full) */
  bend?: number;
  reveal?: number;
  shape?: Shape;
  /** 0 re-inks the image fully; ~0.8 keeps a riso illustration close to how it was printed */
  raw?: number;
  /** > 1 darkens a high-key photograph's midtones before inking */
  gamma?: number;
  /** top, right, bottom, left: fractions of the plate held shut */
  inset?: Quad;
  /** top, bottom: CSS px dissolved into the page as dither */
  fade?: [number, number];
  onLoad?: () => void;
}

interface Uniform<T> {
  value: T;
}

export interface PlateUniforms {
  tMap: Uniform<Texture>;
  uImage: Uniform<[number, number]>;
  uPlane: Uniform<[number, number]>;
  uRect: Uniform<Quad>;
  uViewport: Uniform<[number, number]>;
  uMouse: Uniform<[number, number]>;
  uTime: Uniform<number>;
  uSeed: Uniform<number>;
  uHover: Uniform<number>;
  uGrain: Uniform<number>;
  uMisreg: Uniform<number>;
  uDensity: Uniform<number>;
  uReveal: Uniform<number>;
  uLoaded: Uniform<number>;
  uZoom: Uniform<number>;
  uSmear: Uniform<number>;
  uPull: Uniform<number>;
  uBend: Uniform<number>;
  uPixel: Uniform<number>;
  uShape: Uniform<number>;
  uRaw: Uniform<number>;
  uGamma: Uniform<number>;
  uInset: Uniform<Quad>;
  uFade: Uniform<[number, number]>;
  uInk: Uniform<[number, number, number]>;
}

interface Capture {
  resolve: (url: string | null) => void;
  maxWidth: number;
}

export interface PlateItem {
  el: HTMLElement;
  src: string;
  image: HTMLImageElement | null;
  mesh: Mesh;
  uniforms: PlateUniforms;
  hover: number;
  hoverTarget: number;
  mouse: [number, number];
  bend: number;
  loaded: number;
  /** the Press holds its own ink and ignores the site-wide drum */
  lockInk: boolean;
  capture: Capture | null;
}

export interface PlateHandle {
  uniforms: PlateUniforms;
  item: PlateItem;
  remove: () => void;
}

const SHAPES: Record<Shape, number> = { rect: 0, arch: 1, pill: 2 };

class Gallery {
  items = new Set<PlateItem>();
  velocity = 0;
  enabled = false;
  private renderer: Renderer | null = null;
  private gl: OGLRenderingContext | null = null;
  private geometry: Plane | null = null;
  private scene = new Transform();
  private dpr = 1;
  private vw = 1;
  private vh = 1;
  private start = 0;
  private drewLast = false;
  private stateSubs = new Set<(enabled: boolean) => void>();

  /** Creates the shared canvas once. Returns false when WebGL is unavailable. */
  init(): boolean {
    if (this.renderer || typeof window === 'undefined') return this.enabled;
    try {
      this.dpr = Math.min(window.devicePixelRatio, 1.6);
      const renderer = new Renderer({ dpr: this.dpr, alpha: true, premultipliedAlpha: false, antialias: false });
      const gl = renderer.gl;
      if (!gl) throw new Error('no gl');
      this.renderer = renderer;
      this.gl = gl;
      gl.clearColor(0, 0, 0, 0);
      const c = gl.canvas as HTMLCanvasElement;
      c.className = 'riso-gallery';
      c.setAttribute('aria-hidden', 'true');
      c.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        this.setEnabled(false);
      });
      c.addEventListener('webglcontextrestored', () => this.rebuild());
      document.body.appendChild(c);
      this.geometry = new Plane(gl, { widthSegments: 12, heightSegments: 12 });
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.start = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
    return this.enabled;
  }

  /** RisoImage listens so it can show its real <img> while the GPU is gone. */
  onState(fn: (enabled: boolean) => void): () => void {
    this.stateSubs.add(fn);
    return () => {
      this.stateSubs.delete(fn);
    };
  }

  private setEnabled(on: boolean): void {
    this.enabled = on;
    this.stateSubs.forEach((fn) => fn(on));
  }

  resize(): void {
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.renderer?.setSize(this.vw, this.vh);
  }

  setVelocity(v: number): void {
    this.velocity = v;
  }

  private makeMesh(uniforms: PlateUniforms): Mesh {
    const gl = this.gl as OGLRenderingContext;
    const program = new Program(gl, { vertex, fragment, uniforms, transparent: false, cullFace: null, depthTest: false });
    const mesh = new Mesh(gl, { geometry: this.geometry as Plane, program });
    mesh.frustumCulled = false;
    return mesh;
  }

  add(el: HTMLElement, src: string, opts: PlateOptions = {}): PlateHandle | null {
    if (!this.enabled || !this.gl) return null;
    const gl = this.gl;
    const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
    const uniforms: PlateUniforms = {
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
      uShape: { value: SHAPES[opts.shape ?? 'rect'] },
      uRaw: { value: opts.raw ?? 0 },
      uGamma: { value: opts.gamma ?? 1 },
      uInset: { value: opts.inset ?? [0, 0, 0, 0] },
      uFade: { value: opts.fade ?? [0, 0] },
      uInk: { value: [1, 1, 1] },
    };
    const item: PlateItem = {
      el,
      src,
      image: null,
      mesh: this.makeMesh(uniforms),
      uniforms,
      hover: 0,
      hoverTarget: 0,
      mouse: [0.5, 0.5],
      bend: opts.bend ?? 1,
      loaded: 0,
      lockInk: false,
      capture: null,
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      item.image = img;
      uniforms.tMap.value.image = img;
      uniforms.uImage.value = [img.naturalWidth, img.naturalHeight];
      item.loaded = 1;
      opts.onLoad?.();
    };
    img.onerror = () => opts.onLoad?.();
    img.src = src;

    const onMove = (e: PointerEvent) => {
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
        item.mesh.program.remove();
        item.image = null;
      },
    };
  }

  // a restored context has lost every program and texture: rebuild them from what we kept
  private rebuild(): void {
    const gl = this.gl;
    if (!gl) return;
    gl.clearColor(0, 0, 0, 0);
    this.geometry = new Plane(gl, { widthSegments: 12, heightSegments: 12 });
    for (const it of this.items) {
      const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });
      if (it.image) texture.image = it.image;
      it.uniforms.tMap.value = texture;
      it.mesh = this.makeMesh(it.uniforms);
    }
    this.resize();
    this.setEnabled(true);
  }

  private loop(): void {
    requestAnimationFrame(this.loop);
    if (!this.enabled || !this.renderer) return;
    const t = (performance.now() - this.start) / 1000;
    const seed = Math.floor(t * 12) % 64;
    const bend = Math.max(-40, Math.min(40, this.velocity * 0.9));

    // measure first; when nothing is on screen (and nothing was last frame) skip the GPU entirely
    const visible: Array<[PlateItem, DOMRect]> = [];
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

  /** Resolves with a small JPEG of a plate exactly as printed this frame. */
  capture(handle: PlateHandle, maxWidth = 260): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.enabled) return resolve(null);
      handle.item.capture = { resolve, maxWidth };
    });
  }

  private readPlate(it: PlateItem, r: DOMRect): void {
    const cap = it.capture;
    it.capture = null;
    const gl = this.gl;
    if (!cap || !gl) return;
    const dpr = this.dpr;
    const bw = gl.drawingBufferWidth;
    const bh = gl.drawingBufferHeight;
    const x = Math.max(0, Math.floor(r.left * dpr));
    const w = Math.min(bw, Math.floor(r.right * dpr)) - x;
    const top = Math.max(0, Math.floor(r.top * dpr));
    const bottom = Math.min(bh, Math.floor(r.bottom * dpr));
    const h = bottom - top;
    if (w < 4 || h < 4) return cap.resolve(null);
    const px = new Uint8ClampedArray(w * h * 4);
    gl.readPixels(x, bh - bottom, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    // GL rows run bottom-up
    const flipped = new Uint8ClampedArray(px.length);
    for (let row = 0; row < h; row++) flipped.set(px.subarray((h - 1 - row) * w * 4, (h - row) * w * 4), row * w * 4);
    const full = document.createElement('canvas');
    full.width = w;
    full.height = h;
    full.getContext('2d')?.putImageData(new ImageData(flipped, w, h), 0, 0);
    const scale = Math.min(1, cap.maxWidth / w);
    const thumb = document.createElement('canvas');
    thumb.width = Math.round(w * scale);
    thumb.height = Math.round(h * scale);
    const ctx = thumb.getContext('2d');
    if (!ctx) return cap.resolve(null);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(full, 0, 0, thumb.width, thumb.height);
    cap.resolve(thumb.toDataURL('image/jpeg', 0.88));
  }
}

export const gallery = new Gallery();
