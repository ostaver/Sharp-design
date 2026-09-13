// One program for every print that lies or hangs: the plate on the process table, the prints
// on the drying line and the preview that follows the pointer through the sessions.
// Each PlateMesh keeps its own values and pushes them into the shared program as it draws.
import { Mesh, Plane, Program, Texture } from 'ogl';
import { hash, palette } from './glsl.js';

const vertex = /* glsl */ `#version 300 es
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uQuad;      // quad size in px, paper plus shadow margin
uniform float uPivot;    // height of the peg above the quad centre
uniform float uReach;    // peg to bottom edge
uniform float uAngle;    // pendulum swing
uniform float uBend;     // extra lag toward the bottom of the sheet
uniform float uFlutter;
uniform float uTime;
uniform float uSeed;
out vec2 vUv;
out float vShade;
void main() {
  vec2 p = position.xy * uQuad;
  vec2 r = p - vec2(0.0, uPivot);
  float t = clamp(-r.y / uReach, 0.0, 1.3);
  float wave = sin(uTime * 1.6 + uSeed * 4.0 - t * 2.6) * uFlutter;
  float a = uAngle + uBend * t * t + wave * 0.015 * t;
  float c = cos(a);
  float s = sin(a);
  r = vec2(c * r.x - s * r.y, s * r.x + c * r.y);
  r.x *= 1.0 - abs(wave) * 0.012 * t;
  vShade = wave * t;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vec2(0.0, uPivot) + r, 0.0, 1.0);
}`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in float vShade;
out vec4 fragColor;
uniform sampler2D uTex;       // specimen silhouette (alpha), or a finished image in mode 1
uniform sampler2D uNoise;
uniform vec2 uSize;           // paper size in px
uniform vec2 uPad;            // shadow margin per side, as a fraction of the paper
uniform float uMode;
uniform float uImgAspect;
uniform float uCoat;          // the brush crossing the sheet
uniform float uPlace;         // specimens laid down under glass
uniform float uExpose;
uniform float uLift;
uniform float uWash;
uniform float uOx;
uniform float uWet;
uniform float uGlow;
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
uniform float uShadow;
${hash}
${palette}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
  vec2 q = (vUv - uPad) / (1.0 - 2.0 * uPad);
  vec2 px = q * uSize;
  float aspect = uSize.x / uSize.y;
  vec2 asp = vec2(aspect, 1.0);

  // Deckled cotton edge, and the soft shadow the sheet throws behind it.
  float deckle = (texture(uNoise, vec2(q.x * 2.0 + q.y * 1.3 + uSeed, q.y * 2.0 - q.x)).g - 0.5) * 3.0;
  float inside = 1.0 - smoothstep(-0.8, 0.8, sdBox(px - uSize * 0.5, uSize * 0.5) + deckle);
  float shadow = (1.0 - smoothstep(-12.0, 36.0, sdBox(px - uSize * 0.5 - vec2(7.0, -16.0), uSize * 0.5))) * uShadow;

  // The brushed window of the coat, ragged and streaky where the brush started and lifted.
  vec2 lo = vec2(0.075, 0.07);
  vec2 hi = vec2(0.925, 0.93);
  if (uMode > 0.5) {
    // fit the finished print inside the sheet, landscape or portrait
    float iw = 0.86;
    float ih = iw * aspect / uImgAspect;
    if (ih > 0.84) {
      ih = 0.84;
      iw = ih * uImgAspect / aspect;
    }
    lo = vec2(0.5 - iw * 0.5, 0.52 - ih * 0.5);
    hi = vec2(0.5 + iw * 0.5, 0.52 + ih * 0.5);
  }
  float streak = texture(uNoise, vec2(q.x * 0.55 + uSeed, q.y * 7.0)).b;
  float ex = texture(uNoise, vec2(q.y * 1.7 + uSeed, 0.5)).r - 0.5;
  float ey = texture(uNoise, vec2(q.x * 1.7 + uSeed, 0.2)).r - 0.5;
  float coatX = smoothstep(lo.x - 0.01, lo.x + 0.03, q.x + ex * 0.03 + (streak - 0.5) * 0.05)
              * (1.0 - smoothstep(hi.x - 0.03, hi.x + 0.01, q.x - ex * 0.03 - (streak - 0.5) * 0.05));
  float coatY = smoothstep(lo.y - 0.004, lo.y + 0.006, q.y + ey * 0.012)
              * (1.0 - smoothstep(hi.y - 0.006, hi.y + 0.004, q.y - ey * 0.012));
  float brush = uCoat * 1.3 - 0.15;
  float coat = coatX * coatY * smoothstep(brush + 0.03, brush - 0.05, q.x + (streak - 0.5) * 0.1);

  float n1 = texture(uNoise, q * asp * 0.8 + uSeed).r;
  float fibre = texture(uNoise, px / 520.0 + uSeed).a;

  // Water running down the sheet.
  float s = mix(-0.3, 1.3, uWash) - (1.0 - q.y) + (texture(uNoise, vec2(q.x + uSeed, 0.4)).r - 0.5) * 0.2;
  float wet = smoothstep(-0.015, 0.05, s);
  float ripple = smoothstep(0.0, 0.03, s) * exp(-max(s, 0.0) * 3.0) * (1.0 - smoothstep(0.85, 1.0, uWash));
  vec2 w = q * asp;
  vec2 flow = vec2(0.0, uTime * 0.06);
  float h0 = texture(uNoise, w + flow).g;
  vec2 grad = vec2(
    texture(uNoise, w + flow + vec2(0.005, 0.0)).g - h0,
    texture(uNoise, w + flow + vec2(0.0, 0.005)).g - h0
  ) / 0.005;
  vec2 sq = q + grad * ripple * 0.004;

  vec3 col;
  if (uMode < 0.5) {
    float a = texture(uTex, sq).a;
    float E = (1.0 - exp(-2.85 * uExpose * (1.0 - a) * (0.85 + (n1 - 0.5) * 0.35))) * coat;
    vec3 sun = mix(PAPER, exposingTone(E), coat);
    col = mix(sun, washedTone(E, uOx), wet);
  } else {
    vec3 img = texture(uTex, clamp((sq - lo) / (hi - lo), 0.0, 1.0)).rgb;
    col = mix(PAPER, img, coat);
  }
  col *= 0.975 + (fibre - 0.5) * 0.06;

  // Specimens lying on the sheet under glass (only the process plate places them).
  vec2 luv = (q - 0.5) / (1.0 + (1.0 - uPlace) * 0.08 + uLift * 0.05) + 0.5;
  float show = uPlace * (1.0 - smoothstep(0.25, 1.0, uLift)) * (1.0 - wet) * (1.0 - uMode);
  float lying = texture(uTex, luv).a * show;
  float drop = textureLod(uTex, luv - vec2(0.004, -0.007) * (1.0 + (1.0 - uPlace) * 5.0 + uLift * 5.0), 3.0).a * show;
  col *= 1.0 - drop * 0.22;
  col = mix(col, mix(vec3(0.5, 0.49, 0.34), vec3(0.4, 0.405, 0.28), n1), lying * 0.94);

  // Sunlight falling on the unwashed coat.
  col += vec3(1.0, 0.96, 0.8) * uGlow * 0.1 * (1.0 - wet) * coat;

  // The water: a darker band, glints, and a bright line where it meets dry paper.
  vec3 N = normalize(vec3(-grad * 0.16, 1.0));
  float spec = pow(max(dot(N, normalize(vec3(-0.25, 0.35, 1.0))), 0.0), 90.0);
  col *= 1.0 - ripple * 0.14;
  col += spec * ripple * 0.3;
  col += exp(-abs(s) * 110.0) * step(0.001, uWash) * (1.0 - smoothstep(0.85, 1.0, uWash)) * 0.18;

  // Prints still wet on the line sit deeper and carry a slow sheen.
  float sheen = smoothstep(0.55, 0.95, texture(uNoise, w * 0.6 + vec2(vShade * 0.4, uTime * 0.01)).r);
  col = mix(col, col * vec3(0.88, 0.9, 0.95), uWet * 0.6) + sheen * uWet * 0.08;

  col *= 1.0 + vShade * 0.35;
  col += (hash12(gl_FragCoord.xy) - 0.5) * 0.03;

  vec4 outColor = mix(vec4(0.02, 0.04, 0.1, shadow * 0.35), vec4(col, 1.0), inside);
  outColor.a *= uOpacity;
  fragColor = outColor;
}`;

export function createPlateProgram(stage) {
  const gl = stage.gl;
  const blank = new Texture(gl, {
    image: new Uint8Array([0, 0, 0, 0]),
    width: 1,
    height: 1,
    generateMipmaps: false,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST,
  });
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uQuad: { value: [1, 1] },
      uPivot: { value: 0 },
      uReach: { value: 1 },
      uAngle: { value: 0 },
      uBend: { value: 0 },
      uFlutter: { value: 0 },
      uTime: { value: 0 },
      uSeed: { value: 0 },
      uTex: { value: blank },
      uNoise: { value: stage.noise },
      uSize: { value: [1, 1] },
      uPad: { value: [0, 0] },
      uMode: { value: 0 },
      uImgAspect: { value: 1 },
      uCoat: { value: 1 },
      uPlace: { value: 0 },
      uExpose: { value: 1 },
      uLift: { value: 1 },
      uWash: { value: 1 },
      uOx: { value: 1 },
      uWet: { value: 0 },
      uGlow: { value: 0 },
      uOpacity: { value: 1 },
      uShadow: { value: 0 },
    },
    transparent: true,
    cullFace: false,
    depthTest: false,
    depthWrite: false,
  });
  program.blank = blank;
  return program;
}

let geometry = null;

export class PlateMesh {
  constructor(stage, program, { pad = [0.1, 0.08], renderOrder = 4 } = {}) {
    this.stage = stage;
    this.program = program;
    this.pad = pad;
    this.size = [1, 1];
    this.quad = [1, 1];
    this.u = {
      tex: null,
      mode: 0,
      imgAspect: 1,
      coat: 1,
      place: 0,
      expose: 1,
      lift: 1,
      wash: 1,
      ox: 1,
      wet: 0,
      glow: 0,
      opacity: 1,
      shadow: 0.8,
      angle: 0,
      bend: 0,
      flutter: 0,
      seed: 0,
    };
    geometry ??= new Plane(stage.gl, { widthSegments: 6, heightSegments: 14 });
    this.mesh = new Mesh(stage.gl, { geometry, program, renderOrder });
    this.mesh.visible = false;
    this.mesh.onBeforeRender(() => this.apply());
    this.mesh.setParent(stage.scene);
  }

  // Put the paper over a DOM rect; the quad grows by the shadow margin.
  fit(rect, scale = 1) {
    const w = rect.width * scale;
    const h = rect.height * scale;
    this.size = [w, h];
    this.quad = [w * (1 + 2 * this.pad[0]), h * (1 + 2 * this.pad[1])];
    this.mesh.position.set(rect.left + rect.width / 2 - this.stage.w / 2, this.stage.h / 2 - rect.top - rect.height / 2, 0);
  }

  apply() {
    const U = this.program.uniforms;
    const u = this.u;
    U.uTex.value = u.tex || this.program.blank;
    U.uMode.value = u.mode;
    U.uImgAspect.value = u.imgAspect;
    U.uCoat.value = u.coat;
    U.uPlace.value = u.place;
    U.uExpose.value = u.expose;
    U.uLift.value = u.lift;
    U.uWash.value = u.wash;
    U.uOx.value = u.ox;
    U.uWet.value = u.wet;
    U.uGlow.value = u.glow;
    U.uOpacity.value = u.opacity;
    U.uShadow.value = u.shadow;
    U.uAngle.value = u.angle;
    U.uBend.value = u.bend;
    U.uFlutter.value = u.flutter;
    U.uSeed.value = u.seed;
    U.uQuad.value = this.quad;
    U.uSize.value = this.size;
    U.uPad.value = this.pad;
    U.uPivot.value = this.size[1] / 2;
    U.uReach.value = this.size[1];
  }
}
