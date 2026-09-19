/* Tiny WebAudio synth for cabinet sounds. No assets, all square/triangle blips. */

let ctx: AudioContext | null = null;
let enabled = true;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

export function isSoundEnabled() {
  return enabled;
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType = "square",
  gain = 0.05,
  when = 0,
  slideTo?: number,
  pan = 0
) {
  if (!enabled) return;
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  if (pan !== 0 && typeof a.createStereoPanner === "function") {
    const p = a.createStereoPanner();
    p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t0);
    osc.connect(g).connect(p).connect(a.destination);
  } else {
    osc.connect(g).connect(a.destination);
  }

  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  coin() {
    tone(988, 0.09, "square", 0.06);
    tone(1319, 0.32, "square", 0.06, 0.09);
  },
  clunk() {
    tone(140, 0.12, "triangle", 0.12, 0, 60);
  },
  power() {
    tone(60, 0.7, "sawtooth", 0.05, 0, 220);
    tone(1760, 0.05, "square", 0.03, 0.62);
    tone(2637, 0.09, "square", 0.03, 0.7);
  },
  select() {
    tone(660, 0.06, "square", 0.04);
    tone(880, 0.08, "square", 0.04, 0.06);
  },
  move() {
    tone(440, 0.04, "square", 0.025);
  },
  brick() {
    tone(1200 + Math.random() * 500, 0.05, "square", 0.04);
  },
  paddle() {
    tone(320, 0.06, "triangle", 0.07);
  },
  wall() {
    tone(220, 0.05, "triangle", 0.05);
  },
  lose() {
    tone(392, 0.14, "square", 0.05);
    tone(311, 0.14, "square", 0.05, 0.14);
    tone(233, 0.3, "square", 0.05, 0.28);
  },
  win() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "square", 0.05, i * 0.09));
  },
  gust() {
    tone(90, 0.5, "sawtooth", 0.045, 0, 45);
  },
  /* typewriter return: thock + bell */
  ding() {
    tone(587, 0.03, "triangle", 0.035);
    tone(1720, 0.09, "square", 0.022, 0.015);
  },
  /* rubber stamp hitting paper */
  stamp() {
    tone(110, 0.14, "triangle", 0.16, 0, 52);
    tone(54, 0.22, "triangle", 0.1, 0.02, 38);
  },
  /* coin door refuses your slug */
  reject() {
    tone(150, 0.12, "sawtooth", 0.07, 0, 95);
    tone(96, 0.22, "sawtooth", 0.07, 0.13, 60);
  },
  /* a cabinet waking up — tube hum at its own pitch, panned where it stands */
  ignite(idx: number, pan = 0) {
    const base = 52 + idx * 7;
    tone(base, 0.65, "triangle", 0.05, 0, base * 2, pan);
    tone(1560, 0.04, "square", 0.022, 0.03, undefined, pan);
  },
  /* power pellet swallowed */
  pellet() {
    [392, 494, 587, 784].forEach((f, i) => tone(f, 0.09, "square", 0.05, i * 0.07));
  },
};
