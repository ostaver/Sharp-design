// Compositions: which specimens lie on which sheet, and where.
import { mulberry32 } from '../lib/rng.js';
import { place } from './draw.js';

export const PLATE = { w: 540, h: 720 }; // 3 : 4 prints on the drying line
export const PROCESS = { w: 560, h: 700 }; // 4 : 5 print on the process table
export const HAND = 'La Belle Aurore'; // the printer's handwriting on the plates

// [specimen, x, y, angle, size as a fraction of sheet height, options]
const LAYOUTS = {
  maidenhair: [['maidenhair', 0.46, 0.97, 0.06, 0.86]],
  umbel: [
    ['umbel', 0.56, 1.0, -0.06, 0.95, { rays: 32 }],
    ['umbel', 0.24, 1.02, 0.22, 0.62, { rays: 22 }],
  ],
  ginkgo: [
    ['ginkgo', 0.36, 0.56, -0.55, 0.36],
    ['ginkgo', 0.66, 0.4, 0.65, 0.32],
    ['ginkgo', 0.52, 0.9, 0.12, 0.3],
  ],
  dandelion: [
    ['dandelion', 0.44, 1.02, 0.1, 0.95],
    ['dandelion', 0.8, 1.04, -0.22, 0.62],
  ],
  seaweed: [['seaweed', 0.5, 0.94, 0.02, 0.88]],
  grass: [['grass', 0.5, 0.98, 0, 0.86]],
  fern: [['fern', 0.26, 0.98, 0.26, 0.98, { curl: 0.5 }]],
  cornflower: [
    ['cornflower', 0.4, 1.0, 0.1, 0.92],
    ['cornflower', 0.64, 1.0, -0.2, 0.76],
  ],
  feather: [['feather', 0.24, 0.92, 0.5, 0.92]],
  process: [
    ['fern', 0.22, 1.0, 0.3, 0.9, { curl: 0.55 }],
    ['ginkgo', 0.62, 0.36, 0.7, 0.26],
    ['grass', 0.8, 1.0, -0.22, 0.62, { stems: 2 }],
  ],
};

// Names written on each plate, as Anna Atkins wrote hers under every specimen.
const NAMES = {
  maidenhair: 'Adiantum capillus-veneris',
  umbel: 'Daucus carota',
  ginkgo: 'Ginkgo biloba',
  dandelion: 'Taraxacum officinale',
  seaweed: 'Dictyota dichotoma',
  grass: 'Briza maxima',
  fern: 'Dryopteris filix-mas',
  cornflower: 'Centaurea cyanus',
  feather: 'Larus michahellis',
};

function sheet(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.round(w);
  c.height = Math.round(h);
  return c;
}

// The name in ink on a slip of tissue laid on the glass: it blocks the sun, so it prints white.
function inscribe(ctx, text, w, h) {
  const font = `${Math.round(h * 0.046)}px "${HAND}"`;
  if (document.fonts && !document.fonts.check(font)) return; // no hand, no forgery in Comic Sans
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.font = font;
  ctx.textAlign = 'right';
  ctx.translate(w * 0.885, h * 0.9);
  ctx.rotate(-0.035);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Plate 000's label, pencilled in the foot of the sheet, centred under the print. Drawn as
// coverage only; the plate shader lays it down in graphite.
export function drawNote(w, h, lines, { foot, margin }, scale = 1) {
  let size = Math.min(26, Math.max(13, h * 0.052));
  const font = (px) => `${px.toFixed(1)}px "${HAND}"`;
  if (document.fonts && !document.fonts.check(font(size))) return null;
  const c = sheet(w * scale, h * scale);
  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);
  ctx.font = font(size);
  size *= Math.min(1, (w - 2 * margin) / Math.max(...lines.map((text) => ctx.measureText(text).width)));
  ctx.font = font(size);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  lines.forEach((text, i) => {
    ctx.save();
    ctx.translate(w / 2, h - foot * 0.62 + i * size * 1.25);
    ctx.rotate(-0.012);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  });
  return c;
}

export function drawPlate(layout, seed = 1, { w = PLATE.w, h = PLATE.h, caption = NAMES[layout] } = {}) {
  const c = sheet(w, h);
  const ctx = c.getContext('2d');
  const rng = mulberry32(seed * 7919 + 101);
  for (const [type, x, y, angle, size, opts] of LAYOUTS[layout] ?? LAYOUTS.fern) {
    place(ctx, rng, type, x * w, y * h, angle, { ...opts, len: size * h });
  }
  if (caption) inscribe(ctx, caption, w, h);
  return c;
}

// A sessions row as a strip of exposed paper: the session's plant laid along it head to tail,
// cropped by the edges the way a contact print crops whatever overhangs the sheet.
export function drawStrip(type, seed, w, h) {
  const c = sheet(w, h);
  const ctx = c.getContext('2d');
  const rng = mulberry32(seed * 104729 + 7);
  const count = Math.max(2, Math.round(w / (h * 3)));
  for (let i = 0; i < count; i++) {
    const right = i % 2 === 0;
    const x = ((i + (right ? 0.08 : 0.92)) / count) * w;
    const y = h * (0.3 + rng() * 0.4);
    const angle = (right ? 1 : -1) * (Math.PI / 2 + (rng() - 0.5) * 0.5);
    place(ctx, rng, type, x, y, angle, { len: h * (2 + rng() * 0.9) });
  }
  return c;
}

/**
 * The hero sheet: specimens framing the edges (they cast shadows and lift off when
 * the print is washed) and a film negative carrying the wordmark, which stays latent
 * until light develops the paper around it.
 */
export function composeSheet(width, height, { scale = 1, font = 'Ysabeau', seed = 1842 } = {}) {
  const W = Math.round(width * scale);
  const H = Math.round(height * scale);
  const plants = sheet(W, H);
  const negative = sheet(W, H);
  const rng = mulberry32(seed);
  const land = width / height > 1.1;
  const unit = land ? H : Math.min(H, W * 1.6);
  const p = plants.getContext('2d');
  const put = (type, fx, fy, angle, size, opts = {}) =>
    place(p, rng, type, fx * W, fy * H, angle, { ...opts, len: size * unit });

  // Specimens frame the wordmark and keep clear of the type at the foot of the sheet.
  if (land) {
    put('fern', 0.055, 0.86, 0.13, 0.76, { curl: 0.42, width: 0.24 });
    put('dandelion', 0.235, 0.36, -0.42, 0.3, { seeds: 120 });
    put('maidenhair', 0.52, -0.05, Math.PI + 0.28, 0.42);
    put('umbel', 1.02, 0.02, Math.PI + 0.5, 0.56, { rays: 34 });
    put('ginkgo', 0.36, 0.2, 2.35, 0.19);
    put('ginkgo', 0.655, 0.8, 0.95, 0.16);
    put('grass', 0.86, 1.04, -0.22, 0.52);
  } else {
    put('umbel', 1.0, -0.03, Math.PI + 0.55, 0.34, { rays: 26 });
    put('ginkgo', 0.2, 0.2, 2.4, 0.13);
    put('dandelion', 0.44, 0.39, -0.2, 0.2, { seeds: 100 });
    put('fern', -0.03, 0.74, 1.18, 0.44, { curl: -0.3, width: 0.26 });
    put('grass', 1.02, 0.75, -0.95, 0.3, { stems: 2 });
  }

  const n = negative.getContext('2d');
  n.fillStyle = '#fff';
  n.textBaseline = 'alphabetic';
  const tracked = 'letterSpacing' in n;

  const setType = (weight, size, spacingEm) => {
    n.font = `${weight} ${size}px "${font}", sans-serif`;
    if (tracked) n.letterSpacing = `${spacingEm * size}px`;
  };
  const widthOf = (text, size, spacingEm) => {
    setType(n.font.split(' ')[0], size, spacingEm);
    const w = n.measureText(text).width;
    return tracked ? w - spacingEm * size : w + spacingEm * size * (text.length - 1);
  };
  const draw = (text, weight, size, spacingEm, cy) => {
    setType(weight, size, spacingEm);
    const w = widthOf(text, size, spacingEm);
    let x = (W - w) / 2;
    if (tracked) {
      n.fillText(text, x, cy);
      return;
    }
    for (const ch of text) {
      n.fillText(ch, x, cy);
      x += n.measureText(ch).width + spacingEm * size;
    }
  };

  const word = 'KYANOS';
  setType(820, 100, -0.02);
  const size = (100 * W * (land ? 0.74 : 0.9)) / widthOf(word, 100, -0.02);
  const baseline = H * (land ? 0.5 : 0.49) + size * 0.36;
  draw(word, 820, size, -0.02, baseline);

  const caption = 'SUN-PRINTED ON HYDRA · SINCE MMXIV'; // Roman, like every date on the plates
  const cs = Math.max(11 * scale, size * 0.052);
  draw(caption, 600, cs, 0.28, baseline + size * 0.2 + cs);

  return { plants, negative };
}
