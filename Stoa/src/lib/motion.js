import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// House easings: stone settles, ink spreads.
gsap.registerEase('stone', (p) => 1 - Math.pow(1 - p, 4.2));
gsap.defaults({ ease: 'stone', duration: 1.1 });

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis = null;
const listeners = new Set();

export function startLenis() {
  if (lenis || reducedMotion) return lenis;
  lenis = new Lenis({ anchors: true, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
  lenis.on('scroll', (l) => {
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(l));
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export const getLenis = () => lenis;

export function onScroll(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function scrollTo(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: reducedMotion ? 'auto' : 'smooth' });
    else el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
