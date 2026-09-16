// Approximate solar position (USNO low-precision formulae, good to ~1°).
// Enough to tell a visitor whether the studio's sun is high enough to print.

const RAD = Math.PI / 180;
const J2000 = 946728000000; // 2000-01-01T12:00:00Z in ms
const HORIZON = -0.833; // refraction + solar disc

export const STUDIO = { place: 'Hydra', lat: 37.349, lon: 23.466, tz: 'Europe/Athens' };

function days(date) {
  return (date.getTime() - J2000) / 86400000;
}

function ecliptic(d) {
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return ((L % 360) + 360) % 360;
}

export function sunAltitude(date, lat = STUDIO.lat, lon = STUDIO.lon) {
  const d = days(date);
  const L = ecliptic(d) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (((18.697374558 + 24.06570982441908 * d) % 24) + 24) % 24;
  const ha = ((((gmst * 15 + lon - ra) % 360) + 540) % 360) - 180;
  const phi = lat * RAD;
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(ha * RAD)) / RAD;
}

// Next time the sun rises (or sets) after `from`, scanning in two-minute steps.
export function nextCrossing(from, rising) {
  const step = 120000;
  let t = from.getTime();
  let prev = sunAltitude(new Date(t)) - HORIZON;
  for (let i = 0; i < 1080; i++) {
    const t2 = t + step;
    const cur = sunAltitude(new Date(t2)) - HORIZON;
    if (rising ? prev < 0 && cur >= 0 : prev >= 0 && cur < 0) {
      return new Date(t + (prev / (prev - cur)) * step);
    }
    t = t2;
    prev = cur;
  }
  return null;
}

// Rough open-sun exposure for a cyanotype, anchored at ~10 minutes with the sun overhead.
export function exposureMinutes(alt) {
  if (alt < 8) return null;
  return Math.round(10 / Math.pow(Math.sin(alt * RAD), 1.25));
}

const SEASONS = ['March equinox', 'June solstice', 'September equinox', 'December solstice'];

// Next equinox or solstice: the moment the sun's ecliptic longitude crosses a multiple of 90°.
export function nextSeason(from = new Date()) {
  const step = 3 * 3600000;
  let t = from.getTime();
  let q = Math.floor(ecliptic(days(from)) / 90);
  for (let i = 0; i < 1000; i++) {
    t += step;
    const nq = Math.floor(ecliptic(days(new Date(t))) / 90);
    if (nq !== q) return { name: SEASONS[nq], date: new Date(t) };
    q = nq;
  }
  return null;
}

const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: STUDIO.tz });
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', timeZone: STUDIO.tz });

export function sunReport(now = new Date()) {
  const alt = sunAltitude(now);
  const up = alt > HORIZON;
  const next = nextCrossing(now, !up);
  return {
    alt,
    up,
    time: clock.format(now),
    next: next ? clock.format(next) : '—',
    minutes: exposureMinutes(alt),
  };
}

export const formatDay = (date) => day.format(date);
