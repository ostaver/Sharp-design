import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { gsap } from '../core/gsap.js';

/** The hover/active CSS animation draws each stroke by offsetting a dash as long as the stroke itself. */
function measureStrokes(root) {
  root.querySelectorAll('.problem-draw').forEach((shape) => {
    shape.style.setProperty('--path-length', shape.getTotalLength());
  });
}

/** Illustrations scale down into place, one card after another, when the list scrolls into view. */
function initEntrance(root) {
  const images = root.querySelectorAll('.home-problem-item-img');
  if (!images.length) return;
  gsap.from(images, {
    scale: 1.25,
    autoAlpha: 0,
    duration: 1.2,
    ease: 'power4.out',
    stagger: 0.2,
    clearProps: 'all',
    scrollTrigger: { trigger: root.querySelector('.home-problem-content'), start: 'top 70%', once: true },
  });
}

/** On phones the four cards become a swipeable strip with a bar pagination. */
function initSlider(root) {
  const container = root.querySelector('.home-problem-cms');
  const pagination = root.querySelector('.home-problem-pagi');
  if (!container || !pagination) return;

  gsap.matchMedia().add('(max-width: 767px)', () => {
    const swiper = new Swiper(container, {
      modules: [Pagination],
      wrapperClass: 'home-problem-list',
      slideClass: 'home-problem-item',
      slidesPerView: 'auto',
      speed: 300,
      pagination: {
        el: pagination,
        clickable: true,
        bulletClass: 'home-problem-pagi-item',
        bulletActiveClass: 'active',
      },
    });
    return () => swiper.destroy(true, true);
  });
}

export function init() {
  const root = document.querySelector('.home-problem');
  if (!root) return;
  measureStrokes(root);
  initEntrance(root);
  initSlider(root);
}
