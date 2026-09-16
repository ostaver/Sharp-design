// Capabilities and preferences, read once at boot.

const mq = (q) => window.matchMedia(q).matches;

function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export const env = {
  reducedMotion: mq('(prefers-reduced-motion: reduce)'),
  moreContrast: mq('(prefers-contrast: more)'),
  finePointer: mq('(hover: hover) and (pointer: fine)'),
  webgl: hasWebGL2(),
  dpr: Math.min(window.devicePixelRatio || 1, 2),
};

export const isDesktop = () => mq('(min-width: 900px)');
