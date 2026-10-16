import { gsap, ScrollTrigger, SplitText } from '../core/gsap.js';

/**
 * Splits a heading into masked lines and slides them up when it enters the viewport.
 * Returns the SplitText instance so callers can revert it on resize.
 */
export function revealLines(el, { start = 'top 85%', delay = 0, stagger = 0.08, duration = 0.9, trigger = el } = {}) {
  if (!el) return null;
  const split = new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'heading-mask-line' });
  gsap.set(split.lines, { yPercent: 110 });
  ScrollTrigger.create({
    trigger,
    start,
    once: true,
    onEnter: () =>
      gsap.to(split.lines, { yPercent: 0, duration, delay, stagger, ease: 'power3.out' }),
  });
  return split;
}
