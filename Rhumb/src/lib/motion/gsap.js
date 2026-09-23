import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, CustomEase);
	// A long, confident deceleration: most reveals.
	CustomEase.create('helm', 'M0,0 C0.14,0.72 0.2,1 1,1');
	// Slow start, firm finish: things being lowered or hauled.
	CustomEase.create('haul', 'M0,0 C0.62,0 0.22,1 1,1');
	gsap.defaults({ ease: 'helm', duration: 1 });
	ScrollTrigger.config({ ignoreMobileResize: true });
	if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });
}

// Characters ScrambleText cycles through: chart and log glyphs, no letters.
export const SCRAMBLE = '·:+×/\\|<>-=_#°';

export { gsap, ScrollTrigger, SplitText, CustomEase };
