# ARCADIUM

A single-page site for **ARCADIUM**, a fictional coin-op archive and preservation society on Pier 9. Forty-one cabinets, 1976–1996, kept in working order. The page is a dark arcade: it arrives unpowered, and nothing happens until a coin goes in.

The site *is* the room:

- You arrive at a dead machine. `INSERT COIN` — click the coin door or press **C**. The coin travels to the slot, the door clunks, and the CRT powers on with a degauss.
- The hero is a live ASCII field (Three.js ring wave). Your pointer is the disturbance; the wave swells and whites out around it.
- Scrolling walks you sideways down the dark hall. Six cabinets stand in a pinned row, each with its own attract-mode animation running on canvas at a chunky 11fps. They light up as you reach them, and a pac-line eats its dots as you cross.
- One machine is playable: the house ASCII Breakout. Mouse or arrows move the bat, space serves. Clear a sheet and the ink gets faster.
- The nightly ledger prints its rows by resolving characters, then the sheet goes into the furnace — a real fluid-simulated fire rendered as ASCII, which you can stir, drag through, and ignite.
- Admission is a token. Three coins flip over on their edge to show what they buy.
- The page ends on `GAME OVER` and an **Insert coin to continue** button that reboots the hall.

## About these notes

These notes describe the reference build the skill was extracted from. The build's source is no longer in the repository. The `preview-*.png` screenshots come from it, and the reusable parts (both effects and the runtime helpers) ship in [`arcadium-skill/`](arcadium-skill/). To get a site like this one, give an agent the whole `arcadium-skill/` folder. See [About.md](About.md).

## Constraints honoured

The brief forbids a set of common tells. None of them appear:

| Forbidden | What the site does instead |
|---|---|
| Numbers counting up | Scores are static ledger ink; the only number that moves is the game's own score, which changes because you played |
| Brand logo marquee | Marquees are cabinet nameplates, one per machine, physically part of the cabinet |
| Generic intersection-observer reveals | Text arrives by character resolution; cabinets light by measured proximity to the viewport |
| Indexed pages / gratuitous numbering | Sections are named things (The Floor, The Ledger, The Furnace), not chapters |
| Generic loading screen with numbers | There is no loader. The machine is off until you put a coin in it |
| Simple glows / hovers | Buttons are beveled machine pushbuttons that travel 5px when pressed; nav links invert to a cursor-bar; cards flip on a real 3D axis |

## Required effects

- **Main — `AsciiWave.tsx`** (shipped in `arcadium-skill/effects/`), ported from the original *Ascii Wave* effect. A Three.js fragment shader that tiles the screen into 4×6 glyph cells and picks a glyph density per cell from an expanding ring wave. Added a `uPower` uniform and a `setPower()` handle so the field can be driven from 0 to 1 by the coin-drop timeline, and so "insert coin to continue" can flicker it.
- **Side — `ascii-flame.js`** (shipped in `arcadium-skill/effects/`), ported from the original *blaze* effect. A dependency-free `<ascii-flame>` web component: a 2D Eulerian stable-fluids solver (buoyancy, curl-noise turbulence, vorticity confinement, SOR pressure projection, RK2 advection, noise-modulated combustion) rendered as a glyph ramp with a sprite atlas, ember particles, smoke, and a two-pass bloom. `AsciiFlame.tsx` wraps it for React and exposes `ignite()` / `gust()` to the furnace buttons.

The original flame source was markdown-escaped; it was unescaped in a single pass (`&#x20;` → space, `\X` → `X`) and syntax-checked with `node --check`. The skill's copy of the wave also adds WebGL context-loss handling.

## How it works

- **`App.tsx`** owns the session: the boot gate (scroll stays locked until a coin lands), Lenis smooth scroll wired to ScrollTrigger, the custom crosshair cursor, and the CRT stack (scanlines, vignette, flicker, and the power-on flash).
- **`Hero.tsx`** is the coin door. The coin's flight is a three-stage GSAP timeline measured off live DOM rects, so it lands in the slot at any viewport size. Power-on runs the flash, the degauss wobble, the field ramp, the boot fade and the title decode off one timeline.
- **`Floor.tsx`** pins the hall and translates the track against scroll. Progress-driven work (pac-line, foreground parallax, cabinet lighting) runs on a GSAP ticker reading live geometry rather than in `onUpdate`, so nothing lags the scrub.
- **`CabinetScreen.tsx`** holds six hand-written attract animations — a vector warp field, a maze chase, a wheel-road horizon, a sonar sweep, a dungeon torch that flickers on a sine, and an orbital league — all drawn as text on one canvas each.
- **`Breakout.tsx`** is a real game loop: angle-off-the-bat reflection, per-brick points, screen shake, three balls, escalating sheets.
- **`lib/scramble.ts`** resolves text character by character into place. **`lib/sound.ts`** is a small WebAudio synth — every sound in the site is a square or triangle blip, no audio files.

## Accessibility and fallbacks

- With `prefers-reduced-motion`: no smooth scroll, the hall unpins into a normal sideways scroller, the field and headings appear finished, all looping animation is off, and the flame caps at 24fps.
- The boot gate is reachable by keyboard (**C**, or Enter/Space on the coin door), and the game canvas is focusable with an `aria-label` describing the controls.
- Token cards flip on `:focus-within` as well as hover, so they work without a pointer.
- The cursor is only swapped out on `(hover: hover) and (pointer: fine)` devices.

## Facts on the page

The archive, its cabinets, staff, hours and scores are invented. Breakout is a genuine 1976 Atari title; everything else here is fiction built to look like a conservation record.
