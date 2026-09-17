import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/motion.js';
import { ascent } from '../data/content.js';
import { Dither } from './Chrome.jsx';

function Walker() {
  return (
    <svg viewBox="0 0 40 100" aria-hidden="true">
      <g className="walker__hi" transform="translate(2.5 1.5)">
        <circle cx="20" cy="10" r="7" />
        <path d="M12 20h16l3 36h-6l-1 40h-6l-2-32-2 32h-6l-1-40H9z" />
      </g>
      <g className="walker__key">
        <circle cx="20" cy="10" r="7" />
        <path d="M12 20h16l3 36h-6l-1 40h-6l-2-32-2 32h-6l-1-40H9z" />
      </g>
    </svg>
  );
}

export default function Ascent() {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stairs = q('.ascent__stairs')[0];
      const steps = q('.step');
      const walker = q('.walker')[0];

      // the visitor climbs from tread to tread, hopping each riser
      const place = (p) => {
        const box = stairs.getBoundingClientRect();
        const f = p * (steps.length - 1);
        const i = Math.floor(f);
        const t = f - i;
        const a = steps[i].querySelector('.step__tread').getBoundingClientRect();
        const b = steps[Math.min(i + 1, steps.length - 1)].querySelector('.step__tread').getBoundingClientRect();
        const ax = a.left + a.width * 0.5 - box.left;
        const bx = b.left + b.width * 0.5 - box.left;
        const ay = a.top - box.top;
        const by = b.top - box.top;
        const e = gsap.parseEase('power2.inOut')(gsap.utils.clamp(0, 1, (t - 0.25) / 0.5));
        const x = ax + (bx - ax) * e;
        const y = ay + (by - ay) * e - Math.sin(e * Math.PI) * 28;
        gsap.set(walker, { x, y, xPercent: -50, yPercent: -100 });
        steps.forEach((s, k) => s.classList.toggle('is-lit', k <= Math.round(f)));
      };

      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stairs,
          start: 'top 70%',
          end: 'bottom 45%',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onRefresh: () => place(proxy.p),
        },
        onUpdate: () => place(proxy.p),
      });
      place(0);

      steps.forEach((s) => {
        gsap.fromTo(
          s.querySelector('.step__riser'),
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: s, start: 'top 95%', end: 'top 60%', scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section className="ascent" id="ascent" ref={root} aria-labelledby="ascent-title">
      <header className="ascent__head">
        <p className="mono">IV. — Chronicle</p>
        <h2 id="ascent-title" className="display">
          <span className="riso" data-text="The Ascent">The Ascent</span>
        </h2>
        <p className="ascent__lede">Ten years, one step at a time. Every stair was cut by hand.</p>
      </header>

      <ol className="ascent__stairs">
        {ascent.map((a, i) => (
          <li className="step" key={a.year} style={{ '--i': i, '--n': ascent.length }}>
            <div className="step__text">
              <span className="step__year display">{a.year}</span>
              <h3 className="step__title">{a.title}</h3>
              <p className="step__copy">{a.text}</p>
            </div>
            <div className="step__tread" />
            <div className="step__riser" />
          </li>
        ))}
        <li className="walker" aria-hidden="true">
          <Walker />
        </li>
      </ol>
      <Dither to="var(--midnight)" />
    </section>
  );
}
