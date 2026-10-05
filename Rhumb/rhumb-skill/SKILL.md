---
title: design-rhumb-nightwatch
description: "A nocturnal design language for products that work while their people sleep: background agents, CI and data pipelines, monitoring, backups, logistics, night services. The page is one night on a ship's clock. A fixed WebGL2 sky in hard-pixel stochastic and Bayer dither (a planet the camera dives through, a globe sailing a rhumb line, star trails turning over a pinned night log) sits under instrument-panel mono labels in a green signal colour, and at landfall the dither resolves into paper and one ink. Every build is rolled by a seeded script that picks its colours, fonts, clock, sections, layout and sky scene, so no two builds match. SvelteKit 2 + Svelte 5, OGL, GSAP (ScrollTrigger, SplitText, ScrambleText, DrawSVG) and Lenis."
---

# Rhumb

You are designing in the Rhumb language. This is not a template to copy. It is a set of convictions, proportions and taste lines that produce nocturnal, instrument-grade, cinematic pages. Every build should feel unmistakably from the same language and never be identical to a previous one.

## Core conviction

Rhumb is one night. **The page starts at dusk on a running ship's clock and ends at landfall, on paper.** Everything above the landfall is night: a near-black ground, a dithered sky drawn in hard square pixels, a green signal light, and type set like the labels on a ship's instruments. At landfall the dither sweeps up from the bottom and resolves into paper, and the text turns from signal-on-black to ink-on-paper as the front passes it. Night first and paper last is absolute. There is no theme toggle.

The aesthetic sits where a bridge at night meets an engraved chart: calm, exact, a little dry. Every section is stamped with the ship's time. One bearing (a three-digit course such as 312°) recurs everywhere: the preloader needle, the globe's rhumb line, the wind rose, the logo. Every visual is drawn in code: a GLSL shader, SVG and CSS. No raster images ship apart from an optional social preview. "Hold one heading through the night."

**Nothing visual is hand-picked.** Each build runs `roll.mjs` once, which rolls a fresh chart from a random seed: colours, fonts, bearing, clock, the section line-up and order, each section's layout variant, and the sky scene. You write the copy and the components; the chart decides how they look and where they sit. Never hard-code a colour, a font or a layout choice that the chart owns, and never reuse an earlier seed.

Two things you must never do:

- **Do not reproduce the reference copy.** The reference build sold a fictional overnight coding agent called *Ostarev*. Its brand, product details, customers, quotes, numbers and section titles belong to that page. Invent your own in the same voice.
- **Do not override the chart.** If the chart puts the copy on the right, the globe on the left, four pricing tiers in a ledger and the rail on the right, build exactly that.

Use Rhumb for things that run for hours without a person watching, or that belong to the night: agents, schedulers, CI, data pipelines, observability, backups, freight and logistics, night trains and ferries, observatories, sleep products. It is a poor fit for bright retail, food or anything that needs daylight photography.

---

## The roll (do this first)

`roll.mjs` sits next to this file. Run it once per build, after the kit has been copied (see Construction method):

```bash
node <path-to>/rhumb-skill/roll.mjs --out <project>
```

It needs only Node and uses no network. With no `--seed` it picks a random one, so every run differs. `--seed <text>` reproduces an earlier chart and is only for repairing a build in progress. It writes:

| File | What it holds |
|---|---|
| `src/tokens.css` | every colour token, the three font stacks, `--f-features`, rail clearance (`--rail-clear-start/end`) and the `prefers-contrast: more` overrides |
| `src/lib/sky.config.js` | `skyConfig`: bearing, pixel size (`cssCell`), the sky palette (exactly matching the tokens), the sky layout and the scene |
| `src/lib/chart.js` | `sections` (the line-up in page order: `id`, `n`, `type`, `label`, `time`, `icon`, `role`, `span`), `layout` (each section's variant and the chrome's), `coordinates` and `seed` |
| `src/routes/+layout.svelte` | the font imports, then `../tokens.css`, then `../app.css` |
| `static/favicon.svg` | the wind-rose mark on `--night`, with the needle in `--signal` on the bearing |
| `rhumb.chart.json` | the whole chart, including `layout` (each section's variant), `clock`, `coordinates` and the seed |

It also sets `theme-color` in `src/app.html` to `--night`, and swaps the Fontsource dependencies in `package.json` for the rolled fonts.

- Never edit `tokens.css`, `sky.config.js` or `chart.js` by hand. If something must change, roll again.
- Read `rhumb.chart.json` before writing anything, and state the seed, signal, fonts, bearing and line-up back to the user.
- Put the seed in the project README.

---

## Voice

The tone is dry, exact and quietly confident. It borrows from ship's logs, chart notes, watch handovers and good release notes. The writer is the officer of the watch: they report what happened with numbers, never sell, and never raise their voice.

**Rules:**

- Say the proposition plainly in the first line, then prove it with a specific number. Use numbers like "412 files", "median 212 ms", "1.8 M events replayed" or "#4182", never round marketing figures.
- No superlatives, no exclamation marks, no "revolutionary", "seamless", "unleash" or "supercharge".
- Ledes run two or three short sentences and end on a concrete benefit. Log lines are past-tense noun phrases: "Adapter compiled", "Three soundings red", "Course corrected 3.1°".
- Re-label the product's concepts nautically, but keep the literal meaning obvious. Plan = chart, tests = soundings, checkpoints = anchors or waypoints, sub-processes = crew, history = the log, integrations = the helm, pricing = the charter, the task's deadline = "until 07:00", done = landfall.
- Headings are two clauses. The first is in full text colour and the second is muted: "Nine hours, *one heading.*" One section heading may stand alone.
- Micro-lines are log entries: `20:06 · through the cloud deck`, `clear to the east · wind ene 3 · 312°`. Use ` · ` (middle dot) as the separator and `→` for ranges ("21:00 → 06:00").
- One line on the page strikes a word through, drawn by hand (for example "Local-first. Any model. No ~~babysitting~~."). Use it once.
- Set the typography properly: curly quotes and apostrophes, a real minus (−), degree and prime marks (use the chart's `coordinates`), non-breaking spaces before units where needed.
- Names feel like harbours, boats and gear ("Tidewater", "Halyard", "Brine & Co", "Lantern"). Plan tiers are ranks (Deckhand, Navigator, Fleet). Invent your own each build.
- Approved vocabulary: watch, bearing, heading, course, chart, sounding, drift, helm, crew, log, waypoint, anchor, landfall, fix, bells, halyard, hoist, charter, berth, first light. Section labels come from the chart.

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** opens letterboxed on a planet limb rising from a bottom corner of the dithered sky. The title sits on the opposite side (`layout.hero.copy`). Scrolling dives the camera through the planet's atmosphere and out onto the night side.
- **Rhythm:** pinned, scrubbed sections (hero, hand-off, bearing, the night, landfall) alternate with free-scrolling ones (instruments, signals, charter). The roll never puts three pins in a row.
- **Separators:** no boxes and no bands. Sections are divided by space and by the section head: a numbered mono label with a hairline that fades to nothing.
- **Structure:** hairlines only, at three strengths. Grids share borders like a table (`border-top/left` on the list, `border-right/bottom` on each cell). Corners are square.
- **Backgrounds:** sections are transparent over the fixed sky. When busy sky sits behind small type, add a local scrim: a gradient of `color-mix(in srgb, var(--night) 50–80%, transparent)`. Never use a flat panel colour.
- **Section head** (every section except the hero): `[number in signal] [label] [rule fading out] [ship's time]`, using `n`, `label` and `time` from `chart.js`.
- **Content:** move from words to instruments and back. A text-forward section should be followed by one that shows the product working (a terminal, gauges, a log).
- **Data:** display it like instrument readouts. Numbers are tabular, units sit in signal at .55em, every figure has its own scale with a pip, and every label is mono uppercase.

**Refuse:**

- Cards with radius, drop shadows (the single exception is the terminal), glassy gradients, pill badges, emoji or icon fonts.
- Logo belts. Customers are set as a sentence in the serif.
- Count-up numbers without a scale, generic fade-ins on everything, and parallax for its own sake.
- Stock photography, illustrations or 3D renders. The sky is the only picture.
- Daylight anywhere before landfall.
- Literal colours in component CSS. Every colour is a token, or a `color-mix()` of tokens (with each other or with `transparent`). Mask gradients use `#000` and `transparent` as alpha, not as colour; that is the one exception.

---

## Color

Rhumb has **two states on one page**: night until landfall, then paper. `html.day` turns on when the dawn front has swept past the top of the viewport, and the CSS and `theme-color` follow it. There is no toggle.

**Commitment level: a ship's bridge at night, lit green.** The ground is a near-black that almost disappears. One saturated green signal carries every accent, a cool starlight blue lights the edges, and three muted status colours report results. After landfall, one ink on warm paper.

All values come from `tokens.css`. These are the rules the roll follows (OKLCH hues), so you know what each token is for:

| Token | Role | Rolled within |
|---|---|---|
| `--night`, `--night-1`, `--night-2` | ground and two raised grounds | lightness 11–14%, a faint green or blue cast |
| `--panel` | translucent instrument ground | `--night` at .78 |
| `--hair`, `--hair-2`, `--hair-3` | hairlines | text colour at .085 / .15 / .26 |
| `--text`, `--text-2`, `--dim`, `--muted`, `--faint` | text ramp | 96 / 84 / 75 / 63 / 41% lightness |
| `--signal`, `--signal-2`, `--signal-glow` | the one accent, its deeper step, its glow (.18) | **green**: hue 128°–162° (chartreuse-green to emerald), lightness 80–87%, high chroma |
| `--rim` | edge light, neutral log tags | starlight blue, hue 222°–268° |
| `--ok`, `--warn`, `--bad` | pass, noted, fail | pale mint, amber, coral-red |
| `--paper`, `--paper-2` | landfall ground | warm, unbleached, hue 72°–95°, never white |
| `--day-accent`, `--day-accent-2` | the one ink after landfall | one family per build: blue, oxblood, bottle green or iron-gall |
| `--ink`, `--ink-2` | body text on paper | the day accent's hue, darker and greyer |
| `--vignette-night`, `--vignette-day`, `--bars` | Cinema's lens and letterbox | derived |
| `--flag-r/b/y/w/k` | signal-flag red, blue, yellow, white, black | derived |

**Rules:**

- The signal marks what is current, active or numbered, never decoration. It is used for section numbers, the last hero line, the command bar's `$` prompt, active tabs, steps and rail cells, the night log's marker, current card and watch name, the ship label's border, scale pips and unit suffixes, progress bars, the featured tier's rules and its filled button, focus rings and `::selection`.
- The status colours carry results only: test counts, tags in the log, diff stats. Never use them for decoration.
- For alpha variants use `color-mix(in srgb, var(--token) N%, transparent)`, for example `color-mix(in srgb, var(--night) 74%, transparent)` for a scrim or `color-mix(in srgb, var(--day-accent) 16%, transparent)` for a hairline on paper. For in-between steps mix two tokens. Never write `rgba()` or hex in a component.
- Hover transitions use `var(--ease)` and last .3–.6s. Theme turns (night → ink) use `color .35s linear`.
- Under `.day`, chrome (nav, rail, focus, the command bar) switches to paper and ink tokens through `:global(.day)` rules.

### The sky palette

`skyConfig.palette` holds the shader's colours. Every colour in the sky is one of these; the dither picks between neighbouring steps and never blends them:

- `bg` (equals `--night`), `grain` (a speckle on 7.5% of the night), `white` (stars, dust, the sailed course), `paper` (equals `--paper`) and `paperGrain`.
- `body` (6 steps): the green planet and globe, running night → dark green → mid green → `--signal-2` → `--signal` → pale green.
- `rim` (5 steps): signal → teal → `--rim` → pale blue → near-white.
- `dawn` (8 steps): night → indigo → plum → rose → coral → apricot → cream. The dawn stays warm whatever the signal: green night, warm sunrise.

The roll guarantees `bg === --night` and `paper === --paper`, which the canvas, the fallback and the footer seam all depend on.

---

## Typography

This is a **three-font system**. A tight sans carries headings and body, a mono carries every label, tab and readout (the instruments' voice), and an editorial serif, almost always italic, carries the human moments. Fonts are self-hosted with Fontsource and there is no Google Fonts request. The roll picks one family from each list and never repeats the reference trio:

- **Sans:** Geist, Inter Tight, Hanken Grotesk, Schibsted Grotesk, Onest (all variable).
- **Mono:** Geist Mono, JetBrains Mono, Red Hat Mono (all variable).
- **Serif:** Instrument Serif (static 400 and italic), Newsreader, Fraunces, EB Garamond (variable, with italic).

Use them only through `var(--f-sans)`, `var(--f-mono)` and `var(--f-serif)`. `--f-features` turns on the sans's stylistic sets where it has them.

**Scale (sans):**

- Hero h1: `clamp(3rem, 6.35vw, 6.4rem)`, weight 520, line-height .95, letter-spacing −.048em, with an optical nudge of −.06em toward the outside edge. On phones (≤640px) use `clamp(2.6rem, 11.5vw, 3.6rem)`. It has 2 or 3 lines (`layout.hero.lines`), graded `--text` → `--text-2` → `--signal`. The last line is always the signal; with two lines, the first is `--text`.
- Section h2 (`.h-section`): `clamp(2.35rem, 4.7vw, 4.6rem)`, weight 500, line-height .98, letter-spacing −.042em, `text-wrap: balance`, with the second clause in `<span class="dim">` (`--muted`).
- Landfall title: `clamp(3.2rem, 8.2vw, 8.4rem)`, weight 520, line-height .92, letter-spacing −.055em, max-width 11.5em.
- h3 in cells, cards and tiers: 1.02–1.3rem, weight 520–540, letter-spacing −.015 to −.03em.
- Lede (`.lede`): `clamp(1rem, .35vw + .93rem, 1.125rem)`, line-height 1.62, `--dim`, `text-wrap: pretty`, max-width 36–47ch.
- Body: 16px/1.55. Small body: .86–.94rem/1.45–1.55.

**Mono rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| `.label` (base) | 11px | 450 | .16em | upper |
| Section head, tabs | 10.5–11px | 450 | .16–.17em | upper |
| Readouts, captions, tooltips | 9.5–10.5px | 450 | .12–.24em | upper |
| Eyebrow (hero) | 10.5px | 450 | .24em | upper |
| Terminal and code | 12–13.5px / 1.75 | 400 | .005em | as typed |
| Clock time | 12.5px (nav), 22px (log readout) | 400 | .02–.06em | tabular-nums |

**Serif (italic unless noted):** a rotating name at the helm (1.5rem), a dictionary word (1.55rem) with an upright definition (1.2rem/1.4), prices (upright, `clamp(3rem, 4.6vw, 4.4rem)`, line-height .95), the aside at landfall (`clamp(2.6rem, 6.4vw, 6.6rem)`), the crews sentence (`clamp(1.5rem, 2.4vw, 2.3rem)`) and the footer's closing line (`clamp(2.4rem, 3.9vw, 5.6rem)`). Letter-spacing −.01 to −.02em.

**Rules:**

- Never add a fourth family. Never use bold above 600. Display weights live between 480 and 560.
- Load four styles at most: sans, mono, serif upright and serif italic. Fontsource splits each into unicode-subset files; that is fine.
- Use `font-variant-numeric: tabular-nums` on every changing number (clock, counters, readouts).
- Headline letter-spacing is always negative and labels are always positive. Never mix those up.

---

## Motion

Motion in Rhumb is **scroll-bound, long-decelerating and mechanical where it is a machine**. Scrolling is time passing. Most motion is tied to scroll position, either scrubbed or fired once. The only free-running loops are instruments, which run only while on screen, plus the twinkle in the sky.

### The kit (copy, don't rewrite)

This skill folder holds `kit/`. Copy it into `src/`, keeping the paths (`kit/lib/motion/gsap.js` → `src/lib/motion/gsap.js`, `kit/app.css` → `src/app.css`, `kit/app.html` → `src/app.html`). Copy the files byte for byte and never edit them; the roll fills in everything that varies. If the kit folder or `roll.mjs` is missing, stop and ask for it. Do not rewrite the shader from memory.

| Kit file | Gives you |
|---|---|
| `app.html` | pre-paint classes `js`, `rm` (reduced motion), `no-intro` (`?skip`), and `scrollRestoration = 'manual'` before the browser restores a mid-page offset |
| `app.css` | reset, focus, `.label`, `.h-section`, `.lede`, `.sec-head`, `.wrap`, `.skiplink`, `.sr-only`, SplitText mask padding, `.x-fade`, Lenis rules, `#lvh-probe`, horizontal-overflow clipping on `main` and the footer, phone and reduced-motion and print rules. No colours or fonts |
| `lib/gl/glsl.js`, `lib/gl/glsl/common.glsl` | `#include` resolver, full-screen vertex shader, `hasWebGL2()`, PCG hash, Bayer 2/4/8, value noise, simplex, fbm, rotations |
| `lib/gl/sky/sky.frag.glsl`, `Sky.js`, `bus.js` | the sky renderer and `skyBus.sky` (a shared handle to it) |
| `lib/components/SkyCanvas.svelte` | mounts the sky from `skyConfig` on the shared GSAP ticker; resize, visibility and the CSS fallback without WebGL2 |
| `lib/components/Cinema.svelte`, `lib/motion/cine.js` | vignette, stepped film grain, 2.39:1 letterbox bars, the dive subtitle (`subtitle` prop) |
| `lib/motion/choreo.js` | scroll → sky state, ship's clock, active section, `ui.day`, `ui.scrolled`, `ui.foot`; exports `paperFront()` |
| `lib/motion/gsap.js` | plugins (ScrollTrigger, SplitText, ScrambleText, DrawSVG, CustomEase), eases `helm` and `haul`, the `SCRAMBLE` glyphs |
| `lib/motion/scroll.js` | Lenis on the GSAP ticker: `startScroll` (which also puts every load back at the top, deep links excepted), `scrollTo`, `lockScroll`, `stopScroll` |
| `lib/motion/reveal.js`, `lib/motion/focus.js` | the `data-r` reveal vocabulary; finishing a reveal when keyboard focus lands in it |
| `lib/state.svelte.js` | the shared `ui` rune store (`ready section clock sound day scrolled foot menu gl reduced`) |
| `lib/time.js` | `fmtTime(min)`, `watchName(min)`, `bellsAt(min)` |
| `lib/audio/bell.js` | Web Audio ship's bell `strike(n)`, surf `setSea(0\|1)`, `setSound(on)` |
| `lib/flags.js`, `lib/components/Flag.svelte` | International Code of Signals A–Z as SVG: `<Flag letter="K" size={22} />` |

### Signature feature 1: the dithered sky

There is one fixed `<canvas>` behind the whole page (`z-index: 0`, `100vw × 100lvh`). A single fragment shader draws it into a buffer with one texel per `cssCell` CSS px (2 or 3, rounded to whole device pixels) and scales it up with `image-rendering: pixelated`, so every mark is a hard square at any DPR. Two dithers do all the tonal work:

- **Stochastic:** each texel has a fixed random threshold. Each layer compares its intensity to that threshold and picks a palette step. The effect looks like a halftone pulled too dry.
- **Ordered (Bayer 8×8):** used for the dawn bands and the paper front.

Scene layers, back to front: grain on the ground; stars with a Milky Way band and a meteor every few seconds; star trails around a pole; the bearing globe (graticule, a family of loxodromes at the bearing, the sailed course solid and the course ahead in marching dashes, the ship); the hero planet (rim-lit limb, dust streaming off the atmosphere, a pointer wake that stirs it); dawn; paper. The pointer wake only follows a mouse or pen, never touch.

`skyConfig` also rolls the scene, so each build's sky differs: `layout.planet` (the corner the planet rises from), `layout.planetScale`, `layout.globe` (the side the globe sits on), and `scene.grid` (graticule spacing), `scene.loxodromes`, `scene.stars` (density), `scene.meteorEvery`, `scene.band` (the Milky Way's slope and height) and `scene.tilt` (the globe's tilt).

`sky.state` is the contract. `choreo.js` writes it every frame from section positions, and the Preloader writes `intro`:

| key | meaning | written by |
|---|---|---|
| `intro` 0→1 | the planet boots in, pixels switching on at random, limb first | Preloader exit, `2.2s power2.out` (set to 1 when skipped or reduced) |
| `dive`, `planetOn` | the camera falls through the planet over the hero pin, then the planet fades out | role `hero` |
| `globeOn`, `ship` | the globe resolves in, and the ship sails south → north across the section | role `globe` |
| `trailsOn`, `trailSpan` | star trails fade in and turn 15° per ship's hour of the log's span | role `log` |
| `dawn` | ordered-dither dawn bands climb from the bottom | from role `dawn` to landfall |
| `paper` | the paper front sweeps up and resolves the sky into paper | role `landfall` |

Roles and times come from `chart.js`. Each section element must have the `id` from `chart.js`, and the footer must be `<footer class="foot">`. If an id is missing, the sky reads 0 for that section and misbehaves silently; choreo logs a warning when this happens.

**Guardrails (already in the kit):** DPR is capped at 3, and the buffer is about a quarter of the CSS pixel count. Rendering is skipped while the tab is hidden, while the opaque footer covers the view, or while the context is lost, and a context restore rebuilds the program. There is no `powerPreference`, and the frame delta is clamped to 60ms. Under reduced motion time freezes: scroll still moves the scene, but nothing drifts. Without WebGL2, `.sky.off` shows a CSS gradient limb on the rolled side and the paper fallback. The page must stay complete without the canvas.

### Signature feature 2: the ship's clock

The whole page reads as one night. `choreo.js` interpolates `ui.clock` (minutes) between section keys. A section's time lands 0.3vh before its top. The log runs its span across its pin. Landfall's time lands as the paper finishes.

- **Nav clock** (centred, or beside the brand when `layout.chrome.navClock` is `left`): `HH:MM` from `fmtTime(ui.clock)`, the watch name from `watchName()`, and eight square pips in four pairs lit by `bellsAt()`. Give it `role="img"` and an `aria-label` such as "Ship's time 21:30, First watch, 3 bells". Starts before 20:00 read "Last dog watch", which is correct.
- **Section heads** print the same times. The log's head shows its span (`21:00 → 06:00`).
- **Bells (optional, off by default):** a nav toggle `button[aria-pressed]` calls `setSound(on)` and, when turning on, `strike(2)`. The log strikes `bellsAt()` on every half hour while scrolling forward (`self.direction > 0`). The footer calls `setSea(1)` while it is in view. There are no audio files, and nothing plays before the user opts in.

### Signature feature 3: the opening shot and the dive

- **Preloader:** a fixed `--night` screen holding a 120px compass rose with `layout.preloader.points` points (4, 8 or 16). The points draw from their midpoints (`drawSVG: '50% 50%'` → full, `.9s`, stagger .04), then fill. The ring draws and 32 ticks blink on. The needle swings onto the bearing over 1.8s, while a readout `Taking a bearing 000°` counts to the bearing. Give `svgOrigin` in both halves of the tween, or GSAP moves the needle off centre: `tl.fromTo(needle, { rotation: bearing + 167, svgOrigin: '60 60' }, { rotation: bearing, svgOrigin: '60 60', duration: 1.8, ease: 'elastic.out(1, 0.34)' }, 0.3)`. Loading is real: `Promise.all([document.fonts.ready, two rAFs, a 900ms floor])`. On exit the rose scales to .18 and fades, the curtain lifts in eight hard steps, and scroll unlocks the moment the curtain is up. The exit runs after an `await`, outside any `gsap.context`, so address the preloader's own elements by `bind:this` refs, never by selector strings (a bare `.rose` would also catch the nav's mark):

```js
// .pre { --lift: 0; clip-path: inset(0 0 calc(var(--lift) * 100%) 0); }
const exit = gsap.timeline({ delay: Math.max(0, 1.55 - intro.time()) });
exit.to(root, { '--lift': 1, duration: 0.72, ease: 'steps(8)' }, 0.2)
    .add(() => { ui.ready = true; }, 0.36)
    .add(() => { gone = true; lockScroll(false); }, 0.92);   // curtain up: remove the node, free the scroll
if (sky) exit.fromTo(sky.state, { intro: 0 }, { intro: 1, duration: 2.2, ease: 'power2.out' }, 0.22);
```

  Call `lockScroll(true)` at the start. The kit's `lockScroll` sets `html` overflow inline *and* stops Lenis, because Svelte mounts children before parents, so the preloader locks before Lenis exists. Skip the preloader entirely (and set `sky.state.intro = 1` and `ui.ready = true`) under `html.no-intro` or reduced motion. The kit's `startScroll` puts every load (except a deep link) back at the top, because the night always starts at dusk.
- **Hero intro** (runs once when `ui.ready` turns true): the letterbox opens (`gsap.to(cine, { intro: 0, duration: 2.1, ease: 'power3.inOut' }, .35)`). On wide fine-pointer screens the h1 pulls focus from `blur(14px)`. Its characters rise from `yPercent: 125` inside word masks (stagger .016). The eyebrow decodes through `SCRAMBLE`, the lede and strike line lift, the strike-through draws (tween a `--cut` CSS variable that scales `s::after`), the command bar wipes open (`clipPath: 'inset(0 100% 0 0)'`, `haul`), its code decodes, and the rest of the chrome fades up. Split with `SplitText.create('h1 .ln', { type: 'words,chars', mask: 'words', wordsClass: 'w', charsClass: 'ch', aria: 'none' })` and put the full text in `aria-label` on the h1.
- **Dive:** the hero section is `205vh` (190vh ≤640px) with a sticky `100svh` stage. The copy scrubs to `yPercent: −18, autoAlpha: 0` from `top top` to `21% top`. The camera falls through the limb, the bars close and reopen, and deep in the dive the bottom bar shows a log-line subtitle (pass it to `<Cinema subtitle=…>`). Below the stage, at `top: 163vh`, a quiet log line waits in the clear air: a 72px plumb line drops (scaleY, `haul`), then two mono lines appear. Hide it under `.rm`.

### Signature feature 4: landfall

The paper is the sky's own dither, not a CSS fade. Landfall is a `280vh` section (240vh ≤640px) with a sticky `100svh` stage. Inside the stage, `.rose-wrap { position: absolute; inset: 0; overflow: clip; pointer-events: none }` holds the rose, so the mask and the front share the viewport's coordinates. While the section is near (a ScrollTrigger `top bottom` → `bottom top`, `onToggle`), a ticker callback reads the front and inks each block of text at the moment the front passes it. Run the callback once more when `near` turns off, so a jump past the section leaves the final state.

```js
import { paperFront } from '$lib/motion/choreo.js';
const tick = () => {
  const sky = skyBus.sky;
  const front = sky ? paperFront(sky.state.paper) : ui.day ? 2 : -1;  // viewport heights from the bottom
  const rects = inkables.map((el) => el.getBoundingClientRect());     // read everything first…
  inkables.forEach((el, i) => {                                       // …then write
    const r = rects[i];
    const y = el === roseEl ? r.bottom - r.height * 0.1 : r.top + r.height * 0.5;
    const inked = front > 1 - y / innerHeight;
    if (inked !== el.hasAttribute('data-inked')) el.toggleAttribute('data-inked', inked);
    if (inked && el === roseEl) drawRose();                            // once
  });
  roseWrap.style.setProperty('--cut', `${(innerHeight * (1 - front)).toFixed(1)}px`);
};
```

- Before inking, text is night-coloured: title `--text`, its second line `--signal`, lede `--dim`. When inked, the title is `--ink`, its second line `--day-accent`, the aside `--day-accent` and the lede `--ink-2`, all with `transition: color .35s linear`. Under `.js:not(.rm)` the lede and actions start at `opacity: 0; translateY(14px)` and arrive with daylight. If keyboard focus enters them before then, scroll to `top + 1.5 × innerHeight` to bring them into daylight.
- **The wind rose** is a generated SVG at `viewBox 0 0 640 640`, placed on the `layout.landfall.rose` side (`right: 2vw` or `left: 2vw`, `top: 50%`, `translate: 0 -50%`, `width: min(44vw, 70vh, 640px)`). The text column takes the other side and is capped at `calc(100% - min(44vw, 70vh, 640px) - var(--gutter))`, so the title and aside never run into the rose; shorten the aside rather than letting it collide. The rose has 32 rhumb lines from the centre out to r=980 (every fourth a principal wind at higher alpha), faded by a radial mask (white at .36 → black at 1, r=760). It has rings at 262/238 (solid) and 150/58 (dashed `2 4`), 72 ticks, and points drawn as split triangles with one half filled in ink and the other left as paper with an ink outline: cardinals (len 232), half-winds (168) and quarter-winds (112). Add serif italic N/E/S/W, a needle on the bearing, and a mono bearing label. All strokes and fills use `--day-accent`, `--ink`, `--paper` and their `color-mix` alphas. Two intersected masks keep it on paper and fade it before the footer:

```css
.rose-wrap { --cut: 100%;
  mask-image: linear-gradient(to bottom, transparent calc(var(--cut) - 40px), #000 calc(var(--cut) + 40px)),
              linear-gradient(to top, transparent, #000 24%);
  mask-composite: intersect; -webkit-mask-composite: source-in; }
```

  It prints once when first inked: rays `drawSVG` 0 → 100% over 2.2s, `stagger: { each: .02, from: 'random' }`; then the rings, the points, the fills and the ticks; then the letters; then the needle swings from −38° to 0° relative to its bearing (`elastic.out(1, .3)`, 2.4s, `svgOrigin: '320 320'`). On ≤900px the rose drops under the text (`width: 96vw`, pushed 34vw off its side, `bottom: −30vw`, `opacity: .5`), and its second mask stays at 22%.

### Signature feature 5: live instruments

These are small, honest machines. Each is a paused `repeat: -1` GSAP timeline that plays only while its grid is on screen (one ScrollTrigger, `start: 'top bottom', end: 'bottom top', onToggle`). On hover, `timeScale` goes to 1.8. Each instrument shows the product actually working, for example a route drawn across a rose net, a symbol renamed at every reference, an echo sounder sweeping with a test counter, a log feed on a conveyor (lines duplicated, `yPercent: -50`, 16s linear), branches merging back with one red that never rejoins, or a cursor hauling back to a waypoint. Write your own for the product, `layout.instruments.count` of them.

Most state is driven by tweening **CSS custom properties** that styles read: `--hot` lights a node, `--sel` shows a selection tint, `--lit` makes a bar flash as the sweep crosses it, `--n` reveals typed characters, `--p` places a pip on a scale, and `--flash` confirms a copy. Where state must be toggled, use `data-*` attributes (`data-past`, `data-cur`, `data-done`, `data-inked`), because Svelte overwrites class lists.

**Svelte scoped CSS removes selectors for attributes that never appear in the markup.** Write every attribute that is set only from JavaScript through `:global()`: `.title:global([data-inked])`, `.entry:global([data-cur]) .card`, `.task:global([data-done]) .spin`. Treat any `css_unused_selector` warning as a bug.

**Typing without string slicing:** `.typed { display: inline-block; max-width: calc(var(--n) * (1ch + var(--track, 0em))); overflow: hidden; white-space: pre; }` in the mono face, where `--track` is the element's letter-spacing (`.005em` in the terminal; leaving it out clips the last character). GSAP tweens `--n` from 0 to the text length (`snap: { '--n': 1 }`). A braille spinner `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏` cycles while a task runs, then becomes `◆`.

### Reveal vocabulary

`reveal(root, { start: 'top 84%' })` from the kit, called inside `gsap.context`, handles every `[data-r]` element under `root`. All reveals are one-shot (`once: true`).

- `data-r="lines"`: headings. SplitText line masks rise from `yPercent: 125` over 1.25s with stagger .09 and `helm`. On `(min-width: 861px) and (pointer: fine)` there is also a focus pull from `blur(10px)` over 1.7s.
- `data-r="fade"`: `opacity 0, y 18 → 1, 0` over 1.1s. It uses opacity, not visibility, so the content stays tabbable.
- `data-r="label"`: mono text decodes through `SCRAMBLE` (`·:+×/\|<>-=_#°`).
- `data-r="clip"` / `"term"`: a panel is drawn open from its top edge (`inset(0 0 100% 0)` → `inset(0)`, 1.3s, `haul`).
- `data-delay` adds seconds of delay, used to stagger stats (`i * .1`).
- Do not hide `[data-r]` in CSS. reveal.js sets every start state itself, so the prerendered HTML stays complete if a script fails. Elements that a component's own intro hides (the hero's `[data-in]`) are hidden only under `:global(.js:not(.rm):not(.no-intro))`.

**Motion rules:**

- **Eases:** `helm` (`M0,0 C0.14,0.72 0.2,1 1,1`) is the default for everything, a long, confident deceleration. `haul` (`M0,0 C0.62,0 0.22,1 1,1`) is for wipes and anything lowered or hauled. CSS uses `--ease`. Scrubs use `ease: 'none'`. Exits use `power3.in`.
- **Elastic** appears only on a needle settling, in the preloader and on the wind rose, and **`back.out`** only on hoisting flags and popping merge dots.
- **Stepped motion** is for machines: the curtain (`steps(8)`), blinking status dots (`steps(1)`), the grain (`0.9s steps(1)` across six offsets) and terminal carets.
- Pins are **CSS sticky**: a tall section with a `position: sticky; top: 0; height: 100svh` stage, and a ScrollTrigger from `top top` to `bottom bottom` scrubbing a paused timeline (`scrub: true`, or `.4` for terminals). Never use `pin: true`; it fights Lenis and the choreo measurements. No ancestor may set `overflow: hidden` or `auto`; the body uses `overflow-x: clip`.
- Duration bands: micro .2–.6s, reveals 1–1.3s, focus pulls 1.7–1.9s, drawings 1.6–2.4s.
- **Reduced motion** (`html.rm` and `ui.reduced`, both set before first paint and before children mount): no Lenis, no preloader, no letterbox, no grain animation, no scrub, no loops, no blur. reveal.js shows everything at once. Pinned sections become `height: auto` with a static stage; choreo keeps a short dive so the page still opens on the planet, and squeezes the paper sweep into landfall's real height so the page still reaches day. The night log becomes a vertical list, the terminal is fully printed, counters show their final values, and the sky renders frozen in time. The kit's global CSS clamps every remaining animation to `.001ms`.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible { outline: 1.5px solid var(--signal); outline-offset: 3px; border-radius: 1px }`, switching to `--day-accent` under `.day` (this is in the kit CSS). Inside bordered controls, use an inset offset (−2px to −3px).
- The skip link (`.skiplink`, in the kit) is the first element. It targets `<main id="main" tabindex="-1">`.
- `revealOnFocus()` (kit) finishes any one-shot reveal that keyboard focus lands inside.
- Tablists use roving `tabindex`, `aria-selected` and `aria-controls`. Arrow keys wrap, Home and End jump, and selection follows focus. Copy buttons announce through an `aria-live="polite"` sr-only line ("Copied to clipboard").

### Navigation

**Desktop:**

- A fixed header (`z-index: 40`, `pointer-events: none` on the shell, `auto` on the bar), 68px tall. With `navClock: 'center'` it is a `1fr auto 1fr` grid: the brand mark and wordmark, the ship's clock, then the links. With `navClock: 'left'` the clock follows the brand after a hairline divider and the links stay right. The mark is the favicon's rose drawn in `currentColor` with the needle in `--signal`, and it rotates by −bearing° on hover (.9s `--ease`). The right side holds two or three text links, icon links with a small ↗, and the bells toggle. There is no CTA button.
- Once `ui.scrolled`, a backing fades in: a `--night` gradient (95% → 88% → 0) with `backdrop-filter: blur(7px)`, masked to fade at its foot. Under `.day` it becomes paper. Over the footer (`ui.foot`) the header steps aside (`opacity: 0; translateY(-16px)`) unless it has `:focus-within`.
- **Rail** (`layout.chrome.rail` side): a fixed vertical column 12px from that edge, centred vertically (`z-index: 30`), of 46×46 cells, one 16px line icon per section (from `icon`), separated by hairlines. A 2px signal bar on the inner edge slides to `ui.section` (`translateY(calc(var(--i) * (46px + 1px)))`, .7s `--ease`). Each cell has a tooltip opening toward the page's centre with the number, label and time. It is hidden at `max-width: 1023px` or `max-height: 520px`. Every section's inner container keeps clear of it with `padding-inline: var(--rail-clear-start) var(--rail-clear-end)`; those tokens are already zero where the rail is hidden.
- Every in-page link uses `scrollTo('#id')` (Lenis, 1.6s ease-out-quart; footer links back to the top use 2.6s) and `replaceState` from `$app/navigation`.
- Vary the nav labels between builds, for example "Docs / Night log" or "Manual / Changelog / Status".

**Phones (≤860px):**

- The clock and links hide, and a "Menu" button (`aria-expanded`, `aria-controls="menu"`, at least 44px tall) appears.
- The menu is a full-screen `role="dialog" aria-modal="true"` at `z-index: 35`, under the header so Close stays reachable. Its background is a 4px dot grid of `--hair` over `--night` at 97%. It opens with `clip-path: inset(0 0 100% 0)` → `inset(0)` over .7s. Items are the numbered sections at `clamp(1.5rem, 7vw, 2.2rem)` with their times, staggered by `calc(.12s + var(--i) * .04s)`, and the current one is marked with `aria-current`. Use `lockScroll(true)` while it is open, Escape to close, and Tab and Shift+Tab wrapping inside it. Focus moves to the first item on open and back to the button on close. Set `inert` and `aria-hidden` when it is closed.

### Forms & contact

There are no forms. Every call to action is one of these:

1. **The command bar:** a single-line instrument field with a 42px prompt cell (`$` in `--signal`), a mono line, and one action. It sits on `--panel` with a 1px `--hair-2` border and square corners, under tabs whose sliding 1px signal underline glows (`box-shadow: 0 0 8px var(--signal-glow)`). Switching tabs decodes the new line through ScrambleText (`chars: 'lowerCase'`). For developer products the line is an install command with **Copy**, confirmed as "Copied". For anything else it is a booking line, a schedule or a handle, with one verb (**Book**, **Join**, **Reserve**), confirmed by a two-word past-tense line in voice ("Berth held"). The action flashes (tween `--flash` from 1 to 0 on `color-mix(in srgb, var(--signal) calc(var(--flash) * 22%), transparent)`) and holds its confirmation for 1.8s.
2. **A signature-line link:** mono label text, a bottom hairline, and a signal underline drawn `scaleX(0 → 1)` on hover with the arrow nudging 4px.
3. **The one filled button** on the page: the featured price tier, with a solid `--signal` background and `--night` text.

Contact (email or booking) lives in the footer link roll and the landfall actions.

---

## Layout sections (approved roster)

`chart.js` fixes which sections exist, their order, labels, ids, numbers and times (`sections`), and each one's variant (`layout`). Build exactly that. Every section has its `id`, `position: relative; z-index: 1`, and an inner container with the rail clearance. Every section except the hero has a section head and `aria-labelledby` pointing to its h2; the hero is labelled by its h1.

- **Hero** (`type: hero`, role `hero`). 205vh with a sticky stage. **Variants:** `copy` (`left`/`right`: the copy column hugs that side, and the planet rises from the opposite corner), `lines` (2 or 3 h1 lines), `helm` (whether the rotating "At the helm" readout appears). It holds the eyebrow (a 6px square dot in `--ok` blinking `2.4s steps(1)` plus a mono status such as `v0.9 — sea trials`); the h1; a lede (max 44ch); the strike line; the command bar (max 540px); the optional helm readout (a serif italic name rotating every 2.6s via ScrambleText while on screen, an `NN/NN` index, `aria-hidden` visuals and an sr-only list); a bottom chrome bar with the maker mark and a small legal chip; and the post-dive log line. Put a radial `--night` scrim behind the copy (an ellipse at 58% 56% centred on the copy, 80% → 52% → transparent).
- **Hand-off** (`type: handoff`): a scrubbed session. 290vh with a sticky stage and a `5fr / 7fr` grid. **Variants:** `terminal` (`left`/`right`), `steps` (3 or 4). The text column holds the head, h2, lede, and numbered steps whose top rule draws in signal as each becomes active. The terminal column holds a `figure`: `color-mix(in srgb, var(--night) 86%, transparent)`, `blur(10px)`, a 1px `--hair-2` border, `0 40px 120px -40px color-mix(in srgb, var(--bars) 90%, transparent)`, a title bar with a path and an `--ok` `■ zsh · 96×28`, and a body whose `min-height` reserves its final height. A paused timeline types the command, runs 2–4 tasks with spinners, sets the plan as waypoints (`├─ 01 …`, `└─ 04 …`), asks one `[Y/n]`, and confirms. Scrub it with `scrub: .4` on ≥900px. Below that, it plays once at 55% speed when it enters view. Steps follow the timeline's labels.
- **Instruments** (`type: instruments`). **Variants:** `count` (3, 4 or 6 cells), `columns` (2 or 3; the grid is always full), `head` (`split`: h2 and lede side by side on a `1.1fr / .9fr` row; `stacked`: lede under the h2). The grid shares hairlines and collapses to 2 columns ≤1100px and 1 column ≤620px. Each cell has a 164px aria-hidden viz on `color-mix(in srgb, var(--night) 62%, transparent)`, an index `03.n` in signal, an h3, a line of text, and a mono metric such as `38 pkgs · 9,412 symbols`. On hover the ground deepens and a 1px signal frame fades to .55.
- **Bearing** (`type: bearing`, role `globe`). 230vh with a sticky stage. **Variants:** `copy` (the copy's side; the globe is in the sky on the other side, from `skyConfig.layout.globe`), `stats` (2 or 3), `definition` (whether the dictionary block appears). Copy max-width is 540px. The **dictionary block** is a serif italic word, its IPA in mono, `n.` in signal, and an upright serif definition. The **stats on scales** are each a number (tabular, weight 480, `clamp(2.2rem, 3.4vw, 3.3rem)`) with a signal unit, plus a 9px tick scale (`repeating-linear-gradient` ticks every `100%/var(--n)`) with a signal pip at `calc(var(--p) * 100%)` and lo/hi labels. Counting up moves the pip with the number (1.8s `power3.out`). Add a mono source footnote. Two fixed, aria-hidden overlays follow the ship using `sky.shipScreen()` on the ticker: a **ship label** (`NAME · WP 2/4`, with a signal border on its inner side) and a **HUD** with a corner bracket and rows `BRG` (the bearing, three digits), `DRIFT` and `FIX`, sitting at the globe's upper shoulder on the copy's side. Show them only while `sky.state.globeOn > .6`, and hide both ≤860px. On phones the globe holds the top 62vh and the text slides over it on a `--night` scrim.
- **The night** (`type: night`, role `log`, with `span`). **Variants:** `marker` (the fixed marker line's position, in vw), `pxPerMin` (8–10 px per ship's minute), `entries` (8–12), `first` (whether the first card hangs `above` or `below` the axis). The track is `trackW = (span[1] − span[0]) × pxPerMin` px wide, and the section is `height: calc(100svh + trackW × 0.85px)` so the pin's scroll runs a little shorter than the track. The track slides under the marker (`translate3d(-p * trackW px, 0, 0)` from a `scrub: true` trigger). The axis has quarter, half and hour ticks, hour labels, bell pips per half hour (pairs of 3px squares) and watch bands. A readout next to the marker shows the time, the watch name in signal and the bell count. Entries alternate above and below the axis. Each is a 7px square node, a 44px stem, and a 262px card with a 1px left rule and a `--night` gradient ground: time, a tag (`--rim`, or `--ok` for good and `--bad` for bad), an h3, a line of text, and an optional `--ok` diff. Cards brighten as they pass (`data-past` .72, `data-cur` 1 with a signal rule and node). The viewport is masked so cards emerge from the dark at both edges, and a top scrim thins the star trails behind the heading. **Keep same-side entries at least `ceil(262 / pxPerMin) + 2` ship's minutes apart** or the cards overlap. On ≤860px and under reduced motion the section becomes a static vertical timeline (left rule, nodes, plain cards).
- **Signals** (`type: signals`): testimonials. **Variants:** `quote` (the quote's side), `quotes` (3–5), `dwell` (seconds per quote). The grid is `4fr` for the h2 and hoists and `7fr` for the quote, in whichever order `quote` gives. The **flag hoists** are the controls. Each hoist is a `button[aria-pressed]` holding the quoter's two initials as signal flags on a 1px halyard. Idle hoists are lowered, dimmed and desaturated (`translateY(14px); opacity: .45; saturate(.35)`), and the active one flies. A 1px signal progress bar fills over the dwell, paused on hover or focus and off screen. The quote is set at `clamp(1.55rem, 2.75vw, 2.7rem)`, weight 440, line-height 1.16, with a hanging opening quote (`text-indent: -.42em`, reset to 0 on the split word masks). Swap words out (`yPercent: -110`, .45s, `power3.in`) and in (`yPercent: 110`, `helm`), and hoist the byline flags with `back.out(1.6)`. Below a hairline, the **crews** sentence names 5–8 customers in serif italic separated by muted commas and "and". Under reduced motion there is no timer and quotes swap instantly.
- **Charter** (`type: charter`): pricing. **Variants:** `form`, `tiers`, `featured` (the 0-based index of the featured tier; never the first). `columns` places the tiers in ruled columns (one top rule across, a 1px rule between columns, no boxes), stacking at ≤960px. `ledger` places them as ruled rows: name and tag | price | clauses | CTA, stacking each row's cells at ≤960px. Both sit on a dark scrim (`--night` at 74% → 50%), because the dawn bands climb behind them. Each tier has `ART. I/II/III/IV` in mono, the name as an h3, the price in the serif with a mono period (`seat / month`), a tag line, `§1–§4` clauses with dashed separators, and a signature-line CTA. The featured tier is ruled in signal, gets an italic serif note ("most chartered"), and carries the page's one filled button.
- **Landfall** (`type: landfall`, role `landfall`). Described under Signature feature 4. **Variants:** `rose` (the rose's side), `aside` (whether the serif italic aside appears). It holds the head, the title in two lines (the second in signal, inking to the day accent), the optional aside, a lede, the command bar again in its compact form (switching to paper tokens under `[data-inked]` or `.day`), and one secondary link.
- **Footer** (end credits), `<footer class="foot" aria-label="Site">`, opaque `--paper`, `z-index: 2`, `min-height: 100svh` (so that at the bottom of the page it fills the view and the sky stops drawing). **Variant:** `layout.footer.columns` (3–5 link columns). It holds a mono head row (the brand mark linking to the top, "End of the watch", a fading ink rule, and the landfall time in `--day-accent`); a `5fr / 7fr` body with the serif italic closing line in `--day-accent` plus one sentence; the link roll (h2 mono labels with an ink hairline, links at weight 440 with an underline that grows from the left); then the **end card**, pushed to the bottom. The end card is a gradient of `--paper` → `--paper-2` → mixes of `--paper-2` with `--day-accent-2` → `--day-accent` → `--ink`, with an overlay grain (`var(--grain)` 180px, opacity .55, masked off at the top seam, `isolation: isolate` on the card). Over it sits the brand's wordmark in `--paper`, `aria-hidden`, weight 560, letter-spacing −.065em, line-height .74, sized with container units (`container-type: inline-size` on its parent). Fit it to the gutters for the rolled sans and your brand's length: start from `font-size: min(32cqw, 60vh)` for seven lowercase letters, then tune the `cqw` value until `scrollWidth <= clientWidth` at both 390px and 1440px. Last is a mono colophon: `© year company` | `coordinates` from `chart.js` (if the brief names a real place, its real coordinates may replace them) | `Drawn in code`. The footer reveals itself like credits: rules draw, the columns come up one by one, and the wordmark rises (2.2s `helm`).

Global layers in every build: SkyCanvas, Preloader, Cinema, Nav, Rail, the skip link and `<div id="lvh-probe" aria-hidden="true">`.

---

## Architecture & performance guardrails

The output is a **SvelteKit 2 project (Svelte 5 runes)** that prerenders to a static `build/`. There is no backend, no CMS and no runtime network request beyond the self-hosted fonts.

**Canonical stack (`package.json`):**

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite dev --port 5175 --strictPort",
    "build": "vite build",
    "preview": "vite preview --port 4175 --strictPort",
    "check": "svelte-kit sync && svelte-check"
  },
  "devDependencies": {
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.70.3",
    "@sveltejs/vite-plugin-svelte": "^7.3.0",
    "svelte": "^5.57.1",
    "svelte-check": "^4.7.6",
    "typescript": "^6.0.3",
    "vite": "^8.3.0"
  },
  "dependencies": {
    "gsap": "^3.15.0",
    "lenis": "^1.3.26",
    "ogl": "^1.0.11"
  }
}
```

The roll adds the three Fontsource packages. Add `name` and `description` per build. Requires Node 20.19+. GSAP 3.13+ includes SplitText, ScrambleText and DrawSVG for free.

**Config files (write verbatim):**

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
export default { kit: { adapter: adapter({ pages: 'build', assets: 'build', strict: true }), paths: { relative: true } } };

// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [sveltekit()],
  ssr: { noExternal: ['gsap'] },
  build: { target: 'es2022', chunkSizeWarningLimit: 700 }
});

// src/routes/+layout.js
export const prerender = true;
```

`jsconfig.json`: `{ "extends": "./.svelte-kit/tsconfig.json", "compilerOptions": { "allowJs": true, "checkJs": false, "moduleResolution": "bundler", "skipLibCheck": true, "strict": false } }`. `.gitignore`: `node_modules/ build/ .svelte-kit/ .DS_Store *.log`.

**Project manifest:**

```
project/
├── package.json, svelte.config.js, vite.config.js, jsconfig.json, .gitignore — as above
├── rhumb.chart.json                — ROLL
├── README.md                       — author: what it is, how to run, the seed and the chart's choices
├── static/favicon.svg              — ROLL
├── static/og.jpg                   — optional 1200×630 social preview (the only raster file)
└── src/
    ├── app.html, app.css           — KIT (the roll patches app.html's theme-color)
    ├── tokens.css                  — ROLL
    ├── routes/+layout.js           — as above
    ├── routes/+layout.svelte       — ROLL
    ├── routes/+page.svelte         — author from the bootstrap below
    └── lib/
        ├── chart.js, sky.config.js                      — ROLL
        ├── content.js              — author: site, hero, and the copy for each section in chart.js
        ├── state.svelte.js, time.js, flags.js, gl/…, motion/…, audio/bell.js — KIT
        └── components/
            ├── SkyCanvas.svelte, Cinema.svelte, Flag.svelte — KIT
            ├── Preloader, Nav, Rail, Mark, Icon, Footer     — author
            └── one component per entry in chart.js          — author
```

**Page bootstrap (`src/routes/+page.svelte`):**

```svelte
<script>
  import { onMount } from 'svelte';
  import SkyCanvas from '$lib/components/SkyCanvas.svelte';
  import Preloader from '$lib/components/Preloader.svelte';
  import Cinema from '$lib/components/Cinema.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import Rail from '$lib/components/Rail.svelte';
  import Footer from '$lib/components/Footer.svelte';
  // import one component per section type in chart.js
  import { sections } from '$lib/chart.js';
  import { site, hero } from '$lib/content.js';
  import { skyConfig } from '$lib/sky.config.js';
  import { ui } from '$lib/state.svelte.js';
  import { gsap, ScrollTrigger } from '$lib/motion/gsap.js';
  import { startScroll, stopScroll, scrollTo } from '$lib/motion/scroll.js';
  import { createChoreo } from '$lib/motion/choreo.js';
  import { revealOnFocus } from '$lib/motion/focus.js';

  // Decided before any child mounts, so every section reads the same answer.
  if (typeof window !== 'undefined') ui.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMount(() => {
    startScroll({ reduced: ui.reduced });
    const stopFocus = revealOnFocus();
    const choreo = createChoreo();
    const tick = () => choreo.update();
    gsap.ticker.add(tick);
    let t;
    const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 60); };
    document.fonts?.ready.then(refresh);
    document.fonts?.addEventListener?.('loadingdone', refresh);
    addEventListener('load', refresh);
    const hash = location.hash.slice(1);
    if (hash && document.getElementById(hash)) setTimeout(() => scrollTo(`#${hash}`, { immediate: true }), 120);
    return () => {
      stopFocus(); gsap.ticker.remove(tick); clearTimeout(t);
      document.fonts?.removeEventListener?.('loadingdone', refresh);
      removeEventListener('load', refresh);
      choreo.destroy(); stopScroll();
    };
  });

  $effect(() => {
    document.documentElement.classList.toggle('day', ui.day);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', ui.day ? skyConfig.palette.paper : skyConfig.palette.bg);
  });
</script>

<svelte:head>…title, description, og tags (see below)…</svelte:head>

<a class="skiplink" href="#main">Skip to content</a>
<div id="lvh-probe" aria-hidden="true"></div>
<SkyCanvas />
<Preloader />
<Cinema subtitle={hero.descent} />
<Nav />
<Rail />
<main id="main" tabindex="-1"><!-- one component per entry in `sections`, in order, each given its entry --></main>
<Footer />
```

**Component conventions:**

- Each section component receives its entry from `chart.js` as a prop and reads its variant straight from the module: `import { layout } from '$lib/chart.js'; const v = layout.night;`. Module constants are not reactive, so this avoids Svelte's `state_referenced_locally` warning; if you derive anything from a prop, use `$derived`. Never re-decide a variant.
- Write all GSAP inside `onMount` → `const ctx = gsap.context(() => { … }, root)`, and clean up with `ctx.revert()`. Desktop and mobile branches go through `gsap.matchMedia()` with conditions that mirror the CSS breakpoints exactly (for example `(min-width: 861px) and (prefers-reduced-motion: no-preference)` for the night track).
- Pinned sections need `.rm`-scoped CSS that sets `height: auto` and a non-sticky stage, plus their mobile rules.
- Anything driven per frame goes on `gsap.ticker`, never a separate `requestAnimationFrame`. Read layout once per frame and write after. Skip work when nothing changed (cache the last string or number).
- **Breakpoints:** 860px is the *phone* breakpoint (nav menu, no blur, no grain, night log and Bearing stack). The rail hides below 1024px. Sections have their own *layout* breakpoints: Hand-off and the landfall rose at 900px, Charter at 960px, the Instruments grid at 1100 and 620px. The kit kills `backdrop-filter` and the grain on ≤860px and on coarse pointers, so every panel must read on a dark ground without blur.
- Copy lives in `content.js`. The nav, rail and menu read `sections` from `chart.js`. Components never hard-code brand strings.

**Construction method:**

1. Scaffold the folder by hand (do not run `sv create`). Write `package.json`, the config files and `.gitignore`.
2. Copy `kit/` into `src/` byte for byte.
3. Run `node <skill>/roll.mjs --out <project>`. Read `rhumb.chart.json` and report the seed, signal, day ink, fonts, bearing, clock, line-up and every layout variant.
4. Write `content.js`: `site`, `hero`, then the copy for each section in the chart, in voice, with times and bearing that match the chart.
5. Write the global components (Mark, Icon, Preloader, Nav, Rail, Footer), then one component per section in `chart.js`, honouring each variant, then `+page.svelte`.
6. Run `npm install`, then `npm run build`. It must finish with no errors and **no warnings** (an unused-selector warning means a `:global()` is missing) and write `build/index.html`. Run `npm run check` and fix every error.
7. Run `npm run dev` and walk the night at 1440×900: the preloader lifts and scroll is free once the curtain is up, the planet boots on its rolled side, the dive closes and opens the bars, each pin scrubs, the clock advances and the rail follows, the log strikes bells (when on), the dawn climbs, the text inks, the rose prints, the footer wordmark fits, and the footer covers the sky (`skyBus.sky.covered` is true at the bottom). Reload mid-page: it must start at the top. Repeat at 390×844 with touch emulation: native touch scrolling must work, `innerWidth` must stay 390 and `document.documentElement.scrollWidth` must equal it. Repeat with reduced motion on: no dead scroll, the page opens on the planet, and landfall still reaches paper and inks the text.

**Integrity & privacy:** pin majors and minors as above and never use `@latest`. Use no analytics, trackers, telemetry or third-party scripts. Use no audio, video or image files other than the optional `og.jpg`. Wrap the canvas in `aria-hidden` and give it no text.

**Size and performance target:** about 600KB of JS minified (GSAP and the shader string are most of it). The sky must hold 60fps on a mid-range laptop at 1440×900. If the budget is exceeded, cut in this order: (1) the sound, (2) instruments down to three. Never cut a rolled section, the sky, the clock, landfall or the accessibility markup.

---

## HTML head & meta tags

`kit/app.html` provides the charset, viewport, `theme-color` (set to `--night` by the roll), `color-scheme`, the favicon link and the pre-paint script. In `+page.svelte`, add:

- `<title>`: `Brand — what it does, in the night's voice` (for example `Brand — the scheduler that keeps the night watch`). Never the brand alone.
- `<meta name="description">`: one or two dry sentences, 120–155 characters.
- `og:type` (`website`), `og:title`, `og:description`. Add `og:image` only if you ship `og.jpg`, and give it a full absolute URL when the deploy URL is known. Add `twitter:card` too.
- The favicon is written by the roll. Do not draw another.

---

## Print stylesheet

`kit/app.css` already prints black text on white, hides the canvas and `.no-print`, removes animation, transitions, blend modes and shadows, and sets `section { break-inside: avoid }`. In components:

- Add `.no-print` to the Preloader, Cinema, Nav, Rail, the Bearing HUD and ship label, the instrument vizzes, and the bells toggle.
- Release every pin: `@media print { .stage { position: static; height: auto } section { height: auto } }`.
- Print the night log as its vertical list, and print text in its final state (no `visibility: hidden`).

---

## Accessibility checklist

Every build must satisfy all of these before it is complete.

**Structure:**

- Landmarks: the skip link, `<header>` holding `<nav aria-label="Primary">`, `<nav aria-label="Sections">` for the rail, `<main id="main" tabindex="-1">`, and `<footer class="foot" aria-label="Site">`.
- Every section after the hero has `aria-labelledby` pointing to its h2; the hero is labelled by its h1. Headings run h1 (hero) → h2 (sections, footer columns) → h3 (steps, cells, entries, tiers) with no skipped levels.
- Split and scrambled text uses `aria: 'none'` on SplitText and carries its final text in `aria-label`, or has an sr-only twin. Rotating readouts are `aria-hidden` with an sr-only list.
- The night log is a real `<ol>` of `<li>` with `<time>` and `<h3>`. Instruments are `aria-hidden` visuals beside real text.

**Interactive elements:**

- Every `<button>` has `type="button"`. Icon-only controls have an `aria-label`. External links say "(opens in a new tab)" in an sr-only span or the label.
- `:focus-visible` on everything. Touch targets are at least 44×44px on coarse pointers (menu items, menu button, footer links, landfall link).

**State management:**

- `aria-pressed` on the bells toggle and the hoists; `aria-selected` and roving `tabindex` on tabs; `aria-expanded` and `aria-controls` on the menu button; `aria-current` on the rail and menu entries; `inert` and `aria-hidden` on the closed menu.
- Decorative layers are `aria-hidden="true"`: the sky, Cinema, the grain, the preloader, the HUD, the ship label, the rose, the axis, the readout, the marker, flags inside buttons, and the footer wordmark (the brand link carries the name).

**Media queries:**

- `prefers-reduced-motion: reduce` is implemented as described under Motion. Pins release, so there is no dead scroll.
- `prefers-contrast: more` comes from the rolled tokens. Check that every label still reads.
- `(pointer: coarse)` and ≤860px: native touch scrolling, no backdrop blur, no grain, no pointer wake, no horizontal overflow, and the rail hidden.

---

## LLM directives: vary vs. freeze

**Varied by the roll (never pick these yourself):**

- The green signal's exact hue, lightness and chroma; the rim; the night's cast; the paper; the day-ink family; the status colours; every sky ramp.
- The three fonts.
- The bearing, the start time (19:00–21:00), landfall (06:00–08:30), the log's span and every section's time.
- Which 3–6 middle sections appear, their order, labels and roles.
- Every layout variant: hero side and line count, terminal side and steps, instrument count, columns and head, Bearing side, stats and definition, night marker, scale, entries and first card, quote side, count and dwell, charter form, tiers and featured tier, rose side and aside, footer columns, preloader points, rail side and clock position.
- The sky scene: planet corner and scale, globe side, pixel size, graticule, loxodromes, star density, meteor rhythm, Milky Way band and globe tilt.

**Varied by you, every build:**

- The brand, product, eyebrow, every heading and line of copy, the instruments themselves, customers, quotes, numbers, tier names and prices, nav labels, and what the command bar holds and its verb.

**Never vary:**

- One night: the night ground first, the sky as the only picture, and paper with one ink at landfall. No theme toggle.
- A green signal and a starlight-blue rim, with every colour coming from `tokens.css` and `skyConfig`, and none written by hand.
- The kit, copied byte for byte, and one roll per build with a fresh seed.
- Hard square pixels, stochastic and Bayer dither, and `bg`/`paper` equal to the CSS tokens.
- The ship's clock on every section head, the nav and the rail; the bearing as the recurring number.
- The three-font system: mono uppercase labels with positive tracking, tight sans display with negative tracking, and a serif italic for human moments.
- Two-clause headings with a muted second clause; hairline-only structure; square corners; one filled button.
- `helm` and `haul` easing; sticky-stage pins without `pin: true`; one-shot reveals; loops that run only on screen; elastic only on needles.
- The SvelteKit + OGL + GSAP + Lenis stack, prerendered static output, no images, and the accessibility, reduced-motion, touch-scroll and privacy baselines.
