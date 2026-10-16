import { gsap } from '../core/gsap.js';
import { startScroll, stopScroll } from '../core/scroll.js';
import { loaderDone, prefersReducedMotion } from './00-loader.js';

const COMPACT = '(max-width: 991px)';
const HIDE_AFTER = 1 / 3; // fraction of the viewport height scrolled before the bar may hide

/** Fades the header contents in once the loader has left. */
function playIntro(header) {
  if (prefersReducedMotion()) return;
  const parts = header.querySelectorAll('.header-logo, .header-menu-item, .header-menu-btn .txt, .header-menu-btn-ic');
  gsap.set(parts, { opacity: 0 });
  loaderDone.then(() =>
    gsap.to(parts, { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.08, clearProps: 'opacity' }),
  );
}

/** `.on-scroll` once the page has left the top, `.on-hide` while scrolling down, removed on the way back up. */
function trackScroll(header, lenis) {
  const update = ({ scroll, direction }) => {
    header.classList.toggle('on-scroll', scroll > header.offsetHeight);
    if (scroll <= window.innerHeight * HIDE_AFTER) header.classList.remove('on-hide');
    else if (direction === 1) header.classList.add('on-hide');
    else if (direction === -1) header.classList.remove('on-hide');
  };
  lenis?.on('scroll', update);
  update({ scroll: lenis?.scroll ?? 0, direction: 0 });
}

/** Tablet/mobile: the menu button toggles the panel, sub menus open as an accordion. */
function setupCompactMenu(header) {
  const button = header.querySelector('.header-menu-btn');
  const panel = header.querySelector('.header-menu');
  if (!button || !panel) return;
  const submenus = Array.from(panel.querySelectorAll('.header-menu-item.has-submenu'));
  const compact = window.matchMedia(COMPACT);
  const dropdownOf = (item) => item.closest('.header-menu-item-wrap')?.querySelector('.header-menu-dropdown');

  const setSubmenu = (item, open) => {
    const dropdown = dropdownOf(item);
    item.classList.toggle('active', open);
    if (!dropdown) return;
    gsap.killTweensOf(dropdown);
    if (open) {
      gsap.set(dropdown, { display: 'block' });
      gsap.fromTo(dropdown, { height: 0 }, { height: 'auto', duration: 0.4, ease: 'power2.out', clearProps: 'height' });
    } else {
      gsap.to(dropdown, {
        height: 0,
        duration: 0.4,
        ease: 'power2.out',
        onComplete: () => gsap.set(dropdown, { clearProps: 'display,height' }),
      });
    }
  };

  const setMenu = (open) => {
    button.classList.toggle('active', open);
    panel.classList.toggle('active', open);
    if (open) stopScroll();
    else {
      startScroll();
      submenus.forEach((item) => item.classList.contains('active') && setSubmenu(item, false));
    }
  };

  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (compact.matches) setMenu(!button.classList.contains('active'));
  });

  submenus.forEach((item) =>
    item.addEventListener('click', () => {
      if (!compact.matches) return;
      const open = !item.classList.contains('active');
      submenus.forEach((other) => other !== item && other.classList.contains('active') && setSubmenu(other, false));
      setSubmenu(item, open);
    }),
  );

  panel.addEventListener('click', (event) => {
    if (compact.matches && event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && button.classList.contains('active')) setMenu(false);
  });

  // leaving the compact layout must not strand inline styles or a locked scroll
  compact.addEventListener('change', () => {
    if (compact.matches) return;
    setMenu(false);
    submenus.forEach((item) => {
      item.classList.remove('active');
      gsap.set(dropdownOf(item), { clearProps: 'display,height' });
    });
  });
}

export function init({ lenis }) {
  const header = document.querySelector('.header');
  if (!header) return;
  playIntro(header);
  trackScroll(header, lenis);
  setupCompactMenu(header);
}
