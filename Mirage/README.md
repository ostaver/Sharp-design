# MIRAGE® — Perception Engineering Studio

A single-file, award-grade website where **the content itself is the illusion**. Pure black & white op-art, kinetic variable-width typography, and four working optical illusions rendered live on canvas — each with a **press-and-hold "reveal the trick"** interaction that morphs the piece into its own explanation.

> Seeing is not believing. Hold any piece — the trick confesses.

## Run it

No build step. Either:

- Open `index.html` directly in a browser, or
- Serve the folder: `npx serve .` (or `python -m http.server`)

Requires internet for two CDN resources: Google Fonts (Archivo variable) and anime.js v4 (jsDelivr, UMD global).

## The design language

| Axis | Choice |
|---|---|
| Palette | Strictly achromatic — pure white `#fff`, ink `#0a0a0a`. Color exists only as chromatic-aberration fringes (red/cyan) on hover |
| Type | One variable font, infinite voices — Archivo (`wdth` 62–125, `wght` 100–900), axes animated live per letter. No serif, no mono |
| Hero | Two CSS `repeating-radial-gradient` ring fields interfering — a cursor-reactive **moiré** that also beats while scrolling |
| Motion | anime.js v4 drives everything: object-property tweens that redraw canvases, font-axis springs, staggered mask reveals, count-ups |
| Signature | **Hold to reveal** — every illusion tweens to its "truth state" while pressed (pointer + keyboard) |

## The four works

1. **Phantom Spiral** (Fraser, 1908) — tilted dashes on concentric circles read as a spiral. Truth: tilt → 0, the spiral collapses into plain circles.
2. **Tilted Streets** (café wall, 1973) — grey mortar makes parallel rows look wedged. Truth: mortar fades, rows align.
3. **Still Water** (Kitaoka, 2003) — static discs drift in peripheral vision. Truth: palette mirrors to a symmetric ramp, motion stops.
4. **Both At Once** (Necker, 1832) — wireframe cube flips depth. Truth: shaded faces lock one interpretation.

Plus: a **Troxler fading** fixation demo in the manifesto, and a pinned horizontal **Method** section scrubbed by scroll.

## Accessibility & fallbacks

- Full `prefers-reduced-motion` path: static patterns, instant reveals, instant truth toggles
- Keyboard: every illusion is `role="button"` — hold `Space`/`Enter` to reveal
- No-JS / CDN-failure: content renders fully visible, loader removed
- DPR-capped canvases, `ResizeObserver` redraws, rAF-lerped scroll math, `overflow-x: clip`

## Files

- `Mirage/index.html` — the entire site (markup, styles, runtime)
- `Mirage/preview-hero.png` / `Mirage/preview-works.png` — screenshots
- `Mirage/README.md` — this file
