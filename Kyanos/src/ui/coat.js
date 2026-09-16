// The page ends on a brushstroke of raw sensitiser instead of a link back to the top.
// Pressing it brushes a fresh coat over the whole screen, carries the visitor up while the
// screen is covered, and lifts away onto an unexposed sheet: the process simply starts again.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mulberry32 } from '../lib/rng.js';
import { makeBrush, sweep } from './brush.js';
import { Preloader } from './preloader.js';

export function initCoat({ lenis, hero, reduced }) {
  const link = document.querySelector('[data-coat-fresh]');
  if (!link) return;
  const canvas = link.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const stroke = { p: reduced ? 1 : 0 };
  let passes = [];
  let painted = 0;

  const paint = () => {
    if (stroke.p <= painted) return;
    sweep(ctx, passes, painted, stroke.p);
    painted = stroke.p;
  };

  const layout = () => {
    const { width: w, height: h } = canvas.getBoundingClientRect();
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rng = mulberry32(2014);
    // two coats, as on a real sheet: the second starts a little in and lifts a little early
    passes = [
      { brush: makeBrush(rng, { cy: h * 0.5, half: h * 0.44, count: 460, thick: [1.5, 7], sway: 2.2 }), at: (u) => -0.04 * w + u * w },
      { brush: makeBrush(rng, { cy: h * 0.53, half: h * 0.36, count: 360, thick: [1.5, 7], sway: 2.2 }), at: (u) => 0.03 * w + u * 0.86 * w },
    ];
    painted = 0;
    paint();
  };

  layout();
  let queued = false;
  window.addEventListener('resize', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      layout();
    });
  });

  if (!reduced) {
    ScrollTrigger.create({
      trigger: link,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(stroke, { p: 1, duration: 1.6, ease: 'power1.inOut', onUpdate: paint }),
    });
  }

  let busy = false;
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation(); // not an ordinary in-page jump
    if (busy) return;
    busy = true;
    const toTop = () => {
      if (lenis) {
        lenis.start();
        lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        window.scrollTo(0, 0);
      }
      ScrollTrigger.update();
      hero.recoat();
    };
    if (reduced) {
      toTop();
    } else {
      lenis?.stop();
      const veil = document.createElement('div');
      veil.className = 'preloader preloader--again';
      veil.setAttribute('aria-hidden', 'true');
      veil.innerHTML = '<canvas class="preloader__coat"></canvas><p class="preloader__label">Coating a fresh sheet</p>';
      document.body.append(veil);
      const brush = new Preloader(veil, { minDuration: 1150 });
      brush.start();
      await brush.finish(toTop);
    }
    document.querySelector('[data-sun]')?.focus({ preventScroll: true });
    busy = false;
  });
}
