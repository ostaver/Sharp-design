// A ship's bell and a little sea, synthesised with Web Audio. Silent until the visitor
// switches sound on (that click is also the gesture browsers require).

let ctx = null;
let master = null;
let enabled = false;
let sea = null;

function boot() {
	if (ctx) return;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return;
	ctx = new AC();
	const comp = ctx.createDynamicsCompressor();
	comp.threshold.value = -18;
	comp.ratio.value = 3;
	master = ctx.createGain();
	master.gain.value = 0;
	master.connect(comp).connect(ctx.destination);
}

export function setSound(on) {
	enabled = on;
	if (on) boot();
	if (!ctx) return;
	if (on) ctx.resume();
	master.gain.setTargetAtTime(on ? 0.55 : 0, ctx.currentTime, 0.08);
}

// Partials of a small bronze bell: ratio to the strike tone, level, decay (s).
const PARTIALS = [
	[0.5, 0.3, 2.8],
	[1.0, 1.0, 2.2],
	[1.183, 0.55, 1.7],
	[1.506, 0.34, 1.3],
	[2.0, 0.42, 1.1],
	[2.514, 0.2, 0.8],
	[2.662, 0.16, 0.7],
	[3.011, 0.12, 0.5],
	[4.166, 0.08, 0.35],
	[5.433, 0.05, 0.25]
];

function ding(t, vel, f0) {
	const out = ctx.createGain();
	out.gain.value = 0.11 * vel;
	out.connect(master);
	for (const [r, a, d] of PARTIALS) {
		const o = ctx.createOscillator();
		o.type = 'sine';
		o.frequency.value = f0 * r * (1 + (Math.random() - 0.5) * 0.003);
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, t);
		g.gain.linearRampToValueAtTime(a, t + 0.003);
		g.gain.exponentialRampToValueAtTime(0.0001, t + d);
		o.connect(g).connect(out);
		o.start(t);
		o.stop(t + d + 0.05);
	}
	// the clapper: a very short, bright click
	const n = ctx.createBufferSource();
	const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
	const ch = buf.getChannelData(0);
	for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 3);
	n.buffer = buf;
	const hp = ctx.createBiquadFilter();
	hp.type = 'highpass';
	hp.frequency.value = 3000;
	const ng = ctx.createGain();
	ng.gain.value = 0.05 * vel;
	n.connect(hp).connect(ng).connect(master);
	n.start(t);
}

/** Strike `count` bells the way a watch is kept: in pairs, a breath between pairs. */
export function strike(count = 2) {
	if (!enabled || !ctx) return;
	let t = ctx.currentTime + 0.03;
	for (let i = 0; i < count; i++) {
		ding(t, i % 2 ? 0.86 : 1, 1245);
		t += i % 2 === 0 ? 0.3 : 0.85;
	}
}

/** A quiet surf under the footer: filtered noise breathing on a slow swell. */
export function setSea(level) {
	if (!ctx) return;
	if (!sea) {
		const len = ctx.sampleRate * 4;
		const buf = ctx.createBuffer(1, len, ctx.sampleRate);
		const ch = buf.getChannelData(0);
		let b0 = 0,
			b1 = 0,
			b2 = 0;
		for (let i = 0; i < len; i++) {
			const w = Math.random() * 2 - 1;
			b0 = 0.99765 * b0 + w * 0.099;
			b1 = 0.963 * b1 + w * 0.2965;
			b2 = 0.57 * b2 + w * 1.0527;
			ch[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12;
		}
		const src = ctx.createBufferSource();
		src.buffer = buf;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.value = 700;
		const swell = ctx.createGain();
		swell.gain.value = 0.5;
		const lfo = ctx.createOscillator();
		lfo.frequency.value = 0.11;
		const lfoGain = ctx.createGain();
		lfoGain.gain.value = 0.35;
		lfo.connect(lfoGain).connect(swell.gain);
		const lfo2 = ctx.createOscillator();
		lfo2.frequency.value = 0.07;
		const lfo2Gain = ctx.createGain();
		lfo2Gain.gain.value = 380;
		lfo2.connect(lfo2Gain).connect(lp.frequency);
		const gain = ctx.createGain();
		gain.gain.value = 0;
		src.connect(lp).connect(swell).connect(gain).connect(master);
		src.start();
		lfo.start();
		lfo2.start();
		sea = { gain };
	}
	sea.gain.gain.setTargetAtTime(level * 0.5, ctx.currentTime, 0.6);
}
