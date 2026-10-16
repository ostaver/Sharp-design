/*
  The three capitals as line elevations, 320 units wide. The shaft below spans x 32–288,
  so every capital comes down onto that width. Each drawing is split into depth layers:
  'front' is always drawn whole; 'mid' and 'back' are masked by the outlines of the layers
  in front of them, so leaves and volutes overlap the way carved stone does instead of
  tangling. Paths are plain strings so the same art can be drawn, masked and scrubbed.
*/

const n = (v: number): number => +v.toFixed(1);
const PI = Math.PI;

// A volute: a logarithmic spiral from radius r0 down to r1.
function spiral(cx: number, cy: number, r0: number, r1: number, turns: number, start: number, dir: 1 | -1): string {
  const steps = Math.ceil(turns * 72);
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = r0 * Math.pow(r1 / r0, t);
    const a = start + dir * t * turns * PI * 2;
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * r)} ${n(cy + Math.sin(a) * r)}`;
  }
  return d;
}

const circle = (cx: number, cy: number, r: number): string => `M${n(cx - r)} ${n(cy)}a${r} ${r} 0 1 0 ${n(r * 2)} 0a${r} ${r} 0 1 0 ${n(-r * 2)} 0`;
const ellipse = (cx: number, cy: number, rx: number, ry: number): string => `M${n(cx - rx)} ${n(cy)}a${rx} ${ry} 0 1 0 ${n(rx * 2)} 0a${rx} ${ry} 0 1 0 ${n(-rx * 2)} 0`;
const range = (a: number, b: number, step: number): number[] => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step);

// An acanthus leaf: three serrated lobes a side, its tip folding forward over the top.
interface Leaf {
  outline: string;
  lines: string[];
}

function acanthus(cx: number, yb: number, yt: number, w: number): Leaf {
  const h = yb - yt;
  const P = (fx: number, fy: number): string => `${n(cx + fx * w)} ${n(yb - fy * h)}`;
  // walking up one edge: out to a lobe tip, back in to a notch no higher than the tip
  const side = (s: number): number[][] => [
    [s * 0.22, 0],
    [s * 0.3, 0.2, s * 0.46, 0.4],
    [s * 0.42, 0.37, s * 0.3, 0.37],
    [s * 0.36, 0.5, s * 0.46, 0.66],
    [s * 0.38, 0.64, s * 0.26, 0.63],
    [s * 0.3, 0.76, s * 0.36, 0.88],
  ];
  const L = side(-1);
  const R = side(1);
  // a point stored at offset k of a lobe entry
  const pt = (e: number[] | undefined, k: number): string => P(e?.[k] ?? 0, e?.[k + 1] ?? 0);
  let d = `M${pt(L[0], 0)}`;
  for (const [x1 = 0, y1 = 0, x = 0, y = 0] of L.slice(1)) d += `Q${P(x1, y1)} ${P(x, y)}`;
  d += `C${P(-0.32, 0.98)} ${P(-0.14, 1.04)} ${P(0, 1)}`;
  d += `C${P(0.14, 1.04)} ${P(0.32, 0.98)} ${pt(R[5], 2)}`;
  // walk the right edge back down: each segment's control belongs to the segment it ends
  for (let i = 5; i >= 1; i--) d += `Q${pt(R[i], 0)} ${i === 1 ? pt(R[0], 0) : pt(R[i - 1], 2)}`;
  d += 'Z';
  const outline = d;
  // the tip curls forward and hangs over the face of the leaf
  const fold = `M${P(-0.14, 0.97)}C${P(-0.18, 0.8)} ${P(0.1, 0.74)} ${P(0.09, 0.85)}C${P(0.08, 0.9)} ${P(0.01, 0.9)} ${P(0.02, 0.85)}`;
  const ribs = [
    `M${P(0, 0.04)}C${P(0.01, 0.35)} ${P(-0.01, 0.6)} ${P(0, 0.76)}`,
    `M${P(-0.02, 0.14)}Q${P(-0.22, 0.2)} ${P(-0.44, 0.38)}M${P(0.02, 0.14)}Q${P(0.22, 0.2)} ${P(0.44, 0.38)}`,
    `M${P(-0.01, 0.42)}Q${P(-0.2, 0.48)} ${P(-0.4, 0.64)}M${P(0.01, 0.42)}Q${P(0.2, 0.48)} ${P(0.4, 0.64)}`,
  ];
  return { outline, lines: [outline, fold, ...ribs] };
}

/* ───────── Doric — abacus, echinus, three annulets ───────── */
const doric: CapitalArt = {
  h: 100,
  front: [
    'M10 4H310V30H10Z',
    'M16 30C17 47 24 58 34 64H286C296 58 303 47 304 30',
    'M34 69H286M34 74H286M34 79H286',
    'M32 79V100M288 79V100',
    range(1, 9, 1).map((i) => `M${n(32 + (256 * i) / 10)} 79V100`).join(''),
  ],
};

/* ───────── Ionic — paired volutes over an egg-and-dart echinus ───────── */
const ionic = ((): CapitalArt => {
  const L = [56, 52] as const;
  const R = [264, 52] as const;
  const volute = ([cx, cy]: readonly [number, number], dir: 1 | -1): string[] => [
    spiral(cx, cy, 38, 4.2, 2.6, -PI / 2, dir),
    spiral(cx, cy, 30, 3.3, 2.6, -PI / 2, dir),
    circle(cx, cy, 4.5),
  ];
  const eggs = range(92, 228, 34);
  const darts = range(75, 245, 34);
  const beads = range(48, 272, 16);
  return {
    h: 104,
    front: [
      'M28 2H292V11H28Z',
      'M56 14H264',
      'M56 22C110 27 210 27 264 22',
      ...volute(L, -1),
      ...volute(R, 1),
    ],
    back: [
      eggs.map((x) => `M${x - 11} 29V39a11 13 0 0 0 22 0V29`).join(''),
      eggs.map((x) => ellipse(x, 39, 6.5, 8.5)).join(''),
      darts.map((x) => `M${x} 29V48M${x - 3} 45L${x} 52L${x + 3} 45`).join(''),
      'M58 58C120 63 200 63 262 58',
      'M36 64H284M36 75H284',
      beads.map((x) => ellipse(x, 69.5, 5, 3.6)).join('') + beads.slice(0, -1).map((x) => `M${x + 6.5} 66V73M${x + 9.5} 66V73`).join(''),
      'M32 75V104M288 75V104',
      range(1, 11, 1).map((i) => `M${n(32 + (256 * i) / 12)} 78V104`).join(''),
    ],
    backMask: [circle(...L, 39), circle(...R, 39)],
  };
})();

/* ───────── Corinthian — two rows of acanthus, helices under a concave abacus ───────── */
const corinthian = ((): CapitalArt => {
  const lower = [64, 160, 256].map((x) => acanthus(x, 150, 88, 82));
  const upper = ([[30, 60], [112, 80], [208, 80], [290, 60]] as const).map(([x, w]) => acanthus(x, 150, 56, w));
  const helix = (cx: number, cy: number, r0: number, dir: 1 | -1, start: number): string => spiral(cx, cy, r0, r0 * 0.16, 1.55, start, dir);
  const rosette = [
    circle(160, 22, 6.5),
    circle(160, 22, 2.2),
    range(0, 7, 1)
      .map((i) => {
        const a = (i / 8) * PI * 2;
        return `M${n(160 + Math.cos(a) * 6.5)} ${n(22 + Math.sin(a) * 6.5)}L${n(160 + Math.cos(a) * 10.5)} ${n(22 + Math.sin(a) * 10.5)}`;
      })
      .join(''),
  ];
  return {
    h: 160,
    front: [
      'M6 3H314L307 16C230 10.5 90 10.5 13 16Z',
      'M14 9C90 6 230 6 306 9',
      ...rosette,
      ...lower.flatMap((l) => l.lines),
      'M30 152H290M32 157H288',
      'M32 157V160M288 157V160',
    ],
    mid: upper.flatMap((l) => l.lines),
    midMask: lower.map((l) => l.outline),
    back: [
      // corner helices, sprung from stalks between the upper leaves
      helix(36, 34, 17, -1, 0),
      'M104 98C92 74 72 50 53 34',
      'M112 92C100 70 80 50 56 42',
      helix(284, 34, 17, 1, PI),
      'M216 98C228 74 248 50 267 34',
      'M208 92C220 70 240 50 264 42',
      // inner helices curl toward the rosette
      helix(138, 34, 10.5, 1, PI),
      'M120 96C122 74 124 52 127.5 34',
      helix(182, 34, 10.5, -1, 0),
      'M200 96C198 74 196 52 192.5 34',
    ],
    backMask: [...lower, ...upper].map((l) => l.outline),
  };
})();

export interface CapitalArt {
  /** viewBox height; the width is always 320 and the shaft below spans x 32–288 */
  h: number;
  front: string[];
  mid?: string[];
  midMask?: string[];
  back?: string[];
  backMask?: string[];
}

export type Order = 'Doric' | 'Ionic' | 'Corinthian';

export const capitals: Record<Order, CapitalArt> = { Doric: doric, Ionic: ionic, Corinthian: corinthian };
