/**
 * Procedural botanical silhouettes for photograms, drawn with Canvas 2D.
 *
 * Paint is always white. Alpha is how much light a part blocks: an opaque stem
 * prints paper-white, a translucent petal prints a pale blue. Every generator
 * grows from its root at (0, 0) toward −y and is positioned by the caller.
 */

const TAU = Math.PI * 2;

function paint(ctx, a) {
  const c = `rgba(255,255,255,${a <= 0 ? 0 : a >= 1 ? 1 : a.toFixed(3)})`;
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
}

// A growing axis. The heading starts "up" and bends by `curl` radians in total,
// more strongly toward the tip, with an optional random wander.
function spine(len, steps, curl, rng, wander = 0) {
  const pts = [];
  const heads = [];
  const ds = len / steps;
  const jitter = wander / Math.sqrt(steps);
  let x = 0;
  let y = 0;
  let h = -Math.PI / 2;
  for (let i = 0; i <= steps; i++) {
    pts.push([x, y]);
    heads.push(h);
    h += (curl * (0.35 + 1.3 * (i / steps))) / steps + (rng() - 0.5) * jitter;
    x += Math.cos(h) * ds;
    y += Math.sin(h) * ds;
  }
  return { pts, heads };
}

function at(sp, t) {
  const n = sp.pts.length - 1;
  const f = Math.min(n, Math.max(0, t * n));
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  const a = sp.pts[i];
  const b = sp.pts[i + 1];
  return {
    x: a[0] + (b[0] - a[0]) * k,
    y: a[1] + (b[1] - a[1]) * k,
    h: sp.heads[i] + (sp.heads[i + 1] - sp.heads[i]) * k,
  };
}

// Filled outline around a polyline whose width runs from w0 to w1.
function tapered(ctx, pts, w0, w1) {
  const n = pts.length;
  if (n < 2) return;
  const left = [];
  const right = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) * 0.5;
    left.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    right.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fill();
}

function polyline(ctx, pts, width) {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function segment(ctx, x0, y0, x1, y1, width) {
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

// Lanceolate blade lying along +x with its base at the origin.
function blade(ctx, len, wid, round = 0.5) {
  const k = 0.55 + round * 0.3;
  const w = 0.55 + round * 0.45;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(len * 0.22, -wid, len * k, -wid * w, len, 0);
  ctx.bezierCurveTo(len * k, wid * w, len * 0.22, wid, 0, 0);
  ctx.closePath();
  ctx.fill();
}

let scratch = null;

// Draw opaque into a scratch layer, then composite it at `alpha`. Gives uniform
// translucency without darker seams where strokes of one organ overlap.
function translucent(ctx, alpha, draw) {
  const { width, height } = ctx.canvas;
  scratch ??= document.createElement('canvas');
  if (scratch.width !== width || scratch.height !== height) {
    scratch.width = width;
    scratch.height = height;
  }
  const s = scratch.getContext('2d');
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.clearRect(0, 0, width, height);
  s.setTransform(ctx.getTransform());
  s.lineCap = 'round';
  s.lineJoin = 'round';
  s.fillStyle = '#fff';
  s.strokeStyle = '#fff';
  draw(s);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.drawImage(scratch, 0, 0);
  ctx.restore();
}

/* ------------------------------------------------------------------ fern */
// Bipinnate frond (Dryopteris): lanceolate outline, pinnae angled toward the tip.

function fern(ctx, rng, { len = 600, curl = 0.45, pinnae = 18, width = 0.28, alpha = 1 } = {}) {
  const sp = spine(len, 160, curl, rng, 0.12);
  paint(ctx, alpha);
  tapered(ctx, sp.pts, Math.max(2.4, len * 0.01), 1);
  for (let i = 0; i < pinnae; i++) {
    const u = i / (pinnae - 1);
    const profile = Math.pow(Math.sin(Math.PI * (0.08 + 0.92 * u)), 0.7) * (1 - 0.25 * u);
    for (const side of [-1, 1]) {
      const p = at(sp, Math.min(0.985, 0.12 + 0.86 * u + (side > 0 ? 0.018 : 0)));
      const L = len * width * profile * (0.9 + rng() * 0.16);
      if (L < 6) continue;
      pinna(ctx, rng, p.x, p.y, p.h + side * (Math.PI / 2 - 0.42 - u * 0.35), L, side, alpha);
    }
  }
  const tip = at(sp, 1);
  ctx.save();
  ctx.translate(tip.x, tip.y);
  ctx.rotate(tip.h);
  blade(ctx, len * 0.04, len * 0.012, 0.6);
  ctx.restore();
}

function pinna(ctx, rng, x, y, ang, L, side, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  paint(ctx, alpha);
  const n = Math.max(3, Math.round(L / 8));
  const bend = -side * (0.16 + rng() * 0.14);
  const ds = L / n;
  const rib = [[0, 0]];
  let cx = 0;
  let cy = 0;
  let h = 0;
  for (let j = 0; j < n; j++) {
    const v = j / n;
    h += bend / n;
    const mx = cx + Math.cos(h) * ds * 0.5;
    const my = cy + Math.sin(h) * ds * 0.5;
    cx += Math.cos(h) * ds;
    cy += Math.sin(h) * ds;
    rib.push([cx, cy]);
    const s = Math.max(2, L * 0.1 * (1 - v * 0.7));
    for (const k of [-1, 1]) {
      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(h + k * (0.95 - v * 0.3) + (rng() - 0.5) * 0.1);
      blade(ctx, s, s * 0.38, 0.75);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(h);
  blade(ctx, Math.max(3, L * 0.09), Math.max(1.6, L * 0.035), 0.7);
  ctx.restore();
  tapered(ctx, rib, Math.max(1.3, L * 0.022), 0.6);
  ctx.restore();
}

/* ------------------------------------------------------------ maidenhair */
// Adiantum capillus-veneris: wiry black stems, fan-shaped pinnules on hair stalks.

function maidenhair(ctx, rng, { len = 520, alpha = 1 } = {}) {
  const sp = spine(len, 120, (rng() - 0.5) * 0.8, rng, 0.35);
  paint(ctx, alpha);
  polyline(ctx, sp.pts, Math.max(1.6, len * 0.0048));
  const branches = 4 + Math.floor(rng() * 3);
  for (let i = 0; i < branches; i++) {
    const t = 0.3 + (0.55 * i) / branches + rng() * 0.04;
    const p = at(sp, t);
    const side = i % 2 ? 1 : -1;
    const bl = len * (0.46 - 0.26 * t) * (0.85 + rng() * 0.3);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.h + side * (0.55 + rng() * 0.35) + Math.PI / 2);
    const b = spine(bl, 60, side * (0.25 + rng() * 0.45), rng, 0.25);
    paint(ctx, alpha);
    polyline(ctx, b.pts, Math.max(1, len * 0.0028));
    pinnules(ctx, rng, b, 0.08, 1, bl * 0.12 + len * 0.012, alpha);
    ctx.restore();
  }
  pinnules(ctx, rng, sp, 0.55, 1, len * 0.05, alpha);
}

function pinnules(ctx, rng, sp, t0, t1, size, alpha) {
  const n = Math.max(3, Math.round((t1 - t0) * 16));
  for (let k = 0; k <= n; k++) {
    const v = k / n;
    const p = at(sp, t0 + (t1 - t0) * v);
    const side = k % 2 ? 1 : -1;
    const s = size * (1 - 0.45 * v * v) * (0.8 + rng() * 0.35);
    const a = k === n ? p.h : p.h + side * (0.85 + rng() * 0.5);
    const sx = p.x + Math.cos(a) * s * 0.3;
    const sy = p.y + Math.sin(a) * s * 0.3;
    paint(ctx, alpha);
    segment(ctx, p.x, p.y, sx, sy, 0.8);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(a + (rng() - 0.5) * 0.35);
    fan(ctx, s, 1.4 + rng() * 0.8, 3 + Math.floor(rng() * 3), alpha * 0.86);
    ctx.restore();
  }
}

function fan(ctx, r, spread, lobes, alpha) {
  paint(ctx, alpha);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const steps = lobes * 8;
  for (let k = 0; k <= steps; k++) {
    const v = k / steps;
    const a = (v - 0.5) * spread;
    const lobe = 0.87 + 0.13 * Math.pow(Math.abs(Math.sin(v * Math.PI * lobes)), 0.5);
    const rr = r * lobe * (0.88 + 0.12 * Math.cos((v - 0.5) * Math.PI));
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  paint(ctx, alpha * 0.4);
  const veins = lobes * 2;
  for (let k = 1; k < veins; k++) {
    const a = (k / veins - 0.5) * spread * 0.92;
    segment(ctx, 0, 0, Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.84, 0.55);
  }
}

/* ----------------------------------------------------------------- umbel */
// Daucus carota, Queen Anne's lace: a lace dome of rays, each ending in florets.

function umbel(ctx, rng, { len = 560, rays = 36, alpha = 1 } = {}) {
  const sp = spine(len * 0.6, 80, (rng() - 0.5) * 0.45, rng, 0.2);
  paint(ctx, alpha);
  tapered(ctx, sp.pts, Math.max(3, len * 0.012), Math.max(2, len * 0.007));
  for (let i = 0; i < 2; i++) {
    const p = at(sp, 0.22 + i * 0.26);
    carrotLeaf(ctx, rng, p.x, p.y, p.h + (i % 2 ? 1 : -1) * (0.75 + rng() * 0.3), len * 0.2, alpha);
  }
  const c = at(sp, 1);
  const R = len * 0.34;
  paint(ctx, alpha * 0.85);
  for (let i = 0; i < 7; i++) {
    const a = c.h + Math.PI + (i / 6 - 0.5) * 2.2;
    const l = R * (0.22 + rng() * 0.12);
    const ex = c.x + Math.cos(a) * l;
    const ey = c.y + Math.sin(a) * l;
    segment(ctx, c.x, c.y, ex, ey, 0.9);
    for (const f of [-1, 1]) {
      const fx = c.x + Math.cos(a) * l * 0.6;
      const fy = c.y + Math.sin(a) * l * 0.6;
      segment(ctx, fx, fy, fx + Math.cos(a + f * 0.8) * l * 0.3, fy + Math.sin(a + f * 0.8) * l * 0.3, 0.7);
    }
  }
  // Rays spread on a cone and end on a flat-topped disc, seen from a little above.
  const H = len * 0.19;
  const axis = c.h * 0.4 - Math.PI * 0.3;
  const ux = Math.cos(axis);
  const uy = Math.sin(axis);
  for (let i = 0; i < rays; i++) {
    const cone = 0.1 + Math.sqrt(rng()) * 0.85;
    const th = rng() * TAU;
    const reach = Math.tan(cone) * H;
    const lat = reach * Math.cos(th);
    const up = H * (0.98 + 0.04 * rng()) + reach * Math.sin(th) * 0.28;
    const tx = c.x + ux * up - uy * lat;
    const ty = c.y + uy * up + ux * lat;
    paint(ctx, alpha * 0.8);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.quadraticCurveTo(c.x + ux * up * 0.55 - uy * lat * 0.4, c.y + uy * up * 0.55 + ux * lat * 0.4, tx, ty);
    ctx.stroke();
    umbellet(ctx, rng, tx, ty, ux, uy, H * 0.22, alpha);
  }
}

function umbellet(ctx, rng, x, y, ux, uy, h, alpha) {
  const n = 12 + Math.floor(rng() * 10);
  for (let k = 0; k < n; k++) {
    const cone = 0.1 + Math.sqrt(rng()) * 0.9;
    const th = rng() * TAU;
    const reach = Math.tan(cone) * h;
    const lat = reach * Math.cos(th);
    const up = h * (0.92 + rng() * 0.1) + reach * Math.sin(th) * 0.28;
    const tx = x + ux * up - uy * lat;
    const ty = y + uy * up + ux * lat;
    paint(ctx, alpha * 0.55);
    segment(ctx, x, y, tx, ty, 0.6);
    paint(ctx, alpha * 0.95);
    ctx.beginPath();
    ctx.arc(tx, ty, Math.max(1, h * (0.08 + rng() * 0.05)), 0, TAU);
    ctx.fill();
  }
}

function carrotLeaf(ctx, rng, x, y, h, L, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(h + Math.PI / 2);
  const sp = spine(L, 40, (rng() - 0.5) * 0.9, rng, 0.2);
  paint(ctx, alpha * 0.9);
  polyline(ctx, sp.pts, 1.4);
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    const p = at(sp, t);
    for (const s of [-1, 1]) {
      const a = p.h + s * (0.8 + rng() * 0.3);
      const l = L * 0.22 * (1 - t * 0.7);
      segment(ctx, p.x, p.y, p.x + Math.cos(a) * l, p.y + Math.sin(a) * l, 1);
      for (let f = 1; f <= 2; f++) {
        const fx = p.x + Math.cos(a) * l * (f / 3);
        const fy = p.y + Math.sin(a) * l * (f / 3);
        const fa = a + s * 0.7;
        segment(ctx, fx, fy, fx + Math.cos(fa) * l * 0.28, fy + Math.sin(fa) * l * 0.28, 0.8);
      }
    }
  }
  ctx.restore();
}

/* ----------------------------------------------------------------- grass */
// Briza maxima, greater quaking grass: arching culms, plump heart-shaped spikelets.

function grass(ctx, rng, { len = 600, stems = 3, alpha = 1 } = {}) {
  paint(ctx, alpha);
  for (let i = 0; i < 3; i++) {
    const sp = spine(len * (0.3 + rng() * 0.25), 60, (rng() - 0.5) * 1.8, rng, 0.2);
    tapered(ctx, sp.pts, Math.max(3, len * 0.016), 0.5);
  }
  for (let s = 0; s < stems; s++) {
    const spread = stems > 1 ? s / (stems - 1) - 0.5 : 0;
    const sp = spine(len * (0.72 + rng() * 0.3), 120, spread * 0.9 + (rng() - 0.5) * 0.5, rng, 0.2);
    paint(ctx, alpha);
    tapered(ctx, sp.pts, 2.6, 1.1);
    const n = 4 + Math.floor(rng() * 4);
    for (let k = 0; k < n; k++) {
      const p = at(sp, 0.64 + (0.34 * k) / Math.max(1, n - 1));
      const side = k % 2 ? 1 : -1;
      const a0 = p.h + side * (0.9 + rng() * 0.5);
      const pl = len * (0.05 + rng() * 0.05);
      const mx = p.x + Math.cos(a0) * pl * 0.7;
      const my = p.y + Math.sin(a0) * pl * 0.7;
      const ex = mx + Math.cos(a0) * pl * 0.15;
      const ey = my + pl * 0.55;
      paint(ctx, alpha * 0.9);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(Math.atan2(ey - my, ex - mx));
      spikelet(ctx, len * (0.042 + rng() * 0.02), alpha);
      ctx.restore();
    }
    const tip = at(sp, 1);
    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.rotate(tip.h + Math.PI * 0.35 + (rng() - 0.5) * 0.6);
    spikelet(ctx, len * 0.045, alpha);
    ctx.restore();
  }
}

function spikelet(ctx, s, alpha) {
  paint(ctx, alpha * 0.82);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.12, -s * 0.44, s * 0.8, -s * 0.5, s, 0);
  ctx.bezierCurveTo(s * 0.8, s * 0.5, s * 0.12, s * 0.44, 0, 0);
  ctx.fill();
  // Overlapping florets read as paler chevrons carved into the silhouette.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = Math.max(0.6, s * 0.03);
  for (let j = 1; j < 7; j++) {
    const x = s * 0.13 * j;
    const w = s * 0.42 * Math.sin(Math.PI * Math.min(1, x / s + 0.08));
    ctx.beginPath();
    ctx.moveTo(x - s * 0.12, -w);
    ctx.quadraticCurveTo(x + s * 0.06, 0, x - s * 0.12, w);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------------------------------------------------------------- ginkgo */
// Ginkgo biloba: a translucent fan, notched in the middle, veins radiating from the stalk.

function ginkgo(ctx, rng, { len = 360, alpha = 1 } = {}) {
  const stalk = spine(len * 0.4, 30, (rng() - 0.5) * 0.7, rng, 0.1);
  paint(ctx, alpha);
  tapered(ctx, stalk.pts, Math.max(2.5, len * 0.012), Math.max(1.8, len * 0.008));
  const p = at(stalk, 1);
  const R = len * 0.6;
  const spread = 2.1 + rng() * 0.5;
  const notch = rng() < 0.75 ? 0.2 + rng() * 0.12 : 0;
  const phase = rng() * 10;
  const steps = 96;
  const edge = [];
  for (let k = 0; k <= steps; k++) {
    const v = k / steps;
    const a = (v - 0.5) * spread;
    let r = R * (0.9 + 0.1 * Math.cos((v - 0.5) * Math.PI * 1.1));
    r *= 1 + 0.022 * Math.sin(v * 41 + phase) + 0.012 * Math.sin(v * 97 + phase * 2);
    r *= 1 - notch * Math.exp(-Math.pow((v - 0.5) / 0.03, 2));
    edge.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.h);
  translucent(ctx, alpha * 0.8, (s) => {
    s.beginPath();
    s.moveTo(0, 0);
    for (const [x, y] of edge) s.lineTo(x, y);
    s.closePath();
    s.fill();
  });
  paint(ctx, alpha * 0.45);
  ctx.lineWidth = 0.8;
  const veins = 36;
  for (let k = 0; k < veins; k++) {
    const v = (k + 0.5) / veins;
    const a = (v - 0.5) * spread * 0.95;
    const e = edge[Math.round(v * steps)];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3, e[0] * 0.96, e[1] * 0.96);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------- dandelion */
// Taraxacum clock: seeds on a Fibonacci sphere, each with a beak and a parachute.

function dandelion(ctx, rng, { len = 560, seeds = 150, alpha = 1 } = {}) {
  const sp = spine(len * 0.6, 80, (rng() - 0.5) * 0.55, rng, 0.15);
  paint(ctx, alpha * 0.9);
  tapered(ctx, sp.pts, Math.max(3, len * 0.011), Math.max(2.4, len * 0.008));
  const c = at(sp, 1);
  const R = len * 0.3;
  const ux = Math.cos(c.h);
  const uy = Math.sin(c.h);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < seeds; i++) {
    const dy = 1 - (2 * (i + 0.5)) / seeds;
    if (dy < -0.8) continue; // bare where the stem joins the head
    const r = Math.sqrt(1 - dy * dy);
    const ph = i * golden;
    const dx = Math.cos(ph) * r;
    const dz = Math.sin(ph) * r;
    const X = ux * dy - uy * dx;
    const Y = uy * dy + ux * dx;
    const proj = Math.hypot(X, Y);
    const a = alpha * (0.55 + 0.45 * (dz * 0.5 + 0.5));
    const x1 = c.x + X * R * 0.6;
    const y1 = c.y + Y * R * 0.6;
    paint(ctx, a * 0.75);
    segment(ctx, c.x + X * R * 0.1, c.y + Y * R * 0.1, x1, y1, 0.75);
    paint(ctx, a);
    ctx.beginPath();
    ctx.ellipse(c.x + X * R * 0.14, c.y + Y * R * 0.14, R * 0.028, R * 0.011, Math.atan2(Y, X), 0, TAU);
    ctx.fill();
    paint(ctx, a * 0.26);
    const base = Math.atan2(Y, X);
    const fanSpread = 1.8 + (TAU - 1.8) * (1 - proj) * (1 - proj);
    for (let f = 0; f < 14; f++) {
      const fa = base + (f / 13 - 0.5) * fanSpread;
      const fl = R * 0.36 * (0.75 + rng() * 0.3) * (0.35 + 0.65 * proj);
      segment(ctx, x1, y1, x1 + Math.cos(fa) * fl, y1 + Math.sin(fa) * fl, 0.5);
    }
  }
  paint(ctx, alpha);
  ctx.beginPath();
  ctx.arc(c.x, c.y, R * 0.075, 0, TAU);
  ctx.fill();
}

/* --------------------------------------------------------------- seaweed */
// Dictyota dichotoma, after Anna Atkins: flat ribbons forking again and again.

function seaweed(ctx, rng, { len = 560, depth = 7, alpha = 0.82 } = {}) {
  translucent(ctx, alpha, (s) => {
    s.beginPath();
    s.ellipse(0, 0, len * 0.014, len * 0.009, 0, 0, TAU);
    s.fill();
    const seg = (x, y, h, l, w, d) => {
      const pts = [[x, y]];
      const curl = (rng() - 0.5) * 0.6;
      let cx = x;
      let cy = y;
      let ch = h;
      for (let k = 0; k < 10; k++) {
        ch += curl / 10 + (rng() - 0.5) * 0.12;
        cx += (Math.cos(ch) * l) / 10;
        cy += (Math.sin(ch) * l) / 10;
        pts.push([cx, cy]);
      }
      tapered(s, pts, w, w * 0.95);
      // Some fronds stop early, which keeps the outline irregular like a real alga.
      if (d === 0 || (d < 4 && rng() < 0.14)) {
        s.beginPath();
        s.arc(cx, cy, w * 0.48, 0, TAU);
        s.fill();
        return;
      }
      const spread = 0.3 + rng() * 0.32;
      const skew = (rng() - 0.5) * 0.35;
      seg(cx, cy, ch - spread / 2 + skew, l * (0.82 + rng() * 0.16), w * 0.93, d - 1);
      seg(cx, cy, ch + spread / 2 + skew, l * (0.82 + rng() * 0.16), w * 0.93, d - 1);
    };
    seg(0, 0, -Math.PI / 2, len * 0.13, len * 0.02, depth);
  });
}

/* --------------------------------------------------------------- feather */
// A gull's primary: asymmetric vanes of fine barbs, a split or two, down at the base.

function feather(ctx, rng, { len = 560, alpha = 1 } = {}) {
  const sp = spine(len, 140, 0.22 + (rng() - 0.5) * 0.25, rng, 0.04);
  paint(ctx, alpha * 0.95);
  tapered(ctx, sp.pts, Math.max(3, len * 0.013), 1);
  const wide = [len * 0.1, len * 0.16];
  const gaps = [0.3 + rng() * 0.5, 0.35 + rng() * 0.5];
  const barbs = 420;
  ctx.lineWidth = 0.9;
  for (let i = 0; i < barbs; i++) {
    const t = 0.17 + (0.83 * i) / barbs;
    const p = at(sp, t);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, (t - 0.17) / 0.85)), 0.55);
    for (let si = 0; si < 2; si++) {
      const side = si ? 1 : -1;
      const W = wide[si] * env * (1 - 0.12 * t);
      if (W < 1.2) continue;
      const split = Math.abs(t - gaps[si]) < 0.012;
      const th = 0.6 - t * 0.18 + (split ? 0.22 : 0);
      const l = W / Math.sin(th + 0.25);
      const a = p.h + side * th;
      const ca = p.h + side * th * 1.4;
      paint(ctx, alpha * (split ? 0.1 : 0.3));
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(
        p.x + Math.cos(ca) * l * 0.5,
        p.y + Math.sin(ca) * l * 0.5,
        p.x + Math.cos(a) * l,
        p.y + Math.sin(a) * l,
      );
      ctx.stroke();
    }
  }
  paint(ctx, alpha * 0.14);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 90; i++) {
    const p = at(sp, 0.1 + rng() * 0.09);
    const side = rng() < 0.5 ? -1 : 1;
    const a = p.h + side * (0.5 + rng() * 1.1);
    const l = len * (0.04 + rng() * 0.06);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.bezierCurveTo(
      p.x + Math.cos(a) * l * 0.4,
      p.y + Math.sin(a) * l * 0.4,
      p.x + Math.cos(a + side * 0.9) * l * 0.8,
      p.y + Math.sin(a + side * 0.9) * l * 0.8,
      p.x + Math.cos(a + side * 0.3) * l,
      p.y + Math.sin(a + side * 0.3) * l,
    );
    ctx.stroke();
  }
}

/* ------------------------------------------------------------ cornflower */
// Centaurea cyanus — the flower that takes its name from kyanos.

function cornflower(ctx, rng, { len = 520, alpha = 1 } = {}) {
  const sp = spine(len * 0.72, 90, (rng() - 0.5) * 0.7, rng, 0.2);
  paint(ctx, alpha);
  tapered(ctx, sp.pts, Math.max(2.6, len * 0.008), Math.max(1.8, len * 0.005));
  for (let i = 0; i < 5; i++) {
    const t = 0.1 + i * 0.15;
    const p = at(sp, t);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.h + (i % 2 ? 1 : -1) * (0.4 + rng() * 0.3));
    paint(ctx, alpha * 0.88);
    blade(ctx, len * (0.2 - t * 0.12), len * 0.013, 0.3);
    ctx.restore();
  }
  const c = at(sp, 1);
  const R = len * 0.16;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.h);
  paint(ctx, alpha * 0.95);
  ctx.beginPath();
  ctx.ellipse(R * 0.26, 0, R * 0.3, R * 0.22, 0, 0, TAU);
  ctx.fill();
  const n = 8 + Math.floor(rng() * 3);
  for (let k = 0; k < n; k++) {
    ctx.save();
    ctx.translate(R * 0.46, 0);
    ctx.rotate((k / (n - 1) - 0.5) * 3.2 + (rng() - 0.5) * 0.14);
    floret(ctx, R * (0.95 + rng() * 0.25), R * (0.46 + rng() * 0.1), alpha * 0.8);
    ctx.restore();
  }
  paint(ctx, alpha * 0.9);
  for (let k = 0; k < 16; k++) {
    const a = (rng() - 0.5) * 1.3;
    const l = R * (0.3 + rng() * 0.2);
    const x1 = R * 0.46 + Math.cos(a) * l;
    const y1 = Math.sin(a) * l;
    segment(ctx, R * 0.46, 0, x1, y1, 1);
    ctx.beginPath();
    ctx.arc(x1, y1, R * 0.03, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function floret(ctx, L, W, alpha) {
  paint(ctx, alpha);
  ctx.beginPath();
  ctx.moveTo(0, -W * 0.06);
  ctx.bezierCurveTo(L * 0.42, -W * 0.08, L * 0.68, -W * 0.28, L * 0.84, -W * 0.5);
  const teeth = 5;
  for (let t = 0; t < teeth; t++) {
    const y0 = -W * 0.5 + (W * t) / teeth;
    ctx.lineTo(L * (0.99 + 0.04 * Math.sin(t * 2.3)), y0 + (W / teeth) * 0.5);
    ctx.lineTo(L * 0.86, y0 + W / teeth);
  }
  ctx.bezierCurveTo(L * 0.68, W * 0.28, L * 0.42, W * 0.08, 0, W * 0.06);
  ctx.closePath();
  ctx.fill();
}

/* -------------------------------------------------------------- registry */

export const SPECIMENS = { fern, maidenhair, umbel, grass, ginkgo, dandelion, seaweed, feather, cornflower };

// Draw a specimen with its root at (x, y), rotated by `angle` (0 = growing straight up).
export function place(ctx, rng, type, x, y, angle, opts) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  SPECIMENS[type](ctx, rng, opts);
  ctx.restore();
}
