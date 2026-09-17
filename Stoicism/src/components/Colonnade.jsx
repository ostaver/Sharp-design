import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/motion.js';
import { works } from '../data/content.js';
import RisoImage from './RisoImage.jsx';
import { Dither } from './Chrome.jsx';

function Capital() {
  return (
    <svg className="work__capital" viewBox="0 0 320 34" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="0" width="320" height="8" />
      <path d="M22 10h276l-26 16H48z" />
      <rect x="44" y="28" width="232" height="3" />
    </svg>
  );
}

export default function Colonnade() {
  const root = useRef(null);
  const track = useRef(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add('(min-width: 901px)', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: q('.colonnade__pin'),
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setIndex(Math.min(works.length - 1, Math.floor(self.progress * works.length * 0.999)));
              gsap.set(q('.colonnade__progress b'), { scaleX: self.progress });
            },
          },
        });
        // each column settles into place as it enters the frame
        q('.work').forEach((card) => {
          gsap.fromTo(
            card.querySelector('.work__body'),
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true },
            },
          );
          gsap.fromTo(
            card.querySelector('.work__capital'),
            { scaleX: 0.3 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 60%', scrub: true },
            },
          );
        });
        gsap.to(q('.colonnade__ghost'), {
          xPercent: -40,
          ease: 'none',
          scrollTrigger: { trigger: q('.colonnade__pin'), start: 'top top', end: () => `+=${distance()}`, scrub: true },
        });
      });

      mm.add('(max-width: 900px)', () => {
        q('.work').forEach((card) => {
          gsap.from(card, { y: 80, opacity: 0, duration: 1.2, scrollTrigger: { trigger: card, start: 'top 88%' } });
        });
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section className="colonnade" id="works" ref={root} aria-labelledby="works-title">
      <div className="colonnade__pin">
        <div className="colonnade__ghost display" aria-hidden="true">
          Colonnade · Colonnade · Colonnade
        </div>
        <div className="colonnade__track" ref={track}>
          <header className="colonnade__intro">
            <p className="mono">I. — Selected works, 2022 — 2026</p>
            <h2 id="works-title" className="display">
              <span className="riso" data-text="The">The</span>
              <br />
              <span className="riso" data-text="Colon-">Colon-</span>
              <br />
              <span className="riso" data-text="nade">nade</span>
            </h2>
            <p className="colonnade__lede">
              Six commissions, each one a column: load-bearing engineering underneath, a carved capital of craft on top.
            </p>
            <p className="mono colonnade__hint">Keep scrolling — the portico runs east →</p>
          </header>

          {works.map((w, i) => (
            <article className={`work ${i % 2 ? 'work--low' : ''}`} key={w.title}>
              <Capital />
              <a href="#contact" className="work__link" aria-label={`${w.title} — ${w.kind} for ${w.client}. Enquire about similar work.`}>
                <RisoImage src={w.image} alt={`${w.title} — ${w.kind}`} className="work__img" shape="arch" raw={w.raw ?? 0} cursor="View" />
                <span className="work__num display riso" data-text={w.n}>
                  {w.n}
                </span>
              </a>
              <div className="work__body">
                <div className="work__meta mono">
                  <span>{w.client}</span>
                  <span>{w.year}</span>
                </div>
                <h3 className="work__title display">{w.title}</h3>
                <p className="work__kind italic">{w.kind}</p>
                <p className="work__blurb">{w.blurb}</p>
                <ul className="work__stack mono">
                  {w.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}

          <div className="colonnade__end">
            <p className="display">
              <span className="riso" data-text="Your column">Your column</span>
              <br />
              <span className="riso" data-text="here?">here?</span>
            </p>
            <a className="btn" href="#contact" data-cursor="Commission">
              Commission a work
            </a>
          </div>
        </div>
        <div className="colonnade__status mono" aria-hidden="true">
          <span>
            Column {works[index].n} / {works[works.length - 1].n}
          </span>
          <div className="colonnade__progress">
            <b />
          </div>
          <span>{works[index].title}</span>
        </div>
      </div>
      <Dither to="var(--lavender)" />
    </section>
  );
}
