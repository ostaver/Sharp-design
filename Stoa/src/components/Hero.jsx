import { useEffect, useRef, useState } from 'react';
import { TempleScene } from '../gl/TempleScene.js';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import { images, inks, person } from '../data/content.js';
import { setInk, subscribeInk, useInk } from '../lib/ink.js';
import { Dither } from './Chrome.jsx';

const NAME = person.short.toUpperCase().split('');

export default function Hero({ ready }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const scene = useRef(null);
  const [fallback, setFallback] = useState(false);
  const ink = useInk();

  // WebGL monument lifecycle
  useEffect(() => {
    let s;
    try {
      s = new TempleScene(canvas.current, { lite: window.innerWidth < 800 || navigator.hardwareConcurrency <= 4 });
    } catch (e) {
      console.warn('[stoa] WebGL unavailable, showing the printed fallback.', e);
      setFallback(true);
      window.__stoaTemple = true;
      window.dispatchEvent(new Event('stoa:temple'));
      return;
    }
    scene.current = s;
    s.setInk(ink);
    s.start();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.__stoaTemple = true;
        window.dispatchEvent(new Event('stoa:temple'));
      }),
    );

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? s.start() : s.stop()), { threshold: 0 });
    io.observe(root.current);
    const onVis = () => (document.hidden ? s.stop() : s.start());
    const onResize = () => s.resize();
    const onMove = (e) => s.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    const offInk = subscribeInk((hex) => s.setInk(hex));
    return () => {
      offInk();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      s.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // intro: the first sheet feeds through the drum, then type is set
  useGSAP(
    () => {
      if (!ready) return;
      const q = gsap.utils.selector(root);
      const reveal = { v: 0 };
      const tl = gsap.timeline();
      tl.to(reveal, {
        v: 1,
        duration: reducedMotion ? 0.01 : 2.4,
        ease: 'power2.inOut',
        onUpdate: () => scene.current?.setReveal(reveal.v),
      })
        .fromTo(q('.hero__letter'), { yPercent: 110 }, { yPercent: 0, stagger: 0.07, duration: 1.6 }, 0.6)
        .fromTo(q('.hero__letter'), { '--mis-x': '0.4em', '--mis-y': '-0.2em' }, { '--mis-x': '0.045em', '--mis-y': '-0.03em', stagger: 0.07, duration: 2.2 }, 0.8)
        .fromTo(q('.hero__reveal'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 1.4 }, 1.1)
        .fromTo(q('.hero__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.8, stagger: 0.1 }, 1.0)
        // release the masks so the wind can carry letters beyond their slots
        .set(q('.hero__letter-mask'), { overflow: 'visible' }, 2.4);

      // scroll: walk the processional path while the name erodes on the wind
      const sc = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => scene.current?.setProgress(self.progress),
        },
      });
      sc.to(
        q('.hero__letter'),
        {
          x: (i) => `${(NAME.length - i) * 4 + 18}vw`,
          y: (i) => `${-6 - (NAME.length - i) * 3}vh`,
          rotate: (i) => 8 + i * 3,
          opacity: 0,
          filter: 'blur(10px)',
          stagger: { each: 0.05, from: 'end' },
          ease: 'power2.in',
          duration: 0.45,
        },
        0.04,
      )
        .to(q('.hero__lede, .hero__side'), { opacity: 0, y: -40, duration: 0.2, ease: 'none' }, 0.02)
        .fromTo(q('.hero__caption'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0.4)
        .to(q('.hero__caption'), { opacity: 0, y: -60, duration: 0.2, ease: 'none' }, 0.72)
        .fromTo(q('.hero__plate'), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, 0.8);
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section className="hero" id="top" ref={root} aria-label="Introduction">
      <div className="hero__sticky">
        <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
        {fallback && <img className="hero__fallback" src={images.parthenon} alt="" />}

        <div className="hero__ui">
          <div className="hero__top mono">
            <span className="hero__clip"><span className="hero__reveal">Plate I — The Peristyle</span></span>
            <span className="hero__clip"><span className="hero__reveal">8 × 17 columns · procedural · live</span></span>
            <span className="hero__clip hero__coords"><span className="hero__reveal">{person.coords}</span></span>
          </div>

          <div className="hero__side mono" aria-hidden="true">
            <span>ΣΤΟΑ</span>
            <i className="hero__rule" />
            <span>Est. {person.since}</span>
          </div>

          <div className="hero__main">
            <p className="hero__lede">
              <span className="hero__clip"><span className="hero__reveal italic">{person.name.split(' ')[0]} —</span></span>
              <span className="hero__clip"><span className="hero__reveal">a {person.role.toLowerCase()} raising</span></span>
              <span className="hero__clip"><span className="hero__reveal">monuments out of light, shaders</span></span>
              <span className="hero__clip"><span className="hero__reveal">&amp; motion.</span></span>
            </p>
            <h1 className="hero__name display" aria-label={person.name}>
              {NAME.map((l, i) => (
                <span className="hero__letter-mask" key={i} aria-hidden="true">
                  <span className="hero__letter riso" data-text={l}>
                    {l}
                  </span>
                </span>
              ))}
            </h1>
          </div>

          <p className="hero__caption">
            Every frame of this temple is <em>re-printed</em> in three inks, sixty times a second.
          </p>

          <div className="hero__plate mono" aria-hidden="true">
            <span>Fig. 1</span>
            <span>The wind takes what the scroll gives it.</span>
          </div>

          <div className="hero__foot">
            <i className="hero__rule" />
            <div className="hero__foot-row mono">
              <span className="hero__clip"><span className="hero__reveal hero__cue">Walk the colonnade</span></span>
              <div className="hero__clip">
                <div className="hero__reveal inks" role="radiogroup" aria-label="Highlight ink">
                  <span>Second drum</span>
                  {inks.map((k) => (
                    <button
                      key={k.hex}
                      role="radio"
                      aria-checked={ink === k.hex}
                      aria-label={k.name}
                      className={`inks__swatch ${ink === k.hex ? 'is-on' : ''}`}
                      style={{ '--sw': k.hex }}
                      onClick={() => setInk(k.hex)}
                      data-cursor={k.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dither to="var(--peri-soft)" />
    </section>
  );
}
