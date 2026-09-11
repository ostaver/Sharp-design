---
name: pellucid-skill
title: design-pellucid-optical-objects
description: A light, optical, chromatic design language for object makers, material brands, and studios whose product is how something looks through, around, or inside it. Builds a small static site (HTML/CSS/JS folder) around a live WebGL liquid-glass raymarcher that refracts real typography, driven by GSAP ScrollTrigger, SplitText, and Lenis.
---

# Pellucid

You are designing in the Pellucid language. This is not a page to copy. It is a set of convictions, proportions, and optical rules that produce luminous, precise, lab-calm pages. Every output should feel unmistakably Pellucid, and never identical to a prior run.

## Core conviction

Pellucid is high-key and optical: daylight porcelain grounds, near-black ink, and colour that appears only as *light behaviour*: refraction, dispersion, caustics, iridescence. It lives where an optics lab meets a gallery plinth. The signature is a real glass object, raymarched live in WebGL, bending the page's own typography behind it. Everything else serves that moment: hairline grids the glass can distort, giant condensed words it can split, small frosted CSS panels that echo it.

"Don't show the object. Show what it does to the room."

Never:

- **Reproduce the reference copy.** The brand name "Pellucid", the hero words (PELLUCID / REFRACT / DISPERSE / RESOLVE), edition names (Halo, Orbis, Chiasm, Glint, Meridian), addresses, specs and taglines belong to the reference build. Invent all copy from the user's brief.
- **Reproduce the reference layout.** Reorder sections, vary the count, vary hero shape order and phase count. Never repeat a section type.
- **Rewrite the glass renderer.** It is prescriptive (see §Renderer). Custom raymarch maths is the main source of broken builds.

---

## Non-negotiable invariants

Each of these broke a real Pellucid build. A build that violates any of them is broken no matter how it looks. Treat this list as the delivery gate.

1. **`js/glass.js` is copied verbatim.** Do not "simplify" the shader. If you ever add a 2D star/flank SDF, the carving circles must pass through the tips without crossing the arms: for tips at (1,0) and (0,1) the circle centre (c,c) needs c ≥ 1. A smaller c severs the arms, leaving a half-size object with floating needle specks.
2. **No `atan()` in any procedural colour term** on a plate or caustic. Its ±π wrap draws a hard seam. Use `e.x / (length(e) + 1e-4)` or similar continuous terms.
3. **Plates are painted only after fonts load.** Await `document.fonts.load()` for every exact weight/stretch the canvases use (e.g. `'condensed 700 100px "Family"'`), raced against a 2.5 s timeout. Canvas otherwise measures the fallback font and mis-sizes every word.
4. **Plates match their canvas.** Resize and repaint a plate inside the renderer's `onResize(cssW, cssH)` so its aspect equals the canvas aspect. Repaint on change only, behind a dirty check, then call `glass.markPlate()`. Never re-upload unconditionally every frame.
5. **Plate words never collide with live DOM text.** When a section has both, compute the word block's centre and height from DOM measurements: from the bottom of an inner element (e.g. the eyebrow) to the top of the copy block, not from a padded wrapper and never from fixed fractions. Derive the glass `offsetY`/`size` from the same numbers. On phones, reserve the gap with padding (`34svh`) and measure from inside it.
6. **The intro veil can never trap the page.** It displays only under `.js`. It carries a CSS failsafe (`animation: veil-failsafe .6s 8s forwards` → `opacity:0; visibility:hidden`) and is removed immediately when GSAP is missing or `prefers-reduced-motion` is set.
7. **Phones can always scroll.** Hero and closing canvases use `touch-action: pan-y` and ignore touch drags. Only the Bench canvas takes `touch-action: none` + `touchDrag: true`.
8. **WebGL failure degrades to the plate.** If `glass.ok` is false, add `.no-webgl` and mount the plate canvas itself as a static image. The page must still read.
9. **GPU budget.** Keep at most 3 live `Glass` instances plus 1 transient snapshot context. Leave `autoPause` on (IntersectionObserver + `visibilitychange`). Cap DPR at 1.5 for canvases and 1.25 for full-screen plates.
10. **Snapshots render under the veil.** Gallery stills (`Glass.snapshot`) are generated while the intro veil covers the page, never after the reveal (they block for a moment).
11. **Essential copy lives in normal flow.** Headings, lede, specs, contact and alt text exist in the DOM with no JS. A canvas-drawn word always has an `sr-only` DOM twin (e.g. the hero `<h1>`).
12. **Verify at 1440×900 and 390×844** with no horizontal overflow (`documentElement.scrollWidth === innerWidth`). Also verify with `prefers-reduced-motion: reduce`.

---

## Voice

Calm, exact, physical. It reads like a lens-maker's notebook edited by a gallerist. Short declaratives, one idea per sentence, measured numbers.

- Lead with what the thing *does to light*, then what it is.
- No superlatives, no "innovative", "cutting-edge", "elevate". Precision replaces praise: "flat to an eighth of a wavelength" beats "incredibly smooth".
- Paragraphs of 1–3 sentences. Headings are complete thoughts ending in a full stop ("Measured, not described.").
- Numbers carry units and a human translation ("1.517, so a ray entering at 45° leaves bent by 17.2°"). Check the arithmetic.
- Names feel mineral or optical: short, Latin-ish, or plain nouns ("Halo", "Vessel No. 3", "Lumen", "Aperture").
- Vocabulary: refract, disperse, anneal, focus, index, figure, wavelength, cast, grind, polish, edition, bench, plate, caustic, clear, cold-worked, axis.

---

## Composition

Tendencies, not a recipe:

- **Hero:** a pinned optical *stage* (100svh, pinned for 300–340vh). One glass object morphs through 3–4 forms as you scroll, while a giant condensed word on the plate behind it rolls to the next word, odometer-style. Small UI sits in the corners: kicker (top-left), live readouts (top-right), phase caption in a frosted panel (bottom-left), phase meter (bottom-right), scroll/drag hint (bottom-centre, ≥1100px only).
- **Grounds:** porcelain for everything except **exactly one night section**, the closing stage. Separate sections with a single top hairline (`1px var(--hair)`) and generous padding (`clamp(100px,16vh,180px)`).
- **Section headers:** an eyebrow (prism dot + `NN — Name`, uppercase, tracked), a display heading revealed by SplitText line masks, and a lede in `--ink-2`. Two-column head (heading ↔ lede) on desktop, stacked on mobile.
- **CSS glass is companion UI only:** nav pill, phase captions, badges, canvas tags. Small, `backdrop-filter: blur(18px) saturate(170%)`, white 1px border, inner top highlight. Never large glass cards or glass sections.
- **Data:** spec rows with hairlines and oversized tabular numerals, figure diagrams (SVG optical ray drawings), dl-based metadata under objects.
- **Radius:** 22px panels, 28px rigs, 999px pills. **Shadows:** long and soft, only under objects and floating panels.

**Refuse:**

- Photographs, stock imagery, external images, icon fonts, emoji icons.
- Dark-first pages, flat poster colour-blocking, neon.
- Custom cursors, percentage loaders, marquee tickers, typewriter text.
- Gradient-blob heroes without refraction, i.e. "glassmorphism" with no optics.
- Glass cards as the dominant component.

---

## Color

Single light theme plus one night section. No toggle.

**Commitment level: optics lab at noon.** The surfaces are cool and nearly colourless. Colour enters only as light: aurora blooms on plates, prism gradients on tiny accents, chromatic fringes in the glass.

```css
:root {
  --ground:  #E7EBEF;   /* porcelain: vary H 200–225, S 8–18%, L 90–94% */
  --paper:   #F3F5F7;   /* rigs, diagrams, panels */
  --ink:     #0A0C10;   /* near-black, faint blue */
  --ink-2:   #4B5361;
  --ink-3:   #7D8593;
  --hair:    rgba(10,12,16,.14);
  --hair-2:  rgba(10,12,16,.06);
  --night:   #07080B;   /* the one dark section */
  --prism:   linear-gradient(100deg,#FF5E7E 0%,#FFB057 20%,#F2E35E 38%,#5EF0C0 58%,#58A6FF 78%,#A77BFF 100%);
  --display: "Bricolage Grotesque","Arial Narrow",system-ui,sans-serif;
  --body:    "Geist",system-ui,-apple-system,"Segoe UI",sans-serif;
  --pad:     clamp(16px,2.6vw,44px);
  --radius:  22px;
  --nav-h:   76px;
  --ease:    cubic-bezier(.76,0,.24,1);
  --ease-out:cubic-bezier(.16,1,.3,1);
}
```

Rules:

- `--prism` appears **only** on eyebrow dots, progress bars, the CTA hover fill, underline sweeps, 1–2 highlighted phrases in the manifesto (`background-clip:text` on `.prism, .prism *`), and spec-value hover. Nowhere else.
- **Plate auroras:** 3–4 radial blooms per plate at 0.45–0.65 alpha: one cool (lilac/ice), one warm (peach/rose), one fresh (mint/aqua), plus an optional white core. Vary the hues per project and keep them pastel. The night plate uses the same idea at 0.18–0.35 alpha on `--night`.
- Glass tints stay near-white (each channel ≥ 0.9) on the hero. Stronger tints (cobalt, amber, smoke) are reserved for one gallery object and the Bench swatches.
- Transitions for colour: `.3–.5s var(--ease-out)`.
- `.on-dark` on `<body>` (toggled while the night section is under the nav) flips nav text to `--ground`, nav pill to `rgba(255,255,255,.06)`, CTA to porcelain-on-ink.
- `prefers-contrast: more`: `--ink-2`/`--ink-3` → `--ink`, hairlines to `.4` alpha, drop backdrop blur for solid `--paper`.
- **Vary per project:** ground hue/lightness within range, aurora hues, prism stop order (keep it spectral).

---

## Typography

A two-font system: a **variable display face with a width axis** (canvas plates need `fontStretch: "condensed"`) and a quiet grotesk for everything else.

- **Display** (Google Fonts, `wdth` + `wght` axes): `Bricolage Grotesque` (opsz,wdth,wght@12..96,75..100,200..800), `Archivo` (wdth 62–125), `Anybody` (wdth 50–150), `Encode Sans` (wdth 75–125). Used for canvas words, headings, object names, big numerals, the brand wordmark.
- **Body:** `Geist`, `Instrument Sans`, `Figtree`, or `Manrope` (300–600). Used for copy, labels, nav, controls, readouts.
- Verify the exact CSS2 URL returns `200` before using it. The reference URL is `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Geist:wght@300..600&display=swap`.

| Element | Size | Weight | Stretch / tracking |
|---|---|---|---|
| Canvas words (plates) | fitted to 92% width, ≤36% height | 700 | condensed, −0.01em |
| `.h-display` | `clamp(40px,6.2vw,108px)`, lh .92 | 600 | 88%, −0.035em |
| Manifesto | `clamp(30px,4.3vw,76px)`, lh 1.04 | 500 | 94%, −0.035em |
| Spec numerals | `clamp(44px,5.4vw,96px)` | 600 | 85%, tabular-nums |
| Step numbers | `clamp(56px,7vw,124px)` | 700 | 75% → 100% when active (transition `font-stretch`) |
| Eyebrow / labels | 11–12px | 500 | uppercase, +0.12–0.16em |
| Body | 15–16px, lh 1.55 | 400 | — |

Rules: no third family. Animate the width axis (`font-stretch`) as a signature, never letter-spacing. Headings use `text-wrap: balance`.

---

## Motion

Motion is optical and continuous: things *bend*, *roll*, *resolve*. The scroll drives the light.

**Stack (pinned, verified live):**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/SplitText.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/CustomEase.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js" defer></script>
<script src="js/glass.js" defer></script>
<script src="js/main.js" defer></script>
```

Easing: `CustomEase.create("lens", "0.76,0,0.24,1")` for morphs and veils, `expo.out` for reveals, `power3` for quickTo. `back.out` is allowed only on the focal point pop. No elastic.

### Signature 1: the glass renderer (prescriptive)

`window.PellucidGlass`: a two-pass WebGL renderer. Pass 1 draws the *plate* (a 2D canvas you paint) plus a soft shadow and spectral caustic. Pass 2 raymarches a glass SDF that refracts the plate with RGB dispersion, frost, fresnel reflection of a softbox studio, and thin-film iridescence.

```js
const g = new PellucidGlass(canvas, {
  plate: plateCanvas,          // 2D canvas the glass refracts (required for content)
  dprCap: 1.5,
  params: { shapeA: "torus", shapeB: "torus", morph: 0, size: 56, depth: 44, speed: 40,
            tint: [1,1,1], chromatic: 28, frost: 0, iri: .22, caustic: 1,
            offsetX: 0, offsetY: 0, yaw: 0, angleX: 0, float: 1 },
  onResize(cssW, cssH) { plate.size(cssW, cssH); paint(); },  // repaint the plate here
  touchDrag: false,            // true only for the Bench
  dragTarget: canvas, interactive: true, autoPause: true,
});
g.ok            // false → WebGL unavailable, mount the plate instead
g.set({...})    // write params (GSAP can tween g.p directly)
g.markPlate()   // after repainting the plate
g.yawDeg        // live readout
PellucidGlass.snapshot([{ plate, params, yaw, pitch }], w, h) // → JPEG dataURLs
```

- Shapes: `"torus" | "sphere" | "cross" | "glint"`. Morph by setting `shapeA`, `shapeB`, and tweening `morph` 0→1. All shapes are normalised to half-extent 1, so morphs never pop in size.
- `size` is % of the half-frame height, so diameter px = `size/100 × canvasHeight`. On portrait screens multiply by `min(1, aspect × 1.15)`.
- `offsetX/Y` are % of the half-frame. For plate point (px, py): `offsetY = (1 − 2·py/h)·100`.
- `chromatic` 20–60 normal, 90–160 for a "dispersion" moment. `frost` 0–10 on type plates (legibility), up to 60 on the Bench. `iri` 0.15–0.55.

The full file follows. **Copy it byte-for-byte to `js/glass.js`.**

```js
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
```

### Signature 2: plates toolkit (prescriptive)

Put this at the top of `js/main.js`, inside the IIFE, and paint every plate with it:

```js
const DISPLAY = '"Bricolage Grotesque", "Arial Narrow", sans-serif'; // match chosen display
const BODY = '"Geist", system-ui, sans-serif';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

class Plate {
  constructor(maxDpr) { this.c = document.createElement("canvas"); this.x = this.c.getContext("2d"); this.maxDpr = maxDpr || 1.5; this.w = this.h = 2; this.d = 1; }
  size(w, h) { this.d = Math.min(devicePixelRatio || 1, this.maxDpr); this.w = Math.max(2, w); this.h = Math.max(2, h);
    this.c.width = Math.round(this.w * this.d); this.c.height = Math.round(this.h * this.d); }
  begin() { const x = this.x; x.setTransform(this.d, 0, 0, this.d, 0, 0); x.globalAlpha = 1; x.textAlign = "left"; x.textBaseline = "alphabetic"; return x; }
}
function aurora(x, w, h, base, blobs) {          // blobs: [{x,y,r,c:"rgba(…,a)"}] in 0–1 units
  x.fillStyle = base; x.fillRect(0, 0, w, h); const m = Math.max(w, h);
  for (const b of blobs) { const g = x.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * m);
    g.addColorStop(0, b.c); g.addColorStop(1, b.c.replace(/[\d.]+\)$/, "0)")); x.fillStyle = g; x.fillRect(0, 0, w, h); }
}
function grid(x, w, h, step, line, mark) {       // hairline grid centred on the plate + "+" marks every 4 cells
  x.save(); x.lineWidth = 1; x.strokeStyle = line; x.beginPath();
  const ox = (w / 2) % step, oy = (h / 2) % step;
  for (let gx = ox; gx < w; gx += step) { x.moveTo(Math.round(gx) + .5, 0); x.lineTo(Math.round(gx) + .5, h); }
  for (let gy = oy; gy < h; gy += step) { x.moveTo(0, Math.round(gy) + .5); x.lineTo(w, Math.round(gy) + .5); }
  x.stroke();
  if (mark) { x.strokeStyle = mark; x.beginPath();
    for (let gx = ox; gx < w; gx += step * 4) for (let gy = oy; gy < h; gy += step * 4) {
      x.moveTo(gx - 4, gy); x.lineTo(gx + 4, gy); x.moveTo(gx, gy - 4); x.lineTo(gx, gy + 4); }
    x.stroke(); }
  x.restore();
}
function font(x, size, weight, stretch, family, tracking) {
  x.font = `${weight || 700} ${size}px ${family || DISPLAY}`;
  if ("fontStretch" in x) x.fontStretch = stretch || "normal";
  if ("letterSpacing" in x) x.letterSpacing = `${(tracking || 0) * size}px`;
}
function fitSize(x, text, maxW, maxH, weight, stretch, tracking) {
  font(x, 100, weight, stretch, DISPLAY, tracking); const m = x.measureText(text);
  const cap = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent || 72;
  return Math.min(100 * maxW / Math.max(m.width, 1), 100 * maxH / cap);
}
function centerBaseline(x, text, cy) { const m = x.measureText(text); return cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2; }
function wrapFit(x, text, maxW, maxH, weight, stretch) {      // largest size whose word-wrap fits the box
  const words = text.trim().split(/\s+/).filter(Boolean); if (!words.length) return { size: 0, lines: [], lh: 0 };
  for (let size = Math.floor(maxH); size > 12; size = Math.floor(size * .93)) {
    font(x, size, weight, stretch, DISPLAY, -.02); const lines = []; let line = "";
    for (const wd of words) { const t = line ? line + " " + wd : wd; if (!line || x.measureText(t).width <= maxW) line = t; else { lines.push(line); line = wd; } }
    lines.push(line); const lh = size * .9;
    if (lines.every((l) => x.measureText(l).width <= maxW) && lines.length * lh <= maxH) return { size, lines, lh };
  }
  return { size: 12, lines: [text], lh: 11 };
}
```

Plate content vocabulary: aurora ground → hairline grid (`rgba(ink,.055)`, marks `.26`) → optional 1px optical axis at the word's centre line → condensed ink words → 9–11px tracked annotations (`FIG. 0n — FORM`, `N = 1.517 · λ 587.6 NM`) placed just outside the word band. Grids and axes are what make refraction legible, so every type plate gets one.

### Signature 3: the hero stage

State `{ t: 0→(phases−1), intro: 0→1, pop: 0→1 }`. The scroll scrubs `t`; the ticker maps it to the glass and repaints the plate only when `t` or `intro` changed.

```js
const WORDS = [/* 3–4 uppercase verbs/nouns from the brief */], SHAPES = [/* e.g. "torus","sphere","cross","glint" in any order */];
const LOOK = [/* per phase: { offsetX, offsetY, size, tint:[r,g,b], chromatic, frost, iri, depth } */];
const last = WORDS.length - 1;
// odometer: words roll only in the middle of each segment
const rollIndex = (t) => { const i = Math.min(Math.floor(t), last - 1); return i + smooth(.36, .64, t - i); };
function update() {
  const t = clamp(state.t, 0, last), i = Math.min(Math.floor(t), last - 1), m = smooth(.2, .8, t - i);
  const A = LOOK[i], B = LOOK[i + 1], fitScale = Math.min(1, innerWidth / innerHeight * 1.15), sway = innerWidth < 720 ? .35 : 1;
  glass.set({ shapeA: SHAPES[i], shapeB: SHAPES[i + 1], morph: m, size: lerp(A.size, B.size, m) * state.pop * fitScale,
    offsetX: lerp(A.offsetX, B.offsetX, m) * sway, offsetY: lerp(A.offsetY, B.offsetY, m),
    tint: A.tint.map((v, j) => lerp(v, B.tint[j], m)), chromatic: lerp(A.chromatic, B.chromatic, m),
    frost: lerp(A.frost, B.frost, m), iri: lerp(A.iri, B.iri, m), depth: lerp(A.depth, B.depth, m), yaw: t * 1.2 });
  if (t !== prev.t || state.intro !== prev.intro) { paintHero(); glass.markPlate(); prev = { t, intro: state.intro }; }
}
```

- `paintHero`: aurora (blob positions drift with `t`) → grid → axis → clip to a band (`max cap height × 1.14`, centred) → draw each word k with `d = k − rollIndex(t)` (skip |d| ≥ 1) at `baseline + d × band`. Pre-compute per-word fitted sizes on resize. The first word's letters rise from below the band during `intro` (per-letter x from `measureText(word.slice(0,i))`, ease-out-quart, stagger 0.8).
- ScrollTrigger: `trigger: hero, start: "top top", end: "+=" + innerHeight*3.2, pin: true, scrub: .9`. The timeline tweens `state.t` to `last` (`ease:none`), the prism meter `scaleX` 0→1, and cross-fades absolutely-stacked caption panels (`to(prev,{autoAlpha:0,y:-24})` at `i−.6`, `fromTo(next,{autoAlpha:0,y:24},{…,immediateRender:false})` at `i−.4`). Hide the hint once progress > 0.015.
- Readouts refresh every ~90 ms: `θ 024°` from `glass.yawDeg`, `Δ 0.048` from `chromatic/1000`. Tick labels mark the active form.

### Signature 4: intro veil ("the beam")

Two porcelain halves (with the grid, meeting at the seam) cover the page. Three 2px lines (R `#FF3B6B`, G `#19D9A0`, B `#3B6BFF`, `mix-blend-mode: multiply`) sit on the seam, plus a label counting a real optical value (e.g. `n = 1.000 → 1.517`).

```js
gsap.timeline()
  .fromTo(".veil__line", { scaleX: 0 }, { scaleX: 1, duration: 1.15, stagger: .07, ease: "expo.inOut" })
  .to(".veil__label", { autoAlpha: 1, duration: .6 }, .35)
  .to(counter, { v: 1.517, duration: 1.3, onUpdate: renderCounter }, .4)
  .add(generateSnapshots, 1.0)                       // invariant 10
  .to(".veil__line--r", { y: -9, duration: .7, ease: "power3.inOut" }, 1.5)
  .to(".veil__line--b", { y: 9, duration: .7, ease: "power3.inOut" }, 1.5)   // white splits into spectrum
  .to(".veil__half--top", { yPercent: -101, duration: 1.4, ease: "expo.inOut" }, 2.1)
  .to(".veil__half--bot", { yPercent: 101, duration: 1.4, ease: "expo.inOut" }, 2.1)
  .to(heroState, { intro: 1, duration: 1.6, ease: "none" }, 2.3)
  .to(heroState, { pop: 1, duration: 2.6, ease: "expo.out" }, 2.45)
  .add(revealHeroUI(), 2.8)                           // nav items drop in, caption + corners rise
  .add(() => { veil.remove(); lenis?.start(); }, 3.5);
```

Call `lenis.stop()` and `scrollTo(0,0)` before it, and set `history.scrollRestoration = "manual"`.

### Signature 5: rendered gallery

Horizontal pinned gallery (≥901px): a fixed intro column (eyebrow, heading, lede, prism progress, count) beside a masked viewport (`mask-image: linear-gradient(90deg, transparent, #000 5%)`) whose track translates `x: -(track.scrollWidth − viewport.clientWidth)` with `pin`, `scrub: .7`, `invalidateOnRefresh`. Card images parallax with `containerAnimation` (xPercent −6→6, img scaled 1.16). On ≤900px it becomes native `overflow-x:auto` with `scroll-snap-type: x mandatory`.

Every card image is a `PellucidGlass.snapshot` still (720×900): a per-object plate (two-stop linear gradient, grid, the object's name fitted to 86% width, `Nº 0n` + form labels) refracted by that object's shape/tint/angle. Give exactly one object a dark plate and strong tint. Set `<img>` alt text describing the render. Hover: 3D tilt via `gsap.quickTo(fig,"rotationX/Y")` (±6°, `transformPerspective: 900`) plus a soft-light radial sheen following `--mx/--my`.

### Signature 6: the Bench (interactive)

A live instance (`touchDrag: true`, `touch-action: none`) in a 28px-radius rig with frosted corner tags (`Live · WebGL`, current form, `Drag to turn`, `θ` readout), next to an instrument panel. The panel has a segmented Form radio set (4 shapes), a segmented Backdrop set (Type / Stripes / Halftone), a text input refracted live (`wrapFit` into 86% × 62% of the plate), ranges (Dispersion 0–160, Frost 0–100, Thickness 12–70, Scale 30–85, Spin 0–200), 6 tint swatches, and Randomise / Reset buttons.

```js
function morphTo(g, shape) {                     // shape change = SDF morph, never a swap
  const p = g.p; if (p.morph > .5) p.shapeA = p.shapeB;
  if (p.shapeA === shape) { p.shapeB = shape; p.morph = 0; return; }
  p.shapeB = shape; p.morph = 0;
  gsap.to(p, { morph: 1, duration: 1.2, ease: "lens", overwrite: "auto", onComplete() { p.shapeA = shape; p.morph = 0; } });
}
// ranges: gsap.to(g.p, { [key]: +value, duration: .6, ease: "power3.out", overwrite: "auto" }); write --fill % on the input
// tint: tween a {r,g,b} proxy and assign g.p.tint = [r,g,b] in onUpdate (never tween hex strings)
```

- Stripes backdrop: vertical bands (ink, paper, and 3–4 spectral colours) with a paper band behind the words.
- Halftone backdrop: a dot grid whose radius follows `sin·cos` and whose hue sweeps across x.
- Range CSS: 2px track `linear-gradient(90deg, var(--ink) var(--fill), var(--hair) var(--fill))`, an 18px pearl thumb (radial white→`#b3bdca`), scaled 1.25 when active.

### Signature 7: figure diagram

A sticky SVG optical figure on `--paper` (dotted `<pattern>` ground). It shows an axis, a vesica lens (`M300 86Q356 210 300 334Q244 210 300 86Z`), 7 parallel rays refracting to a focal point F, a 6-colour spectrum fanning out after F, and uppercase labels. For ray y and focus (fx,fy): `M20 y H300 L fx fy L 590 fy+(fy−y)·(290/(fx−300))`. Every stroked path gets `pathLength="1"`, `strokeDasharray:1`, and a scrubbed `strokeDashoffset` 1→0 (axis → lens → rays staggered → focus `back.out(3)` → spectrum). Steps on the right (min-height 64vh) toggle `.is-active` at `top 62%`, which updates the caption (`fig. 0n`, `data-cap`) and animates the step number's `font-stretch` 75%→100%.

### Also required

- Lenis `{ lerp: .09 }` → `lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `lagSmoothing(0)`. Anchor links go through `lenis.scrollTo(target, {duration: 1.8})`.
- `[data-split]` headings: `SplitText.create(h, { type:"lines", mask:"lines", autoSplit:true, onSplit: s => gsap.from(s.lines, { yPercent:115, duration:1.25, ease:"expo.out", stagger:.09, scrollTrigger:{ trigger:h, start:"top 86%", once:true } }) })`.
- Manifesto: SplitText words, opacity .12→1 scrubbed across the paragraph (`top 78%` → `bottom 50%`).
- `[data-reveal]`: `from { y:26, autoAlpha:0 }`, `expo.out`, `once:true`.
- Counters: tween a proxy with `toFixed(decimals)`. The DOM keeps the final value for no-JS.
- Spec rows: hairline via `--line` custom property tweened 0→1 (`expo.inOut`).
- Magnetic CTA and buttons (`quickTo x/y`, ×0.3/×0.4) on `(hover: hover)` only.
- Night section: the glass pops (`size × pop`, pop .25→1 scrubbed from `top bottom` to `top top`) and yaw scrubs −2→0.
- **Reduced motion:** no Lenis, no veil, `speed: 8`, `pop = intro = 1`, `scrub: true`, CSS animations and transitions cut to 0.01ms. Content is fully visible.

---

## Interaction & navigation

- `:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; border-radius: 6px }`, porcelain on the night section. Never remove the outline without a replacement.
- Skip link to `#main`. Segmented controls are real radio inputs (visually hidden, `:focus-visible + span` ring). Swatches carry `sr-only` names.
- **Nav (fixed, 3-column grid):** the wordmark + glint mark (SVG `<symbol>`, rotates 90° on hover) on the left; a centred frosted pill of 3–5 numbered links (`<i>01</i>Name`, `.is-current` via ScrollTrigger at `top 50%`/`bottom 50%`); an ink CTA pill on the right whose hover fades in `--prism` with ink text. Nav items drop in after the veil.
- **Below 820px:** the pill is hidden, leaving wordmark + CTA only. Use a real menu button (`aria-expanded`, Escape closes, focus returns) only if there are more than 4 sections.
- Vary the link labels per project (e.g. `Objects · Bench · Process · Specs`, or `Works · Lab · Method · Data`).
- **Contact:** a `mailto:` rendered as a giant display link with a prism underline sweep and an arrow rotating 45° on hover. The only form is the Bench (`onsubmit="return false"`).

---

## Layout sections (approved roster)

Use 6–9, in any order after the hero. The veil, hero stage, and night closing are required, and the closing is always last. Include at least one of Gallery or Bench. Never repeat a type.

- **Veil** (required): Signature 4.
- **Hero stage** (required, first): Signature 3, with an `sr-only` `<h1>`.
- **Manifesto:** eyebrow + one large scrubbed paragraph with 1–2 prism phrases and one inline spinning glint glyph, then a 3-column meta row under a hairline.
- **Gallery:** Signature 5, 4–6 objects.
- **Bench:** Signature 6.
- **Figure / Process:** Signature 7, 3–5 steps.
- **Specs:** a `dl` of 4–6 rows (label | huge value + small unit | human note). Values count up; hover prisms the value.
- **Index:** a hairline list of 6–12 rows (materials, collaborators, stockists, exhibitions): name, detail, year. Hovering a row shows a small snapshot thumbnail following the pointer (desktop only, via `quickTo`).
- **Night closing** (required, last): a full-height `--night` stage with a live glass over a two-line plate statement (invariant 5). Below it: lede + giant mailto, a 4-column info row (address, visits, local time via `Intl.DateTimeFormat` in the studio's time zone, links), and a footer line with a colophon (fonts + "rendered live with WebGL, GSAP & Lenis") and a back-to-top link.

---

## Architecture & performance

Output shape: a **hand-rolled static folder**. No framework, no bundler, no npm. Classic `defer` scripts only (no ES modules), so it also opens from `file://`.

```
project/
├── index.html      — author per build (semantic markup, head, SVG <symbol>s, sections)
├── css/style.css   — author per build from the tokens and patterns above
├── js/glass.js     — VERBATIM (Signature 1)
└── js/main.js      — plates toolkit VERBATIM + choreography authored per build
```

Build order:

1. Pick the brand, copy, section roster, fonts (verify 200), ground hue, aurora palette, hero words, shapes and looks.
2. Write `js/glass.js` verbatim.
3. Write `index.html`, then `css/style.css`. The base CSS must show everything (hidden states come from JS).
4. Write `js/main.js` in this order:
   1. Helpers and the plates toolkit.
   2. Hero.
   3. Gallery data and snapshots.
   4. Bench.
   5. Closing.
   6. Text motion.
   7. Figure and specs.
   8. Nav state.
   9. Magnetic.
   10. Clock.
   11. Lenis and anchors.
   12. Veil.
   13. `boot()`.
5. `boot()`:

   ```js
   await fontsReady()    // invariant 3
   registerPlugin(ScrollTrigger, SplitText, CustomEase); CustomEase.create("lens", …); ScrollTrigger.config({ ignoreMobileResize: true })
   smoothScroll(); const heroTick = hero(); const benchTick = bench(); closing(); clock(); anchors()
   if (gsap) { heroScroll(); textMotion(); gallery(); figure(); specs(); navState(); magnetic() }
   gsap.ticker.add(() => { heroTick(now); benchTick?.(now) })   // rAF loop if GSAP is missing
   intro(); ScrollTrigger.refresh()
   ```

   Guard every GSAP call. If GSAP failed to load, add `.no-gsap`, keep the glass running, and show all steps and phases.
6. Serve and check: `python -m http.server 5173` (or `npx serve`). Walk every invariant at 1440×900, at 390×844, and with reduced motion. The console must be clean.

**Integrity:** only `fonts.googleapis.com`, `cdnjs.cloudflare.com`, and `cdn.jsdelivr.net`, with pinned versions. No analytics, trackers, or external images.

**Budget:** under 90KB of own code (excluding CDNs). The hero plate is at most 1.25 DPR and every canvas at most 1.5 DPR.

---

## HTML head & meta

- `<html lang class="no-js">` plus an inline head script that swaps `no-js` → `js` before CSS paints.
- `<meta charset="utf-8">`, viewport, `<title>Brand — Studio for …</title>` (never the brand alone), a 120–155 character description in the house voice, `<meta name="theme-color" content="#E7EBEF">` (match `--ground`), `<meta name="color-scheme" content="light">`, `og:title` and `og:description`.
- Favicon: an inline SVG data URI of the glint path in ink, `M0-1A1.105 1.105 0 0 0 1 0A1.105 1.105 0 0 0 0 1A1.105 1.105 0 0 0-1 0A1.105 1.105 0 0 0 0-1Z` in `viewBox='-1 -1 2 2'`. Reuse the same path as the nav `<symbol id="glint">`.
- Preconnect to both font hosts. `display=swap`.

## Print

In `@media print`, hide the nav, veil, every canvas, the Bench panel, and hints. Set `break-inside: avoid` on sections, black text on white, no animations, transitions, blend modes, or backdrop filters. Show the canvas `sr-only` twins as visible headings.

## Accessibility checklist

- Landmarks: `header` nav with `aria-label`, `main#main`, and a footer. Every section has `aria-labelledby`, and the heading order is h1 (sr-only) → h2 → h3.
- Canvases are `aria-hidden="true"`, except the Bench canvas (`role="img"`, `aria-label` describing it and "Drag to rotate").
- Buttons have `type="button"`. Touch targets are ≥ 44px. Decorative SVG and glyphs are `aria-hidden`.
- Text contrast is ≥ 4.5:1 (`--ink-2` on `--ground` passes; never put `--ink-3` on body copy).
- Implement `prefers-reduced-motion`, `prefers-contrast: more`, and `(hover: hover)` / `pointer: coarse` gating.

---

## LLM directives: vary vs. freeze

**Vary every run:** brand, all copy, and names; section selection, order, and count; hero word count (3–4), shape order, and per-phase looks; display and body fonts from the approved lists; ground hue within range; aurora palette; nav labels; which object gets the dark plate; the Bench swatch set; the diagram's optical story (lens, prism, mirror…).

**Never vary:** the verbatim renderer and plates toolkit; the invariants; light ground with exactly one night section; the colour-as-light rule and prism placements; the two-font width-axis system; the veil → hero stage → … → night closing spine; the accessibility and performance baselines.
