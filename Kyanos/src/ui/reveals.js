// Type develops like a print: words start blurred and iron-yellow and resolve into the ink
// of their section. Paragraph lines rise from a mask; rows and notes follow in small groups.
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

export function initReveals({ reduced }) {
  const develop = document.querySelectorAll('[data-develop]');
  if (reduced) {
    develop.forEach((el) => el.classList.add('is-split'));
    return;
  }

  develop.forEach((el) => {
    const latent = el.closest('[data-theme="paper"]') ? 'rgba(14, 35, 86, 0.3)' : '#e4e1a6';
    SplitText.create(el, {
      type: 'words',
      wordsClass: 'dw',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        const ink = getComputedStyle(el).color;
        return gsap.fromTo(
          self.words,
          { opacity: 0, filter: 'blur(14px)', color: latent },
          {
            opacity: 1,
            filter: 'blur(0px)',
            color: ink,
            duration: 1.7,
            ease: 'develop',
            stagger: 0.07,
            scrollTrigger: { trigger: el, start: 'top 86%', once: true },
            onComplete: () => gsap.set(self.words, { clearProps: 'filter,color' }),
          },
        );
      },
    });
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
    });
  });

  for (const [parent, children] of [
    ['.footnotes', 'li'],
    ['.sessions__list', '.session'],
    ['.visit__grid', ':scope > *'],
  ]) {
    const root = document.querySelector(parent);
    if (!root) continue;
    gsap.from(root.querySelectorAll(children), {
      y: 36,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: root, start: 'top 86%', once: true },
    });
  }

  // The footer wordmark develops letter by letter.
  const mark = document.querySelector('.visit__wordmark');
  if (mark) {
    const split = SplitText.create(mark, { type: 'chars', aria: 'none' });
    gsap.fromTo(
      split.chars,
      { opacity: 0, filter: 'blur(24px)', color: '#e4e1a6' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        color: '#f2efe6',
        duration: 2,
        ease: 'develop',
        stagger: 0.09,
        scrollTrigger: { trigger: mark, start: 'top 92%', once: true },
        onComplete: () => gsap.set(split.chars, { clearProps: 'filter' }),
      },
    );
  }
}
