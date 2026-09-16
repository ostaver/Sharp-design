// Dev-only page: renders every specimen generator as white-on-blue so they can be judged by eye.
import { mulberry32 } from '../lib/rng.js';
import { place } from '../specimens/draw.js';

const W = 360;
const H = 480;
const DPR = 2;

const rows = [
  ['fern', { len: 440, curl: 0.45 }, 0.3, 0.98, 0.2],
  ['maidenhair', { len: 400 }, 0.45, 0.98, 0.1],
  ['umbel', { len: 440 }, 0.5, 1.0, -0.05],
  ['grass', { len: 430 }, 0.5, 0.98, 0],
  ['ginkgo', { len: 240 }, 0.45, 0.8, -0.2],
  ['dandelion', { len: 440 }, 0.45, 1.0, 0.1],
  ['seaweed', { len: 440 }, 0.5, 0.95, 0],
  ['feather', { len: 420 }, 0.3, 0.9, 0.5],
  ['cornflower', { len: 400 }, 0.45, 1.0, 0.1],
];

const root = document.getElementById('lab');
for (const [type, opts, fx, fy, angle] of rows) {
  const canvas = document.createElement('canvas');
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);
  const t0 = performance.now();
  place(ctx, mulberry32(7), type, fx * W, fy * H, angle, opts);
  const figure = document.createElement('figure');
  const caption = document.createElement('figcaption');
  caption.textContent = `${type} — ${(performance.now() - t0).toFixed(1)} ms`;
  figure.append(canvas, caption);
  root.append(figure);
}
