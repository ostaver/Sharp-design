// A flat hake brush, the kind used to coat the paper: a band of bristles that lays down
// streaky sensitiser and thins out where the stroke starts and where the brush lifts.
// Shared by the loader, the fresh-sheet veil and the brushstroke at the foot of the page.

export const COAT = '228, 225, 166';

export function makeBrush(rng, { cy, half, count = 150, thick = [2, 10], sway = 1 }) {
  return Array.from({ length: count }, () => {
    const v = rng() * 2 - 1;
    const edge = Math.abs(v);
    return {
      y: cy + v * half,
      w: thick[0] + rng() * (thick[1] - thick[0]),
      a: (0.35 + rng() * 0.45) * (1 - edge * 0.5),
      start: rng() * 0.05 + edge * edge * 0.12,
      end: 1 - rng() * 0.06 - edge * edge * 0.1,
      phase: rng() * 6.28,
      wobble: (0.5 + rng() * 2) * sway,
    };
  });
}

// Drag the brush along its stroke from u0 to u1 (0–1); `at(u)` gives the x position.
// Each bristle is one continuous thread: it tapers where it touches down and where it lifts,
// and carries a little less sensitiser the further the stroke goes.
function drag(ctx, brush, u0, u1, at) {
  const x0 = at(u0);
  const x1 = at(u1);
  const um = (u0 + u1) / 2;
  for (const b of brush) {
    if (um < b.start || um > b.end) continue; // dry brush: strands lift at either end
    const taper = Math.min(1, (um - b.start) / 0.025, (b.end - um) / 0.05);
    ctx.strokeStyle = `rgba(${COAT}, ${b.a * (1 - 0.3 * um)})`;
    ctx.lineWidth = b.w * (0.3 + 0.7 * taper);
    ctx.beginPath();
    ctx.moveTo(x0, b.y + Math.sin(u0 * 7 + b.phase) * b.wobble);
    ctx.lineTo(x1, b.y + Math.sin(u1 * 7 + b.phase) * b.wobble);
    ctx.stroke();
  }
}

// Paint a run of passes from one progress value to another; each pass takes an equal share.
export function sweep(ctx, passes, from, to) {
  const n = passes.length;
  let p = from;
  while (p < to - 1e-6) {
    const i = Math.min(n - 1, Math.floor(p * n + 1e-9));
    const end = Math.min(to, (i + 1) / n, p + 0.004);
    drag(ctx, passes[i].brush, p * n - i, end * n - i, passes[i].at);
    p = end;
  }
}
