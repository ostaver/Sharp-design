# Stoicism

Lavender risograph monumentalism for creative developers, design studios, architects, museums and cultural institutions. It ships as a **React 19 + TypeScript + Vite project** that builds to a static `dist/`. Classical architecture is printed live in riso inks: a procedural Doric temple and every photograph on the page are re-printed by one GPU "press" in a key ink, four papers and a misregistered second drum.

> The instructions the AI follows are in **`stoicism-skill/SKILL.md`**. This file explains what the skill is, when to use it, and how.

---

## What it produces

- **A live WebGL temple** (Three.js): a procedural peristyle reprinted every frame onto a five-step ink ramp with stochastic stipple. As you scroll, its far end and the letters of the hero name erode into wind-blown grain.
- **One press for every picture** (OGL): a single shared canvas re-inks every image plane, bowing with scroll velocity and smearing under the cursor. It falls back to real `<img>` elements on context loss and restores itself afterwards.
- **A second drum:** switch the highlight ink and the temple, every image, the dust and all misregistered type re-ink at once.
- **Drawn capitals:** Doric, Ionic and Corinthian elevations with masked depth layers, drawn by scrubbed stroke.
- **The press:** a playable shader lab whose pulled prints hang on a drying line and download as JPEGs.
- **A staircase timeline, a pinned colonnade of work,** and **a finale** where the temple's dust settles into a carved inscription of the visitor's name, above a stepped stylobate footer.

## Every build is rolled

`roll.mjs` (Node, no dependencies, no network) rolls a fresh chart from a random seed:

- **Palette:** the paper and key-ink hue, always blue-violet (OKLCH 258°–300°).
- **Inks:** four pastel riso drum inks, drawn from a set of 12.
- **Typefaces:** one display face, one serif and one mono, drawn from 5, 4 and 4 candidates.
- **Temple:** its column grid (6 × 13, 8 × 17 or 6 × 14) and which side it stands on.
- **Line-up:** 3–5 middle sections chosen from five, plus their order, labels and papers.
- **Layout:** a variant for every section.

## How to use it

1. Give the agent the whole `stoicism-skill/` folder (`SKILL.md`, `roll.mjs` and `kit/`).
2. Provide context: who or what the site is for, a name for the hero, 4–7 works, three capability layers, a short chronicle, an email, a city and time zone, and optionally your own CORS-enabled images.
3. The agent scaffolds the project, copies `kit/` into `src/`, runs the roll and reports the seed, then writes the content and section components.
4. Run:

```bash
npm install
npm run dev      # http://localhost:5176
npm run build    # type-checks, then writes the static site to dist/
```

## Requirements

- Node 20.19+ and npm, and an agent with local file access that can run commands.
- A WebGL browser for the full experience (there are printed fallbacks without it).
- Network access at runtime only for photographs. Fonts are self-hosted through Fontsource.

## Tech stack

React 19 · TypeScript (strict) · Vite 8 · Three.js · OGL · GSAP 3.15 (ScrollTrigger, SplitText, useGSAP) · Lenis · Fontsource.

## Validation

The kit and roll were validated by building a fresh site from the skill, with a new persona and two different seeds covering every section and variant. The checks that passed:

- Strict `tsc` and `vite build` with zero errors.
- Desktop (1440×900) and phone (390×844) walk-throughs.
- Reduced motion, and a live resize from desktop to phone and back, with no console errors.
- Forced WebGL context loss and restore.

## Files in this skill

```structure
Stoicism/
├── stoicism-skill/
│   ├── SKILL.md        # the full instructions the AI follows
│   ├── roll.mjs        # rolls palette, inks, fonts, temple, line-up and layout
│   └── kit/            # copied into src/ unchanged (TypeScript)
│       ├── lib/        # types, motion, ink, noise, ground, capitals, clock, roman, color
│       ├── gl/         # riso.glsl, TempleScene, RisoGallery, DustInscription
│       ├── components/ # RisoImage, Plate, Capital, Chrome, Preloader
│       └── styles/base.css
├── preview-*.png       # from a build rolled by the skill (seed probe-104)
└── About.md
```

## Size

- `SKILL.md`: ~8,400 words, ~55,700 characters, **~14k tokens**.
- Kit: ~120 KB across 19 files, plus `roll.mjs` (~17 KB). The agent copies and runs them and does not need to read them in full.

## Recommended models

**Recommended:** Claude models, OpenAI / GPT / Codex models, DeepSeek, Kimi K2.x, GLM, larger Qwen models.

**Not recommended:** Mistral, Meta / Llama, and flash / mini / small-tier models of any family.

---
**Overall score: 9.6/10.**
What can be improved: **Requires an agent with local file and command access to copy the kit and run `roll.mjs`. It ships about 1.1 MB of JavaScript (three.js is most of it), and images must come from CORS-enabled hosts.**
What is good: **One GPU press prints the temple and every photograph, so any image becomes on-brand. Per-build rolling varies hue, inks, fonts, temple, sections and layout. The kit is strict TypeScript and was validated end to end, including reduced motion, resize and WebGL context loss and restore.**
