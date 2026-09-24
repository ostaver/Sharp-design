#version 300 es
precision highp float;
precision highp int;

// The night sky. Rendered into a small buffer (one texel per dither "pixel") and
// scaled up with nearest-neighbour filtering, so every mark is a hard square.
// All positions below are CSS pixels, y up, origin at the bottom-left of the viewport.

uniform vec2 uRes;        // buffer size in texels
uniform vec2 uView;       // viewport size in CSS px
uniform float uScale;     // CSS px per texel
uniform float uTime;
uniform float uIntro;     // 0..1, the planet boots in

uniform vec3 uPlanet;     // hero planet: center.xy, radius
uniform float uPlanetOn;  // 0..1
uniform float uDive;      // 0..1, the camera falls through the limb
uniform float uSpin;

uniform vec3 uGlobe;      // bearing globe: center.xy, radius
uniform float uGlobeOn;   // 0..1
uniform float uGlobeSpin;
uniform float uShip;      // 0..1 progress of the ship along the rhumb line

uniform vec2 uPole;       // celestial pole for the star trails
uniform float uTrailsOn;  // 0..1
uniform float uTrailSpan; // radians the sky has turned

uniform float uStarsOn;   // 0..1
uniform float uDawn;      // 0..1
uniform float uPaper;     // 0..1, the dither resolves into paper

uniform vec4 uTrail[16];  // pointer trail: xy (CSS px), age (s), speed (px/s)
uniform vec2 uTrailDir[16];
uniform vec3 uMouse;      // xy, presence 0..1

out vec4 fragColor;

#include common

// ---- palette -------------------------------------------------------------------

const vec3 BG = vec3(0.0196, 0.0196, 0.0275);
const vec3 GRAIN = vec3(0.066, 0.066, 0.086);
const vec3 WHITE = vec3(0.925, 0.937, 1.0);
const vec3 PAPER = vec3(0.929, 0.898, 0.82);
const vec3 PAPER_GRAIN = vec3(0.897, 0.866, 0.79); // matches the grain on the engraved plate

const vec3 PINK[6] = vec3[6](
	vec3(0.0196, 0.0196, 0.0275),
	vec3(0.2, 0.035, 0.157),
	vec3(0.51, 0.106, 0.4),
	vec3(0.855, 0.25, 0.62),
	vec3(0.95, 0.37, 0.74),
	vec3(1.0, 0.56, 0.85)
);

const vec3 RIM[5] = vec3[5](
	vec3(0.957, 0.373, 0.765),
	vec3(0.745, 0.498, 0.941),
	vec3(0.561, 0.608, 1.0),
	vec3(0.753, 0.8, 1.0),
	vec3(0.953, 0.961, 1.0)
);

const vec3 DAWN[8] = vec3[8](
	vec3(0.0196, 0.0196, 0.0275),
	vec3(0.075, 0.047, 0.157),
	vec3(0.227, 0.063, 0.29),
	vec3(0.514, 0.122, 0.388),
	vec3(0.831, 0.278, 0.435),
	vec3(0.98, 0.506, 0.431),
	vec3(1.0, 0.765, 0.565),
	vec3(0.98, 0.902, 0.769)
);

vec3 rampPink(float t, float th) {
	t = clamp(t, 0.0, 1.0) * 5.0;
	float i = floor(t);
	i = min(i + step(th, t - i), 5.0);
	return PINK[int(i)];
}

vec3 rampRim(float t, float th) {
	t = clamp(t, 0.0, 1.0) * 4.0;
	float i = floor(t);
	i = min(i + step(th, t - i), 4.0);
	return RIM[int(i)];
}

vec3 rampDawn(float t, float th) {
	t = clamp(t, 0.0, 1.0) * 7.0;
	float i = floor(t);
	i = min(i + step(th, t - i), 7.0);
	return DAWN[int(i)];
}

// ---- pointer wake --------------------------------------------------------------
// Sum of the recent pointer positions: how stirred this spot is, and which way.

vec3 wake(vec2 P) {
	vec2 push = vec2(0.0);
	float e = 0.0;
	for (int i = 0; i < 16; i++) {
		vec4 t = uTrail[i];
		float age = t.z;
		if (age > 1.6) continue;
		float r = 34.0 + age * 70.0;
		vec2 d = P - t.xy;
		float f = exp(-dot(d, d) / (r * r)) * (1.0 - age / 1.6);
		float s = clamp(t.w / 900.0, 0.0, 1.0);
		e += f * s;
		push += uTrailDir[i] * f * s;
	}
	return vec3(push, e);
}

// ---- hero planet -----------------------------------------------------------------

// Returns rgb + coverage (a = 1 when this texel is drawn by the planet or its dust).
vec4 planet(vec2 P, vec2 cell, float th, vec3 wk) {
	vec2 C = uPlanet.xy;
	float R = uPlanet.z;
	vec2 q = (P - C) / R;
	float r = length(q);

	// Boot-in: pixels switch on at random, the limb before the interior.
	float boot = uIntro * 1.35 - hash21(cell + 311.0) * 0.35;

	if (r < 1.0) {
		float z = sqrt(max(1.0 - r * r, 0.0));
		vec3 n = vec3(q, z);
		vec3 m = rotY(uSpin) * rotX(-0.35) * n;
		float depth = (1.0 - r) * R; // CSS px inside the limb

		float fres = 1.0 - z;
		// Faint weather bands drifting across the disc; they only nudge the dither.
		float bands = snoise(m * vec3(1.6, 6.5, 1.6) + vec3(0.0, uTime * 0.015, 0.0));
		float I = pow(fres, 1.05) * (0.96 + 0.1 * bands);
		// the far side of the disc falls into shadow toward the bottom right
		I *= mix(1.0, 0.5, smoothstep(-0.2, 1.0, (q.x + q.y * 0.5) * 0.6 + 0.4));
		I += wk.z * 0.4 * exp(-depth / 220.0);

		// Diving: the atmosphere swallows the view, then the night side closes in.
		I = mix(I, 0.62 + 0.18 * bands, smoothstep(0.3, 0.62, uDive) * (1.0 - smoothstep(0.66, 0.96, uDive)));
		I *= 1.0 - smoothstep(0.74, 1.0, uDive);

		// Two-tone stochastic dither, like a halftone pulled too dry: pink on black,
		// with a little plum in the gaps and hot pink where the light is strongest.
		float h2 = hash21(cell + 57.0);
		float late = smoothstep(0.62, 0.95, uDive);
		vec3 col = h2 < (0.3 * I + 0.08) * (1.0 - late) ? PINK[1] : BG;
		if (th < I * 0.92) {
			col = PINK[3];
			if (h2 < 0.45 * smoothstep(0.55, 1.0, I)) col = PINK[4];
			if (h2 > 1.0 - 0.5 * smoothstep(0.55, 0.2, I)) col = PINK[2];
			if (h2 < 0.12 * smoothstep(0.8, 1.0, I)) col = PINK[5];
		}

		// Rim: a periwinkle band, white at the very edge, with a faint scanline beat.
		float rimW = 8.5 + 9.0 * uDive;
		float rim = exp(-depth / rimW);
		float scan = 0.78 + 0.22 * step(0.5, fract(cell.y * 0.5));
		float rimT = rim * scan;
		if (rimT > th * 0.75 + 0.1) col = rampRim(rimT * 1.08, fract(th * 7.13));
		if (depth < uScale * 1.2) col = RIM[3 + int(step(0.5, fract(th * 3.7)))];

		float on = step(0.5, boot + (1.0 - fres) * -0.25 + 0.25);
		// Falling through the atmosphere: bright streaks race up past the camera.
		float rush = smoothstep(0.18, 0.4, uDive) * (1.0 - smoothstep(0.62, 0.85, uDive));
		if (rush > 0.0) {
			float colH = hash11(cell.x * 1.7 + 3.0);
			if (colH < 0.07 * rush) {
				float len = 6.0 + 22.0 * hash11(cell.x * 5.3);
				float speed = 40.0 + 70.0 * hash11(cell.x * 9.1);
				float head = mod(uTime * speed + uDive * 900.0 + hash11(cell.x) * 400.0, uRes.y + len * 2.0) - len;
				float t = cell.y - head;
				// bright at the leading (top) end, breaking up along the tail
				if (t > 0.0 && t < len) col = t > len * 0.75 ? RIM[4] : (hash21(cell + 3.0) < t / len ? RIM[3] : col);
			}
		}

		// Once the night side has closed in, its empty texels let the stars through.
		if (col == BG && late > hash21(cell + 211.0)) on = 0.0;
		return vec4(col, on);
	}

	// ---- outside: dust streaming off the atmosphere
	float h = (r - 1.0) * R;
	float ang = atan(q.y, q.x);

	vec2 disp = wk.xy * 26.0;
	float hs = h - dot(disp, q / max(r, 1e-4));
	float streak = vnoise(vec2(ang * R / 16.0 + disp.x * 0.05, hs / 46.0 - uTime * 0.22));
	float clump = vnoise(vec2(ang * R / 90.0, hs / 140.0 - uTime * 0.05));

	float dens = 0.7 * exp(-hs / 15.0) + 0.18 * exp(-hs / 60.0) + 0.03 * exp(-hs / 200.0);
	dens *= smoothstep(0.1, 0.9, streak * 0.7 + clump * 0.6);
	dens += wk.z * 0.45 * exp(-h / 240.0);
	dens *= clamp(boot * 1.2 - h / 900.0, 0.0, 1.0);
	dens *= 1.0 - smoothstep(0.5, 0.9, uDive);

	// A thin glow hugging the outside of the limb.
	float halo = exp(-h / 3.2);
	if (halo > th * 0.9 + 0.08 && boot > 0.3) return vec4(rampRim(0.45 + halo * 0.55, th), 1.0);

	// Twinkle: one texel in eight re-rolls its threshold a few times a second.
	float tw = hash21(cell + 17.0) < 0.12 ? hash21(cell + floor(uTime * 3.0 + hash21(cell) * 9.0) * 7.3) : th;
	if (tw < dens) {
		vec3 c = WHITE;
		if (h < 26.0 && hash21(cell + 5.0) < 0.35) c = rampPink(0.86, 0.5);
		if (wk.z > 0.1 && hash21(cell + 9.0) < wk.z) c = RIM[2];
		return vec4(c * (0.72 + 0.28 * hash21(cell + 3.0)), 1.0);
	}
	return vec4(0.0);
}

// ---- bearing globe ---------------------------------------------------------------

vec4 globe(vec2 P, vec2 cell, float th, vec3 wk) {
	vec2 G = uGlobe.xy;
	float R = uGlobe.z;
	vec2 q = (P - G) / R;
	float r = length(q);
	float appear = uGlobeOn * 1.3 - hash21(cell + 71.0) * 0.3;
	if (appear < 0.5) return vec4(0.0);

	if (r >= 1.0) {
		float h = (r - 1.0) * R;
		float halo = exp(-h / 2.0);
		if (halo > th + 0.08) return vec4(rampRim(0.5 + halo * 0.4, th), 1.0);
		float dens = 0.22 * exp(-h / 14.0) + 0.05 * exp(-h / 70.0);
		if (hash21(cell + 13.0) < dens) return vec4(WHITE * 0.8, 1.0);
		return vec4(0.0);
	}

	float z = sqrt(1.0 - r * r);
	vec3 n = vec3(q, z);
	// Earth-like tilt, spinning slowly.
	mat3 M = rotY(uGlobeSpin) * rotX(0.38) * rotZ(-0.2);
	vec3 m = M * n;

	vec3 L = normalize(vec3(-0.62, 0.42, 0.66));
	float diff = max(dot(n, L), 0.0);
	float fres = 1.0 - z;
	float land = smoothstep(0.02, 0.12, fbm3(m * 1.7 + 4.0));
	float I = diff * (0.48 + 0.36 * land) + pow(fres, 2.0) * 0.55;
	I += wk.z * 0.25;
	vec3 col = rampPink(I * 0.95, th);

	// Chart lines: graticule every 30 degrees, drawn as broken dotted lines.
	float lat = asin(clamp(m.y, -1.0, 1.0));
	float lon = atan(m.x, m.z);
	float px = uScale / R; // one texel in sphere units, roughly
	float gLat = abs(fract(lat / (PI / 6.0) + 0.5) - 0.5) * (PI / 6.0);
	float gLon = abs(fract(lon / (PI / 6.0) + 0.5) - 0.5) * (PI / 6.0) * cos(lat);
	float grid = min(gLat, gLon) / max(z, 0.25);
	if (grid < px * 0.7 && hash21(cell + 29.0) < 0.55) col = mix(col, RIM[2], 0.85);

	// Rhumb lines at 047 degrees: a faint family of parallels, and our course.
	float B = radians(47.0);
	float merc = atanh(clamp(sin(lat), -0.9999, 0.9999));
	float tb = tan(B);
	float dLon = lon - tb * merc;
	float latS = mix(-1.15, 1.15, uShip);
	for (int k = 0; k < 6; k++) {
		float off = float(k) * TAU / 6.0;
		float d = abs(mod(dLon - off + PI, TAU) - PI) * cos(lat) * cos(B);
		float lw = (k == 0 ? 1.25 : 0.8) * px / max(z, 0.35);
		if (d < lw) {
			float s = lat / cos(B);
			if (k == 0) {
				// sailed: solid; ahead: marching dashes
				float dash = fract(s * 14.0 - uTime * 0.6);
				if (lat < latS || dash < 0.55) col = lat < latS ? WHITE : RIM[3];
			} else if (fract(s * 22.0) < 0.35) {
				col = mix(col, RIM[2], 0.8);
			}
		}
	}

	// The ship: a bright mark riding our line from south to north.
	float lonS = tb * atanh(sin(latS));
	vec3 s = vec3(cos(latS) * sin(lonS), sin(latS), cos(latS) * cos(lonS));
	vec3 sv = transpose(M) * s; // back to view space
	if (sv.z > 0.0) {
		vec2 sp = G + sv.xy * R;
		float ds = length(P - sp);
		if (ds < uScale * 1.6) col = WHITE;
		else if (abs(ds - uScale * 5.0) < uScale * 0.7 && hash21(cell + 3.0) < 0.8) col = RIM[3];
	}

	return vec4(col, 1.0);
}

// ---- star trails -------------------------------------------------------------------

vec3 trails(vec2 P, vec2 cell, float th) {
	vec2 d = P - uPole;
	float rad = length(d);
	float a = atan(d.y, d.x);
	float ring = uScale * 2.0;
	float k = floor(rad / ring);
	vec3 col = vec3(0.0);
	for (int j = 0; j < 2; j++) {
		vec2 key = vec2(k, float(j) * 17.0);
		float h0 = hash21(key + 1.0);
		if (h0 > 0.2) continue;
		float rs = (k + 0.5) * ring;
		if (abs(rad - rs) > uScale * 0.55) continue;
		float a0 = hash21(key + 2.0) * TAU;
		// the sky turns clockwise around the pole
		float span = uTrailSpan * (0.92 + 0.16 * hash21(key + 5.0));
		float t = mod(a0 - a, TAU);
		if (t > span) continue;
		// Most stars are faint (a dotted arc); a few are bright enough to draw a solid line.
		float b = 0.12 + 0.88 * pow(hash21(key + 3.0), 3.2);
		float head = smoothstep(uScale * 3.0 / max(rs, 1.0), 0.0, t) * 0.6;
		float v = b * (0.6 + 0.4 * t / max(span, 1e-3)) + head;
		if (th < v) col = max(col, (hash21(key + 4.0) < 0.18 ? RIM[3] : WHITE) * (0.45 + 0.4 * b));
	}
	return col;
}

// ---- main ------------------------------------------------------------------------

void main() {
	vec2 cell = floor(gl_FragCoord.xy);
	vec2 P = (cell + 0.5) * uScale;
	float th = hash21(cell);

	vec3 col = BG;
	if (hash21(cell + 91.7) < 0.075) col = GRAIN;

	vec3 wk = uMouse.z > 0.0 ? wake(P) : vec3(0.0);
	float night = 1.0 - smoothstep(0.1, 0.8, uDawn);

	// Stars: sparse, a few twinkling, a faint band of the Milky Way across the page.
	if (uStarsOn > 0.001) {
		float s = hash21(cell * 1.0 + 7.1);
		vec2 bandP = P / uView.y;
		float band = exp(-pow((bandP.y - bandP.x * 0.42 - 0.2) * 3.2, 2.0)) * (0.4 + 0.6 * vnoise(bandP * 7.0));
		float dens = (0.0016 + 0.0045 * band) * uStarsOn * night;
		if (s < dens) {
			float b = hash21(cell + 2.3);
			float tw = 0.65 + 0.35 * sin(uTime * (0.8 + 2.4 * b) + b * 40.0);
			col = mix(col, WHITE, (0.45 + 0.55 * b) * tw);
		}
		// a meteor every so often
		float slot = floor(uTime / 9.0);
		float mt = fract(uTime / 9.0) * 9.0;
		if (mt < 0.8 && hash11(slot * 3.1) < 0.7) {
			vec2 m0 = vec2(hash11(slot) * 0.8 + 0.3, 0.6 + 0.35 * hash11(slot + 1.0)) * uView;
			vec2 dir = normalize(vec2(-1.0, -0.42));
			vec2 head = m0 + dir * mt * 520.0;
			vec2 rel = P - head;
			float along = dot(rel, -dir);
			float across = abs(dot(rel, vec2(-dir.y, dir.x)));
			if (along > 0.0 && along < 110.0 && across < uScale * 0.6 && th > along / 110.0)
				col = WHITE * uStarsOn * night;
		}
	}

	if (uTrailsOn > 0.001) {
		vec3 t = trails(P, cell, th);
		if (dot(t, t) > 0.0 && hash21(cell + 55.0) < uTrailsOn * night) col = t;
	}

	if (uGlobeOn > 0.001) {
		vec4 g = globe(P, cell, th, wk);
		if (g.a > 0.5) col = g.rgb;
	}

	if (uPlanetOn > 0.001) {
		vec4 p = planet(P, cell, th, wk);
		if (p.a > 0.5 && hash21(cell + 131.0) < uPlanetOn * 1.02) col = p.rgb;
	}

	// Dawn climbs from the bottom edge in ordered-dither bands.
	if (uDawn > 0.001) {
		float y = P.y / uView.y;
		float reach = mix(0.05, 1.25, uDawn);
		float g = clamp(1.0 - y / reach, 0.0, 1.0);
		g = pow(g, 1.35) * mix(0.55, 1.0, uDawn);
		float bt = bayer8(cell);
		if (g > 0.02) {
			vec3 dc = rampDawn(g, bt);
			if (g * 7.0 > bt * 0.999) col = dc;
		}
	}

	// Landfall: the dither resolves into paper, sweeping up from the bottom.
	if (uPaper > 0.001) {
		float y = P.y / uView.y;
		float front = uPaper * 1.5 - 0.25;
		float v = (front - y) * 3.0 + 0.5;
		if (bayer8(cell) < v) col = hash21(cell + 17.0) < 0.035 ? PAPER_GRAIN : PAPER;
	}

	fragColor = vec4(col, 1.0);
}
