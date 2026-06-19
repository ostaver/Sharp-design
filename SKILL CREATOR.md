# SKILL CREATOR — Meta-Template for Web Design Skills

This file is a scaffold for authoring a new **web design skill** (a `SKILL.md`) in the Sharp Design system. A skill is a self-contained design language an AI agent reads to build original, single-page (or small multi-file) websites that feel unmistakably from one system but never identical to a prior run.

## How to use this template (read first)

You are filling this template to produce one complete `SKILL.md`. Follow these rules:

1. **Replace every `[bracket]` placeholder** with concrete content for your design language. Leave no brackets behind.
2. **Delete every instructional aside and example block** (lines marked _e.g._, "Example:", or wrapped in `‹guidance›`) once you have used them. They are scaffolding, not output.
3. **Carry nothing over from other languages.** Do not paste Argon's cool accent rule, Atelier's warm-earth rule, Binary's mono-only rule, or any other system's specifics unless your language genuinely shares them. Each value must be chosen fresh.
4. **Keep the whole skill internally consistent.** If the system is light and warm, then the color rules, motion character, refusals, and meta tags must all agree. A contradiction between two sections is a defect.
5. **Be self-contained.** An agent should build a complete site from the finished `SKILL.md` alone, with no outside context.
6. **Prefer compression over verbosity.** Fewer tokens, clearer instructions. Use clean markdown lists, not dense paragraphs of inline bullets.
7. **Decide the output shape up front:** single `.html` file, a folder/repo, or a framework project. Every later section (Architecture, Performance, Meta) must reflect that choice.

Delete this entire "How to use this template" section from the finished `SKILL.md`.

---

## Frontmatter (required)

Every finished skill opens with YAML frontmatter:

```yaml
---
title: design-[skill-name]-[target-group]
description: [One or two sentences. Name the aesthetic, the target audience, and the signature techniques. No marketing fluff.]
---
```

---

# [Skill Name]

You are designing in the [Skill Name] language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce [adjective], [adjective], [adjective, e.g., gallery-grade / industrial / editorial] pages. The output should feel unmistakably from the same language but never identical to a prior run.

## Core conviction

[Skill Name] runs [core aesthetic stance, e.g., dark / light / warm / high-contrast]. [State whether this is absolute.] The aesthetic lives at the intersection of [Concept A] and [Concept B] — [adjective], [adjective], [adjective]. Every detail is deliberate: [example detail 1], [example detail 2], [example detail 3]. "[A short mantra that captures the philosophy.]"

Two things you must never do:

- **Do not reproduce the exact copy.** The brand name, tagline, project names, descriptions, and section headers in any reference are specific to that page. Invent your own that match the voice.
- **Do not reproduce the exact layout.** A reference may run [example base section sequence]. You may reorder sections, add or remove from the approved roster, or vary the section count. Never repeat a section type within one page.

---

## Voice

The tone is [tone descriptor 1], [tone descriptor 2], and [tone descriptor 3]. It borrows from [reference material A] and [reference material B]. The writer speaks like a [persona/profession]: [rule about fluff and sentimentality].

**Rules:**

- [Rule about proposition and directness.]
- [Rule about marketing language and superlatives.]
- [Rule about paragraph length and structure.]
- [Rule about how section transitions read.]
- Names, brands, and titles should feel [vibe descriptor] (e.g., "[example name 1]", "[example name 2]").
- Approved vocabulary blends [Concept A] and [Concept B]: [list 5–10 words the writing may lean on].

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** [Viewport constraints, alignment, blending, immediate visual impact.]
- **Separators:** [How sections are divided — marquee, hard borders, whitespace, rules.]
- **Spacing:** [Vertical/horizontal rhythm. Prefer clamp-based CSS variables.]
- **Backgrounds:** [Rules for section backgrounds, gradients, or canvas integration.]
- **Headers:** [Structural rules for section headers — numbered, aligned, bordered.]
- **Content:** [Rhythm — e.g., alternates between text-forward and data-forward.]
- **Data display:** [How lists, portfolios, or stats are shown.]

**Refuse:**

- [Anti-pattern 1, e.g., cards, pill badges, gradient overlays.]
- [Anti-pattern 2, e.g., drop shadows, rounded corners.]
- [Anti-pattern 3, e.g., visible scrollbars, marketing CTAs.]

---

## Color

[Skill Name] is a [single / multi]-theme system: [state the constraint, e.g., dark only, light+dark, high-contrast monochrome]. [State whether a theme toggle exists.]

**Commitment level: [metaphor, e.g., terminal-at-night / warm paper / e-ink].** [Describe surfaces, accent presence, and contrast in one or two sentences.]

**CSS custom properties — define these on `:root`[ and `[data-theme="..."]` if multi-theme]:**

```css
:root {
  /* Surfaces */
  --bg:          [value];
  --bg-surface:  [value];
  /* Text */
  --text:        [value];
  --text-dim:    [value];
  --muted:       [value];
  /* Accent */
  --accent:      [value or dynamic instruction];
  --accent-dim:  [value];
  --accent-glow: [value];
  /* Structure */
  --font-1:      [primary font stack];
  --font-2:      [secondary font stack];
  --max-w:       [value];
  --px:          [clamp value];
  --py-section:  [clamp value];
}
```

Use CSS variables for all colors. Never hardcode hex in the stylesheet.

**Rules:**

- **Accent range:** [Define the allowed hue/saturation/lightness range for this language, and forbid the rest.] ‹guidance: pick a range that fits the conviction — e.g., warm-earth for a soft studio, cool spectrum for a technical one — and give 3–4 concrete examples.›
- The accent appears in: [enumerate the specific elements that carry the accent].
- `--accent-dim` is the accent desaturated/darkened — used for inactive states and depth.
- `--accent-glow` is the accent brightened — used for hover states.
- `--bg-surface` is slightly lifted from `--bg` — used for hover backgrounds and depth.
- All `color` / `background-color` transitions are `[duration] [easing]`.
- [Any blend-mode rules, e.g., nav/hero text using `mix-blend-mode: difference`.]
- Respect `prefers-contrast: more` — push `--text` toward its extreme, harden focus outlines.
- **Vary the accent between projects** within the approved range. Never repeat the same hue twice across builds.

---

## Typography

This is a [number]-font system. [State the role of each font in one line, e.g., one serif for voice, one monospace for structure.]

**[Font role 1]:** `[Font name]` ([source], weights [list]). Used for [where it appears].

**[Font role 2]:** `[Font name]` ([source], weights [list]). Used for [where it appears].

**Scale ([font role 1] headlines):**

- h1 (brand): `clamp([min], [vw], [max])`, weight [x], letter-spacing [x], line-height [x]
- [element 2]: `clamp([min], [vw], [max])`, weight [x]
- [element 3]: `[fixed rem]`, weight [x]

**[Font role 2] rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| [Element A] | `[rem]` | [weight] | `[em]` | [case or —] |
| [Element B] | `[rem]` | [weight] | `[em]` | [case or —] |
| [Element C] | `[rem]` | [weight] | `[em]` | [case or —] |

**Rules:**

- Never introduce a font outside the [number]-font system.
- Load only the weights actually used — never more than [n] weight/italic variants total.
- Headline letter-spacing is [tight/loose value].
- **Vary the fonts between projects** from the approved lists: [list approved alternates for each role].

---

## Motion

Motion in [Skill Name] is [ambient / responsive / snappy / minimal / non-existent]. [One sentence on what motion communicates here.]

‹If the language has signature animated features (WebGL, canvas, marquee, custom cursor), document each below. If it does not, delete the signature-feature sub-sections and keep only Scroll & Reveal.›

### Signature feature 1: [name, e.g., WebGL background / ASCII canvas]

[Architecture: shader/canvas requirements, algorithms (FBM, noise), DOM placement (absolute vs fixed), required uniforms, visual tuning, and any mandatory coordinate/aspect corrections.]

**Guardrails:**

- [Performance cap, e.g., DPR clamping.]
- [Initialization-failure handling — fail silently, no retry loop.]
- [Context-loss handling — listen for loss/restore, recompile, restart. Mandatory for WebGL.]

### Signature feature 2: [name, e.g., custom cursor / marquee ticker]

[Elements involved, physics/math (spring inertia via requestAnimationFrame), hover states, and visibility rules keyed to media queries / pointer type.]

### Scroll & reveal

- **Trigger:** [e.g., IntersectionObserver, threshold value.]
- **Behavior:** [start state → end state, duration, cubic-bezier.]
- **Stagger:** [data-delay logic.]

**Motion rules:**

- [Easing rule — which curves are allowed for what; what is banned.]
- [Bounce/spring rule.]
- Almost everything must have motion, every detail.
- **Respect `prefers-reduced-motion: reduce` globally:** kill all animations, transitions, signature features, and cursor. Show scroll-observed elements immediately.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible` outline: `[standard for this system]`. Never `outline: none` without a replacement.
- [Keyboard rules for interactive elements — tabindex, role, aria-label, Escape handling.]

### Navigation

**Desktop:**

- [Positioning, z-index, blend modes, alignment, link count.]
- [Hover/active states. State whether there is a CTA button.]
- **Vary nav link labels between projects.** [Give two example label sets.]

**Mobile (below [breakpoint]px):**

- [Hamburger/menu interaction, overlay styles, focus trapping, scroll locking, aria-expanded/aria-hidden toggling.]

### Forms & contact

- [The system's approach — e.g., direct email link only, or a single form with name/email/message. Define hover and submission states if a form exists.]

---

## Layout sections (approved roster)

Use [min]–[max] of these in any order. Never repeat the same type twice. The page should feel curated, not exhaustive.

- **[Section type A, e.g., Hero]** — [grid/layout requirements and elements to include].
- **[Section type B, e.g., About]** — [grid/layout requirements and elements to include].
- **[Section type C, e.g., Work]** — [grid/layout requirements and elements to include].
- **[Section type D, e.g., Contact]** — [grid/layout requirements and elements to include].
- **[Section type E, e.g., Footer]** — [grid/layout requirements and elements to include].

[Any mandatory placement rules, e.g., "the footer must use `--bg`, not `--bg-surface`."]

---

## Architecture & performance guardrails

[State the output shape: single HTML file / folder / framework project.] No build step beyond [what is allowed], and no dependencies beyond [allowed external resources].

- **Fonts:** Load via `<link rel="preconnect">` with `display=swap`. Never block render on web fonts.
- **Images/assets:** [Asset rules — e.g., CSS/SVG/WebGL only, no external requests; or approved CDNs only.]
- **JavaScript:** [Where it lives — e.g., single IIFE at end of `<body>`. Vanilla only.] Provide `<noscript>` fallbacks for core content.
- **Size target:** Under [x]KB uncompressed. If over, remove in this order: [1], [2], [3]. Never remove accessibility markup or core layout.
- **Privacy:** No analytics, no tracking, no third-party scripts beyond [allowed].

---

## HTML head & meta tags

Every page must include:

- `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- `<title>` — format: `[rule, e.g., Brand Name — Short proposition]`. Never just the brand name.
- `<meta name="description">` — [tone and length rule, e.g., one sentence, 120–155 characters].
- `<meta name="theme-color">` matching `[CSS variable]`.
- `<meta name="color-scheme">` content [value(s)].
- OG tags (`og:title`, `og:description`) for basic social preview.
- Favicon: [rule — e.g., inline SVG, brand initial in accent, no external request].

---

## Print stylesheet

Include a `@media print` block that:

- Hides: [nav, canvas, cursor, ticker, scroll indicator, mobile menu, social links, and any decorative elements].
- Sets sections to `break-inside: avoid`.
- Removes all animations and transitions.
- Forces text to black, background to white.
- Removes any `mix-blend-mode` from all elements.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**

- Semantic HTML5 landmarks (`nav`, `main`, `contentinfo`) with correct roles and `aria-label`s.
- Sections linked to their headers via `aria-labelledby`.
- Strict, unbroken heading hierarchy (h1 → h2 → h3, no skips).
- If repository, list the structure and details.

**Interactive elements:**

- Buttons have an explicit `type`.
- `aria-label` on non-text interactive elements.
- `:focus-visible` outline on every interactive element.
- Touch targets ≥ 44×44px.

**State management:**

- `aria-expanded` / `aria-hidden` accurately toggled via JS on menus and overlays.
- Decorative elements hidden via `aria-hidden="true"`.

**Media queries:**

- `prefers-reduced-motion: reduce` fully implemented.
- `prefers-contrast: more` fully implemented.
- `pointer: coarse` handling for touch devices.

---

## LLM directives: vary vs. freeze

**Vary between generation runs:**

- Font families (from the approved lists).
- Accent color (within the language's constraints).
- Brand name, tagline, and all copywriting.
- Section order, selection, and count.
- Project names, metadata, tags, and stats.
- Nav link labels.

**Never vary:**

- The core layout constraints (e.g., hidden scrollbars, strict grid).
- The [number]-font system rule.
- The specific blend modes and technical signatures.
- The color commitment level.
- The accessibility and performance baselines.

---

## Companion files (for contribution)

A complete skill is more than `SKILL.md`. To match the Sharp Design repo convention:

- Place the skill at `[Language]/[language-name]-skill/SKILL.md`.
- Add a human-readable `[Language]/About.md` (model compatibility, token count, word/character count, score, short description).
- Include at least one preview image in the language folder if possible.

Delete this section from the finished `SKILL.md` — it is guidance for the author, not instructions for the building agent.
