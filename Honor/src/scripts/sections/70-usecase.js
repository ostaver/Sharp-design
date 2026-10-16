import { revealImage, revealOnScroll } from '../components/reveal.js';

const SLIDE_DURATION = 0.45;
const SLIDE_EASE = 'power2.inOut';

/**
 * Use-case FAQ: clicking a row opens it (one at a time) and cross-fades the left image to the one
 * belonging to that row; clicking the open row closes it and leaves the image as it is.
 */
export function init({ gsap }) {
  const section = document.querySelector('.home-usecase');
  const rows = section ? [...section.querySelectorAll('.home-usecase-faq-item')] : [];
  if (!rows.length) return;
  const images = [...section.querySelectorAll('.home-usecase-img-item')];
  const subOf = (row) => row.querySelector('.home-usecase-faq-item-sub');

  const open = (row, animate) => {
    const sub = subOf(row);
    row.classList.add('active');
    gsap.killTweensOf(sub);
    gsap.set(sub, { display: 'block' });
    if (animate) {
      gsap.from(sub, {
        height: 0,
        paddingTop: 0,
        overflow: 'hidden',
        duration: SLIDE_DURATION,
        ease: SLIDE_EASE,
        clearProps: 'height,paddingTop,overflow',
      });
    }
  };

  const close = (row) => {
    const sub = subOf(row);
    row.classList.remove('active');
    gsap.killTweensOf(sub);
    gsap.to(sub, {
      height: 0,
      paddingTop: 0,
      overflow: 'hidden',
      duration: SLIDE_DURATION,
      ease: SLIDE_EASE,
      onComplete: () => gsap.set(sub, { clearProps: 'all' }),
    });
  };

  const select = (index) => images.forEach((img, i) => img.classList.toggle('active', i === index));

  rows.forEach((row, index) => {
    row.addEventListener('click', () => {
      if (row.classList.contains('active')) {
        close(row);
        return;
      }
      rows.filter((other) => other.classList.contains('active')).forEach(close);
      open(row, true);
      select(index);
    });
  });

  open(rows[0], false);
  select(0);

  document.fonts.ready.then(() => {
    const titleWrap = section.querySelector('.home-usecase-title-wrap');
    revealOnScroll(
      titleWrap,
      [titleWrap?.querySelector('.home-usecase-label .txt'), titleWrap?.querySelector('.home-usecase-title .heading')],
      { start: 'top+=40% bottom' },
    );

    const list = section.querySelector('.home-usecase-faq-list');
    revealOnScroll(
      list,
      [
        { line: rows[0].querySelector('.line.top') },
        ...rows.flatMap((row) => [
          row.querySelector('.home-usecase-faq-item-title .heading'),
          { fade: row.querySelector('.home-usecase-faq-item-ic') },
          row.classList.contains('active') ? subOf(row).querySelector('.txt') : null,
        ]),
      ],
      { start: 'top+=65% bottom', step: 0.045, first: 0.03 },
    );
  });

  const imageCms = section.querySelector('.home-usecase-img-cms');
  revealImage(imageCms, section.querySelector('.home-usecase-img-list'), { start: 'top+=35% bottom' });
}
