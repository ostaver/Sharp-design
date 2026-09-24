import { gsap, SplitText, SCRAMBLE } from './gsap.js';
import { ui } from '$lib/state.svelte.js';

/**
 * Scroll reveals for everything inside `root` marked with data-r:
 *   lines  — heading lines rise out of masks
 *   fade   — a short lift and fade
 *   label  — mono labels decode through chart glyphs
 *   clip   — a panel is drawn open from the top edge
 *   term   — alias of clip, for terminals
 * Call inside a gsap.context so everything is reverted with the component.
 */
export function reveal(root, { start = 'top 84%' } = {}) {
	const els = root.querySelectorAll('[data-r]');
	if (ui.reduced) {
		gsap.set(els, { autoAlpha: 1 });
		return;
	}
	els.forEach((el) => {
		const kind = el.dataset.r;
		const delay = parseFloat(el.dataset.delay || '0');
		const st = { trigger: el, start, once: true };

		if (kind === 'lines') {
			SplitText.create(el, {
				type: 'lines',
				mask: 'lines',
				linesClass: 'ln',
				autoSplit: true,
				onSplit(self) {
					gsap.set(el, { autoAlpha: 1 });
					return gsap.from(self.lines, {
						yPercent: 125,
						duration: 1.25,
						stagger: 0.09,
						delay,
						ease: 'helm',
						scrollTrigger: st
					});
				}
			});
		} else if (kind === 'fade') {
			// opacity, not autoAlpha: hidden content must stay reachable by keyboard
			gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, delay, scrollTrigger: st });
		} else if (kind === 'label') {
			const text = el.textContent;
			gsap.set(el, { autoAlpha: 1 });
			gsap.from(el, {
				duration: 1,
				delay,
				scrambleText: { text: '', chars: SCRAMBLE, revealDelay: 0.25 },
				scrollTrigger: st,
				onComplete: () => (el.textContent = text)
			});
		} else if (kind === 'clip' || kind === 'term') {
			gsap.fromTo(
				el,
				{ autoAlpha: 1, clipPath: 'inset(0% 0% 100% 0%)' },
				{ clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, delay, ease: 'haul', scrollTrigger: st }
			);
		}
	});
}
