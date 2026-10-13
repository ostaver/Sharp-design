import Lenis from 'lenis';
import type { ScrollToOptions } from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;

export interface StartScrollOptions {
	reduced?: boolean;
}

// Smooth wheel scrolling on top of native scroll, so ScrollTrigger, sticky positioning
// and anchor links all keep working. Skipped entirely for reduced motion.
export function startScroll({ reduced }: StartScrollOptions): Lenis | null {
	// The night always starts at dusk. SvelteKit restores the last offset from sessionStorage
	// on reload even with scrollRestoration 'manual', so reset here (deep links keep theirs).
	if (typeof window !== 'undefined' && !location.hash) window.scrollTo(0, 0);
	if (reduced) return null;
	lenis = new Lenis({ lerp: 0.105, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false });
	if (typeof document !== 'undefined' && document.documentElement.style.overflow === 'hidden') lenis.stop();
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add(raf);
	gsap.ticker.lagSmoothing(0);
	return lenis;
}

function raf(time: number): void {
	lenis?.raf(time * 1000);
}

export function scrollTo(target: string | number | HTMLElement, opts: ScrollToOptions = {}): void {
	if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4), ...opts });
	else if (typeof target === 'number') {
		window.scrollTo({ top: target });
	} else {
		const el = typeof target === 'string' ? document.querySelector(target) : target;
		el?.scrollIntoView({ block: 'start' });
	}
}

// Svelte mounts children before parents, so the Preloader can lock before Lenis exists.
// That lock lands on <html> as overflow:hidden, which a later Lenis start() never clears
// and which blocks native touch scrolling (Lenis does not take over touch). Always
// apply and clear the inline lock, and drive Lenis too when it is running.
export function lockScroll(locked: boolean): void {
	if (typeof document !== 'undefined') document.documentElement.style.overflow = locked ? 'hidden' : '';
	if (!lenis) return;
	locked ? lenis.stop() : lenis.start();
}

export function stopScroll(): void {
	gsap.ticker.remove(raf);
	lenis?.destroy();
	lenis = null;
}
