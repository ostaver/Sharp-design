#version 300 es
precision highp float;
precision highp int;

// Pass 1 of the plate, drawn once per resize: everything on the plate that never moves,
// written as a tone map (r = tone 0..1 of ink, g = hatch angle / PI, b = material / 10,
// a = coverage). Pass 2 engraves it.

uniform vec2 uRes;
uniform vec4 uWin; // world x0, y0, width, height of the canvas

out vec4 fragColor;

#include common
#include scene

struct Surf {
	float tone;
	float ang;
	float mat;
	float cov;
};

void put(inout Surf s, bool inside, float tone, float ang, float mat) {
	if (inside) {
		s.tone = clamp(tone, 0.0, 1.0);
		s.ang = ang;
		s.mat = mat;
		s.cov = 1.0;
	}
}

// ---- landforms --------------------------------------------------------------------

void farRange(inout Surf s, vec2 p) {
	if (p.y < HORIZON) return;
	// the farthest hills: barely there, a wash and a contour
	if (p.y < farthestRidge(p.x)) put(s, true, 0.05 + 0.04 * smoothstep(HORIZON, HORIZON + 0.08, p.y), 0.0, M_FAR);

	float top = farRidge(p.x);
	if (p.y > top) return;
	// Shade by a smoothed slope so whole faces read as lit or turned away, with spurs
	// and gullies as broad soft modulation rather than stripes.
	float e = 0.02;
	float sl = (farRidge(p.x + e) - farRidge(p.x - e)) / (2.0 * e);
	float lit = clamp(0.5 + sl * 1.8, 0.0, 1.0);
	float fall = p.x + (top - p.y) * (sl > 0.0 ? -0.7 : 0.7);
	float spur = fbm2(vec2(fall * 26.0, p.y * 6.0));
	float tone = mix(0.34, 0.07, lit) + 0.16 * (spur - 0.5) + 0.05;
	// haze: the foot of the range fades into the morning air
	tone *= mix(0.3, 1.0, smoothstep(HORIZON, HORIZON + 0.11, p.y));
	// lines follow the lie of the slope
	float ang = atan(sl * 0.8) + 0.12 * (vnoise(p * 20.0) - 0.5);
	put(s, true, max(tone, 0.03), ang, M_FAR);
}

void coast(inout Surf s, vec2 p) {
	float top = coastRidge(p.x);
	if (p.y < HORIZON || p.y > top) return;
	float n = fbm2(p * vec2(160.0, 220.0));
	float tone = 0.34 + 0.3 * n - 0.1 * smoothstep(top - 0.006, top, p.y);
	put(s, true, tone, 0.3 + 0.4 * (vnoise(p * 80.0) - 0.5), M_HILL);

	// The town: white houses along the waterfront, two rows deep.
	for (int row = 0; row < 2; row++) {
		float r = float(row);
		float cw = 0.0068 - r * 0.0012;
		float base = HORIZON + 0.0015 + r * 0.0085;
		float ci = floor(p.x / cw);
		float h = hash11(ci * 3.1 + r * 17.0);
		float along = smoothstep(0.6, 0.66, p.x) * (1.0 - smoothstep(1.06, 1.12, p.x));
		float dense = along * (0.55 + 0.4 * exp(-pow((p.x - 0.84) / 0.12, 2.0)));
		if (h > dense) continue;
		float hh = 0.005 + 0.007 * hash11(ci * 7.7 + r);
		float lx = (p.x - ci * cw) / cw; // 0..1 inside the cell
		if (lx < 0.1 || lx > 0.9 || p.y < base || p.y > base + hh + 0.0028) continue;
		float wall = p.y < base + hh ? 1.0 : 0.0;
		float tone2 = wall > 0.5 ? (lx > 0.68 ? 0.32 : 0.02) : 0.62; // lit wall, shaded side, roof
		if (wall > 0.5 && hash21(vec2(ci, floor((p.y - base) / 0.003))) < 0.18 && lx > 0.3 && lx < 0.55) tone2 = 0.7; // a window
		put(s, true, tone2, wall > 0.5 ? 0.0 : 0.5, M_TOWN);
	}
}

void headland(inout Surf s, vec2 p) {
	float top = headTop(p.x);
	float water = headWater(p.x);
	if (p.y > top || p.y < water - 0.03) return;
	float edge = cliffEdge(p.y);
	if (p.x < edge) return;

	// Limestone in vertical facets: planes turned to the sun stay almost bare paper, planes
	// turned away are hatched, and every seam between them is a dark crevice.
	float fx = p.x * 55.0 + 3.0 * fbm2(vec2(p.y * 9.0, 1.7)) + 1.2 * fbm2(vec2(p.x * 30.0, p.y * 40.0)) + 14.0 * p.y;
	float fid = floor(fx);
	float ff = fract(fx);
	float h = hash11(fid * 1.37 + 11.0);
	float tone = h < 0.58 ? 0.02 + 0.07 * h : 0.24 + 0.26 * (h - 0.58);
	// a soft turn across each facet, darker toward its right edge
	tone += 0.08 * smoothstep(0.4, 1.0, ff);
	// crevices: not every seam is open, and they come and go down the face
	float open = step(0.35, vnoise(vec2(fid * 2.1, p.y * 22.0)));
	if ((ff > 0.94 || ff < 0.025) && open > 0.5) tone = 0.72;
	// a few broken ledges
	float ly = p.y * 26.0 + 2.5 * fbm2(vec2(p.x * 14.0, 3.0));
	if (fract(ly) < 0.05 && vnoise(vec2(p.x * 38.0, floor(ly))) > 0.58) tone = 0.62;
	// the flank beyond the seaward face turns out of the sun
	tone += 0.14 * smoothstep(0.05, 0.2, p.x - edge);
	// wet, weed-dark rock just above the waterline
	tone += 0.35 * smoothstep(water + 0.03, water + 0.004, p.y);
	float ang = PI * 0.5 + 0.12 * (vnoise(p * vec2(40.0, 10.0)) - 0.5);
	put(s, true, tone, ang, M_CLIFF);

	// Holm oak and scrub along the brow of the cliff.
	float scrub = fbm2(p * vec2(80.0, 95.0));
	float brow = smoothstep(top - 0.045 - 0.03 * vnoise(vec2(p.x * 30.0, 1.0)), top - 0.012, p.y);
	float zone = brow * smoothstep(1.0, 1.05, p.x);
	if (scrub * zone > 0.3) {
		float lit = smoothstep(0.45, 0.75, fbm2(p * 300.0)) * smoothstep(0.3, 0.6, scrub * zone);
		put(s, true, 0.82 - 0.45 * lit, 2.3 + scrub, M_LEAF);
	}
}

void wall(inout Surf s, vec2 p) {
	if (p.x < 1.075) return;
	float top = headTop(p.x);
	float wt = top + 0.021 + 0.003 * step(1.3, p.x);
	if (p.y < top - 0.004 || p.y > wt) return;
	// courses and joints of dressed stone
	float course = floor((p.y - top) / 0.0042);
	float jx = fract(p.x / 0.009 + 0.5 * mod(course, 2.0));
	float joint = (fract((p.y - top) / 0.0042) < 0.14 || jx < 0.07) ? 1.0 : 0.0;
	float tone = 0.16 + 0.34 * joint + 0.1 * vnoise(p * 300.0);
	if (p.y > wt - 0.0022) tone = 0.05; // coping catches the light
	put(s, true, tone, 0.0, M_STONE);
}

// ---- architecture -------------------------------------------------------------------

// A plain block with a hipped roof: walls lit on the left, a cast shadow under the eaves.
void block(inout Surf s, vec2 p, float x0, float x1, float y0, float y1, float roofH, float winRows, float winCols) {
	float cx = (x0 + x1) * 0.5;
	float hw = (x1 - x0) * 0.5;
	// roof: a trapezoid with eaves overhanging the walls
	float eave = 0.004;
	float t = (p.y - y1) / roofH;
	float rw = mix(hw + eave, hw * 0.55, clamp(t, 0.0, 1.0));
	if (p.y >= y1 && p.y <= y1 + roofH && abs(p.x - cx) <= rw) {
		float tile = step(0.5, fract((p.y - y1) / 0.0032)) * 0.25;
		float side = smoothstep(-0.2, 0.9, (p.x - cx) / rw);
		put(s, true, 0.38 + tile + 0.25 * side, 0.55, M_ROOF);
		return;
	}
	if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) return;
	float u = (p.x - x0) / (x1 - x0);
	float tone = 0.05 + 0.3 * smoothstep(0.55, 1.0, u); // the east wall is lit, the west in shade
	tone += 0.5 * smoothstep(y1 - 0.005, y1, p.y); // shadow under the eaves
	// windows on a regular grid
	float cellW = (x1 - x0) / winCols;
	float cellH = (y1 - y0 - 0.008) / winRows;
	vec2 c = vec2((p.x - x0) / cellW, (p.y - y0 - 0.004) / cellH);
	vec2 f = fract(c);
	if (c.y > 0.0 && c.y < winRows && abs(f.x - 0.5) < 0.17 && abs(f.y - 0.5) < 0.26) tone = 0.78;
	put(s, true, tone, 0.0, M_STONE);
}

void church(inout Surf s, vec2 p) {
	// dome: drum, cupola and lantern, behind the facade
	vec2 dc = vec2(1.36, 0.645);
	vec2 dr = vec2(0.037, 0.043);
	vec2 q = (p - dc) / dr;
	if (p.y >= dc.y && dot(q, q) <= 1.0) {
		float nx = q.x;
		float rib = smoothstep(0.035, 0.0, abs(fract(asin(clamp(nx, -1.0, 1.0)) / 0.42 + 0.5) - 0.5));
		float tone = 0.18 + 0.55 * smoothstep(-0.7, 0.95, nx) + 0.25 * rib;
		tone -= 0.12 * smoothstep(0.4, 0.95, q.y); // the crown catches the sky
		float ang = -atan(nx * 0.9 * (dr.y / dr.x) * (1.0 - q.y)); // follow the curve
		put(s, true, tone, ang, M_DOME);
	}
	// lantern and its cap
	if (abs(p.x - 1.36) < 0.0075 && p.y >= 0.686 && p.y <= 0.706) {
		float tone = 0.08 + 0.4 * step(1.3615, p.x);
		if (abs(p.x - 1.36) < 0.003 && p.y > 0.691 && p.y < 0.701) tone = 0.8;
		put(s, true, tone, 0.0, M_STONE);
	}
	if (length((p - vec2(1.36, 0.706)) / vec2(0.0095, 0.009)) < 1.0 && p.y > 0.706) put(s, true, 0.35 + 0.4 * step(1.361, p.x), 0.0, M_DOME);
	if (abs(p.x - 1.36) < 0.0009 && p.y > 0.714 && p.y < 0.73) put(s, true, 0.85, PI * 0.5, M_STONE);
	if (abs(p.y - 0.7245) < 0.0009 && abs(p.x - 1.36) < 0.004) put(s, true, 0.85, 0.0, M_STONE);
	// drum with its round-headed windows
	if (abs(p.x - 1.36) < 0.034 && p.y >= 0.608 && p.y <= 0.647) {
		float u = (p.x - 1.326) / 0.068;
		float tone = 0.06 + 0.4 * smoothstep(0.5, 1.0, u);
		if (p.y > 0.642) tone = 0.4; // cornice shadow
		for (int i = 0; i < 4; i++) {
			float wx = 1.334 + float(i) * 0.0173;
			if (sdArch(p, vec2(wx, 0.617), 0.0035, 0.018) < 0.0) tone = 0.82;
		}
		put(s, true, tone, 0.0, M_STONE);
	}

	// facade: gable front of the nave
	float gable = sdTri(p, vec2(1.31, 0.592), vec2(1.41, 0.592), vec2(1.36, 0.626));
	if (gable < 0.0) {
		float tone = 0.07 + 0.28 * smoothstep(1.36, 1.41, p.x);
		if (length(p - vec2(1.36, 0.604)) < 0.0062) tone = 0.8; // oculus
		if (abs(length(p - vec2(1.36, 0.604)) - 0.0078) < 0.0011) tone = 0.5;
		put(s, true, tone, 0.0, M_STONE);
	}
	if (p.x >= 1.314 && p.x <= 1.406 && p.y >= 0.5 && p.y <= 0.592) {
		float tone = 0.05 + 0.22 * smoothstep(1.37, 1.406, p.x);
		if (abs(p.x - 1.318) < 0.004 || abs(p.x - 1.402) < 0.004) tone = 0.03; // pilasters
		if (p.y > 0.586) tone = 0.45; // entablature shadow
		if (sdArch(p, vec2(1.36, 0.5), 0.0095, 0.034) < 0.0) tone = 0.82; // door
		if (abs(sdArch(p, vec2(1.36, 0.5), 0.0095, 0.034)) < 0.0014) tone = 0.35; // its frame
		if (sdArch(p, vec2(1.333, 0.55), 0.0045, 0.022) < 0.0 || sdArch(p, vec2(1.387, 0.55), 0.0045, 0.022) < 0.0) tone = 0.78;
		put(s, true, tone, 0.0, M_STONE);
	}
}

void campanile(inout Surf s, vec2 p) {
	float cx = 1.4635;
	float hw = 0.0235;
	// spire and finial
	if (sdTri(p, vec2(cx - 0.017, 0.712), vec2(cx + 0.017, 0.712), vec2(cx, 0.752)) < 0.0) {
		float tone = 0.3 + 0.45 * step(cx, p.x);
		put(s, true, tone, p.x < cx ? 1.1 : 2.0, M_ROOF);
	}
	if (abs(p.x - cx) < 0.0009 && p.y > 0.75 && p.y < 0.766) put(s, true, 0.85, PI * 0.5, M_STONE);
	if (abs(p.y - 0.761) < 0.0009 && abs(p.x - cx) < 0.0042) put(s, true, 0.85, 0.0, M_STONE);
	// lantern stage
	if (abs(p.x - cx) < 0.016 && p.y >= 0.692 && p.y <= 0.712) {
		float tone = 0.06 + 0.42 * step(cx + 0.004, p.x);
		if (sdArch(p, vec2(cx - 0.006, 0.696), 0.0035, 0.013) < 0.0 || sdArch(p, vec2(cx + 0.006, 0.696), 0.0035, 0.013) < 0.0) tone = 0.8;
		put(s, true, tone, 0.0, M_STONE);
	}
	if (p.x < cx - hw || p.x > cx + hw || p.y < 0.5 || p.y > 0.692) return;
	float u = (p.x - (cx - hw)) / (2.0 * hw);
	float tone = 0.05 + 0.32 * smoothstep(0.55, 1.0, u);
	// cornices between the stages
	float cy = p.y;
	if (abs(cy - 0.6) < 0.0022 || abs(cy - 0.645) < 0.0022 || cy > 0.687) tone = 0.42;
	if (abs(cy - 0.6035) < 0.0012 || abs(cy - 0.6485) < 0.0012) tone = 0.02;
	// belfry: paired round-headed openings
	if (sdArch(p, vec2(cx - 0.009, 0.652), 0.0058, 0.03) < 0.0 || sdArch(p, vec2(cx + 0.009, 0.652), 0.0058, 0.03) < 0.0) tone = 0.86;
	// a bell in the left opening
	if (length((p - vec2(cx - 0.009, 0.673)) / vec2(0.0036, 0.0045)) < 1.0 && p.y < 0.676) tone = 0.35;
	// middle stage: a single slit, and the clock face
	if (sdArch(p, vec2(cx, 0.61), 0.003, 0.018) < 0.0) tone = 0.8;
	if (length(p - vec2(cx, 0.585)) < 0.0075) tone = 0.08;
	if (abs(length(p - vec2(cx, 0.585)) - 0.0075) < 0.0011) tone = 0.55;
	if (length(p - vec2(cx, 0.585)) < 0.0075 && (abs(p.x - cx) < 0.0007 && p.y > 0.585 && p.y < 0.5905)) tone = 0.8;
	if (length(p - vec2(cx, 0.585)) < 0.0075 && (abs(p.y - 0.585) < 0.0007 && p.x > cx && p.x < cx + 0.0045)) tone = 0.8;
	put(s, true, tone, 0.0, M_STONE);
}

// ---- vegetation ---------------------------------------------------------------------

void cypress(inout Surf s, vec2 p, float cx, float y0, float y1, float w0) {
	if (p.y < y0 || p.y > y1) return;
	float t = (p.y - y0) / (y1 - y0);
	float w = w0 * pow(1.0 - t, 0.62) * (0.8 + 0.35 * sin(t * 3.0 + 0.4));
	w += w0 * 0.22 * (vnoise(vec2(p.y * 240.0, cx * 9.0)) - 0.5);
	float dx = p.x - cx;
	if (abs(dx) > w) return;
	float lit = smoothstep(0.1, -1.0, dx / max(w, 1e-4));
	float tuft = vnoise(vec2(p.x * 500.0, p.y * 260.0));
	float tone = 0.86 - 0.42 * lit * tuft;
	put(s, true, tone, PI * 0.5 + 0.35 * (tuft - 0.5), M_LEAF);
}

// Round-headed trees: clumps of foliage along the top of the headland.
void grove(inout Surf s, vec2 p) {
	if (p.x < 1.0 || p.y > 0.6 || p.y < 0.43) return;
	for (int i = 0; i < 16; i++) {
		float fi = float(i);
		float x = 1.02 + fi * 0.037 + 0.012 * hash11(fi * 5.3);
		float base = headTop(x) + 0.004;
		// keep the church and tower clear
		if (x > 1.3 && x < 1.5) base -= 0.012;
		float r = 0.013 + 0.011 * hash11(fi * 9.1);
		vec2 c = vec2(x, base + r * 0.55);
		vec2 d = (p - c) / vec2(r * 1.25, r);
		float edge = 1.0 + 0.28 * (fbm2(p * 260.0 + fi * 13.0) - 0.5);
		if (dot(d, d) > edge * edge || p.y < base - 0.004) continue;
		float lit = clamp(0.55 - d.x * 0.45 + d.y * 0.5, 0.0, 1.0);
		float leaf = fbm2(p * 520.0 + fi);
		float tone = 0.8 - 0.5 * lit * smoothstep(0.35, 0.75, leaf);
		put(s, true, tone, 0.6 + 1.6 * leaf, M_LEAF);
	}
}

// ---- rocks --------------------------------------------------------------------------

void rocks(inout Surf s, vec2 p) {
	float water = headWater(p.x);
	// boulders heaped along the foot of the headland, and a few standing out to sea
	float zone = smoothstep(0.93, 1.0, p.x) * smoothstep(water + 0.05, water + 0.005, p.y);
	float stones = 0.0;
	stones += exp(-pow(length((p - vec2(0.905, HORIZON - 0.012)) / vec2(0.018, 0.009)), 2.0));
	stones += exp(-pow(length((p - vec2(0.948, HORIZON - 0.018)) / vec2(0.012, 0.007)), 2.0));
	stones += exp(-pow(length((p - vec2(0.866, HORIZON - 0.006)) / vec2(0.008, 0.004)), 2.0));
	float n = fbm2(p * vec2(38.0, 48.0));
	float field = zone * (0.45 + 0.9 * n) + stones * (0.8 + 0.4 * n);
	float waterAt = p.x < 0.99 ? HORIZON - 0.022 : water - 0.02;
	if (field < 0.62 || p.y < waterAt) return;
	// facet shading from the noise gradient: lit toward the upper left
	float e = 0.002;
	vec2 g = vec2(fbm2((p + vec2(e, 0.0)) * vec2(38.0, 48.0)) - n, fbm2((p + vec2(0.0, e)) * vec2(38.0, 48.0)) - n) / e;
	float lit = clamp(0.5 + dot(normalize(g + 1e-5), normalize(vec2(-0.6, 0.8))) * 0.5, 0.0, 1.0);
	float tone = mix(0.8, 0.14, lit);
	tone += 0.2 * smoothstep(waterAt + 0.012, waterAt, p.y); // wet at the waterline
	put(s, true, tone, atan(g.y, g.x) + PI * 0.5, M_ROCK);
}

void agave(inout Surf s, vec2 p) {
	// sword-leaved agave at the bottom-right corner of the plate
	vec2 b = vec2(1.575, 0.1);
	for (int i = 0; i < 9; i++) {
		float fi = float(i);
		float a = mix(1.95, 0.55, fi / 8.0) + 0.08 * sin(fi * 7.1);
		float len = 0.07 + 0.05 * hash11(fi * 3.3);
		vec2 dir = vec2(cos(a), sin(a));
		vec2 rel = p - b;
		float along = dot(rel, dir);
		float across = abs(dot(rel, vec2(-dir.y, dir.x)));
		float w = 0.0065 * (1.0 - along / len);
		if (along > 0.0 && along < len && across < w) {
			float tone = 0.3 + 0.5 * step(0.0, dot(rel, vec2(-dir.y, dir.x)));
			put(s, true, tone, a, M_LEAF);
		}
	}
}

void main() {
	vec2 uv = gl_FragCoord.xy / uRes;
	vec2 p = uWin.xy + uv * uWin.zw;

	Surf s = Surf(0.0, 0.0, M_NONE, 0.0);
	farRange(s, p);
	coast(s, p);
	headland(s, p);
	wall(s, p);
	block(s, p, 1.1, 1.145, 0.5, 0.531, 0.014, 1.0, 2.0);
	block(s, p, 1.15, 1.308, 0.5, 0.566, 0.022, 2.0, 8.0);
	block(s, p, 1.495, 1.62, 0.5, 0.556, 0.018, 2.0, 4.0);
	church(s, p);
	cypress(s, p, 1.302, 0.5, 0.588, 0.0075);
	campanile(s, p);
	cypress(s, p, 1.425, 0.5, 0.612, 0.0085);
	cypress(s, p, 1.048, 0.47, 0.618, 0.0105);
	cypress(s, p, 1.079, 0.472, 0.598, 0.0095);
	grove(s, p);
	rocks(s, p);
	agave(s, p);

	float ang = mod(s.ang, PI) / PI;
	fragColor = vec4(s.tone, ang, s.mat / 10.0, s.cov);
}
