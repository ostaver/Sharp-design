---
title: design-stackable-loud-atelier
description: Brutalist-luxury design language for creative studio sites. Electric accent against warm paper, asymmetric grids, single high-motion hero moment with pinned scrub exit, and zero-image construction via CSS geometry and SVG noise. Built on Astro with GSAP and Lenis.
---

# Stackable — Loud Atelier

You are designing in the Stackable language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce brutalist-luxury, editorial-grade studio pages. The output should feel unmistakably from the same language but never identical to a prior run.

## Core conviction

Stackable runs a high-contrast, warm-paper baseline with a single electric accent. This is absolute — the page is either light-warm or ink-dark, never both in the same section. The aesthetic lives at the intersection of brutalist precision and atelier craft — raw but curated, industrial but human. Every detail is deliberate: a rotated accent panel with frame markers, a strike line cutting the composition, noise textures that make the screen feel physical. "Made under pressure."

Two things you must never do:

- **Do not reproduce the exact copy.** The brand name, tagline, project names, descriptions, and section headers in any reference are specific to that page. Invent your own that match the voice.
- **Do not reproduce the exact layout.** A reference may run hero → manifesto → work → contact → footer. You may reorder sections, add or remove from the approved roster, or vary the section count. Never repeat a section type within one page.

---

## Voice

The tone is declarative, slightly abrasive, and warm underneath. It borrows from industrial studio culture and editorial design writing. The writer speaks like a creative director who has no patience for fluff: short sentences, no feel-good padding.

**Rules:**

- Every sentence must earn its place. Cut adverbs, cut "we believe," cut "passionate about."
- Never use marketing language or superlatives. "World-class," "cutting-edge," "innovative" are banned.
- Paragraphs are never longer than three sentences. Prefer two.
- Section transitions should feel like turning the page of a monograph — deliberate, numbered, archival.
- Names, brands, and titles should feel forged, not focus-grouped (e.g., "Hollow Forms," "Field Notes," "Common Ground").
- Approved vocabulary blends industrial process and atelier craft: frame, pressure, forge, pulse, chaos, order, signal, grain, shift, push against, messy middle.

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** Full viewport height (`100svh`), ink-black background. Contains an oversized, rotated accent panel placed off-grid (negative `right`, slight rotation), a vertical strike line, frame markers, a numbered index. The headline is split into words and stagger-animated with a back-ease overshoot. A flash overlay wipes in then out on load. The section pins for 125% of its height while content scrubs through — the headline shifts right and up, the panel retreats, everything below fades.
- **Separators:** Sections are divided by full-bleed background changes (ink → paper → ink → accent). No visible borders or rules between sections except the hero top-line and project-list borders.
- **Spacing:** All padding values are clamp-based fluid expressions. Horizontal padding is consistent across all major sections (`clamp(1.25rem, 7vw, 9rem)` for content sections, tighter for header/footer). Vertical padding varies by section to create breathing rhythm.
- **Backgrounds:** Sections alternate between two surfaces — warm paper (light) and ink (near-black). One section uses the accent color as full background. Never put the accent on a white/paper section background.
- **Headers:** Section headers sit in asymmetric two-column grids. The label/kicker column is always narrower (1fr to 2–3.3fr). The heading drifts rightward — `justify-self: end` with max-width constraint. Headings always break across multiple lines. All headings carry a number prefix (01 /, 02 /, 03 /) in the label.
- **Content:** Rhythm alternates between text-forward sections (manifesto, contact) and data-forward sections (work grid). Text-forward sections have a narrow kicker column and wide copy column. Data-forward sections display items in equal-width columns with vertical borders as dividers.
- **Data display:** Work/projects shown as a CSS grid of equal columns separated by thin vertical borders. Each item has a geometric art area built from pseudo-elements, a noise texture overlay, a large serif number, and metadata (kind, name, description).

**Refuse:**

- Cards with backgrounds, borders, or box-shadows. Items sit in a borderless grid; only column dividers exist.
- Pill badges, tag chips, or any rounded-container labels.
- Gradient overlays, drop shadows, or any `box-shadow`.
- Rounded corners on any structural element.
- Visible native scrollbars — they must be hidden. The scroll indicator is the only scroll affordance.
- Stock images, Unsplash URLs, or any raster photography. All visuals are CSS geometry and SVG noise.

### Hero composition guardrails

**Critical placement rules for the hero:**

- The **strike line** must stay clear of all text. Place it at `left: clamp(0.5rem, 2vw, 3rem)` — hugging the left edge. Never use `left: var(--px)` which lands inside the content padding zone and collides with body text. The strike line is a margin accent, not a content element.
- The **accent panel** must not crowd the headline. Keep panel width at `clamp(14rem, 28vw, 28rem)` max. The headline should have `max-width: 60%` so text wraps before reaching the panel. The panel is placed `right: -2%` with `rotate(-6deg)`.
- The **hero-inner** wrapper needs `padding-block: clamp(4rem, 10vw, 8rem) 0` so content sits comfortably below the nav bar and has breathing room.
- On mobile (760px breakpoint), reduce panel size and set `opacity: 0.6` so it doesn't overwhelm the reduced text area.

### Manifesto layout patterns

You must choose **one** of these manifesto layouts per build. Never mix them.

**Pattern A: Split columns (default)**
A balanced two-column layout. Kicker spans the full width at top, then a 1fr 1fr grid below — heading on the left, body text on the right. A full-width CSS geometric placeholder image area sits below both columns. This is the most reliable pattern.

```
[02 / Position]                          ← kicker, full width
[Heading here      ] [Body paragraph... ] ← 1fr 1fr columns
[                                        ← full-width geometric placeholder (16:5 aspect)
  CSS grid + accent circle + diagonal
]
```

CSS rules: `.manifesto-columns { grid-template-columns: 1fr 1fr; gap: clamp(2rem, 5vw, 5rem); }`. The heading is `.manifesto-left`, the body is `.manifesto-right`. The placeholder is `.manifesto-image { width: 100%; aspect-ratio: 16/5; }`.

**Pattern B: Stacked editorial**
Kicker + heading together on the left (narrow column, 1fr), body text on the right (wide column, 2fr). No image placeholder. More compact. Use when the section needs to feel denser.

```
[02 / Position          ] [Body here...    ] ← 1fr 2fr, no image
[Heading here           ]
```

CSS: `.manifesto-grid { grid-template-columns: 1fr 2fr; gap: 3rem; }`. Label and heading stack in column 1. Body in column 2.

**Critical rules:**
- Do NOT use `justify-self: end` on the manifesto body column — it pushes text to the far right edge and looks broken.
- Column 2 should NOT exceed `max-width: 38ch`.
- The grid ratio must never exceed 1:2.4. Avoid 1:3.3 which crowds the content column into a sliver.
- If using Pattern A, the image placeholder is mandatory — never omit it.

### Section header layouts

Section headers (for work/index sections) must use **one** of these patterns:

**Pattern A: Stacked (recommended)**
Label on its own line above the heading. The heading aligns right via `margin-inline-start: auto`. Simplest, most reliable.

```css
.section-header { padding-inline: var(--px); padding-block-end: ...; }
.section-header .label { display: block; margin-block-end: ...; }
.section-header h2 { font-size: ...; max-width: 18ch; margin-inline-start: auto; text-align: right; }
```

**Pattern B: Side-by-side tight**
Label in a narrow left column, heading in a wider right column. Use a gentle grid: `grid-template-columns: 1fr 2fr; gap: 2rem;`. The heading sits at `justify-self: end; text-align: right;`. Label aligns to `start`.

**Never use:**
- A grid with no gap (label and heading crash into each other).
- `align-items: end` with the label — it sinks the label below the heading baseline.
- Grid ratios wider than 1:2.4.

---

## Color

Stackable is a three-surface, single-accent system. There is no theme toggle — the page is fixed. Sections alternate between light (warm paper) and dark (ink) backgrounds, with one section using the full accent as its background.

**Commitment level: midnight studio with a single signal light.** The accent is vivid, electric, and used sparingly — one large geometric panel in the hero, inline emphasis on key words, one full-section background near the page bottom, and pseudo-element art in project cards. Everything else is near-black or warm off-white.

### Accent color families

You must pick your accent from **one** of these families. Each family produces a radically different page personality. Rotate between families across builds. Never use the same family twice in a row.

| Family | Hue range | Personality | Example hex |
|---|---|---|---|
| **Crimson** | `hsl(350-360, 75-95%, 40-52%)` | Aggressive, hot, urgent | `#B81D33` |
| **Ember** | `hsl(15-30, 80-95%, 42-55%)` | Warm, forged, industrial | `#D4451A` |
| **Violet** | `hsl(250-265, 80-98%, 40-55%)` | Electric, sharp, synthetic | `#4A14E8` |
| **Cobalt** | `hsl(220-235, 75-95%, 42-55%)` | Deep, authoritative, signal | `#1A56DB` |
| **Verdant** | `hsl(140-160, 60-85%, 30-42%)` | Grounded, organic, strange | `#1A7A3A` |
| **Amber** | `hsl(38-48, 90-100%, 40-55%)` | Golden, archival, warm | `#C8880A` |

**Rules:**
- Pick exactly one family per build. The accent color is the single most differentiating choice.
- `--accent-dim` is the family hue, 20-30% lower saturation, 15-25% lower lightness.
- `--accent-glow` is the family hue, 5-10% higher saturation, 8-15% higher lightness.
- The accent appears in: the hero rotated panel background, inline `<em>` emphasis in headings, one full-section background (contact/CTA), pseudo-element geometric art in project cards, the scroll indicator (via `mix-blend-mode: difference`), the CSS placeholder image in the manifesto, and the `<meta name="theme-color">`.
- All `color` / `background-color` transitions are `180-260ms ease-out`.
- Nav text on dark hero background uses white. The scroll indicator uses `mix-blend-mode: difference` so it inverts against whatever section it overlays.
- Respect `prefers-contrast: more` — push text toward pure black/white, harden focus outlines.

### CSS custom properties

```css
:root {
  --bg:          /* warm off-white — hsl(38-45, 50-80%, 93-97%) */;
  --bg-dark:     /* near-black — hsl(0-260, 0-5%, 4-8%) */;
  --text:        /* auto-set per section via .section-light/.section-dark */;
  --text-dim:    /* muted gray — hsl(0, 0-3%, 55-68%) */;
  --line:        /* warm gray border on light — hsl(38-45, 10-20%, 80-88%) */;
  --line-dark:   /* subtle border on dark — hsl(250, 5%, 15-20%) */;
  --accent:      /* from chosen family above */;
  --accent-dim:  /* accent darkened ~30% */;
  --accent-glow: /* accent brightened ~15% */;
  --serif:       /* display serif — see approved list */;
  --sans:        /* utility sans — see approved list */;
  --px:          clamp(1.25rem, 7vw, 9rem);
  --px-tight:    clamp(1.25rem, 3vw, 3.5rem);
  --py-section:  clamp(5rem, 9vw, 8rem);
}
```

---

## Typography

This is a two-font system. One display serif for voice and scale. One utility sans for labels, navigation, and body text.

**Display serif:** A high-contrast, editorial serif with optical sizing support. Used for all headings (h1, h2, h3), project numbers, and the large footer mark. Single weight (600) only.

**Utility sans:** A clean, neutral grotesk or geometric sans. Used for body text, navigation, section labels, micro-labels, the wordmark, and footer links. Two weights (400, 500) only.

**Scale (display serif headlines):**

- h1 (hero): `clamp(4rem, 11.4vw, 11.25rem)`, weight 600, letter-spacing -0.075em, line-height 0.82
- h2 (manifesto): `clamp(2.8rem, 7vw, 6.5rem)`, weight 600, letter-spacing -0.075em, line-height 0.85
- h2 (work/data section): `clamp(2.6rem, 6.5vw, 6.5rem)`, weight 600, letter-spacing -0.075em, line-height 0.84
- h3 (project name): `clamp(1.8rem, 3vw, 3.15rem)`, weight 600, letter-spacing -0.075em, line-height 0.92
- Project number: `clamp(3rem, 6vw, 6rem)`, weight 600, letter-spacing -0.1em, line-height 0.7

**Utility sans rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| Body text | `clamp(0.86rem, 1.2vw, 1.08rem)` | 400 | -0.025em | — |
| Section label / kicker | 0.72rem | 400 | 0.02em | uppercase |
| Nav links | 0.75rem | 400 | — | — |
| Hero top line | 0.61rem | 400 | 0.08em | uppercase |
| Wordmark | 1.125rem | 500 | -0.06em | — |
| Footer mark | `clamp(2rem, 4vw, 4rem)` | 500 | -0.06em | — |
| Email link | `clamp(1.05rem, 1.8vw, 1.5rem)` | 500 | -0.05em | — |
| Micro labels (panel) | 0.54–0.65rem | 500 | 0.04–0.08em | uppercase |

**Approved font pairs — pick one per build, rotate across builds:**

| Serif | Sans | Character |
|---|---|---|
| Fraunces | DM Sans | Crafted, warm, optical |
| Playfair Display | Geist | Classic editorial, sharp |
| Cormorant Garamond | Inter | Literary, airy, refined |
| Lora | Plus Jakarta Sans | Accessible, clean, modern |
| Source Serif 4 | General Sans | Neutral, workhorse, sturdy |
| PP Editorial Neue (if available) | Satoshi | Fashion, high-contrast, severe |

**Rules:**

- Never introduce a font outside the two-font system.
- Load only the weights actually used — never more than 3 weight variants total. Use `display=swap`.
- Headline letter-spacing is tight and negative (-0.075em default, up to -0.1em for numbers).
- Headline line-height is architectural and tight (0.82–0.92).
- Uppercase micro-labels use wide tracking (0.08em).
- Italic emphasis in headings is achieved with `font-style: normal` and the accent color — never actual italics.
- The serif wordmark gets a tiny superscript mark (`®`, `™`, or a geometric dot) via a `<span>` at 0.44em.
- Body text max-width is constrained per context (21–36ch depending on placement).

---

## Motion

Motion in Stackable is restrained except for one high-energy moment. The hero delivers a cinematic entrance and scrub-driven exit. Everything below the hero uses gentle fade-up reveals. Motion communicates confidence and craft — nothing bounces idly.

### Signature feature: Hero entrance + pinned scrub exit

The hero loads with a flash overlay, then a rotated accent panel slides in from the right while a strike line scales up. The headline words stagger in with a satisfying overshoot. Secondary elements fade up last.

After the entrance, the hero pins for 125% of its height while the user scrolls. During the scrub: the panel retreats rightward and rotates further, the headline shrinks and drifts right/up, all secondary elements fade out, and the strike line stretches and rotates.

**Guardrails:**

- Load GSAP, ScrollTrigger, and SplitText from jsDelivr CDN (`gsap@3.13.0`). Load Lenis from unpkg (`lenis@1.3.4`).
- If any library fails to load, set the hero class to `is-motion-ready` with no animation and continue.
- Wait for `document.fonts.ready` before running SplitText.
- Wrap all GSAP code in a `reduceMotion` check — skip entirely if `prefers-reduced-motion: reduce`.
- Connect Lenis to GSAP's ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000))` with `gsap.ticker.lagSmoothing(0)`.
- Lenis config: `lerp: 0.09`, `smoothWheel: true`, `wheelMultiplier: 0.9`.

### Scroll & reveal (below hero)

- **Trigger:** `IntersectionObserver` with `threshold: 0.16`.
- **Behavior:** `opacity: 0, transform: translateY(28px)` → `opacity: 1, transform: translateY(0)`, duration 600ms, `ease-out`.
- **Stagger:** No staggered delays — all items in a section reveal together. Only the hero uses staggered animation.
- No scroll-triggered animations below the hero. The pinned scrub is the only ScrollTrigger instance.

### Smooth scroll

Lenis provides smooth scrolling everywhere. Connect it to the GSAP ticker. Do not initialize Lenis if `prefers-reduced-motion: reduce` is active.

### Hover micro-interactions

- Project card art area: `transform: scale(0.965)` on hover, 260ms `cubic-bezier(.2,.8,.2,1)`.
- Text links: arrow/diacritic mark shifts diagonally on hover (`translate(0.18rem, 0.18rem)`), 180ms `ease-out`.
- Email link: arrow shifts diagonally upward on hover (`translate(0.18rem, -0.18rem)`), 180ms `ease-out`.

**Motion rules:**

- Easing: entrance uses `expo.out`, `power4.out`, `power3.out`, and `back.out(2)` for word stagger. Exit scrub uses `none` (scroll-driven). Hovers use `ease-out` or `cubic-bezier(.2,.8,.2,1)`.
- Never use `ease-in-out` or `ease-in` for any animation. Never use bounce or elastic easings outside the hero word stagger.
- Almost everything must have motion, every detail.
- **Respect `prefers-reduced-motion: reduce` globally:** kill all animations, transitions, Lenis, SplitText, and ScrollTrigger. Show scroll-observed elements immediately. Set all `transition-duration` and `animation-duration` to `0.01ms !important`.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible` outline: `3px solid currentColor` with `outline-offset: 4px`. Never `outline: none` without a replacement.
- All interactive elements are keyboard-accessible. Links use semantic `<a>` tags. Buttons have explicit `type`.

### Navigation

**Desktop:**

- Positioned absolute over the hero, top of viewport, full width. White text on dark hero background.
- Two zones: wordmark (left, serif, 500 weight, negative tracking) and nav (right, 2–3 links max).
- Nav links: sans, 0.75rem, underline on hover only (`text-underline-offset: 0.28em`). No background change. No CTA button in the nav.
- No sticky/fixed header — the nav scrolls away with the hero.
- **Vary nav link labels between projects.** Example sets: ["Work", "Contact"], ["Selected", "Start"], ["Index", "Reach us"], ["Projects", "Hello"].

**Mobile (below 760px):**

- The nav remains in the header bar, same two-link structure. No hamburger menu — the site has few enough links that they fit inline.
- If you must add more links, implement a hamburger with `aria-expanded` toggling, `aria-hidden` on the overlay, focus trapping, scroll locking on `<body>`, and Escape-to-close.

### Forms & contact

- No contact form. The CTA section provides a direct `mailto:` email link.
- The email link is large, sans, 500 weight, with an arrow diacritic that shifts on hover.

---

## Layout sections (approved roster)

Use 3–5 of these in any order. Never repeat the same type twice. The page should feel curated, not exhaustive.

- **Hero** — Full viewport height (`100svh`), ink-black background. Must include: a rotated accent panel (absolute-positioned, off-grid, with frame markers and a numbered index), a vertical strike line (left edge, away from text), a top-line with studio name and tagline, an eyebrow sentence, an oversized split-word headline, a short body paragraph, a text-link anchor, and a vertical scroll note. The panel carries geometric marker pseudo-elements. The headline words stagger in, then the section pins and scrubs out. `mix-blend-mode: difference` on the scroll indicator when over this section. **Strike line must be at `left: clamp(0.5rem, 2vw, 3rem)`, never at `var(--px)`.**

- **Manifesto / Philosophy** — Warm paper background. Must use one of the two manifest patterns (Pattern A: split columns + image placeholder, or Pattern B: stacked editorial). Contains a kicker with number, an h2 with accent-colored `<em>` emphasis words, 1-2 body paragraphs, and if Pattern A, a full-width CSS geometric placeholder image area (aspect-ratio 16:5) built from CSS grid lines, an accent-colored circle or shape, and a diagonal accent line.

- **Work / Index** — Ink-black background. Section header (Pattern A: stacked, or Pattern B: side-by-side), then a CSS grid of equal-width columns separated by vertical borders. Each column is a project card with: a geometric art area (noise texture + CSS gradient composition + large serif number), project kind label, h3 name, and one-sentence description. Project art scales down slightly on hover. **Vary the geometric art composition across the 3 cards** — use different combinations of linear gradients, radial gradients, conic gradients, and repeating patterns.

- **Contact / CTA** — Full accent-color background. Two-column grid: left holds the section label and an oversized h2, right holds a short paragraph and a large email link. The accent background is the climax — it should land with impact.

- **Footer** — Ink-black background. Three-zone grid: large serif wordmark (left), copyright (center), link list (right, horizontal). All white text. No footer navigation beyond 2–3 utility links.

The footer and all dark-background sections must use `--bg-dark` (ink), never a lighter surface. The manifesto/philosophy section must use the warm paper background.

---

## CSS geometric art catalog

For project card art areas and manifesto placeholders, build geometric compositions using only CSS backgrounds. Never repeat the same composition twice in one build. Compose from these primitives:

**Gradient primitives:**
- `linear-gradient(135deg, var(--accent-dim) 0%, transparent 50%)` + `radial-gradient(circle at 30% 70%, var(--accent) 0%, transparent 40%)` + `linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)` with `background-size: 100% 100%, 100% 100%, 100% 4px` — grid lines + accent burst
- `conic-gradient(from 45deg at 60% 40%, var(--accent) 0deg, transparent 90deg, var(--accent-dim) 180deg, transparent 270deg)` + `radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 60%)` — rotated cone + glow
- `repeating-linear-gradient(45deg, transparent, transparent 8px, var(--accent-dim) 8px, var(--accent-dim) 9px)` + `radial-gradient(circle at 50% 50%, var(--accent) 0%, transparent 70%)` — diagonal stripes + center burst
- `linear-gradient(0deg, var(--accent-dim) 0%, transparent 70%)` + `radial-gradient(circle at 20% 80%, var(--accent) 0%, transparent 50%)` — bottom-weighted wash

**Additional primitives for manifesto placeholder:**
- A CSS grid background: `background-image: linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)` with `background-size: clamp(2rem, 5vw, 6rem) clamp(2rem, 5vw, 6rem)`
- An accent-colored circle: `border: 2px solid var(--accent); border-radius: 50%; width: clamp(3rem, 8vw, 8rem);` at `opacity: 0.25`
- A diagonal accent line: `width: 40%; height: 1px; background: var(--accent); transform: rotate(-12deg);` at `opacity: 0.2`

---

## Architecture & performance guardrails

**Canonical stack:** Astro 5, static output. GSAP 3.13, ScrollTrigger, and SplitText loaded from jsDelivr CDN. Lenis 1.3.4 loaded from unpkg. No other dependencies.

**Project manifest:**

```
project/
├── package.json              — verbatim (astro ^5.0.0 only)
├── astro.config.mjs          — verbatim (static output)
├── src/
│   ├── pages/
│   │   └── index.astro       — author per build (assembles components)
│   ├── layouts/
│   │   └── BaseLayout.astro  — prescriptive shell (head, meta, font loading, skip link, reveal JS)
│   ├── components/
│   │   ├── SiteHeader.astro  — author per build (brand name, nav labels)
│   │   ├── Hero.astro        — prescriptive structure + GSAP timeline (brand name, copy, accent panel)
│   │   ├── Manifesto.astro   — author per build (copy, layout pattern choice, image placeholder)
│   │   ├── Work.astro        — author per build (project names, descriptions, art compositions)
│   │   ├── Contact.astro     — author per build (copy, email address)
│   │   ├── Footer.astro      — author per build (brand name, links)
│   │   └── ScrollIndicator.astro — verbatim (fixed progress bar)
│   └── styles/
│       └── global.css        — prescriptive layout system (CSS variables filled per build, layout rules verbatim)
```

**Construction method:**

1. Create the output folder and scaffold via `npm create astro@latest` (select empty project, no TypeScript, no dependencies beyond astro). If scaffolding fails, create manually: `package.json` with astro ^5.0.0, `astro.config.mjs` with static output, and the folder structure above.
2. Write the files listed in the manifest. Prescriptive files carry the exact structure from this skill (layout CSS rules, GSAP timeline, scroll indicator, reveal system). Author-per-build files get new brand names, copy, color choices, font choices, and project data.
3. Resolve font choices: pick one display serif and one utility sans from the approved pairs list. Verify the Google Fonts URL returns 200. Load with `preconnect` and `display=swap`.
4. Run: `npm install && npm run dev`.

**Internet dependency & integrity:**

- Verify every CDN URL is live before committing. Pin GSAP to `3.13.0` and Lenis to `1.3.4` — never use `@latest`.
- Fonts load from `fonts.googleapis.com` with `preconnect` to `fonts.gstatic.com`.
- No analytics, no trackers, no telemetry — ever.
- All JS is loaded with `is:inline` in Astro (no bundling, no tree-shaking needed — these are tiny scripts).

**Size/performance target:** Page weight should be under 150KB uncompressed (CSS + inline JS + HTML). Remove in this order if over: pseudo-element complexity on project cards, noise texture resolution, unused font weights. Never remove accessibility markup, skip link, or semantic structure.

---

## HTML head & meta tags

Every page must include:

- `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- `<title>` — format: `Brand Name — Short proposition`. Never just the brand name.
- `<meta name="description">` — one sentence, 120–155 characters, in the studio voice.
- `<meta name="theme-color">` matching the accent color (as a hex).
- `<meta name="color-scheme">` content `light dark` (the page mixes both).
- OG tags (`og:title`, `og:description`) for basic social preview.
- Favicon: inline SVG data URI in the `<head>`. A simple geometric mark using the accent color — a square with a circle cutout, or a rotated diamond, or the brand initial in the display serif. No external request.

---

## Print stylesheet

Include a `@media print` block in `global.css` that:

- Hides: nav, the scroll indicator, the hero flash/strike/panel/scroll-note, all canvas/texture elements, and any decorative pseudo-elements.
- Sets all sections to `break-inside: avoid`.
- Removes all animations and transitions.
- Forces text to black, background to white on all sections — including the accent section.
- Removes `mix-blend-mode` from all elements.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**

- Semantic HTML5 landmarks (`header`, `nav`, `main`, `section`, `footer`) with correct `aria-label`s.
- Each section linked to its heading via `aria-labelledby`.
- Strict, unbroken heading hierarchy (h1 → h2 → h3, no skips).
- A skip-to-content link that becomes visible on focus.

**Interactive elements:**

- Buttons have an explicit `type`.
- `aria-label` on non-text interactive elements (wordmark, project links, scroll indicator).
- `:focus-visible` outline on every interactive element.
- Touch targets ≥ 44×44px on all links and buttons. Use `min-height: 44px` with `display: inline-flex; align-items: center`.

**State management:**

- All decorative elements (flash overlay, strike line, panel, scroll indicator, top line, scroll note) marked `aria-hidden="true"`.
- If mobile menu exists: `aria-expanded` / `aria-hidden` accurately toggled via JS.

**Media queries:**

- `prefers-reduced-motion: reduce` fully implemented — kills all animations, transitions, Lenis, SplitText, and ScrollTrigger.
- `prefers-contrast: more` fully implemented — pushes text extremes, hardens outlines.
- `pointer: coarse` handling for touch devices — ensure hover states don't stick on tap.

---

## LLM directives: vary vs. freeze

**Vary between generation runs:**

- **Accent color family** (from the 6 families — rotate across builds).
- Font families (from the approved pairs list — rotate).
- Brand name, tagline, and all copywriting.
- Section order, selection, and count (from the approved roster).
- **Manifesto layout pattern** (Pattern A or B).
- **Section header pattern** (Stacked or Side-by-side).
- Project names, metadata, descriptions, and counts.
- Pseudo-element geometric art compositions on project cards — **every card must use a different composition**.
- Nav link labels.
- Email address and studio name.

**Never vary:**

- The core layout constraints (hidden scrollbars, full-bleed section alternation).
- The two-font system rule.
- The `mix-blend-mode: difference` scroll indicator.
- The hero entrance timeline structure and pinned scrub exit.
- The `overflow: clip` on hero, `scrollbar-width: none` on html.
- Single CSS file architecture with CSS custom properties.
- Three surfaces + one accent, no theme toggle.
- Zero raster images — all visuals are CSS geometry and SVG noise.
- The accessibility and performance baselines.
- The single 760px breakpoint.
- **Hero strike line position** — always `left: clamp(0.5rem, 2vw, 3rem)`, never `left: var(--px)`.
- **Touch target sizes** — `min-height: 44px` on all links/buttons.
- **Grid ratio limits** — never exceed 1:2.4 for asymmetric columns.
- **No `justify-self: end` on body text columns** — it breaks readability.
