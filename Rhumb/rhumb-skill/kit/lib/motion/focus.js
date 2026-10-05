import { gsap } from './gsap.js';

/**
 * Scroll reveals keep content at opacity 0 until it scrolls into view, but keyboard users
 * can tab into it sooner. Whatever holds focus finishes its reveal first.
 */
export function revealOnFocus() {
	const onFocus = (e) => {
		for (let el = e.target; el && el !== document.body; el = el.parentElement) {
			for (const t of gsap.getTweensOf(el)) {
				// only one-shot reveals; scrubbed tweens belong to the scroll position
				const st = t.scrollTrigger;
				if (st && !st.vars.scrub && t.progress() < 1) t.progress(1);
			}
		}
	};
	document.addEventListener('focusin', onFocus);
	return () => document.removeEventListener('focusin', onFocus);
}
