import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

let lenis = null;
let locked = false;

// Smooth wheel scrolling on top of native scroll, so ScrollTrigger, sticky positioning
// and anchor links all keep working. Skipped entirely for reduced motion.
export function startScroll({ reduced }) {
	if (reduced) return null;
	lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
	lenis.on('scroll', ScrollTrigger.update);
	if (locked) lenis.stop();
	gsap.ticker.add(raf);
	gsap.ticker.lagSmoothing(0);
	return lenis;
}

function raf(time) {
	lenis?.raf(time * 1000);
}

export function scrollTo(target, opts = {}) {
	if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
	else {
		const el = typeof target === 'string' ? document.querySelector(target) : target;
		if (typeof target === 'number') window.scrollTo({ top: target });
		else el?.scrollIntoView({ block: 'start' });
	}
}

// The preloader locks before the page's onMount creates Lenis, so the lock can span
// Lenis being created. Always set the native overflow too, or an unlock that lands
// after startScroll leaves html overflow:hidden behind — which kills touch scrolling.
export function lockScroll(on) {
	locked = on;
	document.documentElement.style.overflow = on ? 'hidden' : '';
	if (lenis) on ? lenis.stop() : lenis.start();
}

export function stopScroll() {
	gsap.ticker.remove(raf);
	lenis?.destroy();
	lenis = null;
}
