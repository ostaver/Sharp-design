import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/motion.js';
import { images, inks, thumbs } from '../data/content.js';
import { hexToVec, setInk, useInk } from '../lib/ink.js';
import RisoImage from './RisoImage.jsx';
import { gallery } from '../gl/RisoGallery.js';
import { Dither } from './Chrome.jsx';

const unsplashThumb = (src) => src.replace(/w=\d+/, 'w=240');
const SOURCES = [
  { label: 'David', src: images.david, thumb: unsplashThumb(images.david) },
  { label: 'Listeners', src: images.listeners, thumb: thumbs.listeners },
  { label: 'Dome', src: images.dome, thumb: unsplashThumb(images.dome) },
  { label: 'Casts', src: images.castHall, thumb: unsplashThumb(images.castHall) },
];

function Slider({ label, min, max, step, value, onChange, unit = '' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="slider">
      <span className="slider__row mono">
        <span>{label}</span>
        <output>
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </output>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} style={{ '--pct': `${pct}%` }} />
    </label>
  );
}

export default function Press() {
  const root = useRef(null);
  const plate = useRef(null);
  const globalInk = useInk();
  const [src, setSrc] = useState(0);
  const [grain, setGrain] = useState(1.6);
  const [misreg, setMisreg] = useState(5);
  const [density, setDensity] = useState(1.2);
  const [ink, setLocalInk] = useState(inks[0].hex);
  const [prints, setPrints] = useState(0); // prints pulled so far
  const [rack, setRack] = useState([]);
  const rackRef = useRef(null);
  // live settings for the print being hung (the pull jitters registration mid-flight)
  const settings = useRef({});
  settings.current = { grain, misreg, density, ink, prints };

  const apply = () => {
    const u = plate.current?.uniforms;
    if (!u) return;
    const dpr = Math.min(window.devicePixelRatio, 1.6);
    u.uGrain.value = grain * dpr;
    u.uMisreg.value = misreg;
    u.uDensity.value = density;
    u.uInk.value = hexToVec(ink);
  };
  useEffect(apply);

  const onPlate = (h) => {
    h.item.lockInk = true;
    plate.current = h;
    apply();
  };

  const hang = async () => {
    const h = plate.current;
    if (!h) return;
    const url = await gallery.capture(h);
    if (!url) return;
    const { misreg: m, ink: k, prints: n } = settings.current;
    const name = inks.find((x) => x.hex === k)?.name ?? 'Pink';
    setRack((r) => [{ id: n, url, misreg: m, ink: name, tilt: gsap.utils.random(-4, 4) }, ...r].slice(0, 6));
  };

  // each new print drops onto the line and swings to rest on its peg
  useLayoutEffect(() => {
    const first = rackRef.current?.querySelector('.rack__print');
    if (!first || !rack.length) return;
    gsap.fromTo(
      first,
      { y: -90, rotate: -16, opacity: 0 },
      { y: 0, rotate: rack[0].tilt, opacity: 1, duration: 1.6, ease: 'elastic.out(1, 0.45)' },
    );
    gsap.fromTo(rackRef.current.querySelectorAll('.rack__print:not(:first-child)'), { x: -40 }, { x: 0, duration: 0.9, ease: 'power3.out' });
  }, [rack]);

  const pull = () => {
    const u = plate.current?.uniforms;
    setPrints((p) => p + 1);
    const q = gsap.utils.selector(root);
    gsap.fromTo(q('.press__sheet'), { y: 0, rotate: 0 }, { y: 6, rotate: gsap.utils.random(-0.6, 0.6), duration: 0.08, repeat: 5, yoyo: true, ease: 'none', clearProps: 'transform' });
    setMisreg((m) => Math.max(0, Math.min(16, m + gsap.utils.random(-3, 3))));
    if (u)
      gsap.fromTo(u.uPull, { value: 0.001 }, {
        value: 0.999,
        duration: 1.3,
        ease: 'power2.inOut',
        onComplete: () => {
          u.uPull.value = 0;
          hang();
        },
      });
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.from(q('.press__controls > *'), {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        scrollTrigger: { trigger: q('.press__controls'), start: 'top 80%' },
      });
      gsap.fromTo(q('.press__sheet'), { clipPath: 'inset(100% 0 0 0)' }, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'none',
        scrollTrigger: { trigger: q('.press__frame'), start: 'top 85%', end: 'top 35%', scrub: true },
      });
    },
    { scope: root },
  );

  const inkMeta = inks.find((k) => k.hex === ink) ?? inks[0];

  return (
    <section className="press" id="press" ref={root} data-dark aria-labelledby="press-title">
      <header className="press__head">
        <p className="mono">III. — Laboratory</p>
        <h2 id="press-title" className="display">
          <span className="riso" data-text="The Press">The Press</span>
        </h2>
        <p className="press__lede">
          The shader behind every image on this site, handed to you. Drag the sliders, change the second drum, and pull
          a print. Everything re-renders on the GPU in real time.
        </p>
      </header>

      <div className="press__body">
        <div className="press__frame">
          <div className="press__crop" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <div className="press__sheet">
            <RisoImage key={SOURCES[src].src} src={SOURCES[src].src} alt={`${SOURCES[src].label}, printed live in two inks`} className="press__img" bend={0.3} onPlate={onPlate} cursor="Smear" />
          </div>
          <div className="press__readout mono">
            <span>Print Nº {String(prints + 1).padStart(4, '0')}</span>
            <span>Grain {grain.toFixed(1)}px · Reg Δ {misreg.toFixed(1)}px · Density {density.toFixed(2)}</span>
            <span>{inkMeta.code}</span>
          </div>
        </div>

        <div className="press__controls">
          <fieldset className="press__group">
            <legend className="mono">01 — Master</legend>
            <div className="press__sources">
              {SOURCES.map((s, i) => (
                <button key={s.label} className={`press__source ${i === src ? 'is-on' : ''}`} onClick={() => setSrc(i)} aria-pressed={i === src} data-cursor={s.label}>
                  <img src={s.thumb} alt="" loading="lazy" />
                  <span className="mono">{s.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="press__group">
            <legend className="mono">02 — Drum settings</legend>
            <Slider label="Grain" min={1} max={6} step={0.1} value={grain} onChange={setGrain} unit="px" />
            <Slider label="Misregistration" min={0} max={16} step={0.1} value={misreg} onChange={setMisreg} unit="px" />
            <Slider label="Ink density" min={0.6} max={2.2} step={0.01} value={density} onChange={setDensity} />
          </fieldset>

          <fieldset className="press__group">
            <legend className="mono">03 — Second drum</legend>
            <div className="press__inks">
              {inks.map((k) => (
                <button key={k.hex} className={`press__ink ${ink === k.hex ? 'is-on' : ''}`} style={{ '--sw': k.hex }} onClick={() => setLocalInk(k.hex)} aria-pressed={ink === k.hex}>
                  <i />
                  <span className="mono">{k.name}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="press__actions">
            <button className="btn btn--light" onClick={pull} data-cursor="Pull">
              Pull a print
            </button>
            <button className="btn btn--ghost" onClick={() => setInk(ink)} disabled={globalInk === ink} data-cursor="Re-ink">
              {globalInk === ink ? 'Site is inked in this' : 'Ink the whole site'}
            </button>
          </div>
        </div>
      </div>

      <div className="rack">
        <div className="rack__head mono">
          <span>04 — Drying line</span>
          <span aria-live="polite">
            {rack.length
              ? `${rack.length} print${rack.length > 1 ? 's' : ''} hanging — click one to take it home`
              : 'Pull a print and it will hang here to dry'}
          </span>
        </div>
        <div className="rack__line">
          <ol className="rack__prints" ref={rackRef}>
            {rack.map((p) => (
              <li className="rack__print" key={p.id}>
                <i className="rack__peg" aria-hidden="true" />
                <a href={p.url} download={`stoa-print-${String(p.id).padStart(4, '0')}.jpg`} data-cursor="Save">
                  <img src={p.url} alt={`Print Nº ${p.id}, pulled in ${p.ink}`} />
                </a>
                <span className="mono">
                  Nº {String(p.id).padStart(4, '0')} · Δ{p.misreg.toFixed(1)} · {p.ink}
                </span>
              </li>
            ))}
            {rack.length < 6 && (
              <li className="rack__ghost mono" aria-hidden="true">
                <i className="rack__peg" />
                <span>Nº {String(prints + 1).padStart(4, '0')}</span>
              </li>
            )}
          </ol>
        </div>
      </div>
      <Dither to="var(--peri-soft)" />
    </section>
  );
}
