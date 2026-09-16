// Headings develop the way a print does in the tray: water rises through each line and,
// where it has passed, the latent yellow-green of the coat clears to the colour of the
// section. Body copy is left alone; it is simply there to be read.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initReveals({ reduced }) {
  const headings = document.querySelectorAll('[data-develop]');
  if (reduced) {
    headings.forEach((el) => el.classList.add('is-split', 'is-developed'));
    return;
  }

  headings.forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      linesClass: 'tide',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        return gsap.fromTo(
          self.lines,
          { '--tide': '-25%' },
          {
            '--tide': '125%',
            duration: 1.5,
            ease: 'develop',
            stagger: 0.16,
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
            onComplete: () => el.classList.add('is-developed'),
          },
        );
      },
    });
  });
}
