import { gsap } from '../core/gsap.js';

const FOLLOW = { duration: 0.7, ease: 'power3.out' };
const GAP = 4; // px between the pointer and the label / hint boxes

/**
 * Pointer-following crosshair. Every part is centred inside `area` by CSS (flex centring), so
 * positions are transform offsets from the area centre. The parts trail the pointer smoothly;
 * the numeric readout follows it exactly.
 *
 *  - horizontal / vertical: full-width / full-height guide lines
 *  - plus: marker that sits on the pointer
 *  - label: box whose top-right corner hangs off the pointer (holds the coordinates)
 *  - hint: box whose top-left corner hangs off the pointer
 */
export function createCrosshair({ area, horizontal, vertical, plus, label, hint, readoutX, readoutY }) {
  const quick = (el, prop) => (el ? gsap.quickTo(el, prop, FOLLOW) : null);
  const follow = {
    horizontal: quick(horizontal, 'y'),
    vertical: quick(vertical, 'x'),
    plusX: quick(plus, 'x'),
    plusY: quick(plus, 'y'),
    labelX: quick(label, 'x'),
    labelY: quick(label, 'y'),
    hintX: quick(hint, 'x'),
    hintY: quick(hint, 'y'),
  };

  /** Pointer position inside `area`, clamped to its bounds. */
  function local(clientX, clientY) {
    const rect = area.getBoundingClientRect();
    return {
      x: gsap.utils.clamp(0, rect.width, clientX - rect.left),
      y: gsap.utils.clamp(0, rect.height, clientY - rect.top),
    };
  }

  /** Moves the parts to the pointer; `jump` skips the trailing motion (first placement). */
  function move(clientX, clientY, { jump = false } = {}) {
    const { x, y } = local(clientX, clientY);
    const dx = x - area.clientWidth / 2;
    const dy = y - area.clientHeight / 2;
    const targets = [
      [horizontal, 'y', follow.horizontal, dy],
      [vertical, 'x', follow.vertical, dx],
      [plus, 'x', follow.plusX, dx],
      [plus, 'y', follow.plusY, dy],
      [label, 'x', follow.labelX, label && dx - GAP - label.offsetWidth / 2],
      [label, 'y', follow.labelY, label && dy + GAP + label.offsetHeight / 2],
      [hint, 'x', follow.hintX, hint && dx + GAP + hint.offsetWidth / 2],
      [hint, 'y', follow.hintY, hint && dy + GAP + hint.offsetHeight / 2],
    ];
    targets.forEach(([el, prop, setter, value]) => {
      if (!el) return;
      if (jump) gsap.set(el, { [prop]: value });
      else setter(value);
    });
    if (readoutX) readoutX.textContent = Math.round(x);
    if (readoutY) readoutY.textContent = Math.round(y);
  }

  return { local, move };
}
