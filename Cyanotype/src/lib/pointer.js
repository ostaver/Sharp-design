// One shared pointer, read by every layer each frame.

export const pointer = {
  x: -9999,
  y: -9999,
  active: false,
  down: false,
  type: 'mouse',
  last: 0,
};

const move = (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.type = e.pointerType;
  pointer.active = true;
  pointer.last = performance.now();
};

window.addEventListener('pointermove', move, { passive: true });
window.addEventListener(
  'pointerdown',
  (e) => {
    move(e);
    pointer.down = true;
  },
  { passive: true },
);

const release = (e) => {
  pointer.down = false;
  if (e.pointerType !== 'mouse') pointer.active = false;
};
window.addEventListener('pointerup', release, { passive: true });
window.addEventListener('pointercancel', release, { passive: true });

document.documentElement.addEventListener('pointerleave', () => {
  pointer.active = false;
});
window.addEventListener('blur', () => {
  pointer.active = false;
});
