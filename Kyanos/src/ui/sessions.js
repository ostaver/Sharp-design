// Folio IV. Each session shows its seats as the long table they are around: four chairs a
// side, filled where someone has already booked. Each row is also a strip of paper with the
// session's plant laid on it; hovering or focusing the row exposes it (see .session__strip).
import { drawStrip } from '../specimens/compose.js';

const ORDER = [0, 4, 1, 5, 2, 6, 3, 7]; // a table fills up across from itself

function seatTables() {
  for (const el of document.querySelectorAll('.session__seats[data-free]')) {
    const taken = new Set(ORDER.slice(0, 8 - Number(el.dataset.free)));
    const table = document.createElement('span');
    table.className = 'seats';
    table.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 8; i++) {
      if (i === 4) table.append(document.createElement('b'));
      const chair = document.createElement('i');
      if (taken.has(i)) chair.className = 'is-taken';
      table.append(chair);
    }
    el.prepend(table);
  }
}

function strips() {
  const rows = [...document.querySelectorAll('.session[data-specimen]')];
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    for (const row of rows) {
      const link = row.querySelector('a');
      const { width, height } = link.getBoundingClientRect();
      if (!width || !height) continue;
      let canvas = link.querySelector('.session__strip');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'session__strip';
        canvas.setAttribute('aria-hidden', 'true');
        link.prepend(canvas);
      }
      const strip = drawStrip(row.dataset.specimen, Number(row.dataset.seed) || 1, Math.round(width * dpr), Math.round(height * dpr));
      canvas.width = strip.width;
      canvas.height = strip.height;
      canvas.getContext('2d').drawImage(strip, 0, 0);
    }
  };
  draw();
  let timer = 0;
  let last = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === last) return; // mobile chrome changes height, not the rows
    last = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(draw, 200);
  });
}

export function initSessions() {
  seatTables();
  strips();
}
