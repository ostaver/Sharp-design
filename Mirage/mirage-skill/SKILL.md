---
title: design-mirage-optical
description: "A strictly achromatic op-art design language for perception studios, experimental portfolios, and exhibition sites. Pure white paper and near-black ink, one variable font animated on its width and weight axes, a cursor-reactive moiré hero, and live canvas optical illusions with a press-and-hold reveal. Single self-contained HTML file, animated with anime.js v4."
---

# Mirage

You are designing in the Mirage language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce achromatic, kinetic, exhibition-grade pages. The output should feel unmistakably from the same language but never identical to a prior run.

## Core conviction

Mirage runs on paper white and ink black. **This is absolute — there is no dark mode, no theme toggle, no third hue.** The aesthetic lives at the intersection of op-art and clinical instrumentation — precise, wry, unsentimental. Every detail is deliberate: dashes tilted off a tangent, mortar lines that lean a grid, a wordmark that breathes on its width axis. "Seeing is not believing — the page proves it on you."

The content *is* the illusion. A Mirage page does not illustrate perception with pictures of perception; it runs working perceptual mechanics live, in front of the reader, and then confesses how they work. If a section can be replaced by a screenshot without losing anything, it does not belong in this language.

Two things you must never do:

- **Do not reproduce the exact copy.** The brand name, tagline, work titles, manifesto lines, and section headers in any reference are specific to that page. Invent your own that match the voice.
- **Do not reproduce the exact layout.** A reference may run loader → hero → manifesto → works → method → contact → footer. You may reorder sections, add or remove from the approved roster, or vary the section count. Never repeat a section type within one page.

---

## Voice

The tone is clinical, curt, and quietly amused. It borrows from optometry charts, museum wall labels, and psychophysics papers. The writer speaks like a lab technician who finds the reader's visual system slightly funny: no wonder, no adjectives about wonder, no "experience the magic."

**Rules:**

- One proposition, stated flat. The claim is strange enough without help.
- No marketing superlatives ("award-winning", "cutting-edge", "immersive"). The work is running on screen; it does not need selling.
- Paragraphs are two to three sentences. Captions are one.
- Section transitions are stated, not shouted — a number, a rule, a date.
- Address the reader's eye directly and in the second person: "Fixate on the cross." "Hold it — the trick confesses." "If you can read this, the trick worked."
- Attribute every effect like a citation: `Fraser — 1908`, `Café Wall — Bristol, 1973`, `Kitaoka — 2003`. Real names and real years. Never invent an attribution.
- Names, brands, and titles should feel optical and slightly clinical (e.g., "Parallax Works", "Aftereffect", "Blind Spot Bureau", "Apparent Motion Co.").
- Approved vocabulary blends optics and instrumentation: fixate, retina, acuity, luminance, tangent, mortar, aftereffect, calibrate, parallax, threshold, interference, seam.
- Small typographic tics carry the voice: `Nº 07`, `Demonstration Nº 00`, `02 / 04`, `20/200`, a `®` after the brand.

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** full `100svh` (`min-height:560px`), content grid-centered, the wordmark set enormous and light — `clamp(4.2rem, 16.5vw, 16rem)` at weight ~120 and width 62% before it animates open. The moiré field is absolutely positioned at `inset:-28%` behind it, veiled by a white radial halo so the type stays readable.
- **Separators:** hairlines only. `1px solid var(--ink-14)` for quiet rules, `1px`/`2px solid var(--ink)` for structural frames. Eyebrow rows draw their own rule with an `::after` that scales in from the left on reveal.
- **Spacing:** one horizontal token, `--pad: clamp(20px,4vw,64px)`, applied as `padding-inline` on every section. Vertical rhythm is `clamp(96px,15vh,168px)`. Never use fixed pixel gutters.
- **Backgrounds:** always `--paper`. Sections do not alternate surfaces. Depth comes from borders, hairlines, and the canvases — never from tinted panels, never from gradients used as decoration. The only gradients permitted are the moiré ring fields and the hero halo, both of which are mechanisms, not decor.
- **Headers:** every section opens with an eyebrow — a small uppercase label on the left, a `nn / NN` index pushed right with `margin-left:auto`, and a hairline growing between them.
- **Content:** alternates between text-forward (manifesto, method) and mechanism-forward (works grid, chart, demos). Never two mechanism sections back to back.
- **Data display:** numbers are typographic events, not widgets. Prefer the eye-chart form — rows that descend in size from `clamp(3.6rem,10vw,8.6rem)` to `clamp(.78rem,1.4vw,1.05rem)`, each flanked by a left-side acuity ratio and a right-side plain-language label.

**Refuse:**

- Color used as decoration. Red and cyan exist only as chromatic-aberration fringes on hover, never as fills, borders, or accents.
- Cards, drop shadows, rounded corners, pill badges, gradient overlays, glassmorphism.
- Photography and stock imagery of any kind. Everything visual is CSS, SVG, or canvas.
- Dark mode, theme toggles, and any second palette.
- Serif and monospace type. Any second font family at all.
- Marketing CTAs ("Get Started", "Book a Demo") and social proof strips.

---

## Color

Mirage is a **single-theme system: achromatic, light only**. There is no theme toggle. Say so on the page if you like — a footer line such as "No dark mode — darkness is an illusion too" is in voice.

**Commitment level: eye chart under clinic light.** One paper surface, one ink, and a ladder of ink opacities doing all the tonal work. Contrast is maximal at the top of the hierarchy and thins deliberately downward; nothing on the page is mid-grey by accident.

**CSS custom properties — define these on `:root` (there is no second theme block):**

```css
:root {
  /* Surfaces */
  --paper:   #ffffff;
  --ink:     #0a0a0a;
  /* Ink ladder — the entire tonal system */
  --ink-70:  rgba(10,10,10,.70);   /* secondary prose */
  --ink-55:  rgba(10,10,10,.55);   /* meta, captions, indices */
  --ink-35:  rgba(10,10,10,.35);   /* hints, chart foot */
  --ink-14:  rgba(10,10,10,.14);   /* hairlines */
  --ink-08:  rgba(10,10,10,.08);   /* nav border, progress rail */
  /* Aberration — hover fringes only, never fills */
  --red:     #ff2e2e;
  --cyan:    #00c8c8;
  /* Structure */
  --font:    'Archivo','Helvetica Neue',Arial,sans-serif;
  --pad:     clamp(20px,4vw,64px);
  --ease-out: cubic-bezier(.19,1,.22,1);
}
```

Use CSS variables for all colors in the stylesheet. Canvas drawing code is the one exception — 2D canvas takes literal strings, so `#ffffff`, `#0a0a0a`, and the illusion greys (`#f0f0f0`, `#d8d8d8`, `#c9c9c9`, `#4c4c4c`, `#101010`) may be written inline there. Keep those canvas greys achromatic; a canvas grey with a hue in it is a defect.

**Rules:**

- **Accent range:** there is no accent. The only chroma permitted anywhere is `--red` / `--cyan`, and only as a paired `text-shadow` offset on hover — `text-shadow:-2px 0 var(--red), 2px 0 var(--cyan)`. Scale the offset to the type size: `2px` on nav and inline links, `3px` on the contact link, `.035em` on the footer wordmark. Never apply it to a background, border, fill, or icon. Never use one of the pair without the other — the illusion is a split, not a highlight.
- The ink ladder carries hierarchy: `--ink` for headlines and structural strokes, `--ink-70` for supporting prose, `--ink-55` for meta and captions, `--ink-35` for hints, `--ink-14` and `--ink-08` for rules.
- `::selection` inverts: `background:var(--ink); color:var(--paper)`.
- The mobile menu overlay is the one inverted surface — `background:var(--ink); color:var(--paper)`, with `rgba(255,255,255,.14)` dividers.
- Text sitting over the moiré needs a white halo, not a box: stack `text-shadow:0 0 14px #fff, 0 0 14px #fff, 0 0 4px #fff, 0 0 4px #fff`.
- All `color` / `text-shadow` transitions are `.22s–.3s ease`. Structural reveals use `var(--ease-out)`.
- Respect `prefers-contrast: more` — drive `--ink` to `#000`, drop `--ink-35`/`--ink-14` toward `--ink-55`, and thicken focus outlines to `3px`.
- **Vary the ink between projects** within the achromatic constraint: `#0a0a0a`, `#000000`, `#0d0d0f`, `#111111`. Vary the aberration pair too (`#ff2e2e/#00c8c8`, `#ff0055/#00b3ff`, `#e6002e/#00d2c2`) — but keep it red-vs-cyan opposition, never a warm/warm or cool/cool pair.

---

## Typography

This is a **one-font system**. Mirage uses a single variable sans and gets its entire range from the axes, not from families. There is no serif for voice and no mono for structure — introducing either breaks the language.

**The font:** `Archivo` (Google Fonts variable, axes `wdth 62..125`, `wght 100..900`, italic available). Used for absolutely everything: wordmark, headlines, labels, prose, meta, buttons, footer.

Load it as one variable request:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
```

**Scale (display):**

- Hero wordmark: `clamp(4.2rem,16.5vw,16rem)`, `line-height:.82`, `letter-spacing:-.025em`, starts at weight 120 / width 62%
- Footer wordmark: `clamp(3.4rem,18.4vw,19rem)`, weight 900, `font-stretch:125%`, `line-height:.78`, `letter-spacing:-.035em`
- Contact link: `clamp(2.2rem,8.6vw,7.6rem)`, weight 850, `font-stretch:122%`
- Manifesto lines: `clamp(2.1rem,5.4vw,4.8rem)`, weight 640, `font-stretch:108%`, `line-height:1.06`, uppercase, `max-width:20ch`
- Section h2: `clamp(1.9rem,4.2vw,3.6rem)`, weight 760, `font-stretch:116%`, uppercase, `max-width:16ch`
- Method numerals: `clamp(6rem,11vw,10.5rem)`, weight 900, `font-stretch:120%`, `color:transparent`, `-webkit-text-stroke:2px var(--ink)`

**Text rhythm:**

| Element | Size | Weight | Stretch | Spacing | Case |
|---|---|---|---|---|---|
| Body prose | `1rem`–`1.1rem` | 460 | 100% | — | — |
| `.label` (eyebrow, nav, meta) | `.72rem` | 560 | 100% | `.18em` | upper |
| Caption / hint | `.62rem`–`.8rem` | 460–600 | 100% | `.14em`–`.22em` | upper |
| Work title | `clamp(1.05rem,1.6vw,1.3rem)` | 780 | 115% | `.01em` | upper |
| Italic pull-quote | `clamp(.95rem,1.5vw,1.2rem)` | 430 italic | 100% | 0 | — |

**Rules:**

- Never introduce a second font family. Not for code, not for numerals, not for a logo.
- Reach for `font-stretch` before you reach for size. Width is this language's emphasis axis: 62% is a whisper, 108–116% is a statement, 120–125% is a shout.
- Weight and width move together on display type — a heavy face is also a wide one. A weight-900 numeral at 62% width is a defect.
- Body copy sits at weight 460, not 400. It is the only place the axes hold still.
- Tabular figures on anything numeric: `font-variant-numeric: tabular-nums`.
- Headline letter-spacing is tight and negative (`-.02em` to `-.035em`); label letter-spacing is loose and positive (`.14em` to `.22em`). There is no middle ground.
- Measure caps: `max-width:20ch` on display lines, `44ch`–`46ch` on prose, `52ch` on captions.
- **Vary the font between projects** from the approved variable-width list: `Archivo`, `Roboto Flex`, `Anybody`, `Saira`, `Encode Sans`, `Asap`. The font must expose a real `wdth` axis — a weight-only variable font cannot carry this language. Adjust the axis ranges in the CSS and JS to whatever the chosen family actually supports.

---

## Motion

Motion in Mirage is **constant, mechanical, and load-bearing**. It is not garnish: the animation *is* the illusion, so a still screenshot of a Mirage page is an incomplete page. Nothing eases in and then sits — the wordmark keeps breathing, the moiré keeps drifting, the chart keeps focusing.

**Library:** anime.js v4, loaded from jsDelivr as a UMD global, before your own script:

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4/dist/bundles/anime.umd.min.js"></script>
```

Destructure once: `var animate = anime.animate, createTimeline = anime.createTimeline, stagger = anime.stagger;` and guard `anime.spring` with a fallback (`anime.spring({bounce:.38})` or `'out(3)'`). If `window.anime` is missing, flip `<html>` back from `.js` to `.no-js` and return — the page must render complete and static.

The central technique is the **object-property tween**: animate a plain JS state object, and redraw a canvas in `onUpdate`. Never animate canvas pixels directly.

```js
animate(P, { tilt: 0, duration: 900, ease: 'inOut(3)',
             onUpdate: redraw, onComplete: redraw });
```

### Signature feature 1: the moiré hero

Two stacked full-bleed layers of `repeating-radial-gradient` rings at *slightly* different periods interfere into a live moiré.

- Layer A: fixed center, ring period `9px`, `1.3px` stroke at `rgba(10,10,10,.9)`.
- Layer B: center driven by `--mx`/`--my` custom properties, ring period `9.6px`, `mix-blend-mode:multiply`.
- Both at `position:absolute; inset:-28%; pointer-events:none; will-change:transform` so scaling never reveals an edge.
- A `.hero-halo` radial gradient of pure `--paper` sits above them, opaque to ~46% and transparent by ~82%, keeping the center readable.

**Behavior:** on `pointer:fine`, track the cursor as a percentage of the hero box into `tmx`/`tmy`, and lerp `mx`/`my` toward it at `0.06` per frame. After 2600ms without movement, hand the target to a slow idle drift built from two out-of-phase sines. On scroll, scale layer A by `1 + p*0.22` and layer B by `1 + p*0.34` where `p` is hero-scroll progress — the beat frequency shifts as you descend.

**Guardrails:** the period difference must stay small (a 5–8% delta). Equal periods give a flat field; a large delta gives visible stripes, not interference. Drive everything from one master `requestAnimationFrame` loop.

### Signature feature 2: hold to reveal

Every illusion carries its own explanation. Press and hold, and the piece tweens into its "truth state" — the mechanism removed, the effect gone. Release, and the lie returns. This is the language's single most identifying interaction and it is **mandatory** on every canvas work.

- The holder is `role="button" tabindex="0" aria-pressed="false"` with a full `aria-label` describing both the illusion and the interaction.
- Wire `pointerdown` (guard `e.button !== 0` for mouse, `setPointerCapture`, `preventDefault`) → truth on; `pointerup` / `pointercancel` / `lostpointercapture` / `blur` → truth off.
- Keyboard parity: `Space` / `Enter` on `keydown` (skip `e.repeat`) → on, `keyup` → off.
- Suppress `contextmenu` so long-press on touch doesn't open a menu.
- Store base values on the state object before the first tween so release always returns exactly home.
- Toggling adds `.is-truth` on the card, which also slides a two-line caption strip: the lie scrolls up, the confession scrolls in (`overflow:hidden` on a `1.7rem` window, `transform:translateY(-1.7rem)` on the inner stack).
- Under `prefers-reduced-motion`, set the truth values instantly and redraw — no tween, but the interaction still works.

### Signature feature 3: kinetic variable-axis type

Font axes are animated as numbers, then written back as `fontVariationSettings`.

- Split the hero wordmark into per-character spans. Hold a state object per character (`{w, g, prox}`) and apply `'"wdth" ' + w + ', "wght" ' + g`.
- **Intro:** characters rise `translateY 115% → 0%` over 1150ms `outExpo` with `stagger(85, {from:'center'})`, while `w` runs 62 → ~108 and `g` runs 120 → ~760.
- **Idle:** on completion, each character loops `alternate` between its base and `w:118 / g:base+30` over `3200 + i*130` ms with `inOutSine` — deliberately desynchronised so the wordmark never pulses in unison.
- **Proximity:** in the master rAF, measure cursor distance to each character's box; within ~210px add up to `+320` weight, lerped at `0.14`. Clamp the sum to the font's real axis range.
- **Hover on display lines:** spring `wdth` 108 → 122 and `wght` 640 → 860 with a small `translateY(-4px)`. Only after the line has revealed, and only on `pointer:fine`.

### Scroll & reveal

- **Trigger:** `IntersectionObserver` at `threshold:.16`, `rootMargin:'0px 0px -8% 0px'`, unobserving on first hit.
- **Behavior:** `opacity 0 → 1`, `translateY 34 → 0`, 850ms, `ease:'out(3)'`.
- **Stagger:** per-element `data-delay` in milliseconds read off the attribute (120 / 140 / 180 are typical).
- **Line masks:** display headlines and captions use a two-element mask — an `overflow:hidden` block wrapping an inline-block inner that starts at `translateY(112%)` and animates to `0%` over 1050ms `outExpo`, staggered `i * 120`. Set the hidden start state under `html.js` in CSS so nothing flashes.
- **Wipe reveals:** canvas frames reveal with `clip-path: inset(0 100% 0 0)` opening to `inset(0)`.

### Scroll-pinned horizontal track

For the method/process section: a `position:sticky; top:0; height:100vh` pin containing a horizontal flex track. Measure `pTrack.scrollWidth - pPin.clientWidth`, set the section's height to `pinHeight + max * 1.05`, map scroll progress to `0..1`, lerp toward it at `0.085`, and write `translate3d(-p*max, 0, 0)`. A 2px progress rail scales `scaleX(p)`. Add per-panel parallax by translating the stroked numerals `(p - 0.5) * 60 * ±1`.

Below 900px and under reduced motion, **disable the pin entirely**: clear the inline height, stack the panels vertically, drop the transform.

### Loader

A conic-gradient disc (`repeating-conic-gradient(var(--ink) 0deg 12deg, var(--paper) 12deg 24deg)`) rotating `1turn` on linear loop, beside a zero-padded counter tweening 000 → 100 over ~1300ms. Gate dismissal on `Promise.all([Promise.race([document.fonts.ready, wait(1700)]), wait(1500)])` — never on fonts alone. Dismiss by sliding the loader `translateY 0 → -100%` (950ms `inOutExpo`), firing the hero intro `onBegin`, and removing the node `onComplete`.

**Motion rules:**

- Approved eases: `outExpo` and `out(3)` for entrances, `inOut(3)` / `inOutExpo` for state changes and truth tweens, `inOutSine` for looping ambients, `linear` for the loader disc only.
- Springs are permitted in exactly two places: the display-line hover and the contact-link letter scatter. Nowhere else — bounce reads as playful, and this language is not.
- Everything that can move, moves. A section with no live element in it is under-designed for this language.
- All continuous work goes through **one** `requestAnimationFrame` loop. Never run parallel rAF loops for moiré, scroll, pin, and proximity.
- **Respect `prefers-reduced-motion: reduce` globally:** no intro, no idle loops, no moiré drift or scroll scaling, no pin, no scatter, no proximity. Reveals resolve instantly to their end state, truth toggles snap, the loader is removed rather than animated. The page must be fully usable and fully legible.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible { outline:2px solid var(--ink); outline-offset:3px }`. Never `outline:none` without a replacement.
- A `.skip` link is the first element in `<body>`, parked at `top:-60px` and springing to `top:12px` on `:focus`.
- Canvas illusions are keyboard-operable buttons (see hold-to-reveal). Every canvas element itself is `aria-hidden="true"`; the meaning lives on the labelled holder.
- The mobile overlay closes on `Escape`, moves focus to its close button on open and back to the trigger on close, locks `body` scroll, and toggles `aria-hidden`.

### Navigation

**Desktop:**

- Fixed, `height:64px`, `z-index:60`, `padding-inline:var(--pad)`, `background:rgba(255,255,255,.85)` with `backdrop-filter:blur(12px)` and a `1px solid var(--ink-08)` bottom border. It drops in from `translateY(-102%)` after the loader.
- Left: the brand at weight 820 / `font-stretch:110%`. Center-right: three to five `.label` links. Far right: an issue line in `--ink-55` — `Nº 07 — The Perception Issue`.
- Hover on any link fires the chromatic split. There is **no CTA button** in the nav.
- `html { scroll-padding-top:88px }` so anchors clear the bar.
- **Vary nav link labels between projects.** e.g. `Manifesto / Works / Method / Contact`, or `Thesis / Specimens / Apparatus / Enquiries`, or `Notes / Effects / Protocol / Studio`.

**Mobile (below 900px):**

- Nav links and the issue line hide; a `Menu` button appears.
- The overlay is full-screen, inverted (`--ink` ground, `--paper` type), links at `clamp(2.6rem,10vw,5rem)` weight 800 / `font-stretch:122%`, each divided by a `rgba(255,255,255,.14)` rule except the last. Links stagger in at 70ms.

### Forms & contact

Mirage does not use contact forms. Contact is a single `mailto:` anchor set at display scale, split into per-character spans. On `pointerenter` (fine pointers only) the characters scatter — random `translateX ±22`, `translateY ±16`, `rotate ±10` on a spring with `stagger(24,{from:'center'})` — and spring back to zero on leave. The chromatic split runs on the same element.

---

## Layout sections (approved roster)

Use 5–7 of these in any order. Never repeat the same type twice. The page should feel curated, not exhaustive.

- **Loader** — conic disc, counter, one wry calibration line. Always first when present.
- **Hero** — moiré field, halo, kicker line, a hairline rule that scales open, the kinetic wordmark, and a three-part subline (left label / italic proposition / right label) that collapses to a centered column below 900px. Plus a scroll cue with a 1px line pulsing on `scaleY`.
- **Manifesto** — three to four line-masked display lines, one of which carries an italic lower-weight `<em>`; a `44ch` note beneath; and one *passive* perceptual demonstration framed in `1px solid var(--ink-14)` with a corner tag and a bottom caption. Passive means it requires no interaction — Troxler fading, an afterimage square, a Hermann grid.
- **Works** — a `1fr 1fr` grid (single column below 900px) of two to four live canvas illusions. Each article: a top row (`nn`, title, right-aligned medium tag), a `4/3` canvas framed in `1px solid var(--ink)` with a `Hold` hint top-right, and a foot row pairing the two-line swap caption with a right-aligned attribution.
- **Chart** — the eye-chart stat block: a bordered panel, a head row with two `--ink-55` labels, five descending rows of `1fr auto 1fr` (acuity ratio, giant figure, plain-language label), and a centered foot line. Optionally blur-focus the rows on scroll.
- **Method** — the pinned horizontal track: an intro panel plus three to five numbered panels, each `border-top:2px solid var(--ink)` with a stroked outline numeral, an uppercase title, and a `40ch` step paragraph.
- **Contact** — a short display question, the scattering `mailto:` link, and a `46ch` fine-print line about what you actually reply to.
- **Footer** — the wordmark set at maximum width and weight, centered, `user-select:none`, chromatic split on hover; then a hairline bar of `.label` items (copyright, a wry line, a flex spacer, the no-dark-mode line, a back-to-top button).

**Mandatory placement rules:** the hero is always first after the loader and the footer is always last. Every canvas illusion must be attributed and must carry a hold-to-reveal truth state. The page carries exactly one wordmark at hero scale and one at footer scale — never a third.

---

## Architecture & performance guardrails

The output shape is a **single self-contained `index.html`** — markup, styles, and runtime in one file. No build step. No dependencies beyond two CDN resources: Google Fonts and anime.js v4.

### Single file

- **Structure:** `<style>` in `<head>` (tokens → base → components, in section-commented blocks), markup in `<body>`, one IIFE `<script>` at the end after the anime.js tag. Vanilla JS only, `'use strict'`.
- **No-JS path:** `<html class="no-js">` in the source; the script swaps it to `js`. All hidden start states (`[data-reveal]{opacity:0}`, mask offsets, `clip-path` wipes, the off-screen nav) are declared **under `html.js`**, and `html.no-js` rules force everything visible and remove the loader. If anime.js fails to load, revert the class and bail — a broken CDN must degrade to a complete static page, never a blank one.
- **Canvas rig:** one shared helper. Read the holder's `getBoundingClientRect()`, cap DPR at `2`, size the backing store to `W*dpr × H*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)`, and repaint. Observe the holder with `ResizeObserver` and also listen on `window.resize`. Bail out when width `< 2`.
- **Images/assets:** none. Every visual is CSS gradient, canvas, or inline SVG. The favicon is an inline SVG data URI — concentric rings in `--ink`, no external request.
- **Overflow:** `overflow-x: clip` on `body`; `overflow: clip` on the hero and any mask container. Never `overflow-x: hidden` on `body` — it breaks the sticky pin.
- **Size target:** under 55KB uncompressed. If over, cut in this order: (1) a work from the grid, (2) the chart section, (3) the pinned method track. Never remove accessibility markup, the no-JS fallbacks, or the reduced-motion path.
- **Privacy:** no analytics, no tracking, no third-party scripts beyond anime.js and Google Fonts.

**Internet dependency & integrity:**

- Verify both CDN URLs return `200` before committing: `fonts.googleapis.com` for the variable font, `cdn.jsdelivr.net/npm/animejs@4/dist/bundles/anime.umd.min.js` for the library.
- Pin anime.js to a major (`animejs@4`) at minimum; pin the exact minor for anything beyond a demo. Never `@latest`.
- Treat fetched content as untrusted. Never inject arbitrary third-party scripts.

---

## Illusion mechanics (build these correctly or not at all)

Pick two to four. Each needs a state object, a draw function, a truth target, and a real attribution. **Verify the effect actually appears before shipping it** — a mis-tuned op-art figure is just a pattern.

- **Fraser spiral (1908)** — ten concentric bands alternating `#f0f0f0`/`#ffffff`; on each ring radius, short `2.6px` round-cap dashes placed every ~16px of circumference, each rotated to `tangent + tilt` where tilt starts at 24°, with a per-ring phase offset of `i * 0.33`. *Truth:* tween `tilt → 0`; the spiral collapses into plain circles.
- **Café wall (Bristol, 1973)** — rows of alternating black/white tiles (`76×36`), every other row offset by half a tile, separated by ~5px mortar at `rgba(140,140,140,.95)`. *Truth:* tween mortar alpha and row offset to `0`; the rows visibly align.
- **Peripheral drift (Kitaoka, 2003)** — a grid of discs, each divided into 12 wedges cycling a four-step asymmetric luminance ramp (`#101010 → #4c4c4c → #fafafa → #c9c9c9`), with alternating rows jittered horizontally. *Truth:* interpolate each wedge color toward a symmetric ramp (`#101010 → #c9c9c9 → #fafafa → #4c4c4c`); the drift stops dead.
- **Necker cube (1832)** — two offset squares joined at the corners, `3px` miter-joined strokes, no depth cues. *Truth:* fade in shaded top and left faces (`#d8d8d8`, `#ececec`) plus a white front face at `globalAlpha = truth`; one interpretation locks.
- **Troxler fading (1804)** — eight blurred grey discs (`#c2c2c2`, `blur(5px)`) on a rotation ring around a hairline fixation cross. Passive; no truth state, only a caption instructing the reader to fixate.
- **Hermann grid**, **Ebbinghaus circles**, **Zöllner lines**, and **Müller-Lyer** are all in range if you prefer a different set.

---

## HTML head & meta tags

Every page must include:

- `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- `<title>` — format: `BRAND® — Short Proposition`. Never just the brand name.
- `<meta name="description">` — one to two flat sentences, 120–155 characters, in voice.
- `<meta name="theme-color" content="#ffffff">` — matching `--paper`.
- `<meta name="color-scheme" content="light">` — this language is light only.
- `og:title`, `og:description`, `og:type`.
- Favicon: an inline SVG data URI, concentric rings or another optical primitive stroked in the ink value. No external request.

---

## Print stylesheet

Include a `@media print` block that:

- Hides: nav, mobile menu, loader, moiré layers, hero halo, scroll cue, hold hints, and the progress rail.
- Releases the hero from `100svh` (`height:auto; min-height:0`) and the pinned section from its measured height.
- Sets sections to `break-inside: avoid`.
- Removes all animations and transitions.
- Forces text to black on white and strips every `mix-blend-mode`.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**

- Semantic landmarks — `<nav aria-label="Primary">`, `<main>`, `<footer>`, with a skip link first in `<body>`.
- Every section linked to its heading via `aria-labelledby`.
- Strict heading hierarchy (h1 → h2 → h3, no skips). The hero wordmark is the h1 and carries an `aria-label` because its text is split into per-character spans.

**Interactive elements:**

- Buttons have an explicit `type`.
- `aria-label` on every non-text control (menu open/close, back-to-top, canvas holders, the mail link).
- `:focus-visible` outline on every interactive element.
- Touch targets ≥ 44×44px.

**State management:**

- `aria-pressed` toggled on each illusion holder as the truth state flips.
- `aria-expanded` / `aria-hidden` accurately toggled on the mobile overlay.
- Decorative elements — canvases, moiré layers, halo, dot fields, fixation cross, footer wordmark — carry `aria-hidden="true"`, with the meaning supplied by a labelled parent or a visible caption.
- Passive demos get `role="img"` with an `aria-label` that describes both the figure and the effect, since the effect itself is not perceivable to every reader.

**Media queries:**

- `prefers-reduced-motion: reduce` fully implemented, including a working non-animated hold-to-reveal.
- `prefers-contrast: more` fully implemented.
- `pointer: fine` gates cursor-driven behavior — moiré tracking, proximity weight, hover springs, letter scatter. Touch users get the idle/static path, never a dead interface.

---

## LLM directives: vary vs. freeze

**Vary between generation runs:**

- The variable font family (from the approved `wdth`-axis list) and its axis ranges.
- The exact ink value and the aberration pair.
- Brand name, tagline, manifesto lines, and all copywriting.
- Section order, selection, and count (5–7).
- Which illusions appear, how many (2–4), and in what order.
- Work titles, attributions, chart figures, and method steps.
- Nav link labels and the issue line.
- The passive demonstration in the manifesto.

**Never vary:**

- The achromatic commitment — paper white, ink black, no dark mode, no accent, no third hue.
- The one-font rule.
- Chromatic aberration as a paired red/cyan `text-shadow` on hover, and nothing else.
- Hold-to-reveal on every canvas illusion, with keyboard parity.
- The moiré hero built from two interfering ring fields under a white halo.
- Real attributions for real effects.
- Single self-contained HTML file, anime.js v4 + Google Fonts as the only external resources.
- The accessibility, no-JS, and reduced-motion baselines.
