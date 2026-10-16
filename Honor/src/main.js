import './styles/main.css';
import { gsap, ScrollTrigger } from './scripts/core/gsap.js';
import { initScroll, lenis } from './scripts/core/scroll.js';
import { initButtons } from './scripts/components/button.js';
import { initInkMasks } from './scripts/components/ink-mask.js';

/**
 * Every file in scripts/sections exports `init(ctx)` and is run in filename order
 * (00-loader first, so numeric prefixes control sequencing).
 */
const sections = import.meta.glob('./scripts/sections/*.js', { eager: true });

function boot() {
  initScroll();
  initButtons();
  initInkMasks();

  // placeholder links (href="#") must not jump the scroller
  document.addEventListener('click', (event) => {
    if (event.target.closest('a[href="#"]')) event.preventDefault();
  });

  const ctx = { gsap, ScrollTrigger, get lenis() { return lenis; } };
  Object.entries(sections)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([file, mod]) => {
      try {
        mod.init?.(ctx);
      } catch (err) {
        console.error(`[section] ${file} failed to init`, err);
      }
    });

  // layout settles after fonts/images; keep trigger positions accurate
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
