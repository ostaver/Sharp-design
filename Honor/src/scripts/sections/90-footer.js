import { gsap } from '../core/gsap.js';
import { scroller } from '../core/scroll.js';
import { revealImage, revealOnScroll } from '../components/reveal.js';

/**
 * Subscribe form, entirely client side (there is no backend):
 * the arrow button lights up once the address is valid, submitting an invalid one flags the field
 * (message + shake, announced to assistive tech), a valid one swaps the form for the thank-you message
 * and moves keyboard focus onto it.
 */
function initForm() {
  const form = document.getElementById('footer-form');
  const input = form?.querySelector('input[type="email"]');
  const submit = form?.querySelector('button[type="submit"]');
  const wrap = form?.querySelector('.input-wrap');
  const success = document.querySelector('.footer-form-success');
  if (!input || !submit || !wrap || !success) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isValid = () => input.validity.valid && /\S+@\S+\.\S+/.test(input.value);

  const flag = (on) => {
    wrap.classList.toggle('error', on);
    form.classList.toggle('has-error', on);
    if (on) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  };

  input.addEventListener('input', () => {
    submit.classList.toggle('active', isValid());
    if (isValid() || !input.value) flag(false);
  });
  input.addEventListener('blur', () => {
    if (input.value) flag(!isValid());
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!isValid()) {
      flag(true);
      input.focus();
      if (!reduceMotion.matches) {
        wrap.animate(
          { transform: ['translateX(0)', 'translateX(-0.6rem)', 'translateX(0.5rem)', 'translateX(-0.3rem)', 'translateX(0)'] },
          { duration: 420, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        );
      }
      return;
    }
    flag(false);
    form.classList.add('hidden');
    success.classList.add('active');
    success.focus({ preventScroll: true });
  });
}

/** Staggered entrance of every footer block as it scrolls in. */
function initReveals() {
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const block = (selector) => footer.querySelector(selector);
  const texts = (root) => (root ? [...root.querySelectorAll('.txt')] : []);
  const start = 'top+=55% bottom';

  document.fonts.ready.then(() => {
    const formWrap = block('.footer-form-wrap');
    const copyright = block('.footer-copyright-wrap');

    revealOnScroll(block('.footer-title-wrap'), [block('.footer-title .heading')], { start });
    revealOnScroll(
      formWrap,
      [
        formWrap?.querySelector('.footer-form-label .txt'),
        formWrap?.querySelector('.footer-form-title .txt'),
        { fade: formWrap?.querySelector('.footer-form') },
      ],
      { start },
    );
    revealOnScroll(block('.footer-menu'), texts(block('.footer-menu')), { start, step: 0.05 });
    revealOnScroll(block('.footer-info-wrap'), texts(block('.footer-info-wrap')), { start });
    revealOnScroll(
      copyright,
      [copyright?.querySelector('.footer-copyright-txt-block p'), ...texts(copyright)],
      { start: 'top+=35% bottom' },
    );
  });

  const logo = block('.footer-logo');
  revealImage(logo, logo?.querySelector('.footer-logo-inner.full'), { start });
}

/** Blot radius in wordmark units (never smaller than 64px on screen, so it stays readable on phones). */
const INK_RADIUS = 46;

/**
 * HONOR wordmark, a construction drawing: on entry the guides run out, the letter outlines are traced and the drafting
 * marks settle. Under a fine pointer the solid letters are inked in through the SVG's turbulence-displaced mask,
 * an organic blot that follows the cursor.
 */
function initWordmark() {
  const frame = document.querySelector('.footer-img-inner');
  const svg = frame?.querySelector('.wm');
  const brush = svg?.querySelector('.wm-brush');
  if (!svg || !brush) return;

  const { x: vx, y: vy, width: vw, height: vh } = svg.viewBox.baseVal;
  const pick = (selector) => svg.querySelectorAll(selector);

  // hairlines stay about one device pixel wide at every size
  new ResizeObserver(([entry]) => {
    svg.style.setProperty('--wm-sw', (1.1 * vw) / entry.contentRect.width);
  }).observe(svg);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap
      .timeline({ scrollTrigger: { trigger: frame, start: 'top 80%', once: true }, defaults: { ease: 'expo.out' } })
      .from(pick('.wm-guides path:not(.wm-dash):not(.wm-end)'), { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, stagger: 0.08 }, 0)
      .from(pick('.wm-guides .wm-dash, .wm-guides .wm-end'), { opacity: 0, duration: 1.2 }, 0.2)
      .from(pick('.wm-line path'), { drawSVG: 0, duration: 2.2, ease: 'expo.inOut', stagger: 0.14 }, 0.15)
      .from(pick('.wm-ticks path'), { opacity: 0, duration: 0.9, ease: 'power2.out', stagger: { each: 0.004, from: 'random' } }, 1.4)
      .from(pick('.wm-dim'), { opacity: 0, duration: 0.9, ease: 'power2.out' }, 1.7);
  }

  const ink = { x: vx + vw / 2, y: vy + vh / 2, r: 0 };
  const draw = () => {
    brush.setAttribute('cx', ink.x);
    brush.setAttribute('cy', ink.y);
    brush.setAttribute('r', ink.r);
  };
  const moveX = gsap.quickTo(ink, 'x', { duration: 0.5, ease: 'power3.out', onUpdate: draw });
  const moveY = gsap.quickTo(ink, 'y', { duration: 0.5, ease: 'power3.out', onUpdate: draw });
  const toSvg = ({ clientX, clientY }) => {
    const box = svg.getBoundingClientRect();
    return [vx + ((clientX - box.left) / box.width) * vw, vy + ((clientY - box.top) / box.height) * vh];
  };

  // last pointer position while it is over the wordmark, so the blot also follows when the page scrolls beneath it
  let pointer = null;
  const follow = () => {
    if (!pointer) return;
    const [x, y] = toSvg(pointer);
    moveX(x);
    moveY(y);
  };

  // pointerenter / pointerleave also fire for a finger pressing and lifting, so touch inks while held
  frame.addEventListener('pointerenter', (event) => {
    pointer = event;
    const [x, y] = toSvg(event);
    const radius = Math.max(INK_RADIUS, 64 / (svg.getBoundingClientRect().width / vw));
    gsap.set(ink, { x, y });
    gsap.to(ink, { r: radius, duration: 0.9, ease: 'expo.out', overwrite: 'auto', onUpdate: draw });
  });
  frame.addEventListener('pointermove', (event) => {
    pointer = event;
    follow();
  });
  // a tap would otherwise vanish instantly, so a lifted finger lets the blot linger a moment
  const release = (event) => {
    pointer = null;
    gsap.to(ink, {
      r: 0,
      duration: 0.8,
      delay: event.pointerType === 'mouse' ? 0 : 0.45,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onUpdate: draw,
    });
  };
  frame.addEventListener('pointerleave', release);
  frame.addEventListener('pointercancel', release);
  scroller.addEventListener('scroll', follow, { passive: true });
}

export function init() {
  initForm();
  initReveals();
  initWordmark();
}
