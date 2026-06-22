---
title: design-comfort-warm-editorial
description: A warm, tactile, unhurried design language for artisanal brands, cafés, roasteries, makers, wellness and hospitality studios, and editorial single-page sites. Paper surfaces, a serif voice with italic accents over humanist-sans structure, soft ambient motion, and hand-made warmth.
---

# Setup

**Ask the user first:** *"Would you like a single HTML page or a full repository with libraries and frameworks?"*

| Choice | Deliverable |
|--------|-------------|
| **Single HTML** | One self-contained `.html` file. Inline `<style>`, one IIFE `<script>`, `IntersectionObserver` for scroll reveals, Google Fonts + `display=swap`. No framework. |
| **Full repo** | Astro 6 + Tailwind CSS v4 + anime.js + self-hosted Fontsource. Use the structure and patterns below. |

# Quick Reference — The Non-Negotiables

Comfort is **warm, unhurried editorial minimalism**. Fine print magazine meets a sunlit room.

| Domain | Rule |
|--------|------|
| **Palette** | Warm paper + warm ink. One earthy accent hue (5°–55° coral/terracotta/amber/ochre; or alternate dusty rose 340°–360° / olive 95°–150°). No pure `#000` / `#fff`, no neon, no cold tech blues. |
| **Typography** | Strict two-font system: **serif display** for hero headlines + numerals + pull-quotes + footer wordmark; **humanist sans** for body/labels/UI. Serif never for running body; sans never for hero/display headline. |
| **Headlines** | Hero `h1`: full serif. Section `h2`: bold sans with **one short serif-italic accent phrase** in accent color. |
| **Theme** | `data-theme="light|dark"` on `<html>`. Render-blocking no-flash init script reads `localStorage` / `prefers-color-scheme`. Toggle uses View Transitions circular `clip-path` reveal from pointer. |
| **Motion** | Ease-out everything. No bounce, no elastic, no marquees. Hero animates **on load** (`autoplay: true`); every other section reveals **on scroll**. Full `prefers-reduced-motion` kill switch. |
| **Layout** | Generous whitespace, soft rounded corners (12–28px), gentle shadows, subtle paper-grain noise overlay on `body::before`. |
| **Scrollbar** | Style `html`, never `body`. |
| **Images** | CSS/SVG mocks and template placeholders only. Zero binary assets shipped. |

# Core Conviction

Comfort is not a template. It is a set of tendencies: warm, tactile, calm, generous, quietly confident, hand-made. Every detail is deliberate — the paper grain, the single italic accent, the breathing room, the soft shadow. A page should feel like a warm room you don't want to leave.

**Two hard rules:**
- Do not reproduce exact copy from any reference. Invent brand names, taglines, and body text that match the voice.
- Do not reproduce exact layout. Vary section selection, order, and count every run.

# Vary vs. Freeze

| Always vary | Never break |
|-------------|-------------|
| Serif + sans pairing from approved lists | Warm paper-and-ink foundation |
| Accent hue, saturation, lightness | Exactly one accent hue |
| Brand name, copy, vocabulary | `data-theme` + no-flash script + circular theme reveal |
| Section selection/order (4–10, no repeats) | Two-font system + headline strategy |
| Radius, shadow softness, motif | Hero uses `autoplay: true`; others use `onScroll` |
| Durations/easings within ranges | Ease-out, no-bounce motion character |
| Optional flourishes (0–2 of: sticky stack, ambient drift, custom cursor) | Named-peer checkbox menus; scrollbar on `html` |
| Deliverable format (single HTML or Astro repo) | Full reduced-motion opt-out |

# Voice

Warm, plainspoken, quietly confident. Like a maker hosting you in their workshop.

- Lead with the concrete thing, not an abstraction.
- No superlatives or hype. Avoid: "revolutionary", "world-class", "seamless", "game-changing", "cutting-edge", "curated", "bespoke", "artisan".
- Keep paragraphs short (1–3 sentences). Vary sentence length.
- Section transitions are gentle: eyebrow label sets context, headline does the work.
- Names should feel hand-lettered and earthy: "Hearth", "Mill Lane", "Slow Sunday", "Ember & Oat", "Northlight".
- Vocabulary palette (pick a handful per run): *small-batch, hand, warm, slow, honest, grain, linen, hearth, kettle, table, season, gather, roast/bake/steep, care, home, light, morning, ritual*.

# Mood Snapshot

A typical Comfort hero for a small roastery:

> Eyebrow pill: **"SMALL-BATCH • ROASTED TO ORDER"**  
> Headline: **"Coffee worth *slowing down* for"** — full serif, italic accent word in terracotta  
> Subhead: two short sentences about sourcing and roasting.  
> CTAs: two rounded pills — primary filled (accent), secondary outlined.  
> Visual: large template placeholder below or beside, captioned quietly.  
> Scroll cue: a small, gently bobbing chevron fading to `0.3` opacity.

This is the rhythm: mostly air, one warm accent, serif authority, sans clarity.

# Visual System

## Color

Two-mode system: warm **paper** default and warm **lamplit** dark. Both are warm — dark mode is a dim room, never cold black.

```css
:root {
  --bg:          /* warm cream, e.g. hsl(44 38% 94%) */;
  --bg-surface:  /* slightly lifted from --bg */;
  --text:        /* warm near-black, e.g. hsl(28 18% 16%) */;
  --text-dim:    /* ~70% toward --bg */;
  --muted:       /* low-contrast warm grey-brown for hairlines */;
  --accent:      /* warm/earthy, dynamic per run */;
  --accent-dim:  /* desaturated + darkened */;
  --accent-soft: /* lifted/lightened for hovers & dark panels */;
}
:root[data-theme="dark"] {
  --bg:         /* warm near-black, e.g. hsl(28 12% 10%) */;
  --bg-surface: /* lamplit lift */;
  --text:       /* warm off-white, e.g. hsl(40 30% 88%) */;
  /* re-derive dim/muted/accent variants */
}
```

For Tailwind v4, register frozen `--brand-*` tokens and forward them through `@theme inline` so `bg-paper`, `text-accent`, etc. resolve to living custom properties. **Every `@theme inline` value must be `var(--brand-*)` — never raw hex/HSL/RGB.**

**Accent rules:**
- Hue 5°–55° (coral, terracotta, clay, rust, amber, ochre, caramel). Alternates: dusty rose 340°–360° or muted olive 95°–150°.
- Saturation 45%–85%; lightness 40%–60%.
- Never reuse the same hue across runs.
- `--accent-soft` must be re-derived for dark mode (lighter + more saturated for legibility).
- One accent hue only. A couple of muted support earth tones are allowed as neutrals.

**Surfaces:**
- `--bg-surface` is slightly lifted from `--bg` for alternating sections, cards, drawers.
- Subtle warm radial gradients or faint paper-grain/noise overlay (`body::before`, opacity 0.015–0.025) are allowed.
- Never harsh pure-color blocks.

**Refuse:** pure black/white surfaces; neon/electric accents; cold blue-grey palettes; hard 90° corners; harsh 1px-black borders; heavy drop shadows; glassmorphism; busy gradients.

## Typography

**Serif display (pick one):** Fraunces, Lora, Newsreader, Spectral, Cormorant, EB Garamond, Playfair Display, Source Serif, Junicode.

**Sans/grotesque body (pick one):** Bricolage Grotesque, Hanken Grotesk, Work Sans, Inter, Mona Sans, Schibsted Grotesk, Figtree, Geist Sans.

**Headline strategy:**
- **Hero `h1`:** full serif, weight 500–600, letter-spacing `-0.01em`, line-height ~0.9–1.05. Optional italic accent phrase inside.
- **Section `h2`:** bold sans + one short serif-italic accent phrase in accent color.
- **Italic accent phrase:** one word, occasionally two, never a whole clause, sometimes zero. Never more than one per headline.
- Serif also carries: large numerals, pull-quote marks, stat figures, oversized footer wordmark.

**Sans rhythm:**

| Element | Size | Weight | Spacing | Case |
|---------|------|--------|---------|------|
| Eyebrow | 0.75–0.875rem | 600–700 | 0.1–0.2em | UPPERCASE |
| Body | 1–1.125rem | 400–500 | 0 | — |
| Lead/subhead | 1.125–1.375rem | 400 | 0 | — |
| Nav / UI | 0.9–1rem | 500 | 0 | — |
| Meta / caption | 0.8rem | 500 | 0.02em | — |

**Rules:**
- Never a third font; never serif body; never sans hero headline.
- Load only weights used — about six variants total (e.g., sans 400/500/600 + serif 400-italic/500/600).
- Self-host via Fontsource (framework) or `preconnect` + `display=swap` (single file).

## Composition

- **Hero:** generous top padding, left- or center-aligned. Eyebrow pill, large serif headline, short subhead, 1–2 CTAs, one visual. Mostly air. Scroll cue optional.
- **Separators:** generous vertical whitespace; occasional 1px low-opacity warm hairline. Avoid loud dividers.
- **Spacing:** use clamp-based CSS variables (`--py-section`, `--px`, `--gap`). Roomy, not tight.
- **Cards:** soft rounded cards on `--bg-surface`, hairline or no border, gentle shadow. One card style per page. Dashed low-opacity warm borders are on-brand for newsletter/CTA panels.
- **Corners:** one radius scale per run (~12–24px; `rounded-xl/2xl/3xl` + `rounded-full` for pills).
- **Shadows:** soft, low, with a faint warm tint.

# Motion

Motion is soft and ambient — it warms, it never performs.

## Reduced motion (mandatory)

A three-level kill switch:

1. **JS guard** at the top of every scoped `<script>`:
   ```js
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     document.querySelectorAll('#section-id .reveal-item').forEach(el => {
       el.style.opacity = '';
       el.style.transform = '';
       el.style.filter = '';
     });
     return;
   }
   ```
2. **CSS fallback** in `global.css`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .reveal-item { opacity: 1 !important; transform: none !important; filter: none !important; transition: none !important; }
   }
   ```
3. **CSS `@keyframes`** must be wrapped in `@media not (prefers-reduced-motion: reduce)` or overridden to `animation: none` under reduced motion.

For framework builds, centralize this in `src/utils/reveal.ts` as `revealSection(containerId, options?)`.

## Signature 1: Hero cinematic entrance

The hero is above the fold — it must **not** use `revealSection()` / `onScroll()`.

- Set initial hidden state via CSS classes scoped to the hero inside `@media not (prefers-reduced-motion: reduce)`.
- Text lines: stagger 120–220ms, duration 600–1000ms, ease-out (e.g. `'outExpo'`), from `opacity: 0`, `translateY: 20–28px`, `filter: blur(4–6px)`.
- Hero visual: delay ~400–600ms, duration 800–1000ms, ease-out, from `opacity: 0`, `translateY: 16–24px`, `blur(4–6px)`, `scale: 0.94`.
- Scroll cue: delay ~1200–1600ms, fade to `opacity: 0.3`.
- After entrance, fade cue with scroll via `onScroll({ target: heroSection, sync: true })` from `0.3 → 0`.

## Signature 2: Blur-in scroll reveal

Every non-hero section uses scroll-triggered reveals.

- Targets: `.reveal-item` inside each section.
- From: `opacity: 0.001`, `translateY: 14–24px`, `filter: blur(4–6px)`.
- To: resting state.
- Duration 300–600ms, ease-out (`'outExpo'`, `'outQuad'`, `'out(3)'`).
- Siblings stagger 90–160ms.
- Trigger: `onScroll({ target: sectionEl, enter: 'bottom', leave: 'top' })`.
- In single-file builds, use `IntersectionObserver`.

## Signature 3: Themed circular reveal

On theme toggle, wash the new mode across the page in a circle from the toggle/pointer.

- Use View Transitions API: animate `::view-transition-new(root)` `clip-path` from `circle(0 at Xpx Ypx)` to a radius covering the farthest corner.
- Add accent ring burst and brief icon spin/scale.
- Fallback: instant swap where `startViewTransition` is unavailable.
- Disabled under `prefers-reduced-motion: reduce`.

## Optional flourishes (choose 0–2)

- **Sticky media stack:** pinned visuals that crossfade as feature list items are selected.
- **Ambient drift:** very slow warm gradient or grain breathing.
- **Soft custom cursor:** small accent dot with inertia, pointer-fine devices only.

## Motion rules

- Ease-out for entrances; never ease-in-out, never bounce, never elastic.
- Hovers: scale ≤ 1.03, soft shadow lift, underline grow; 120–250ms.
- Respect `prefers-reduced-motion`, `prefers-contrast: more`, and `pointer: coarse`.

# Interaction & Navigation

## Top bar
- Serif or eyebrow-sans wordmark left; sans nav links center/right; theme toggle + primary CTA right.
- Scroll-aware frosted glass when hero scrolls out (`backdrop-filter: blur(8px)` + lifted paper background).
- Active nav link: smooth underline + opacity tween; never snap.

## Menus
- **Drawer (small screens):** checkbox `peer/drawer` toggle, paper panel, staggered serif links, Escape/backdrop/link close, body scroll lock via JS enhancement only.
- **Rail (wide screens, optional):** slim persistent vertical rail via `peer/hd`, expanding on hover, pin-opened by an HD-only Menu trigger.
- **Independent named peers are mandatory.** A generic `peer` can cross-trigger drawer and rail.

## Custom scrollbar
- Style on `html` — never `body`, never a utility class on `body`.
- Firefox: `html { scrollbar-width: thin; scrollbar-color: var(--brand-accent-dim) var(--brand-paper); }`
- WebKit: `html::-webkit-scrollbar { width: 8px; }` with track `--brand-paper`, thumb `--brand-accent-dim` (hover → `--brand-accent`).
- Use a `scrollbar-slim` class for inner scroll areas applied to the scrolling element itself.

## Forms
- Prefer direct `mailto:` links with accent underline that grows on hover.
- One newsletter field allowed: soft rounded input, real `<label>`, one field + button.

## Focus & accessibility
- `:focus-visible` outline: 2px solid `--accent` (or `--text` under high-contrast), 2px offset.
- All interactive controls keyboard reachable; custom toggles use real `<button>`/`<input>`.
- Decorative elements (motifs, mocks, rings) marked `aria-hidden="true"`.
- Touch targets ≥ 44×44px.

# Layout Sections (Approved Roster)

Use **4–10** of these in any order. Never repeat a type; never reuse a prior run's order or count.

- **Hero** — eyebrow + serif headline (one italic accent) + subhead + CTAs + visual.
- **Press / Logos strip** — quiet "as featured in" serif wordmarks at low opacity.
- **Manifesto / About** — short editorial statement; optional value blocks or stat row.
- **Feature / Craft stack** — pinned media or alternating layout; 3–5 features; collapses to tabs + visual on mobile.
- **Process / Steps** — numbered steps with serif numerals.
- **Collection / Grid** — products, works, places as soft cards or editorial grid.
- **Tiers / Offerings** — pricing/membership; one tier softly emphasized (filled, not loud).
- **Voices / Testimonials** — pull-quotes with attribution; serif quotation mark accent.
- **Notes / Journal** — preview cards linking to writing or guides.
- **Visit / Contact** — address, hours, map placeholder, `mailto` CTA.
- **Newsletter** — single-field signup band on `--bg-surface`.
- **Footer** — link columns + oversized serif wordmark bleeding along bottom; quiet motif; copyright + back-to-top.

Choose one decorative motif per run (concentric arcs / soft rays / paper grain / blob field / hairline grid) and use it sparingly and consistently.

# Build & Technical Signatures

## Canonical framework stack
- **Astro 6** with static output, `.astro` components, per-component `<script>` and scoped `<style>`.
- **Tailwind CSS v4 (CSS-first)** via `@tailwindcss/vite`.
- **anime.js v4** for scroll reveals and micro-interactions.
- **@fontsource/** self-hosted fonts; only weights used.
- Path alias `~/* → src/*`.

### Tailwind v4 essentials
```css
@import 'tailwindcss';
@theme inline {
  --color-paper:        var(--brand-paper);
  --color-accent:       var(--brand-accent);
  --color-accent-dim:   var(--brand-accent-dim);
  --color-accent-soft:  var(--brand-accent-soft);
  --color-dark:         var(--brand-dark);
  --color-subtle:       var(--brand-subtle);
  --color-muted:        var(--brand-muted);
  --font-serif-display: var(--font-serif);
  --font-size-h1:       var(--h1);
  --font-size-h2:       var(--h2);
  --spacing-section:    var(--py-section);
  --spacing-gutter:     var(--px);
  --spacing-gap:        var(--gap);
}
@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
@utility container { /* page measure */ }
```

Register a `--breakpoint-hd` (~1600px) for wide-screen rail behavior.

### anime.js v4 critical syntax
- `animate(targets, params)` — not `({ targets, ...params })`.
- `ease` not `easing`; bare names: `'outExpo'`, `'outQuad'`, `'out(3)'`, `'inOutCirc'`.
- **Never** use string-format `'cubicBezier(...)'` or `'easeOutExpo'`.
- `onScroll({ target: sectionEl, enter: 'bottom', leave: 'top' })` — target must be a DOM element, not a selector string.
- Use `utils.$(selector)` and `utils.set(targets, props)`.
- `stagger()` is a top-level import.

### Theme system
- Single source of truth: `data-theme="light|dark"` on `<html>`.
- Do **not** toggle a `.dark` class on `<html>`.
- Render-blocking inline no-flash script in `<head>` reads `localStorage` / `prefers-color-scheme` before first paint.
- Toggle: `document.documentElement.setAttribute('data-theme', value)` + `localStorage.setItem('theme', value)`.

### Project structure
```text
<project>/
├─ astro.config.mjs
├─ tsconfig.json
├─ package.json
├─ public/favicon.svg
└─ src/
   ├─ styles/global.css
   ├─ layouts/Layout.astro
   ├─ utils/merge.ts
   ├─ utils/reveal.ts
   ├─ icons/*.astro
   ├─ components/
   │  ├─ NavBar.astro
   │  ├─ Sidebar.astro
   │  ├─ SidebarHD.astro
   │  ├─ ThemeSwitch.astro
   │  ├─ Footer.astro
   │  ├─ Logo.astro
   │  ├─ Button.astro
   │  ├─ Title.astro
   │  ├─ Description.astro
   │  ├─ Placeholder.astro
   │  ├─ <Motif>.astro
   │  ├─ <Mock>.astro
   │  └─ <Section>.astro ...
   └─ pages/
      ├─ index.astro
      └─ 404.astro
```

### Single-file fallback
- Inline `<style>` + one IIFE `<script>`.
- Same tokens, same motion principles, `IntersectionObserver` for scroll reveals.
- Target payload: under ~80KB uncompressed (excluding fonts).

## HTML Head & Meta

Every page needs:
- `charset`, responsive `viewport`.
- `<title>`: `"<Brand> — <short warm descriptor>"`.
- `<meta name="description">`: one or two warm concrete sentences, ≤155 chars.
- `<meta name="theme-color">` matching accent or `--bg` (with dark media variant).
- `<meta name="color-scheme" content="light dark">`.
- Open Graph (`og:title`, `og:description`, `og:type`) + `twitter:card`.
- Favicon: simple warm SVG mark generated per run.

# Accessibility Checklist

Ship only when all are true:
- Semantic landmarks (`header`/`nav`, `main`, `contentinfo`).
- Correct `aria-labelledby` linking section headings to regions.
- Strict heading hierarchy: one `h1`, then `h2 → h3`.
- `type` on every `<button>`.
- `aria-label` on icon-only controls.
- Touch targets ≥ 44×44px.
- `aria-expanded` / `aria-hidden` accurate on menus/drawers/dropdowns.
- Decorative elements `aria-hidden="true"`.
- `prefers-reduced-motion: reduce` fully disables motion.
- `prefers-contrast: more` hardens text contrast and outlines.
- `pointer: coarse` disables hover-only affordances and custom cursor.

# Common Failure Modes — Do Not Regress

| Bug | Prevention |
|-----|------------|
| Scrollbar styles on `body` or a utility class | Always target `html` |
| Hero uses `onScroll` / `revealSection()` | Hero uses `autoplay: true` only |
| Generic `peer` checkbox | Use `peer/drawer` and `peer/hd` independently |
| Hardcoded colors in `@theme inline` | Every value must be `var(--brand-*)` |
| anime.js v3 syntax (`easing`, string targets, `cubicBezier(...)`) | Use v4 API strictly |
| Forgetting reduced motion on CSS `@keyframes` | Wrap or override in `@media (prefers-reduced-motion: reduce)` |
| `.dark` class toggle | Use `data-theme` attribute only |
| Unused CSS tokens / `@keyframes` | Audit `global.css` before shipping; delete zero-reference tokens |
| More than one accent hue | One accent only; support earth tones are neutrals |
| Third font or serif body | Two-font system is absolute |
| Pure black/white surfaces | Warm near-black and cream only |
| Reused section order or copy | Vary every run |
| Binary image assets | Use CSS/SVG mocks and template placeholders |

# Performance & Privacy

- Zero analytics, trackers, or third-party calls beyond font host.
- Self-host fonts in framework builds; use `preconnect` + `display=swap` in single-file.
- About six font variants total; system-font fallbacks required.
- Framework builds: pin a single `vite` version via `overrides` so `@tailwindcss/vite` and Astro share one Vite instance.
- Clean token surface: every custom property and keyframe must be consumed somewhere; delete unused ones.
