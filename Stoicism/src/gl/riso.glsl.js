// Shared GLSL for the risograph look: stochastic stipple, a five-step lavender ink ramp,
// and a misregistered highlight ink. Used by the temple post-pass and every image plane.

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

export const riso = /* glsl */ `
${hash}
// Ink ramp — midnight indigo → riso blue → periwinkle → lavender mist → paper pink.
const vec3 INK0 = vec3(0.090, 0.082, 0.302);
const vec3 INK1 = vec3(0.235, 0.247, 0.722);
const vec3 INK2 = vec3(0.431, 0.475, 0.878);
const vec3 INK3 = vec3(0.663, 0.690, 0.945);
const vec3 INK4 = vec3(0.965, 0.855, 0.937);

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
