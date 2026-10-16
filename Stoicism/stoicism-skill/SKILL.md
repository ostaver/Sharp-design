---
title: design-stoicism-monument
description: "Lavender risograph monumentalism for creative developers, design studios, architects, museums and cultural institutions. Classical architecture is printed live in riso inks: a procedural Doric temple in Three.js re-printed every frame onto a five-step ink ramp with stochastic stipple and a misregistered second drum, eroding into wind-blown grain as you scroll; every photograph on the page re-inked by the same shader on one shared OGL canvas; capitals drawn by scrubbed stroke; a playable print lab; a staircase timeline; and a finale where the temple's dust settles into a carved inscription. Every build is rolled by a seeded script that picks its paper hue, drum inks, fonts, temple, section line-up and layout variants. React 19 + TypeScript + Vite, Three.js, OGL, GSAP (ScrollTrigger, SplitText) and Lenis."
---

# Stoicism

You are designing in the Stoicism language. This is not a template to copy. It is a set of convictions, proportions and taste lines that produce monumental, hand-printed, gallery-grade pages. Every build should feel unmistakably from the same language and never be identical to a previous one.

## Core conviction

Stoicism is **a monument printed by hand**. Everything on the page is classical architecture or a photograph, and nothing is ever shown raw: a live WebGL temple and every picture are re-printed, sixty times a second, by one risograph press. The press has a **key ink** (a deep blue-violet called midnight), **four papers** of the same hue (periwinkle, lavender, mist, paper), and a **second drum** of pastel ink printed slightly out of register. The page is light lavender paper with two dark plates (the lab and the finale), and type set like inscriptions: Roman capitals, a book serif, and a printer's mono.

The aesthetic sits where an archaeological plate meets a riso zine: patient, weighty, tactile, a little wry. Scroll is a procession. You walk toward the temple, the wind takes the far end of it and the letters of the name, and at the end of the page the dust comes back and carves your visitor's name in stone. "Build it to stand. Print it by hand."

**Nothing visual is hand-picked.** Each build runs `roll.mjs` once, which rolls the paper hue, drum inks, three fonts, the temple, the section line-up and order, and each section's layout variant from a random seed. You write the copy, choose the photographs and author the section components; the roll decides how they look and where they sit. Never hard-code a colour, a font or a layout choice the roll owns, and never reuse an earlier seed.

Two things you must never do:

- **Do not reproduce the reference copy.** The reference build was a portfolio for a fictional creative developer, *Ari Kallis* of Athens ("KALLIS", "I build monuments out of light, shaders & motion", "Let's raise something monumental", projects *Parthenon.gl*, *Hall of Casts*, *Oculus Records*). Its persona, names, lines and section titles belong to that page. Invent your own in the same voice.
- **Do not override the chart.** If the roll puts the name on the right, three sections between hero and finale, pill-shaped images and the ink level on the left, build exactly that.

Use Stoicism for people and institutions whose work should feel built rather than assembled: creative developers and studios, architects, museums, archives, galleries, festivals of theatre or music, publishers, type foundries, heritage brands. It is a poor fit for SaaS dashboards, fintech, e-commerce catalogues, or anything that needs full-colour photography.

---

## The roll (do this first)

`roll.mjs` sits next to this file. Run it once per build, after scaffolding and copying the kit (see Construction method):

```bash
node <path-to>/stoicism-skill/roll.mjs --out <project>
```

It needs only Node and no network. With no `--seed` it picks a random one, so every run differs. `--seed <text>` reproduces an earlier roll and is only for repairing a build in progress. It writes:

| File | What it holds |
|---|---|
| `src/theme.ts` | `theme: Theme`: `seed`, `palette` (9 hex tokens), `ramp` (the 5 print inks every shader uses), `inks` (4 drum inks; `[0]` is the opening ink), `fonts` (family names), `temple` (`columns`, `mirror`) |
| `src/chart.ts` | `sections: ChartSection[]` (page order: `id`, `type`, `n`, `numeral`, `label`, `ground`, `next`, `nav`), `layout: Layout` (every variant), `seed` |
| `src/styles/tokens.css` | every colour token, `--ink-hi`, the three font stacks, `--display-advance`, `prefers-contrast: more` overrides |
| `src/fonts.ts` | the Fontsource imports for the rolled faces and the Greek subset |
| `public/favicon.svg` | the temple mark in key ink over the drum ink on a periwinkle tile |
| `stoicism.chart.json` | the whole roll |

It also sets `theme-color` in `index.html` to the periwinkle paper and swaps the `@fontsource*` dependencies in `package.json` for the rolled faces (run `npm install` after).

- Never edit `theme.ts`, `chart.ts`, `tokens.css` or `fonts.ts` by hand. If something must change, roll again.
- Read `stoicism.chart.json` before writing anything, and state the seed, hue, drums, fonts, temple, line-up and layout back to the user.
- Put the seed in the project README.

---

## Voice

The tone is calm, exact and quietly proud, with a little wit. It borrows from archaeological plates and catalogue captions ("Fig. 2 — The hill at dusk"), printers' colophons, building specifications and inscriptions. The writer is a master builder who also runs the press: they describe what they made and how, never sell, and let one good image carry a paragraph.

**Rules:**

- State the proposition in the first line and prove it with a concrete fact: "180 sculptures", "under 40 KB", "2.3 million scans", "1:1". No round marketing numbers.
- No superlatives, exclamation marks or "cutting-edge", "seamless", "next-level", "elevate".
- Ledes are one or two sentences. Captions are `Fig. N — Title` plus one short line. Microcopy is mono, uppercase, separated by ` · ` (middle dot).
- Speak in architecture and print. Projects are *columns*; capabilities are the three *orders*; a timeline is a *stair*; contact is an *inscription* or a *tablet*; the shader lab is the *press* or the *drum*; pictures are *plates*; a pulled image is a *print*.
- Latin and Greek appear sparingly and always legibly: a Greek word in capitals on the hero rail and the pediment, Latin labels on the contact bays (`Scribe · write`, `Seqvere · follow` — stonecutters cut U as V), Roman numerals for chapters, years and the studio clock.
- Headings are short and set in capitals; one heading may end in an italic serif phrase in the drum ink ("Set the first stone *with me.*").
- Names feel cut in stone or printed on a colophon ("Agora Live", "Plaster & Pulse", "Weight & Lean", "Bottega Lumen"). Invent your own every build.
- Approved vocabulary: column, capital, order, stylobate, peristyle, portico, plate, figure, drum, ink, register, misregistration, pull, print, proof, stipple, grain, chisel, inscription, tablet, quarried, procession, threshold.
- Set typography properly: curly quotes and apostrophes, real em dashes, `Nº`, `×`, `′` and `°` in coordinates, non-breaking spaces where a number and unit belong together.

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** a sticky full-screen WebGL temple with the name set enormous along the bottom edge on `layout.hero.side`, a four-line lede above it, a mono plate line across the top and a rule with the scroll cue and drum swatches at the foot. The monument stands on the other side.
- **Rhythm:** the papers alternate (the chart guarantees no two adjacent sections share one) and two dark plates (the press and the finale) sit in the light page. Pinned or scrubbed sections (hero, colonnade, orders, ascent) alternate with free ones.
- **Separators:** no rules between sections and no boxes. Each section hands over to the next with a **stochastic dither** of the next paper (`<Dither to={groundVar(section.next)} />`), the way a riso drum fades one ink into another.
- **Spacing:** generous: 18–20vh above section heads, 10–14vh between blocks. Side margin is `--edge` (`--gutter` + 20px); on phones it is `--gutter`.
- **Section heads:** a mono eyebrow `{numeral}. — {eyebrow}`, then a huge capital h2 whose words are `.riso` spans (they drift into register as they arrive), and a serif lede that anchors bottom-right of the head row on desktop.
- **Content:** words alternate with built things: a statement, then a colonnade of work, then three drawn capitals, then a lab you can use, then a stair.
- **Data:** shown as architecture, never as cards: work as columns, skills as the courses of a shaft, years as treads, contact as bays of a facade.

**Refuse:**

- Cards with shadows, glassmorphism, gradient blobs, neon, emoji, icon fonts, stock 3D renders.
- Raw full-colour photographs. Every image goes through `<RisoImage>` or `<Plate>`; the only raw pictures are the small greyscale thumbnails in the press and the downloaded prints.
- Logo walls, testimonial carousels, pricing tables, cookie banners.
- A dark theme toggle. The page is lavender paper with two dark plates, always.
- Literal colours in component CSS. Every colour is a token or a `color-mix()` of tokens.

---

## Color

Stoicism is a **single-theme** system: light papers, two dark plates, no toggle.

**Commitment level: a riso print on lavender stock.** Everything is one blue-violet hue at different weights of ink, plus one pastel drum that catches highlights, misregisters type and fills the primary buttons.

All values come from `tokens.css`. These are the roll's rules (OKLCH), so you know what each token is for:

| Token | Role | Rolled within |
|---|---|---|
| `--midnight` | the key ink: type, rules, the dark plates | L .24, the rolled hue |
| `--indigo`, `--blue` | deep steps: risers, stylobate, button offsets | L .34 / .45 |
| `--periwinkle`, `--peri-soft` | mid inks; `--peri-soft` is the hero and default paper | L .62 / .65 |
| `--lavender`, `--mist`, `--paper` | light papers; `--paper` is the lightest stock (inner panels, treads) | L .78 / .88 / .93 |
| `--dust` | the finale's grains | L .92 |
| `--ink-hi` | the second drum; `setInk()` rewrites it live | one of 12 pastel riso inks |
| hue | every token above | **OKLCH 258°–300° only**: cornflower through periwinkle to iris. Chroma ×0.86–1.12 |

**Rules:**

- The key ink is the text colour on every light paper. On the dark plates (`[data-dark]`) text is `--mist` and labels `--lavender`.
- **The drum ink** (`--ink-hi`) appears in: the misregistered copy behind `.riso` type, button faces (`.btn--light`) and button offsets, the cursor's labelled ring, focus outlines on dark plates, `::selection`, swatches, lit treads, slider fills, crop marks, the finale's italic phrase, the scroll bar's offset.
- Shaders never read CSS: they get the ramp from `theme.ramp` and the drum through `setInk()` / `subscribeInk()`. Keep the two in step by only ever changing ink through `setInk()`.
- For alpha use `color-mix(in srgb, var(--midnight) 30%, transparent)`. Never `rgba()` or hex in components.
- Section papers come from the chart: `{...groundProps(section.ground)}` on the `<section>` sets `data-ground` (and `data-dark` on midnight); `base.css` paints it. Only the ascent (a gradient from its paper through lavender to a drum-tinted foot) and the finale (radial glows over midnight) paint their own backgrounds.
- Colour transitions are .3–.6s with `var(--ease-stone)`.
- `prefers-contrast: more` comes from the rolled tokens (lighter papers) plus the kit (a quieter grain, a solid 3px focus outline). Check every label still reads.

---

## Typography

A **three-font system** plus a Greek subset. Fonts are self-hosted through Fontsource (`src/fonts.ts`); there is no Google Fonts request. The roll picks one face from each list and never the reference trio:

- **Display (inscriptional capitals):** Marcellus, Cinzel, Forum, Tenor Sans, Bellefair. Always uppercase through `.display`.
- **Serif (the voice):** Cormorant Garamond, EB Garamond, Cormorant, Newsreader. With italics.
- **Mono (the press):** IBM Plex Mono, DM Mono, JetBrains Mono, Geist Mono. Always uppercase labels.
- **Greek:** Noto Serif Display (Greek subset only), already in the display and mono stacks so Greek capitals render in any rolled face.

Use them only through `var(--f-display)`, `var(--f-serif)`, `var(--f-mono)`. Cinzel has no lowercase (it sets small capitals); that is correct, not a bug.

**Scale (display):**

- Hero name: `min(21vw, 420px, calc((100vw - 2 * var(--edge)) / (var(--len) * var(--display-advance) * 1.04)))`, line-height .74, letter-spacing −.015em, one span per letter. `--len` is the letter count, set inline. On phones `min(25vw, …)` with `--gutter`.
- Section h2 (`.section-title`): `min(clamp(56px, 8.4vw, 168px), calc(var(--title-w) / (var(--len) * var(--display-advance) * 1.06)))`, where `--title-w` is the column the title lives in and `--len` its longest line. Never let a title overflow; never hand-hyphenate.
- Manifesto statement: `clamp(38px, 5.9vw, 112px)`, line-height 1.02, letter-spacing −.02em, max-width 15.5em, in the **display face but not uppercased** (sentence case where the face has lowercase).
- Finale title: `clamp(52px, 9.4vw, 190px)` (13vw on phones), line-height .9, centred.
- Work titles: `clamp(30px, 2.6vw, 46px)`, `text-transform: none`. Order names: `clamp(28px, 2.5vw, 50px)`. Years on the stair: `clamp(34px, 3.4vw, 66px)`.

**Serif:** body `clamp(17px, 1.15vw, 20px)`/1.45; ledes `clamp(20px, 1.6vw, 27px)`/1.2; small body (work blurbs, order leads, stair copy) 16–17px at **weight 500** so thin book faces stay legible on coloured paper. Italic for kinds, mottos, the hero's first name and the finale's phrase.

**Mono rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| `.mono` (base: eyebrows, captions, meta) | 11px | 400 | .08em | upper |
| Nav links | 11px | 400 | .1em | upper |
| Buttons | 12px | 400 | .1em | upper |
| Chips, rack labels, corners | 9–10px | 400 | .08–.12em | upper |
| Clock, readouts | 11px / 40–64px display | 400 | — | tabular-nums |

**Rules:** never add a fourth family; display weight is always 400; headings `text-wrap: balance`, paragraphs `text-wrap: pretty` (in the kit). Any heading animated with SplitText into characters must be split `type: 'words,chars'` so lines only break between words.

---

## Motion

Motion in Stoicism is **scroll-bound and settling, like stone**: things arrive heavy and decelerate long. Most motion is scrubbed by scroll; the rest fires once. The only free-running loops are the grain (stepped), the dust's tremor, the temple's breathing camera and the stars.

### The kit (copy, don't rewrite)

This skill folder holds `kit/`. Copy it into `src/` keeping the paths (`kit/lib/motion.ts` → `src/lib/motion.ts`, `kit/styles/base.css` → `src/styles/base.css`). Copy the files byte for byte and never edit them; the roll fills in everything that varies. If the kit or `roll.mjs` is missing, stop and ask for it. Do not rewrite a shader from memory.

| Kit file | Gives you |
|---|---|
| `lib/types.ts` | `Theme`, `Ink`, `ChartSection`, `SectionType`, `Ground`, `Layout` |
| `lib/motion.ts` | GSAP with ScrollTrigger, SplitText, `useGSAP`; ease `stone`; `startLenis`, `getLenis`, `onScroll`, `scrollTo`, `reducedMotion` |
| `lib/ink.ts` | the second drum: `setInk`, `getInk`, `subscribeInk`, `useInk`, `hexToVec` |
| `lib/noise.ts` | `bakeNoise()`: bakes `--noise` (paper stipple) and `--dither` (the hand-over tile). Call once before render |
| `lib/ground.ts` | `groundProps(ground)` and `groundVar(ground)` |
| `lib/capitals.ts` | Doric, Ionic and Corinthian elevations as layered path data |
| `lib/clock.ts`, `lib/roman.ts`, `lib/color.ts` | `useClock(tz)`, `clockParts(tz)`; `roman(n)`; `hexToVec`, `glslVec3` |
| `gl/riso.glsl.ts` | the shared GLSL: hash, value noise, fbm, the rolled ramp, `risoRamp()`, `grain()`, `luma()` |
| `gl/TempleScene.ts` | the hero monument (Three.js) and its riso post pass |
| `gl/RisoGallery.ts` | `gallery`: one fixed OGL canvas that prints every image plane; capture, context loss and restore |
| `gl/DustInscription.ts` | the finale's grains |
| `components/RisoImage.tsx`, `Plate.tsx` | an image printed by the gallery; a full-bleed figure that opens like cella doors |
| `components/Capital.tsx` | a two-ink capital with masked depth layers |
| `components/Chrome.tsx` | `Grain`, `RegMarks`, `InkLevel`, `Cursor`, `TempleMark`, `Dither`, `SiteFx` |
| `components/Preloader.tsx` | the two-drum print of the temple mark |
| `styles/base.css` | reset, type classes, `.riso`, grain, gallery canvas, reg marks, ink level, cursor, temple mark, grounds, dither, images, plates, capitals, buttons, preloader, phone rules, reduced motion, contrast, print. No colour or font values |

### Signature feature 1: the press (every image, printed live)

`gallery.init()` (called by the first `<RisoImage>`) appends one fixed, transparent OGL canvas (`.riso-gallery`, `z-index: 20`, `pointer-events: none`). Each `<RisoImage>` is a DOM placeholder with a real `<img>` inside (alt text, and the fallback); the gallery mirrors it with a plane placed in CSS pixels every frame, so images scroll, pin and transform with the layout. The fragment shader maps luminance onto the five-step ramp with stochastic stipple, prints the drum ink out of register on the highlights, smears under the cursor, bows with scroll velocity (entasis), cuts a rough stippled silhouette (`shape`: `rect`, `arch`, `pill`), and shows bare paper until the texture arrives. When nothing is on screen it skips the GPU entirely.

- Props: `src`, `alt`, `shape`, `bend` (velocity bow, 1 = full), `raw` (0 re-inks fully; ~0.8 keeps a riso illustration close to its own print), `gamma` (>1 darkens a high-key photograph's midtones before inking: white galleries and plaster casts need 1.8–2), `inset`, `fade` (CSS px of top/bottom dither), `cursor` (the cursor label), `onPlate` (receives the handle and its typed uniforms).
- **Images must be CORS-enabled** (Unsplash, your own `src/assets`, or a CORS-enabled CDN); the kit sets `crossOrigin="anonymous"`. Verify every remote URL returns 200 before committing to it.
- **Context loss:** the gallery prevents default, flips every `<RisoImage>` back to its `<img>`, and on restore rebuilds every program and texture from what it kept. Nothing to wire.
- `<Plate plate={…} />` is the full-bleed figure: it opens from the centre (`uInset`) and settles out of a zoom as it scrolls in (`top 92%` → `top 18%`, scrub 1), its top and bottom edges dissolve into the page, and its caption (`Fig. N — Title` | note) rises. **It bleeds by `margin-inline: calc(var(--edge) * -1)`**, so its parent's side padding must be `var(--edge)` (redefine `--edge: var(--gutter)` on phones where the parent pads with the gutter).

### Signature feature 2: the temple

`new TempleScene(canvas, { lite, columns: theme.temple.columns, mirror: theme.temple.mirror, onContextLost })` builds a procedural Doric peristyle: fluted columns with entasis on an instanced mesh, a three-step crepidoma, a grand stair, a dark cella, triglyphs, dentils, pediments, acroteria, rolling hills in fog, 7,000 dust motes (2,600 lite), a lone figure, shadow maps. It renders grey-scale into a target, then a post pass reprints it: luminance onto the ramp, crepuscular streaks from the sky glow, uneven ink laydown, the drum ink out of register on highlights, and a "sheet feeding through the drum" reveal.

- API: `start()`, `stop()`, `resize()`, `setProgress(0..1)` (camera along the processional spline, the sun swings behind the temple, the far end erodes into grain, the figure climbs the stair), `setPointer(x, y)` (clip space, parallax), `setReveal(0..1)`, `setInk(hex)`, `dispose()`.
- `mirror` puts the monument on the left (the roll sets it when the name sits right); the wind, sun, glow and figure mirror with it. On portrait screens the kit lifts the monument with a view offset so the lede and name sit below the stair.
- Lifecycle (Hero): create in `useEffect` inside `try` (catch → printed fallback `<img>`), `setInk(getInk())`, `start()`, then announce readiness after two rAFs (`window.__stoaTemple = true; dispatchEvent(new Event('stoa:temple'))`, which the Preloader waits for). Stop it with an IntersectionObserver when the hero leaves the screen and on `visibilitychange`; `subscribeInk(s.setInk)`; `dispose()` on unmount. Pass `onContextLost: setFallback` to show the fallback while the GPU is gone (three.js restores itself and the kit restarts the loop).

### Signature feature 3: the second drum

`setInk(hex)` re-inks the temple, every image plane, the dust, the CSS `--ink-hi` and therefore all `.riso` type at once. The hero's foot has a radiogroup of the four `theme.inks` swatches; the press can ink the whole site from its own drum. Components read the current ink with `useInk()`.

**Two-drum type:** `<span className="riso" data-text="Word">Word</span>` prints the drum ink behind the key ink at `--mis-x`/`--mis-y` (default `.045em, −.03em`). Tween those variables to misregister; `SiteFx` drifts every `main h2 .riso` into register as it arrives. For a hover slip, set new values on hover; the kit transitions `::before`'s transform.

### Signature feature 4: the dust inscription

`new DustInscription(canvas, { count, font: theme.fonts.display, key: theme.palette.dust, ink: getInk(), onContextLost })` rasterises text off-screen, samples it stochastically, and springs a few thousand grains (7,200; 3,600 under 800px) to the letters, each printed twice (key ink, then the drum ink offset). API: `setText(text)` (upper-cases), `setAssemble(0..1)` (scrubbed: the wind brings the grains in from the east, right-hand letters first), `setPointer(x, y, on)` (grains flee the cursor), `strike(x, y, power)`, `gust()`, `setInk(hex)`, `resize()`, `start()`, `stop()`, `dispose()`.

- **Create it once per canvas.** `dispose()` releases the canvas's context, and a new instance on the same canvas would get a dead one. Never put a value that changes with the viewport (grain count, width) in the effect's dependencies: compute it once with `useState(() => …)`. The kit throws on a lost context so you fall back instead of erroring every frame.
- Wait for the display font before the first `setText`: `document.fonts.load(\`120px "${theme.fonts.display}"\`).finally(() => { d.resize(); d.setText(current, true); })`.
- Under reduced motion call `setAssemble(1)` at once and skip the scrub.
- The fallback (no WebGL or a lost context) is the inscription typeset as `.display.riso` in `--dust`.

### Signature feature 5: drawn capitals

`<Capital order="Doric" | "Ionic" | "Corinthian" className="order__capital" />` renders the elevation in two inks. Every stroke has `pathLength="1"` and `stroke-dasharray: 1 1`; draw it by tweening `strokeDashoffset` 1 → 0 on each ink group's paths **with a fixed stagger amount**, so a busy Corinthian takes no longer than a Doric:

```ts
col.querySelectorAll('.capital > g').forEach((ink) =>
  tl.fromTo(ink.querySelectorAll('path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: { amount: 0.4 }, ease: 'none', duration: 0.35 }, 0.25));
```

The drawings are 320 units wide and come down onto x 32–288, so the shaft below has `margin-inline: 10%`. Back layers are masked by the outlines in front of them, so leaves and volutes overlap like carved stone. **Never add `vector-effect: non-scaling-stroke`** to anything drawn with `pathLength`: it measures the dash in screen pixels while `pathLength` measures it in user units, and the drawing never finishes once the SVG scales up. To hold a constant stroke weight on an SVG that scales a lot (the finale's pediment), measure `--u = viewBoxWidth / clientWidth` with a ResizeObserver and set `stroke-width: calc(1.5 * var(--u, 1))`.

### Signature feature 6: the chrome

- **Preloader** (`<Preloader images top foot onDone />`): no counter. Two drums print the temple mark: the drum ink climbs the plate behind a stochastic stipple edge, then the key ink, while the plates drift into register. It waits on fonts, the temple's first frames and 3–4 images (capped at 9s), then lifts with a clip-path wipe and calls `onDone` (set `ready`). Skipped under reduced motion and with `?skip` in dev.
- **Ink level** (`<InkLevel />`): the only scrollbar. The native one is hidden. Drag or click it; chapter ticks sit where each nav section begins, labelled on hover. Side from `layout.chrome.level`. App toggles `html.mid-dark` while a dark plate crosses mid-screen (the nav's measure loop does it).
- **Cursor** (`<Cursor />`, fine pointers only): a dot, a drum-ink ghost and a lagging ring; `[data-cursor="Label"]` grows it into a labelled drum-ink disc; links get a dashed ring; `[data-dark]` flips its inks. It re-reads what is under it on scroll, so a resting pointer never keeps a stale label.
- **Grain** (stepped drum shimmer, multiply), **RegMarks** (registration targets in the margins), **TempleMark** (the house mark; its drum layer slips on hover), **Dither** (the section hand-over), **SiteFx** (`ready`, `away`: magnetic `.btn`, the tab title changes to `away` while hidden, and section titles drift into register).

### Scroll and reveal

- Scrubbed: the hero's whole timeline, plate doors, manifesto word ink-up, colonnade track, capitals and shafts, stair risers and the walker, facade drawing and dust assembly, marquee.
- Fired once (`scrollTrigger: { start: 'top 80–88%' }`): press controls, facade bays, footer steps, finale characters, plate captions.

**Motion rules:**

- Default ease `stone` (`1 − (1 − p)^4.2`, 1.1s) for every timed tween; CSS uses `--ease-stone`. Scrubs use `ease: 'none'`. Wipes use `expo.inOut`.
- `elastic` only on things that hang or lean: magnetic buttons released (`elastic.out(1, .45)`), a print swinging on its peg. `back.out` only on the preloader's last registration nudge.
- Stepped motion only for the grain (`steps(6)`) and the stars (`steps(3)`).
- **GSAP owns `transform`.** Never centre or offset a GSAP-animated element with a CSS `transform`/`translate` it will overwrite: centre with margins (`top: 0; bottom: 0; margin-block: auto`), and use the separate `translate` property for CSS hover offsets on elements whose transform a tween owns.
- Duration bands: micro .3–.6s, reveals 1.1–1.4s, hero intro 2.4s, wipes .9–1.3s.
- **Reduced motion** (`reducedMotion`): no Lenis, no preloader, no grain animation, no cursor lag, no magnetism, no register drift; the hero reveal completes at once; the colonnade releases its pin and stacks (vertical on phones, a grid on desktop); plates open fully; the dust assembles at once. Scroll-linked state (hero erosion, stair) still follows the scrollbar. The kit sets `transition-duration: 0s` everywhere: **never `0.01ms`** — because `transition-property` defaults to `all`, a tiny duration makes every property transition, GSAP reads a mid-transition opacity of 0 as a reveal's end value, and the content never appears.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible` is a 2px dashed key-ink outline offset 4px, switching to the drum ink inside `[data-dark]` (in the kit). Never remove it.
- The skip link (`.skiplink`, styled in the kit) is the first element and targets `<main id="main" tabIndex={-1}>`.
- Every `<button>` has `type="button"` (the tablet's is `submit`). Ink swatches are `role="radio"` with `aria-checked` inside a labelled `role="radiogroup"`; press sources and inks use `aria-pressed`.

### Navigation

**Desktop (≥901px):**

- A fixed header, `--nav-h` 72px, `z-index: 80`, a `1fr auto 1fr` grid: the TempleMark and the name in display capitals (links to the top), the chapter links (`<i>{numeral}.</i>{label}` in mono, an underline that draws from the left on hover and on the active chapter), and on the right the studio clock (`{city} {HH:MM:SS}`) and a pulsing status dot ("Taking commissions"). No CTA button.
- Its ink is measured, not toggled: each frame (rAF-queued on scroll) the nav checks which `main [data-dark]` element sits under y = 36px and sets `data-theme="dark"` (text → `--mist`); it marks the chapter crossing mid-screen `is-active` with `aria-current`, toggles `html.mid-dark`, and hides itself on scroll down past 60vh (`translateY(-110%)`, never while it has `:focus-within`), showing again on scroll up.
- Chapter labels and numerals come from `chart.ts` (`sections.filter(s => s.nav)`). Every link uses the kit's `scrollTo('#id')`.

**Phones (≤900px):**

- Links, clock and status hide; a "Menu" button (`aria-expanded`, `aria-controls="site-menu"`, ≥44px) with two drum-shadowed bars that cross into a ×.
- The menu is a full-screen sheet of key ink (`role="dialog" aria-modal="true"`, `inert` and `aria-hidden` while closed, `data-dark`) fed down over the page (`clip-path: inset(0 0 100% 0)` → `inset(0)`, .9s `expo.inOut`), with huge display-capital chapter links (`.riso`) rising from masks and a mono foot (email, city clock, status). Lenis stops while open; Escape closes; Tab wraps between the links and the close button; focus moves to the first item on open and back to the button on close; it closes itself if the viewport grows past 900px. A link closes the menu, then scrolls after 380ms.

### Forms & contact

There is no backend. Contact is the finale's **tablet**: a single "Carve your name" field whose value the dust carves live (spaces become `·`), and a "Send the tablet" submit that strikes the stone and opens a pre-written `mailto:` (subject and body name the visitor and a random tablet number). The status line under it is `aria-live`. Beside it, the email address as a `.riso` link with a "Copy address" ghost button (clipboard, falling back to `mailto:`), the social links, and the studio clock. Hovering a bay carves its Latin word into the stone (`SCRIBE·MIHI`, the social name with U cut as V, or the time in Roman numerals).

---

## Layout sections (approved roster)

`chart.ts` fixes which sections exist, their order, ids, numerals, labels, papers and hand-overs, and each one's variant (`layout`). The hero is always first and the finale always last; between them the roll places 3–5 of manifesto, colonnade, orders, press and ascent. Build exactly that. Render them in `App` from a `Record<SectionType, ComponentType<SectionProps>>`; every section component receives `{ section, ready }`, spreads `{...groundProps(section.ground)}` on its `<section id={section.id}>`, is labelled by its h2 (`aria-labelledby`), and ends with `{section.next && <Dither to={groundVar(section.next)} />}`.

- **Hero** (`type: hero`). `height: 360vh` (300vh ≤900px) with a sticky `100lvh` stage holding the temple canvas and `.hero__ui` (`pointer-events: none` except buttons). **Variant:** `side` (`left`: name and lede left, monument right; `right`: everything mirrors: lede and name right-aligned, the vertical rail moves left, the caption right, the figure note left; the roll mirrors the temple to match). Top row: three mono reveals (a plate title, `{columns[0]} × {columns[1]} columns · procedural · live`, the coordinates). A vertical mono rail on the far side: the Greek word, a 90px rule, `Est. {year}`. Main: the lede (first name in italic at 1.2em, then three short lines, `white-space: nowrap`), then the h1 name (`aria-label` = full name; letters `aria-hidden`, each `.hero__letter-mask > .hero__letter.riso`). Absolute: a caption (`clamp(30px, 3.6vw, 62px)`, one italic phrase) and a figure note (`Fig. 1` + a line), both hidden. Foot: a rule, the scroll cue (a line drawing in and out) and the drum radiogroup.
  - Intro when `ready`: reveal 0 → 1 over 2.4s `power2.inOut` (`scene.setReveal`), letters rise from `yPercent: 110` (stagger .07, 1.6s) while their drum converges from `--mis-x .4em` to `.045em`, mono and lede lines rise from masks, rules scale in, then the letter masks get `overflow: visible`.
  - Scroll (one timeline, `start: 'top top', end: 'bottom bottom', scrub: true`, `onUpdate: self => scene.setProgress(self.progress)`):

```ts
const WIND = theme.temple.mirror ? -1 : 1; // the name erodes the way the wind blows on screen
tl.to(q('.hero__letter'), {
    x: (i) => `${WIND * ((WIND > 0 ? n - i : i + 1) * 4 + 18)}vw`, y: (i) => `${-6 - (WIND > 0 ? n - i : i + 1) * 3}vh`,
    rotate: (i) => WIND * (8 + i * 3), opacity: 0, filter: 'blur(10px)',
    stagger: { each: 0.035, from: WIND > 0 ? 'end' : 'start' }, ease: 'power2.in', duration: 0.3 }, 0.04)
  .to(q('.hero__lede, .hero__side'), { opacity: 0, y: -40, duration: 0.2, ease: 'none' }, 0.02)
  .fromTo(q('.hero__caption'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.2, ease: 'none' }, 0.46) // after the last letter has gone
  .to(q('.hero__caption'), { opacity: 0, y: -60, duration: 0.2, ease: 'none' }, 0.72)
  .fromTo(q('.hero__plate'), { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, 0.8);
```

  On phones the foot row stacks (`column-reverse`), so lift the caption to `bottom: calc(var(--gutter) + 132px)` and let it span the gutters, or it sits on the rule.
- **Manifesto** (`type: manifesto`, not in the nav). Padding `18vh var(--edge)`. A mono head row over a key-ink rule (an h2 label such as "(Credo)", the role, "City → anywhere"); the statement in display (7–9 phrases), where phrases carrying an image get an inline **pill**: `<span className="manifesto__pill">` (0.8em × 2.4em, `vertical-align: −.06em`) holding a `<RisoImage shape="pill" bend={0.2} />`. The last phrase is an italic serif. Then an optional Plate, then a foot grid: an outlined folio numeral (`01`, the section's index; `-webkit-text-stroke` in key ink at 55%, its `.riso` drum layer at 55%) beside a mono signature and city/year, and an aside paragraph with one italic word. **Variants:** `pills` (1–3: only the first N image phrases become pills; later ones stay words), `plate` (the full-bleed figure), `numeral` (the folio). Motion: SplitText words ink up from opacity .14 (`top 80%` → `bottom 45%`, scrub); pills open with `scaleX` 0 → 1 from the left (never width, so the paragraph never reflows); the numeral drifts `yPercent` 18 → −12.
- **Colonnade** (`type: colonnade`, id `works`): selected work as a pinned horizontal portico. `.colonnade__pin` is `100vh`, overflow hidden, with a giant outlined ghost of the label drifting behind (`30vw`, centred with margins) and a flex track (`width: max-content`, gap `clamp(48px, 5.5vw, 110px)`). The intro column (`min(34vw, 600px)`) has the eyebrow, the h2 (`The {label}`, fitted), a lede and a mono hint. Each **work** (`clamp(280px, 23vw, 400px)`) is a column: its Roman numeral centred above a 22px abacus SVG (slab, bevel, fillet; `scaleX` .3 → 1 as it enters), a link wrapping the `<RisoImage shape={layout.colonnade.shape}>` (`height: min(40vh, 520px)`, `cursor="View"`), and a body (mono client and year over a hairline, the title as a `.riso` display span, an italic kind, a 17px/500 blurb, mono stack chips). An end column: a two-line display question and the page's dark `.btn`. A status bar at the bottom: `Column {n} / {total}`, a progress rule, the current title. **Variants:** `count` (4–7 works), `shape` (`arch` | `pill`), `stagger` (alternate columns sit `translateY(4vh)`, the others `−3vh`). Hover (CSS): the capital rises `translate: 0 −7px`, the numeral's drum slips to `.14em, −.09em`, the title's drum from 0 to `.05em, −.035em`.

```ts
mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
  const distance = () => track.scrollWidth - innerWidth;
  const tween = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: {
    trigger: pin, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true,
    onUpdate: (self) => { /* set the index and the progress rule */ } } });
  // each work's body rises (left 95% → 55%) and its abacus widens, on the track's own timeline:
  // scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true }
});
mm.add('(max-width: 900px)', () => { /* each work rises once at top 88% */ });
```

  On phones and under reduced motion the track stacks vertically (`height: auto`, padding `16vh var(--gutter)`, gap 12vh, images `110vw` tall on phones; a grid on reduced-motion desktops) and the ghost and status hide.
- **Orders** (`type: orders`, id `craft`): three capabilities as the three classical orders, always Doric, Ionic, Corinthian left to right. A head (eyebrow, fitted two-line h2, lede bottom-right), then a 3-column grid aligned to the bottom: each order is a `<Capital>`, a fluted shaft (`margin: −2px 10% 0`, key-ink side borders, a repeating flute gradient over a periwinkle-to-mist cylinder, `scaleY` from the bottom), an inner paper panel (`Order I`, the name, an italic motto, a 17px/500 lead, six skills as dashed-ruled mono rows each ending in ✦, which rotates on hover), and a two-step key-ink and blue base. One scrubbed timeline per order (`top 85%` → `top 20%`, scrub .8): shaft, then the capital drawing, then the skills. **Variants:** `rise` (`stepped`: shafts 56/66/76vh, rising like the orders' proportions; `level`: all 64vh), `marquee` (a key-ink band below with the order names and other words in huge lavender display capitals, ✦ in the drum ink, scrubbed `xPercent` 0 → −50). Phones: one column, shafts unclamped.
- **Press** (`type: press`, id `press`, always a dark plate): the shader handed to the visitor. A head, then a two-column body: the **frame** (a hairline box with drum-ink crop marks, a 4:5 sheet with `<RisoImage key={src} … onPlate={h => { h.item.lockInk = true; … }} cursor="Smear" />` that wipes open with scroll, a mono readout `Print Nº 0001 · Grain · Reg Δ · Density · ink code`) and the sticky **controls**: `01 — Master` (four greyscale thumbnails, `aria-pressed`), `02 — Drum settings` (sliders for grain 1–6px, misregistration 0–16px, density .6–2.2, with a drum-ink fill and a diamond thumb), `03 — Second drum` (the four inks), and two buttons: **Pull a print** (`.btn--light`) and **Ink the whole site** (ghost; disabled with "The site is in this ink" when it already is). Sliders write the plate's uniforms (`uGrain = grain × min(dpr, 1.6)`, `uMisreg`, `uDensity`, `uInk`). **Pull**: shake the sheet (6 × 80ms yoyo), jitter misregistration ±3, sweep `uPull` .001 → .999 over 1.3s, then `gallery.capture(handle)` and hang the JPEG on the **drying line**: a rule across the full bleed with pegs, up to six prints, newest first, dropping in with `elastic.out(1, .45)` to a random ±4° tilt; each print is a download link; a dashed ghost slot shows the next number. **Variant:** `frame` (`left` | `right`). Phones: one column, controls static, the rack scrolls sideways.
- **Ascent** (`type: ascent`, id `ascent`): the chronicle as a staircase. Background: its paper → lavender at 55% → `color-mix(--ink-hi 70%, --lavender)` at the foot, with the noise. Head, then an `<ol>` bleeding edge to edge (`margin-inline: calc(var(--edge) * −1)`), one flex `li.step` per year: text (display year, a 500 serif title, 16px/500 copy; `opacity .35` until lit), a 12px paper tread (drum ink when lit) with a key-ink lip, and a riser `calc(var(--i) × clamp(46px, 8vh, 96px) + 60px)` tall in a blue-to-key gradient with noise (`scaleY` in as it enters). The first and last treads pad their text by `--edge` so it never touches the bleed. A walker figure (two-ink SVG) hops tread to tread on one scrubbed proxy (`top 70%` → `bottom 45%`, scrub .5): interpolate between the centres of the current and next tread with `power2.inOut` over the middle half of each step, lift it by `sin(e·π) × 28px`, light every tread up to `round(f)`. **Variant:** `steps` (4–7 years). Phones: a vertical list with a key-ink left rule; treads, risers and walker hide.
- **Finale** (`type: finale`, id `contact`, always the last dark plate): midnight with a drum glow at the top and a blue glow at the foot, 46 stepped twinkling stars, noise. A mono meta row, then the centred title in two `.line`s (SplitText `words,chars`, characters rise from `yPercent: 110`, rotate 5), the second ending in the italic drum-ink phrase. An optional Plate. Then the **facade**, `min(1240px, 100%)`: the pediment SVG (raking cornices, tympanum rosette with petals, acroterion, volute wings; drawn by scrub `top 90%` → `top 30%`; the Greek word and year as mono text in the tympanum, hidden on phones), a dentil cornice, the **architrave** (`clamp(170px, 20vw, 290px)`, double rules, the dust canvas, four mono corners: `Inscriptio`, `Tablet Nº`, `Temple dust · N grains`, `Hover · Strike · Carve`; an sr-only `aria-live` line reads the stone), the frieze form (triglyph strips, the chisel field in display capitals with a dashed underline and drum caret, the submit), the status line, then three contact **bays** between four short columns (shafts `scaleY` in). **Variants:** `greeting` (the stone's resting word: `XAIPE`, `SALVE` or `AVE`; after sending it reads `GRATIAS`), `plate`. Phones: the frieze, bays and colonnade stack; shafts and triglyphs hide.
- **Footer** (outside `<main>`, `<footer className="stylobate" aria-label="Site" data-dark>` on midnight): the temple stands on a three-stepped crepidoma, each step wider than the one above (`margin-inline: 12%`, `6%`, `0`), blue gradient with noise and a 3px drum-ink top edge. Step 1: a printer's control strip (two targets, ten swatches of key ink, periwinkle and drum at falling opacity, a mono line with the seed). Step 2: a four-item colophon (`<dl>`: typeset in the rolled faces, built with, photographs, tracking: none). Step 3: copyright, a "Back to the temple ↑" button with the TempleMark (dispatches `stoa:gust`, which the finale turns into `dust.gust()`, then `scrollTo(0, { duration: 3.2 })`), and "Made in {city}". Steps rise once as they enter.

Global layers in every build, in this order: skip link, `<Preloader>`, `<Nav>`, `<main>`, `<Footer>`, `<RegMarks>`, `<InkLevel>`, `<Grain>`, `<Cursor>`, `<SiteFx>`.

---

## Architecture & performance guardrails

The output is a **React 19 + TypeScript + Vite project** that builds to a static `dist/` with a relative base (it runs from any sub-path or static host). No backend, no CMS, no runtime requests beyond the photographs.

**Canonical stack (`package.json`):**

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5176 --strictPort",
    "check": "tsc --noEmit",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --port 4176 --strictPort"
  },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "gsap": "^3.15.0",
    "lenis": "^1.3.26",
    "ogl": "^1.0.11",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "three": "^0.186.0"
  },
  "devDependencies": {
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@types/three": "^0.186.0",
    "@vitejs/plugin-react": "^6.1.1",
    "typescript": "^6.0.3",
    "vite": "^8.3.0"
  }
}
```

The roll adds four Fontsource packages. Add `name` and `description` per build. Requires Node 20.19+. GSAP 3.13+ includes SplitText for free.

**Config files (write verbatim):**

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"], "module": "ESNext", "moduleResolution": "bundler",
    "jsx": "react-jsx", "strict": true, "noEmit": true, "verbatimModuleSyntax": true, "isolatedModules": true,
    "skipLibCheck": true, "noFallthroughCasesInSwitch": true, "noUnusedLocals": true, "noUnusedParameters": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: { output: { manualChunks(id) {
      if (id.includes('node_modules/three')) return 'three';
      if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion';
    } } },
  },
});
```

`.gitignore`: `node_modules/ dist/ .DS_Store *.local *.log`. Never use `any` or `@ts-nocheck`; type DOM queries (`querySelector<HTMLElement>`, `filter((el): el is HTMLElement => !!el)`) and CSS custom properties (`{ '--len': n } as CSSProperties`).

**Project manifest:**

```
project/
├── package.json, tsconfig.json, vite.config.ts, .gitignore — as above
├── index.html                    — author (head rules below, #root, a <noscript> line with the email)
├── stoicism.chart.json           — ROLL
├── README.md                     — author: what it is, how to run, the seed and the roll's choices
├── public/favicon.svg            — ROLL
└── src/
    ├── main.tsx                  — author from the bootstrap below
    ├── App.tsx                   — author from the bootstrap below
    ├── content.ts                — author: every word and image (persona, sections, works, orders, steps, finale)
    ├── theme.ts, chart.ts, fonts.ts — ROLL
    ├── styles/tokens.css         — ROLL
    ├── styles/base.css           — KIT
    ├── styles/sections.css       — author: nav, menu and every section, tokens only
    ├── lib/, gl/                 — KIT
    ├── components/               — KIT (RisoImage, Plate, Capital, Chrome, Preloader)
    └── sections/                 — author: Nav, Footer, and one component per section type in chart.ts
```

**Bootstrap:**

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client';
import './fonts';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import App from './App';
// every visit starts at the hero: the temple is the threshold
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
const root = document.getElementById('root');
if (root) createRoot(root).render(<App />);
```

```tsx
// src/App.tsx (abridged)
bakeNoise();
startLenis();
export interface SectionProps { section: ChartSection; ready: boolean }
const COMPONENTS: Record<SectionType, ComponentType<SectionProps>> = { hero: Hero, manifesto: Manifesto, colonnade: Colonnade, orders: Orders, press: Press, ascent: Ascent, finale: Finale };

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const off = onScroll((l) => gallery.setVelocity(l.velocity));
    document.fonts?.ready.then(() => ScrollTrigger.refresh()); // late metrics shift pinned sections
    return off;
  }, []);
  useEffect(() => { if (ready) ScrollTrigger.refresh(); }, [ready]);
  return (<>
    <a className="skiplink" href="#main">Skip to content</a>
    <Preloader images={[/* the first plate and two images below the hero */]} top={[…, …]} foot="…" onDone={() => setReady(true)} />
    <Nav ready={ready} />
    <main id="main" tabIndex={-1}>{sections.map((s) => { const S = COMPONENTS[s.type]; return <S key={s.id} section={s} ready={ready} />; })}</main>
    <Footer />
    <RegMarks /><InkLevel /><Grain /><Cursor /><SiteFx ready={ready} away="◐ The second drum is drying… — Name" />
  </>);
}
```

**Component conventions:**

- Copy lives in `content.ts`; section components read it and `chart.ts`/`theme.ts` and never hard-code brand strings. Read variants from the module (`const v = layout.colonnade`), never re-decide them.
- Write all GSAP in `useGSAP(() => { … }, { scope: root, dependencies: […] })`; branch desktop/phone with `gsap.matchMedia()` using the same queries as the CSS. Revert SplitText in the returned cleanup.
- Long-lived WebGL objects (the temple, the dust) live in `useEffect` with an empty or stable dependency list, guarded by `try`, paused off screen by an IntersectionObserver, and disposed on unmount.
- Fit every big display line to its box with `--len` and `--display-advance`; rolled faces differ in width by 30%.
- Breakpoint: 900px is the phone breakpoint everywhere (nav, colonnade pin, grids, reg marks and ink level hide).

**Construction method:**

1. Scaffold by hand (no `create vite`): `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`.
2. Copy `kit/` into `src/` byte for byte.
3. Run `node <skill>/roll.mjs --out <project>`. Read `stoicism.chart.json` and report the seed, hue, drums, fonts, temple, line-up and every variant.
4. Choose the photographs: 6–12 CORS-enabled images of architecture, sculpture, interiors or landscape (Unsplash works: `https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=1600&q=80`). Check each returns 200 (`curl -sI`). Mark high-key ones with `gamma: 1.8–2`. A Plate wants a wide image with a strong silhouette.
5. Write `content.ts`, then `sections/` (Nav, Footer, one component per type in the chart, honouring every variant), then `sections.css`, `App.tsx`, `main.tsx`.
6. `npm install`, then `npm run build`: it must finish with no type errors and write `dist/index.html`.
7. `npm run dev` and walk the page at 1440×900: the preloader prints and lifts, the temple reveals and the name settles into register, scrolling erodes the name before the caption arrives, every Dither hands over to the right paper, plates open, the colonnade pins and ends on its question, capitals draw completely, the press pulls a print onto the line, the stair lights tread by tread, the dust carves the greeting and your typed name, hovering a bay re-carves the stone, the footer button gusts the dust and climbs to the top. Swap the drum from the hero: everything re-inks. Repeat at 390×844 (no horizontal overflow: `document.documentElement.scrollWidth === innerWidth`), with `prefers-reduced-motion: reduce` (jump to the bottom: the contact bays and footer are visible), and across a live resize from desktop to phone and back (no console errors; the colonnade pins again).
8. Optional: force context loss (`WEBGL_lose_context`) on `.riso-gallery` and `.hero__canvas`; images fall back to their `<img>` and the hero to its print, and both return on restore.

**Integrity & privacy:** pin majors as above, never `@latest`. No analytics, trackers, cookies or third-party scripts. Fonts are self-hosted. Photographs are the only external requests; credit their source in the colophon.

**Size and performance target:** about 1.1 MB of JS minified (three ≈ 575 KB, app ≈ 370 KB, motion ≈ 140 KB; ≈ 315 KB gzipped). DPR is capped (temple 1.75, lite 1.25; gallery 1.6; dust 2). The temple uses lite mode under 800px or ≤ 4 cores. The gallery and temple skip all GPU work off screen. If the budget is exceeded, cut in this order: (1) the press's drying line, (2) the ascent walker, (3) the colonnade's ghost and status. Never cut the temple, the gallery, the dust, the drum or the accessibility markup.

---

## HTML head & meta tags

- `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, `<meta name="color-scheme" content="light">`.
- `<title>`: `Name — what they build, in the voice` (a name, an em dash, a short proposition with one material or print word). Never the name alone.
- `<meta name="description">`: one or two sentences, 120–155 characters.
- `<meta name="theme-color">`: written by the roll (the periwinkle paper).
- `og:type`, `og:title`, `og:description`, `twitter:card`. Add `og:image` only with an absolute URL.
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (rolled), and `<link rel="preconnect" … crossorigin>` to the image host.
- `<noscript>`: one line in voice with the email.

---

## Print stylesheet

`base.css` already hides the grain, gallery canvas, reg marks, ink level, cursor, preloader, dithers and `.no-print`, forces black on white, removes animation, transitions, blend modes and shadows, shows every `<img>` fallback and sets `section { break-inside: avoid }`. In `sections.css` add `@media print` rules that release the hero (`height: auto`, a static 60vh stage), unpin and wrap the colonnade track, and hide the nav, menu, press controls, drying line and the tablet form.

---

## Accessibility checklist

Every build must satisfy all of these before it is complete.

**Structure:**

- Landmarks: skip link, `<header>` with `<nav aria-label="Primary">`, `<main id="main" tabIndex={-1}>`, `<footer aria-label="Site">` **outside** `<main>`.
- One h1 (the name, with `aria-label`); every section `aria-labelledby` its h2; h3 for works, orders and years. No skipped levels.
- Split, carved and decorative type is `aria-hidden` with the real text nearby (`aria-label` on the h1; an sr-only `aria-live` line for the inscription).

**Interactive elements:**

- Buttons have an explicit `type`; icon-only and swatch controls have `aria-label`s; external links say "(opens in a new tab)" in an sr-only span.
- `:focus-visible` everywhere (kit). Touch targets ≥ 44×44px on phones (swatches 28px with spacing, menu items, burger, social rows, ink buttons, buttons 48px).

**State management:**

- `aria-expanded`/`aria-controls` on the menu button; `inert` and `aria-hidden` on the closed menu; `aria-current` on the active chapter; `aria-checked` on swatches; `aria-pressed` on press sources and inks; `aria-live="polite"` on the tablet status and the drying-line count.
- Decorative layers are `aria-hidden`: all canvases, grain, reg marks, ink level, cursor, preloader plates, pills, numerals, ghost text, capitals, walker, stars, pediment, dithers.

**Media queries:**

- `prefers-reduced-motion: reduce` implemented as described under Motion; jump to the end of the page and confirm every section's content is visible.
- `prefers-contrast: more` from the rolled tokens and the kit.
- `(hover: hover) and (pointer: fine)` gates the custom cursor; ≤900px hides the reg marks and the ink level and gives native touch scrolling.

---

## LLM directives: vary vs. freeze

**Varied by the roll (never pick these yourself):**

- The hue of every paper and the key ink (258°–300°), chroma and lightness drift; the four drum inks and which opens the site; the ramp's top step.
- The display, serif and mono faces.
- The temple's colonnade (6 × 13, 8 × 17 or 6 × 14) and which side it stands on.
- Which 3–5 middle sections appear, their order, labels and papers.
- Every variant: hero side; manifesto pills, plate and numeral; colonnade count, shape and stagger; orders rise and marquee; press frame side; stair steps; finale greeting and plate; the ink level's side.

**Varied by you, every build:**

- The persona or studio, the name set in the hero, the Greek word, the lede, every heading, label and line; the photographs and their captions; the works, clients, stacks; the orders' mottos and skills; the years; the preloader lines; the away title; the microcopy.

**Never vary:**

- One press: every image and the temple printed by the kit's shaders, with the rolled ramp and a misregistered drum. No raw full-colour imagery.
- Light lavender papers with exactly two dark plates (press, finale); no theme toggle.
- The three-font system: inscriptional capitals, a book serif, a printer's mono.
- The stochastic dither between sections, the grain, the reg marks, the ink-level scrollbar, the custom cursor.
- Classical architecture as the structure: columns for work, orders for craft, a stair for time, a facade and stylobate for contact and footer.
- The kit copied byte for byte, one roll per build with a fresh seed, `stone` easing, scroll-bound motion.
- React + TypeScript + Vite + Three.js + OGL + GSAP + Lenis, static output, self-hosted fonts, no tracking, and the accessibility, reduced-motion and context-loss baselines.
