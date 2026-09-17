// Bakes a tiny stipple tile once and exposes it as a CSS variable for paper grain.
export function bakeNoise() {
  const s = 180;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const r = Math.random();
    const v = r < 0.16 ? 40 : r < 0.3 ? 150 : 255;
    img.data[i] = v * 0.62;
    img.data[i + 1] = v * 0.6;
    img.data[i + 2] = v;
    img.data[i + 3] = r < 0.3 ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  document.documentElement.style.setProperty('--noise', `url(${c.toDataURL('image/png')})`);
  bakeDither();
}

// A stochastic ink gradient — the way a riso drum fades one colour into the next.
// Rendered at device resolution so every stipple cell stays crisp once masked.
export const DITHER_H = 140;
function bakeDither() {
  const dpr = Math.min(Math.ceil(window.devicePixelRatio || 1), 3);
  const cell = 2 * dpr;
  const w = 256 * dpr;
  const h = DITHER_H * dpr;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += cell) {
    const t = Math.pow(y / h, 1.35);
    for (let x = 0; x < w; x += cell) {
      if (Math.random() < t) ctx.fillRect(x, y, cell, cell);
    }
  }
  document.documentElement.style.setProperty('--dither', `url(${c.toDataURL('image/png')})`);
}
