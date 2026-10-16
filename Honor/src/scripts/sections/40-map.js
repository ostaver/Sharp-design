/**
 * Map section: a long, pinned scroll story.
 *
 * The scrubbed timeline plays two headlines, flies the floor-plan walls in, fades the plan layers
 * on one after another (the intro card steps through its copy as they arrive), then reveals the
 * interactive violation markers. When the timeline completes the content panel slides open.
 *
 * Desktop pins with `position: sticky` and scrubs against the whole wrapper; tablets and phones
 * scrub against a shorter sticky stage (native touch scrolling, no transform pinning). With
 * `prefers-reduced-motion` nothing is scrubbed: the CSS lays the finished story out as static content.
 */

const STEP = 0.5; // duration of every beat, in timeline seconds
const DRAW_START = 2.5; // timeline time at which the walls start flying in
const DRAW_STAGGER = 0.02;
const GAP_AFTER_DRAW = DRAW_STAGGER + STEP;
const HOLD = 0.5; // viewport heights of scroll the finished story stays pinned for, so the markers can be explored
const MIN_TAP = 44; // px, smallest comfortable touch target

const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/**
 * Where each plan path comes from, as [viewportWidths, viewportHeights, extraX, extraY] in SVG user
 * units. Order matches the paths in `svg/map-plan`.
 */
const FLY_IN = [
  [-1, 0, 0, -160], [0, -1, -60, 0], [1, 0, 0, -260], [1, 0, 0, -100], [1, 0, 0, 260], [1, 0, 0, 280],
  [-1, 0, 0, 300], [-1, 0, 0, 280], [-1, 0, 0, -200], [-1, 0, 0, -40], [0, -1, -120, 0], [0, -1, 0, 0],
  [1, 0, 0, 60], [0, 1, -200, 0], [0, 1, -260, 0], [0, 1, 200, 0], [0, 1, 260, 0], [-1, 0, 0, 480],
  [1, 0, 0, -150], [-1, 0, 0, 150], [1, 0, 0, 300], [0, -1, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0],
];

export function init({ gsap, ScrollTrigger }) {
  const section = document.querySelector('.home-map');
  if (!section) return;

  const parts = collectParts(section);
  if (!parts) return;

  const hotspots = createHotspots(section, parts.mainLayer, gsap);
  const mm = gsap.matchMedia();
  const holdEnd = () => `bottom-=${Math.round(window.innerHeight * HOLD)} bottom`;

  mm.add(`(min-width: 992px) and ${MOTION_OK}`, () => {
    const wrap = section.closest('.home-map-wrap') ?? section;
    const stick = section.querySelector('.home-map-main-stick');

    // the content stays put while the section slides into view
    gsap.fromTo(
      parts.mainInner,
      { y: () => -stick.offsetHeight },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'top top', scrub: true, invalidateOnRefresh: true },
      },
    );
    return buildStory(gsap, ScrollTrigger, section, parts, hotspots, {
      trigger: wrap,
      start: 'top 50%',
      end: holdEnd,
    });
  });

  mm.add(`(max-width: 991px) and ${MOTION_OK}`, () =>
    buildStory(gsap, ScrollTrigger, section, parts, hotspots, {
      trigger: section.querySelector('.home-map-main-stick'),
      start: 'top 50%',
      end: holdEnd,
    }),
  );

  // the CSS lays the finished story out statically; only the state classes are needed
  mm.add('(prefers-reduced-motion: reduce)', () => {
    const { intro, mainLayer } = parts;
    intro.classList.add('active');
    mainLayer.classList.add('active');
    mainLayer.inert = false;
    section.classList.add('expanded');
    hotspots.place();
    return () => {
      hotspots.reset();
      intro.classList.remove('active');
      mainLayer.classList.remove('active');
      section.classList.remove('expanded');
    };
  });
}

function collectParts(section) {
  const intel = [...section.querySelectorAll('.home-intel-inner')];
  const layers = [...section.querySelectorAll('.home-map-main-img')];
  const inners = layers.map((layer) => layer.querySelector('.home-map-main-img-inner'));
  const plan = inners[0]?.querySelector('svg');
  const introContent = section.querySelector('.home-map-intro-content');
  const items = [...section.querySelectorAll('.home-map-intro-content-item')];
  const mainInner = section.querySelector('.home-map-main-inner');
  if (intel.length < 2 || layers.length < 2 || !plan || !introContent || !items.length || !mainInner) return null;

  return {
    intel,
    layers,
    mainLayer: layers.at(-1),
    inners,
    paths: [...plan.querySelectorAll('path')],
    plan,
    intro: section.querySelector('.home-map-intro'),
    introContent,
    items,
    mainInner,
  };
}

/** Builds the scrubbed timeline and the state toggles driven by it; returns the cleanup for matchMedia. */
function buildStory(gsap, ScrollTrigger, section, parts, hotspots, { trigger, start, end }) {
  const { intel, inners, paths, plan, intro, introContent, items, mainLayer } = parts;

  // layer i starts fading in at layerStart[i]; the walls take a little longer to settle
  const layerStart = inners.map((_, i) => (i === 0 ? DRAW_START : DRAW_START + GAP_AFTER_DRAW + (i - 1) * STEP));
  // the intro card changes copy when the first layer and the last three layers arrive
  const itemStart = layerStart.filter((_, i) => i !== 1);

  const flyIn = (axis) => (i) => {
    const [vw, vh, dx, dy] = FLY_IN[i % FLY_IN.length];
    const unit = plan.getScreenCTM()?.a || 1;
    return axis === 'x' ? (vw * window.innerWidth) / unit + dx : (vh * window.innerHeight) / unit + dy;
  };

  let item = -1;
  let mainOn = false;
  let expanded = false;

  function showItem(index) {
    if (index === item) return;
    item = index;
    items.forEach((el, i) => el.classList.toggle('active', i === index));
    introContent.style.height = `${items[index].offsetHeight}px`;
  }

  function setMain(on) {
    if (on === mainOn) return;
    mainOn = on;
    mainLayer.classList.toggle('active', on);
    mainLayer.inert = !on; // markers are only reachable (mouse, touch, keyboard) once they are on screen
    if (!on) hotspots.reset();
  }

  function setExpanded(on) {
    if (on === expanded) return;
    expanded = on;
    section.classList.toggle('expanded', on);
  }

  function sync(self) {
    const time = self.progress * self.animation.duration();
    const stage = itemStart.filter((t) => time > t).length - 1;
    intro.classList.toggle('active', stage >= 0);
    showItem(Math.max(stage, 0));
    setMain(stage === itemStart.length - 1);
    setExpanded(self.progress === 1);
  }

  mainLayer.inert = true;

  const tl = gsap.timeline({
    defaults: { duration: STEP, ease: 'power2.out' },
    scrollTrigger: {
      trigger,
      start,
      end,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: sync,
      onRefresh: (self) => {
        item = -1; // card height depends on the layout, measure again
        sync(self);
      },
    },
  });

  tl.to(intel[0], { autoAlpha: 0, y: -3, scale: 0.96 }, 1)
    .fromTo(intel[1], { autoAlpha: 0, y: 3, scale: 1.04 }, { autoAlpha: 1, y: 0, scale: 1, immediateRender: true }, 1.5)
    .to(intel[1], { autoAlpha: 0, y: -3, scale: 0.96 }, DRAW_START)
    .fromTo(
      paths,
      { x: flyIn('x'), y: flyIn('y'), scale: 1.1, opacity: 0, transformOrigin: '50% 50%' },
      { x: 0, y: 0, scale: 1, opacity: 1, stagger: { amount: DRAW_STAGGER, from: 'random' }, immediateRender: true },
      DRAW_START,
    );
  inners.forEach((inner, i) => tl.to(inner, { opacity: 1 }, layerStart[i]));

  ScrollTrigger.addEventListener('refresh', hotspots.place);

  return () => {
    ScrollTrigger.removeEventListener('refresh', hotspots.place);
    hotspots.reset();
    intro.classList.remove('active');
    mainLayer.classList.remove('active');
    mainLayer.inert = false;
    section.classList.remove('expanded');
    items.forEach((el, i) => el.classList.toggle('active', i === 0));
    introContent.style.height = '';
  };
}

/**
 * Violation markers: hover (or keyboard focus) previews a callout, click / tap / Enter pins it open
 * (one at a time), clicking anywhere else on the plan or pressing Escape closes it. Callouts sit
 * next to their marker and turn into a bottom sheet on phones.
 */
function createHotspots(section, layer, gsap) {
  const main = layer.querySelector('.home-map-main-img-main');
  if (!main) return { place() {}, reset() {} };

  const compact = window.matchMedia('(max-width: 767px)'); // callouts become a bottom sheet
  const svg = main.querySelector('.home-map-main-img-inner svg');
  const spots = [...main.querySelectorAll('[data-number]')]
    .map((badge) => ({
      badge,
      visual: badge.querySelector('.home-map-number-badge') ?? badge,
      hit: badge.querySelector('.home-map-number-hit'),
      wrap: badge.closest('.home-map-number-wrap'),
      tip: main.querySelector(`[data-hover="${badge.dataset.number}"]`),
    }))
    .filter((spot) => spot.wrap && spot.tip);

  spots.forEach(({ badge, tip }) => {
    const text = [...tip.querySelectorAll('.txt')].map((el) => el.textContent.replace(/\s+/g, ' ').trim());
    badge.setAttribute('aria-label', text.join('. '));
    badge.setAttribute('aria-expanded', 'false');
  });

  let frame = 0;
  function placeNow() {
    frame = 0;
    const unit = svg?.getScreenCTM()?.a || 1;
    const m = main.getBoundingClientRect();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    spots.forEach(({ visual, hit, tip }) => {
      // every marker gets at least a comfortable touch target, whatever the plan scale
      hit?.setAttribute('r', Math.min(Math.max(MIN_TAP / 2 / unit, 24), 120).toFixed(1));
      if (compact.matches) {
        tip.style.left = tip.style.top = '';
        return;
      }
      const b = visual.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(tip).paddingLeft);
      const gap = 0.8 * rem;
      const width = Math.max(tip.offsetWidth, 30.4 * rem); // the pinned callout is wider than the preview
      let left = b.right - m.left + pad;
      // flip to the other side of the marker when the callout would run off the stage
      if (left + width > m.width - gap) left = b.left - m.left - pad - width;
      left = Math.max(gap, left);
      const top = Math.min(Math.max(b.top - m.top, gap), Math.max(gap, m.height - tip.offsetHeight - 7 * rem));
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    });
  }
  // callouts are placed against the stage, which moves while the panel opens and on every resize
  const place = () => {
    if (!frame) frame = requestAnimationFrame(placeNow);
  };
  new ResizeObserver(place).observe(main);

  function setClass(spot, name, on) {
    spot.wrap.classList.toggle(name, on);
    spot.tip.classList.toggle(name, on);
  }

  function slideDesc(tip, open) {
    const desc = tip.querySelector('.home-map-main-img-sub-desc-wrap');
    if (!desc || compact.matches) return;
    gsap.killTweensOf(desc);
    if (open) {
      desc.style.display = 'block';
      gsap.fromTo(desc, { height: 0 }, { height: 'auto', duration: 0.6, ease: 'expo.out', clearProps: 'height' });
    } else if (desc.style.display) {
      gsap.to(desc, {
        height: 0,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: () => {
          desc.style.display = '';
          gsap.set(desc, { clearProps: 'height' });
        },
      });
    }
  }

  function setActive(spot, on) {
    if (spot.wrap.classList.contains('active') === on) return;
    setClass(spot, 'active', on);
    spot.badge.setAttribute('aria-expanded', String(on));
    slideDesc(spot.tip, on);
  }

  function closeAll() {
    spots.forEach((spot) => setActive(spot, false));
  }

  function reset() {
    spots.forEach((spot) => {
      setClass(spot, 'hover', false);
      spot.tip.classList.remove('focus');
      setActive(spot, false);
    });
  }

  function toggle(spot) {
    const on = !spot.wrap.classList.contains('active');
    spots.forEach((other) => setActive(other, other === spot && on));
    placeNow();
  }

  spots.forEach((spot) => {
    const { badge, tip } = spot;
    badge.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      placeNow();
      setClass(spot, 'hover', true);
    });
    badge.addEventListener('pointerleave', () => setClass(spot, 'hover', false));
    badge.addEventListener('focus', () => {
      if (!badge.matches(':focus-visible')) return;
      placeNow();
      setClass(spot, 'hover', true);
      tip.classList.add('focus'); // the pinned callout replaces the marker, so it carries the focus ring
    });
    badge.addEventListener('blur', () => {
      setClass(spot, 'hover', false);
      tip.classList.remove('focus');
    });
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle(spot);
    });
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(spot);
      }
    });
  });
  main.addEventListener('click', closeAll);
  section.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  return { place, reset };
}
