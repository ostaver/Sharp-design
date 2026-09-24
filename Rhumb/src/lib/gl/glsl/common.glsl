// ---- shared helpers: hashing, dither matrices, noise ----------------------------

#define PI 3.14159265359
#define TAU 6.28318530718

uint pcg(uint v) {
	uint s = v * 747796405u + 2891336453u;
	uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u;
	return (w >> 22u) ^ w;
}

// Stable white noise per integer cell, in [0, 1).
float hash21(vec2 p) {
	uvec2 q = uvec2(ivec2(floor(p)) + 65536);
	return float(pcg(q.x + pcg(q.y))) * (1.0 / 4294967296.0);
}

float hash11(float p) {
	return float(pcg(uint(int(floor(p)) + 65536))) * (1.0 / 4294967296.0);
}

vec2 hash22(vec2 p) {
	uvec2 q = uvec2(ivec2(floor(p)) + 65536);
	uint a = pcg(q.x + pcg(q.y));
	uint b = pcg(a ^ 0x9E3779B9u);
	return vec2(float(a), float(b)) * (1.0 / 4294967296.0);
}

// Ordered dither: classic Bayer matrices, built recursively. Values in [0, 1).
float bayer2(vec2 a) {
	a = floor(a);
	return fract(dot(a, vec2(0.5, a.y * 0.75)));
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// Smooth value noise.
float vnoise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	float a = hash21(i);
	float b = hash21(i + vec2(1.0, 0.0));
	float c = hash21(i + vec2(0.0, 1.0));
	float d = hash21(i + vec2(1.0, 1.0));
	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm2(vec2 p) {
	float v = 0.0;
	float a = 0.5;
	mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
	for (int i = 0; i < 5; i++) {
		v += a * vnoise(p);
		p = r * p * 2.03 + 17.1;
		a *= 0.5;
	}
	return v;
}

// 3D simplex noise (Gustavson / Ashima Arts, MIT).
vec3 _m289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 _m289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 _perm(vec4 x) { return _m289(((x * 34.0) + 10.0) * x); }
vec4 _tis(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
	const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy;
	vec3 x3 = x0 - D.yyy;
	i = _m289(i);
	vec4 p = _perm(_perm(_perm(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
	float n_ = 0.142857142857;
	vec3 ns = n_ * D.wyz - D.xzx;
	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);
	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);
	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);
	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));
	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);
	vec4 norm = _tis(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;
	vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm3(vec3 p) {
	float v = 0.0;
	float a = 0.5;
	for (int i = 0; i < 4; i++) {
		v += a * snoise(p);
		p = p * 2.07 + vec3(11.3, 5.1, 7.7);
		a *= 0.5;
	}
	return v;
}

mat3 rotY(float a) {
	float c = cos(a), s = sin(a);
	return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}
mat3 rotX(float a) {
	float c = cos(a), s = sin(a);
	return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}
mat3 rotZ(float a) {
	float c = cos(a), s = sin(a);
	return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
}
