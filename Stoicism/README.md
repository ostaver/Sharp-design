# Stoa — Lavender Risograph Monumentalism

A creative-frontend portfolio (fictional persona: **Ari Kallis**) where classical architecture is printed in three riso inks, live on the GPU.

## Run

```bash
npm install
npm run dev        # http://localhost:5174  (append ?skip to bypass the preloader while iterating)
npm run build      # static output in dist/, relative base — deploy anywhere
```

## Stack

React 19 · Vite 8 · Three.js · OGL · GSAP 3 (ScrollTrigger, SplitText, useGSAP) · Lenis

## What's inside

| Section | Technique |
| --- | --- |
| **Preloader** | No counter: two drums print the temple mark as assets load — fluorescent pink first, then midnight — each ink climbing the plate behind a stochastic stipple edge while the plates drift into registration. |
| **Hero** | Procedural Doric peristyle in Three.js (46 instanced fluted columns with entasis, triglyphs, dentils, pediments, shadow maps). Never shown raw: a post pass reprints luminance onto a 5-step lavender ink ramp with stochastic stipple, a misregistered highlight ink, uneven ink laydown and light streaks. Scroll walks the camera along a spline, swings the sun behind the temple, erodes the far end into wind-blown grain (shader discard + particle field), and walks a lone figure up the stairs. |
| **Second drum** | Swap the highlight ink (hero swatches or the Press) and the temple, every image and all misregistered type re-ink at once. |
| **Manifesto** | SplitText word-by-word ink-up, inline pill images, and *Fig. 2 — The long walk*: a full-bleed house plate that opens from the centre like cella doors and dissolves into the page as stipple. |
| **Colonnade** | Pinned horizontal portico; arch-shaped images mirrored onto one fixed OGL canvas (DOM-synced planes with cover-fit, rough stippled silhouettes, cursor lens smear, scroll-velocity bend). |
| **Orders** | Doric / Ionic / Corinthian capitals drawn by scrubbed stroke, shafts rise per column. |
| **Press** | The image shader as a playable lab: master image, grain, misregistration, density, ink, "pull a print". Every pull is read back from the GPU and hung on a **drying line** — click a print to download it. |
| **Ascent** | Timeline as a staircase; a figure hops tread to tread with scroll. |
| **Inscribe (finale)** | The page ends in front of a line-drawn temple facade. The dust blown off the hero temple returns on the wind and settles into a carved inscription (≈7k grains, springs, two-ink misregistration). Type your name and the dust re-carves it; hover the stone to scatter it, click to strike; hovering the contact bays carves *SCRIBE·MIHI*, *GITHVB* (stonecutters had no U) or the studio time in Roman numerals. "Send the tablet" opens a pre-written email. The footer is the temple's three-stepped stylobate with a print control strip and colophon. |

### House plates

The three riso illustrations in `src/assets/plates/` are shown close to how they were printed (the shader keeps ~80% of the original and adds live grain): *The long walk* (Manifesto), *Listeners* (Oculus Records card and a Press master) and *Arrival* (above the finale inscription).

### Details

- Stochastic **dither transitions** hand each section's ink over to the next, like a riso gradient.
- Section titles drift **into register** (the highlight ink converges) as they arrive; buttons are magnetic.
- No browser scrollbar: the **ink level** on the right is the scrollbar — drag or click it; chapter marks label each section.
- Full-screen **phone menu**; nav ink flips over dark sections; the tab title keeps "drying" while you're away.
- The shared OGL canvas skips GPU work entirely when no image is on screen; WebGL scenes pause off-screen.

## Customise

All copy, works, links and Unsplash images live in `src/data/content.js`. Ink colours are tokens in `src/styles/base.css` and the ramp in `src/gl/riso.glsl.js`.

Accessibility: real `<img>` elements remain in the DOM for alt text and act as a CSS fallback without WebGL; `prefers-reduced-motion` disables smooth scroll and grain animation.
