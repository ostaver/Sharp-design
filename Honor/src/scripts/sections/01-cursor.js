const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], [data-cursor]:not([data-cursor="hidden"])';
const TRAIL_LENGTH = 34; // points kept behind the head
const HEAD = 9; // px, solid square
const FOLLOW = 0.18; // fraction of the gap closed per frame
const LINE = 1.4;
const FRAME = 1.25; // outline of the square over interactive elements
const BRAND = '#fa3600';

const approach = (value, target, rate, epsilon = 0.001) => {
  const next = value + (target - value) * rate;
  return Math.abs(target - next) < epsilon ? target : next;
};

/**
 * Canvas cursor: a small brand-coloured square that eases after the pointer, dragging a hairline trail that fades
 * towards its tail and decays once the pointer rests. Over interactive elements the square opens into an outline;
 * inside [data-cursor="hidden"] the square is withdrawn and only the trail remains.
 */
export function init() {
  const host = document.querySelector('.cursor');
  if (!host || !window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 992px)').matches) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  host.appendChild(canvas);

  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const trail = [];
  const state = { present: false, interactive: false, hidden: false, pressed: false, raf: 0 };
  const level = { visible: 0, hover: 0, dot: 1, press: 0 };

  const frameSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.8;

  function render() {
    state.raf = 0;
    if (document.hidden) return;

    const moved = Math.hypot(target.x - current.x, target.y - current.y) > 0.01;
    current.x = approach(current.x, target.x, FOLLOW, 0.01);
    current.y = approach(current.y, target.y, FOLLOW, 0.01);

    // the trail grows while the head travels and is eaten from the tail when it rests
    if (moved && !reduceMotion) trail.push({ x: current.x, y: current.y });
    else trail.shift();
    while (trail.length > TRAIL_LENGTH) trail.shift();

    level.visible = approach(level.visible, state.present ? 1 : 0, 0.2);
    level.hover = approach(level.hover, state.interactive ? 1 : 0, 0.2);
    level.dot = approach(level.dot, state.hidden ? 0 : 1, 0.25);
    level.press = approach(level.press, state.pressed ? 1 : 0, 0.3);

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = BRAND;
    ctx.lineWidth = LINE;
    for (let i = 1; i < trail.length; i += 1) {
      ctx.globalAlpha = (i / (TRAIL_LENGTH + 7)) ** 2 * level.visible;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    const open = level.hover * level.hover * (3 - 2 * level.hover);
    const size = (HEAD + (frameSize() - HEAD) * open) * (1 - 0.3 * level.press);
    const x = current.x - size / 2;
    const y = current.y - size / 2;
    const alpha = level.dot * level.visible;
    ctx.fillStyle = BRAND;
    ctx.globalAlpha = alpha * (1 - open);
    if (ctx.globalAlpha > 0) ctx.fillRect(x, y, size, size);
    ctx.lineWidth = FRAME;
    ctx.globalAlpha = alpha * open;
    if (ctx.globalAlpha > 0) ctx.strokeRect(x + FRAME / 2, y + FRAME / 2, size - FRAME, size - FRAME);
    ctx.globalAlpha = 1;

    const settling =
      moved ||
      trail.length > 0 ||
      level.visible !== (state.present ? 1 : 0) ||
      level.hover !== (state.interactive ? 1 : 0) ||
      level.dot !== (state.hidden ? 0 : 1) ||
      level.press !== (state.pressed ? 1 : 0);
    if (settling) wake();
  }

  function wake() {
    if (!state.raf) state.raf = requestAnimationFrame(render);
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    target.x = event.clientX;
    target.y = event.clientY;
    if (!state.present) {
      current.x = target.x;
      current.y = target.y;
      trail.length = 0;
      state.present = true;
    }
    const element = event.target instanceof Element ? event.target : null;
    state.interactive = Boolean(element?.closest(INTERACTIVE));
    state.hidden = Boolean(element?.closest('[data-cursor="hidden"]'));
    wake();
  });
  window.addEventListener('pointerdown', () => {
    state.pressed = true;
    wake();
  });
  window.addEventListener('pointerup', () => {
    state.pressed = false;
    wake();
  });
  document.documentElement.addEventListener('pointerleave', () => {
    state.present = false;
    wake();
  });
  document.addEventListener('visibilitychange', wake);
}
