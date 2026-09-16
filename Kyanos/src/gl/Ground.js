// The page itself: a washed cyanotype, mottled where the coat pooled and streaked where
// the brush ran. The herbarium is bare paper, so the coat stops there in ragged strokes.
import { Mesh, Program } from 'ogl';
import { fullscreenVert, hash, palette } from './glsl.js';
import { pointer } from '../lib/pointer.js';
import { damp } from '../lib/rng.js';

const fragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uRes;
uniform float uScroll;
uniform vec3 uLamp;       // pointer position (css px) + strength
uniform sampler2D uNoise;
uniform vec4 uPaper;      // bare-paper band: top, bottom (css px), seed, on
${hash}
${palette}

// Coverage of a brushed edge; dist > 0 lies inside the coat. Bristle streaks run along x.
float brushed(float dist, vec2 px, float seed) {
  float streak = texture(uNoise, vec2(px.x / 2400.0 + seed, px.y / 30.0)).b;
  return smoothstep(-0.1, 0.4, dist / 42.0 + (streak - 0.5) * 1.4);
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec2 q = (px + vec2(0.0, uScroll * 0.22)) / 1100.0;
  float mottle = texture(uNoise, q * 0.7).r;
  float detail = texture(uNoise, q * 2.3 + 0.37).g;
  float streak = texture(uNoise, vec2(q.x * 0.4, q.y * 3.2)).b;
  float e = 0.9 + (mottle - 0.5) * 0.24 + (detail - 0.5) * 0.08 + (streak - 0.5) * 0.12;
  vec3 blue = washedTone(clamp(e, 0.0, 1.0), 1.0);

  float coat = 1.0;
  if (uPaper.w > 0.5) {
    float top = uPaper.x + (texture(uNoise, vec2(px.x / 1500.0 + uPaper.z, 0.25)).r - 0.5) * 70.0;
    float bottom = uPaper.y + (texture(uNoise, vec2(px.x / 1500.0 + uPaper.z, 0.75)).r - 0.5) * 70.0;
    coat = max(brushed(top - px.y, px, uPaper.z), brushed(px.y - bottom, px, uPaper.z + 0.5));
    // iron pools a little darker right at the edge of a stroke
    float rim = exp(-abs(top - px.y - 12.0) / 16.0) + exp(-abs(px.y - bottom - 12.0) / 16.0);
    blue = mix(blue, B6, clamp(rim, 0.0, 1.0) * 0.4);
  }

  float fibre = texture(uNoise, px / 900.0 + 0.5).a;
  vec3 paper = PAPER * (0.975 + (detail - 0.5) * 0.04) + (fibre - 0.5) * 0.035;
  vec3 col = mix(paper, blue, coat);

  // a faint sheen under the pointer, as if a lamp were held over the print
  float d = length((px - uLamp.xy) / uRes.y);
  col += vec3(0.045, 0.07, 0.1) * exp(-d * d * 12.0) * uLamp.z * coat;

  col += (hash12(gl_FragCoord.xy) - 0.5) * 0.035;
  fragColor = vec4(col, 1.0);
}`;

export class Ground {
  constructor(stage, { paper } = {}) {
    this.stage = stage;
    this.paper = paper;
    this.lamp = { x: -9999, y: -9999, on: 0 };
    this.program = new Program(stage.gl, {
      vertex: fullscreenVert,
      fragment,
      uniforms: {
        uRes: { value: [stage.w, stage.h] },
        uScroll: { value: 0 },
        uLamp: { value: [-9999, -9999, 0] },
        uNoise: { value: stage.noise },
        uPaper: { value: [0, 0, 0.37, 0] },
      },
      cullFace: false,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(stage.gl, { geometry: stage.triangle, program: this.program, renderOrder: 0 });
    this.mesh.setParent(stage.scene);
  }

  resize(w, h) {
    this.program.uniforms.uRes.value = [w, h];
  }

  update(time, dt) {
    const u = this.program.uniforms;
    u.uScroll.value = window.scrollY;

    const fine = pointer.type === 'mouse' && pointer.active;
    const k = damp(8, dt);
    this.lamp.x += (pointer.x - this.lamp.x) * (this.lamp.on < 0.01 ? 1 : k);
    this.lamp.y += (pointer.y - this.lamp.y) * (this.lamp.on < 0.01 ? 1 : k);
    this.lamp.on += ((fine ? 1 : 0) - this.lamp.on) * damp(3, dt);
    u.uLamp.value[0] = this.lamp.x;
    u.uLamp.value[1] = this.lamp.y;
    u.uLamp.value[2] = this.lamp.on;

    if (this.paper) {
      const r = this.paper.getBoundingClientRect();
      const on = r.bottom > -120 && r.top < this.stage.h + 120;
      u.uPaper.value[0] = r.top;
      u.uPaper.value[1] = r.bottom;
      u.uPaper.value[3] = on ? 1 : 0;
    }
  }
}
