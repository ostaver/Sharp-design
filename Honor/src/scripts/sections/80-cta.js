import { revealImage, revealOnScroll } from '../components/reveal.js';

/**
 * Call-to-action: coordinate labels rise in one by one, then heading, copy and button;
 * the picture below settles in separately (its ink mask is driven by the shared boot code).
 */
export function init() {
  const cta = document.querySelector('.cta');
  const main = cta?.querySelector('.cta-main');
  if (!main) return;

  document.fonts.ready.then(() => {
    revealOnScroll(
      main,
      [
        ...[...cta.querySelectorAll('.cta-head-item-txt')].map((fade) => ({ fade })),
        main.querySelector('.cta-main-item-title .heading'),
        main.querySelector('.cta-main-item-sub .txt'),
        { fade: main.querySelector('.cta-main-item-btn') },
      ],
      { start: 'top+=40% bottom', step: 0.15 },
    );
  });

  const deco = cta.querySelector('.cta-deco');
  revealImage(deco, deco?.querySelector('.cta-deco-item-img'), { start: 'top+=40% bottom' });
}
