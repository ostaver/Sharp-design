// ---- the plate: shared scene geometry ---------------------------------------------
// World units: x 0..1.6 across the design frame, y 0..1 bottom to top. The sky runs on
// above y = 1 and the sea below y = 0, so any aspect ratio can be framed.

#define HORIZON 0.36
#define SUN vec2(0.22, 0.448)

// Material ids (stored as id / 10 in the tone map's blue channel).
#define M_NONE 0.0
#define M_FAR 1.0
#define M_HILL 2.0
#define M_TOWN 3.0
#define M_CLIFF 4.0
#define M_STONE 5.0
#define M_ROOF 6.0
#define M_LEAF 7.0
#define M_ROCK 8.0
#define M_DOME 9.0

float sdBox(vec2 p, vec2 c, vec2 h) {
	vec2 d = abs(p - c) - h;
	return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// Door- and window-shaped: a box with a round head. b = centre of the sill.
float sdArch(vec2 p, vec2 b, float hw, float h) {
	float box = sdBox(p, b + vec2(0.0, (h - hw) * 0.5), vec2(hw, (h - hw) * 0.5));
	float head = length(p - (b + vec2(0.0, h - hw))) - hw;
	return min(box, head);
}

float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
	vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
	vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
	vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
	vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
	vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
	float s = sign(e0.x * e2.y - e0.y * e2.x);
	vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)), vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))), vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
	return -sqrt(d.x) * sign(d.y);
}

// Ridge line of the far range: one tall peak, a long shoulder west, a knuckle east.
float farRidge(float x) {
	float h = 0.168 * exp(-pow(abs(x - 0.74) / 0.25, 1.25));
	h += 0.06 * exp(-pow(abs(x - 0.36) / 0.2, 1.6));
	h += 0.045 * exp(-pow(abs(x - 1.02) / 0.1, 1.8));
	h += 0.02 * exp(-pow(abs(x - 0.12) / 0.14, 2.0));
	h += 0.011 * (fbm2(vec2(x * 16.0, 3.1)) - 0.5) + 0.004 * (vnoise(vec2(x * 90.0, 1.7)) - 0.5);
	return HORIZON + h * smoothstep(0.02, 0.2, x + 0.1);
}

// The low coast under the mountains, where the town sits.
float coastRidge(float x) {
	float h = 0.022 + 0.018 * exp(-pow(abs(x - 0.86) / 0.18, 2.0)) + 0.012 * fbm2(vec2(x * 24.0, 8.2));
	return HORIZON + h * smoothstep(0.5, 0.64, x) * (1.0 - smoothstep(1.12, 1.2, x));
}

// A second, fainter range far behind, showing only where the near one is low.
float farthestRidge(float x) {
	float h = 0.1 * exp(-pow(abs(x - 0.18) / 0.3, 1.6)) + 0.075 * exp(-pow(abs(x - 1.2) / 0.22, 1.8));
	h += 0.008 * (fbm2(vec2(x * 11.0, 6.3)) - 0.5);
	return HORIZON + h;
}

// Top of the headland and its sea-facing cliff.
float headTop(float x) {
	float t = smoothstep(0.985, 1.1, x);
	float h = mix(HORIZON + 0.01, 0.486, t);
	h += 0.006 * sin(x * 70.0) * t + 0.004 * fbm2(vec2(x * 40.0, 2.0));
	return h;
}
float cliffEdge(float y) {
	// x of the cliff face at height y: it leans back slightly and is broken by ledges
	return 0.992 + (y - HORIZON) * 0.3 + 0.016 * (fbm2(vec2(y * 55.0, 4.0)) - 0.5);
}
// Where the headland meets the sea, coming toward us on the right.
float headWater(float x) {
	return HORIZON - max(x - 0.99, 0.0) * 0.21;
}
