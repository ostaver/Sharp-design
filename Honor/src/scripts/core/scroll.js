import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

/** The scrolling element. `.main-inner` has overflow:hidden and is moved programmatically by Lenis. */
export const scroller = document.querySelector('.main-inner');
export const content = scroller.querySelector('.main-content');

ScrollTrigger.defaults({ scroller });

/** @type {Lenis} */
export let lenis;

export function initScroll() {
  lenis = new Lenis({
    wrapper: scroller,
    content,
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  if (import.meta.env.DEV) window.__lenis = lenis; // dev-only hook for test scripts
  return lenis;
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();
export const scrollToY = (y, opts) => lenis?.scrollTo(y, opts);
