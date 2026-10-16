import { gsap, ScrollTrigger } from '../core/gsap.js';

const NS = 'http://www.w3.org/2000/svg';
let filterReady = false;

/** One shared turbulence-displaced + thresholded filter gives the mask edge its ink-bleed look. */
function ensureFilter() {
  if (filterReady) return;
  filterReady = true;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <filter id="ink-displace" x="-10%" y="-10%" width="120%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.016 0.022" numOctaves="2" seed="5" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="2.4" result="blurred"/>
        <feComponentTransfer in="blurred"><feFuncA type="linear" slope="3.2" intercept="-1.1"/></feComponentTransfer>
      </filter>
    </defs>`;
  document.body.appendChild(svg);
}

let uid = 0;

/**
 * Reveals `.ink-mask-img.main` through an SVG mask whose shape grows on scroll.
 *  data-variant="path"   : a wavy edge sweeping down from the top, drawn in a 1000-unit wide viewBox; progress runs from
 *                          the element's top at data-start% of the viewport to its bottom at data-end%
 *  data-variant="circle" : a circle growing from the centre
 */
export function initInkMasks(root = document) {
  ensureFilter();
  const triggers = [];

  root.querySelectorAll('.ink-mask').forEach((el) => {
    const main = el.querySelector('.ink-mask-img.main');
    if (!main || el.dataset.inkReady) return;
    el.dataset.inkReady = '1';

    const variant = el.dataset.variant || 'circle';
    const id = `ink-mask-${++uid}`;
    const sub = document.createElement('div');
    sub.className = 'ink-mask-img sub ink-filter';
    sub.innerHTML = `
      <svg width="100%" height="100%" preserveAspectRatio="none" class="layer" style="position:absolute;inset:0">
        <defs><mask id="${id}" maskContentUnits="userSpaceOnUse"></mask></defs>
      </svg>`;
    el.appendChild(sub);
    if (variant === 'path') {
      // the unmasked image stays visible as a faded base while the full-strength copy is revealed over it
      const base = main.cloneNode(true);
      base.className = 'ink-mask-img base';
      el.insertBefore(base, main);
    }
    const svg = sub.querySelector('svg');
    const mask = sub.querySelector('mask');

    const shape =
      variant === 'path'
        ? document.createElementNS(NS, 'path')
        : document.createElementNS(NS, 'circle');
    shape.setAttribute('fill', 'white');
    shape.setAttribute('filter', 'url(#ink-displace)');
    mask.appendChild(shape);
    // the image is masked, the overlay svg only carries the mask definition
    const maskValue = `url(#${id})`;
    const applyMask = (on) => {
      main.style.mask = on ? maskValue : 'none';
      main.style.webkitMask = on ? maskValue : 'none';
    };
    applyMask(true);

    const start = Number(main.dataset.start ?? 85);
    const end = Number(main.dataset.end ?? 50);

    // the displacement filter moves the shape's edge by up to +-50 units, so the shape runs PAD beyond the image on
    // every side: nothing shows at progress 0, everything is covered at progress 1, and the rough edge exists only
    // along the leading front, never on the image's own edges or corners
    const PAD = 90;
    const state = { p: 0 };
    const draw = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      if (!w || !h) return;
      let covered;
      if (variant === 'path') {
        const vbH = (1000 * h) / w;
        const y = -PAD + state.p * (vbH + 2 * PAD);
        const bow = 0.25 * Math.max(y, 0);
        svg.setAttribute('viewBox', `0 0 1000 ${vbH}`);
        shape.setAttribute('d', `M -${PAD * 2} ${y} Q 500 ${y + bow} ${1000 + PAD * 2} ${y} L ${1000 + PAD * 2} -${PAD * 2} L -${PAD * 2} -${PAD * 2} Z`);
        covered = y >= vbH + PAD * 0.8;
      } else {
        const r = (Math.hypot(w, h) / 2 + PAD) * state.p;
        shape.setAttribute('cx', w / 2);
        shape.setAttribute('cy', h / 2);
        shape.setAttribute('r', r);
        covered = r >= Math.hypot(w, h) / 2 + PAD * 0.8;
      }
      // once the front has cleared the image the mask is dropped, leaving it pixel-perfect
      applyMask(!covered);
    };
    draw();

    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: `top ${start}%`,
        end: `${variant === 'path' ? 'bottom' : 'top'} ${end}%`,
        scrub: 0.6,
        onUpdate: (self) => {
          state.p = self.progress;
          draw();
        },
        onRefresh: draw,
      }),
    );
  });
  return triggers;
}
