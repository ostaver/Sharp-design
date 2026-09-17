import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/motion.js';
import { manifesto, person, plates } from '../data/content.js';
import RisoImage from './RisoImage.jsx';
import { Dither } from './Chrome.jsx';
import Plate from './Plate.jsx';

export default function Manifesto() {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q('.manifesto__words'), { type: 'words', wordsClass: 'manifesto__word' });
      gsap.fromTo(
        [...split.words, ...q('.manifesto__pill')],
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: q('.manifesto__text'), start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
      // pills open like shutters — scale, never width, so the paragraph never reflows
      q('.manifesto__pill-img').forEach((pill) => {
        gsap.fromTo(pill, { scaleX: 0 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: pill, start: 'top 85%', end: 'top 50%', scrub: true },
        });
      });
      gsap.fromTo(q('.manifesto__num'), { yPercent: 18 }, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section className="manifesto" ref={root} aria-labelledby="manifesto-title">
      <div className="manifesto__head mono">
        <span id="manifesto-title">(Manifesto)</span>
        <span>{person.role}</span>
        <span>{person.city} → Everywhere</span>
      </div>
      <p className="manifesto__text">
        {manifesto.map((m, i) => (
          <span key={i}>
            <span className={`manifesto__words ${m.em ? 'italic' : ''}`}>{m.t}</span>
            {m.img && (
              <>
                {' '}
                <span className="manifesto__pill" aria-hidden="true">
                  <RisoImage src={m.img} alt="" className="manifesto__pill-img" shape="pill" bend={0.2} />
                </span>
              </>
            )}{' '}
          </span>
        ))}
      </p>
      <Plate plate={plates.longWalk} className="manifesto__plate" />
      <div className="manifesto__foot">
        <div className="manifesto__fig">
          <div className="manifesto__num display riso" data-text="01" aria-hidden="true">
            01
          </div>
          <p className="mono">
            Signed — {person.name.split(' ').map((w) => w[0]).join('.')}.
            <br />
            {person.city}, {person.since}
          </p>
        </div>
        <p className="manifesto__aside">
          I work with museums, labels and studios that want the web to feel <em>built</em> rather than assembled —
          sites with mass, shadow and a patient kind of motion.
        </p>
      </div>
      <Dither to="var(--mist)" />
    </section>
  );
}
