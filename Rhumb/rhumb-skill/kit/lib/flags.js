// International Code of Signals flags on a 24×16 field, as simple shapes.
// Colours are keys into the page palette: r red, b blue, y yellow, w white, k black.

const W = 24;
const H = 16;
const rect = (x, y, w, h, c) => ({ t: 'rect', a: { x, y, width: w, height: h }, c });
const poly = (d, c) => ({ t: 'path', a: { d }, c });
const circle = (cx, cy, r, c) => ({ t: 'circle', a: { cx, cy, r }, c });

const halfV = (a, b) => [rect(0, 0, W / 2, H, a), rect(W / 2, 0, W / 2, H, b)];
const stripesH = (cs) => cs.map((c, i) => rect(0, (H / cs.length) * i, W, H / cs.length + 0.01, c));
const stripesV = (cs) => cs.map((c, i) => rect((W / cs.length) * i, 0, W / cs.length + 0.01, H, c));
const quarters = (tl, tr, bl, br) => [rect(0, 0, 12, 8, tl), rect(12, 0, 12, 8, tr), rect(0, 8, 12, 8, bl), rect(12, 8, 12, 8, br)];
const saltire = (bg, fg) => [rect(0, 0, W, H, bg), poly('M0 0h3l21 14v2h-3L0 2z M24 0v2L3 16H0v-2L21 0z', fg)];
const cross = (bg, fg) => [rect(0, 0, W, H, bg), rect(10, 0, 4, H, fg), rect(0, 6, W, 4, fg)];

export const FLAGS = {
	A: [rect(0, 0, 12, H, 'w'), poly('M12 0h12l-6 8 6 8H12z', 'b')],
	B: [poly('M0 0h24l-6 8 6 8H0z', 'r')],
	C: stripesH(['b', 'w', 'r', 'w', 'b']),
	D: [rect(0, 0, W, 4, 'y'), rect(0, 4, W, 8, 'b'), rect(0, 12, W, 4, 'y')],
	E: [rect(0, 0, W, 8, 'b'), rect(0, 8, W, 8, 'r')],
	F: [rect(0, 0, W, H, 'w'), poly('M12 0 24 8 12 16 0 8z', 'r')],
	G: stripesV(['y', 'b', 'y', 'b', 'y', 'b']),
	H: halfV('w', 'r'),
	I: [rect(0, 0, W, H, 'y'), circle(12, 8, 4.4, 'k')],
	J: [rect(0, 0, W, 5.33, 'b'), rect(0, 5.33, W, 5.34, 'w'), rect(0, 10.67, W, 5.33, 'b')],
	K: halfV('y', 'b'),
	L: quarters('y', 'k', 'k', 'y'),
	M: saltire('b', 'w'),
	N: Array.from({ length: 16 }, (_, i) => rect((i % 4) * 6, Math.floor(i / 4) * 4, 6, 4, (i + Math.floor(i / 4)) % 2 ? 'w' : 'b')),
	O: [rect(0, 0, W, H, 'y'), poly('M0 0h24v16z', 'r')],
	P: [rect(0, 0, W, H, 'b'), rect(8, 5, 8, 6, 'w')],
	Q: [rect(0, 0, W, H, 'y')],
	R: cross('r', 'y'),
	S: [rect(0, 0, W, H, 'w'), rect(8, 5, 8, 6, 'b')],
	T: stripesV(['r', 'w', 'b']),
	U: quarters('r', 'w', 'w', 'r'),
	V: saltire('w', 'r'),
	W: [rect(0, 0, W, H, 'b'), rect(3, 3, 18, 10, 'w'), rect(8, 5.5, 8, 5, 'r')],
	X: cross('w', 'b'),
	Y: [rect(0, 0, W, H, 'y'), poly('M0 4 4 0h3L0 7z M0 11 11 0h3L0 14z M3 16 19 0h3L6 16z M10 16 24 2v3L13 16z M17 16l7-7v3l-4 4z', 'r')],
	Z: [poly('M0 0h24L12 8z', 'y'), poly('M24 0v16L12 8z', 'b'), poly('M24 16H0l12-8z', 'r'), poly('M0 16V0l12 8z', 'k')]
};
