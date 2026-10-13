import { gsap } from './gsap';

/**
 * Scroll reveals keep content at opacity 0 until it scrolls into view, but keyboard users
 * can tab into it sooner. Whatever holds focus finishes its reveal first.
 */
export function revealOnFocus(): () => void {
	const onFocus = (e: FocusEvent): void => {
		for (let el = e.target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
			for (const t of gsap.getTweensOf(el)) {
				// only one-shot reveals; scrubbed tweens belong to the scroll position
				const st = t.scrollTrigger;
				if (st && !st.vars.scrub && t.progress() < 1) t.progress(1);
			}
		}
	};
	document.addEventListener('focusin', onFocus as EventListener);
	return () => document.removeEventListener('focusin', onFocus as EventListener);
}
