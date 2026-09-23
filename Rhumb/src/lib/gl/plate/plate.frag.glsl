#version 300 es
precision highp float;
precision highp int;

// Pass 2 of the plate, every frame: the moving parts (sky, cloud, sea, boat, gulls) are
// added to the static tone map, then everything is engraved: hatched in Delft-blue ink
// over a pale wash, on cream paper. uEnter etches the plate in from the horizon outward.

uniform vec2 uRes;
uniform vec4 uWin;       // world x0, y0, width, height
uniform float uPPW;      // device px per world unit
uniform float uTime;
uniform float uEnter;    // 0..1
uniform sampler2D uStatic;
uniform float uBoat;     // boat x in world units
uniform vec4 uRipples[6]; // x, y (world), age (s), strength

out vec4 fragColor;

#include common
#include scene

const vec3 PAPER = vec3(0.929, 0.898, 0.82);
const vec3 WASH = vec3(0.7, 0.76, 0.9);
const vec3 INK = vec3(0.106, 0.216, 0.52);
const vec3 INK_DEEP = vec3(0.075, 0.14, 0.38);

vec4 staticAt(vec2 w) {
	vec2 uv = (w - uWin.xy) / uWin.zw;
	if (uv.x < 0.0 || uv.y < 0.0 || uv.x >= 1.0 || uv.y >= 1.0) return vec4(0.0);
	return texelFetch(uStatic, ivec2(uv * uRes), 0);
}

vec4 staticTexel(ivec2 c) {
	return texelFetch(uStatic, clamp(c, ivec2(0), ivec2(uRes) - 1), 0);
}

// ---- sky ----------------------------------------------------------------------------

// Cumulus as an engraver draws them: a heap of round billows on a flat base.
const int CLOUDS = 5;
const vec4 CLOUD[5] = vec4[5](
	vec4(0.58, 0.47, 0.36, 0.13), // x, base y, width, height
	vec4(0.02, 0.425, 0.24, 0.085),
	vec4(1.08, 0.51, 0.3, 0.12),
	vec4(1.24, 0.8, 0.16, 0.06),
	vec4(1.55, 0.87, 0.13, 0.05)
);

// x: density - threshold (>0 inside), y: cloud index, z: light term, w: |gradient|
vec4 clouds(vec2 p) {
	float best = -1.0;
	vec4 outv = vec4(-1.0, -1.0, 0.0, 1.0);
	for (int k = 0; k < CLOUDS; k++) {
		vec4 c = CLOUD[k];
		float fk = float(k);
		float drift = uTime * (0.0012 + 0.0004 * fk);
		float cx = mod(c.x + drift + 0.3, 2.2) - 0.3;
		if (abs(p.x - cx) > c.z * 0.72 || p.y < c.y - 0.004 || p.y > c.y + c.w * 1.3) continue;
		float D = 0.0;
		vec2 G = vec2(0.0);
		// three courses of billows: a broad base, a shoulder, a crown
		for (int j = 0; j < 15; j++) {
			float fj = float(j);
			int row = j < 7 ? 0 : (j < 12 ? 1 : 2);
			float n = row == 0 ? 7.0 : (row == 1 ? 5.0 : 3.0);
			float i = row == 0 ? fj : (row == 1 ? fj - 7.0 : fj - 12.0);
			float u = i / (n - 1.0) - 0.5;
			float spread = row == 0 ? 0.86 : (row == 1 ? 0.56 : 0.28);
			float ry = row == 0 ? 0.24 : (row == 1 ? 0.5 : 0.74);
			float hr = hash11(fj * 7.3 + fk * 31.0);
			float hr2 = hash11(fj * 3.1 + fk * 17.0);
			vec2 pc = vec2(cx + u * c.z * spread + (hr - 0.5) * c.z * 0.06, c.y + c.w * ry * (0.9 + 0.2 * hr2) * (1.0 - 0.5 * u * u));
			float r = c.w * (row == 2 ? 0.3 : 0.33) * (0.8 + 0.4 * hr2) * (1.0 - 0.8 * u * u);
			// a flat-topped falloff keeps each billow distinct, so the heap scallops
			vec2 d = p - pc;
			float q = dot(d, d) / (r * r);
			float f = exp(-q * q);
			D += f;
			G += -4.0 * q * d / (r * r) * f;
		}
		// billowy edges and a flat, slightly ragged base
		D += 0.18 * (fbm2(p * vec2(95.0, 120.0) + fk * 7.0) - 0.5);
		D *= smoothstep(c.y - 0.002, c.y + 0.012, p.y + 0.004 * (vnoise(vec2(p.x * 80.0, fk)) - 0.5));
		float v = D - 0.55;
		if (v > best) {
			best = v;
			vec2 nrm = -normalize(G + 1e-6);
			outv = vec4(v, fk, dot(nrm, normalize(vec2(-0.55, 0.85))), length(G));
		}
	}
	return outv;
}

// ---- boat -----------------------------------------------------------------------------

// A small gaff-rigged sloop. Returns tone (<0: not the boat) and writes hatch angle.
float boat(vec2 p, out float ang) {
	ang = 0.0;
	float bob = sin(uTime * 1.3) * 0.0009;
	vec2 b = vec2(uBoat, HORIZON - 0.034 + bob);
	vec2 q = p - b;
	if (abs(q.x) > 0.04 || q.y < -0.008 || q.y > 0.072) return -1.0;
	float roll = sin(uTime * 0.9) * 0.02;
	q = mat2(cos(roll), -sin(roll), sin(roll), cos(roll)) * q;
	float tone = -1.0;
	// hull: sheer line, rounded bow to the right, transom to the left
	if (q.y > -0.0055 && q.y < 0.0035) {
		float t = (q.y + 0.0055) / 0.009;
		float hw = mix(0.02, 0.031, t);
		float off = mix(0.004, 0.0, t);
		if (abs(q.x - off) < hw) {
			tone = q.y > 0.0012 ? 0.12 : 0.78; // the strake catches the light
			ang = 0.0;
		}
	}
	// mast
	if (abs(q.x - 0.003) < 0.0007 && q.y > 0.0 && q.y < 0.066) {
		tone = 0.9;
		ang = PI * 0.5;
	}
	// mainsail: luff on the mast, gaff peaked up, foot along the boom
	if (sdTri(q, vec2(0.0025, 0.007), vec2(0.0025, 0.058), vec2(-0.027, 0.009)) < 0.0 ||
		sdTri(q, vec2(0.0025, 0.058), vec2(-0.024, 0.052), vec2(-0.027, 0.009)) < 0.0) {
		float u = clamp((0.0025 - q.x) / 0.03, 0.0, 1.0);
		tone = 0.03 + 0.26 * smoothstep(0.55, 1.0, u); // sunlit, the leech in shade
		if (abs(fract(q.y / 0.009) - 0.5) < 0.05) tone += 0.25; // seams
		ang = 0.12;
	}
	// jib to the stemhead
	if (sdTri(q, vec2(0.0045, 0.056), vec2(0.0045, 0.006), vec2(0.028, 0.005)) < 0.0) {
		tone = 0.04 + 0.3 * smoothstep(0.012, 0.026, q.x);
		ang = 2.2;
	}
	// a pennant at the masthead
	if (sdTri(q, vec2(0.003, 0.066), vec2(0.003, 0.0625), vec2(0.011 + 0.002 * sin(uTime * 6.0), 0.0645)) < 0.0) {
		tone = 0.85;
		ang = 0.0;
	}
	return tone;
}

// ---- gulls ----------------------------------------------------------------------------

float gulls(vec2 p) {
	float ink = 0.0;
	for (int i = 0; i < 5; i++) {
		float fi = float(i);
		float speed = 0.004 + 0.003 * hash11(fi * 3.7);
		vec2 c = vec2(fract(hash11(fi * 1.3) + uTime * speed * 0.35) * 1.9 - 0.15, 0.56 + 0.12 * hash11(fi * 5.1) + 0.01 * sin(uTime * 0.3 + fi));
		float s = 0.0085 + 0.004 * hash11(fi * 2.9);
		vec2 q = (p - c) / s;
		if (abs(q.x) > 1.3 || abs(q.y) > 1.3) continue;
		float flap = sin(uTime * (3.0 + fi * 0.4) + fi * 2.0);
		q.x = abs(q.x);
		// each wing: a shallow arc from the body out to the tip
		float yCurve = (0.55 + 0.35 * flap) * q.x * (1.0 - q.x * 0.7) - 0.25 * flap * q.x * q.x;
		float d = abs(q.y - yCurve) * s;
		if (q.x < 1.15 && d < 0.00095 * (1.2 - q.x * 0.6)) ink = 1.0;
	}
	return ink;
}

// ---- engraving ------------------------------------------------------------------------

// One set of engraved lines given their phase (in line units) and position along them.
float lines(float ph, float along, float tone, float sp, float seed) {
	float id = floor(ph);
	float d = abs(fract(ph) - 0.5) * sp;
	// each line swells and thins along its length, as a burin does
	float swell = 0.78 + 0.44 * vnoise(vec2(along * 0.045 + hash11(id + seed * 97.0) * 211.0, seed));
	float w = tone * sp * 0.52 * swell; // half-width in px
	// box-filtered coverage; hairlines fade out rather than vanish into aliasing
	return clamp(w - d + 0.5, 0.0, 1.0) * smoothstep(0.02, 0.4, w);
}

// Parallel hatching at angle `ang`, `sp` px apart, swelling with tone. Returns coverage.
float hatch(vec2 P, float tone, float ang, float sp, float seed) {
	if (tone < 0.02) return 0.0;
	vec2 dir = vec2(cos(ang), sin(ang));
	vec2 nrm = vec2(-dir.y, dir.x);
	float along = dot(P, dir);
	float wob = (vnoise(vec2(along * 0.018, seed)) - 0.5) * 0.9;
	return lines((dot(P, nrm) + wob) / sp, along, tone, sp, seed);
}

void main() {
	vec2 frag = gl_FragCoord.xy;
	vec2 uv = frag / uRes;
	vec2 p = uWin.xy + uv * uWin.zw;
	vec2 P = p * uPPW; // device px, pinned to the world
	float pxw = 1.0 / uPPW;
	ivec2 ic = ivec2(frag);

	float tone = 0.0;
	float ang = 0.0;
	float mat = M_NONE;
	float sp = 2.8;
	float wash = 0.0;
	float outline = 0.0;
	bool water = false;
	float waterPh = 0.0;

	vec4 st = texelFetch(uStatic, ic, 0);

	if (st.a > 0.5) {
		tone = st.r;
		ang = st.g * PI;
		mat = floor(st.b * 10.0 + 0.5);
		// contours wherever the material changes
		vec4 a = staticTexel(ic + ivec2(1, 0));
		vec4 b = staticTexel(ic + ivec2(0, 1));
		vec4 c = staticTexel(ic - ivec2(1, 0));
		vec4 d = staticTexel(ic - ivec2(0, 1));
		float matEdge = step(0.05, abs(a.b - st.b) + abs(b.b - st.b) + abs(c.b - st.b) + abs(d.b - st.b));
		float skyEdge = step(0.5, 4.0 - a.a - b.a - c.a - d.a);
		outline = max(matEdge, skyEdge);
		if (mat == M_FAR) outline = skyEdge * 0.6;
		if (mat == M_TOWN) outline = 0.0;
		sp = mat == M_FAR ? 2.9 : mat == M_HILL ? 2.3 : mat == M_CLIFF ? 3.0 : mat == M_ROCK ? 2.6 : mat == M_LEAF ? 2.1 : 2.2;
		wash = mat == M_FAR ? 0.75 : mat == M_HILL ? 0.6 : 0.45;
	} else if (p.y >= HORIZON) {
		// ---- sky: blank paper overhead, fine ruled lines gathering toward the horizon
		float y = p.y;
		tone = 0.13 * smoothstep(0.62, HORIZON + 0.01, y);
		ang = 0.0;
		sp = 3.0;
		wash = 0.5 * smoothstep(0.8, HORIZON, y);
		vec2 ds = p - SUN;
		float r = length(ds);
		tone *= 1.0 - 0.85 * exp(-r / 0.1);
		wash *= 1.0 - 0.7 * exp(-r / 0.13);

		vec4 cl = clouds(p);
		if (cl.x > 0.0) {
			vec4 c = CLOUD[int(cl.y)];
			float shade = 0.5 - 0.5 * cl.z; // 0 facing the sun, 1 turned away
			float under = smoothstep(c.y + c.w * 0.3, c.y, y); // heavy, flat undersides
			float core = smoothstep(0.0, 0.5, cl.x);
			tone = (0.36 * pow(shade, 1.4) + 0.22 * under) * (0.45 + 0.55 * core);
			// shading lines curve with the billows rather than ruling straight across
			ang = mix(0.06, atan(cl.z, 1.0) * 0.6, 0.5);
			sp = 2.3;
			wash = 0.2 + 0.35 * max(shade, under);
			mat = 10.0;
			// a second, broken contour inside suggests the billows
			float inner = abs(cl.x - 0.32) / max(cl.w, 1e-3) * uPPW;
			if (inner < 0.9 && shade > 0.35 && vnoise(p * 500.0 + cl.y) > 0.45) outline = 0.5;
		}
		// the silhouette of every cloud, drawn as a lightly broken line (distance to the
		// iso-line from the analytic gradient: no derivatives inside this branch)
		float edgePx = abs(cl.x) / max(cl.w, 1e-3) * uPPW;
		if (cl.y >= 0.0 && cl.x > -0.3 && edgePx < 1.0 && vnoise(p * 700.0 + cl.y) > 0.2) outline = max(outline, 0.8);

		// sunburst: fine rays fanning from the sun through the clear sky near it
		if (mat != 10.0 && r > 0.03 && y < 0.66) {
			float a = atan(ds.y, ds.x);
			float rays = 64.0;
			float k = a / TAU * rays;
			float rid = floor(k + 0.5);
			float len = 0.08 + 0.1 * hash11(rid * 1.7) + (mod(rid, 2.0) < 0.5 ? 0.08 : 0.0);
			float dpx = abs(k - rid) * (TAU * r * uPPW / rays);
			float w = 0.42 * smoothstep(len, len * 0.3, r) * smoothstep(0.03, 0.045, r);
			if (w > 0.02 && dpx < w + 0.5) outline = max(outline, clamp(w - dpx + 0.5, 0.0, 1.0) * 0.8);
		}
		// the disc itself
		if (r < 0.022) {
			tone = 0.0;
			wash = 0.0;
			outline = abs(r - 0.022) < pxw * 1.1 ? 1.0 : 0.0;
		}
	} else {
		// ---- sea
		water = true;
		float mirror = headWater(p.x);
		float L = max(HORIZON - uWin.y, 0.05);
		float depth = clamp((HORIZON - p.y) / L, 0.0, 1.0);
		tone = 0.11 + 0.3 * pow(depth, 1.1);
		ang = 0.0;
		// lines crowd together toward the horizon; spacing grows linearly with depth, so
		// the phase is its integral (keeps the lines evenly engraved at every depth)
		float sa = 1.9;
		float sb = 1.4;
		sp = sa + sb * depth;
		waterPh = -(uPPW * L / sb) * log(sa + sb * depth);
		wash = 0.5 + 0.25 * depth;

		// swell: the ruled lines rise and fall
		float t = uTime;
		float swell = 0.0;
		swell += sin(p.x * 60.0 + t * 0.7 + 2.0 * vnoise(p * vec2(8.0, 30.0))) * 0.55;
		swell += sin(p.x * 150.0 - t * 1.1 + p.y * 40.0) * 0.25;
		swell *= mix(0.4, 1.6, depth);

		// ripples from clicks
		for (int i = 0; i < 6; i++) {
			vec4 rp = uRipples[i];
			if (rp.w <= 0.0) continue;
			vec2 dv = (p - rp.xy) * vec2(1.0, 3.2); // foreshortened rings
			float dd = length(dv);
			float front = rp.z * 0.055;
			float ring = exp(-pow((dd - front) / 0.012, 2.0)) * rp.w * exp(-rp.z * 0.7);
			swell += sin((dd - front) * 520.0) * ring * 2.2;
			tone += ring * 0.15;
		}
		waterPh += swell / sp;

		// reflections of whatever stands on the water here
		float wob = sin(p.y * 380.0 + t * 1.6) * 0.0022 * (0.3 + depth) + (vnoise(vec2(p.x * 40.0, p.y * 120.0 + t * 0.5)) - 0.5) * 0.004;
		vec2 rp = vec2(p.x + wob, 2.0 * mirror - p.y);
		vec4 refl = staticAt(rp);
		if (refl.a > 0.5) {
			float fade = exp(-(mirror - p.y) / 0.11);
			float rt = refl.r * 0.75 + 0.16;
			tone = mix(tone, rt, 0.75 * fade);
			wash = max(wash, 0.6);
		}
		// the boat's reflection
		float bang;
		float bt = boat(vec2(p.x + wob * 0.6, 2.0 * (HORIZON - 0.039) - p.y), bang);
		if (bt >= 0.0) tone = mix(tone, bt * 0.8 + 0.15, 0.7);
		// sky glow on the far water
		tone *= 1.0 - 0.35 * exp(-(HORIZON - p.y) / 0.02);
		// sun path: a column of broken glitter under the sun
		float glit = exp(-pow((p.x - SUN.x + 0.02 * sin(p.y * 90.0)) / (0.02 + 0.1 * depth), 2.0)) * smoothstep(HORIZON + 0.005, HORIZON - 0.3, p.y);
		float line = floor(waterPh);
		float sparkle = step(0.6, vnoise(vec2(p.x * 700.0, line + floor(t * 3.0))));
		tone *= 1.0 - glit * (0.55 + 0.45 * sparkle);

		// the lines break into dashes, as a burin skips over water
		float dash = vnoise(vec2(p.x * uPPW * 0.02 + hash11(line) * 97.0, line * 0.37));
		tone *= smoothstep(0.1, 0.4, dash + 0.22 * depth);
		// the horizon: a single ruled line
		if (abs(p.y - HORIZON) < pxw * 0.8) outline = 0.9;
	}

	// boat and gulls sit over everything
	float bAng;
	float bTone = boat(p, bAng);
	if (bTone >= 0.0) {
		tone = bTone;
		ang = bAng;
		sp = 1.8;
		wash = 0.2;
		water = false;
		mat = M_STONE;
	}
	float gull = gulls(p);

	// ---- engrave
	float ink;
	if (water) {
		ink = lines(waterPh, P.x, tone, sp, 5.0);
	} else {
		ink = hatch(P, tone, ang, sp, mat);
		if (tone > 0.5) ink = max(ink, hatch(P, (tone - 0.5) * 1.6, ang + 1.15, sp * 1.08, mat + 3.0));
		if (tone > 0.78) ink = max(ink, hatch(P, (tone - 0.78) * 3.0, ang - 0.7, sp * 1.1, mat + 7.0));
	}
	// rock is cut in short broken strokes rather than long rules
	if (mat == M_CLIFF && tone < 0.6) ink *= step(0.22, vnoise(vec2(dot(P, vec2(cos(ang), sin(ang))) * 0.09, floor(P.x / sp) * 3.7)));
	// aquatint: a fine stochastic grain carrying the midtones of land and foliage only
	bool grainy = mat == M_HILL || mat == M_LEAF || mat == M_ROCK || mat == M_CLIFF;
	float grain = grainy ? step(hash21(frag + 13.0), tone * tone * 0.3) : 0.0;
	ink = max(ink, grain * 0.8);
	ink = max(ink, outline);
	ink = max(ink, gull);

	// ---- etch in: from the horizon outward, as the plate is inked
	float front = uEnter * 1.35 - (abs(p.y - HORIZON) * 1.25 + 0.3 * fbm2(p * 9.0));
	float vis = smoothstep(0.0, 0.1, front);
	ink *= vis;
	wash *= smoothstep(0.05, 0.35, front);

	// ---- paper, wash and ink
	float fiber = vnoise(frag * vec2(0.9, 0.08)) * 0.5 + vnoise(frag * 0.35) * 0.5;
	vec3 paper = PAPER * (0.975 + 0.035 * fiber);
	// the paper darkens a little toward the edges of the plate
	vec2 e = uv * (1.0 - uv);
	paper *= 0.94 + 0.06 * smoothstep(0.0, 0.06, min(e.x, e.y) * 4.0);
	vec3 col = mix(paper, paper * WASH, clamp(wash * (0.25 + 0.5 * tone), 0.0, 0.62));
	vec3 inkCol = mix(INK, INK_DEEP, smoothstep(0.5, 0.95, tone));
	col = mix(col, inkCol, ink * (0.86 + 0.14 * vnoise(frag * 0.5)));

	fragColor = vec4(col, 1.0);
}
