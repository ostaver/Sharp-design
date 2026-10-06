# Rhumb

A nocturnal design language for products that work while their people sleep: background agents, CI and data pipelines, monitoring, backups, logistics and night services. It ships as a **SvelteKit 2 + Svelte 5 project** that prerenders to a static `build/`. The whole page is one night on a ship's clock. It opens at dusk above a dithered green planet and ends at landfall, when the sky resolves into paper and one ink.

> The instructions the AI follows are in **`rhumb-skill/SKILL.md`**. This file explains what the skill is, when to use it, and how.

---

## What it produces

- **One fixed WebGL2 sky behind the whole page.** It is a single fragment shader drawn at one texel per 2–3 CSS px and scaled up pixelated, so every mark is a hard square. The tones come from stochastic and Bayer 8×8 dithering, and every colour is one step of a rolled palette.
- **A green night.** The signal colour is always a green (chartreuse through emerald), lit by a cool starlight rim, and the dawn that ends the night is always warm.
- **A letterboxed opening shot.** A compass-rose preloader takes a bearing, the curtain lifts in eight hard steps, and the planet boots in pixel by pixel. Scrolling drops the camera through its atmosphere, with a subtitle in the bars.
- **A ship's clock** that runs from section to section through the night, shown in the nav with bell pips, on every section head and on the side rail. Optional synthesised ship's bells strike the half hours.
- **Scroll-scrubbed machines:** a terminal that types and runs a session, live instruments that only run while on screen, a globe sailing a rhumb line with a HUD that tracks the ship, and a pinned horizontal night log with star trails turning behind it.
- **Testimonials hoisted as International Code of Signals flags**, with the flags themselves as the controls. Pricing is set as the articles of a charter party.
- **Landfall:** dawn climbs in dither bands, the paper front sweeps up, each block of text turns to ink as the front passes it, and a portolan wind rose prints itself onto the paper.
- **End credits:** a paper footer with a link roll and a container-sized wordmark over a grainy paper-to-ink gradient.

## Every build is rolled

Nothing visual is hand-picked. Before writing anything, the agent runs `roll.mjs`, a small Node script with no dependencies. It rolls a fresh chart from a random seed and writes it into the project:

- **Colours:** the exact green, the rim, the night's cast, the paper, the day ink (blue, oxblood, bottle green or iron-gall), the status colours, and the sky's dither ramps. They are computed in OKLCH and kept in gamut, and the sky and CSS always agree.
- **Type:** one sans, one mono and one serif from the approved lists.
- **The clock and the course:** the bearing, the start and landfall times, and every section's time.
- **The line-up:** which 3–6 sections sit between the hero and landfall, their order and labels. The roll never puts three pins in a row, always leaves room for the dawn, and keeps the hand-off at dusk and the charter in the morning.
- **The layout:** a variant for every section (which side the copy, globe, terminal, quote and rose sit on, column and tier counts, the night log's scale), plus the rail side and the clock position.
- **The sky scene:** the corner the planet rises from, the globe's side and tilt, pixel size, graticule, number of loxodromes, star density, meteor rhythm and the Milky Way's angle.

Across 400 test rolls there were 400 different signal colours, 400 different layout combinations, 151 different section line-ups and 59 font trios.

## How to use it

1. **Give the agent the whole `rhumb-skill/` folder**, not just `SKILL.md`. The `kit/` folder holds the sky shader and renderer, the scroll choreography, the reveal system, Lenis wiring, the bell synth and the signal flags, which the agent copies into `src/` unchanged. `roll.mjs` rolls the build. The repo does not include the reference build.
2. **Provide context:** the product and a one-line proposition, what runs overnight, the numbers worth quoting, 3–6 things the product does (these become instruments), a night's worth of log entries, the pricing tiers, and the call to action (an install command, a booking line or a handle).
3. **Let it roll:** the agent runs `roll.mjs` and reports the seed, colours, fonts, bearing, line-up and layout variants.
4. **Generate:** the agent writes the project folder.
5. **Run:**

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # static site in build/
npm run check
```

## Requirements

- Node 20.19+ and npm.
- An agent with local file access that can run a command (Claude Code, Codex, Cursor and similar). This skill outputs a multi-file project, copies bundled files and runs the roll, so it will not work in a plain chat window.
- No network access at runtime. Fonts are self-hosted through Fontsource.
- A browser with WebGL2 for the full sky. Without it, the page falls back to a CSS gradient and stays complete.

## Tech stack

- **SvelteKit 2 + Svelte 5 (runes)** with `adapter-static`. The page is fully prerendered and uses relative paths.
- **OGL 1:** the sky's one full-screen triangle.
- **GSAP 3.15:** ScrollTrigger, SplitText, ScrambleText, DrawSVG and CustomEase (eases `helm` and `haul`).
- **Lenis 1.3:** smooth wheel scrolling on the GSAP ticker. Touch stays native.
- **Web Audio:** the bell and the surf. There are no audio files.
- **Fontsource:** the rolled sans, mono and serif.

## Notable characteristics

- **Scrolling is time passing.** Every section is stamped with the ship's time, and the clock, sky, rail and theme are all read from scroll position in one place (`choreo.js`).
- **One picture.** No images ship apart from an optional social preview. Everything visual is GLSL, SVG or CSS.
- **Night, then paper.** There is no theme toggle. The page turns to day exactly once, at landfall, and the turn is the sky's own dither, not a CSS fade.
- **An instrument voice.** All labels are mono and uppercase, numbers sit on scales, headings are two clauses with the second muted, structure is drawn in hairlines, and corners are square.
- **No hand-written colours.** Components use only tokens and `color-mix()` of tokens. The kit carries no colour or font values of its own.
- **Full fallbacks.** Under reduced motion the pins release, the night log becomes a vertical list, the terminal shows fully printed and the sky freezes in time. On phones, touch scrolling stays native, and backdrop blur, grain and the pointer wake are switched off.
- **Short screens.** A pinned stage never outgrows the viewport. The hero stops being sticky below 700px tall, the hand-off pins only from 660px and the night from 640px, with a compacted layout in between; below those heights the sections flow as ordinary scrolling content. Landfall's title scales with height, so the install line stays in frame on a phone on its side or a small laptop window.
- **Never stuck.** The preloader's wait is capped at 4.5s, so its scroll lock cannot outlive a throttled tab or a stalled font, and the phone menu closes itself (and frees the page) if the viewport grows past the phone breakpoint.

## Files in this skill

```structure
Rhumb/
├── rhumb-skill/
│   ├── SKILL.md                 # the full instructions the AI follows
│   ├── roll.mjs                 # rolls the build: tokens, sky config, sections, fonts, favicon, chart
│   └── kit/                     # copied into src/ unchanged
│       ├── app.html, app.css    # pre-paint classes and scroll reset; base styles (no colours or fonts)
│       └── lib/
│           ├── gl/              # sky.frag.glsl, Sky.js, bus.js, glsl.js, glsl/common.glsl
│           ├── motion/          # choreo, gsap, scroll, reveal, focus, cine
│           ├── components/      # SkyCanvas, Cinema, Flag
│           ├── audio/bell.js    # Web Audio ship's bell and surf
│           └── state.svelte.js, time.js, flags.js
├── preview-*.png                # from a build rolled by the skill
└── About.md                     # this overview
```

## Size

- `SKILL.md`: ~10,200 words, ~67,500 characters, **~17k tokens**.
- Kit: ~68 KB across 20 files, plus `roll.mjs` (~20 KB). The agent copies and runs them and does not need to read them in full.

## Recommended models

**Recommended:**

- Claude models
- OpenAI / GPT / Codex models
- DeepSeek models
- Kimi K2.6 or Kimi K2.5
- GLM / Z.ai models
- Qwen models (larger models recommended)

**Not recommended:**

- Mistral models
- Meta / Llama models
- Flash / mini / small-tier models of any family

> The sky, the choreography and every visual choice ship as code or are rolled, so weaker models can't break the shader or drift off-palette. They go wrong in the components instead: layout variants that are ignored, `data-*` styles missing their `:global()` and silently dropped by Svelte, pins left sticky under reduced motion, and night-log cards that overlap. If a smaller model is unavoidable, check each section component against `rhumb.chart.json` and run the walk-through in the skill's Construction method yourself.

---
**Overall score: 9.9/10.**
What can be improved: **Requires an agent with local file and command-line access to run `roll.mjs` and copy the kit, rather than a single-prompt chat. The nocturnal maritime metaphor is strictly suited for tools, agents, and pipelines that operate through the night.**
What is good: **The premier flagship skill in Sharp Design. Generative per-build rolling ensures zero visual repetition across colours, typography, clock timing, and layouts. The WebGL2 dither sky, scroll choreography, and ink-to-paper landfall ship as tested, production-grade SvelteKit 2 + Svelte 5 code with full reduced-motion and touch fallbacks.**
