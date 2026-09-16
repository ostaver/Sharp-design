// The studio keeps time by the sun: a line and a tiny arc of the day in the nav, a sentence in
// the footer and a small chart of today's solar altitude over Hydra (single series, so no
// legend; hover and arrow keys read any time of day; an off-screen table carries the values).
import { STUDIO, formatDay, nextSeason, sunAltitude, sunReport } from '../lib/sun.js';
import { clamp } from '../lib/rng.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 320;
const H = 120;
const TOP = 18;
const BASE = 100;
const MIN = -40;
const MAX = 80;
const X = (minute) => (minute / 1440) * W;
const Y = (alt) => BASE - ((alt - MIN) / (MAX - MIN)) * (BASE - TOP);
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: STUDIO.tz });

function node(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  parent?.appendChild(el);
  return el;
}

// The instant the studio's day began: midnight on Hydra.
function studioMidnight(now) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: STUDIO.tz,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
  return new Date(now.getTime() - ((get('hour') * 60 + get('minute')) * 60 + get('second')) * 1000 - now.getMilliseconds());
}

// Today on Hydra, sampled every ten minutes.
function today(now) {
  const midnight = studioMidnight(now);
  const at = (minute) => new Date(midnight.getTime() + minute * 60000);
  const samples = [];
  for (let m = 0; m <= 1440; m += 10) samples.push({ m, alt: sunAltitude(at(m)) });
  return { at, samples, nowMinute: (now - midnight) / 60000, nowAlt: sunAltitude(now) };
}

// The nav's version: today's arc above the horizon, and the sun where it stands now.
function renderGlyph(svg, day) {
  const gx = (m) => 1 + (m / 1440) * 26;
  const gy = (alt) => 12 - (Math.max(alt, 0) / 80) * 11;
  svg.replaceChildren();
  node('line', { class: 'sun-path__horizon', x1: 0, x2: 28, y1: 12.5, y2: 12.5 }, svg);
  const up = day.samples.filter((s) => s.alt > 0);
  if (up.length > 1) {
    node('path', { class: 'sun-path__arc', d: up.map((s, i) => `${i ? 'L' : 'M'}${gx(s.m).toFixed(1)} ${gy(s.alt).toFixed(1)}`).join(' ') }, svg);
  }
  node('circle', { class: 'sun-path__sun', cx: gx(day.nowMinute).toFixed(1), cy: (day.nowAlt > 0 ? gy(day.nowAlt) : 12.5).toFixed(1), r: 1.9 }, svg);
}

function renderChart(svg, table, day) {
  const { at, samples, nowMinute, nowAlt } = day;
  const d = samples.map((s, i) => `${i ? 'L' : 'M'}${X(s.m).toFixed(1)} ${Y(s.alt).toFixed(1)}`).join(' ');

  svg.replaceChildren();
  const clip = node('clipPath', { id: 'sun-above' }, node('defs', {}, svg));
  node('rect', { x: 0, y: 0, width: W, height: Y(0) }, clip);
  node('line', { class: 'sunchart__axis', x1: 0, x2: W, y1: Y(0), y2: Y(0) }, svg);
  node('path', { class: 'sunchart__night', d }, svg);
  node('path', { class: 'sunchart__day', d, 'clip-path': 'url(#sun-above)' }, svg);
  for (const h of [0, 6, 12, 18, 24]) {
    const anchor = h === 0 ? 'start' : h === 24 ? 'end' : 'middle';
    node('text', { class: 'sunchart__tick', x: X(h * 60), y: H - 2, 'text-anchor': anchor }, svg).textContent = String(h).padStart(2, '0');
  }
  // under the line at noon, where neither the night curve nor the NOW label can reach it
  const horizon = node('text', { class: 'sunchart__tick', x: W / 2, y: Y(0) + 14, 'text-anchor': 'middle' }, svg);
  horizon.textContent = 'HORIZON';

  node('circle', { class: 'sunchart__now', cx: X(nowMinute), cy: Y(nowAlt), r: 4.5 }, svg);
  const nowLabel = node('text', { class: 'sunchart__time', x: X(nowMinute), y: Y(nowAlt) - 11, 'text-anchor': 'middle' }, svg);
  nowLabel.textContent = 'NOW';

  const cross = node('g', { visibility: 'hidden' }, svg);
  const line = node('line', { class: 'sunchart__cross', y1: TOP - 4, y2: BASE }, cross);
  const label = node('text', { y: 8 }, cross);
  const value = node('tspan', { class: 'sunchart__value' }, label);
  const time = node('tspan', { class: 'sunchart__time', dx: 6 }, label);

  const show = (minute) => {
    const s = samples[Math.round(clamp(minute, 0, 1440) / 10)];
    const x = X(s.m);
    const flip = x > W - 90;
    line.setAttribute('x1', x);
    line.setAttribute('x2', x);
    label.setAttribute('x', flip ? x - 6 : x + 6);
    label.setAttribute('text-anchor', flip ? 'end' : 'start');
    value.textContent = `${Math.round(s.alt)}°`;
    time.textContent = clock.format(at(s.m));
    cross.setAttribute('visibility', 'visible');
    nowLabel.setAttribute('visibility', 'hidden');
  };
  const hide = () => {
    cross.setAttribute('visibility', 'hidden');
    nowLabel.setAttribute('visibility', 'visible');
  };

  let cursor = nowMinute;
  svg.onpointermove = (e) => {
    const r = svg.getBoundingClientRect();
    show(((e.clientX - r.left) / r.width) * 1440);
  };
  svg.onpointerleave = hide;
  svg.onfocus = () => show((cursor = nowMinute));
  svg.onblur = hide;
  svg.onkeydown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    cursor = clamp(cursor + (e.key === 'ArrowRight' ? 30 : -30), 0, 1440);
    show(cursor);
  };

  const peak = samples.reduce((a, b) => (b.alt > a.alt ? b : a));
  const rise = samples.find((s, i) => i && samples[i - 1].alt < 0 && s.alt >= 0);
  const set = samples.find((s, i) => i && samples[i - 1].alt >= 0 && s.alt < 0);
  const fmt = (s) => (s ? clock.format(at(s.m)) : '—');
  svg.setAttribute(
    'aria-label',
    `The sun's height over Hydra today: it rises about ${fmt(rise)}, stands highest at ${Math.round(peak.alt)}° around ${fmt(peak)} and sets about ${fmt(set)}. Use the arrow keys to read other times.`,
  );

  table.replaceChildren();
  table.createCaption().textContent = "The sun's height over Hydra today, hour by hour";
  const head = table.createTHead().insertRow();
  for (const title of ['Time on Hydra', 'Altitude']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = title;
    head.appendChild(th);
  }
  const body = table.createTBody();
  for (let hour = 0; hour < 24; hour++) {
    const s = samples[hour * 6];
    const row = body.insertRow();
    row.insertCell().textContent = clock.format(at(s.m));
    row.insertCell().textContent = `${Math.round(s.alt)}°`;
  }
}

export function initSunclock() {
  const shorts = document.querySelectorAll('[data-sun-short]');
  const glyphs = document.querySelectorAll('.sun-path');
  const sentence = document.querySelector('[data-sunclock]');
  const svg = document.querySelector('[data-sunchart]');
  const season = document.querySelector('[data-season]');

  let table = null;
  if (svg) {
    svg.setAttribute('tabindex', '0');
    table = document.createElement('table');
    table.className = 'sr-only';
    svg.after(table);
  }

  const update = () => {
    const now = new Date();
    const r = sunReport(now);
    const alt = Math.round(r.alt);
    const day = today(now);
    shorts.forEach((el) => (el.textContent = r.up ? `${alt}° over Hydra` : 'Night on Hydra'));
    glyphs.forEach((el) => {
      renderGlyph(el, day);
      el.classList.toggle('is-down', !r.up);
    });
    if (sentence) {
      if (r.up && r.minutes) {
        sentence.textContent = `It is ${r.time} on Hydra. The sun stands ${alt}° above the harbour — a sheet laid out now would need about ${r.minutes} minutes.`;
      } else if (r.up) {
        sentence.textContent = `It is ${r.time} on Hydra. The sun is only ${Math.max(alt, 0)}° up, too low to print by. It sets at ${r.next}.`;
      } else {
        sentence.textContent = `It is ${r.time} on Hydra. The sun is down and the paper rests. First light at ${r.next}.`;
      }
    }
    if (svg) renderChart(svg, table, day);
  };

  update();
  setInterval(update, 60000);

  const next = nextSeason(new Date());
  if (next && season) season.textContent = `${next.name}, ${formatDay(next.date)}`;
}
