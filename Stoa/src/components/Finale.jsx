import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, SplitText, useGSAP, scrollTo, reducedMotion } from '../lib/motion.js';
import { person, plates } from '../data/content.js';
import { getInk, subscribeInk } from '../lib/ink.js';
import { roman } from '../lib/roman.js';
import { DustInscription } from '../gl/DustInscription.js';
import { useClock } from './Nav.jsx';
import { TempleMark } from './Chrome.jsx';
import Plate from './Plate.jsx';

// χαῖρε — carved with the Latin capitals that share the Greek letterforms
const GREETING = 'XAIPE';
const carve = (s) => s.trim().toUpperCase().replace(/\s+/g, '·');
// classical stonecutters had no U: every U is cut as a V
const epigraph = (s) => carve(s).replace(/U/g, 'V');

const romanTime = (d = new Date()) => {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: person.timeZone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
    .format(d)
    .split(':')
    .map(Number);
  return `${roman(h) || 'N'}·${roman(m) || 'N'}`;
};

function Pediment() {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return `M${600 + Math.cos(a) * 11} ${128 + Math.sin(a) * 11}L${600 + Math.cos(a) * 30} ${128 + Math.sin(a) * 30}`;
  }).join('');
  const art = (
    <>
      <path pathLength="1" d="M0 210 600 14l600 196" />
      <path pathLength="1" d="M78 196 600 38l522 158" />
      <path pathLength="1" d="M0 210H1200M52 196H1148" />
      <path pathLength="1" d="M600 14C584-6 586-26 600-44 614-26 616-6 600 14" />
      <path pathLength="1" d="M600 6C572-2 560-16 556-32M600 6C628-2 640-16 644-32" />
      <path pathLength="1" d="M8 208C10 186 22 172 40 166M1192 208C1190 186 1178 172 1160 166" />
      <circle pathLength="1" cx="600" cy="128" r="34" />
      <circle pathLength="1" cx="600" cy="128" r="8" />
      <path pathLength="1" d={petals} />
      <path pathLength="1" d="M420 170C470 150 520 150 552 160M780 170C730 150 680 150 648 160" />
    </>
  );
  return (
    <svg className="facade__pediment" viewBox="0 -52 1200 266" aria-hidden="true">
      <g className="facade__pediment-hi">{art}</g>
      <g className="facade__pediment-key">{art}</g>
      <text x="600" y="186" textAnchor="middle" className="facade__pediment-text">
        ΣΤΟΑ · MMXXVI
      </text>
    </svg>
  );
}

function ControlStrip() {
  const swatches = [
    ['var(--midnight)', 1], ['var(--midnight)', 0.7], ['var(--midnight)', 0.4], ['var(--midnight)', 0.15],
    ['var(--periwinkle)', 1], ['var(--periwinkle)', 0.6], ['var(--periwinkle)', 0.3],
    ['var(--ink-hi)', 1], ['var(--ink-hi)', 0.6], ['var(--ink-hi)', 0.3],
  ];
  const target = (
    <svg viewBox="0 0 24 24" className="strip__target" aria-hidden="true">
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
  return (
    <div className="strip" aria-hidden="true">
      {target}
      <div className="strip__chips">
        {swatches.map(([c, o], i) => (
          <i key={i} style={{ background: c, opacity: o }} />
        ))}
      </div>
      <span className="mono">Control strip · Plate V of V · 3 inks</span>
      {target}
    </div>
  );
}

export default function Finale() {
  const root = useRef(null);
  const band = useRef(null);
  const canvas = useRef(null);
  const dust = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [name, setName] = useState('');
  const [hoverWord, setHoverWord] = useState(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const time = useClock(person.timeZone);
  const tablet = useMemo(() => String(1000 + Math.floor(Math.random() * 9000)), []);
  const grains = typeof window !== 'undefined' && window.innerWidth < 800 ? 3600 : 7200;

  const inscription = hoverWord ?? (sent ? 'GRATIAS' : name.trim() ? carve(name) : GREETING);
  const inscriptionRef = useRef(inscription);

  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const r = (n) => (Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1;
        return { left: `${Math.abs(r(1)) * 100}%`, top: `${Math.abs(r(2)) * 42}%`, delay: `${Math.abs(r(3)) * 6}s`, size: Math.abs(r(4)) > 0.8 ? 3 : 2 };
      }),
    [],
  );

  // the dust field lives only while the facade is on screen
  useEffect(() => {
    let d;
    try {
      d = new DustInscription(canvas.current, { count: grains, ink: getInk() });
    } catch (e) {
      setFallback(true);
      return;
    }
    dust.current = d;
    let alive = true;
    document.fonts?.load('120px Marcellus').finally(() => {
      if (!alive) return;
      d.resize();
      d.setText(inscriptionRef.current, true);
    });
    if (reducedMotion) d.setAssemble(1);

    const el = band.current;
    const local = (e) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const move = (e) => d.setPointer(...local(e), true);
    const leave = () => d.setPointer(-9999, -9999, false);
    const down = (e) => d.strike(...local(e));
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerdown', down);

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? d.start() : d.stop()), { rootMargin: '200px 0px' });
    io.observe(el);
    const ro = new ResizeObserver(() => d.resize());
    ro.observe(el);
    const offInk = subscribeInk((hex) => d.setInk(hex));
    return () => {
      alive = false;
      offInk();
      io.disconnect();
      ro.disconnect();
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerdown', down);
      d.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inscriptionRef.current = inscription;
    dust.current?.setText(inscription);
  }, [inscription]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q('.finale__title .line'), { type: 'chars', charsClass: 'finale__char' });
      gsap.from(split.chars, {
        yPercent: 110,
        rotate: 5,
        stagger: 0.018,
        duration: 1.3,
        scrollTrigger: { trigger: q('.finale__title'), start: 'top 82%' },
      });

      // the facade is drawn like an elevation: pediment first, then the stone comes back
      gsap.fromTo(
        q('.facade__pediment path, .facade__pediment circle'),
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          stagger: 0.03,
          ease: 'none',
          scrollTrigger: { trigger: q('.facade'), start: 'top 90%', end: 'top 30%', scrub: 0.8 },
        },
      );
      gsap.fromTo(q('.facade__pediment-text'), { opacity: 0 }, { opacity: 1, scrollTrigger: { trigger: q('.facade'), start: 'top 45%' } });
      gsap.fromTo(q('.facade__cornice, .facade__architrave-rules'), { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: q('.facade__architrave'), start: 'top 100%', end: 'top 60%', scrub: 0.8 },
      });
      if (!reducedMotion) {
        const proxy = { a: 0 };
        gsap.to(proxy, {
          a: 1,
          ease: 'none',
          scrollTrigger: { trigger: q('.facade__architrave'), start: 'top 95%', end: 'center 45%', scrub: 1.2 },
          onUpdate: () => dust.current?.setAssemble(proxy.a),
        });
      }
      gsap.fromTo(q('.facade__shaft'), { scaleY: 0 }, {
        scaleY: 1,
        stagger: 0.06,
        ease: 'none',
        scrollTrigger: { trigger: q('.facade__colonnade'), start: 'top 95%', end: 'top 45%', scrub: 0.8 },
      });
      gsap.from(q('.facade__bay > *'), {
        y: 36,
        opacity: 0,
        stagger: 0.05,
        duration: 1.1,
        scrollTrigger: { trigger: q('.facade__colonnade'), start: 'top 75%' },
      });
      gsap.from(q('.stylobate__step'), {
        yPercent: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        scrollTrigger: { trigger: q('.stylobate'), start: 'top 95%' },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  const hover = (word) => ({
    onPointerEnter: () => setHoverWord(word),
    onPointerLeave: () => setHoverWord(null),
    onFocus: () => setHoverWord(word),
    onBlur: () => setHoverWord(null),
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${person.email}`;
    }
  };

  const send = (e) => {
    e.preventDefault();
    const who = name.trim() || 'a passer-by';
    const r = band.current.getBoundingClientRect();
    dust.current?.strike(r.width / 2, r.height / 2, 1.6);
    setSent(true);
    const first = person.name.split(' ')[0];
    const subject = `An inscription from ${who}`;
    const body = `Χαῖρε ${first},\n\nI'd like to raise something monumental together.\n\n— ${who}\n(Tablet Nº ${tablet})`;
    window.location.href = `mailto:${person.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const ascend = () => {
    dust.current?.gust();
    scrollTo(0, { duration: 3.2 });
  };

  const status = sent
    ? `Tablet Nº ${tablet} handed to your mail client — the ink is still wet.`
    : name.trim()
      ? `Carving “${carve(name)}” into Tablet Nº ${tablet}. Press enter to send it.`
      : 'Type your name and the dust will carve it. Hover the stone to scatter it, click to strike.';

  return (
    <section className="finale" id="contact" ref={root} data-dark aria-labelledby="finale-title">
      <div className="finale__sky" aria-hidden="true">
        {stars.map((s, i) => (
          <i key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay, width: s.size, height: s.size }} />
        ))}
      </div>

      <header className="finale__head">
        <div className="finale__meta mono">
          <span>V. — Inscribe</span>
          <span>Plate V — The Facade</span>
        </div>
        <h2 id="finale-title" className="finale__title display">
          <span className="line">Let’s raise</span>
          <span className="line">
            something <em className="finale__em">monumental.</em>
          </span>
        </h2>
      </header>

      <Plate plate={plates.arrival} className="finale__plate" raw={0.84} fade={[190, 220]} />

      <div className="facade">
        <Pediment />
        <div className="facade__cornice" aria-hidden="true" />

        <div className="facade__architrave" ref={band} data-cursor="Strike">
          <div className="facade__architrave-rules" aria-hidden="true" />
          <canvas ref={canvas} className="facade__dust" aria-hidden="true" />
          {fallback && (
            <p className="facade__fallback display riso" data-text={inscription}>
              {inscription}
            </p>
          )}
          <span className="facade__corner facade__corner--tl mono" aria-hidden="true">Inscriptio</span>
          <span className="facade__corner facade__corner--tr mono" aria-hidden="true">Tablet Nº {tablet}</span>
          <span className="facade__corner facade__corner--bl mono" aria-hidden="true">Pentelic dust · {grains.toLocaleString('en')} grains</span>
          <span className="facade__corner facade__corner--br mono" aria-hidden="true">Hover · Strike · Carve</span>
          <p className="sr-only" aria-live="polite">
            The stone reads: {inscription === GREETING ? 'Khaíre — be well' : inscription}
          </p>
        </div>

        <form className="facade__frieze" onSubmit={send}>
          <span className="facade__triglyphs" aria-hidden="true" />
          <label className="facade__chisel">
            <span className="mono">Carve your name</span>
            <input
              type="text"
              value={name}
              maxLength={20}
              placeholder="Your name"
              autoComplete="name"
              spellCheck={false}
              onChange={(e) => {
                setName(e.target.value);
                setSent(false);
              }}
            />
          </label>
          <button type="submit" className="btn btn--light" data-cursor="Send">
            Send the tablet
          </button>
          <span className="facade__triglyphs" aria-hidden="true" />
        </form>
        <p className="facade__status mono" aria-live="polite">
          {status}
        </p>

        <div className="facade__colonnade">
          <i className="facade__shaft" aria-hidden="true" />
          <div className="facade__bay" {...hover('SCRIBE·MIHI')}>
            <p className="mono facade__bay-label">I. — Scribe · write</p>
            <a href={`mailto:${person.email}`} className="facade__email riso" data-text={person.email} data-cursor="Write">
              {person.email}
            </a>
            <button className="btn btn--ghost" onClick={copy} data-cursor="Copy">
              {copied ? 'Copied — ink still wet' : 'Copy address'}
            </button>
          </div>
          <i className="facade__shaft" aria-hidden="true" />
          <div className="facade__bay">
            <p className="mono facade__bay-label">II. — Seqvere · follow</p>
            <ul className="facade__socials mono">
              {person.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" {...hover(epigraph(s.label.split('/')[0]))}>
                    <span>{s.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <i className="facade__shaft" aria-hidden="true" />
          <div className="facade__bay" {...hover(romanTime())}>
            <p className="mono facade__bay-label">III. — Visita · visit</p>
            <p className="facade__clock display">{time}</p>
            <p className="facade__note">
              Studio time in {person.city}. Hover to read it the way the stonecutters would.
            </p>
            <p className="mono facade__avail">
              <b /> Booking commissions for Q1 2027
            </p>
          </div>
          <i className="facade__shaft" aria-hidden="true" />
        </div>
      </div>

      <footer className="stylobate">
        <div className="stylobate__step stylobate__step--1">
          <ControlStrip />
        </div>
        <div className="stylobate__step stylobate__step--2">
          <dl className="colophon mono">
            <div>
              <dt>Typeset in</dt>
              <dd>Marcellus, Cormorant Garamond &amp; IBM Plex Mono</dd>
            </div>
            <div>
              <dt>Engineered with</dt>
              <dd>React, Three.js, OGL, GSAP &amp; Lenis</dd>
            </div>
            <div>
              <dt>Photography</dt>
              <dd>Unsplash contributors, re-inked live</dd>
            </div>
            <div>
              <dt>Tracking</dt>
              <dd>None. No cookies — only ink.</dd>
            </div>
          </dl>
        </div>
        <div className="stylobate__step stylobate__step--3">
          <span className="mono">© {new Date().getFullYear()} {person.name} — all rights carved</span>
          <button className="stylobate__top mono" onClick={ascend} data-cursor="Ascend">
            <TempleMark /> Return to the peristyle ↑
          </button>
          <span className="mono">Made in {person.city} under a periwinkle sky</span>
        </div>
      </footer>
    </section>
  );
}
