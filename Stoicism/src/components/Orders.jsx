import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/motion.js';
import { orders } from '../data/content.js';

// Line-drawn capitals. Every stroke uses pathLength=1 so the drawing can be scrubbed.
const capitals = {
  Doric: (
    <>
      <path pathLength="1" d="M20 20H300V44H20Z" />
      <path pathLength="1" d="M34 44C60 76 96 88 160 88S260 76 286 44" />
      <path pathLength="1" d="M70 88V100H250V88" />
      <path pathLength="1" d="M78 106H242M84 114H236" />
    </>
  ),
  Ionic: (
    <>
      <path pathLength="1" d="M14 16H306V30H14Z" />
      <path pathLength="1" d="M58 30C24 30 12 52 18 70C24 90 56 94 66 76C74 62 62 48 50 52C40 56 42 68 50 68" />
      <path pathLength="1" d="M262 30C296 30 308 52 302 70C296 90 264 94 254 76C246 62 258 48 270 52C280 56 278 68 270 68" />
      <path pathLength="1" d="M58 30C110 40 210 40 262 30M66 76C110 64 210 64 254 76" />
      <path pathLength="1" d="M96 52a8 10 0 1 0 16 0a8 10 0 1 0-16 0M136 52a8 10 0 1 0 16 0a8 10 0 1 0-16 0M168 52a8 10 0 1 0 16 0a8 10 0 1 0-16 0M208 52a8 10 0 1 0 16 0a8 10 0 1 0-16 0" />
      <path pathLength="1" d="M84 100H236M90 108H230" />
    </>
  ),
  Corinthian: (
    <>
      <path pathLength="1" d="M18 10H302L288 26H32Z" />
      <path pathLength="1" d="M40 26C30 40 22 44 12 42C22 54 40 50 52 40M280 26C290 40 298 44 308 42C298 54 280 50 268 40" />
      <path pathLength="1" d="M160 26C150 40 150 52 160 60C170 52 170 40 160 26" />
      <path pathLength="1" d="M70 112C58 90 62 66 80 52C80 72 92 88 108 96C92 70 100 50 118 40C114 64 124 86 142 100" />
      <path pathLength="1" d="M250 112C262 90 258 66 240 52C240 72 228 88 212 96C228 70 220 50 202 40C206 64 196 86 178 100" />
      <path pathLength="1" d="M142 112C136 92 144 74 160 64C176 74 184 92 178 112" />
      <path pathLength="1" d="M60 112C84 86 100 70 110 60M260 112C236 86 220 70 210 60" />
      <path pathLength="1" d="M76 112H244M82 120H238" />
    </>
  ),
};

export default function Orders() {
  const root = useRef(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      q('.order').forEach((col, i) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: col, start: 'top 85%', end: 'top 20%', scrub: 0.8 },
        });
        tl.fromTo(col.querySelector('.order__shaft'), { scaleY: 0 }, { scaleY: 1, ease: 'none', duration: 0.5 }, i * 0.04)
          .fromTo(col.querySelectorAll('.order__capital path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.04, ease: 'none', duration: 0.5 }, 0.25)
          .fromTo(col.querySelectorAll('.order__skills li'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.04, ease: 'none', duration: 0.3 }, 0.35);
      });
      gsap.fromTo(q('.orders__marquee-track'), { xPercent: 0 }, {
        xPercent: -50,
        ease: 'none',
        scrollTrigger: { trigger: q('.orders__marquee'), start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },
    { scope: root },
  );

  const marquee = ['Doric', 'Ionic', 'Corinthian', 'Tuscan', 'Composite', 'Shader', 'Motion', 'Structure'];

  return (
    <section className="orders" id="orders" ref={root} aria-labelledby="orders-title">
      <header className="orders__head">
        <p className="mono">II. — Capabilities</p>
        <h2 id="orders-title" className="display">
          <span className="riso" data-text="The Three">The Three</span>
          <br />
          <span className="riso" data-text="Orders">Orders</span>
        </h2>
        <p className="orders__lede">
          Classical architects had three systems of proportion. I have three layers of craft — and like the orders,
          each one stands on the one before it.
        </p>
      </header>

      <div className="orders__grid">
        {orders.map((o) => (
          <article className={`order order--${o.order.toLowerCase()}`} key={o.order}>
            <svg className="order__capital" viewBox="0 0 320 124" aria-hidden="true">
              <g className="order__capital-hi">{capitals[o.order]}</g>
              <g>{capitals[o.order]}</g>
            </svg>
            <div className="order__shaft">
              <div className="order__inner">
                <p className="mono order__num">Order {o.numeral}</p>
                <h3 className="display">{o.order}</h3>
                <p className="order__motto italic">{o.motto}</p>
                <p className="order__lead">{o.lead}</p>
                <ul className="order__skills mono">
                  {o.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order__base" aria-hidden="true" />
          </article>
        ))}
      </div>

      <div className="orders__marquee" aria-hidden="true" data-dark>
        <div className="orders__marquee-track display">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i}>
              {m} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
