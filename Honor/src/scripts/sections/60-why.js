import Swiper from 'swiper';
import { A11y, Pagination } from 'swiper/modules';
import { scroller } from '../core/scroll.js';
import { revealImage, revealOnScroll } from '../components/reveal.js';

/**
 * Desktop: the four rows scroll normally while one brand-coloured line (and the row's caption)
 * stays pinned to the middle of the viewport. The row under that line gets `.active`, which
 * fades its caption in (see why.css). Everything inside the images is pure CSS animation.
 */
function followViewportCentre({ gsap, ScrollTrigger }, main, items) {
  const line = document.querySelector('.home-why-main-line');
  const stickies = items.map((item) => item.querySelector('.home-why-item-sticky')).filter(Boolean);
  if (!line || !stickies.length) return undefined;

  const pin = { y: 0 };
  const place = () => {
    gsap.set(line, { y: pin.y });
    stickies.forEach((sticky) => gsap.set(sticky, { y: pin.y - sticky.offsetHeight / 2 }));
  };
  const follow = gsap.quickTo(pin, 'y', { duration: 0.5, ease: 'power3.out', onUpdate: place });

  /** Viewport centre, measured from the top of `.home-why-main`. */
  const centre = () => scroller.clientHeight / 2 - (main.getBoundingClientRect().top - scroller.getBoundingClientRect().top);

  const update = (jump) => {
    const rel = centre();
    items.forEach((item) => {
      const inside = rel >= item.offsetTop && rel <= item.offsetTop + item.offsetHeight;
      item.classList.toggle('active', inside);
    });
    if (jump) {
      pin.y = Math.max(0, rel);
      place();
    } else {
      follow(Math.max(0, rel));
    }
  };

  ScrollTrigger.create({
    trigger: main,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: () => update(false),
    onToggle: () => update(true),
    onRefresh: () => update(true),
  });

  return () => {
    items.forEach((item) => item.classList.remove('active'));
    gsap.set([line, ...stickies], { clearProps: 'transform' });
  };
}

/** Small screens: the rows become a swipeable slider with a bullet bar underneath. */
function slideRows(slider, wrapper, items, pagination) {
  const added = [
    [slider, 'swiper'],
    [wrapper, 'swiper-wrapper'],
    ...items.map((item) => [item, 'swiper-slide']),
  ];
  added.forEach(([el, cls]) => el.classList.add(cls));

  const swiper = new Swiper(slider, {
    modules: [A11y, Pagination],
    slidesPerView: 1,
    speed: 300,
    pagination: {
      el: pagination,
      clickable: true,
      bulletElement: 'span',
      bulletClass: 'home-why-pagi-item',
      bulletActiveClass: 'active',
    },
  });

  return () => {
    swiper.destroy(true, true);
    added.forEach(([el, cls]) => el.classList.remove(cls));
  };
}

export function init(ctx) {
  const { gsap } = ctx;
  const head = document.querySelector('.home-why-head');
  const main = document.querySelector('.home-why-main');
  if (!head || !main) return;
  const items = [...main.querySelectorAll('.home-why-item')];

  document.fonts.ready.then(() => {
    revealOnScroll(
      head,
      [
        head.querySelector('.home-why-label .txt'),
        head.querySelector('.home-why-title .heading'),
        head.querySelector('.home-why-sub .txt'),
        head.querySelector('.home-why-sub-cta .txt'),
      ],
      { start: 'top+=65% bottom' },
    );
  });

  items.forEach((item) => {
    const img = item.querySelector('.home-why-item-img');
    revealImage(img, img?.querySelector('.home-why-item-img-inner'), { start: 'top+=45% bottom' });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 992px)', () => followViewportCentre(ctx, main, items));
  mm.add('(max-width: 767px)', () => {
    const slider = document.querySelector('.home-why-main-cms');
    const pagination = document.querySelector('.home-why-pagi');
    if (slider && pagination) return slideRows(slider, main, items, pagination);
    return undefined;
  });
}
