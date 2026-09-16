// Navigation: ink or paper depending on what lies under it, smooth anchor scrolling,
// the current section, and the full-screen menu on small screens.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initNav({ lenis }) {
  const html = document.documentElement;
  const setNav = (theme) => {
    if (html.dataset.nav !== theme) html.dataset.nav = theme;
  };

  // The hero reports its own theme while the print is washed; every other section here.
  for (const section of document.querySelectorAll('main > section[data-theme]:not(.hero), footer[data-theme]')) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 36px',
      end: 'bottom 36px',
      onToggle: (self) => self.isActive && setNav(section.dataset.theme),
    });
  }

  const links = [...document.querySelectorAll('.nav__links a')];
  for (const link of links) {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) continue;
    ScrollTrigger.create({
      trigger: target,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) links.forEach((l) => (l === link ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
        else link.removeAttribute('aria-current');
      },
    });
  }

  const bar = document.querySelector('.nav');
  const button = document.querySelector('.nav__menu');
  const menu = document.getElementById('menu');
  const outside = [document.getElementById('main'), document.querySelector('.visit')];

  // The bar steps aside while reading down the page and returns on the way back up,
  // or whenever the pointer reaches for it.
  let lastY = window.scrollY;
  const onScroll = (y) => {
    const dy = y - lastY;
    lastY = y;
    if (Math.abs(dy) < 2) return;
    bar.classList.toggle('is-hidden', dy > 0 && y > 140 && menu.hidden);
  };
  if (lenis) lenis.on('scroll', (l) => onScroll(l.scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse' && e.clientY < 90) bar.classList.remove('is-hidden');
    },
    { passive: true },
  );

  const open = () => {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.textContent = 'Close';
    html.dataset.menu = 'open';
    outside.forEach((el) => (el.inert = true));
    lenis?.stop();
    gsap.fromTo(menu.querySelectorAll('.menu__list li'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' });
    menu.querySelector('a')?.focus();
  };

  const close = (returnFocus) => {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Contents';
    delete html.dataset.menu;
    outside.forEach((el) => (el.inert = false));
    lenis?.start();
    if (returnFocus) button.focus();
  };

  button.addEventListener('click', () => (menu.hidden ? open() : close(true)));

  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') close(true);
    if (e.key === 'Tab') {
      const focusable = [button, ...menu.querySelectorAll('a')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // In-page links glide with Lenis and hand focus to their target.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const target = hash.length > 1 && document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    close(false);
    const land = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    if (lenis) lenis.scrollTo(target, { duration: 1.6, onComplete: land });
    else {
      target.scrollIntoView();
      land();
    }
  });

  return { setNav };
}
