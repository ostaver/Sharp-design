// Dev-only: the hero composition as a washed print, with the page's type zones outlined.
import { composeSheet } from '../specimens/compose.js';

const SHEETS = [
  {
    w: 1440,
    h: 900,
    view: 0.62,
    zones: [
      [60, 20, 1320, 30], // nav
      [60, 78, 485, 16], // sheet label
      [60, 795, 270, 80], // tagline
      [555, 770, 330, 95], // instrument
      [1155, 830, 225, 40], // cue
    ],
  },
  {
    w: 390,
    h: 844,
    view: 0.62,
    zones: [
      [20, 25, 350, 22],
      [20, 78, 370, 34],
      [20, 630, 260, 72],
      [20, 715, 290, 92],
    ],
  },
];

function tint(src, color) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(src, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

await document.fonts.load('700 100px "Host Grotesk"');
const wrap = document.getElementById('wrap');
for (const { w, h, view, zones } of SHEETS) {
  const { plants, negative } = composeSheet(w, h, { scale: 1 });
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w * view}px`;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#122f78';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(tint(negative, '#e4e1a6'), 0, 0);
  ctx.drawImage(plants, 0, 0);
  const frame = document.createElement('div');
  frame.className = 'frame';
  frame.append(canvas);
  for (const [x, y, zw, zh] of zones) {
    const z = document.createElement('div');
    z.className = 'zone';
    Object.assign(z.style, { left: `${x * view}px`, top: `${y * view}px`, width: `${zw * view}px`, height: `${zh * view}px` });
    frame.append(z);
  }
  wrap.append(frame);
}
