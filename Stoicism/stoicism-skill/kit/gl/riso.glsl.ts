// Shared GLSL for the risograph look: stochastic stipple, a five-step ink ramp (rolled per
// build in theme.ramp) and a misregistered highlight ink. Used by the temple's post pass and
// every image plane, so the monument and the photographs are printed by the same press.
import { theme } from '../theme';
import { glslVec3 } from '../lib/color';

export const hash = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x),
             mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
`;

const [k0, k1, k2, k3, k4] = theme.ramp;

export const riso = /* glsl */ `
${hash}
// Ink ramp: key ink → deep → mid → light → paper, rolled per build.
const vec3 INK0 = ${glslVec3(k0)};
const vec3 INK1 = ${glslVec3(k1)};
const vec3 INK2 = ${glslVec3(k2)};
const vec3 INK3 = ${glslVec3(k3)};
const vec3 INK4 = ${glslVec3(k4)};

vec3 inkAt(int i) {
  if (i <= 0) return INK0;
  if (i == 1) return INK1;
  if (i == 2) return INK2;
  if (i == 3) return INK3;
  return INK4;
}

// Grain cell noise. 'cell' is the stipple size in device pixels; 'seed' shimmers the drum.
float grain(vec2 fragCoord, float cell, float seed) {
  vec2 c = floor(fragCoord / cell);
  return hash12(c + seed * 17.13);
}

// Ink laydown between the two nearest steps: a continuous wash for the body of each tone,
// with stochastic stipple concentrated where one ink hands over to the next.
vec3 risoRamp(float lum, float n) {
  float t = clamp(lum, 0.0, 1.0) * 3.999;
  float i = floor(t);
  float f = t - i;
  vec3 a = inkAt(int(i));
  vec3 b = inkAt(int(i) + 1);
  float wash = smoothstep(0.18, 0.82, f);
  vec3 smooth_ = mix(a, b, wash);
  vec3 stipple = n < f ? b : a;
  float grit = 0.28 + 0.5 * (1.0 - abs(f - 0.5) * 2.0);
  return mix(smooth_, stipple, grit);
}

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
`;
