import Swiper from 'swiper';
import { A11y, Autoplay, Navigation } from 'swiper/modules';
import { gsap, SplitText } from '../core/gsap.js';

const cssColor = (name) => getComputedStyle(document.body).getPropertyValue(name).trim();

/** Heading characters turn from the disabled grey to the primary ink colour as the heading scrolls through. */
function initHeadingScrub(heading) {
  if (!heading) return;
  const from = cssColor('--content--disable');
  const to = cssColor('--content--primary');

  SplitText.create(heading, {
    type: 'words,chars',
    autoSplit: true,
    onSplit: (split) =>
      gsap.fromTo(
        split.chars,
        { color: from },
        {
          color: to,
          ease: 'none',
          stagger: { each: 0.02 },
          duration: 0.4,
          scrollTrigger: { trigger: heading, start: 'top 90%', end: 'bottom 50%', scrub: 0.5 },
        },
      ),
  });
}

/** Client logo strip: looping auto-advancing slider moved by the prev/next controls. */
function initLogoSlider(root) {
  const container = root.querySelector('.home-intro-logo-cms');
  if (!container) return;

  new Swiper(container, {
    modules: [A11y, Autoplay, Navigation],
    wrapperClass: 'home-intro-logo-list',
    slideClass: 'home-intro-logo-item',
    slidesPerView: 'auto',
    loop: true,
    speed: 600,
    slidesPerGroup: 1,
    breakpoints: { 768: { slidesPerGroup: 3 } },
    autoplay: { delay: 3000, disableOnInteraction: false },
    navigation: {
      prevEl: root.querySelector('.home-intro-control.item-prev'),
      nextEl: root.querySelector('.home-intro-control.item-next'),
    },
    a11y: { prevSlideMessage: 'Previous logos', nextSlideMessage: 'Next logos', slideLabelMessage: 'Logo {{index}} of {{slidesLength}}' },
  });
}

/** The logo strip rises into place the first time it scrolls into view. */
function initPartnerEntrance(root) {
  const strip = root.querySelector('.home-intro-partner-inner');
  if (!strip) return;
  gsap.from(strip, {
    y: 32,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: strip, start: 'top 90%', once: true },
  });
}

export function init() {
  const root = document.querySelector('.home-intro');
  if (!root) return;
  initHeadingScrub(root.querySelector('.home-intro-content-title .heading'));
  initLogoSlider(root);
  initPartnerEntrance(root);
}
