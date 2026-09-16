// The loader is the first step of the process: a wide brush coats the sheet in three passes,
// its pace tied to real work (fonts, specimens, WebGL). When it is done the coat evens out
// and lifts away onto a sheet that looks exactly the same.
import gsap from 'gsap';
import { mulberry32 } from '../lib/rng.js';

const COAT = '228, 225, 166';

export class Preloader {
  constructor(el, { reduced = false } = {}) {
    this.el = el;
    this.canvas = el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.counter = el.querySelector('[data-count]');
    this.target = 0;
    this.shown = 0;
    this.painted = 0;
    this.pct = -1;
    this.t0 = performance.now();
    this.minDuration = reduced ? 300 : 2300;
    this.done = null;
    this.stopped = false;
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'butt';
    const rng = mulberry32(4813);
    const bands = 3;
    this.passes = Array.from({ length: bands }, (_, i) => {
      const cy = (this.h / bands) * (i + 0.5);
      const half = (this.h / bands) * 0.7;
      return {
        dir: i % 2 ? -1 : 1,
        bristles: Array.from({ length: 150 }, () => {
          const v = rng() * 2 - 1;
          const edge = Math.abs(v);
          return {
            y: cy + v * half,
            w: 2 + rng() * 8,
            a: (0.35 + rng() * 0.45) * (1 - edge * 0.5),
            start: rng() * 0.05 + edge * edge * 0.12,
            end: 1 - rng() * 0.06 - edge * edge * 0.1,
            phase: rng() * 6.28,
            wobble: 0.5 + rng() * 2,
          };
        }),
      };
    });
    this.painted = 0; // repaint what was already coated at the new size
  }

  start() {
    const loop = (now) => {
      this.frame(now);
      if (!this.stopped) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  set(progress) {
    this.target = Math.max(this.target, Math.min(1, progress));
  }

  frame(now) {
    const clock = Math.min(1, (now - this.t0) / this.minDuration);
    const goal = Math.min(this.target, clock);
    if (goal > this.shown) this.shown = Math.min(goal, this.shown + Math.max(0.0025, (goal - this.shown) * 0.1));
    if (this.shown > this.painted) {
      this.paint(this.painted, this.shown);
      this.painted = this.shown;
    }
    const pct = Math.round(this.shown * 100);
    if (pct !== this.pct) {
      this.pct = pct;
      this.counter.textContent = String(pct).padStart(2, '0');
    }
    if (this.shown >= 1 && this.done) {
      const done = this.done;
      this.done = null;
      done();
    }
  }

  // Brush from one progress value to another; each third of the progress is one pass.
  paint(from, to) {
    const { ctx, passes } = this;
    const n = passes.length;
    let p = from;
    while (p < to - 1e-6) {
      const i = Math.min(n - 1, Math.floor(p * n + 1e-9));
      const end = Math.min(to, (i + 1) / n, p + 0.004);
      const pass = passes[i];
      const u0 = p * n - i;
      const u1 = end * n - i;
      const at = (u) => {
        const x = -0.06 * this.w + u * 1.12 * this.w;
        return pass.dir > 0 ? x : this.w - x;
      };
      const x0 = at(u0);
      const x1 = at(u1);
      const um = (u0 + u1) / 2;
      for (const b of pass.bristles) {
        if (um < b.start || um > b.end) continue; // dry brush: strands lift at either end
        const y = b.y + Math.sin(um * 7 + b.phase) * b.wobble;
        ctx.strokeStyle = `rgba(${COAT}, ${b.a})`;
        ctx.lineWidth = b.w;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      }
      p = end;
    }
  }

  async finish() {
    this.set(1);
    if (this.shown < 1) await new Promise((resolve) => (this.done = resolve));
    this.stopped = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);

    const coat = { a: 0 };
    let prev = 0;
    await gsap
      .timeline()
      .to(this.el.querySelectorAll('p'), { opacity: 0, duration: 0.35, ease: 'power1.out' }, 0)
      .to(
        coat,
        {
          a: 1,
          duration: 0.5,
          ease: 'power2.in',
          onUpdate: () => {
            // even the streaks out into one flat coat, the colour of the sheet underneath
            const step = (coat.a - prev) / Math.max(1e-6, 1 - prev);
            prev = coat.a;
            this.ctx.fillStyle = `rgba(${COAT}, ${Math.min(1, step)})`;
            this.ctx.fillRect(0, 0, this.w, this.h);
          },
        },
        0.1,
      )
      .to(this.el, { autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, '+=0.05');
    this.el.remove();
  }
}
