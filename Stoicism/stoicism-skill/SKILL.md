---
title: design-stoicism-monument
description: "A risograph design language, not a temple-page template. Blue-violet papers, inscriptional type and two-ink imagery support five distinct hero families, three collection structures, three endings and three navigation systems. A history-aware seeded generator rejects known structural repeats and near-duplicates; a visual difference gate checks the result. React + TypeScript + Vite, shared OGL image press, optional Three.js temple and dust inscription, GSAP and Lenis."
---

# Stoicism

You are designing in the Stoicism language. This is not a template to copy. It is a set of convictions, proportions and taste lines that produce monumental, hand-printed, gallery-grade pages. Every build should feel unmistakably from the same language and never be identical to a previous one.

## Core conviction

Stoicism is **a monument printed by hand**, not one particular monument. Preserve the material: blue-violet papers, deep key ink, a misregistered pastel drum, tactile grain, inscriptional capitals, book serif and printer’s mono. Architecture supplies proportion, rhythm and weight; it does not require a literal temple on every screen.

The old full-screen temple, enormous bottom-edge name and carved contact facade are **one composition**, not the default scaffold. Repeating that silhouette with new names, photographs, fonts, ink or a mirrored camera is a failed iteration.

**Variation has two owners.** The generator chooses a macro composition and its compatible section chart; the author chooses a subject-specific visual idea, imagery, content hierarchy and real interaction. Both are required. A different random seed is not evidence of a different design.

Never clone a previous build’s component markup, authored CSS or reference persona. Preserve user-mandated identity, verified content and supplied assets; reinterpret their visual hierarchy instead of renaming the same layout. Reuse the supplied rendering/accessibility primitives, not a finished page. Preview images show material treatment only; do not use them as wireframes.

**Do not override the accepted chart.** Implement `composition` before micro `layout` variants. A portico is not an editorial spread; a smaller temple is not a diptych. If available content cannot support a section, exclude it before rolling rather than fabricating projects, history or capabilities to fill it.

Use Stoicism for people and institutions whose work should feel built rather than assembled: creative developers and studios, architects, museums, archives, galleries, festivals of theatre or music, publishers, type foundries, heritage brands. It is a poor fit for SaaS dashboards, fintech, e-commerce catalogues, or anything that needs full-colour photography.

---

## The roll (after the content inventory, before design)

1. Identify the site’s actual purpose, primary action, available media and useful content structures. A music publication might need listening selections and an editorial statement; it does not automatically need a studio-capabilities section, made-up history, print lab or email form.
2. Select 2–5 eligible middle-section types from `manifesto,colonnade,orders,press,ascent`. Include `press` only when the visual tool serves the brief. The roll may select a subset of a larger eligible pool.
3. Scaffold and copy the entire kit, then run:

```bash
node <skill>/roll.mjs --sections manifesto,colonnade --out <new-project>
```

The generator needs only Node, no network. It writes:

| File | Contract |
|---|---|
| `src/theme.ts` | `Theme`: palette, five-step ramp, four inks, fonts and optional temple settings |
| `src/chart.ts` | typed `sections`, `layout`, **`composition: Composition`**, and `seed` |
| `src/styles/tokens.css` | palette, fonts, display advance and high-contrast overrides |
| `src/fonts.ts` | self-hosted Fontsource imports |
| `public/favicon.svg` | two-ink house mark |
| `stoicism.chart.json` | schema version 2, eligible sections, complete roll and novelty comparisons |

It also patches the HTML theme color and Fontsource dependencies. Install dependencies after rolling. Never manually edit generated modules. A fresh design needs a new output folder; an existing chart is protected from fresh-roll replacement.

### Persistent novelty history

- Fresh `--out` builds reserve their structural fingerprint in **`.stoicism-history.json` next to `roll.mjs`**. Keep this ledger with the skill between sessions; do not delete or reset it to obtain a preferred result. `--history <path>` selects a shared ledger when several copies of the skill are in use. Independent ledgers cannot detect each other’s builds.
- `node <skill>/roll.mjs --remember <old-project>/stoicism.chart.json` enrolls an existing build without changing that project. Legacy charts normalize to the old monument / portico / facade / chapters / processional composition.
- `--against <prior-chart.json>` adds an explicit comparison, including an older build outside the ledger. Use it when the user supplies a previous site. It does not import that chart into the ledger.
- Exact structural fingerprints are forbidden anywhere in saved history. Against the immediate prior build, **the hero must change and at least three active macro axes must change**. Against each of the four preceding builds, at least two active axes must change. Collection does not count if either build has no colonnade. Colors, fonts, names, left/right mirroring, item counts and unused options never count.
- Candidate selection retries internally without weakening the thresholds. If no candidate passes, the command fails; expand the actual design vocabulary or content eligibility, not the similarity allowance.
- Without `--out`, the command previews a candidate without reserving it. A preview is not a promise that the next fresh command uses that candidate.
- `--seed <accepted-seed>` is **repair/reproduction only**, bypasses admission, and never reserves a new history entry. With an existing output chart its eligible pool is restored automatically. When reproducing into a different folder, supply the original `--sections` pool as well. The seed and eligible pool reproduce composition, sections, layout, theme and assets independently of later history; novelty mode/comparisons can differ.
- Seeded repair is for schema-2 charts from this generator. Legacy charts can be enrolled and compared, but the new generator refuses to overwrite their projects; it cannot reproduce an older algorithm from a seed alone.

Read the chart before authoring components. Report the seed, macro composition, changed axes versus prior builds, palette, fonts and selected sections. Put the seed, eligible pool and novelty comparison in the project README.

### Visual difference gate — mandatory

The ledger rejects known structural repeats; it cannot judge a finished screenshot or a build it has never seen. Before coding, describe the new **subject-specific visual thesis** and how the first screen and page journey differ from the last available build. Do not offer five cosmetic versions of the same layout.

Before delivery, compare desktop first-screen and full-page/section screenshots against the previous build when available. Review composition with color and copy mentally removed: focal object, text mass, media silhouette, navigation placement, collection geometry, ending and scroll rhythm. At least three implemented macro changes must be clearly visible, not merely recorded in JSON. Check mobile separately; desktop variants must not all collapse into the same phone template.

Record a concise “Difference from previous build” section in the project README: baseline seed (or “no prior visual available”), changed active axes, actual visual decisions and screenshots examined. Do not claim a global uniqueness guarantee or unseen visual comparison. If the screenshots still look like the same template, **the build fails this gate**: fix the authored interpretation of its accepted composition before delivery, without erasing history or rerolling for cosmetic differences.

---

## Voice

The tone is calm, exact and quietly proud, with a little wit. It borrows from archaeological plates and catalogue captions ("Fig. 2 — The hill at dusk"), printers' colophons, building specifications and inscriptions. The writer is a master builder who also runs the press: they describe what they made and how, never sell, and let one good image carry a paragraph.

**Rules:**

- State the proposition in the first line and prove it with a concrete fact: "180 sculptures", "under 40 KB", "2.3 million scans", "1:1". No round marketing numbers.
- No superlatives, exclamation marks or "cutting-edge", "seamless", "next-level", "elevate".
- Ledes are one or two sentences. Captions are `Fig. N — Title` plus one short line. Microcopy is mono, uppercase, separated by ` · ` (middle dot).
- Use architecture and print as an editorial vocabulary, not mandatory labels for every domain. Records are records, articles are articles, exhibitions are exhibitions; a collection can inherit column proportions without being titled “Peristyle.” Greek, Latin and Roman numerals are optional accents, never required invented coordinates or historical claims.
- The subject leads the imagery: musicians, instruments, sleeves, scores, stage spaces and sound-related photography for music; actual work for portfolios; artifacts for archives. Classical stock imagery is not a substitute for relevant content.
- Headings are short and set in capitals; one heading may end in an italic serif phrase in the drum ink ("Set the first stone *with me.*").
- Names feel cut in stone or printed on a colophon ("Agora Live", "Plaster & Pulse", "Weight & Lean", "Bottega Lumen"). Invent your own every build.
- Approved vocabulary: column, capital, order, stylobate, peristyle, portico, plate, figure, drum, ink, register, misregistration, pull, print, proof, stipple, grain, chisel, inscription, tablet, quarried, procession, threshold.
- Set typography properly: curly quotes and apostrophes, real em dashes, `Nº`, `×`, `′` and `°` in coordinates, non-breaking spaces where a number and unit belong together.

---

## Composition

**Composition wins over decorative variation.**

- **Hero:** implement `composition.hero` from the families below. Only `monument` uses the temple-dominant, bottom-name composition.
- **Rhythm:** `composition.rhythm` controls density and pinning. `processional` uses 16–20vh section breathing room and at most two desktop pinned passages; `editorial` uses 9–13vh with alternating text/media proportions and no required pin; `compact` uses 5–8vh, small section heads and a direct content index, no pinned passages. All retain `--edge`; phones use `--gutter`. A non-processional monument has a static 100lvh stage, not a 360vh dead scroll.
- **Separators:** use the kit’s stochastic `<Dither to={groundVar(section.next)} />`. Internal publication rules are allowed; no shadowed cards or gratuitous panels.
- **Section heads:** change hierarchy with rhythm. Huge heads belong to processional pauses, not every section. Editorial heads share a baseline with folio/lede; compact heads use a modest display label over useful content.
- **Content:** chart selects only eligible structures. Treat `colonnade` as a collection data model, not a command to draw Greek columns. Do not manufacture timeline entries, clients or skills to satisfy a visual recipe.
- **Papers:** honor each chart ground. Midnight is reserved for an included press and/or facade ending; colophon and split endings use light papers. There is no fixed two-dark-section template.

**Refuse:**

- Cards with shadows, glassmorphism, gradient blobs, neon, emoji, icon fonts, stock 3D renders.
- Raw full-colour photographs. Every image goes through `<RisoImage>` or `<Plate>`; the only raw pictures are the small greyscale thumbnails in the press and the downloaded prints.
- Logo walls, testimonial carousels, pricing tables, cookie banners.
- A theme toggle. The ink-and-paper system is one coherent light publication, with dark plates only when selected by the chart.
- Literal colours in component CSS. Every colour is a token or a `color-mix()` of tokens.

---

## Color

Stoicism is a **single-theme** system: blue-violet light papers with chart-selected dark passages, no toggle.

**Commitment level: a riso print on lavender stock.** Everything is one blue-violet hue at different weights of ink, plus one pastel drum that catches highlights, misregisters type and fills the primary buttons.

All values come from `tokens.css`. These are the roll's rules (OKLCH), so you know what each token is for:

| Token | Role | Rolled within |
|---|---|---|
| `--midnight` | the key ink: type, rules, the dark plates | L .24, the rolled hue |
| `--indigo`, `--blue` | deep steps: risers, stylobate, button offsets | L .34 / .45 |
| `--periwinkle`, `--peri-soft` | mid inks and default stock; the hero ground comes from the chart | L .62 / .65 |
| `--lavender`, `--mist`, `--paper` | light papers; `--paper` is the lightest stock | L .78 / .88 / .93 |
| `--dust` | the finale's grains | L .92 |
| `--ink-hi` | the second drum; `setInk()` rewrites it live | one of 12 pastel riso inks |
| hue | every token above | **OKLCH 258°–300° only**: cornflower through periwinkle to iris. Chroma ×0.86–1.12 |

**Rules:**

- The key ink is the text colour on every light paper. On the dark plates (`[data-dark]`) text is `--mist` and labels `--lavender`.
- **The drum ink** (`--ink-hi`) appears in: the misregistered copy behind `.riso` type, button faces (`.btn--light`) and button offsets, the cursor's labelled ring, focus outlines on dark plates, `::selection`, swatches, lit treads, slider fills, crop marks, the finale's italic phrase, the scroll bar's offset.
- Shaders never read CSS: they get the ramp from `theme.ramp` and the drum through `setInk()` / `subscribeInk()`. Keep the two in step by only ever changing ink through `setInk()`.
- For alpha use `color-mix(in srgb, var(--midnight) 30%, transparent)`. Never `rgba()` or hex in components.
- Section papers come from the chart: `{...groundProps(section.ground)}` sets `data-ground` and `data-dark` where appropriate; `base.css` paints it. Optional ascent gradients and facade glows may extend their own ground; do not paint a light ending midnight or force every hero onto periwinkle.
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

- Monument hero name only: `min(21vw, 420px, calc((100vw - 2 * var(--edge)) / (var(--len) * var(--display-advance) * 1.04)))`, line-height .74, letter-spacing −.015em. Other families use their specified title proportions and a smaller brand masthead; never reuse this giant wordmark automatically.
- Processional h2: up to `clamp(56px, 8.4vw, 168px)`; editorial: `clamp(36px, 5vw, 90px)`; compact: `clamp(28px, 3vw, 52px)`. Fit each to its actual column with `--len` and `--display-advance`; no overflow or hand-hyphenation.
- Manifesto statement: `clamp(38px, 5.9vw, 112px)`, line-height 1.02, letter-spacing −.02em, max-width 15.5em, in the **display face but not uppercased** (sentence case where the face has lowercase).
- Facade finale title only: `clamp(52px, 9.4vw, 190px)`, line-height .9, centred. Colophon/split endings use a modest left-aligned statement, not this title.
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
| `lib/types.ts` | `Theme`, `Ink`, `ChartSection`, `SectionType`, `Ground`, `Layout`, `Composition` |
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

### Optional scene: the temple (monument hero only)

`new TempleScene(canvas, { lite, columns: theme.temple.columns, mirror: theme.temple.mirror, onContextLost })` builds a procedural Doric peristyle: fluted columns with entasis on an instanced mesh, a three-step crepidoma, a grand stair, a dark cella, triglyphs, dentils, pediments, acroteria, rolling hills in fog, 7,000 dust motes (2,600 lite), a lone figure, shadow maps. It renders grey-scale into a target, then a post pass reprints it: luminance onto the ramp, crepuscular streaks from the sky glow, uneven ink laydown, the drum ink out of register on highlights, and a "sheet feeding through the drum" reveal.

- API: `start()`, `stop()`, `resize()`, `setProgress(0..1)` (camera along the processional spline, the sun swings behind the temple, the far end erodes into grain, the figure climbs the stair), `setPointer(x, y)` (clip space, parallax), `setReveal(0..1)`, `setInk(hex)`, `dispose()`.
- `mirror` puts the monument on the left (the roll sets it when the name sits right); the wind, sun, glow and figure mirror with it. On portrait screens the kit lifts the monument with a view offset so the lede and name sit below the stair.
- Lifecycle: create in `useEffect` inside `try` (catch → actual printed fallback), set the active ink, start, then signal `window.__stoaHero = true; dispatchEvent(new Event('stoa:hero'))` after two frames. Pause off screen and while hidden, subscribe to ink, dispose on unmount. Show fallback on context loss; clear it on `webglcontextrestored` so the restored scene is visible again.

### Signature feature 3: the second drum

`setInk(hex)` re-inks every mounted image plane, optional temple/dust, CSS `--ink-hi` and `.riso` type. Place a labelled four-ink radiogroup in the selected hero’s masthead/caption/foot. A press, when selected, can apply its local drum to the whole site. Components use `useInk()`.

**Two-drum type:** `<span className="riso" data-text="Word">Word</span>` prints the drum ink behind the key ink at `--mis-x`/`--mis-y` (default `.045em, −.03em`). Tween those variables to misregister; `SiteFx` drifts every `main h2 .riso` into register as it arrives. For a hover slip, set new values on hover; the kit transitions `::before`'s transform.

### Optional scene: the dust inscription (facade ending only)

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

- **Preloader** (`<Preloader images top foot onDone />`): two drums print the house mark, without a counter. It waits on fonts, the selected hero’s `stoa:hero` first-paint signal and opening images, capped at 9s. It must not require TempleScene on non-monument pages. Reduced motion and development `?skip` bypass it.
- **Ink level** (`<InkLevel />`): the only scrollbar. The native one is hidden. Drag or click it; chapter ticks sit where each nav section begins, labelled on hover. Side from `layout.chrome.level`. App toggles `html.mid-dark` while a dark plate crosses mid-screen (the nav's measure loop does it).
- **Cursor** (`<Cursor />`, fine pointers only): a dot, a drum-ink ghost and a lagging ring; `[data-cursor="Label"]` grows it into a labelled drum-ink disc; links get a dashed ring; `[data-dark]` flips its inks. It re-reads what is under it on scroll, so a resting pointer never keeps a stale label.
- **Grain** (stepped drum shimmer, multiply), **RegMarks** (registration targets in the margins), **TempleMark** (the house mark; its drum layer slips on hover), **Dither** (the section hand-over), **SiteFx** (`ready`, `away`: magnetic `.btn`, the tab title changes to `away` while hidden, and section titles drift into register).

### Scroll and reveal

- Scrub only where the selected composition calls for it: processional monument, processional portico, optional capitals/stair/facade, and plate doors. Do not pin editorial spreads or compact indexes.
- Other entrances fire once near `top 80–88%`; reduced motion shows all content immediately. Animation is not a substitute for a different spatial layout.

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

- Implement **`composition.navigation`**, not the same fixed header every time:
  - **`chapters`:** a fixed 72px `1fr auto 1fr` header: small mark/name, chapter links, brief status/optional clock. Hide on downward scroll past 60vh and return upward, never while focused.
  - **`masthead`:** a static publication head with a wide name/date row and a second ruled row of useful chapter links. It scrolls away with the opening. Do not shrink the same fixed header and call it a masthead.
  - **`rail`:** a narrow sticky vertical chapter index on the side opposite the InkLevel, with the brand in an independent top corner. Reserve a real layout gutter so it does not overlap content; on narrower desktops, use a compact textual rail rather than rotate illegible labels.
- Read active chapter and `html.mid-dark` from measured section bounds. Fixed/rail ink follows the ground under its actual position, not hardcoded y=36 for every mode. All variants use chart links and kit `scrollTo`, with `aria-current` for the active chapter. Status and action copy must suit the subject; do not invent commissions for a music journal.

**Phones (≤900px):**

- Links, clock and status hide; a "Menu" button (`aria-expanded`, `aria-controls="site-menu"`, ≥44px) with two drum-shadowed bars that cross into a ×.
- The phone menu is a full-screen key-ink dialog, inert/aria-hidden while closed; Lenis stops while open. Escape closes, Tab wraps, focus enters the first link and returns to the opener. Close when the viewport grows past 900px, and close before following a chapter link. Use a compact ruled index for masthead navigation, a numbered vertical list for rail, and display chapter links for chapters; retain the same accessibility behavior without duplicating one visual menu on all builds.

### Forms & contact

No backend is implied. Choose the ending’s action from the actual brief: listen/read, visit an authorized destination, download an existing asset, or contact a supplied real address. Do not invent a working inbox or use a mailto form as a default publication feature. In a facade, optional name-carving updates the dust and an aria-live line; a mailto submit opens a draft and must say so, never claim delivery. Social links, copied addresses and resources must be real. Missing destinations should be omitted or transparently identified as demonstration content, not hidden behind fake success.

---

## Layout sections and macro families

`chart.ts` owns section order, grounds, navigation and micro variants. `composition` owns the page silhouette. Hero is first and finale last; 2–5 eligible middle sections may appear. Author only selected components; a `Partial<Record<SectionType, ComponentType<SectionProps>>>` with an explicit error for an unmapped selected type is sufficient. Every section receives `{ section, ready }`, uses `groundProps`, an accessible heading, and the chart’s closing Dither.

### Hero — `composition.hero`

These are different DOM/layout structures, not CSS skins on the old hero. `layout.hero.side` controls the leading text side within a family; it is not the family itself.

| Family | Desktop composition | Phone interpretation |
|---|---|---|
| `monument` | Procedural TempleScene dominates a full-height stage; large bottom-edge name; text opposite monument. Only with processional rhythm: 360vh section (300vh phone), sticky 100lvh stage, scrubbed camera and eroding letters. Otherwise a static 100lvh stage with entrance reveal only. | Portrait temple lifted above a compact lede and fitted name; never cover primary text with the building. |
| `diptych` | Two unequal adjoining panels, approximately 40/60. One has a 6–9vw multiline proposition and useful action; the other a portrait subject photograph through RisoImage. Name is a small masthead, not a giant bottom overlay. No temple. | A captioned portrait first, then the proposition/action; retain an offset folio in the side gutter rather than recreating the monument hero. |
| `broadside` | A typographic opening like a printed poster: 12–17vw multiline subject headline, one narrow panoramic image strip, small publication name, generous unoccupied paper. No centered building or full-screen background image. | The headline wraps into 3–5 natural lines above a short panoramic strip and direct action; no forced full viewport or empty scrolling. |
| `aperture` | One large arch/pill RisoImage window centered on bare paper, taking roughly 55% of the viewport width; a small title bridges a window edge and captions sit outside it. The subject is real content, not a temple placed inside a new frame. | Keep the window silhouette and outside caption; use a short inset title, not a bottom-edge brand wordmark. |
| `index` | A publication masthead and ruled content index fill the first screen. One lead image takes about one third, with a large lead story/record title and 3–5 useful text links beside it. No theatrical scroll threshold. | Lead story and compact image first, then a visible numbered index. Readers can reach real content without scrolling past an animation. |

Every family has one h1, a first-screen explanation of the actual subject, a reachable primary action and four site ink swatches (in the masthead, caption or opening foot as appropriate). No hero is a contact form or decorative mock player.

**Readiness contract:** after the selected hero’s fonts and opening media are ready (or the real fallback is shown), wait two animation frames, set `window.__stoaHero = true`, then dispatch `new Event('stoa:hero')`. For `monument`, do this after the scene first draws; for image/type families, do it after image load/error and `document.fonts.ready`. This signal must not wait for `ready`, because the Preloader waits for the hero. Never instantiate an invisible temple merely to release the loader.

### Collection — `type: colonnade`, `composition.collection`

Use actual records, articles, exhibitions or projects. `layout.colonnade.count` is a target, not permission to invent entries; if fewer verified entries exist, render those honestly and record that content limit. `shape` applies to featured images. `stagger` applies only to multi-column/portico arrangements, never offsets catalog row baselines.

- **`portico`:** equal-width image-led columns with small abacus/numeral accents and titles below. Processional rhythm may use a desktop horizontal pinned track: `distance = Math.max(0, track.scrollWidth - innerWidth)`, `x = -distance`, `end = +=distance`, scrub, refresh on resize. Under editorial/compact rhythm use an unpinned grid, not a horizontal scroll trap. Phones stack columns; reduced-motion desktops use a grid.
- **`editorial`:** unpinned, alternating wide spreads. Image and text occupy about 60/40 on one spread and 35/65 on the next; a lead paragraph and caption create reading rhythm. No equal-column card grid, abacus row, ghost title or horizontal track. Phones preserve image-caption-text ordering, with alternating caption alignment.
- **`catalog`:** a compact ruled list with aligned number / title+kind / year / action columns. Only the lead or selected item has a modest adjacent RisoImage preview; do not turn every row into a tall image card. On phones title and action share a row, metadata falls beneath, and the preview remains small. All actions are real links/buttons, not hover-only controls.

### Other eligible middle sections

- **Manifesto** (`type: manifesto`, not in navigation): an actual editorial position. Use inline RisoImage pills up to `layout.manifesto.pills`, an optional full-width Plate and folio only when their flags are true. In compact rhythm use a brief statement, not an obligatory wall of 7–9 phrases. If animating text, SplitText words/characters only; reduced motion remains readable.
- **Orders** (`type: orders`): three genuine capability/content layers using the kit’s Doric, Ionic and Corinthian capitals, drawn with `pathLength` and fixed stagger amount. Shafts use token-based fluting; `rise` controls level versus stepped proportions; `marquee` controls the optional band. Do not manufacture a consultant’s skills for an unrelated publication. Phone columns stack.
- **Press** (`type: press`, dark): include only when a visual print tool supports the subject. Respect `layout.press.frame` in the desktop frame/controls grid. RisoImage `onPlate` exposes actual `uGrain`, `uMisreg`, `uDensity` and `uInk`; `lockInk` separates the local drum from `setInk` until “Ink the whole site.” Four grayscale source thumbnails, sliders (grain 1–6px, register 0–16px, density .6–2.2), ink buttons and working `gallery.capture(handle)` are required. Capture only when the entire sheet is visible and opened; the kit captures the viewport intersection as JPEG. Download a correctly named JPEG, or disclose an explicit PNG conversion. Keep up to six downloadable prints on a drying line; clear and status are accessible. Phone controls stack. This is not an audio tool, ticket checkout or product configurator.
- **Ascent** (`type: ascent`): only a supported chronology or stepwise process. Use an ordered staircase with `layout.ascent.steps` as a target, actual dates/steps, legible tread text and token-colored risers. Processional rhythm may scrub riser growth and a walker; compact rhythm uses a shallow stepped index. Phones use a vertical ruled list. No fabricated founding years, audience counts or achievements.

### Ending — `type: finale`, `composition.ending`

- **`facade`:** the architectural ending on midnight. Pediment, dentils, dust architrave, optional name-carving field and contact bays. Use DustInscription only here, `layout.finale.greeting` for its resting word, and the optional Plate only if its flag is true. The dust assembles by scroll, with an accessible text fallback; reduced motion skips the assembly scrub. A real contact address is needed for a mailto action. A giant centered closing title belongs to this family only.
- **`colophon`:** a light-paper, publication-like ending. A small closing statement sits beside a source/credit list, useful links and the actual primary next action. No pediment, dust canvas, carving form, stars, stepped bays or oversized two-line CTA. Keep the ending short enough to read as a final printed folio.
- **`split`:** an open two-column closing spread on light paper: one captioned subject image and a left-aligned invitation/action on the other side, respecting `layout.hero.side`. On phones use an image-caption/action pairing. No facade, stars or giant centered name. `layout.finale.plate` controls the additional full-bleed plate, not the core split image.

Only instantiate the scene components a selected family actually uses. Temple and dust parameters can exist unused in the roll; unused flags are not visual variation.

### Footer and global layers

Footer is outside `<main>` with `aria-label="Site"`. With a facade ending it may be a three-stepped stylobate on midnight; after colophon/split it is a low light-paper colophon rule, not a duplicate temple base. Include font/source credits, seed and no-tracking statement. The top button says “Back to top” or the subject-appropriate equivalent; dispatch `stoa:gust` only if dust exists.

Global order: skip link, Preloader, Nav, main, Footer, RegMarks, InkLevel, Grain, Cursor, SiteFx. The kit controls material and access; the author controls the accepted composition.

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
const COMPONENTS: Partial<Record<SectionType, ComponentType<SectionProps>>> = { /* only the selected, implemented sections */ };

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
    <main id="main" tabIndex={-1}>{sections.map((s) => { const S = COMPONENTS[s.type]; if (!S) throw new Error(`Unimplemented section: ${s.type}`); return <S key={s.id} section={s} ready={ready} />; })}</main>
    <Footer />
    <RegMarks /><InkLevel /><Grain /><Cursor /><SiteFx ready={ready} away="◐ The second drum is drying… — Name" />
  </>);
}
```

**Component conventions:**

- Copy lives in `content.ts`. Authored sections import `composition` and `layout` from the chart and honor the selected modes. Start from a new layout sketch, not an earlier project’s components or CSS. Generated micro flags matter only where the selected macro family uses them.
- Write all GSAP in `useGSAP(() => { … }, { scope: root, dependencies: […] })`; branch desktop/phone with `gsap.matchMedia()` using the same queries as the CSS. Revert SplitText in the returned cleanup.
- Long-lived WebGL objects (the temple, the dust) live in `useEffect` with an empty or stable dependency list, guarded by `try`, paused off screen by an IntersectionObserver, and disposed on unmount.
- Fit every big display line to its box with `--len` and `--display-advance`; rolled faces differ in width by 30%.
- Breakpoint: 900px is the phone breakpoint everywhere (nav, colonnade pin, grids, reg marks and ink level hide).

**Construction method:**

1. Inventory real content and primary action. Select eligible sections and identify the latest available baseline; remember its chart if not already in history.
2. Scaffold a new project and copy the kit byte for byte.
3. Run `node <skill>/roll.mjs --sections <eligible-types> --out <new-project>`; use `--against` when comparing a supplied prior chart. Read the chart and explain the new visual thesis, five macro choices and changed active axes before authoring.
4. Choose subject-relevant, licensed/CORS-enabled images, not the previous build’s image set or generic temples for every domain. Verify each URL. Prefer local assets for reproducibility. `gamma: 1.8–2` helps high-key pictures.
5. Write content, selected section components and fresh authored styles. Branch on composition, not just color/side. Use the hero-ready contract even without a temple; instantiate optional scenes only when selected.
6. Install dependencies, then `npm run build`; require a type-safe static `dist/`.
7. Run the actual site at 1440×900 and 390×844; exercise the subject’s primary action, navigation/menu, ink switching, selected scene/press behavior and footer. Check no horizontal overflow, reduced motion, contrast and live desktop/phone resize. Non-selected scenes need no fabricated demos.
8. Run the mandatory visual difference gate against available prior screenshots. Keep first-screen and representative section evidence, and record the implemented differences in README; do not declare novelty from a seed alone.
9. For mounted WebGL scenes, exercise context loss/restore when feasible; verify real fallback media and recovery.

**Integrity & privacy:** pin majors as above, never `@latest`. No analytics, trackers, cookies or third-party scripts. Fonts are self-hosted. Photographs are the only external requests; credit their source in the colophon.

**Performance:** import optional TempleScene/DustInscription only when the chosen families need them. About 1.1 MB minified JS is a ceiling for a full monument/facade build, not a target for a quiet editorial page. Keep kit DPR caps and pause scenes off screen. Preserve the shared image press, ink system and accessibility; do not add a hidden temple or dust field just to claim the same feature checklist.

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

**Varied by the roll:**

- Five macro axes in `composition`, checked against saved structural history.
- Only eligible middle sections, their order and alternating grounds.
- Paper hue (258°–300°), drum inks, three fonts and micro layout settings.
- Temple settings and greeting values are available for the families that use them; they do not force those scenes into other families.

**Authored anew for every build:**

- Subject-specific visual thesis, actual useful content, imagery and focal object, headline hierarchy, primary interaction and component/CSS composition.
- Domain language rather than the previous site’s persona or obligatory architectural headings.
- A truthful visual difference record. Do not reuse prior source/media and rename it; a fresh seed cannot certify reused markup.

**Frozen identity and engineering:**

- The shared risograph image treatment, blue-violet stock, pastel second drum and three-font roles.
- Kit shaders/primitives copied unchanged; stochastic dither, grain and accessible chrome.
- React + TypeScript + Vite, OGL, GSAP and Lenis; Three.js only if TempleScene is used. Static output, self-hosted fonts, no tracking.
- Reduced-motion, contrast, keyboard, focus, mobile overflow and context-loss baselines.
- History retained across fresh builds; explicit seed reuse only for repair. Never relax the gate, clear history or count cosmetic changes to pass.

**Changed in this edition:** replaced a fixed temple-page recipe with five hero families, three collection/ending/navigation structures and three rhythms; added persistent structural admission, legacy build enrollment, content eligibility and visual comparison. The temple, print lab, dust facade, giant closing title and stepped footer are no longer universal requirements.
