# Side effect (required) — `<ascii-flame>` web component

**Write to:** `src/effects/ascii-flame.js`
**Rule:** copy the code block below into that file **exactly as written** — no edits, no reformatting, no "improvements". Do not rewrite it from memory.

A dependency-free custom element: a 2D stable-fluids fire (buoyancy, curl-noise turbulence, vorticity confinement, SOR pressure projection, RK2 advection, noise-modulated combustion) rendered as a glyph ramp with a sprite atlas, embers, smoke, and two-pass bloom. It caps itself at 24fps and slows to 0.4× under reduced motion. Attributes and methods are documented in the header comment.

````js
/*!

 * ascii-flame.js — <ascii-flame> Web Component  v1.0.0

 * A realistic, fluid-simulated fire rendered with ASCII characters.

 * Zero dependencies · works in plain HTML, React, Vue, Svelte, Astro, …

 *

 *   <script src="ascii-flame.js"></script>

 *   <ascii-flame preset="campfire" style="height:420px"></ascii-flame>

 *

 * Attributes

 *   preset       campfire | candle | torch | inferno | burner      (default campfire)

 *   palette      fire | coal | gas | emerald | spirit | mono        (default fire)

 *   colors       custom gradient, dim → hot, e.g. "#200, #f40, #fd0, #fff"

 *   glyphs       flame | flow | classic | blocks | binary           (default flame)

 *   charset      custom ramp dim → bright, e.g. ".:*#@" or ".` :; !| #@"

 *   intensity    0 – 3    fire size / heat                          (default 1)

 *   wind         -3 – 3   sideways wind                             (default 0)

 *   speed        0 – 4    simulation speed                          (default 1)

 *   glow         0 – 2    light bloom around the characters         (default .6)

 *   embers       0 – 5    rising sparks multiplier                  (default 1)

 *   smoke        0 – 4    smoke multiplier                          (default 1)

 *   flicker      0 – 4    burner turbulence multiplier              (default 1)

 *   brightness   .2 – 3   heat → colour gain                        (default 1)

 *   quality      low | medium | high  simulation resolution          (default medium)

 *   fps          frame-rate cap                                     (default 60)

 *   line-height  character cell height, in em                       (default 1)

 *   seed         integer, changes the noise pattern

 *   interactive  pointer stirs the air, press & drag paints fire, click ignites

 *   paused       freeze the animation

 *   Font family / size come from CSS:  ascii-flame { font: 14px "JetBrains Mono", monospace }

 *

 * Methods   play() · pause() · reset() · refresh() · ignite(x, y, power) · gust(strength)

 * Parts     ::part(ascii) ::part(glow) ::part(bloom)

 *

 * MIT License

 */

(function () {

  'use strict';

  if (typeof window === 'undefined' || !window.customElements || customElements.get('ascii-flame')) return;



  /* ------------------------------------------------------------------ utils */

  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

  const lerp = (a, b, t) => a + (b - a) * t;

  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };



  function hash(x, y, z) {

    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 1442695041)) | 0;

    h = Math.imul(h ^ (h >>> 13), 1274126177);

    h ^= h >>> 16;

    return (h >>> 0) / 4294967296;

  }



  function rng(seed) { // mulberry32

    let a = seed >>> 0;

    return function () {

      a = (a + 0x6D2B79F5) | 0;

      let t = Math.imul(a ^ (a >>> 15), 1 | a);

      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    };

  }



  /* ---------------------------------------------- tileable fbm noise texture

     128×128 texels, values in [0,1]. The coarsest octave has one feature per

     32 texels, so "32 texels" is the unit feature size used by the solver. */

  const NS = 128, NM = NS - 1, FEAT = 32;

  const noiseCache = new Map();

  function noiseTexture(seed) {

    if (noiseCache.has(seed)) return noiseCache.get(seed);

    const out = new Float32Array(NS * NS), rand = rng(seed * 9301 + 49297);

    let amp = 1;

    for (let o = 0; o < 5; o++, amp *= 0.5) {

      const P = 4 << o, lat = new Float32Array(P * P), k = P / NS;

      for (let i = 0; i < lat.length; i++) lat[i] = rand() * 2 - 1;

      for (let y = 0; y < NS; y++) {

        const fy = y * k, y0 = fy | 0, y1 = (y0 + 1) % P;

        let ty = fy - y0; ty = ty * ty * (3 - 2 * ty);

        for (let x = 0; x < NS; x++) {

          const fx = x * k, x0 = fx | 0, x1 = (x0 + 1) % P;

          let tx = fx - x0; tx = tx * tx * (3 - 2 * tx);

          const a = lat[y0 * P + x0], b = lat[y0 * P + x1], c = lat[y1 * P + x0], d = lat[y1 * P + x1];

          out[y * NS + x] += amp * (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty);

        }

      }

    }

    let lo = Infinity, hi = -Infinity;

    for (let i = 0; i < out.length; i++) { if (out[i] < lo) lo = out[i]; if (out[i] > hi) hi = out[i]; }

    for (let i = 0; i < out.length; i++) out[i] = (out[i] - lo) / (hi - lo);

    noiseCache.set(seed, out);

    return out;

  }



  // bilinear, wrapping; x, y in texels

  function noise(tex, x, y) {

    const xf = Math.floor(x), yf = Math.floor(y), tx = x - xf, ty = y - yf;

    const x0 = xf & NM, y0 = yf & NM, x1 = (x0 + 1) & NM, y1 = (y0 + 1) & NM;

    const a = tex[(y0 << 7) + x0], b = tex[(y0 << 7) + x1], c = tex[(y1 << 7) + x0], d = tex[(y1 << 7) + x1];

    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;

  }



  /* ---------------------------------------------------------------- colour

     Gradient stops: [position, r, g, b, alpha]. Alpha ramps up with heat so the

     flame also works on transparent / non-black backgrounds. */

  const LEVELS = 64, SMOKE_LEVELS = 16;

  const PALETTES = {

    fire: [[0, 40, 2, 0, 0], [0.07, 90, 10, 2, 0.45], [0.18, 150, 24, 4, 0.75], [0.32, 210, 52, 6, 0.92],

      [0.46, 246, 98, 12, 1], [0.6, 255, 146, 30, 1], [0.74, 255, 192, 72, 1], [0.87, 255, 228, 150, 1], [1, 255, 250, 235, 1]],

    coal: [[0, 30, 0, 0, 0], [0.1, 80, 6, 2, 0.5], [0.3, 160, 18, 4, 0.85], [0.55, 225, 48, 8, 1],

      [0.75, 255, 92, 18, 1], [0.9, 255, 140, 40, 1], [1, 255, 190, 90, 1]],

    gas: [[0, 0, 6, 40, 0], [0.08, 10, 22, 110, 0.45], [0.25, 24, 62, 215, 0.82], [0.48, 45, 128, 255, 1],

      [0.7, 115, 192, 255, 1], [0.86, 192, 234, 255, 1], [1, 250, 253, 255, 1]],

    emerald: [[0, 0, 26, 10, 0], [0.08, 6, 64, 26, 0.45], [0.25, 22, 140, 56, 0.82], [0.48, 58, 212, 96, 1],

      [0.7, 142, 250, 150, 1], [0.86, 212, 255, 206, 1], [1, 246, 255, 246, 1]],

    spirit: [[0, 26, 0, 42, 0], [0.08, 62, 12, 104, 0.45], [0.25, 132, 32, 204, 0.82], [0.48, 196, 78, 255, 1],

      [0.7, 240, 148, 255, 1], [0.86, 255, 212, 255, 1], [1, 255, 246, 255, 1]]

  };

  const SMOKE_STOPS = [[0, 70, 66, 64, 0], [0.4, 105, 98, 94, 0.18], [1, 150, 142, 136, 0.42]];



  function buildLUT(stops, n) {

    const out = [];

    for (let k = 0; k < n; k++) {

      const t = k / (n - 1);

      let j = 1;

      while (j < stops.length - 1 && stops[j][0] < t) j++;

      const a = stops[j - 1], b = stops[j], f = clamp((t - a[0]) / ((b[0] - a[0]) || 1), 0, 1);

      out.push([lerp(a[1], b[1], f), lerp(a[2], b[2], f), lerp(a[3], b[3], f), lerp(a[4], b[4], f)]);

    }

    return out;

  }



  let colorCtx = null;

  function parseColor(str) {

    colorCtx = colorCtx || document.createElement('canvas').getContext('2d');

    colorCtx.fillStyle = '#000';

    colorCtx.fillStyle = String(str).trim();

    const s = colorCtx.fillStyle;

    if (s[0] === '#') return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1];

    const m = s.match(/[\d.]+/g) || [255, 255, 255];

    return [+m[0], +m[1], +m[2], m[3] !== undefined ? +m[3] : 1];

  }



  function customStops(list) {

    const cols = list.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean).map(parseColor);

    if (cols.length === 1) cols.unshift([cols[0][0] * 0.2, cols[0][1] * 0.2, cols[0][2] * 0.2, 1]);

    return cols.map((c, k) => {

      const t = k / (cols.length - 1);

      return [t, c[0], c[1], c[2], k === 0 ? 0 : Math.min(1, 0.4 + t * 1.6) * c[3]];

    });

  }



  function monoStops(c) {

    return [[0, c[0], c[1], c[2], 0], [0.1, c[0], c[1], c[2], 0.2], [0.35, c[0], c[1], c[2], 0.55],

      [0.7, c[0], c[1], c[2], 0.85], [1, c[0], c[1], c[2], 1]];

  }



  /* ---------------------------------------------------------------- glyphs

     Each ramp is a list of intensity levels (dim → bright); a level holds

     interchangeable variants that the renderer shuffles slowly per cell. */

  const RAMPS = {

    flame: ['.`', ".'`", ",:'", ':;', ';^!', '!|i', 'il|', '1Il', '+t*', '*x+', 'xzo', 'o%&', '%&$8', '#8B$', '@#8B', '@#'],

    flow: ['.`', ".'`", ",:'", ':;', ';^!', '!|i', 'il|', '1Il', '+t*', '*x+', 'xzo', 'o%&', '%&$8', '#8B$', '@#8B', '@#'],

    classic: ['.', ':', '-', '=', '+', '*', '#', '%', '@'],

    blocks: ['░', '▒', '▓', '█'],

    binary: ['0', '1', '01', '1']

  };

  const FLOW = { v: "|!'", r: '/', l: '\\', h: '~', cw: ')', ccw: '(' };

  const EMBER_CHARS = ".'`*+,";

  const SMOKE_CHARS = ".,`':~";



  /* --------------------------------------------------------------- presets

     lanes: [centre (fraction of width), half-width (fraction of height), weight]

     base: burner height above the bottom edge (fraction of height) */

  const BASE = { burn: 1.5, yield: 1.2, preheat: 0.6, grain: 0.1, tscale: 0.14, stretch: 0.45, body: 0.3, bnoise: 1, shape: 2, expand: 0 };

  const PRESETS = {

    campfire: { lanes: [[0.5, 0.2, 1], [0.37, 0.06, 0.35], [0.64, 0.07, 0.3]], base: 0.035, heat: 1, lift: 0.6, cool: 1,

      swirl: 0.6, turb: 1.3, flicker: 1, embers: 1, smoke: 0.5, sway: 0.12, inflow: 0.4, preheat: 0.8, burn: 2.4, yield: 1.2 },

    candle: { lanes: [[0.5, 0.04, 1]], base: 0.1, heat: 1, lift: 1, cool: 1, swirl: 0.15, turb: 0.12, flicker: 0.25,

      embers: 0, smoke: 0.12, sway: 0.04, inflow: 0.15, preheat: 1, burn: 2.2, yield: 1.7, expand: 1, bnoise: 0.2 },

    torch: { lanes: [[0.5, 0.075, 1]], base: 0.06, heat: 1.1, lift: 0.9, cool: 1, swirl: 1, turb: 1.1, flicker: 1,

      embers: 0.9, smoke: 0.4, sway: 0.1, inflow: 0.4, preheat: 0.7, burn: 1.8, yield: 1.3 },

    inferno: { lanes: 'full', base: 0, heat: 1, lift: 0.6, cool: 1, swirl: 1.1, turb: 1.3, flicker: 1.8,

      embers: 1.8, smoke: 0.6, sway: 0.08, inflow: 0.25, preheat: 0.6, burn: 3.2, yield: 1 },

    burner: { lanes: 'jets', jet: 0.028, base: 0.03, heat: 0.95, lift: 0.6, cool: 1, swirl: 0.5, turb: 0.25, flicker: 0.45,

      embers: 0, smoke: 0, sway: 0.05, inflow: 0.4, preheat: 0.6, burn: 4.5, yield: 1.4, expand: 0.8, bnoise: 0.25 }

  };

  const QUALITY = { low: { budget: 6000, iters: 8 }, medium: { budget: 13000, iters: 12 }, high: { budget: 24000, iters: 18 } };

  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);



  /* ------------------------------------------------------------ simulation

     2-D Eulerian smoke/fire solver ("stable fluids"), in cell units, y down.

     Fields: velocity (u,v), fuel F, temperature T, soot S. Per step:

       inject fuel → buoyancy + wind + curl-noise turbulence → vorticity confinement

       → pressure projection (SOR) → RK2 semi-Lagrangian advection

       → combustion: fuel burns at a noise-modulated rate and releases heat, heat

         radiates away. Where the fuel runs out the flame ends, so it breaks into

         licking tongues of varying length instead of a smooth plume. */

  // bilinear sample of a w×h field with edge clamping; x, y in cell units

  function bilerp(f, w, h, x, y) {

    const xm = w - 1.001, ym = h - 1.001;

    x = x < 0 ? 0 : x > xm ? xm : x;

    y = y < 0 ? 0 : y > ym ? ym : y;

    const x0 = x | 0, y0 = y | 0, tx = x - x0, ty = y - y0, i = y0 * w + x0;

    const a = f[i], b = f[i + 1], c = f[i + w], d = f[i + w + 1];

    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;

  }



  class FlameSim {

    constructor() { this.w = 0; this.h = 0; }



    // returns true when the grid is brand new (nothing to carry over)

    resize(w, h) {

      if (w === this.w && h === this.h) return false;

      const o = this.w ? { w: this.w, h: this.h, u: this.u, v: this.v, T: this.T, S: this.S, F: this.F } : null;

      const n = w * h, f = () => new Float32Array(n);

      this.w = w; this.h = h;

      this.u = f(); this.v = f(); this.T = f(); this.S = f(); this.F = f();

      this.u0 = f(); this.v0 = f(); this.T0 = f(); this.S0 = f(); this.F0 = f();

      this.p = f(); this.div = f(); this.curl = f(); this.psi = f(); this.burn = f();

      this.src = new Float32Array(w);

      if (!o) return true;

      // resample the running fire onto the new grid so resizes don't restart it

      const sx = o.w / w, sy = o.h / h;

      for (let y = 0, i = 0; y < h; y++) {

        for (let x = 0; x < w; x++, i++) {

          const X = (x + 0.5) * sx - 0.5, Y = (y + 0.5) * sy - 0.5;

          this.u[i] = bilerp(o.u, o.w, o.h, X, Y) / sx;

          this.v[i] = bilerp(o.v, o.w, o.h, X, Y) / sy;

          this.T[i] = bilerp(o.T, o.w, o.h, X, Y);

          this.S[i] = bilerp(o.S, o.w, o.h, X, Y);

          this.F[i] = bilerp(o.F, o.w, o.h, X, Y);

        }

      }

      return false;

    }



    reset() { for (const a of [this.u, this.v, this.T, this.S, this.F, this.p]) a.fill(0); }



    sample(f, x, y) { return bilerp(f, this.w, this.h, x, y); }



    // gaussian impulse of velocity (cells/s) and heat

    splat(x, y, r, du, dv, heat) {

      const { w, h, u, v, T } = this, r2 = r * r;

      const x0 = Math.max(0, Math.floor(x - 2 * r)), x1 = Math.min(w - 1, Math.ceil(x + 2 * r));

      const y0 = Math.max(0, Math.floor(y - 2 * r)), y1 = Math.min(h - 1, Math.ceil(y + 2 * r));

      for (let j = y0; j <= y1; j++) {

        for (let i = x0; i <= x1; i++) {

          const dx = i - x, dy = j - y, g = Math.exp(-(dx * dx + dy * dy) / r2), k = j * w + i;

          u[k] += du * g; v[k] += dv * g;

          if (heat) { T[k] = Math.min(1.5, T[k] + heat * g); this.F[k] = Math.min(1.5, this.F[k] + heat * g); }

        }

      }

    }



    step(dt, P, t, tex) {

      this.inject(dt, P, t, tex);

      this.forces(dt, P, t, tex);

      this.project(P.iters, P.expand);

      this.advect(dt);

      this.react(dt, P, t, tex);

    }



    burnerRow(P) { return clamp(Math.round(this.h * (1 - P.base)) - 1, 1, this.h - 1); }



    inject(dt, P, t, tex) {

      const { w, h, T, F, v, src } = this;

      const yb = this.burnerRow(P), thick = Math.max(2, Math.round(h * 0.035));

      const k = 1 - Math.exp(-dt * 25), nx = 380 / h, nt = t * 90 * P.flickerRate;

      const jet = -P.inflow * h, flick = P.flicker;

      for (let x = 0; x < w; x++) {

        const e = src[x];

        if (e < 0.003) continue;

        const n1 = noise(tex, x * nx + 3.7, nt), n2 = noise(tex, x * nx * 2.3 + 71.1, nt * 1.9 + 40);

        let m = 1 + flick * (1.7 * (n1 - 0.5) + 0.9 * (n2 - 0.5));

        if (m < 0.1) m = 0.1;

        const fuel = P.heat * e * m, vy = jet * e * (0.6 + 0.4 * m);

        for (let y = yb - thick + 1; y <= yb; y++) {

          const i = y * w + x;

          F[i] += (fuel - F[i]) * k;

          T[i] += (fuel * P.preheat - T[i]) * k;

          v[i] += (vy - v[i]) * k;

        }

      }

    }



    forces(dt, P, t, tex) {

      const { w, h, u, v, T, psi, curl } = this;

      const lift = 2.6 * P.lift * h * dt, wind = P.windNow * 1.4 * h * dt, damp = Math.exp(-dt * 0.9);

      // buoyancy, wind, drag

      for (let i = 0, n = w * h; i < n; i++) {

        u[i] = (u[i] + wind) * damp;

        v[i] = (v[i] - lift * T[i]) * damp;

      }

      // turbulence: curl of a scrolling, evolving noise stream-function

      if (P.turb > 0) {

        const ts = FEAT / (P.tscale * h), sc = t * 0.35 * P.turbRate * FEAT / P.tscale;

        for (let y = 0, i = 0; y < h; y++) {

          const y1 = y * ts * 0.6 + sc, y2 = y * ts * 1.3 + sc * 1.7 + 23;

          for (let x = 0; x < w; x++, i++) psi[i] = noise(tex, x * ts, y1) + 0.5 * noise(tex, x * ts * 2.1 + 57, y2);

        }

        const K0 = P.turb * 0.5 * h * h * dt * 0.5, yb = this.burnerRow(P), body = P.body * h;

        for (let y = 1; y < h - 1; y++) {

          const K = K0 * (0.3 + 0.7 * clamp((yb - y) / body, 0, 1));

          for (let x = 1, i = y * w + 1; x < w - 1; x++, i++) {

            const Ti = T[i], g = K * (0.2 + (Ti < 1 ? Ti : 1));

            u[i] += g * (psi[i + w] - psi[i - w]);

            v[i] -= g * (psi[i + 1] - psi[i - 1]);

          }

        }

      }

      // vorticity confinement — keeps the small curls alive

      if (P.swirl > 0) {

        for (let y = 1; y < h - 1; y++) {

          for (let x = 1, i = y * w + 1; x < w - 1; x++, i++) curl[i] = 0.5 * ((v[i + 1] - v[i - 1]) - (u[i + w] - u[i - w]));

        }

        const eps = P.swirl * 0.08 * h * dt;

        for (let y = 2; y < h - 2; y++) {

          for (let x = 2, i = y * w + 2; x < w - 2; x++, i++) {

            const c = curl[i];

            const nx = Math.abs(curl[i + 1]) - Math.abs(curl[i - 1]);

            const ny = Math.abs(curl[i + w]) - Math.abs(curl[i - w]);

            const s = eps * c / (Math.sqrt(nx * nx + ny * ny) + 1e-5);

            u[i] += ny * s;

            v[i] -= nx * s;

          }

        }

      }

    }



    // open top and sides (p = 0 outside). The floor is solid except under the fuel

    // bed, where it is open: air is drawn up through the fire instead of rushing in

    // from the sides and pinching the whole flame into a single column.

    project(iters, expand) {

      const { w, h, u, v, p, div, src, burn } = this, last = h - 1;

      for (let y = 0, i = 0; y < h; y++) {

        for (let x = 0; x < w; x++, i++) {

          const uL = x > 0 ? u[i - 1] : u[i], uR = x < w - 1 ? u[i + 1] : u[i];

          const vT = y > 0 ? v[i - w] : v[i], vB = y < last ? v[i + w] : src[x] > 0.05 ? v[i] : 0;

          div[i] = 0.5 * (uR - uL + vB - vT) - expand * burn[i];     // burning gas expands

        }

      }

      const om = 1.7;

      for (let k = 0; k < iters; k++) {

        for (let y = 0, i = 0; y < h; y++) {

          const top = y > 0, bot = y < last;

          for (let x = 0; x < w; x++, i++) {

            const s = (x > 0 ? p[i - 1] : 0) + (x < w - 1 ? p[i + 1] : 0) + (top ? p[i - w] : 0) +

              (bot ? p[i + w] : src[x] > 0.05 ? 0 : p[i]);

            p[i] += om * ((s - div[i]) * 0.25 - p[i]);

          }

        }

      }

      for (let y = 0, i = 0; y < h; y++) {

        for (let x = 0; x < w; x++, i++) {

          const pL = x > 0 ? p[i - 1] : 0, pR = x < w - 1 ? p[i + 1] : 0;

          const pT = y > 0 ? p[i - w] : 0, pB = y < last ? p[i + w] : src[x] > 0.05 ? 0 : p[i];

          u[i] -= 0.5 * (pR - pL);

          v[i] -= 0.5 * (pB - pT);

        }

      }

    }



    advect(dt) {

      const { w, h, u, v, T, S, F, u0, v0, T0, S0, F0 } = this;

      u0.set(u); v0.set(v); T0.set(T); S0.set(S); F0.set(F);

      const xm = w - 1.001, ym = h - 1.001, hd = 0.5 * dt;

      for (let y = 0, i = 0; y < h; y++) {

        for (let x = 0; x < w; x++, i++) {

          // midpoint (RK2) back-trace

          let px = x - hd * u0[i], py = y - hd * v0[i];

          px = px < 0 ? 0 : px > xm ? xm : px;

          py = py < 0 ? 0 : py > ym ? ym : py;

          let x0 = px | 0, y0 = py | 0, tx = px - x0, ty = py - y0, k = y0 * w + x0;

          let a = (1 - tx) * (1 - ty), b = tx * (1 - ty), c = (1 - tx) * ty, d = tx * ty;

          const mu = u0[k] * a + u0[k + 1] * b + u0[k + w] * c + u0[k + w + 1] * d;

          const mv = v0[k] * a + v0[k + 1] * b + v0[k + w] * c + v0[k + w + 1] * d;

          px = x - dt * mu; py = y - dt * mv;

          px = px < 0 ? 0 : px > xm ? xm : px;

          py = py < 0 ? 0 : py > ym ? ym : py;

          x0 = px | 0; y0 = py | 0; tx = px - x0; ty = py - y0; k = y0 * w + x0;

          a = (1 - tx) * (1 - ty); b = tx * (1 - ty); c = (1 - tx) * ty; d = tx * ty;

          u[i] = u0[k] * a + u0[k + 1] * b + u0[k + w] * c + u0[k + w + 1] * d;

          v[i] = v0[k] * a + v0[k + 1] * b + v0[k + w] * c + v0[k + w + 1] * d;

          T[i] = T0[k] * a + T0[k + 1] * b + T0[k + w] * c + T0[k + w + 1] * d;

          S[i] = S0[k] * a + S0[k + 1] * b + S0[k + w] * c + S0[k + w + 1] * d;

          F[i] = F0[k] * a + F0[k + 1] * b + F0[k + w] * c + F0[k + w + 1] * d;

        }

      }

    }



    // combustion: fuel burns at a rate modulated by a noise field that scrolls

    // upward with the flame; burning releases heat, heat radiates away

    react(dt, P, t, tex) {

      const { w, h, T, S, F, burn: B } = this;

      const cs = FEAT / (P.grain * h), scroll = t * P.coolRise * FEAT / P.grain;

      const burn = P.burn * dt, k = P.cool * 4.5, yieldK = P.yield * k / P.burn, rad = Math.exp(-dt * k);

      const smoke = P.smoke * 0.35, fade = Math.exp(-dt * 1.1), ceil = 0.22 * h, yb = this.burnerRow(P), body = P.body * h;

      for (let y = 0, i = 0; y < h; y++) {

        const yy = y * cs * P.stretch + scroll, top = y < ceil ? 1 + 5 * (1 - y / ceil) * (1 - y / ceil) : 1;

        const depth = P.bnoise * (0.2 + 0.8 * clamp((yb - y) / body, 0, 1)), flat = (1 - depth) * burn * top, mod = depth * burn * top / 0.77;

        for (let x = 0; x < w; x++, i++) {

          let f = F[i], Ti = T[i];

          if (f > 0.001) {

            const n = noise(tex, x * cs + 91.7, yy);

            let c = (flat + mod * (0.25 + 2.6 * (n > 0.3 ? n - 0.3 : 0))) * (0.35 + f);

            if (c > f) c = f;

            F[i] = f - c;

            Ti += c * yieldK;

            B[i] = c / dt;

          } else { F[i] = 0; B[i] = 0; }

          if (Ti > 0.004) {

            const nt = Ti * rad - 0.02 * dt;

            S[i] = S[i] * fade + (Ti - nt) * smoke;

            T[i] = nt > 0 ? nt : 0;

          } else { T[i] = 0; S[i] *= fade; }

        }

      }

    }

  }



  /* ------------------------------------------------------------- component */

  const STYLE = `

    :host { display: block; position: relative; overflow: hidden; height: 360px; font-size: 12px; line-height: 1;

      font-family: ui-monospace, "Cascadia Mono", "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

      contain: content; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }

    :host([hidden]) { display: none; }

    :host([interactive]) { cursor: crosshair; }

    canvas { position: absolute; left: 0; top: 0; display: block; pointer-events: none; }

    .ascii, .bloom { width: 100%; height: 100%; }

    .bloom { mix-blend-mode: screen; }

    [hidden] { display: none; }

  `;

  const ATTRS = ['preset', 'palette', 'colors', 'glyphs', 'charset', 'intensity', 'wind', 'speed', 'glow', 'embers', 'smoke',

    'flicker', 'brightness', 'quality', 'fps', 'line-height', 'seed', 'interactive', 'paused'];

  const LAYOUT_ATTRS = new Set(['preset', 'quality', 'line-height', 'seed', 'palette', 'colors', 'glyphs', 'charset', 'glow']);



  class AsciiFlame extends HTMLElement {

    static get observedAttributes() { return ATTRS; }



    constructor() {

      super();

      const root = this.attachShadow({ mode: 'open' });

      root.innerHTML = `<style>${STYLE}</style><canvas class="glow" part="glow"></canvas>` +

        `<canvas class="ascii" part="ascii"></canvas><canvas class="bloom" part="bloom"></canvas>`;

      const [glow, ascii, bloom] = root.querySelectorAll('canvas');

      this._glowC = glow; this._asciiC = ascii; this._bloomC = bloom;

      this._gctx = glow.getContext('2d');

      this._actx = ascii.getContext('2d');

      this._bctx = bloom.getContext('2d');

      this._sim = new FlameSim();

      this._embers = [];

      this._emberAcc = 0;

      this._t = 0; this._last = 0; this._raf = 0; this._gust = 0;

      this._scale = 1; this._cost = 0; this._slow = 0;         // adaptive quality

      this._visible = !('IntersectionObserver' in window);     // until the observer reports

      this._params = null; this._L = null; this._atlas = null; this._atlasKey = '';

      this._tick = this._tick.bind(this);

      this._onPointer = this._onPointer.bind(this);

    }



    connectedCallback() {

      if (!this.hasAttribute('role')) this.setAttribute('role', 'img');

      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Animated ASCII fire');

      this._ro = new ResizeObserver(() => this._layout());

      this._ro.observe(this);

      if ('IntersectionObserver' in window) {

        this._io = new IntersectionObserver((es) => { this._visible = es[es.length - 1].isIntersecting; this._schedule(); },

          { rootMargin: '120px' });

        this._io.observe(this);

      }

      this._rm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;

      for (const ev of ['pointermove', 'pointerdown', 'pointerleave']) this.addEventListener(ev, this._onPointer);

      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { this._atlasKey = ''; this._layout(); });

      this._layout();

      this._schedule();

    }



    disconnectedCallback() {

      cancelAnimationFrame(this._raf); this._raf = 0;

      if (this._ro) this._ro.disconnect();

      if (this._io) this._io.disconnect();

      for (const ev of ['pointermove', 'pointerdown', 'pointerleave']) this.removeEventListener(ev, this._onPointer);

    }



    attributeChangedCallback(name, oldV, newV) {

      if (oldV === newV) return;

      this._params = null;

      if (name === 'seed') this._tex = null;

      if (LAYOUT_ATTRS.has(name) && this._L) this._layout();

      this._schedule();

    }



    /* ---- public API ---- */

    play() { this.removeAttribute('paused'); }

    pause() { this.setAttribute('paused', ''); }

    reset() { this._sim.reset(); this._embers.length = 0; this._render(); }

    refresh() { this._atlasKey = ''; this._params = null; this._layout(); }

    gust(strength = 1) { this._gust += +strength || 0; }

    ignite(x = 0.5, y = 0.75, power = 1) {

      const s = this._sim;

      if (!s.w) return;

      const cx = x * s.w - 0.5, cy = y * s.h - 0.5;

      s.splat(cx, cy, s.h * 0.06, 0, -s.h * 0.6 * power, 0.9 * power);

      for (let k = 0; k < 14 * power; k++) this._spawnEmber(cx + (Math.random() - 0.5) * s.h * 0.08, cy, 1.4);

      this._schedule();

    }



    /* ---- parameters ---- */

    _p() {

      if (this._params) return this._params;

      const A = (n) => this.getAttribute(n);

      const num = (n, d, lo, hi) => { const v = parseFloat(A(n)); return clamp(Number.isFinite(v) ? v : d, lo, hi); };

      const name = (A('preset') || 'campfire').trim().toLowerCase();

      const pre = PRESETS[name] || PRESETS.campfire;

      const P = Object.assign({}, BASE, pre);

      const intensity = num('intensity', 1, 0, 3);

      P.preset = PRESETS[name] ? name : 'campfire';

      P.heat = pre.heat * Math.pow(intensity, 0.5);

      P.cool = pre.cool / Math.max(0.3, Math.pow(intensity, 0.6));

      P.wind = num('wind', 0, -3, 3);

      P.speed = num('speed', 1, 0, 4);

      P.glow = num('glow', 0.6, 0, 2);

      P.embers = pre.embers * num('embers', 1, 0, 5);

      P.smoke = pre.smoke * num('smoke', 1, 0, 4);

      P.flicker = pre.flicker * num('flicker', 1, 0, 4);

      P.gain = num('brightness', 1, 0.2, 3);

      P.fps = num('fps', 60, 1, 240);

      P.lineHeight = num('line-height', 1, 0.5, 3);

      P.seed = Math.round(num('seed', 7, 0, 1e6));

      const qn = (A('quality') || '').trim().toLowerCase();

      const q = QUALITY[qn] || QUALITY.medium;

      P.budget = q.budget; P.iters = q.iters; P.autoQuality = !QUALITY[qn];

      P.flickerRate = 1; P.turbRate = 1; P.coolRise = 1;

      P.interactive = this.hasAttribute('interactive') && A('interactive') !== 'false';

      P.paused = this.hasAttribute('paused') && A('paused') !== 'false';

      P.colors = (A('colors') || '').trim();

      P.palette = (A('palette') || 'fire').trim().toLowerCase();

      P.charset = A('charset') || '';

      P.glyphs = (A('glyphs') || 'flame').trim().toLowerCase();

      if (!RAMPS[P.glyphs]) P.glyphs = 'flame';

      P.windNow = P.wind;

      return (this._params = P);

    }



    /* ---- layout: canvases, character grid, simulation grid ---- */

    _layout() {

      const W = this.clientWidth, H = this.clientHeight;

      if (W < 8 || H < 8) return;

      const P = this._p();

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

      const cs = getComputedStyle(this);

      const fs = parseFloat(cs.fontSize) || 12;

      const font = `${(fs * dpr).toFixed(2)}px ${cs.fontFamily || 'monospace'}`;

      const actx = this._actx;

      actx.font = font;

      const cw = Math.max(2, Math.round(actx.measureText('M').width));

      const ch = Math.max(3, Math.round(fs * P.lineHeight * dpr));

      const pw = Math.round(W * dpr), ph = Math.round(H * dpr);

      if (this._asciiC.width !== pw || this._asciiC.height !== ph) { this._asciiC.width = pw; this._asciiC.height = ph; }

      const cols = Math.max(1, Math.floor(pw / cw)), rows = Math.max(1, Math.floor(ph / ch));

      const ox = Math.floor((pw - cols * cw) / 2), oy = ph - rows * ch;



      // simulation grid: square cells, bounded cell budget, never much finer than the text grid

      const cell = Math.max(Math.sqrt((W * H) / (P.budget * this._scale)), (cw / dpr) * 0.75);

      const sw = Math.max(12, Math.round(W / cell)), sh = Math.max(12, Math.round(H / cell));

      const fresh = this._sim.resize(sw, sh);

      this._profile(P, W, H);



      // character-cell centre → simulation coordinates

      const colI = new Int32Array(cols), colT = new Float32Array(cols);

      const rowI = new Int32Array(rows), rowT = new Float32Array(rows);

      for (let c = 0; c < cols; c++) {

        const x = clamp(((ox + (c + 0.5) * cw) / pw) * sw - 0.5, 0, sw - 1.001);

        colI[c] = x | 0; colT[c] = x - (x | 0);

      }

      for (let r = 0; r < rows; r++) {

        const y = clamp(((oy + (r + 0.5) * ch) / ph) * sh - 0.5, 0, sh - 1.001);

        rowI[r] = y | 0; rowT[r] = y - (y | 0);

      }

      const phase = new Float32Array(cols * rows);

      for (let k = 0; k < phase.length; k++) phase[k] = hash(k, 91, P.seed) * 16;



      // glow: one pixel per character cell, stretched and blurred by the compositor

      const g = this._glowC;

      g.width = cols; g.height = rows;

      g.style.left = ox / dpr + 'px'; g.style.top = oy / dpr + 'px';

      g.style.width = (cols * cw) / dpr + 'px'; g.style.height = (rows * ch) / dpr + 'px';

      this._gimg = this._gctx.createImageData(cols, rows);

      this._bloomC.width = Math.max(1, Math.ceil(W / 2)); this._bloomC.height = Math.max(1, Math.ceil(H / 2));



      this._L = { W, H, dpr, pw, ph, cw, ch, cols, rows, ox, oy, sw, sh, colI, colT, rowI, rowT, phase, font, fs };

      this._look(P);

      if (fresh) { this._embers.length = 0; this._warm(); }

      if (!this._raf) this._render();

      this._schedule();

    }



    _profile(P, W, H) {

      const s = this._sim, sw = s.w, src = s.src, aspect = W / H;

      for (let x = 0; x < sw; x++) {

        const fx = (x + 0.5) / sw;

        let e = 0;

        if (P.lanes === 'full') {

          e = smoothstep(0, 0.05, fx) * smoothstep(1, 0.95, fx);

        } else if (P.lanes === 'jets') {

          const n = 7, span = Math.min(0.8, 0.9 / aspect);

          for (let j = 0; j < n; j++) {

            const d = (fx - (0.5 + (j / (n - 1) - 0.5) * span)) * aspect / P.jet;

            e += Math.exp(-0.5 * d * d);

          }

        } else {

          for (const [cx, hw, wt] of P.lanes) { const d = Math.abs((fx - cx) * aspect / hw); e += wt * Math.exp(-0.5 * Math.pow(d, P.shape)); }

        }

        src[x] = e < 0.08 ? 0 : Math.min(1, e);

      }

    }



    // A short synchronous warm-up so the first frame already shows fire. The rest of the

    // ignition is simulated in idle time for flames that aren't animating yet (below the

    // fold, paused), so they're fully grown by the time anyone sees them.

    _warm() {

      const P = this._p();

      for (let k = 0; k < 24; k++) this._step(1 / 60, P);

      let left = 96;

      const idle = window.requestIdleCallback ? (f) => requestIdleCallback(f, { timeout: 400 })

        : (f) => setTimeout(() => f({ didTimeout: true }), 40);

      const work = (dl) => {

        if (!this.isConnected || !this._sim.w) return;

        if (this._raf) { left -= 6; if (left > 0) idle(work); return; }  // live frames are simulating

        const P = this._p();

        let n = dl.didTimeout ? 6 : 1e9;

        while (left > 0 && n-- > 0 && (dl.didTimeout || dl.timeRemaining() > 1.5)) { this._step(1 / 60, P); left--; }

        if (left > 0) idle(work); else this._render();

      };

      idle(work);

    }



    /* ---- palette, glyph tables, sprite atlas, glow styling ---- */

    _look(P) {

      const L = this._L;

      if (!L) return;

      let stops, pkey;

      if (P.colors) { stops = customStops(P.colors); pkey = 'c:' + P.colors; }

      else if (P.palette === 'mono') {

        const c = getComputedStyle(this).color;

        stops = monoStops(parseColor(c)); pkey = 'm:' + c;

      } else { stops = PALETTES[P.palette] || PALETTES.fire; pkey = 'p:' + (PALETTES[P.palette] ? P.palette : 'fire'); }



      // glyph ramp: custom charset ("abc" → one per level, "ab cd" → variant groups) or built-in

      let ramp;

      if (P.charset.trim()) {

        const cs = P.charset.replace(/^\s+|\s+$/g, '');

        ramp = /\s/.test(cs) ? cs.split(/\s+/) : Array.from(cs);

      } else ramp = RAMPS[P.glyphs];

      const gkey = P.charset ? 'x:' + P.charset : 'g:' + P.glyphs;



      const key = [L.font, L.cw, L.ch, pkey, gkey].join('|');

      if (key !== this._atlasKey) {

        const chars = [];

        const idx = (ch) => { let i = chars.indexOf(ch); if (i < 0) { i = chars.length; chars.push(ch); } return i; };

        this._levels = ramp.map(level => Array.from(level).map(idx));

        this._flow = P.glyphs === 'flow' && !P.charset ? {

          v: Array.from(FLOW.v).map(idx), r: idx(FLOW.r), l: idx(FLOW.l), h: idx(FLOW.h)

        } : null;

        this._emberG = Array.from(EMBER_CHARS).map(idx);

        this._smokeG = Array.from(SMOKE_CHARS).map(idx);

        const lut = buildLUT(stops, LEVELS);

        this._lut = lut;

        this._rgb = lut.map(c => [c[0] | 0, c[1] | 0, c[2] | 0]);

        this._buildAtlas(L, chars, lut.concat(buildLUT(SMOKE_STOPS, SMOKE_LEVELS)));

        this._atlasKey = key;

      }



      const glow = clamp(P.glow, 0, 2), cssCh = L.ch / L.dpr;

      this._glowC.hidden = this._bloomC.hidden = glow <= 0;

      this._glowC.style.filter = `blur(${(cssCh * 1.4).toFixed(1)}px)`;

      this._glowC.style.opacity = Math.min(1, glow * 0.75).toFixed(3);

      this._bloomC.style.filter = `blur(${Math.max(1.5, cssCh * 0.28).toFixed(1)}px) brightness(1.3)`;

      this._bloomC.style.opacity = Math.min(1, glow * 0.8).toFixed(3);

    }



    _buildAtlas(L, chars, colors) {

      const a = this._atlas || (this._atlas = document.createElement('canvas'));

      a.width = Math.max(1, chars.length * L.cw);

      a.height = colors.length * L.ch;

      const x = a.getContext('2d');

      x.clearRect(0, 0, a.width, a.height);

      x.font = L.font;

      x.textAlign = 'center';

      x.textBaseline = 'middle';

      for (let row = 0; row < colors.length; row++) {

        const c = colors[row];

        x.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;

        const cy = row * L.ch + L.ch * 0.54;

        for (let k = 0; k < chars.length; k++) x.fillText(chars[k], k * L.cw + L.cw / 2, cy);

      }

    }



    /* ---- live numbers, handy for tuning and debugging ---- */

    get stats() {

      const L = this._L, s = this._sim;

      return { glyphs: this._drawn || 0, cols: L ? L.cols : 0, rows: L ? L.rows : 0, grid: s.w + '×' + s.h,

        embers: this._embers.length, frameMs: +this._cost.toFixed(2), running: !!this._raf };

    }



    /* ---- animation loop ---- */

    _schedule() {

      const P = this._p();

      const run = this.isConnected && this._visible && !P.paused && !!this._L;

      if (run && !this._raf) { this._last = performance.now(); this._raf = requestAnimationFrame(this._tick); }

      else if (!run && this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; }

    }



    _tick(now) {

      this._raf = requestAnimationFrame(this._tick);

      const P = this._p(), reduced = !!(this._rm && this._rm.matches);

      const elapsed = now - this._last;

      if (elapsed < 1000 / (reduced ? Math.min(P.fps, 24) : P.fps) - 2) return;

      this._last = now;

      let dt = Math.min(elapsed / 1000, 0.1) * P.speed * (reduced ? 0.4 : 1);

      const t0 = performance.now();

      while (dt > 1e-4) { const h = Math.min(dt, 1 / 30); this._step(h, P); dt -= h; }

      this._render();

      // adaptive quality: if frames stay expensive, coarsen the simulation grid

      this._cost += ((performance.now() - t0) - this._cost) * 0.05;

      if (P.autoQuality && this._scale > 0.3 && ++this._slow > 90) {

        this._slow = 0;

        if (this._cost > 12) { this._scale *= 0.7; this._cost = 6; this._layout(); }

      }

    }



    _step(dt, P) {

      const s = this._sim;

      if (!s.w) return;

      if (!this._tex) this._tex = noiseTexture(P.seed);

      const tex = this._tex;

      this._t += dt;

      const t = this._t;

      this._gust *= Math.exp(-dt * 1.2);

      P.windNow = P.wind + this._gust + P.sway * 4 * (noise(tex, t * 11, 5.5) - 0.5);

      s.step(dt, P, t, tex);

      this._updateEmbers(dt, P, t, tex);

    }



    /* ---- embers: sparks that ride the flow ---- */

    _spawnEmber(x, y, boost) {

      const s = this._sim, r = Math.random;

      if (this._embers.length > 160) return;

      this._embers.push({ x, y, vx: (r() - 0.5) * s.h * 0.4 * boost, vy: -s.h * (0.25 + r() * 0.55) * boost,

        life: 0, max: 0.7 + r() * 1.7, seed: r() * 128, g: (r() * 64) | 0, heat: 0.7 + r() * 0.3 });

    }



    _updateEmbers(dt, P, t, tex) {

      const s = this._sim, E = this._embers;

      if (P.embers > 0) {

        let cover = 0;

        for (let x = 0; x < s.w; x++) cover += s.src[x];

        this._emberAcc += dt * P.embers * 14 * (cover / s.w);

        const yb = s.burnerRow(P);

        for (let tries = 0; this._emberAcc >= 1 && tries < 12; tries++) {

          const x = Math.random() * (s.w - 1), y = yb - Math.random() * s.h * 0.22;

          if (Math.random() > s.src[x | 0] || s.sample(s.T, x, y) < 0.3) continue;

          this._emberAcc -= 1;

          this._spawnEmber(x, y, 1);

        }

        if (this._emberAcc > 3) this._emberAcc = 3;

      }

      const drag = 1 - Math.exp(-dt * 2.5);

      for (let k = E.length - 1; k >= 0; k--) {

        const e = E[k];

        e.life += dt;

        if (e.life >= e.max || e.y < -1 || e.x < -1 || e.x > s.w) { E[k] = E[E.length - 1]; E.pop(); continue; }

        const fu = s.sample(s.u, e.x, e.y), fv = s.sample(s.v, e.x, e.y);

        e.vx += (fu - e.vx) * drag + (noise(tex, e.seed, t * 40 + e.seed) - 0.5) * s.h * 6 * dt;

        e.vy += (fv - e.vy) * drag - s.h * 0.2 * dt;

        e.x += e.vx * dt;

        e.y += e.vy * dt;

      }

    }



    /* ---- pointer: stir the air, drag to paint heat, click to ignite ---- */

    _onPointer(e) {

      const P = this._p(), s = this._sim;

      if (!P.interactive || !s.w) return;

      if (e.type === 'pointerleave') { this._ptr = null; return; }

      const rect = this.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width, y = (e.clientY - rect.top) / rect.height, now = performance.now();

      if (e.type === 'pointerdown') { this.ignite(x, y, 0.8); this._ptr = { x, y, t: now }; return; }

      const lp = this._ptr;

      if (lp && now - lp.t < 200) {

        const dt = Math.max(0.008, (now - lp.t) / 1000), lim = s.h * 3;

        const du = clamp(((x - lp.x) * s.w) / dt, -lim, lim), dv = clamp(((y - lp.y) * s.h) / dt, -lim, lim);

        s.splat(x * s.w - 0.5, y * s.h - 0.5, s.h * 0.05, du * 0.25, dv * 0.25, e.buttons & 1 ? 0.3 : 0);

      }

      this._ptr = { x, y, t: now };

    }



    /* ---- render: heat → glyph + colour, sprites blitted from the atlas ---- */

    _render() {

      const L = this._L, atlas = this._atlas;

      if (!L || !atlas || !this._sim.w) return;

      const P = this._p(), s = this._sim, T = s.T, S = s.S, U = s.u, V = s.v, sw = s.w;

      const ctx = this._actx, gd = this._gimg.data, rgb = this._rgb;

      const { cols, rows, cw, ch, ox, oy, colI, colT, rowI, rowT, phase } = L;

      const levels = this._levels, nl = levels.length, flow = this._flow, sg = this._smokeG;

      const gain = P.gain, smokeOn = P.smoke > 0.01, top = LEVELS - 1, epoch = this._t * 2.2;

      const vmin2 = (0.18 * s.h) * (0.18 * s.h);

      ctx.clearRect(0, 0, L.pw, L.ph);

      let drawn = 0;

      for (let r = 0, gi = 0; r < rows; r++) {

        const ty = rowT[r], rb = rowI[r] * sw, dy = oy + r * ch, rc = r * cols;

        for (let c = 0; c < cols; c++, gi += 4) {

          const k = rb + colI[c], tx = colT[c];

          const a = T[k], b = T[k + 1], d = T[k + sw], e = T[k + sw + 1];

          const heat = (a + (b - a) * tx + (d - a) * ty + (a - b - d + e) * tx * ty) * gain;

          let I = heat > 0.04 ? 1 - Math.exp(-1.6 * heat) : 0;       // filmic roll-off toward white

          if (I < 0.06) {

            gd[gi + 3] = 0;

            if (smokeOn) {

              const sm = S[k] * 1.6;

              if (sm > 0.06) {

                const lv = sm >= 1 ? SMOKE_LEVELS - 1 : (sm * SMOKE_LEVELS) | 0;

                const g = sg[(hash(c, r, (epoch * 0.5 + phase[rc + c]) | 0) * sg.length) | 0];

                ctx.drawImage(atlas, g * cw, (LEVELS + lv) * ch, cw, ch, ox + c * cw, dy, cw, ch);

                drawn++;

              }

            }

            continue;

          }

          if (I > 1) I = 1;

          const cl = (I * top) | 0;

          let li = (I * nl + BAYER[((r & 3) << 2) | (c & 3)] - 0.5) | 0;

          li = li < 0 ? 0 : li >= nl ? nl - 1 : li;

          const vs = levels[li];

          let g = vs.length === 1 ? vs[0] : vs[(hash(c, r, (epoch + phase[rc + c]) | 0) * vs.length) | 0];

          if (flow && I > 0.08 && I < 0.55) {

            const ax = U[k], ay = -V[k];

            if (ax * ax + ay * ay > vmin2) {

              const q = ax / (Math.abs(ay) + 1e-3);

              g = q > 2.4 || q < -2.4 ? flow.h

                : q > 0.45 ? (ay > 0 ? flow.r : flow.l)

                : q < -0.45 ? (ay > 0 ? flow.l : flow.r)

                : flow.v[(phase[rc + c] | 0) % flow.v.length];

            }

          }

          ctx.drawImage(atlas, g * cw, cl * ch, cw, ch, ox + c * cw, dy, cw, ch);

          drawn++;

          const col = rgb[cl];

          gd[gi] = col[0]; gd[gi + 1] = col[1]; gd[gi + 2] = col[2]; gd[gi + 3] = I * 255;

        }

      }



      const E = this._embers;

      if (E.length) {

        const eg = this._emberG, sx = L.pw / sw, sy = L.ph / s.h;

        for (let n = 0; n < E.length; n++) {

          const em = E[n];

          const c = Math.floor(((em.x + 0.5) * sx - ox) / cw), r = Math.floor(((em.y + 0.5) * sy - oy) / ch);

          if (c < 0 || c >= cols || r < 0 || r >= rows) continue;

          const f = 1 - em.life / em.max, fl = 0.72 + 0.28 * Math.sin(em.seed * 7 + this._t * 23);

          const I = clamp(em.heat * Math.sqrt(f) * fl, 0.15, 1), cl = (I * top) | 0, g = eg[em.g % eg.length];

          ctx.drawImage(atlas, g * cw, cl * ch, cw, ch, ox + c * cw, oy + r * ch, cw, ch);

          drawn++;

          const gi = (r * cols + c) * 4, col = rgb[cl];

          if (gd[gi + 3] < I * 200) { gd[gi] = col[0]; gd[gi + 1] = col[1]; gd[gi + 2] = col[2]; gd[gi + 3] = I * 200; }

        }

      }



      this._drawn = drawn;

      if (!this._glowC.hidden) {

        this._gctx.putImageData(this._gimg, 0, 0);

        const b = this._bloomC, bx = this._bctx;

        bx.clearRect(0, 0, b.width, b.height);

        bx.drawImage(this._asciiC, 0, 0, b.width, b.height);

      }

    }

  }



  /* ---- reflected properties ---- */

  const proto = AsciiFlame.prototype;

  const NUM_DEFAULTS = { intensity: 1, wind: 0, speed: 1, glow: 0.6, embers: 1, smoke: 1, flicker: 1, brightness: 1, fps: 60, seed: 7 };

  const prop = (n, get, set) => Object.defineProperty(proto, n, { configurable: true, enumerable: true, get, set });

  for (const n of ['preset', 'palette', 'colors', 'glyphs', 'charset', 'quality']) {

    prop(n, function () { return this.getAttribute(n); },

      function (v) { v == null ? this.removeAttribute(n) : this.setAttribute(n, String(v)); });

  }

  for (const n of Object.keys(NUM_DEFAULTS)) {

    prop(n, function () { const v = parseFloat(this.getAttribute(n)); return Number.isFinite(v) ? v : NUM_DEFAULTS[n]; },

      function (v) { v == null ? this.removeAttribute(n) : this.setAttribute(n, String(v)); });

  }

  for (const n of ['paused', 'interactive']) {

    prop(n, function () { return this.hasAttribute(n) && this.getAttribute(n) !== 'false'; },

      function (v) { this.toggleAttribute(n, !!v); });

  }

  // properties set before the element upgraded (e.g. by a framework) are re-applied through the setters

  const connected = proto.connectedCallback;

  proto.connectedCallback = function () {

    for (const n of ['preset', 'palette', 'colors', 'glyphs', 'charset', 'quality', 'paused', 'interactive', ...Object.keys(NUM_DEFAULTS)]) {

      if (Object.prototype.hasOwnProperty.call(this, n)) { const v = this[n]; delete this[n]; this[n] = v; }

    }

    connected.call(this);

  };



  AsciiFlame.presets = Object.keys(PRESETS);

  AsciiFlame.palettes = Object.keys(PALETTES).concat('mono');

  AsciiFlame.glyphSets = Object.keys(RAMPS);

  window.AsciiFlame = AsciiFlame;

  customElements.define('ascii-flame', AsciiFlame);

})();
````
