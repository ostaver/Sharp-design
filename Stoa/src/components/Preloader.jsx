import { useEffect, useRef, useState } from 'react';
import { gsap, getLenis } from '../lib/motion.js';
import { images } from '../data/content.js';

// what the press is doing, keyed to how much ink has been laid
const stageFor = (p) =>
  p < 0.06 ? 'Mixing the inks'
    : p < 0.42 ? 'Drum I — laying fluorescent pink'
      : p < 0.86 ? 'Drum II — laying midnight'
        : p < 1 ? 'Bringing the plates into register'
          : 'Registered. Pulling the first print';

const BAND = 140; // height of the stochastic ink edge, matches the baked dither tile

const preloadImage = (src) =>
  new Promise((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = i.onerror = res;
    i.src = src;
    setTimeout(res, 7000);
  });

function Mark() {
  return (
    <svg viewBox="0 0 200 220" aria-hidden="true">
      <path d="M8 62 100 14l92 48z" />
      <rect x="14" y="68" width="172" height="14" />
      <rect x="14" y="86" width="172" height="8" />
      {[24, 58, 92, 126, 160].map((x) => (
        <rect key={x} x={x} y="100" width="16" height="92" />
      ))}
      <rect x="8" y="196" width="184" height="10" />
      <rect x="0" y="208" width="200" height="10" />
    </svg>
  );
}

export default function Preloader({ onDone }) {
  const root = useRef(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // dev shortcut: /?skip jumps straight to the hero while iterating
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('skip')) {
      setDone(true);
      onDone();
      return;
    }
    document.body.classList.add('is-loading');
    const el = root.current;
    const q = gsap.utils.selector(el);
    const state = { real: 0, shown: 0 };
    let finished = false;
    const lenisWait = setTimeout(() => getLenis()?.stop(), 0);

    const tasks = [
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((res) => {
        if (window.__stoaTemple) return res();
        window.addEventListener('stoa:temple', res, { once: true });
        setTimeout(res, 6000);
      }),
      ...[images.longWalk, images.listeners, images.castHall, images.dome].map(preloadImage),
    ];
    let settled = 0;
    tasks.forEach((p) =>
      p.then(() => {
        settled++;
        state.real = settled / tasks.length;
      }),
    );

    const hi = q('.preloader__plate--hi')[0];
    const key = q('.preloader__plate--key')[0];
    const bar = q('.preloader__bar b');

    // each drum lays its ink upward; the leading edge is a stochastic stipple, not a line
    const lay = (plate, amount) => {
      const h = plate.offsetHeight;
      const y = h - Math.min(Math.max(amount, 0), 1) * (h + BAND);
      plate.style.setProperty('--band-y', `${y}px`);
      plate.style.setProperty('--solid-h', `${Math.max(0, h - (y + BAND))}px`);
    };

    const start = performance.now();
    let last = start;
    let shownStep = -1;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.5);
      last = now;
      const elapsed = (now - start) / 2600;
      const target = Math.min(state.real, Math.min(elapsed, 1));
      // time-based easing so slow or throttled frames never stall the press
      state.shown += (target - state.shown) * (1 - Math.exp(-dt * 5));
      if (target === 1 && 1 - state.shown < 0.015) state.shown = 1;
      const p = state.shown;
      lay(hi, p / 0.45);
      lay(key, (p - 0.38) / 0.62);
      gsap.set(bar, { scaleX: p });
      const r = 1 - p;
      gsap.set(hi, { x: 64 * r + 7, y: -42 * r - 5, rotate: -5 * r });
      gsap.set(key, { x: -36 * r, y: 26 * r, rotate: 2 * r });
      const step = Math.floor(p * 20);
      if (step !== shownStep) {
        shownStep = step;
        setProgress(p);
      }
      if (p >= 1 && !finished) {
        finished = true;
        exit();
      }
    };
    gsap.ticker.add(tick);

    function exit() {
      gsap.ticker.remove(tick);
      setProgress(1);
      gsap
        .timeline({ onComplete: () => setDone(true) })
        .to(hi, { x: 2, y: -1.5, duration: 0.55, ease: 'back.out(3)' })
        .to(q('.preloader__ghost'), { opacity: 0, duration: 0.3 }, '<')
        .to(q('.preloader__plates'), { scale: 0.94, duration: 0.5, ease: 'power2.in' }, '<0.15')
        .add(() => {
          document.body.classList.remove('is-loading');
          getLenis()?.start();
          onDone();
        })
        .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.3, ease: 'expo.inOut' }, '+=0.05')
        .to(q('.preloader__stage'), { yPercent: -30, duration: 1.3, ease: 'expo.inOut' }, '<');
    }

    return () => {
      clearTimeout(lenisWait);
      gsap.ticker.remove(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  const pct = Math.round(progress * 100);

  return (
    <div
      className="preloader"
      ref={root}
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      role="progressbar"
      aria-label="Printing the site"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="preloader__bg" />
      <div className="preloader__top mono">
        <span>Stoa Press — Plate setup</span>
        <span>Edition MMXXVI</span>
      </div>
      <div className="preloader__stage">
        <div className="preloader__plates">
          <div className="preloader__plate preloader__ghost" aria-hidden="true">
            <Mark />
          </div>
          <div className="preloader__plate preloader__plate--hi" aria-hidden="true">
            <Mark />
          </div>
          <div className="preloader__plate preloader__plate--key" aria-hidden="true">
            <Mark />
          </div>
        </div>
      </div>
      <div className="preloader__foot">
        <div className="preloader__bar">
          <b />
        </div>
        <div className="preloader__bottom mono">
          <span>{stageFor(progress)}…</span>
          <span>2 drums · 3 inks · 60 impressions / s</span>
        </div>
      </div>
    </div>
  );
}
