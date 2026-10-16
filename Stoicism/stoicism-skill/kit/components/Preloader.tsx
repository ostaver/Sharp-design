import { useEffect, useRef, useState } from 'react';
import { gsap, getLenis, reducedMotion } from '../lib/motion';
import { theme } from '../theme';

/** what the press is doing, keyed to how much ink has been laid (five lines, in order) */
const defaultStages = (): string[] => [
  'Mixing the inks',
  `Drum I — laying ${theme.inks[0].name.toLowerCase()}`,
  'Drum II — laying the key ink',
  'Bringing the plates into register',
  'Registered. Pulling the first print',
];
const stageFor = (p: number, stages: string[]): string =>
  stages[p < 0.06 ? 0 : p < 0.42 ? 1 : p < 0.86 ? 2 : p < 1 ? 3 : 4] ?? '';

const BAND = 140; // height of the stochastic ink edge, matches the baked dither tile

const preloadImage = (src: string) =>
  new Promise<void>((res) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = i.onerror = () => res();
    i.src = src;
    setTimeout(res, 7000);
  });

/** Resolves once the hero temple has drawn its first frames (Hero dispatches 'stoa:temple'). */
const templeReady = () =>
  new Promise<void>((res) => {
    if (window.__stoaTemple) return res();
    window.addEventListener('stoa:temple', () => res(), { once: true });
    setTimeout(res, 6000);
  });

declare global {
  interface Window {
    __stoaTemple?: boolean;
  }
}

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

export interface PreloaderProps {
  /** images worth having before the first print (the first few below the hero) */
  images: string[];
  /** two mono lines across the top, e.g. ['House Press — plate setup', 'Edition MMXXVI'] */
  top: [string, string];
  /** the mono line bottom-right, e.g. '2 drums · 3 inks · 60 impressions / s' */
  foot: string;
  stages?: string[];
  onDone: () => void;
}

/*
  No counter. Two drums print the temple mark as the page loads: the highlight ink first,
  then the key ink, each climbing the plate behind a stochastic stipple edge while the plates
  drift into register. Real loading (fonts, the temple's first frames, a few images) drives
  it, capped so a stalled request never holds the page.
*/
export default function Preloader({ images, top, foot, stages = defaultStages(), onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // reduced motion skips the press; in dev, /?skip does too while iterating
    if (reducedMotion || (import.meta.env.DEV && new URLSearchParams(location.search).has('skip'))) {
      setDone(true);
      onDone();
      return;
    }
    const el = root.current;
    if (!el) return;
    document.body.classList.add('is-loading');
    const q = gsap.utils.selector(el);
    const state = { real: 0, shown: 0 };
    let finished = false;
    const lenisWait = setTimeout(() => getLenis()?.stop(), 0);

    const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve(), templeReady(), ...images.map(preloadImage)];
    let settled = 0;
    tasks.forEach((p) =>
      p.finally(() => {
        settled++;
        state.real = settled / tasks.length;
      }),
    );

    const hi = el.querySelector<HTMLElement>('.preloader__plate--hi');
    const key = el.querySelector<HTMLElement>('.preloader__plate--key');
    const bar = el.querySelector<HTMLElement>('.preloader__bar b');
    if (!hi || !key || !bar) return;

    // each drum lays its ink upward; the leading edge is a stochastic stipple, not a line
    const lay = (plate: HTMLElement, amount: number) => {
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
      // never wait longer than 9s, whatever is still loading
      const real = now - start > 9000 ? 1 : state.real;
      const target = Math.min(real, Math.min(elapsed, 1));
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
      document.body.classList.remove('is-loading');
    };
    // runs once: the press only prints the first sheet
    // (images and onDone are read at mount)
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
        <span>{top[0]}</span>
        <span>{top[1]}</span>
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
          <span>{stageFor(progress, stages)}…</span>
          <span>{foot}</span>
        </div>
      </div>
    </div>
  );
}
