import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap.js';

let lenis = null;

// Smooth wheel scrolling on top of native scroll, so ScrollTrigger, sticky positioning
// and anchor links all keep working. Skipped entirely for reduced motion.
export function startScroll({ reduced }) {
	if (reduced) return null;
	lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
	if (document.documentElement.style.overflow === 'hidden') lenis.stop();
	lenis.on('scroll', ScrollTrigger.update);
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

// Svelte mounts children before parents, so the Preloader can lock before Lenis exists.
// That lock lands on <html> as overflow:hidden, which a later Lenis start() never clears
// and which blocks native touch scrolling (Lenis does not take over touch). Always
// apply and clear the inline lock, and drive Lenis too when it is running.
export function lockScroll(locked) {
	document.documentElement.style.overflow = locked ? 'hidden' : '';
	if (!lenis) return;
	locked ? lenis.stop() : lenis.start();
}

export function stopScroll() {
	gsap.ticker.remove(raf);
	lenis?.destroy();
	lenis = null;
}
