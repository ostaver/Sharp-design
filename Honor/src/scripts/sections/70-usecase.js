import { revealImage, revealOnScroll } from '../components/reveal.js';

/**
 * Use-case accordion: one row open at a time; opening a row cross-fades the left photo to the one
 * belonging to that row, closing the open row leaves the photo as it is. The state lives in classes /
 * aria-expanded only: the panel height, icon and photo fade are all CSS transitions (see usecase.css).
 * Each row title is a real <button>, so Enter / Space work natively; arrows, Home and End move between rows.
 */
export function init() {
  const section = document.querySelector('.home-usecase');
  const rows = section ? [...section.querySelectorAll('.home-usecase-faq-item')] : [];
  if (!rows.length) return;
  const images = [...section.querySelectorAll('.home-usecase-img-item')];
  const triggers = rows.map((row) => row.querySelector('.home-usecase-faq-item-title-wrap'));

  const setOpen = (row, trigger, open) => {
    row.classList.toggle('active', open);
    trigger.setAttribute('aria-expanded', String(open));
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      const opening = !rows[index].classList.contains('active');
      rows.forEach((row, i) => setOpen(row, triggers[i], opening && i === index));
      if (opening) images.forEach((image, i) => image.classList.toggle('active', i === index));
    });

    trigger.addEventListener('keydown', (event) => {
      const target = {
        ArrowDown: (index + 1) % triggers.length,
        ArrowUp: (index - 1 + triggers.length) % triggers.length,
        Home: 0,
        End: triggers.length - 1,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      triggers[target].focus();
    });
  });

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
          row.classList.contains('active') ? row.querySelector('.home-usecase-faq-item-sub .txt') : null,
        ]),
      ],
      { start: 'top+=65% bottom', step: 0.045, first: 0.03 },
    );
  });

  const imageCms = section.querySelector('.home-usecase-img-cms');
  revealImage(imageCms, section.querySelector('.home-usecase-img-list'), { start: 'top+=35% bottom' });
}
