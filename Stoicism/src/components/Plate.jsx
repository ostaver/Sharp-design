import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '../lib/motion.js';
import RisoImage from './RisoImage.jsx';

/*
  A full-bleed house plate. It opens from the centre like the doors of a cella as it
  scrolls in, settles out of a slight zoom, and its top and bottom edges dissolve into
  the page as stipple, so the illustration is printed onto the section, not pasted on.
*/
export default function Plate({ plate, className = '', raw = 0.8, fade = [150, 150], cursor = 'Look' }) {
  const root = useRef(null);
  const handle = useRef(null);
  const state = useRef({ open: reducedMotion ? 0 : 0.5, zoom: reducedMotion ? 0 : 2.2 });

  const apply = () => {
    const u = handle.current?.uniforms;
    if (!u) return;
    const { open, zoom } = state.current;
    u.uInset.value = [0, open, 0, open];
    u.uZoom.value = zoom;
  };

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.to(state.current, {
        open: 0,
        zoom: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 92%', end: 'top 18%', scrub: 1 },
        onUpdate: apply,
      });
      gsap.from(root.current.querySelectorAll('.plate__caption > *'), {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 1.1,
        scrollTrigger: { trigger: root.current, start: 'top 45%' },
      });
    },
    { scope: root },
  );

  return (
    <figure className={`plate ${className}`} ref={root}>
      <RisoImage
        src={plate.src}
        alt={plate.alt}
        className="plate__img"
        raw={raw}
        fade={fade}
        inset={[0, state.current.open, 0, state.current.open]}
        bend={0.12}
        cursor={cursor}
        onPlate={(h) => {
          handle.current = h;
          apply();
        }}
      />
      <figcaption className="plate__caption mono">
        <span>
          {plate.fig} — {plate.title}
        </span>
        <span>{plate.note}</span>
      </figcaption>
    </figure>
  );
}
