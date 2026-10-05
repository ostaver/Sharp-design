/* ==========================================================================
   Pellucid — liquid glass renderer
   Vanilla port of the Originkit "Glass Icon" raymarcher, extended with:
   · SDF shape morphing (torus ⇄ sphere ⇄ cross ⇄ glint)
   · a plate pass with a soft shadow + spectral caustic under the object
   · thin-film iridescence on the fresnel rim
   · drag inertia, pause-when-offscreen, one-shot snapshots
   ========================================================================== */
(function (global) {
  "use strict";

  const BEVEL = 0.025;
  const CORE_REFRACT = 1.0;
  const IOR = 1.5;
  const THICKNESS = 2.0;
  const IDLE_FLOAT = 0.05;
  const TILT_RANGE = 0.5;
  const TILT_RATE = 5;
  const DRAG_GAIN = 0.01;
  const SPIN_YAW = 0.5;
  const FOV = (45 * Math.PI) / 180;
  const TAN_HALF = Math.tan(FOV / 2);
  const CAM_DIST = 5;
  const DEG = Math.PI / 180;
  const SHAPE_ID = { cross: 0, torus: 1, sphere: 2, glint: 3 };

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- colour + matrix helpers ---------- */
  function parseColor(input, fallback) {
    if (Array.isArray(input)) return input;
    if (!input) return fallback;
    const s = String(input).trim();
    if (s[0] === "#") {
      let h = s.slice(1);
      if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
      if (h.length >= 6) {
        const r = parseInt(h.slice(0, 2), 16) / 255;
        const g = parseInt(h.slice(2, 4), 16) / 255;
        const b = parseInt(h.slice(4, 6), 16) / 255;
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b];
      }
      return fallback;
    }
    const m = s.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      const p = m[1].split(",").map((v) => parseFloat(v));
      if (p.length >= 3) return [p[0] / 255, p[1] / 255, p[2] / 255];
    }
    return fallback;
  }

  function rotYX(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    return new Float32Array([cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]);
  }

  function transpose3(m) {
    return new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);
  }

  function mul3(a, b) {
    const o = new Float32Array(9);
    for (let c = 0; c < 3; c++)
      for (let r = 0; r < 3; r++)
        o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
    return o;
  }

  function rotYXZ(yaw, pitch, roll) {
    const base = rotYX(yaw, pitch);
    if (roll === 0) return base;
    const c = Math.cos(roll), s = Math.sin(roll);
    return mul3(base, new Float32Array([c, s, 0, -s, c, 0, 0, 0, 1]));
  }

  /* ---------- studio environment (softboxes, equirect) ---------- */
  let ENV_CANVAS = null;
  function envCanvas() {
    if (ENV_CANVAS) return ENV_CANVAS;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#1a1c20";
    ctx.fillRect(0, 0, 1024, 512);
    const softbox = (x, y, w, h, k) => {
      const g = ctx.createLinearGradient(x, y, x, y + h);
      g.addColorStop(0, `rgba(255,255,255,${k})`);
      g.addColorStop(1, `rgba(60,64,72,${k * 0.2})`);
      ctx.fillStyle = g;
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = 80;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, 60);
      else ctx.rect(x, y, w, h);
      ctx.fill();
    };
    softbox(50, 100, 300, 312, 1);
    softbox(674, 100, 300, 312, 1);
    softbox(350, -50, 324, 150, 0.9);
    ctx.shadowBlur = 0;
    ENV_CANVAS = c;
    return c;
  }

  /* Normalise every shape to a half-extent of 1 so morphs don't pop in size. */
  function shapeMetrics(shape, depth) {
    const nd = Math.max(0, depth / 100);
    const hd = nd * 0.5;
    const tube = Math.max(0.02, nd * 0.5);
    switch (shape) {
      case "cross":
        return { k: 1.3, bound: (Math.hypot(1.3, 0.35) + hd + BEVEL) / 1.3 };
      case "sphere":
        return { k: 1.2, bound: 1 };
      case "glint":
        return { k: 1, bound: Math.hypot(1, hd * 0.55 + 0.24) + BEVEL };
      default:
        return { k: 0.8 + tube, bound: 1 };
    }
  }

  /* ---------- shaders ---------- */
  const FULLSCREEN_VS = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

  const PLATE_FS = `
precision highp float;
uniform sampler2D uPlate;
uniform vec2 uPlateFit;
uniform vec2 uRes;
uniform float uAspect;
uniform vec4 uCaustic;
void main() {
    vec2 s = gl_FragCoord.xy / uRes;
    vec2 uv = (s - 0.5) * uPlateFit + 0.5;
    vec3 col = texture2D(uPlate, clamp(uv, 0.0, 1.0)).rgb;
    if (uCaustic.w > 0.001 && uCaustic.z > 0.001) {
        vec2 d = s - uCaustic.xy;
        d.x *= uAspect;
        float R = uCaustic.z;
        vec2 e = d - vec2(0.35 * R, -1.05 * R);
        e.y *= 2.4;
        float rr = length(e) / R;
        float shadow = smoothstep(1.1, 0.0, rr) * 0.13;
        float q = (rr - 0.42) * 4.5;
        float ring = exp(-q * q);
        float core = exp(-rr * rr * 9.0);
        vec3 spec = 0.5 + 0.5 * cos(6.2831 * (rr * 1.4 + e.x / (length(e) + 1e-4) * 0.1 + vec3(0.0, 0.33, 0.67)));
        col = col * (1.0 - shadow * uCaustic.w) + (ring * spec * 0.32 + core * 0.22) * uCaustic.w;
    }
    gl_FragColor = vec4(col, 1.0);
}`;

  const GLASS_FS = `
precision highp float;

uniform vec2 uRes;
uniform float uAspect;
uniform float uTanHalf;

uniform sampler2D uPlate;
uniform vec2 uPlateFit;
uniform float uHasPlate;
uniform sampler2D uEnv;

uniform mat3 uRot;
uniform mat3 uRotT;
uniform vec3 uCenter;
uniform float uScale;
uniform float uBoundR;

uniform float uShapeA;
uniform float uShapeB;
uniform float uMorph;
uniform float uKA;
uniform float uKB;
uniform float uHalfDepth;
uniform float uBevel;
uniform float uTorusTube;

uniform float uDisp;
uniform float uFrost;
uniform vec3 uTint;
uniform float uIri;

const float PI = 3.14159265359;
const float CORE_REFRACT = ${CORE_REFRACT.toFixed(4)};
const float IOR = ${IOR.toFixed(4)};
const float THICKNESS = ${THICKNESS.toFixed(4)};

float sdCross(vec2 p, vec2 b) {
    p = abs(p);
    p = (p.y > p.x) ? p.yx : p.xy;
    vec2 q = p - b;
    float k = max(q.y, q.x);
    vec2 w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
    return sign(k) * length(max(w, 0.0));
}

vec2 r45(vec2 p) {
    const float c = 0.7071067811865476;
    return vec2((p.x + p.y) * c, (p.y - p.x) * c);
}

// The Pellucid glint: a diamond carved by four circles through its tips.
// Circles sit at (±1.1, ±1.1) so they touch the tips without crossing the arms.
float sdGlint(vec2 p) {
    p = abs(p);
    float diamond = (p.x + p.y - 1.0) * 0.70710678;
    float flank = 1.1045 - length(p - vec2(1.1));
    return max(diamond, flank);
}

float extrudeRound(float d2, float pz, float hd, float r) {
    vec2 q = vec2(d2 + r, abs(pz) - hd + r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float sdRaw(vec3 p, float id) {
    if (id < 0.5) return extrudeRound(sdCross(r45(p.xy), vec2(1.3, 0.35)), p.z, uHalfDepth, uBevel);
    if (id < 1.5) { vec2 q = vec2(length(p.xy) - 0.8, p.z); return length(q) - uTorusTube; }
    if (id < 2.5) return length(p) - 1.2;
    // pillowed faces: a smooth radial dome (no medial-axis creases) so the star lenses like a cabochon
    float dome = 0.24 * (1.0 - smoothstep(0.0, 0.9, length(p.xy)));
    return extrudeRound(sdGlint(p.xy), p.z, uHalfDepth * 0.55 + dome, uBevel) * 0.82;
}

float map(vec3 p) {
    float a = sdRaw(p * uKA, uShapeA) / uKA;
    if (uMorph < 0.001) return a;
    float b = sdRaw(p * uKB, uShapeB) / uKB;
    return mix(a, b, uMorph);
}

vec3 mapNormal(vec3 p) {
    const float e = 0.0015;
    vec2 k = vec2(1.0, -1.0);
    return normalize(
        k.xyy * map(p + k.xyy * e) +
        k.yyx * map(p + k.yyx * e) +
        k.yxy * map(p + k.yxy * e) +
        k.xxx * map(p + k.xxx * e)
    );
}

vec4 plate(vec2 screenUv) {
    if (uHasPlate < 0.5) return vec4(0.0);
    vec2 uv = (screenUv - 0.5) * uPlateFit + 0.5;
    return texture2D(uPlate, clamp(uv, 0.0, 1.0));
}

float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 screenUv = gl_FragCoord.xy / uRes;
    vec2 ndc = screenUv * 2.0 - 1.0;

    vec3 D = normalize(vec3(ndc.x * uTanHalf * uAspect, ndc.y * uTanHalf, -1.0));
    vec3 rd = normalize(uRotT * D);
    vec3 ro = (uRotT * -uCenter) / uScale;

    float bb = dot(ro, rd);
    float cc = dot(ro, ro) - uBoundR * uBoundR;
    float hh = bb * bb - cc;
    if (hh < 0.0) discard;
    hh = sqrt(hh);
    float t = max(-bb - hh, 0.0);
    float tMax = -bb + hh;

    bool hit = false;
    for (int i = 0; i < 96; i++) {
        if (t > tMax) break;
        float d = map(ro + rd * t);
        if (d < 0.0009) { hit = true; break; }
        t += d * 0.9;
    }
    if (!hit) discard;

    vec3 pObj = ro + rd * t;
    vec3 nObj = mapNormal(pObj);

    vec3 vP = uCenter + uScale * (uRot * pObj);
    vec3 normal = normalize(uRot * nObj);
    vec3 viewDir = normalize(-vP);

    float ndv = max(dot(normal, viewDir), 0.0);
    float fresnel = pow(1.0 - ndv, 4.0);
    float coreFactor = ndv * ndv;
    vec2 lensOffset = (screenUv - 0.5) * (CORE_REFRACT * 0.15) * coreFactor;

    vec3 refractView = refract(-viewDir, normal, 1.0 / IOR);
    vec2 offset = refractView.xy * (THICKNESS * 0.1) - lensOffset;

    vec3 reflectDir = reflect(-viewDir, normal);
    vec2 equirectUv = vec2(
        atan(reflectDir.z, reflectDir.x) / (2.0 * PI) + 0.5,
        asin(clamp(reflectDir.y, -1.0, 1.0)) / PI + 0.5
    );
    vec3 reflection = texture2D(uEnv, equirectUv).rgb * 2.5;

    vec3 transmission = vec3(0.0);
    float bgAlpha = 0.0;

    vec2 uvR = screenUv + offset * (1.0 + uDisp);
    vec2 uvG = screenUv + offset;
    vec2 uvB = screenUv + offset * (1.0 - uDisp);

    if (uFrost > 0.001) {
        float rnd = rand(screenUv) * 6.2831853;
        const int SAMPLES = 24;
        const float GOLDEN_ANGLE = 2.39996323;
        float radius = 0.0;
        float radiusStep = 1.0 / float(SAMPLES);
        float blurMultiplier = uFrost * 0.025;
        for (int i = 0; i < SAMPLES; i++) {
            float theta = float(i) * GOLDEN_ANGLE + rnd;
            radius += radiusStep;
            vec2 bo = vec2(cos(theta), sin(theta)) * radius * blurMultiplier;
            transmission.r += plate(uvR + bo).r;
            vec4 g = plate(uvG + bo);
            transmission.g += g.g;
            bgAlpha += g.a;
            transmission.b += plate(uvB + bo).b;
        }
        transmission /= float(SAMPLES);
        bgAlpha /= float(SAMPLES);
    } else {
        transmission.r = plate(uvR).r;
        vec4 g = plate(uvG);
        transmission.g = g.g;
        bgAlpha = g.a;
        transmission.b = plate(uvB).b;
    }

    transmission *= uTint;
    vec3 clearGlassTint = mix(uTint, reflection, 0.5);
    transmission = mix(clearGlassTint, transmission, bgAlpha);

    vec3 finalColor = mix(transmission, reflection, fresnel * 0.8);

    // thin-film iridescence riding the rim
    vec3 iri = 0.5 + 0.5 * cos(6.2831 * (fresnel * 1.3 + dot(normal, vec3(0.3, 0.5, 0.2)) + vec3(0.0, 0.33, 0.67)));
    finalColor += iri * (fresnel * 0.9 + 0.04) * uIri;

    float baseAlpha = max(0.25, fresnel * 0.85);
    float outAlpha = mix(baseAlpha, 1.0, bgAlpha);
    gl_FragColor = vec4(finalColor, outAlpha);
}`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("Pellucid glass shader:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function link(gl, vs, fs) {
    const v = compile(gl, gl.VERTEX_SHADER, vs);
    const f = compile(gl, gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("Pellucid glass link:", gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  /* ---------- renderer ---------- */
  const DEFAULTS = {
    shapeA: "torus",
    shapeB: "torus",
    morph: 0,
    size: 60,
    depth: 32,
    speed: 100,
    direction: 1,
    angleX: 0,
    angleY: 0,
    angleZ: 0,
    offsetX: 0,
    offsetY: 0,
    yaw: 0,
    tint: "#ffffff",
    chromatic: 25,
    frost: 0,
    iri: 0.25,
    caustic: 1,
    float: 1,
  };

  class Glass {
    constructor(canvas, opts) {
      this.canvas = canvas;
      this.opts = opts || {};
      this.p = Object.assign({}, DEFAULTS, this.opts.params || {});
      this.ok = false;
      this.running = false;
      this.baseYaw = 0;
      this.dragPitch = 0;
      this.inertia = 0;
      this.tiltX = this.tiltY = this.tiltTX = this.tiltTY = 0;
      this.elapsed = 0;
      this.vw = this.vh = 1;
      this.plateSrc = this.opts.plate || null;
      this.plateDirty = !!this.plateSrc;
      this.plateReady = false;
      this.plateAspect = 1;
      this.visible = true;
      this._frame = this._frame.bind(this);
      this._init();
    }

    _init() {
      const canvas = this.canvas;
      const attrs = {
        antialias: false,
        alpha: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: !!this.opts.preserve,
        powerPreference: "high-performance",
      };
      const gl = canvas.getContext("webgl2", attrs) || canvas.getContext("webgl", attrs);
      if (!gl) return;
      this.gl = gl;

      this.plateProg = link(gl, FULLSCREEN_VS, PLATE_FS);
      this.glassProg = link(gl, FULLSCREEN_VS, GLASS_FS);
      if (!this.plateProg || !this.glassProg) return;

      const P = this.plateProg, G = this.glassProg;
      const loc = (prog, n) => gl.getUniformLocation(prog, n);
      this.uP = {
        plate: loc(P, "uPlate"), fit: loc(P, "uPlateFit"), res: loc(P, "uRes"),
        aspect: loc(P, "uAspect"), caustic: loc(P, "uCaustic"),
      };
      this.u = {};
      [
        "uRes", "uAspect", "uTanHalf", "uPlate", "uPlateFit", "uHasPlate", "uEnv",
        "uRot", "uRotT", "uCenter", "uScale", "uBoundR", "uShapeA", "uShapeB", "uMorph",
        "uKA", "uKB", "uHalfDepth", "uBevel", "uTorusTube",
        "uDisp", "uFrost", "uTint", "uIri",
      ].forEach((n) => (this.u[n] = loc(G, n)));
      this.aPlate = gl.getAttribLocation(P, "aPos");
      this.aGlass = gl.getAttribLocation(G, "aPos");

      this.quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

      const makeTex = (wrap) => {
        const t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        return t;
      };
      this.plateTex = makeTex(gl.CLAMP_TO_EDGE);
      this.envTex = makeTex(gl.REPEAT);

      gl.bindTexture(gl.TEXTURE_2D, this.envTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, envCanvas());

      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      this.ok = true;

      if (this.opts.fixed) {
        this._setSize(this.opts.fixed[0], this.opts.fixed[1], 1, this.opts.fixed[0], this.opts.fixed[1]);
      } else {
        this._resize = this._resize.bind(this);
        this.ro = new ResizeObserver(this._resize);
        this.ro.observe(canvas);
        this._resize();
      }

      if (this.opts.interactive !== false) this._bindPointer();

      this._onLost = (e) => {
        e.preventDefault();
        this.stop();
        this.ok = false;
        if (this.opts.onLost) this.opts.onLost();
      };
      canvas.addEventListener("webglcontextlost", this._onLost);

      if (this.opts.autoPause !== false && "IntersectionObserver" in window) {
        this.io = new IntersectionObserver(
          (es) => {
            this.visible = es[es.length - 1].isIntersecting;
            this.visible && !document.hidden ? this.start() : this.stop();
          },
          { rootMargin: "120px" }
        );
        this.io.observe(canvas);
      } else if (this.opts.autoStart !== false && !this.opts.fixed) {
        this.start();
      }
      this._onVis = () => (document.hidden ? this.stop() : this.visible && this.start());
      document.addEventListener("visibilitychange", this._onVis);
    }

    _setSize(w, h, dpr, cssW, cssH) {
      this.vw = w;
      this.vh = h;
      this.canvas.width = w;
      this.canvas.height = h;
      this.dpr = dpr;
      if (this.opts.onResize) {
        this.opts.onResize(cssW, cssH);
        this.plateDirty = !!this.plateSrc;
      }
    }

    _resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, this.opts.dprCap || 1.5);
      const cw = this.canvas.clientWidth || 1;
      const ch = this.canvas.clientHeight || 1;
      const w = Math.max(1, Math.round(cw * dpr));
      const h = Math.max(1, Math.round(ch * dpr));
      if (w === this.vw && h === this.vh) return;
      this._setSize(w, h, dpr, cw, ch);
      if (!this.running) this.render(0);
    }

    _bindPointer() {
      const target = this.opts.dragTarget || this.canvas;
      const canTouchDrag = !!this.opts.touchDrag;
      let dragging = false, lx = 0, ly = 0, lastDX = 0, lastT = 0;

      this._down = (e) => {
        if (e.pointerType === "touch" && !canTouchDrag) return;
        dragging = true;
        this.dragging = true;
        this.inertia = 0;
        lx = e.clientX;
        ly = e.clientY;
        lastT = performance.now();
        target.classList.add("is-grabbing");
      };
      this._move = (e) => {
        if (dragging) {
          const dx = e.clientX - lx, dy = e.clientY - ly;
          const now = performance.now();
          const dt = Math.max(1, now - lastT) / 1000;
          this.baseYaw += dx * DRAG_GAIN;
          this.dragPitch = clamp(this.dragPitch + dy * DRAG_GAIN, -1.2, 1.2);
          lastDX = (dx * DRAG_GAIN) / dt;
          lx = e.clientX;
          ly = e.clientY;
          lastT = now;
          return;
        }
        if (e.pointerType === "touch") return;
        const r = this.canvas.getBoundingClientRect();
        const nx = (e.clientX - r.left) / Math.max(r.width, 1);
        const ny = (e.clientY - r.top) / Math.max(r.height, 1);
        const inside = nx > -0.1 && nx < 1.1 && ny > -0.1 && ny < 1.1;
        this.tiltTX = inside ? (nx * 2 - 1) * TILT_RANGE : 0;
        this.tiltTY = inside ? (-ny * 2 + 1) * TILT_RANGE : 0;
      };
      this._up = () => {
        if (!dragging) return;
        dragging = false;
        this.dragging = false;
        this.inertia = clamp(lastDX, -12, 12);
        target.classList.remove("is-grabbing");
      };
      this._leave = () => {
        if (!dragging) this.tiltTX = this.tiltTY = 0;
      };
      target.addEventListener("pointerdown", this._down);
      target.addEventListener("pointerleave", this._leave);
      window.addEventListener("pointermove", this._move, { passive: true });
      window.addEventListener("pointerup", this._up);
      window.addEventListener("pointercancel", this._up);
      this._dragTarget = target;
    }

    set(obj) {
      Object.assign(this.p, obj);
      return this;
    }

    setPlate(src) {
      this.plateSrc = src;
      this.plateDirty = true;
    }

    markPlate() {
      this.plateDirty = true;
      if (!this.running && this.ok) this.render(0);
    }

    get yawDeg() {
      const d = ((this.baseYaw + this.p.yaw) / DEG) % 360;
      return d < 0 ? d + 360 : d;
    }

    start() {
      if (this.running || !this.ok) return;
      this.running = true;
      this.prev = performance.now();
      this.raf = requestAnimationFrame(this._frame);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }

    _frame(now) {
      if (!this.running) return;
      this.raf = requestAnimationFrame(this._frame);
      const dt = Math.min((now - this.prev) / 1000, 0.05);
      this.prev = now;
      this.render(dt);
    }

    render(dt) {
      if (!this.ok) return;
      const gl = this.gl, p = this.p, u = this.u;
      this.elapsed += dt;

      if (this.plateDirty && this.plateSrc) {
        this.plateDirty = false;
        const src = this.plateSrc;
        if (src.width > 1 && src.height > 1) {
          gl.bindTexture(gl.TEXTURE_2D, this.plateTex);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          this.plateAspect = src.width / src.height;
          this.plateReady = true;
        }
      }

      // pointer tilt, drag inertia, idle spin
      const k = 1 - Math.exp(-TILT_RATE * dt);
      this.tiltX += (this.tiltTX - this.tiltX) * k;
      this.tiltY += (this.tiltTY - this.tiltY) * k;
      if (!this.dragging) {
        if (this.inertia) {
          this.baseYaw += this.inertia * dt;
          this.inertia *= Math.exp(-2.6 * dt);
          if (Math.abs(this.inertia) < 0.002) this.inertia = 0;
        }
        this.dragPitch *= Math.exp(-0.9 * dt);
      }
      const spin = (p.speed / 50) * (p.direction < 0 ? -1 : 1);
      this.baseYaw += spin * SPIN_YAW * dt;

      const wobble = Math.sin(this.elapsed * 0.7) * 0.22 * Math.min(1, Math.abs(spin));
      const yaw = this.baseYaw + this.tiltX + p.angleY * DEG + p.yaw;
      const pitch = clamp(this.dragPitch + wobble - this.tiltY, -1.45, 1.45) + p.angleX * DEG;
      const rot = rotYXZ(yaw, pitch, p.angleZ * DEG);
      const rotT = transpose3(rot);

      const halfFrame = CAM_DIST * TAN_HALF;
      const targetHalf = Math.max(0, p.size / 100) * halfFrame;
      const aspect = this.vw / this.vh;
      const pa = this.plateAspect;
      const fitX = aspect > pa ? 1 : aspect / pa;
      const fitY = aspect > pa ? pa / aspect : 1;
      const floatY = Math.sin(this.elapsed * 2) * IDLE_FLOAT * p.float;
      const cx = (p.offsetX / 100) * halfFrame * aspect;
      const cy = floatY + (p.offsetY / 100) * halfFrame;

      gl.viewport(0, 0, this.vw, this.vh);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);

      const hasPlate = this.plateReady ? 1 : 0;
      if (hasPlate) {
        gl.useProgram(this.plateProg);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.plateTex);
        gl.uniform1i(this.uP.plate, 0);
        gl.uniform2f(this.uP.fit, fitX, fitY);
        gl.uniform2f(this.uP.res, this.vw, this.vh);
        gl.uniform1f(this.uP.aspect, aspect);
        gl.uniform4f(
          this.uP.caustic,
          (cx / (halfFrame * aspect)) * 0.5 + 0.5,
          (cy / halfFrame) * 0.5 + 0.5,
          (targetHalf / halfFrame) * 0.5,
          p.caustic
        );
        gl.enableVertexAttribArray(this.aPlate);
        gl.vertexAttribPointer(this.aPlate, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (targetHalf < 0.004) return;

      const morph = p.shapeA === p.shapeB ? 0 : clamp(p.morph, 0, 1);
      const mA = shapeMetrics(p.shapeA, p.depth);
      const mB = shapeMetrics(morph > 0 ? p.shapeB : p.shapeA, p.depth);
      const boundR = Math.max(mA.bound, morph > 0 ? mB.bound : 0) * 1.02;
      const nd = Math.max(0, p.depth / 100);

      gl.useProgram(this.glassProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.plateTex);
      gl.uniform1i(u.uPlate, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.envTex);
      gl.uniform1i(u.uEnv, 1);

      gl.uniform2f(u.uRes, this.vw, this.vh);
      gl.uniform1f(u.uAspect, aspect);
      gl.uniform1f(u.uTanHalf, TAN_HALF);
      gl.uniform2f(u.uPlateFit, fitX, fitY);
      gl.uniform1f(u.uHasPlate, hasPlate);
      gl.uniformMatrix3fv(u.uRot, false, rot);
      gl.uniformMatrix3fv(u.uRotT, false, rotT);
      gl.uniform3f(u.uCenter, cx, cy, -CAM_DIST);
      gl.uniform1f(u.uScale, targetHalf);
      gl.uniform1f(u.uBoundR, boundR);

      gl.uniform1f(u.uShapeA, SHAPE_ID[p.shapeA] ?? 1);
      gl.uniform1f(u.uShapeB, SHAPE_ID[p.shapeB] ?? 1);
      gl.uniform1f(u.uMorph, morph);
      gl.uniform1f(u.uKA, mA.k);
      gl.uniform1f(u.uKB, mB.k);
      gl.uniform1f(u.uHalfDepth, nd * 0.5);
      gl.uniform1f(u.uBevel, BEVEL);
      gl.uniform1f(u.uTorusTube, Math.max(0.02, nd * 0.5));

      gl.uniform1f(u.uDisp, p.chromatic / 1000);
      gl.uniform1f(u.uFrost, p.frost / 100);
      const tint = parseColor(p.tint, [1, 1, 1]);
      gl.uniform3f(u.uTint, tint[0], tint[1], tint[2]);
      gl.uniform1f(u.uIri, p.iri);

      gl.enableVertexAttribArray(this.aGlass);
      gl.vertexAttribPointer(this.aGlass, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    dispose() {
      this.stop();
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      document.removeEventListener("visibilitychange", this._onVis);
      if (this._dragTarget) {
        this._dragTarget.removeEventListener("pointerdown", this._down);
        this._dragTarget.removeEventListener("pointerleave", this._leave);
        window.removeEventListener("pointermove", this._move);
        window.removeEventListener("pointerup", this._up);
        window.removeEventListener("pointercancel", this._up);
      }
      this.canvas.removeEventListener("webglcontextlost", this._onLost);
      if (this.gl) {
        const ext = this.gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
      this.ok = false;
    }
  }

  /* Render a batch of stills from one throwaway context.
     jobs: [{ plate: canvas, params: {...}, yaw, pitch }] → dataURL[] */
  Glass.snapshot = function (jobs, w, h) {
    const c = document.createElement("canvas");
    const g = new Glass(c, { fixed: [w, h], interactive: false, autoPause: false, preserve: true });
    if (!g.ok) return [];
    const out = jobs.map((j) => {
      g.p = Object.assign({}, DEFAULTS, { float: 0, speed: 0 }, j.params || {});
      g.setPlate(j.plate);
      g.baseYaw = j.yaw || 0;
      g.dragPitch = j.pitch || 0;
      g.elapsed = 0;
      g.render(0);
      return c.toDataURL("image/jpeg", 0.9);
    });
    g.dispose();
    return out;
  };

  global.PellucidGlass = Glass;
})(window);
