import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, onScroll, reducedMotion, getLenis, ScrollTrigger } from '../lib/motion';
import { sections, layout } from '../chart';

/** Paper grain over everything, shimmering in steps like a drum. */
export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

/** Registration targets in the margins. */
export function RegMarks() {
  return (
    <div className="regmarks" aria-hidden="true">
      <span>
        <i />
      </span>
      <span>
        <i />
      </span>
    </div>
  );
}

interface Mark {
  id: string;
  numeral: string;
  label: string;
  at: number;
}

/** The page's only scrollbar: an ink level you can grab. Chapter marks sit where each nav section begins. */
export function InkLevel() {
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const [marks, setMarks] = useState<Mark[]>([]);

  useEffect(() => {
    const el = track.current;
    if (!el || !bar.current) return;
    const set = gsap.quickSetter(bar.current, 'scaleY');
    const max = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const update = () => set(window.scrollY / max());
    const measure = () => {
      const m = max();
      setMarks(
        sections
          .filter((s) => s.nav)
          .flatMap((s) => {
            const sec = document.getElementById(s.id);
            return sec ? [{ id: s.id, numeral: s.numeral, label: s.label, at: Math.min(1, (sec.getBoundingClientRect().top + window.scrollY) / m) }] : [];
          }),
      );
      update();
    };

    const yFor = (clientY: number) => {
      const r = el.getBoundingClientRect();
      return gsap.utils.clamp(0, 1, (clientY - r.top) / r.height) * max();
    };
    const go = (y: number, immediate: boolean) => {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.1, force: true });
      else window.scrollTo(0, y);
    };
    let dragging = false;
    const down = (e: PointerEvent) => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
      go(yFor(e.clientY), false);
    };
    const move = (e: PointerEvent) => {
      if (dragging) go(yFor(e.clientY), true);
    };
    const up = (e: PointerEvent) => {
      dragging = false;
      el.classList.remove('is-dragging');
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);

    const off = onScroll(update);
    window.addEventListener('scroll', update, { passive: true });
    ScrollTrigger.addEventListener('refresh', measure);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      off();
      window.removeEventListener('scroll', update);
      ScrollTrigger.removeEventListener('refresh', measure);
      window.removeEventListener('resize', measure);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <div className={`ink-level ink-level--${layout.chrome.level}`} ref={track} aria-hidden="true" data-cursor="Drag">
      <span className="ink-level__rail">
        <b ref={bar} />
        {marks.map((m) => (
          <i key={m.id} style={{ top: `${m.at * 100}%` }}>
            <em>
              {m.numeral}. {m.label}
            </em>
          </i>
        ))}
      </span>
    </div>
  );
}

/** Dot, ghost and ring. Labels come from [data-cursor]; [data-dark] sections flip its ink. */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const dot = el.querySelector<HTMLElement>('.cursor__dot');
    const ghost = el.querySelector<HTMLElement>('.cursor__ghost');
    const ring = el.querySelector<HTMLElement>('.cursor__ring');
    const label = ring?.querySelector('span');
    if (!dot || !ghost || !ring || !label) return;
    document.documentElement.classList.add('has-cursor');
    const k = reducedMotion ? 1 : 0.16;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    const ghostPos = { ...pos };
    let raf = 0;
    let seen = false;
    let stale = false;
    const read = (target: Element | null) => {
      const t = target?.closest('[data-cursor], a, button, input, label');
      const text = t?.getAttribute('data-cursor');
      el.classList.toggle('is-label', !!text);
      el.classList.toggle('is-link', !text && !!t);
      if (text) label.textContent = text;
      el.classList.toggle('on-dark', !!target?.closest('[data-dark]'));
    };
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      seen = true;
      stale = false;
      read(e.target instanceof Element ? e.target : null);
    };
    // the page scrolls under a resting pointer: re-read what it is over, or the cursor keeps a
    // stale label and stays key-ink-on-key-ink over the dark sections
    const scrolled = () => {
      stale = seen;
    };
    const offScroll = onScroll(scrolled);
    window.addEventListener('scroll', scrolled, { passive: true });
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (stale) {
        stale = false;
        read(document.elementFromPoint(pos.x, pos.y));
      }
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      ghostPos.x += (pos.x - ghostPos.x) * 0.35;
      ghostPos.y += (pos.y - ghostPos.y) * 0.35;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      ghost.style.transform = `translate3d(${ghostPos.x}px, ${ghostPos.y}px, 0)`;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    };
    // press feedback is a class, never a GSAP tween: GSAP would rewrite the transform the loop
    // positions with, and fold away the CSS translate that centres each mark on the pointer
    const down = () => el.classList.add('is-down');
    const up = () => el.classList.remove('is-down');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('blur', up);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      offScroll();
      window.removeEventListener('scroll', scrolled);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('blur', up);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <div className="cursor__ring">
        <span />
      </div>
      <div className="cursor__ghost" />
      <div className="cursor__dot" />
    </div>
  );
}

/** The house mark: a Doric front in key ink over an offset highlight ink. */
export function TempleMark({ className = '' }: { className?: string }) {
  const shape = (
    <>
      <path d="M8 21 32 9l24 12z" />
      <rect x="10" y="23" width="44" height="4" />
      <rect x="13" y="29" width="5" height="21" />
      <rect x="23.5" y="29" width="5" height="21" />
      <rect x="35.5" y="29" width="5" height="21" />
      <rect x="46" y="29" width="5" height="21" />
      <rect x="8" y="51" width="48" height="4" />
    </>
  );
  return (
    <svg viewBox="0 0 64 64" className={`temple-mark ${className}`} aria-hidden="true">
      <g className="temple-mark__hi" fill="var(--ink-hi)">
        {shape}
      </g>
      <g fill="currentColor">{shape}</g>
    </svg>
  );
}

/** A stippled hand-over from one section's paper to the next, pinned to a section's bottom edge. */
export function Dither({ to }: { to: string }) {
  return <div className="dither" style={{ '--to': to } as CSSProperties} aria-hidden="true" />;
}

/** Small site-wide behaviours: magnetic buttons, the drying tab title, titles drifting into register. */
export function SiteFx({ ready, away }: { ready: boolean; away: string }) {
  useEffect(() => {
    // magnetic buttons: they lean toward the cursor like wet paper to a roller
    let current: HTMLElement | null = null;
    const release = (el: HTMLElement) => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    const move = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>('.btn, [data-magnetic]') : null;
      if (el !== current) {
        if (current) release(current);
        current = el;
      }
      if (!el || reducedMotion) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * 0.22, y: dy * 0.32, duration: 0.5, ease: 'power3.out' });
    };
    window.addEventListener('pointermove', move, { passive: true });

    // the tab title keeps printing while you are away
    const title = document.title;
    const vis = () => {
      document.title = document.hidden ? away : title;
    };
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [away]);

  useEffect(() => {
    if (!ready || reducedMotion) return;
    // every section title drifts into register as it arrives
    const tweens = [...document.querySelectorAll('main h2 .riso')].map((el) =>
      gsap.fromTo(
        el,
        { '--mis-x': '0.5em', '--mis-y': '-0.3em', yPercent: 35, opacity: 0 },
        {
          '--mis-x': '0.045em',
          '--mis-y': '-0.03em',
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        },
      ),
    );
    return () => tweens.forEach((t) => (t.scrollTrigger ? t.scrollTrigger.kill() : t.kill()));
  }, [ready]);

  return null;
}
