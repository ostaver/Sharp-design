import { useEffect, useRef, useState } from 'react';
import { nav, person } from '../data/content.js';
import { gsap, onScroll, scrollTo, getLenis } from '../lib/motion.js';
import { TempleMark } from './Chrome.jsx';

function useClock(timeZone) {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

export { useClock };

export default function Nav({ ready }) {
  const ref = useRef(null);
  const [theme, setTheme] = useState('light');
  const [active, setActive] = useState('');
  const time = useClock(person.timeZone);

  useEffect(() => {
    if (!ready) return;
    gsap.fromTo(ref.current.children, { yPercent: -120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.08, duration: 1.4, delay: 0.5 });

    // measure rather than toggle: whatever sits under the nav bar decides its ink,
    // whatever crosses the middle of the screen is the active chapter
    const sections = nav.map(({ id }) => document.getElementById(id)).filter(Boolean);
    const darks = [...document.querySelectorAll('main [data-dark]')];
    let raf = 0;
    let last = window.scrollY;
    const measure = () => {
      raf = 0;
      const probe = 36;
      const mid = window.innerHeight / 2;
      const darkAt = (y) => darks.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
      setTheme(darkAt(probe) ? 'dark' : 'light');
      // the ink-level scrollbar sits mid-screen and needs its own reading
      document.documentElement.classList.toggle('mid-dark', darkAt(mid));
      const hit = sections.find((el) => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      setActive(hit ? hit.id : '');
      const y = window.scrollY;
      const delta = y - last;
      if (Math.abs(delta) > 3) ref.current?.classList.toggle('is-hidden', delta > 0 && y > window.innerHeight * 0.6);
      last = y;
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const off = onScroll(queue);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    measure();
    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [ready]);

  const go = (e, id) => {
    e.preventDefault();
    scrollTo(`#${id}`);
  };

  // phone menu: a sheet of midnight paper fed down over the page
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    const el = menu.current;
    const q = gsap.utils.selector(el);
    if (open) {
      wasOpen.current = true;
      getLenis()?.stop();
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo(q('.menu__item'), { yPercent: 115 }, { yPercent: 0, stagger: 0.06, duration: 1.1, delay: 0.3 });
      gsap.fromTo(q('.menu__foot > *'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.06, delay: 0.55 });
      const esc = (e) => e.key === 'Escape' && setOpen(false);
      window.addEventListener('keydown', esc);
      return () => window.removeEventListener('keydown', esc);
    }
    if (!wasOpen.current) return;
    getLenis()?.start();
    gsap.to(el, {
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 0.75,
      ease: 'expo.inOut',
      onComplete: () => gsap.set(el, { visibility: 'hidden' }),
    });
  }, [open]);

  const goMobile = (e, id) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollTo(`#${id}`, { duration: 1.2 }), 380);
  };

  return (
    <>
    <header className={`nav ${open ? 'is-open' : ''}`} ref={ref} data-theme={open ? 'dark' : theme}>
      <a
        href="#top"
        className="nav__brand"
        onClick={(e) => {
          e.preventDefault();
          scrollTo(0);
        }}
        aria-label={`${person.name}, back to top`}
      >
        <TempleMark />
        <b>{person.name}</b>
      </a>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className={active === n.id ? 'is-active' : ''}>
                <i>{n.numeral}.</i>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="nav__meta mono">
        <span className="nav__clock">
          {person.city} {time}
        </span>
        <span className="nav__status">Open for commissions</span>
        <button className="nav__burger" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="site-menu">
          <span>{open ? 'Close' : 'Menu'}</span>
          <i aria-hidden="true" />
        </button>
      </div>
    </header>

    <div className="menu" id="site-menu" ref={menu} aria-hidden={!open} data-dark>
      <ul className="menu__list">
        {nav.map((n) => (
          <li key={n.id}>
            <a href={`#${n.id}`} className="menu__item" onClick={(e) => goMobile(e, n.id)} tabIndex={open ? 0 : -1}>
              <i>{n.numeral}.</i>
              <span className="riso" data-text={n.label}>
                {n.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="menu__foot mono">
        <a href={`mailto:${person.email}`} tabIndex={open ? 0 : -1}>
          {person.email}
        </a>
        <span>
          {person.city} · {time}
        </span>
        <span className="nav__status">Open for commissions</span>
      </div>
    </div>
    </>
  );
}
