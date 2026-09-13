// Shared GLSL chunks. Colours are authored in sRGB and written out as-is.

export const fullscreenVert = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export const planeVert = /* glsl */ `#version 300 es
in vec3 position;
in vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const hash = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}`;

// The palette of a real print: cotton paper, the yellow-green iron coat, the greys
// it passes through in the sun, and the Prussian blues it washes into.
export const palette = /* glsl */ `
const vec3 PAPER = vec3(0.949, 0.937, 0.902);
const vec3 SENS = vec3(0.894, 0.882, 0.651);
const vec3 EXP_MID = vec3(0.49, 0.541, 0.51);
const vec3 EXP_DEEP = vec3(0.29, 0.353, 0.388);
const vec3 BRONZE = vec3(0.427, 0.416, 0.322);
const vec3 B0 = vec3(0.663, 0.741, 0.878);
const vec3 B1 = vec3(0.435, 0.561, 0.788);
const vec3 B2 = vec3(0.176, 0.337, 0.659);
const vec3 B3 = vec3(0.106, 0.247, 0.561);
const vec3 B4 = vec3(0.071, 0.184, 0.471);
const vec3 B5 = vec3(0.055, 0.137, 0.337);
const vec3 B6 = vec3(0.043, 0.114, 0.29);

// Washed print: bare paper at 0, deep Prussian blue at 1. Oxidation deepens the blue.
vec3 washedTone(float e, float ox) {
  vec3 c = mix(PAPER, B0, smoothstep(0.0, 0.16, e));
  c = mix(c, B1, smoothstep(0.1, 0.36, e));
  c = mix(c, B2, smoothstep(0.28, 0.6, e));
  c = mix(c, B3, smoothstep(0.52, 0.84, e));
  c = mix(c, B4, smoothstep(0.78, 1.0, e));
  return mix(c, mix(B5, B6, 0.4), ox * smoothstep(0.55, 1.0, e) * 0.75);
}

// Unwashed print still in the sun: the yellow-green coat greying toward slate, then bronze.
vec3 exposingTone(float e) {
  vec3 c = mix(SENS, EXP_MID, smoothstep(0.0, 0.55, e));
  c = mix(c, EXP_DEEP, smoothstep(0.45, 0.92, e));
  return mix(c, BRONZE, smoothstep(0.93, 1.0, e) * 0.3);
}`;

// One-off pass that bakes a tileable noise texture:
// r = soft mottling, g = mid detail, b = streaks stretched along x (brush direction), a = fibre.
export const noiseFrag = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
${hash}
float pnoise(vec2 p, vec2 period) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash12(mod(i, period));
  float b = hash12(mod(i + vec2(1.0, 0.0), period));
  float c = hash12(mod(i + vec2(0.0, 1.0), period));
  float d = hash12(mod(i + vec2(1.0, 1.0), period));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float pfbm(vec2 uv, vec2 period, int octaves) {
  float s = 0.0;
  float amp = 0.5;
  float norm = 0.0;
  for (int k = 0; k < 6; k++) {
    if (k >= octaves) break;
    s += amp * pnoise(uv * period, period);
    norm += amp;
    amp *= 0.5;
    period *= 2.0;
  }
  return s / norm;
}
void main() {
  fragColor = vec4(
    pfbm(vUv, vec2(4.0), 5),
    pfbm(vUv, vec2(16.0), 4),
    pfbm(vUv, vec2(3.0, 48.0), 4),
    pfbm(vUv, vec2(128.0), 2)
  );
}`;
