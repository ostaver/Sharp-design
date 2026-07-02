---
title: design-atelier-minimal
description: "A boutique design language for studio portfolios and craft-driven landing pages. Minimalist, typographic, editorial — with warm restraint, serif voice, and ambient motion."
---

# Atelier

You are designing in the Atelier language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce craft-obsessed, quiet, editorial pages. The output should feel unmistakably from the same studio but never identical to a prior run.

## Core conviction

The most powerful designs are those that disappear. Every element must earn its place. Every interaction should feel inevitable. The studio voice is restraint, typography, and obsessive attention to detail. "We don't decorate; we clarify."

Two things you must never do:

* **Do not reproduce the exact copy.** The tagline, project names, descriptions, and section headers in the reference are specific to that page. Invent your own that match the voice.
* **Do not reproduce the exact layout.** The reference uses hero → philosophy → work grid → contact → footer. You may use any structure that serves the content, including single-page narrative, masonry, split-screen, scroll-telling, or editorial flow.

---

## Voice

The tone is editorial, warm, precise, and slightly literary. It borrows from independent magazines and architecture monographs. The studio writes like it designs: cut everything that doesn't do work.

**Rules:**

* One clear proposition, stated simply.
* Avoid marketing superlatives ("best", "leading", "award-winning"). Earn trust through restraint.
* Paragraphs are short. Three sentences is long.
* Section transitions are soft, not shouted. No "WELCOME TO THE FUTURE OF..." energy.
* The best sentence is the one you almost cut.

---

## Composition

**Not a recipe, but tendencies:**

* The hero is vertical, generous, and breathing. Headline is serif, large (clamp 3.5rem → 7rem+), split across 2-3 short lines. Subhead is sans-serif body copy under 600px wide.
* Sections are separated by generous vertical space (8rem padding minimum).
* Content alternates between tight (philosophy copy, hero body) and expansive (work cards, contact CTAs).
* No sidebars, no two-column body text. Two-column grids are for headline+caption pairings, not reading flow.
* Cards are correct only when the content is card-shaped: discrete projects, case studies, or modular collections. Otherwise flatten into typographic rhythm.

**Refuse:**

* Centered hero text as a reflex. Editorial left-align or off-balance alignments read as more considered.
* Pill-shaped tags, gradient badges, glowing CTAs. Those belong to SaaS, not ateliers.
* Icons as section headers. Use type or a single thin rule.
* Full-width image banners that trade craft for spectacle.

---

## Color

The palette is a conversation between warm paper and quiet ink. It breathes across light and dark.

**Commitment level: Whisper.** Near-neutral surfaces, one accent color doing the work. The accent appears sparingly — a single rule, a card tag, a hover state — and earns its presence.

**CSS custom properties — define these on `:root` and `[data-theme="dark"]`:**

```css
:root {
  --bg:        #ffffff;
  --bg-warm:   #f9f9f8;
  --ink:       #1d1d1b;
  --ink-muted: #6b6b66;
  --border:    #e5e5e2;
  --accent:    #9a7348; /* vary this per project */
}

[data-theme="dark"] {
  --bg:        #0f0f0e;
  --bg-warm:   #161615;
  --ink:       #f5f5f0;
  --ink-muted: #8a8a85;
  --border:    #2a2a28;
  --accent:    #c9a87c;
}
```

Always use these variables throughout — never hardcode hex values in the stylesheet. This makes dark mode and accent variation trivial.

**Rules:**

* The accent hue should sit in the warm-earth range: brass, ochre, clay, terracotta, muted olive, dusty rose. Never blue, purple, or cyan — those belong to other rooms.
* Never saturate the accent further. It is brass, not gold. Terracotta, not orange.
* Dark mode inverts contrast but preserves warmth. The dark accent shifts toward amber-gold.
* All `color` and `background-color` transitions are `0.3s ease`. Theme switches should feel like the page exhales, not snaps.
* Respect `prefers-contrast: more` — push `--ink` toward pure black/white and harden focus outlines.
* **Vary the accent hue between projects** by changing `--accent` on `:root`. Everything downstream updates automatically.

---

## Typography

This is a two-font system. One serif for voice, one sans for everything else.

**Serif:** `Instrument Serif` (Google Fonts, italic available). Used for headlines only — h1, h2, h3. Italic on h2 by taste. This is the studio's handwriting.

**Sans:** `Inter` (Google Fonts, weights 300/400/500). Everything else: body, navigation, labels, buttons, form fields, footer.

**Scale (serif headlines):**

* h1: `clamp(3.5rem, 8vw, 7rem)` — hero headword
* h2: `clamp(2rem, 4vw, 3.5rem)` italic — section anchors
* h3: `1.25rem` or `1.5rem` — card titles, sub-heads

**Sans rhythm:**

* Body: `1.125rem`, line-height `1.7`, max-width `540px` for hero prose, wider for section body
* Nav: `0.875rem`, weight `500`, `letter-spacing: 0.02em`
* Labels/meta: `0.75rem`, `letter-spacing: 0.1em`, uppercase
* Card body: `0.9375rem`, `line-height: 1.6`

**Rules:**

* Headline letter-spacing is `-0.02em` — tight but not crushed.
* Body measure: 60-70 characters for reading prose, contained by max-width not column count.
* Never use more than two weights of Inter on one page. 300 + 500, or 400 alone, or 300 + 400.
* Load only the weights you use. No speculative loading.
* **Vary the serif between projects.** `Instrument Serif` can be swapped for `Playfair Display`, `Cormorant Garamond`, `Lora`, or `EB Garamond`. Keep the editorial character, change the personality.
* **Vary the sans between projects.** `Inter` can become `DM Sans`, `Work Sans`, `Source Sans 3`, or `system-ui`. The sans should feel neutral and invisible.

---

## Motion

Motion in Atelier is slow, deliberate, and ambient. It suggests rather than declares.

**Entrance:**

* Hero headline and subtext fade in with a 1s `cubic-bezier(0.22, 1, 0.36, 1)` ease-out. Stagger by 150ms per element.
* Below-fold sections reveal on scroll via `IntersectionObserver`. Elements translate up 20px, opacity 0 → 1, over 0.8s with the same curve.

**Ambient background:**

Use one of these techniques for the hero background. Pick a different one per project. Simpler options are always acceptable — the atmosphere is the goal, not the technique.

|Option|Technique|Complexity|Notes|
|-|-|-|-|
|A|CSS gradient with subtle keyframe shift|Low|Safest. Always works.|
|B|SVG filter + feTurbulence animation|Low-Medium|No WebGL needed.|
|C|2D Canvas Perlin/simplex noise|Medium|Reliable, self-contained.|
|D|WebGL FBM fragment shader|High|Only use if you can write correct GLSL. See guardrails below.|

**WebGL guardrails (Option D only):**

* Request context with `{ powerPreference: "low-power", antialias: false, alpha: false, preserveDrawingBuffer: false }`.
* Time uniform multiplier: `~0.06`. Mouse influence: subtle, not reactive.
* Pause the render loop via `IntersectionObserver` when the canvas is off-screen.
* If the context fails to initialize, fall back silently to Option A. Always write this fallback.
* Do not attempt reaction-diffusion or domain warping unless you are certain the GLSL is correct. Broken shaders are worse than no shader.

**For all options:**

* The background fades vertically into the next section's `--bg` or `--bg-warm` so it doesn't hard-stop.
* On `prefers-reduced-motion`: use a static gradient. No animation of any kind.
* On `prefers-contrast: more`: also use a static gradient.

**Scroll indicator:**

* A small animated element at the bottom of the hero — something unique per project. Label: "Explore" or "Scroll" in tiny uppercase tracking. This is the only decorative animation beyond the background.

**Hover:**

* Cards lift 2px (`translateY(-2px)`) with a soft shadow. No scale, no glowing borders, no overlays that slide.
* Card image placeholder gets a subtle gradient overlay on hover. Inner SVG scales to 1.05.
* Navigation links shift from `--ink-muted` to `--ink` on hover. `0.3s ease`.

**Rules:**

* Never use `ease-in-out`. Always `cubic-bezier(0.22, 1, 0.36, 1)` — decelerates gently.
* Never bounce, never elastic, never spring. This is not playful.
* Respect `prefers-reduced-motion` globally. Kill all animations, transitions, and background effects. All scroll-observed elements show immediately at full opacity.

---

## Interaction

**Focus management:**

* `:focus-visible` outline: `2px solid var(--accent)`, `outline-offset: 2px`. Never `outline: none` without a replacement.
* Mobile menu traps focus and closes on Escape.

**Form behavior:**

* Contact form simulates submission with a 900ms delay. On submit: disable fields, show "Sending…" in the button (`aria-disabled="true"`), then hide the form and show an inline success state with a checkmark.
* The success message receives programmatic focus (`tabIndex="-1"`, then `.focus()`) for screen readers.
* `role="status"` and `aria-live="polite"` on the success container.

**Theme toggle:**

* Icon swaps between sun and moon. Preference stored in `localStorage` under a consistent key (e.g., `atelier-theme`).
* On first visit with no stored preference, read `prefers-color-scheme`.
* Listen for OS theme changes via `matchMedia` and apply them only when no manual override exists.
* Apply theme via `data-theme` attribute on `<html>`, not a class, so CSS variables cascade cleanly.

**Rules:**

* Touch targets minimum 44×44px. Use padding to reach this if the visual element is smaller — never sacrifice layout for tap target size.
* Form labels are always visible. Placeholders are for format hints only, never substitute for labels.

---

## Navigation

**Desktop:**

* Fixed, transparent at page top. On scroll past 50px, gains `backdrop-filter: blur(12px)`, a `1px` bottom border in `--border`, and a subtle `box-shadow`.
* Logo: studio name in serif (h1 or strong element), left-aligned, links to `#top`.
* Nav links: right-aligned, Inter weight 500, small-caps tracking. Three to five links maximum.

**Mobile (below 768px):**

* Hamburger replaces nav links. Animate three lines → X on open (`transform` + `opacity`, no layout shift).
* Mobile menu: full-screen overlay, `position: fixed`, `z-index` above all content. Serif nav links at large scale, vertically centered.
* Lock body scroll when open (`overflow: hidden` on `<body>`). Restore on close or Escape.

**Rules:**

* One CTA button in the nav. Examples: "Start a Project", "Work With Us", "Get in Touch". Pick one; don't vary within a project.
* **Vary nav link names between projects.** The reference uses Philosophy / Work / Contact. You might use About / Services / Journal / Contact, or Work / Process / Studio / Contact.

---

## Layout sections (not a template)

Use 3–5 of these in any order. Never repeat the same type twice. The page should feel curated, not exhaustive.

* **Hero** — proposition, evidence, one action. Serif headline, sans body, generous vertical space, ambient background effect.
* **Philosophy / Manifesto** — headline + copy pairing, often two-column. A thin accent rule above the headline. The writing carries the section.
* **Work / Projects** — 2–6 cards in a grid. Each card: image placeholder (aspect-ratio 4/3), a tag in `--accent`, a title, a one-sentence description.
* **Services / Capabilities** — what the studio does, stated plainly. Three-column list or alternating text blocks.
* **Process** — numbered steps, each with a title and 1–2 sentences. Sparse by design: four steps maximum, no sub-steps, no connecting arrows. The numbers are typographic, not functional. Think printed manual, not app onboarding.
* **Journal / Writing** — if included, typographic-first. Cards only if articles are genuinely discrete and scannable.
* **Contact / CTA** — short, warm, centered or left-aligned. Headline, one sentence, a form or email link. Form fields: name, email, message — nothing else.
* **Footer** — copyright in `<time datetime="...">`, 2–4 social links with `aria-label`, no sitemap, no newsletter signup.

**Footer rule:** the footer's background must differ from the section directly above it. Alternate between `--bg` and `--bg-warm` so the page closes on a distinct visual note.

---

## Performance guardrails

This is a single HTML file. No build step, no framework, no dependencies beyond Google Fonts. Keep it that way.

* **Fonts:** Load via `<link rel="preconnect" href="https://fonts.googleapis.com">` and the standard Google Fonts stylesheet. Use `font-display: swap`. Never block render on web fonts.
* **Images:** All image placeholders are inline SVG or CSS — no external image requests.
* **JS:** No external scripts. All behavior is self-contained in a single `<script>` block at the end of `<body>`.
* **Scroll/resize handlers:** Throttle via `requestAnimationFrame`. Mouse move uses a dirty flag updated on `mousemove`, consumed on the next frame — not per-frame recalculation.
* **Section performance:** Below-fold sections get `content-visibility: auto` with a reasonable `contain-intrinsic-size`. Cards use `contain: layout style paint`.
* **File size target:** Under 25KB uncompressed (excluding fonts, which are external). If you're over, remove something — don't compress the philosophy.
* **Privacy:** No analytics, no tracking, no third-party scripts beyond Google Fonts. The restraint extends to the network.

---

## Print stylesheet

Include a `@media print` block that:

* Hides: nav, background effect, scroll indicator, mobile menu, social links, theme toggle.
* Sets sections to `break-inside: avoid`.
* Removes all animations and transitions.
* Forces `--ink` to black, `--bg` to white.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**
- Landmark roles: `role="navigation"`, `role="main"`, `role="contentinfo"` on footer
- Sections have `aria-labelledby` pointing to their h2
- Heading hierarchy is sequential (h1 → h2 → h3, no skips)

**Interactive elements:**

- All buttons have `type` attribute (`type="button"` or `type="submit"`)
- `aria-label` on icon-only buttons (hamburger, theme toggle, social links)
- `:focus-visible` outline on all interactive elements
- Touch targets ≥ 44×44px

**Mobile menu:**

- `role="dialog"` and `aria-modal="true"` on overlay
- Focus trapped inside when open
- Closes on Escape
- `aria-expanded` on hamburger button reflects state

**Form:**

- Labels always visible, associated via `for`/`id`
- `aria-required="true"` on required fields
- Success state: `role="status"`, `aria-live="polite"`, receives focus programmatically

**Decorative elements:**

- `aria-hidden="true"` on background canvas/SVG and decorative SVGs
- Meaningful images (if any) have descriptive `alt` text

**Motion and contrast:**

- `prefers-reduced-motion`: all animations off, background effect replaced with static gradient, scroll-observed elements visible immediately
- `prefers-contrast: more`: hardened outlines, `--ink` pushed toward pure black/white

---

## What to vary between projects

These are the levers. Pull them differently each time:

* Serif font family (from the approved list or similar editorial serif)
* Sans font family (from the approved list or `system-ui`)
* Accent hue: change `--accent` on `:root` — warm-earth range only
* Number and names of nav links (3–5)
* Number, order, and types of sections (3–5, never repeat a type)
* Hero headline copy (2–3 lines, always editorial in voice)
* Philosophy/manifesto copy
* Project names, tags, and descriptions
* Contact CTA text and form field labels
* Background effect technique (Options A–D from the motion table)
* Card count (2–6)
* Whether to include a Journal or Process section
* Footer background (`--bg` or `--bg-warm`, must differ from the section above)

## What to never vary

* The restraint. Nothing should feel decorative.
* The color commitment level. Whisper, always.
* The editorial voice. Warm, precise, unsentimental.
* The two-font system. One serif, one sans.
* The motion character. Slow, ambient, deliberate.
* The performance model. Single HTML file, no framework, no bloat.
* The accessibility baseline. Every item in the checklist.
* The CSS variable system. Always `var(--token)`, never hardcoded hex.

