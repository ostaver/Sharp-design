// The loader is the first step of the process: a wide brush coats the sheet in three passes,
// its pace tied to real work (fonts, specimens, WebGL). When it is done the coat evens out
// and lifts away onto a sheet that looks exactly the same. The same brush coats a fresh sheet
// when the visitor asks for one at the foot of the page.
import gsap from 'gsap';
import { mulberry32 } from '../lib/rng.js';
import { COAT, makeBrush, sweep } from './brush.js';

export class Preloader {
  constructor(el, { reduced = false, minDuration = reduced ? 300 : 2300 } = {}) {
    this.el = el;
    this.canvas = el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.target = 0;
    this.shown = 0;
    this.painted = 0;
    this.t0 = performance.now();
    this.minDuration = minDuration;
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
      const reverse = i % 2 === 1;
      return {
        brush: makeBrush(rng, { cy: (this.h / bands) * (i + 0.5), half: (this.h / bands) * 0.7, count: 340, thick: [2.5, 10], sway: 1.6 }),
        at: (u) => {
          const x = -0.06 * this.w + u * 1.12 * this.w;
          return reverse ? this.w - x : x;
        },
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
      sweep(this.ctx, this.passes, this.painted, this.shown);
      this.painted = this.shown;
    }
    if (this.shown >= 1 && this.done) {
      const done = this.done;
      this.done = null;
      done();
    }
  }

  // Even the streaks into one flat coat, run `whileCovered` behind it, then lift it away.
  async finish(whileCovered) {
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
      );
    await whileCovered?.();
    await gsap.to(this.el, { autoAlpha: 0, duration: 0.8, ease: 'power2.out', delay: 0.05 });
    this.el.remove();
  }
}
