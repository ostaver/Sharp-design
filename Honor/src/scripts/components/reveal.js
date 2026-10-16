import { gsap, ScrollTrigger, SplitText } from '../core/gsap.js';

const FADE_OFFSET = 32;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Words start below their line mask; once they have slid in the split is reverted so text reflows naturally. */
function textTween(el, at) {
  const split = new SplitText(el, { type: 'lines,words', mask: 'lines' });
  gsap.set(split.words, { yPercent: 100, autoAlpha: 0 });
  return {
    at,
    play: () =>
      gsap.to(split.words, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.02,
        onComplete: () => split.revert(),
      }),
  };
}

function fadeTween(el, at) {
  gsap.set(el, { y: FADE_OFFSET, opacity: 0 });
  return {
    at,
    play: () => gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', clearProps: 'all' }),
  };
}

function lineTween(el, at) {
  gsap.set(el, { scaleX: 0, transformOrigin: 'left top' });
  return {
    at,
    play: () => gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'none', clearProps: 'all' }),
  };
}

/**
 * Plays a staggered entrance once `trigger` scrolls into view.
 * `items` are played in order, `step` seconds apart: a bare element has its words slid up out of
 * a line mask, `{ fade: el }` rises 32px while fading in and `{ line: el }` draws itself from the left.
 */
export function revealOnScroll(trigger, items, { start, step = 0.1, first = step } = {}) {
  if (!trigger || reducedMotion.matches) return;
  const steps = items
    .filter(Boolean)
    .map((item, i) => {
      const at = first + i * step;
      if (item.fade) return fadeTween(item.fade, at);
      if (item.line) return lineTween(item.line, at);
      return textTween(item, at);
    });
  if (!steps.length) return;

  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => steps.forEach(({ at, play }) => gsap.delayedCall(at, play)),
  });
}

/** An image block settles from a 1.25x zoom while fading in. */
export function revealImage(trigger, el, { start } = {}) {
  if (!trigger || !el || reducedMotion.matches) return;
  gsap.set(el, { scale: 1.25, autoAlpha: 0 });
  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () => gsap.to(el, { scale: 1, autoAlpha: 1, duration: 1.6, ease: 'expo.out', clearProps: 'all' }),
  });
}
