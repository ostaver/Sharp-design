import { gsap, SplitText } from '../core/gsap.js';
import { startScroll, stopScroll } from '../core/scroll.js';
import { createCrosshair } from '../components/crosshair.js';

const MIN_DURATION = 3.2; // seconds the loader always plays
const MAX_WAIT = 9; // seconds before stalled assets stop holding the loader
const HOLD_AT_FULL = 0.4; // seconds the counter rests on 100%
const EXIT_DURATION = 1.6;
const BAR_REST_COLOR = '#b3b3af';

let markDone;
/** Resolves once the overlay is gone and the page intro (header, hero, cookie banner) may play. */
export const loaderDone = new Promise((resolve) => {
  markDone = resolve;
});

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts the assets the loader waits for (fonts, window load, eager images). Failures count as settled. */
function trackAssets() {
  let total = 0;
  let settled = 0;
  const track = (promise) => {
    total += 1;
    promise.then(() => (settled += 1), () => (settled += 1));
  };

  track(document.fonts ? document.fonts.ready : Promise.resolve());
  if (document.readyState !== 'complete') {
    track(new Promise((resolve) => window.addEventListener('load', resolve, { once: true })));
  }
  Array.from(document.images)
    .filter((img) => img.loading !== 'lazy' && !img.complete)
    .forEach((img) =>
      track(
        new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        }),
      ),
    );

  return () => (total ? settled / total : 1);
}

/** Prepares the staged blocks and plays the "blueprint drawing" intro; returns the elements the exit needs. */
function playIntro(loading) {
  const find = (selector) => loading.querySelector(selector);
  const findAll = (selector) => Array.from(loading.querySelectorAll(selector));

  gsap.set(findAll('[df-init]'), { opacity: 1 });

  const progressText = find('.loading-progress-text');
  const rows = findAll('.loading-content-sub-item-txt');
  const strokes = findAll('.loading-img svg path, .loading-img svg line, .loading-img svg circle');
  const titleSplit = new SplitText(find('.loading-content-title .heading'), {
    type: 'lines',
    mask: 'lines',
    linesClass: 'heading-mask-line',
  });

  strokes.forEach((stroke) => {
    const length = stroke.getTotalLength();
    gsap.set(stroke, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set(progressText, { opacity: 0 });
  gsap.set(rows, { opacity: 0 });
  gsap.set(titleSplit.lines, { yPercent: 110, opacity: 0 });

  gsap
    .timeline()
    .to(strokes, { strokeDashoffset: 0, duration: 1.3, ease: 'power1.out', stagger: { amount: 3, from: 'start' } }, 0)
    .to(titleSplit.lines, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, 0)
    .to(progressText, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)
    .to(rows, { opacity: 1, duration: 0.25, ease: 'power3.out', stagger: 0.2 }, 0);
}

/** The ruler crosshair + coordinates that follow the pointer while loading (desktop, fine pointer only). */
function trackPointer(loading) {
  if (!window.matchMedia('(hover: hover) and (min-width: 992px)').matches) return () => {};

  const ruler = loading.querySelector('.loading-ruler');
  if (!ruler) return () => {};
  const crosshair = createCrosshair({
    area: loading,
    horizontal: ruler.querySelector('.line-horizital'),
    vertical: ruler.querySelector('.line-vertical'),
    plus: ruler.querySelector('.loading-ruler-plus'),
    label: ruler.querySelector('.loading-ruler-coordi'),
    readoutX: ruler.querySelector('[data-loading-control="x"]'),
    readoutY: ruler.querySelector('[data-loading-control="y"]'),
  });

  const onMove = (event) => {
    const first = !ruler.classList.contains('active');
    crosshair.move(event.clientX, event.clientY, { jump: first });
    if (first) ruler.classList.add('active');
  };
  window.addEventListener('pointermove', onMove);

  return () => {
    window.removeEventListener('pointermove', onMove);
    ruler.classList.remove('active');
  };
}

/** The loading bar splits: its halves sweep to the hero image edges while the overlay opens like a shutter. */
function playExit(loading, onComplete) {
  const find = (selector) => loading.querySelector(selector);
  const main = find('.loading-main');
  const barOrigin = find('.loading-progress').getBoundingClientRect().top;
  const image = (document.querySelector('.home-hero-img') || main).getBoundingClientRect();
  const shutter = { open: 0 };

  const renderShutter = () => {
    const upper = 50.05 * (1 - shutter.open);
    const lower = 49.95 + 50.05 * shutter.open;
    main.style.clipPath = `polygon(0% 0%, 100% 0%, 100% ${upper}%, 0% ${upper}%, 0% ${lower}%, 100% ${lower}%, 100% 100%, 0% 100%)`;
  };
  renderShutter();

  gsap
    .timeline({ onComplete })
    .to(find('.item-top'), { y: image.top - barOrigin, backgroundColor: BAR_REST_COLOR, duration: EXIT_DURATION, ease: 'expo.out' }, 0)
    .to(find('.item-bot'), { y: image.bottom - barOrigin, backgroundColor: BAR_REST_COLOR, duration: EXIT_DURATION, ease: 'expo.out' }, 0)
    .to(shutter, { open: 1, duration: EXIT_DURATION, ease: 'expo.out', onUpdate: renderShutter }, 0)
    .to([find('.loading-content'), find('.loading-progress-text')], { opacity: 0, duration: 0.6, ease: 'expo.out' }, 0);
}

export function init() {
  const loading = document.querySelector('.loading');
  if (!loading || prefersReducedMotion()) {
    loading?.classList.add('loaded');
    markDone();
    return;
  }

  stopScroll();
  playIntro(loading);
  const stopPointer = trackPointer(loading);

  const percent = loading.querySelector('.loading-progress-txt-percent');
  const barWrap = loading.querySelector('.loading-progress-item-wrap');
  const assetProgress = trackAssets();
  const ease = gsap.parseEase('power1.out');
  const state = { value: 0, exiting: false };
  const startedAt = performance.now();

  const render = () => {
    percent.textContent = Math.round(state.value);
    barWrap.style.width = `${state.value}%`;
  };

  const exit = () => {
    if (state.exiting) return;
    state.exiting = true;
    gsap.ticker.remove(tick);
    state.value = 100;
    render();
    stopPointer();
    gsap.delayedCall(HOLD_AT_FULL, () =>
      playExit(loading, () => {
        loading.classList.add('loaded');
        startScroll();
        markDone();
      }),
    );
  };

  function tick(_time, deltaTime) {
    const elapsed = (performance.now() - startedAt) / 1000;
    const paced = ease(Math.min(1, elapsed / MIN_DURATION)) * 100;
    const target = Math.min(assetProgress() * 100, paced);
    state.value += (target - state.value) * (1 - Math.exp(-(deltaTime / 1000) * 8));
    render();
    if (target >= 100 && state.value > 99.5) exit();
  }

  gsap.ticker.add(tick);
  // stalled or failed assets must never trap the user behind the overlay
  window.setTimeout(exit, MAX_WAIT * 1000);
}
