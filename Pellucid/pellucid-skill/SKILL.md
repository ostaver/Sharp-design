---
title: design-pellucid-optical-objects
description: A light, optical, chromatic design language for object makers, material brands, and studios whose product is how something looks through, around, or inside it. Builds a small static site (HTML/CSS/JS folder) around a live WebGL liquid-glass raymarcher (bundled in kit/glass.js) that refracts the page's own typography, driven by GSAP ScrollTrigger, SplitText, and Lenis.
---

# Pellucid

You are designing in the Pellucid language. This is not a page to copy. It is a set of convictions, proportions, and optical rules that produce luminous, precise, lab-calm pages. Every output should feel unmistakably Pellucid, and never identical to a prior run.

## Core conviction

Pellucid is high-key and optical: daylight porcelain grounds, near-black ink, and colour that appears only as *light behaviour*: refraction, dispersion, caustics, iridescence. It lives where an optics lab meets a gallery plinth. The signature is a real glass object, raymarched live in WebGL, bending the page's own typography behind it. Everything else serves that moment: hairline grids the glass can distort, giant condensed words it can split, small frosted CSS panels that echo it.

"Don't show the object. Show what it does to the room."

Never:

- **Reproduce the reference copy.** The brand name "Pellucid", the hero words (PELLUCID / REFRACT / DISPERSE / RESOLVE), edition names (Halo, Orbis, Chiasm, Glint, Meridian), the section headings ("Five editions, cast this season.", "Tune the glass. Watch the world bend.", "Sand to signal in four stages.", "Measured, not described.", "Let light in."), the Bench default text ("Hold it to the light"), Rotterdam addresses, specs and taglines all belong to the reference build. Invent all copy from the user's brief.
- **Reproduce the reference layout.** Reorder sections, vary the count, vary hero shape order and phase count. Never repeat a section type.
- **Rewrite the glass renderer.** It ships as `kit/glass.js` in this skill and is copied byte for byte, never rewritten. Custom raymarch maths is the main source of broken builds.

---

## Non-negotiable invariants

Each of these broke a real Pellucid build. A build that violates any of them is broken no matter how it looks. Treat this list as the delivery gate.

1. **`js/glass.js` is a byte-for-byte copy of `kit/glass.js`.** Do not "simplify" the shader or retype it from memory. If you ever add a 2D star/flank SDF elsewhere, the carving circles must pass through the tips without crossing the arms: for tips at (1,0) and (0,1) the circle centre (c,c) needs c ≥ 1. A smaller c severs the arms, leaving a half-size object with floating needle specks.
2. **No `atan()` in any procedural colour term** on a plate or caustic. Its ±π wrap draws a hard seam. Use `e.x / (length(e) + 1e-4)` or similar continuous terms.
3. **Plates are painted only after fonts load.** Await `document.fonts.load()` for every exact weight/stretch the canvases use (e.g. `'condensed 700 100px "Family"'`), raced against a 2.5 s timeout. Canvas otherwise measures the fallback font and mis-sizes every word.
4. **Plates match their canvas.** Resize and repaint a plate inside the renderer's `onResize(cssW, cssH)` so its aspect equals the canvas aspect. Repaint on change only, behind a dirty check, then call `glass.markPlate()`. Never re-upload unconditionally every frame.
5. **Plate words never collide with live DOM text.** When a section has both, compute the word block's centre and height from DOM measurements: from the bottom of an inner element (e.g. the eyebrow) to the top of the copy block, not from a padded wrapper and never from fixed fractions. Derive the glass `offsetY`/`size` from the same numbers. On phones, reserve the gap with padding (`34svh`) and measure from inside it.
6. **The intro veil can never trap the page.** It displays only under `.js`. It carries a CSS failsafe (`animation: veil-failsafe .6s 8s forwards` → `opacity:0; visibility:hidden`) and is removed immediately when GSAP is missing or `prefers-reduced-motion` is set.
7. **Phones can always scroll.** Hero and closing canvases use `touch-action: pan-y` and ignore touch drags. Only the Bench canvas takes `touch-action: none` + `touchDrag: true`.
8. **WebGL failure degrades to the plate.** If `glass.ok` is false, add `.no-webgl` and mount the plate canvas itself as a static image. Pass the same fallback as `onLost` so a lost context (the renderer stops itself on `webglcontextlost`) ends in the plate too, never a blank canvas. The page must still read.
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

**The file ships with this skill as `kit/glass.js`. Copy it byte for byte to `js/glass.js`; never edit it.** If `kit/glass.js` is missing, stop and ask for the whole `pellucid-skill/` folder. Do not rewrite the renderer from memory.

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
├── js/glass.js     — copy byte-for-byte from kit/glass.js (never rewrite)
└── js/main.js      — plates toolkit VERBATIM + choreography authored per build
```
Build order:

1. Pick the brand, copy, section roster, fonts (verify 200), ground hue, aurora palette, hero words, shapes and looks.
2. Copy `kit/glass.js` byte-for-byte to `js/glass.js`. Never rewrite or modify it.
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
