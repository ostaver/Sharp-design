// Folio III: the sticky drying line. Vertical scroll becomes sideways travel along the wire.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sheetAspect } from '../gl/plate.js';

// Pinning needs a screen tall enough for the head, a print and its caption. Shorter screens
// get the line as a sideways scroller instead (main.css holds the complementary query).
const PINNED = '(width >= 900px) and (height >= 700px), (height >= 760px)';

export function initHerbarium({ reduced }) {
  const section = document.querySelector('.herbarium');
  const rail = section.querySelector('[data-track]');
  const wire = rail.querySelector('.line__wire');
  const path = wire.querySelector('path');
  const medias = [...rail.querySelectorAll('.plate__media')];
  const yours = rail.querySelector('.plate--yours');
  const hero = document.querySelector('.hero__sticky');

  // A wire that sags a little between pegs and runs through each peg's jaws.
  const drawWire = () => {
    const pegs = medias.filter((m) => m.offsetParent).map((m) => ({ x: m.offsetLeft + m.offsetWidth / 2, y: m.offsetTop }));
    if (!pegs.length) return;
    const width = rail.scrollWidth;
    const mid = 30;
    wire.setAttribute('width', width);
    wire.setAttribute('height', 90);
    wire.setAttribute('viewBox', `0 0 ${width} 90`);
    wire.style.top = `${pegs[0].y - 6 - mid}px`;
    let d = `M0 ${mid - 6}`;
    let prev = 0;
    for (const peg of pegs) {
      d += ` Q${(prev + peg.x) / 2} ${mid + Math.min(26, (peg.x - prev) * 0.045)} ${peg.x} ${mid}`;
      prev = peg.x;
    }
    d += ` Q${(prev + width) / 2} ${mid + 14} ${width} ${mid - 6}`;
    path.setAttribute('d', d);
  };

  const travel = () => Math.max(0, rail.scrollWidth - window.innerWidth);
  const measure = () => {
    // plate 000's sheet is cut to the proportions of the print made in the hero
    if (yours && hero) yours.style.setProperty('--sheet', sheetAspect(hero.offsetWidth / Math.max(1, hero.offsetHeight)).toFixed(3));
    section.style.setProperty('--travel', `${travel()}px`);
    drawWire();
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  if (reduced) return;

  gsap.matchMedia().add(PINNED, () => {
    gsap.to(rail, {
      x: () => -travel(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}
