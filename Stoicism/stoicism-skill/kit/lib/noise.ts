import { theme } from '../theme';
import { hexToVec } from './color';

// Bakes the paper's stipple once and exposes it as --noise, tinted toward the key ink.
export function bakeNoise(): void {
  const s = 180;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const [r, g, b] = hexToVec(theme.palette.midnight);
  const max = Math.max(r, g, b, 1e-3);
  const tint = [0.5 + (0.5 * r) / max, 0.5 + (0.5 * g) / max, 0.5 + (0.5 * b) / max];
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const q = Math.random();
    const v = q < 0.16 ? 40 : q < 0.3 ? 150 : 255;
    img.data[i] = v * tint[0];
    img.data[i + 1] = v * tint[1];
    img.data[i + 2] = v * tint[2];
    img.data[i + 3] = q < 0.3 ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--noise', `url(${c.toDataURL('image/png')})`);
  bakeDither();
}

// A stochastic ink gradient: the way a riso drum fades one colour into the next. Rendered at
// device resolution so every stipple cell stays crisp once used as a mask (see .dither).
export const DITHER_H = 140;
function bakeDither(): void {
  const dpr = Math.min(Math.ceil(window.devicePixelRatio || 1), 3);
  const cell = 2 * dpr;
  const w = 256 * dpr;
  const h = DITHER_H * dpr;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += cell) {
    const t = Math.pow(y / h, 1.35);
    for (let x = 0; x < w; x += cell) if (Math.random() < t) ctx.fillRect(x, y, cell, cell);
  }
  document.documentElement.style.setProperty('--dither', `url(${c.toDataURL('image/png')})`);
}
