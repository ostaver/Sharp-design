// Folio III: the sticky drying line. Vertical scroll becomes sideways travel along the wire.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHerbarium({ reduced }) {
  const section = document.querySelector('.herbarium');
  const rail = section.querySelector('[data-track]');
  const wire = rail.querySelector('.line__wire');
  const path = wire.querySelector('path');
  const hint = section.querySelector('.line__hint');
  const count = section.querySelector('[data-count-to]');
  const medias = [...rail.querySelectorAll('.plate__media')];

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
    section.style.setProperty('--travel', `${travel()}px`);
    drawWire();
  };
  measure();

  if (count && !reduced) {
    const total = Number(count.dataset.countTo);
    const tally = { n: 0 };
    count.textContent = '0';
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: () =>
        gsap.to(tally, {
          n: total,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => (count.textContent = String(Math.round(tally.n))),
        }),
    });
  }

  if (reduced) {
    window.addEventListener('resize', measure);
    return;
  }

  gsap.to(rail, {
    x: () => -travel(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      onUpdate: (self) => (hint.style.opacity = String(1 - Math.min(1, self.progress * 6))),
    },
  });
}
