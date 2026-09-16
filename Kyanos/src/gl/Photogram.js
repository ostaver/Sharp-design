// The hero: a sheet of sensitised paper under the visitor's lamp.
// Light accumulates in a ping-pong target; the sheet shader turns it into the colours of a
// real print. The tray water already laps at the foot of the sheet; scrolling lowers the sheet
// in, lifting the specimens off as the water climbs over the paper.
import gsap from 'gsap';
import { Mesh, Plane, Program, RenderTarget, Texture } from 'ogl';
import { fullscreenVert, hash, palette, planeVert } from './glsl.js';
import { composeSheet } from '../specimens/compose.js';
import { pointer } from '../lib/pointer.js';
import { damp, smoothstep } from '../lib/rng.js';

const LMAX = 6; // light-seconds that map to 1.0 in the accumulation target
const K = 1.5; // how quickly the coat greys, per light-second
const LAMP = 0.085; // lamp radius, in sheet heights
const AMBIENT = 0.012; // the open sky slowly exposes everything, lamp or not
const LENS = 0.052; // the burning glass that stands in for the cursor, radius in sheet heights
const TIDE = 0.026; // how far up the sheet the tray water laps before the wash begins

const simFragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uPrev;
uniform float uAspect;
uniform vec3 uLamp;      // uv, strength
uniform vec4 uSweep;     // uv, strength, radius
uniform float uDt;
uniform float uDecay;    // > 0 while a fresh coat goes on
uniform float uQuant;    // 1 on 8-bit targets: round the increment stochastically
uniform float uSeed;
${hash}
float gauss(vec2 c, float s) {
  vec2 d = (vUv - c) * vec2(uAspect, 1.0);
  return exp(-dot(d, d) / (2.0 * s * s));
}
void main() {
  float prev = texture(uPrev, vUv).r;
  float light = uLamp.z * gauss(uLamp.xy, ${LAMP}) + uSweep.z * gauss(uSweep.xy, uSweep.w) + ${AMBIENT};
  float inc = light * uDt / ${LMAX.toFixed(1)};
  if (uQuant > 0.5) inc = floor(inc * 255.0 + hash12(vUv * 3000.0 + uSeed)) / 255.0;
  float v = clamp(prev * (1.0 - uDecay) + inc, 0.0, 1.0);
  fragColor = vec4(v, v, v, 1.0);
}`;

const sheetFragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uLight;
uniform sampler2D uPlants;
uniform sampler2D uNeg;
uniform sampler2D uNoise;
uniform vec2 uSize;
uniform float uTime;
uniform vec3 uLamp;      // uv, strength
uniform vec3 uLens;      // the burning glass over the pointer: uv, strength
uniform float uBoost;    // the sun finishing the exposure
uniform float uLift;     // specimens lifted off the sheet
uniform float uWash;     // how far the sheet has been lowered into the water
uniform float uOx;       // oxidation deepening the blue
uniform float uPlace;    // specimens laid down
uniform float uFloor;    // part of the sheet hidden below the screen (mobile browser chrome)
${hash}
${palette}

float heightAt(vec2 p) {
  return texture(uNoise, p * 0.5 + vec2(0.0, uTime * 0.12)).g
       + 0.5 * texture(uNoise, p * 1.3 - uTime * vec2(0.05, 0.09)).r;
}

void main() {
  float aspect = uSize.x / uSize.y;
  vec2 asp = vec2(aspect, 1.0);

  // The burning glass magnifies the paper beneath it.
  vec2 toLens = (vUv - uLens.xy) * asp;
  float lr = length(toLens) / ${LENS};
  float glass = (1.0 - smoothstep(0.97, 1.0, lr)) * uLens.z;
  vec2 lensed = vUv - (vUv - uLens.xy) * glass * 0.26 * max(1.0 - lr * lr, 0.0);
  vec2 uv = lensed;

  // Tray water. Before the wash it laps at the foot of the sheet, rocking gently and already
  // clearing the coat it touches; the scroll lowers the sheet in until the water covers it.
  float rise = smoothstep(0.0, 0.15, uWash);
  float rock = sin(uTime * 1.2) * 0.003 + sin(uTime * 0.7 + uv.x * 5.0) * 0.002;
  float wick = (texture(uNoise, vec2(uv.x * uSize.x / 900.0, 0.37)).g - 0.5) * 0.006;
  float wobble = (texture(uNoise, vec2(uv.x * 0.9 + 0.2, 0.3)).r - 0.5) * 0.22
               + (texture(uNoise, vec2(uv.x * 1.7, 0.6 + uTime * 0.02)).g - 0.5) * 0.035;
  float s = uFloor + mix(${TIDE}, 1.36, uWash) + mix(rock + wick, wobble, rise) - uv.y;
  float wet = smoothstep(-0.004, mix(0.004, 0.05, rise), s);
  float ripple = smoothstep(0.0, mix(0.006, 0.03, rise), s) * exp(-max(s, 0.0) * mix(34.0, 3.0, rise))
               * (1.0 - smoothstep(0.82, 1.0, uWash));
  vec2 w = uv * asp * 2.2;
  float h0 = heightAt(w);
  vec2 grad = vec2(heightAt(w + vec2(0.01, 0.0)) - h0, heightAt(w + vec2(0.0, 0.01)) - h0) / 0.01;
  uv += grad * ripple * 0.0045;

  // Exposure: the light that reached the paper past the specimens and the film.
  float light = texture(uLight, uv).r * ${LMAX.toFixed(1)};
  float n1 = texture(uNoise, uv * asp * 0.9).r;
  float n2 = texture(uNoise, vec2(uv.x * aspect * 0.35, uv.y * 3.5)).b;
  float coat = 0.85 + (n1 - 0.5) * 0.35 + (n2 - 0.5) * 0.2;
  float plant = texture(uPlants, uv).a;
  float ink = texture(uNeg, uv).a;
  float E = 1.0 - exp(-${K.toFixed(1)} * max(light, uBoost * 1.15) * (1.0 - plant) * (1.0 - ink * 0.97) * coat);

  float fibre = texture(uNoise, uv * uSize / 600.0).a;
  vec3 sun = exposingTone(E) * (0.985 + (fibre - 0.5) * 0.05);
  vec3 washed = washedTone(E * (0.94 + (n1 - 0.5) * 0.12), uOx) * (0.975 + (fibre - 0.5) * 0.06);
  vec3 col = mix(sun, washed, wet);

  // Paper just above the water line has drunk a little and sits a shade darker.
  col *= 1.0 - (1.0 - smoothstep(0.0, 0.035, -s)) * (1.0 - wet) * (1.0 - rise) * 0.07;

  // The water itself: glints on the ripples and a bright meniscus where it meets dry paper.
  vec3 N = normalize(vec3(-grad * 0.16, 1.0));
  float spec = pow(max(dot(N, normalize(vec3(-0.25, 0.35, 1.0))), 0.0), 90.0);
  col *= 1.0 - ripple * 0.14;
  col += spec * ripple * 0.32;
  float meniscus = exp(-abs(s) * mix(300.0, 110.0, rise)) * (1.0 - smoothstep(0.85, 1.0, uWash));
  col += meniscus * mix(0.2, 0.22, rise) * (0.6 + 0.4 * texture(uNoise, vec2(uv.x * 6.0, uTime * 0.3)).g);

  // Specimens lying on the sheet, casting soft shadows away from the lamp.
  vec2 toLamp = (vUv - uLamp.xy) * asp;
  float lamp = exp(-dot(toLamp, toLamp) / ${(2 * LAMP * LAMP).toFixed(5)}) * uLamp.z;
  vec2 luv = (lensed - 0.5) / (1.0 + uLift * 0.04 + (1.0 - uPlace) * 0.03) + 0.5;
  float show = uPlace * (1.0 - smoothstep(0.25, 1.0, uLift)) * (1.0 - wet);
  vec2 dir = toLamp / max(length(toLamp), 0.001);
  vec2 off = (dir * 0.0045 * uLamp.z + vec2(0.0, -0.006)) * (1.0 + uLift * 6.0 + (1.0 - uPlace) * 4.0);
  off.x /= aspect;
  float shadow = textureLod(uPlants, luv - off, 2.5 + uLift * 2.5).a * show;
  col *= 1.0 - shadow * 0.24;
  vec3 dried = mix(vec3(0.5, 0.49, 0.34), vec3(0.4, 0.405, 0.28), n1) + lamp * vec3(0.12, 0.11, 0.07);
  col = mix(col, dried, texture(uPlants, luv).a * show * 0.94);

  // The film negative: faint ink on clear acetate, hard to see until the paper darkens.
  col *= 1.0 - ink * 0.045 * (1.0 - wet);

  // The lamp, felt as warm light on the unwashed coat.
  col += vec3(1.0, 0.96, 0.82) * lamp * 0.1 * (1.0 - wet);

  // The glass itself: the hot point where it gathers the sun, a darker edge, a thin bright
  // rim, and the faint ring of shadow it throws on the paper.
  float d = length(toLens);
  col += vec3(1.0, 0.97, 0.86) * exp(-d * d / 0.00024) * uLens.z * 0.22 * (1.0 - wet);
  col *= 1.0 - smoothstep(0.7, 1.0, lr) * glass * 0.06;
  col += exp(-pow((lr - 1.0) * 24.0, 2.0)) * uLens.z * 0.16;
  float halo = length(toLens - vec2(0.004, -0.007)) / ${LENS};
  col *= 1.0 - exp(-pow((halo - 1.0) * 12.0, 2.0)) * uLens.z * 0.08 * (1.0 - glass);

  col += (hash12(gl_FragCoord.xy) - 0.5) * 0.03;
  fragColor = vec4(col, 1.0);
}`;

export class Photogram {
  constructor(stage, { el, font, reduced = false }) {
    this.stage = stage;
    this.el = el;
    this.font = font;
    this.reduced = reduced;
    this.width = 0;
    this.height = 0;
    this.lamp = { x: 0.5, y: 0.5, on: 0 };
    this.lens = { x: 0.5, y: 0.5, on: 0 };
    this.sweep = { x: -1, y: 0.5, on: 0, radius: 0.18 };
    this.state = { boost: 0, lift: 0, wash: 0, ox: 0, place: 0 };
    this.floor = 0;
    this.decay = 0;
    this.hold = false; // true while the pointer rests on the hero's buttons
    this.exposing = !reduced;
    this.coverage = 0;
    this.lit = 0; // seconds of lamp or sun the sheet has had, for its label on the line
    this.dirtyBake = true;
    this.targets = [];
    this.baked = null;

    const gl = stage.gl;
    this.plants = new Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR });
    this.negative = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR });

    const sheetUniforms = (overrides) => ({
      uLight: { value: null },
      uPlants: { value: this.plants },
      uNeg: { value: this.negative },
      uNoise: { value: stage.noise },
      uSize: { value: [1, 1] },
      uTime: { value: 0 },
      uLamp: { value: [0.5, 0.5, 0] },
      uLens: { value: [0.5, 0.5, 0] },
      uBoost: { value: 0 },
      uLift: { value: 0 },
      uWash: { value: 0 },
      uOx: { value: 0 },
      uPlace: { value: 0 },
      uFloor: { value: 0 },
      ...overrides,
    });
    const flat = { cullFace: false, depthTest: false, depthWrite: false };

    this.program = new Program(gl, { vertex: planeVert, fragment: sheetFragment, uniforms: sheetUniforms({}), ...flat });
    this.mesh = new Mesh(gl, { geometry: new Plane(gl), program: this.program, renderOrder: 1 });
    this.mesh.setParent(stage.scene);

    this.sim = new Program(gl, {
      vertex: fullscreenVert,
      fragment: simFragment,
      uniforms: {
        uPrev: { value: null },
        uAspect: { value: 1 },
        uLamp: { value: [0, 0, 0] },
        uSweep: { value: [0, 0, 0, 0.18] },
        uDt: { value: 0 },
        uDecay: { value: 0 },
        uQuant: { value: stage.float ? 0 : 1 },
        uSeed: { value: 0 },
      },
      ...flat,
    });
    this.simMesh = new Mesh(gl, { geometry: stage.triangle, program: this.sim });

    // The finished print, rendered once for plate 000 on the drying line.
    this.bakeProgram = new Program(gl, {
      vertex: fullscreenVert,
      fragment: sheetFragment,
      uniforms: sheetUniforms({ uBoost: { value: 1 }, uLift: { value: 1 }, uWash: { value: 1 }, uOx: { value: 1 } }),
      ...flat,
    });
    this.bakeMesh = new Mesh(gl, { geometry: stage.triangle, program: this.bakeProgram });

    this.setProgress(reduced ? 1 : 0);
    this.build();
  }

  build() {
    const r = this.el.getBoundingClientRect();
    this.width = Math.max(1, r.width);
    this.height = Math.max(1, r.height);
    const scale = Math.min(window.devicePixelRatio || 1, 1.5, 2400 / this.width);
    const { plants, negative } = composeSheet(this.width, this.height, { scale, font: this.font });
    this.plants.image = plants;
    this.plants.needsUpdate = true;
    this.negative.image = negative;
    this.negative.needsUpdate = true;
    this.plants.update();
    this.negative.update();

    this.allocate();
    this.gx = 48;
    this.gy = Math.max(12, Math.round((48 * this.height) / this.width));
    this.grid = new Float32Array(this.gx * this.gy);
    this.coverage = 0;
    this.dirtyBake = true;
    this.program.uniforms.uSize.value = [this.width, this.height];
    this.bakeProgram.uniforms.uSize.value = [this.width, this.height];
    this.sim.uniforms.uAspect.value = this.width / this.height;
  }

  allocate() {
    const gl = this.stage.gl;
    this.targets.forEach((t) => this.dispose(t));
    const options = {
      width: Math.max(32, Math.round(this.width / 4)),
      height: Math.max(32, Math.round(this.height / 4)),
      depth: false,
      format: gl.RGBA,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      ...(this.stage.float || {}),
    };
    this.read = new RenderTarget(gl, options);
    this.write = new RenderTarget(gl, options);
    this.targets = [this.read, this.write];
    this.program.uniforms.uLight.value = this.read.texture;
    this.bakeProgram.uniforms.uLight.value = this.read.texture;
  }

  dispose(target) {
    const gl = this.stage.gl;
    gl.deleteFramebuffer(target.buffer);
    gl.deleteTexture(target.texture.texture);
  }

  // Mobile browser chrome nudges the height constantly; only a real change rebuilds the sheet.
  resize() {
    const r = this.el.getBoundingClientRect();
    if (Math.abs(r.width - this.width) < 2 && Math.abs(r.height - this.height) / this.height < 0.2) return;
    clearTimeout(this.rebuild);
    this.rebuild = setTimeout(() => this.build(), 200);
  }

  // Scroll through the hero: finish the exposure, lift the specimens, wash, let it oxidise.
  setProgress(p) {
    const s = this.state;
    s.boost = smoothstep(0, 0.2, p);
    s.lift = smoothstep(0.06, 0.3, p);
    s.wash = smoothstep(0.24, 0.9, p);
    s.ox = smoothstep(0.7, 1, p);
    this.exposing = !this.reduced && p < 0.015;
    document.documentElement.classList.toggle('exposing', this.exposing);
  }

  intro() {
    if (this.reduced) return;
    gsap.fromTo(this.state, { place: 0 }, { place: 1, duration: 1.8, ease: 'power3.out', delay: 0.2 });
    this.sweepAcross({ from: [-0.25, 0.3], to: [1.25, 0.66], duration: 3.6, strength: 1.35, radius: 0.16, delay: 1 });
  }

  sweepAcross({ from, to, duration, strength, radius, delay = 0 }) {
    const s = this.sweep;
    gsap.killTweensOf(s);
    s.radius = radius;
    return gsap
      .timeline({ delay })
      .fromTo(s, { x: from[0], y: from[1] }, { x: to[0], y: to[1], duration, ease: 'sine.inOut' }, 0)
      .fromTo(s, { on: 0 }, { on: strength, duration: duration * 0.3, ease: 'sine.out' }, 0)
      .to(s, { on: 0, duration: duration * 0.3, ease: 'sine.in' }, duration * 0.7);
  }

  // "Let the sun in": a slow, broad pass for keyboards, touch, and the impatient.
  sunSweep() {
    if (!this.exposing) return;
    this.sweepAcross({ from: [-0.35, 0.18], to: [1.35, 0.82], duration: 4.4, strength: 1.7, radius: 0.34 });
  }

  // A fresh coat: the old exposure fades out and the specimens are laid down again.
  recoat() {
    gsap.killTweensOf(this.sweep);
    this.sweep.on = 0;
    gsap.fromTo(this, { decay: 0.3 }, { decay: 0, duration: 1.2, ease: 'power2.in' });
    this.grid.fill(0);
    this.coverage = 0;
    this.lit = 0;
    gsap.fromTo(this.state, { place: 0 }, { place: 1, duration: 1.6, ease: 'power3.out', delay: 0.4 });
  }

  update(time, dt) {
    const r = this.el.getBoundingClientRect();
    const visible = r.bottom > 0 && r.top < this.stage.h;
    this.mesh.visible = visible;
    if (!visible) return;
    this.stage.place(this.mesh, r);

    const running = this.exposing;
    this.steer(r, dt, running);
    if (running) this.expose(dt);

    // keep the tide in sight when mobile browser chrome covers the bottom of the sheet
    const floor = Math.max(0, r.bottom - this.stage.h) / r.height;
    this.floor += (floor - this.floor) * damp(6, dt);

    const u = this.program.uniforms;
    const s = this.state;
    u.uLight.value = this.read.texture;
    u.uTime.value = time;
    u.uLamp.value[0] = this.lamp.x;
    u.uLamp.value[1] = this.lamp.y;
    u.uLamp.value[2] = this.lamp.on;
    u.uLens.value[0] = this.lens.x;
    u.uLens.value[1] = this.lens.y;
    u.uLens.value[2] = this.lens.on;
    u.uBoost.value = s.boost;
    u.uLift.value = s.lift;
    u.uWash.value = s.wash;
    u.uOx.value = s.ox;
    u.uPlace.value = s.place;
    u.uFloor.value = this.floor;
  }

  // The lamp follows a mouse over the sheet, or a finger pressed to it. A mouse also carries
  // the burning glass, drawn exactly under the pointer while the light trails a little behind.
  steer(r, dt, running) {
    const inside = pointer.active && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
    const want = running && inside && !this.hold && (pointer.type === 'mouse' || pointer.down) ? 1 : 0;
    const tx = (pointer.x - r.left) / r.width;
    const ty = 1 - (pointer.y - r.top) / r.height;
    if (want && this.lamp.on < 0.02) {
      this.lamp.x = tx;
      this.lamp.y = ty;
    }
    if (inside) {
      const k = damp(12, dt);
      this.lamp.x += (tx - this.lamp.x) * k;
      this.lamp.y += (ty - this.lamp.y) * k;
      this.lens.x = tx;
      this.lens.y = ty;
    }
    this.lamp.on += (want - this.lamp.on) * damp(want ? 5 : 2.5, dt);
    const glass = want && pointer.type === 'mouse' ? 1 : 0;
    this.lens.on += (glass - this.lens.on) * damp(glass ? 12 : 8, dt);
  }

  expose(dt) {
    const step = Math.min(dt, 1 / 20);
    const s = this.sim.uniforms;
    s.uPrev.value = this.read.texture;
    s.uDt.value = step;
    s.uLamp.value[0] = this.lamp.x;
    s.uLamp.value[1] = this.lamp.y;
    s.uLamp.value[2] = this.lamp.on;
    s.uSweep.value[0] = this.sweep.x;
    s.uSweep.value[1] = this.sweep.y;
    s.uSweep.value[2] = this.sweep.on;
    s.uSweep.value[3] = this.sweep.radius;
    s.uDecay.value = this.decay;
    s.uSeed.value = (s.uSeed.value + 17.13) % 1000;
    this.stage.renderer.render({ scene: this.simMesh, target: this.write });
    [this.read, this.write] = [this.write, this.read];
    if (this.lamp.on > 0.5 || this.sweep.on > 0.3) this.lit += step;
    this.tally(step);
    this.dirtyBake = true;
  }

  // The same light, integrated on a coarse CPU grid, to report how much of the sheet is exposed.
  tally(dt) {
    const { gx, gy, grid, lamp, sweep } = this;
    const aspect = this.width / this.height;
    const lampK = 1 / (2 * LAMP * LAMP);
    const sweepK = 1 / (2 * sweep.radius * sweep.radius);
    const keep = 1 - this.decay;
    const threshold = Math.log(2) / K; // exposure above one half
    let lit = 0;
    for (let j = 0; j < gy; j++) {
      const v = (j + 0.5) / gy;
      for (let i = 0; i < gx; i++) {
        const u = (i + 0.5) / gx;
        let light = AMBIENT;
        if (lamp.on > 0.001) {
          const dx = (u - lamp.x) * aspect;
          const dy = v - lamp.y;
          light += lamp.on * Math.exp(-(dx * dx + dy * dy) * lampK);
        }
        if (sweep.on > 0.001) {
          const dx = (u - sweep.x) * aspect;
          const dy = v - sweep.y;
          light += sweep.on * Math.exp(-(dx * dx + dy * dy) * sweepK);
        }
        const k = j * gx + i;
        grid[k] = Math.min(LMAX, grid[k] * keep + light * dt);
        if (grid[k] > threshold) lit++;
      }
    }
    this.coverage = lit / (gx * gy);
  }

  bake() {
    const gl = this.stage.gl;
    const w = 960;
    const h = Math.max(1, Math.round(960 / (this.width / this.height)));
    if (!this.baked || this.baked.width !== w || this.baked.height !== h) {
      if (this.baked) this.dispose(this.baked);
      this.baked = new RenderTarget(gl, { width: w, height: h, depth: false, minFilter: gl.LINEAR });
    }
    this.draw(this.baked);
    this.dirtyBake = false;
    return this.baked.texture;
  }

  // The finished print, rendered into any target: plate 000's, or a larger one to take home.
  draw(target) {
    this.bakeProgram.uniforms.uLight.value = this.read.texture;
    this.stage.renderer.render({ scene: this.bakeMesh, target });
    return target;
  }
}
