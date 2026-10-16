export type Vec3 = [number, number, number];

/** '#rrggbb' → sRGB channels in 0..1, the form every colour uniform takes */
export function hexToVec(hex: string): Vec3 {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** '#rrggbb' → a GLSL vec3 literal */
export function glslVec3(hex: string): string {
  return `vec3(${hexToVec(hex)
    .map((v) => v.toFixed(3))
    .join(', ')})`;
}
