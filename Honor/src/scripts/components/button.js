import { gsap } from '../core/gsap.js';

const FRAMES = 19; // the wipe sprite has 20 frames -> 19 steps
const WIPE_DURATION = 0.5;
// one sprite frame is a 4:1 rectangle that grows in 19.2px increments (a 96x24 frame scaled in 0.2 steps)
const FRAME_RATIO = 4;
const FRAME_STEP = 19.2;

/** Smallest 4:1 frame (stepped) that fully covers the button box. */
function sizeWipe(btn, bg) {
  const w = btn.offsetWidth;
  const h = btn.offsetHeight;
  if (!w || !h) return;
  const width = Math.ceil(Math.max(w, h * FRAME_RATIO) / FRAME_STEP) * FRAME_STEP;
  bg.style.width = `${width}px`;
  bg.style.height = `${width / FRAME_RATIO}px`;
}

/**
 * `.btn-fill` hover: a pixel-dissolve wipe (mask-position walks a 20-frame sprite) fills the
 * button on enter and dissolves it with the page colour on leave, while the label/icon layers
 * slide through the `is-fill-*` state classes.
 */
export function initButtons(root = document) {
  const canHover = window.matchMedia('(hover: hover) and (min-width: 992px)').matches;
  if (!canHover) return;

  root.querySelectorAll('.btn-fill').forEach((btn) => {
    if (btn.dataset.fillReady) return;
    btn.dataset.fillReady = '1';
    const bg = btn.querySelector('.btn-fill-bg');
    if (!bg) return;
    // hover target is the nearest link/button wrapper so the whole hit area triggers it
    const host = btn.closest('a, button') || btn;
    let tween;
    let entered = false;

    new ResizeObserver(() => sizeWipe(btn, bg)).observe(btn);

    const setFrame = (position) => gsap.set(bg, { maskPosition: position, webkitMaskPosition: position });

    const sweep = (onComplete) => {
      setFrame('0% 0');
      tween = gsap.to(bg, {
        maskPosition: '100% 0',
        webkitMaskPosition: '100% 0',
        duration: WIPE_DURATION,
        ease: `steps(${FRAMES})`,
        onComplete,
      });
    };

    const enter = () => {
      tween?.kill();
      btn.classList.remove('is-fill-exiting', 'is-fill-resetting');
      btn.classList.add('is-fill-active');
      sweep(() => {
        entered = true;
        btn.classList.add('is-fill-entered');
        setFrame('0% 0');
      });
    };

    const leave = () => {
      tween?.kill();
      btn.classList.remove('is-fill-active');
      if (!entered) {
        setFrame('0% 0');
        btn.classList.remove('is-fill-entered');
        return;
      }
      // the filled button dissolves back to the page colour with a second sweep
      btn.classList.add('is-fill-exiting', 'is-fill-resetting');
      requestAnimationFrame(() => btn.classList.remove('is-fill-resetting'));
      sweep(() => {
        entered = false;
        btn.classList.remove('is-fill-exiting', 'is-fill-entered');
        setFrame('0% 0');
      });
    };

    host.addEventListener('mouseenter', enter);
    host.addEventListener('mouseleave', leave);
  });
}
