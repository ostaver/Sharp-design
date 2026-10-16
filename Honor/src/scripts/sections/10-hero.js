import { gsap, SplitText } from '../core/gsap.js';
import { createCrosshair } from '../components/crosshair.js';
import { loaderDone, prefersReducedMotion } from './00-loader.js';

const DESKTOP = '(min-width: 992px)';
const IMAGE_ASPECT = 1.99; // width / height of the hero image (2000x1007 crop)
const MARQUEE_COPIES = 5;
const MARQUEE_SECONDS = 12;

/*
 * Measurements of the design at 1728px wide (rem = 10px): the ruler box is 1648 x 696, the image
 * inside it 1382.6 x 696, centred. Lines and tags are stored in those px and re-mapped onto the
 * image box that is actually rendered.
 */
const REF = { rulerWidth: 1648, rulerHeight: 696, imageWidth: 1382.6, remsPerImage: 164.8 };

/** Dashed rows seen from the left and right edge: y, and where each side's dashes stop (% of ruler width). */
const ROWS = [
  { y: 140.207, left: 44.0947, right: 55.8544 },
  { y: 163.715, left: 29.6878, right: null },
  { y: 298.046, left: 29.6878, right: 70.3122 },
  { y: 332.468, left: 29.6878, right: 70.3122 },
  { y: 347.58, left: 29.6878, right: 70.3122 },
  { y: 489.467, left: 21.9499, right: 77.9992 },
  { y: 573.423, left: 18.7427, right: 81.2573 },
];
/** Dashed columns seen from the top and bottom edge: x, and where each side's dashes stop (% of ruler height). */
const COLUMNS_TOP = [
  [363.412, 71.1701], [482.544, 23.4017], [495.128, 44.994], [573.99, 23.4017], [620.133, 23.4017],
  [728.359, 20.386], [740.104, 20.386], [907.896, 20.386], [920.48, 20.386], [1019.48, 23.4017],
  [1042.97, 23.4017], [1167.13, 23.4017], [1284.59, 70.5669],
];
const COLUMNS_BOTTOM = [
  [363.412, 82.0265], [375.996, 82.0265], [604.193, 81.7853], [620.133, 81.7853], [728.359, 81.7853],
  [740.104, 81.7853], [907.896, 81.7853], [920.48, 81.7853], [1027.03, 81.7853], [1042.97, 81.7853],
  [1095.82, 81.7853], [1167.13, 81.7853], [1284.59, 81.7853],
];
/** Highlighted guides: the vertical edge marks (top/height) and the horizontal span marks (left/width). */
const EDGE_MARK = { top: 141.047, height: 433.216 };
const SPAN_MARK = { left: 363.412, width: 921.176 };
/** Violation tags: position of the tag's bottom-left corner in the image, as fractions. */
const TAGS = {
  item1: { left: 0.15211, bottom: 0.26453 },
  item2: { left: 0.51212, bottom: 0.22679 },
};

const find = (selector, root = document) => root.querySelector(selector);
const findAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* ---------------------------------------------------------------- layout */

/** Largest box of the hero image's aspect ratio that fits the ruler. */
function fitImage(width, height) {
  const w = Math.min(width, height * IMAGE_ASPECT);
  return { width: w, height: w / IMAGE_ASPECT };
}

/** Sizes the tag layer to the image and places the guide lines / tags measured on the design. */
function layoutRuler(ruler) {
  const inner = find('.home-hero-ruler-inner', ruler);
  const deco = find('.home-hero-img-deco-main', ruler);
  const rulerWidth = inner.clientWidth;
  const rulerHeight = inner.clientHeight;
  if (!rulerWidth || !rulerHeight) return;

  const image = fitImage(rulerWidth, rulerHeight);
  const offsetX = (rulerWidth - image.width) / 2;
  const offsetY = (rulerHeight - image.height) / 2;
  const refOffsetX = (REF.rulerWidth - REF.imageWidth) / 2;
  const x = (refX) => offsetX + ((refX - refOffsetX) / REF.imageWidth) * image.width;
  const y = (refY) => offsetY + (refY / REF.rulerHeight) * image.height;
  const percentX = (refPercent) => (x((refPercent / 100) * REF.rulerWidth) / rulerWidth) * 100;
  const percentY = (refPercent) => (y((refPercent / 100) * REF.rulerHeight) / rulerHeight) * 100;
  const px = (value) => `${value}px`;

  deco.style.width = px(image.width);
  deco.style.height = px(image.height);

  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const tagScale = image.width / (REF.remsPerImage * remPx);
  findAll('.home-hero-img-deco', deco).forEach((tag) => {
    const spot = TAGS[Object.keys(TAGS).find((name) => tag.classList.contains(name))];
    if (!spot) return;
    Object.assign(tag.style, {
      left: px(spot.left * image.width),
      bottom: px(spot.bottom * image.height),
      transform: `scale(${tagScale})`,
    });
  });

  const sideLines = (item, key) =>
    findAll('.home-hero-ruler-item-line-horizital.line-dash', item).forEach((line, index) => {
      const rows = key === 'left' ? ROWS : ROWS.filter((row) => row.right !== null);
      const row = rows[index];
      if (!row) return;
      line.style.top = px(y(row.y));
      line.style.setProperty('--clip-half', `${percentX(row[key])}%`);
    });
  const columnLines = (item, columns) =>
    findAll('.home-hero-ruler-item-line-vertical.line-dash', item).forEach((line, index) => {
      const column = columns[index];
      if (!column) return;
      line.style.left = px(x(column[0]));
      line.style.setProperty('--clip-half', `${percentY(column[1])}%`);
    });

  findAll('.home-hero-ruler-item', ruler).forEach((item) => {
    if (item.classList.contains('left')) sideLines(item, 'left');
    if (item.classList.contains('right')) sideLines(item, 'right');
    if (item.classList.contains('top')) columnLines(item, COLUMNS_TOP);
    if (item.classList.contains('bot')) columnLines(item, COLUMNS_BOTTOM);

    const edge = find('.line-brand.home-hero-ruler-item-line-vertical', item);
    if (edge) {
      edge.style.top = px(y(EDGE_MARK.top));
      edge.style.height = px(y(EDGE_MARK.top + EDGE_MARK.height) - y(EDGE_MARK.top));
    }
    const span = find('.line-brand.home-hero-ruler-item-line-horizital', item);
    if (span) {
      span.style.left = px(x(SPAN_MARK.left));
      span.style.width = px(x(SPAN_MARK.left + SPAN_MARK.width) - x(SPAN_MARK.left));
    }
  });
}

/** Clears everything layoutRuler() wrote so the stylesheet layout applies below the desktop breakpoint. */
function resetRuler(ruler) {
  const reset = (el, ...props) => props.forEach((prop) => el.style.removeProperty(prop));
  reset(find('.home-hero-img-deco-main', ruler), 'width', 'height');
  findAll('.home-hero-img-deco', ruler).forEach((tag) => reset(tag, 'left', 'bottom', 'transform'));
  findAll('.home-hero-ruler-item .line', ruler).forEach((line) =>
    reset(line, 'top', 'left', 'width', 'height', '--clip-half'),
  );
}

/* ------------------------------------------------------- pointer: guide + drag */

/** Crosshair + coordinates while hovering the image; dragging a box reveals the violation tags it touches. */
function setupInteraction(wrap) {
  const area = find('.home-hero-img-interact-wrap', wrap);
  const tags = findAll('.home-hero-img-deco', wrap);
  if (!area) return () => {};

  const hint = find('.home-hero-interact', area);
  const crosshair = createCrosshair({
    area,
    horizontal: find('.line-horizital.home-hero-curor-line', area),
    vertical: find('.line-vertical.home-hero-curor-line', area),
    plus: find('.home-hero-img-plus', area),
    label: find('.home-hero-img-coordi', area),
    hint,
    readoutX: find('[data-control="x"]', area),
    readoutY: find('[data-control="y"]', area),
  });

  gsap.set(area, { autoAlpha: 0 });
  gsap.set(hint, { opacity: 1 });
  let inside = false;
  let box = null;
  let origin = null;

  const reveal = (event) => {
    crosshair.move(event.clientX, event.clientY, { jump: !inside });
    if (inside) return;
    inside = true;
    gsap.to(area, { autoAlpha: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
  };

  const dragBox = (event) => {
    const here = crosshair.local(event.clientX, event.clientY);
    const rect = {
      left: Math.min(origin.x, here.x),
      top: Math.min(origin.y, here.y),
      width: Math.abs(here.x - origin.x),
      height: Math.abs(here.y - origin.y),
    };
    gsap.to(box, { ...rect, duration: 0.25, ease: 'power2.out', overwrite: true });
    return rect;
  };

  const touchTags = (event) => {
    const dragged = {
      left: Math.min(origin.clientX, event.clientX),
      right: Math.max(origin.clientX, event.clientX),
      top: Math.min(origin.clientY, event.clientY),
      bottom: Math.max(origin.clientY, event.clientY),
    };
    tags.forEach((tag) => {
      const rect = tag.getBoundingClientRect();
      const overlaps =
        rect.left < dragged.right && rect.right > dragged.left && rect.top < dragged.bottom && rect.bottom > dragged.top;
      if (overlaps) tag.classList.add('active');
    });
  };

  const onDown = (event) => {
    if (event.button !== 0 || event.target.closest('.home-hero-img-deco')) return;
    const start = crosshair.local(event.clientX, event.clientY);
    origin = { ...start, clientX: event.clientX, clientY: event.clientY };
    box = document.createElement('div');
    box.className = 'home-hero-img-plus-box';
    gsap.set(box, { left: start.x, top: start.y, width: 0, height: 0 });
    area.appendChild(box);
    hint.classList.add('hidden');
  };

  const onMove = (event) => {
    if (!box) return;
    dragBox(event);
    touchTags(event);
  };

  const onUp = () => {
    box?.remove();
    box = null;
  };

  const onLeave = () => {
    inside = false;
    gsap.to(area, { autoAlpha: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
  };

  const onTagClick = (event) => event.currentTarget.classList.remove('active');

  wrap.addEventListener('pointermove', reveal);
  wrap.addEventListener('pointerleave', onLeave);
  wrap.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  tags.forEach((tag) => tag.addEventListener('click', onTagClick));

  return () => {
    wrap.removeEventListener('pointermove', reveal);
    wrap.removeEventListener('pointerleave', onLeave);
    wrap.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    tags.forEach((tag) => tag.removeEventListener('click', onTagClick));
    onUp();
    tags.forEach((tag) => tag.classList.remove('active'));
    hint.classList.remove('hidden');
    gsap.set(area, { clearProps: 'opacity,visibility' });
  };
}

/* ------------------------------------------------------------------ intro */

/** Hides what the intro reveals; returns the play() that runs it once the loader is gone. */
function prepareIntro(hero) {
  const lines = findAll('.home-hero-content .line', hero);
  const horizontal = lines.filter((line) => line.classList.contains('line-horizital'));
  const vertical = lines.filter((line) => line.classList.contains('line-vertical'));
  const border = find('.home-hero-img .bg-border', hero);
  const tags = findAll('.home-hero-img-deco', hero);
  const work = find('.home-hero-work', hero);
  const title = find('.home-hero-title .heading', hero);
  const sub = find('.home-hero-sub .txt', hero);

  const split = (el) => new SplitText(el, { type: 'lines,words', mask: 'lines', linesClass: 'heading-mask-line' });
  const words = [title, sub].filter(Boolean).map((el) => split(el).words);

  gsap.set(horizontal, { scaleX: 0, transformOrigin: 'left top' });
  gsap.set(vertical, { scaleY: 0, transformOrigin: 'left top' });
  gsap.set([border, ...tags], { opacity: 0 });
  gsap.set(work, { opacity: 0, y: 32 });
  gsap.set(words.flat(), { yPercent: 110, opacity: 0 });

  return () => {
    const line = { duration: 1.2, ease: 'none', clearProps: 'transform' };
    const lift = { yPercent: 0, opacity: 1, duration: 0.8, ease: 'power2.out', stagger: 0.02 };
    return gsap
      .timeline({ delay: 0.3 })
      .to(vertical, { ...line, scaleY: 1, stagger: 0.1 }, 0)
      .to(horizontal, { ...line, scaleX: 1, stagger: 0.1 }, 0)
      .to([border, ...tags], { opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.1, clearProps: 'opacity' }, 0.1)
      .to(words[0] || [], lift, 0.1)
      .to(words[1] || [], lift, 0.4)
      .to(work, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', clearProps: 'all' }, 0.4);
  };
}

/* ---------------------------------------------------------------- marquee */

/** Repeats the "work" ticker so the CSS marquee loops without a gap. */
function startMarquee(hero) {
  const track = find('.home-hero-work', hero);
  const first = find('.home-hero-work-inner', track);
  if (!first) return;
  const copies = [first];
  for (let i = 1; i < MARQUEE_COPIES; i += 1) {
    const copy = first.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.appendChild(copy);
    copies.push(copy);
  }
  copies.forEach((copy) => {
    copy.classList.add('marquee-left', 'anim');
    copy.style.animationDuration = `${MARQUEE_SECONDS}s`;
  });
}

export function init() {
  const hero = find('.home-hero');
  if (!hero) return;
  const wrap = find('.home-hero-img-wrap', hero);
  const ruler = find('.home-hero-ruler', hero);

  const reduced = prefersReducedMotion();
  const play = reduced ? null : prepareIntro(hero);
  loaderDone.then(() => {
    const intro = play?.();
    if (reduced) startMarquee(hero);
    else intro.eventCallback('onComplete', () => startMarquee(hero));
  });

  if (!wrap || !ruler) return;
  const resizeObserver = new ResizeObserver(() => layoutRuler(ruler));
  const mm = gsap.matchMedia();
  mm.add(DESKTOP, () => {
    layoutRuler(ruler);
    resizeObserver.observe(ruler);
    const teardown = window.matchMedia('(hover: hover)').matches ? setupInteraction(wrap) : () => {};
    return () => {
      teardown();
      resizeObserver.disconnect();
      resetRuler(ruler);
    };
  });
}
