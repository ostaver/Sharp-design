// Folio II: the sticky plate develops step by step while the list beside it keeps pace.
// Under the list, a test strip fills patch by patch in the colour the print has at each step.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp, smoothstep } from '../lib/rng.js';

const NAMES = ['I · Coat', 'II · Compose', 'III · Expose', 'IV · Wash', 'V · Dry'];

export function initProcess({ plate, reduced }) {
  const section = document.querySelector('.process');
  const steps = [...section.querySelectorAll('.step')];
  const caption = section.querySelector('[data-step-caption]');
  const patches = [...section.querySelectorAll('.wedge__patch')];
  let active = -1;

  const setActive = (i) => {
    if (i === active) return;
    active = i;
    steps.forEach((el, k) => el.classList.toggle('is-active', k === i));
    caption.textContent = NAMES[i];
  };
  const strip = (raw) => patches.forEach((el, k) => el.style.setProperty('--fill', clamp(raw - k).toFixed(3)));

  if (reduced) {
    steps.forEach((el) => el.classList.add('is-active'));
    caption.textContent = NAMES[4];
    plate?.setStage(5);
    strip(5);
    return;
  }

  setActive(0);
  strip(0);
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const raw = self.progress * 5;
      const i = Math.min(4, Math.floor(raw));
      // each step develops in the middle of its stretch, leaving room to read
      plate?.setStage(i + smoothstep(0.08, 0.78, raw - i));
      setActive(i);
      strip(raw);
    },
  });
}
