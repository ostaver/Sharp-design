import { gsap, ScrollTrigger } from '../core/gsap.js';
import { scroller, scrollToY } from '../core/scroll.js';

/**
 * Desktop: the two text blocks share one grid cell and stick to the vertical centre of the scroller while the stacked
 * images scroll past. The second block takes over once the second image reaches the middle of the scroller.
 */
function initStickyBlocks(root) {
  const blocks = [...root.querySelectorAll('.home-platform-content-inner')];
  const images = root.querySelectorAll('.home-platform-img-item');
  if (blocks.length < 2 || images.length < 2) return;

  const centre = () => {
    blocks.forEach((block) => {
      block.style.top = `${Math.max(0, (scroller.clientHeight - block.offsetHeight) / 2)}px`;
    });
  };
  const show = (index) => blocks.forEach((block, i) => block.classList.toggle('active', i === index));

  // a block that takes keyboard focus while hidden brings itself in by scrolling its own image to the right place
  const reveal = (index) => {
    const imageTop = images[1].getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scrollToY(scroller.scrollTop + imageTop - scroller.clientHeight * (index === 1 ? 0.45 : 0.7), { duration: 0.6 });
  };
  const focusHandlers = blocks.map((block, index) => {
    const onFocus = () => {
      if (!block.classList.contains('active')) reveal(index);
    };
    block.addEventListener('focusin', onFocus);
    return onFocus;
  });

  centre();
  ScrollTrigger.addEventListener('refresh', centre);
  ScrollTrigger.create({
    trigger: images[1],
    start: 'top 50%',
    onEnter: () => show(1),
    onLeaveBack: () => show(0),
  });

  return () => {
    ScrollTrigger.removeEventListener('refresh', centre);
    blocks.forEach((block, i) => {
      block.removeEventListener('focusin', focusHandlers[i]);
      block.style.removeProperty('top');
    });
    show(0);
  };
}

/** The first block's index number rises into place as the section approaches. */
function initNumberEntrance(root) {
  const number = root.querySelector('.home-platform-content-number');
  if (!number) return;
  gsap.from(number, {
    y: 32,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: { trigger: root, start: 'top 70%', once: true },
  });
}

export function init() {
  const root = document.querySelector('.home-platform');
  if (!root) return;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 992px)', () => initStickyBlocks(root));
  mm.add('(min-width: 992px) and (prefers-reduced-motion: no-preference)', () => initNumberEntrance(root));
}
