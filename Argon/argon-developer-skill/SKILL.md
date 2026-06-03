---
title: design-argon-developer
description: A dark, technical design language for artist portfolios, digital studios, and creative technologists. Monospace structure, serif voice, WebGL atmosphere, custom cursor — precision-engineered for high-impact single-page presence.
---

# Argon

You are designing in the Argon language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce dark, technical, gallery-grade pages. The output should feel unmistakably from the same language but never identical to a prior run.

## Core conviction

Argon runs dark. Always. The aesthetic lives at the intersection of gallery opening and terminal window — precision-obsessed, unsentimental, technically ambitious. Every detail is deliberate: a hidden scrollbar that doesn't apologize, a custom cursor that makes you feel the surface, a WebGL backdrop that breathes beneath the text. "Craft over decoration. Signal over noise."

Two things you must never do:

* **Do not reproduce the exact copy.** The brand name, tagline, project names, descriptions, and section headers in any reference are specific to that page. Invent your own that match the voice.
* **Do not reproduce the exact layout.** The reference uses hero → ticker → about → work → expertise → contact → footer. You may reorder sections, add or remove from the approved list, or vary the section count. Never repeat a section type.

---

## Voice

The tone is confident, precise, and slightly industrial. It borrows from exhibition catalogs and technical documentation. The studio writes like a creative technologist: no hand-waving, no marketing fluff, no sentimentality.

**Rules:**

* One clear proposition, stated directly.
* Avoid all marketing superlatives. Let the work speak.
* Paragraphs are short. Two sentences is plenty.
* Section transitions are sharp — the ticker does the bridging.
* Names, brands, and project titles should feel international and slightly abstract (e.g., "OSTAVER", "Chromatic Dissolution", "Liminal Geometries").
* Terms should blend art and technology: architecture, signal, frequency, texture, resonance, composition, synthesis, drift, threshold.

---

## Composition

**Not a recipe, but tendencies:**

* The hero is full-viewport, centered, and declarative. The brand name is large serif, the tagline is monospace uppercase beneath it, both rendered in `mix-blend-mode: difference` so they float over the WebGL background.
* A horizontal marquee ticker separates the hero from the main content — thin borders top and bottom, monospace uppercase keywords, slow infinite scroll.
* Sections are separated by generous vertical space (`--py-section` CSS variable, clamp-based).
* Section backgrounds: each section below the hero has a vertical gradient background (`--bg` → `--bg-surface`), alternating direction on even/odd sections (`:nth-child(even)` reverses the gradient). This creates a subtle atmospheric rhythm tied to the dark palette without a full-page canvas.
* Every section has a numbered header: monospace section number in the accent color + monospace uppercase label in muted. A thin bottom border spans the full width.
* Content alternates between text-forward (about, contact) and data-forward (work list, skill bars).
* No cards. Work is a vertical list — each row is title left, metadata right, with a diagonal arrow (↗) that shifts on hover.
* Stats are displayed in a 2×2 grid with accent left-border.

**Refuse:**

* Cards, pill badges, gradient overlays. These belong to SaaS, not Argon.
* Subtlety for its own sake. If an element exists, it should be felt.
* Sans-serif as the structural typeface. Monospace carries the structure, serif carries the voice. That is the system.
* Forms. Argon uses a direct email link, never a contact form.
* Visible scrollbars. They are hidden globally.

---

## Color

Argon is a single-theme system: dark only. No light mode, no toggle, no `prefers-color-scheme` switching.

**Commitment level: Terminal-at-night.** Deep near-black surfaces, one saturated accent color cutting through. The accent is vivid — this is not Atelier's whisper. It's a signal.

**CSS custom properties — define these on `:root`:**

```css
:root {
  --bg:         #080609;
  --bg-surface: #0d0a0e;
  --text:       #e8e3e6;
  --text-dim:   #b8b0b5;
  --muted:      #5c5258;
  --accent:     hsl(210, 65%, 58%);
  --accent-dim: hsl(210, 42%, 24%);
  --accent-glow: hsl(210, 72%, 46%);
  --font-d:     'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-l:     'Space Mono', 'Courier New', monospace;
  --max-w:      1280px;
  --px:         clamp(1.5rem, 4vw, 4rem);
  --py-section: clamp(4rem, 8vw, 9rem);
  --nav-h:      4.8rem;
}
```

Use CSS variables for all colors. Never hardcode hex in stylesheets.

**Rules:**

* The accent must sit in the cool spectrum: HSL hue 160°–340° (teal through cyan, blue, indigo, violet, magenta). Saturation ≥55%, lightness 50%–65%. Never use the same hue twice across projects — vary aggressively. Examples: `hsl(185,65%,58%)` (teal), `hsl(220,60%,55%)` (blue), `hsl(275,62%,58%)` (indigo), `hsl(320,68%,62%)` (magenta).
* The accent is saturated and present. It appears in: section numbers, skill bars, stat left-borders, hover states, cursor elements, the ticker dot separator, contact link underline, and dynamic WebGL hue injection.
* `--accent-dim` is the accent desaturated and darkened — used for inactive states and subtle depth.
* `--accent-glow` is the accent pushed brighter — used for link hover states.
* `--bg-surface` is slightly lifted from `--bg` — used for the ticker background, hover backgrounds, and depth separation.
* All `color` and `background-color` transitions are `0.3s ease`. Cursor transitions use `0.22s ease` and `0.28s ease`.
* Nav and hero text use `mix-blend-mode: difference` with color `#fff`, not the CSS variable — this ensures they invert over the WebGL canvas.
* Respect `prefers-contrast: more` — push `--text` toward pure white, harden focus outlines.
* **Vary the accent hue between projects** within the approved range. The WebGL shader dynamically sets `--accent`, `--accent-dim`, and `--accent-glow` from the shader's base hue.

---

## Typography

This is a two-font system. One serif for voice, one monospace for everything structural.

**Serif:** `Playfair Display` (Google Fonts, weights 400/600/700, italic available). Used for headlines only — h1, section titles, stat numbers, contact headline. Italic on the about quote. This is the gallery voice.

**Monospace:** `Space Mono` (Google Fonts, weights 400/700). Everything structural: navigation, taglines, labels, metadata, section headers, ticker, footer, buttons, skill labels, contact links. This is the engineering skeleton.

**Scale (serif headlines):**

* h1 (brand): `clamp(3.2rem, 8vw, 7.5rem)`, weight 600, letter-spacing `-0.01em`, line-height `1.04`
* about quote: `clamp(1.35rem, 2.4vw, 1.9rem)`, italic, line-height `1.5`
* work titles: `clamp(1.3rem, 2.2vw, 1.8rem)`, weight 400
* stat numbers: `clamp(2rem, 3.5vw, 3rem)`, weight 600
* contact headline: `clamp(2.5rem, 6vw, 6rem)`, weight 600, line-height `1.08`
* expertise column titles: `1.3rem`, weight 600
* skill column labels: `0.68rem`, monospace (these are labels, not headlines)

**Monospace rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| Hero tagline | `0.85rem` | 400 | `0.14em` | uppercase |
| Nav logo | `1.05rem` | 700 | `0.06em` | uppercase |
| Nav links | `0.78rem` | 400 | `0.07em` | uppercase |
| Section numbers | `0.75rem` | 400 | `0.08em` | — |
| Section labels | `0.7rem` | 400 | `0.12em` | uppercase |
| Ticker items | `0.72rem` | 400 | `0.1em` | uppercase |
| Work tags | `0.68rem` | 400 | `0.07em` | uppercase |
| Work years | `0.7rem` | 400 | `0.05em` | — |
| Stat labels | `0.68rem` | 400 | `0.08em` | uppercase |
| Skill labels | `0.65rem` | 400 | `0.06em` | uppercase |
| Contact subtitle | `0.78rem` | 400 | `0.08em` | uppercase |
| Contact link | `0.85rem` | 400 | `0.1em` | uppercase |
| Footer / copy | `0.65rem` | 400 | `0.06em` | uppercase |
| Footer social | `0.68rem` | 400 | `0.07em` | uppercase |
| Mobile menu close | `0.7rem` | 400 | `0.12em` | uppercase |
| Mobile menu links | `clamp(1.8rem,5vw,2.8rem)` | 600 (serif) | — | — |

All monospace labels use uppercase with letter-spacing between `0.06em` and `0.14em`. Mobile menu links are the exception — they use the serif font at display weight.

**Rules:**

* Never use a third font. Never use sans-serif for anything. The system is strictly serif + monospace.
* Load only the weights actually used by your chosen fonts — never more than 5 weight/italic variants total.
* Headline letter-spacing is tight (`-0.01em`).

---

## Motion

Motion in Argon is ambient, responsive, and technically expressive. The WebGL background is the pulse. The cursor is the interface.

### WebGL background (required)

The hero section contains a full-viewport WebGL canvas rendering an FBM (fractal Brownian motion) domain-warped noise field with dynamic hue shifting. The canvas is **confined to the hero section only** — it is `position: absolute` inside `.hero`, not `position: fixed` covering the entire page. Sections below the hero use CSS gradient backgrounds (`--bg` to `--bg-surface`, alternating direction each section) that feel atmospherically connected to the shader without a full-page canvas. This saves GPU resources and keeps the shader's visual weight concentrated at the top of the page.

**Shader architecture:**

* Vertex shader: pass-through full-screen quad.
* Fragment shader: hash-based value noise → 5-octave FBM → domain warping (two passes) → HSL color output with dynamic hue offset → vignette.
* The shader receives three uniforms: `u_time` (seconds), `u_res` (canvas pixel dimensions), `u_baseH` (base hue in degrees, defaults to 320).
* Time multiplier is implicit (raw seconds). The warp uses small coefficients (`0.03`, `0.04`, `0.025`) so motion is slow and atmospheric.
* Hue variation is ±8% of the base hue, saturation between 0.2–0.75, lightness between 0.03–0.19 — keeping the background deep and moody.
* **CRITICAL — aspect ratio correction:** Multiply `st.x` by `u_res.x / u_res.y` before feeding coordinates into the noise pipeline. The line is `vec2 st = vec2(uv.x * (u_res.x / u_res.y), uv.y) * 2.5;`. Without this, the noise stretches on non-square viewports. This is mandatory — never skip it.

**WebGL guardrails:**

* Request context with `{ alpha: true, antialias: true }`. No `preserveDrawingBuffer`.
* DPR clamping: `Math.min(devicePixelRatio, isTouchOrSmall() ? 1.5 : 2)`.
* Resize handler: update canvas dimensions and `gl.viewport` on window resize.
* Run the render loop continuously via `requestAnimationFrame`. Do not pause on idle.
* If WebGL context fails to initialize: set `canvas.style.display = 'none'` and continue without background. Do not attempt fallback rendering. Do not retry.
* **Context loss handling (required):** Listen for `webglcontextlost` and `webglcontextrestored` events on the canvas. On loss: cancel the render loop via a flag, `event.preventDefault()` to request restoration. On restore: recompile shaders, rebind buffers, reset uniforms, and restart the render loop. Without this, the canvas goes permanently blank after GPU context loss (tab backgrounding, driver crash, power save). Do not skip this — it is the most common production WebGL failure mode.
* Inject computed accent colors into CSS custom properties from the shader's base hue: `--accent`, `--accent-dim`, `--accent-glow`.
* Canvas must have `aria-hidden="true"` and `pointer-events: none`.

### Custom cursor (required on desktop)

A two-element cursor system renders on devices with fine pointers (non-touch, width > 800px).

**Elements:**

* `#cur`: 7px dot, `var(--accent)`, `border-radius: 50%`, fixed position, z-index 9999, `mix-blend-mode: difference`, `pointer-events: none`.
* `#cur-r`: 38px ring, `1.5px solid var(--accent)`, `border-radius: 50%`, fixed position, z-index 9998, same blend mode and pointer behavior.

**Physics:**

* The dot (`#cur`) tracks mouse position directly (instant).
* The ring (`#cur-r`) follows with spring inertia: `rx += (cx - rx) * 0.11` per frame, via `requestAnimationFrame`.

**Hover states:**

* On hover over `a, button, [data-hover]`: dot expands to 14px × 14px, ring scales to 1.6 (`transform: scale(1.6)`), transitions `0.22s ease` and `0.28s ease`.
* On mouse leave: revert to default sizes.

**Visibility rules:**

* When the custom cursor is active: `document.body.style.cursor = 'none'` — this hides the system cursor globally. All hover targets (`a`, `button`, `[data-hover]`, `[tabindex]`) also inherit `cursor: none` from the body cascade. When the cursor is disabled, restore to default (`cursor: auto` on body, `cursor: pointer` on interactive elements).
* Cursor hidden entirely when `pointer: coarse` or `max-width: 800px` or `prefers-reduced-motion: reduce`.
* Body and interactive elements restore `cursor: auto` / `cursor: pointer` on those conditions.
* Re-evaluated on window resize (debounced 250ms) and on `matchMedia` change events for both `pointer: coarse` and `max-width: 800px`.

**Rules:**

* The custom cursor system must set `document.body.style.cursor = 'none'` when active to hide the system cursor. Restore defaults (`cursor: auto` / `cursor: pointer`) when disabled.
* Never skip the spring physics — instant ring tracking feels mechanical.
* Never show the cursor on touch devices.

### Scroll reveal

All below-hero elements marked `[data-observe]` fade in on scroll via `IntersectionObserver`.

**Behavior:**

* Elements start at `opacity: 0; transform: translateY(28px)`.
* When intersecting (threshold: 0.15), transition to `opacity: 1; transform: translateY(0)` over `0.7s cubic-bezier(0.22, 0.61, 0.36, 1)`.
* Staggered by `data-delay` attribute (milliseconds). Typical stagger: 0, 80, 160, 240, 320, 400ms for work items; 0, 100, 180ms for skill columns; 0, 120ms for contact block.
* Work items enter from the left: `translateX(-18px) → 0` instead of vertical.
* Skill bars animate their width from 0% to `data-w`% over `1.1s cubic-bezier(0.22, 0.61, 0.36, 1)` when their parent becomes visible.
* Each element is unobserved after first reveal (one-shot).

### Scroll indicator

A small pill-shaped element at the bottom of the hero with an animated inner dot:

* Container: 28px × 46px, `border: 1.5px solid rgba(255,255,255,0.55)`, `border-radius: 14px`, `mix-blend-mode: difference`.
* Inner dot: 4px × 10px, white, `border-radius: 2px`, animated up-down over 1.8s via `@keyframes scrollPulse` (ease-in-out, opacity 0.7→1→0.7).
* Label: none. The shape alone communicates.
* `aria-hidden="true"`.

### Ticker animation

The marquee ticker scrolls infinitely:

* Track: `display: inline-flex`, animation `tickerScroll` linear infinite (38s desktop, 22s mobile).
* Content: array of keywords doubled (to create seamless loop), separated by accent-colored dot separator (`·`).
* Items: monospace uppercase, `--text-dim` color, `flex-shrink: 0`.
* On `prefers-reduced-motion`: animation stops, track remains visible.

**Rules:**

* Never use `ease-in-out`. The cubic-bezier for reveals is `(0.22, 0.61, 0.36, 1)`. Cursor transitions use `ease`. Ticker uses `linear`.
* Never bounce, never elastic, never spring (except the cursor ring).
* Respect `prefers-reduced-motion` globally: kill all animations, transitions, cursor, and WebGL. Show all scroll-observed elements immediately. Stop the ticker.

---

## Interaction

### Focus management

* `:focus-visible` outline: `2px solid var(--accent)`, `outline-offset: 2px`. Never `outline: none` without a replacement.
* Mobile menu traps focus and closes on Escape. Hamburger button receives focus on close.
* Work items are keyboard accessible: `tabindex="0"`, `role="link"`, `aria-label` describing the project.

### Mobile menu

* Hamburger button: three `<span>` lines, animate to X on open via `transform: rotate(45deg) translateY(7px)` for top, `opacity: 0; transform: scaleX(0)` for middle, `transform: rotate(-45deg) translateY(-7px)` for bottom. Transition: `0.3s ease`.
* Overlay: fixed, full-screen, `background: rgba(8,6,9,0.94)`, `backdrop-filter: blur(12px)`, z-index 210.
* Links: serif, large, centered, white. Active state changes color to `var(--accent)`.
* Close option: "Close" text in monospace uppercase at bottom, or any nav link click.
* Body scroll locked (`overflow: hidden`) when menu open. Restored on close.
* `aria-expanded` on hamburger reflects state. Overlay has `aria-hidden` toggled.

### Contact

* Direct email link only: `mailto:` with monospace uppercase styling, accent color, and a thin bottom border in accent.
* Hover: letter-spacing expands (e.g., `0.1em → 0.18em`), border color shifts to `--accent-glow`. Transition: `0.3s`.
* No form. No validation. No submission states. An email link is the contact mechanism.

### Work item interaction

* Hover: title shifts to `var(--accent)`, arrow shifts to `var(--accent)` and translates `translate(4px, -4px)`.
* Transition: `0.35s ease` on color and transform.
* Touch: on `touchstart`, background becomes `rgba(255,255,255,0.03)`; on `touchend`/`touchcancel`, background clears. Passive listeners.
* Each item is keyboard-focusable with `tabindex="0"` and `role="link"`.

### Smooth scroll

* All `a[href^="#"]` links intercept clicks, prevent default, and scroll to the target section offset by `--nav-h` (the nav bar height).
* Behavior: `smooth`.

**Rules:**

* Touch targets minimum 44×44px. Use padding to reach this.
* All navigation items with `[data-hover]` trigger cursor expansion.
* Scrollbar is hidden via `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`. Exception: on touch devices (`pointer: coarse`), use `scrollbar-width: thin` so users retain a scroll-progress indicator — losing the scrollbar on touch feels broken, not designed. On touch, `::-webkit-scrollbar { width: 4px }` with `--muted` thumb color.

---

## Navigation

**Desktop:**

* Fixed, top of page, full-width, z-index 100, `mix-blend-mode: difference`, `pointer-events: none` on the nav container with `pointer-events: auto` on children.
* Logo: brand name in monospace, weight 700, uppercase, left-aligned, links to `#top`, white (`#fff`).
* Nav links: right-aligned in a flex row, monospace, weight 400, uppercase, white (`#fff`). 3–5 links. Gap: `2.2rem`.
* Hover: opacity reduces to `0.65`. Active: opacity `0.5`. Transition: `0.3s`.
* No scroll-based background change — nav stays transparent across the entire page.

**Mobile (below 800px):**

* Nav links hidden, hamburger displayed.
* Logo remains visible.
* Nav padding reduces to `1.2rem var(--px)`.

**Rules:**

* No CTA button in the nav. Argon is not selling — it's presenting.
* Nav blends over the WebGL canvas via `mix-blend-mode: difference`. This is non-negotiable.
* **Vary nav link names between projects.** The reference uses About / Work / Expertise / Contact. You might use Philosophy / Projects / Capabilities / Connect, or Studio / Selected / Practice / Inquire.

---

## Layout sections (not a template)

Use 3–6 of these in any order. Never repeat the same type twice. The page should feel curated, not exhaustive.

* **Hero** — full-viewport, centered. Brand name in serif, monospace tagline beneath. Both `mix-blend-mode: difference` over the WebGL canvas. Scroll indicator at bottom. No buttons, no CTAs — the presence is enough.
* **Ticker** — mandatory, placed between hero and main. Horizontal marquee with 8–12 monospace uppercase keywords separated by accent dots. Thin accent-tinted borders top and bottom.
* **About / Philosophy** — two-column grid (1.2fr / 0.8fr). Left: italic serif quote (1–3 sentences, with key phrases in accent color). Right: 2×2 stat grid, each stat with a large serif number and monospace label, accent left-border.
* **Work / Projects** — vertical list, 3–8 items. Each row: serif title (left), monospace metadata (right: tag + year + arrow). Thin bottom border between items. Hover shifts title and arrow to accent color.
* **Expertise / Capabilities** — two-column grid. Each column: monospace accent label ("Medium"), serif title, then 3–5 skill rows. Each row: monospace uppercase label + thin track with accent fill bar. Bars animate from 0% to data-width on scroll reveal.
* **Contact / Connect** — centered. Serif headline (possibly split across lines with `<br>`), monospace uppercase subtitle, and an accent-colored monospace email link with bottom border. That's it.
* **Footer** — full-width, `--bg` background, thin top border. Monospace copyright + 2–4 monospace social links (right-aligned). Hover shifts social links to accent. No sitemap, no newsletter.

**Footer rule:** the footer must use `--bg` (not `--bg-surface`). It should feel terminal-solid against the page.

---

## Performance guardrails

This is a single HTML file. No build step, no framework, no dependencies beyond Google Fonts. Keep it that way.

* **Fonts:** Load via `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`. Use the standard Google Fonts stylesheet with `display=swap`. Never block render on web fonts.
* **Images:** No external image requests. All visuals are CSS, SVG inline, or WebGL.
* **JS:** No external scripts. All behavior is self-contained in a single IIFE `<script>` block at the end of `<body>`. Provide basic functionality without JavaScript: ensure the email link works, hero content and navigation are readable. If JS is disabled, hide the canvas, cursor elements, and ticker. Show a `<noscript>` note.
* **WebGL:** DPR capped at 2 (desktop) or 1.5 (touch/small). Context creation with `{ alpha: true, antialias: true }`. Resize handler throttled via the native event (no debounce needed — it only fires when dimensions actually change). Shader uniforms updated per frame.
* **Cursor:** Mouse move listener sets dirty coordinates; animation loop reads them. Ring uses a single `requestAnimationFrame` loop, not per-frame recalculation from the event.
* **Scroll reveals:** `IntersectionObserver` with threshold 0.15. Elements unobserved after first reveal.
* **File size target:** Under 30KB uncompressed (excluding fonts). The WebGL shader adds inherent weight — accept up to 30KB. If over, remove non-essential assets in this order: 1) decorative SVG elements, 2) reduce shader octave count from 5 to 3, 3) remove ticker, 4) simplify section count. Never remove accessibility markup or core layout.
* **Privacy:** No analytics, no tracking, no third-party scripts beyond Google Fonts.

---

## HTML head & meta tags

Every page must include these in `<head>`:

* `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
* `<title>` — format: `Brand Name — Short proposition`. Example: `OSTAVER — Creative Technology Studio`. Never just the brand name.
* `<meta name="description">` — one sentence, 120–155 characters. Describe what the studio does in plain terms, no marketing fluff.
* `<meta name="theme-color" content="#080609">` — matches `--bg`. This colors the browser chrome on mobile.
* `<meta name="color-scheme" content="dark">` — signals to browsers that only dark mode CSS is served, preventing forced light-mode repaints.
* `<meta property="og:title" content="...">` and `<meta property="og:description" content="...">` — same as title and description. Provides basic social preview cards without an image.
* Favicon: inline SVG in `<head>` — a simple 32×32 square in the accent color with the brand initial. Keeps the single-file constraint. No external favicon requests.
* No `og:image` — the page has no hero image to share. The social preview is text-only, which is honest and on-brand.

---

## Print stylesheet

Include a `@media print` block that:

* Hides: nav, canvas, cursor elements, ticker, scroll indicator, mobile menu, social links, hamburger.
* Sets sections to `break-inside: avoid`.
* Removes all animations and transitions.
* Forces text to black, background to white.
* Removes `mix-blend-mode` from all elements.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**
- Landmark roles: `role="navigation"` on nav (with `aria-label="Main navigation"`), `role="main"` on main, `role="contentinfo"` on footer (with `aria-label="Footer"`)
- Sections have `aria-labelledby` pointing to their section label element
- Heading hierarchy is sequential (h1 → h2 → h3, no skips). The brand name in the hero is the only h1. Section labels are not headings — they use `<span>` with IDs.

**Interactive elements:**
- All buttons have `type` attribute
- `aria-label` on hamburger button, scroll indicator, cursor elements
- `:focus-visible` outline on all interactive elements
- Touch targets ≥ 44×44px
- Work items: `tabindex="0"`, `role="link"`, descriptive `aria-label`

**Mobile menu:**
- `aria-expanded` on hamburger reflects state (`true`/`false`)
- `aria-hidden` on overlay reflects state
- Focus trapped inside when open (Escape closes, hamburger receives focus)
- Body scroll locked when open

**Decorative elements:**
- `aria-hidden="true"` on: canvas, cursor dot, cursor ring, scroll indicator, ticker
- No meaningful images — no alt text needed

**Motion and contrast:**
- `prefers-reduced-motion: reduce`: all animations off, transitions off, cursor hidden, ticker static, WebGL canvas hidden, scroll-observed elements visible immediately
- `prefers-contrast: more`: hardened outlines, `--text` pushed toward pure white

**Touch and small screens:**
- `pointer: coarse` or `max-width: 800px`: cursor hidden, default cursors restored on interactive elements, DPR capped at 1.5

---

## What to vary between projects

These are the levers. Pull them differently each time:

* Serif font family (from the approved list: Playfair Display, Cormorant Garamond, EB Garamond, Lora, Libre Baskerville)
* Monospace font family (from the approved list: Space Mono, JetBrains Mono, IBM Plex Mono, Fira Code, Source Code Pro)
* Accent hue: change the shader's `baseH` — cool spectrum only (HSL 160°–340°). Vary aggressively: teal, cyan, blue, indigo, violet, magenta. Never repeat the same hue across projects.
* Brand name and tagline copy
* Number and names of nav links (3–5)
* Number, order, and types of sections (3–6, never repeat a type)
* Ticker keywords (8–12 items, matching the project's domain)
* Work/project names, tags, and years
* Expertise categories and skill labels (two columns, 3–5 skills each)
* About quote text and stat values
* Contact email address and headline copy
* Section count and whether to include/exclude specific section types
* Social link names in footer (2–4)

## What to never vary

* Dark-only. No light mode, no theme toggle, no `prefers-color-scheme` switching.
* The two-font system. One serif, one monospace. No sans-serif.
* Custom cursor on desktop (dot + ring, difference blend, spring physics).
* WebGL FBM shader as the hero background.
* `mix-blend-mode: difference` on nav and hero text.
* Hidden scrollbar.
* Numbered section headers (monospace accents).
* Ticker between hero and main content.
* Vertical work list (not cards).
* Email link contact (no form).
* The precision. Nothing decorative, nothing unnecessary.
* The technical ambition. This is not a safe design.
* The single-file constraint. No frameworks, no build steps.
* The accessibility baseline. Every item in the checklist.
