// Hero controller: the exposure meter and buttons, and the scroll that washes the print.
import gsap from 'gsap';

export function initHero({ photogram, setNav, reduced }) {
  const section = document.querySelector('.hero');
  const ui = section.querySelector('.hero__ui');
  const note = section.querySelector('[data-plate-note]');
  const fill = section.querySelector('[data-meter-fill]');
  const value = section.querySelector('[data-meter-value]');
  const sun = section.querySelector('[data-sun]');
  const recoat = section.querySelector('[data-recoat]');
  const hintFine = section.querySelector('.hint-fine');
  const hintTouch = section.querySelector('.hint-touch');
  const stamp = section.querySelector('[data-now]');
  const entrance = [section.querySelector('.hero__sheet'), ...section.querySelectorAll('.hero__foot > *')];

  const now = new Date();
  stamp.dateTime = now.toISOString();
  stamp.textContent = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(now);

  if (!photogram) return { intro() {} };

  // While the sheet is in the sun the system cursor gives way to a small lamp ring.
  const lamp = document.createElement('div');
  lamp.className = 'lamp';
  lamp.setAttribute('aria-hidden', 'true');
  section.querySelector('.hero__sticky').append(lamp);
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType === 'mouse') lamp.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    },
    { passive: true },
  );

  const hints = { fine: hintFine.textContent, touch: hintTouch.textContent };
  let shown = 0;
  let pct = -1;
  let prompted = false;

  // Resting on a button shouldn't burn a spot into the sheet.
  for (const button of [sun, recoat]) {
    button.addEventListener('pointerenter', () => (photogram.hold = true));
    button.addEventListener('pointerleave', () => (photogram.hold = false));
  }

  sun.addEventListener('click', () => photogram.sunSweep());
  recoat.addEventListener('click', () => {
    photogram.hold = false;
    photogram.recoat();
    prompted = false;
    recoat.hidden = true;
    hintFine.textContent = hints.fine;
    hintTouch.textContent = hints.touch;
    sun.focus();
  });

  let drawn = -1;
  gsap.ticker.add(() => {
    shown += (photogram.coverage - shown) * 0.12;
    if (Math.abs(shown - drawn) > 0.0005) {
      drawn = shown;
      fill.style.transform = `scaleX(${shown.toFixed(4)})`;
    }
    const next = Math.round(shown * 100);
    if (next !== pct) {
      pct = next;
      value.textContent = pct;
    }
    if (!prompted && photogram.coverage > 0.55) {
      prompted = true;
      recoat.hidden = false;
      hintFine.textContent = hintTouch.textContent = 'Now scroll down to wash the print';
    }
  });

  if (reduced) return { intro() {} };

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          photogram.setProgress(self.progress);
          setNav(self.progress > 0.3 ? 'blue' : 'sheet');
        },
      },
    })
    .to(ui, { autoAlpha: 0, y: -18, duration: 0.1 }, 0.01)
    .fromTo(note, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.84)
    .set({}, {}, 1);

  return {
    intro() {
      photogram.intro();
      gsap.to(entrance, { autoAlpha: 1, y: 0, startAt: { y: 14 }, duration: 1.2, stagger: 0.1, ease: 'power3.out', delay: 1.1 });
    },
  };
}
