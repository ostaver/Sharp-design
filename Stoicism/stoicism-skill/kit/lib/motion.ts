import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

// House easing: stone settles. Every timed tween uses it unless it says otherwise.
gsap.registerEase('stone', (p: number) => 1 - Math.pow(1 - p, 4.2));
gsap.defaults({ ease: 'stone', duration: 1.1 });

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type ScrollToOptions = NonNullable<Parameters<Lenis['scrollTo']>[1]>;
type ScrollListener = (lenis: Lenis) => void;

let lenis: Lenis | null = null;
const listeners = new Set<ScrollListener>();

/** Smooth wheel scrolling on the GSAP ticker. Not started under reduced motion. */
export function startLenis(): Lenis | null {
  if (lenis || reducedMotion) return lenis;
  const l = new Lenis({ anchors: true, lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
  l.on('scroll', (instance: Lenis) => {
    ScrollTrigger.update();
    listeners.forEach((fn) => fn(instance));
  });
  gsap.ticker.add((time) => l.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis = l;
  return l;
}

export const getLenis = (): Lenis | null => lenis;

/** Runs on every Lenis frame (not under reduced motion — pair it with a native 'scroll' listener). */
export function onScroll(fn: ScrollListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function scrollTo(target: string | number | HTMLElement, opts: ScrollToOptions = {}): void {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4), ...opts });
    return;
  }
  const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth';
  if (typeof target === 'number') window.scrollTo({ top: target, behavior });
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView({ behavior });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
