---
name: elegant-business-website
description: >
  Builds a polished, multi-page, bilingual-capable marketing website with a
  dark elegant aesthetic, a cinematic motion layer (Lenis smooth scroll,
  reliable IntersectionObserver reveals, kinetic typography, a custom cursor,
  and pinned scrollytelling), a unique generative canvas background that grows
  with scroll and is themed to the client's brand, a Firebase (Firestore +
  Auth) backend, an admin CMS panel, a multi-step reservation/contact wizard
  powered by EmailJS, and SEO structured data. Produces vanilla HTML/CSS/JS
  (no build step) with one file per page and per concern, plus a detailed
  README and Firebase hosting setup. Use when a user asks to build a
  restaurant, cafe, bakery, salon, studio, hotel, boutique, or similar
  brand/landing/marketing website with a refined, animated, content-managed
  feel.
keywords:
  - website
  - landing page
  - marketing site
  - restaurant
  - cafe
  - bakery
  - business website
  - firebase
  - firestore
  - admin panel
  - cms
  - multilingual
  - i18n
  - reservation
  - booking
  - multi-step form
  - generative background
  - canvas animation
  - smooth scroll
  - lenis
  - gsap
  - scrolltrigger
  - scrollytelling
  - parallax
  - kinetic typography
  - custom cursor
  - dark theme
---

# Elegant Business Website Skill

Reproduces the architecture, design language, motion system, and feature set of
a high-end, dark-themed, multi-page marketing website - **re-themed for each
client**. The reference build is a Macedonian restaurant ("Amanet Gastro
Point"). Keep the *patterns* (structure, motion, components, backend,
accessibility); reinvent the *surface* (palette, fonts, imagery, the signature
background motif, copy, section arrangement) for the new brand.

> Golden rule: **Same skeleton, new skin.** Never copy the reference's gold
> palette, its tree-"roots" motif, its Macedonian copy, or its content. Derive
> everything from the client's brand. Two sites built with this skill should
> never look like twins.

---

## 0. Before you build: clarify context

If the request is missing any of the following, ask before generating - batch
the questions, keep it short, and offer defaults so the user can answer fast.

1. **Business name + industry** (e.g. "Rustic Crumb, an artisan bakery").
2. **Primary goal / CTA** (book a table, request a quote, order, contact).
3. **Pages needed.** Default: Home, Catalog (Menu/Services/Products), Contact/
   Reservation, About. Rename to suit the industry.
4. **Brand colors** or a mood (warm/earthy, cool/clinical, luxe/dark, fresh/
   pastel). If none, choose an industry-appropriate palette and say so.
5. **Logo** - provided, or generate a simple SVG/text logo?
6. **The signature background motif.** The site's identity is a generative
   canvas background that grows as you scroll, tied to the brand (the reference
   uses tree "roots"). Propose a motif that fits the new brand (see §6) and
   confirm.
7. **Languages.** Single or bilingual? If bilingual, **ask which second
   language** and use exactly that - never assume Macedonian. Default primary is
   English; the second language is whatever the user specifies.
8. **Backend & integrations.** Content-managed catalog + admin (Firestore +
   Auth)? A working reservation/contact email (EmailJS)?
9. **Contact details** - address, phone, email, hours, socials, map location.
10. **Motion intensity.** Full cinematic (default) or restrained? All motion must
    still degrade gracefully (see §6.4).

If the user says "use your judgment", proceed with documented defaults and list
your assumptions.

---

## 1. Tech stack & principles

- **Vanilla HTML + CSS + JS.** No framework, no bundler. Scripts are classic
  `<script>` tags; third-party libraries load from CDN.
- **Dependencies are tracked in `package.json`** (and installed via npm) for
  version pinning and a future build migration, but the browser loads them from
  CDN. Current libraries:
  - **Lenis** - smooth scroll engine (UMD CDN, global `Lenis`).
  - **GSAP + ScrollTrigger** - scroll-linked animation (CDN globals `gsap`,
    `ScrollTrigger`).
  - **Firebase compat SDK** (app/auth/firestore/[storage]) from gstatic.
  - **EmailJS** browser SDK from CDN.
- **One HTML file per page, one CSS file per concern/page, one JS file per page/
  concern.** Never merge into monoliths.
- **Progressive enhancement:** the page must render and be usable if JS, a
  library, or the backend fails (skeletons, error cards, static fallbacks).
- **Accessibility & performance first** (see §7, §10). Every motion feature has a
  `prefers-reduced-motion` and a no-library fallback.

---

## 2. File structure (replicate)

```
project-root/
├── index.html · <catalog>.html · <contact>.html · about.html · admin.html
├── assets/                 # logo, hero(es), section imagery (jpg/webp/png)
├── css/
│   ├── base.css            # tokens, resets, typography, reveal utils, Lenis css
│   ├── nav.css · hero.css · buttons.css · cards.css · footer.css
│   ├── home.css · <catalog>-page.css · <contact>.css · about-page.css · admin.css
│   └── styles.css          # OPTIONAL single-import aggregator (@import of all)
├── js/
│   ├── firebase-init.js    # config (PLACEHOLDERS) + db/auth/storage globals
│   ├── i18n.js · i18n.<lang>.js   # engine + one bundle per language
│   ├── nav.js              # sticky nav, mobile overlay, lang toggle, smooth anchors
│   ├── smooth-scroll.js    # Lenis init + GSAP/ScrollTrigger sync
│   ├── motion.js           # IntersectionObserver reveals + count-up (see §6.2)
│   ├── kinetic-typography.js  # hero headline word-by-word mask reveal
│   ├── cursor.js           # desktop custom cursor (magnetic hover)
│   ├── roots-bg.js         # signature generative canvas bg (scroll-grows)
│   ├── font-loading.js     # FOIT-avoidance font loader
│   ├── prefetch.js         # warms the catalog cache for instant nav
│   ├── home.js · <catalog>.js · <contact>.js · about.js · admin.js
├── package.json · package-lock.json   # tracked deps (lenis, gsap)
├── firebase.json · .firebaserc
├── firestore.rules · [storage.rules]
└── README.md               # full setup + deploy guide (REQUIRED)
```

Rename `<catalog>`, `<contact>`, `<lang>` per client. Give the generative
background file a brand-appropriate name (e.g. `roots-bg.js` → `steam-bg.js`).
Load `styles.css` **or** the individual stylesheets - not both.

---

## 3. Design system (themeable tokens)

All identity lives in CSS custom properties in `base.css`. **Re-theme by editing
token values, not component rules.** Keep the token *names*.

```css
:root {
  /* Surfaces - dark luxe by default. For a light brand, invert bg/text but
     keep the names. */
  --color-bg:#111111; --color-surface:#1e1e1e; --color-surface2:#272727;
  --color-white:#f5f0e8;                     /* warm off-white text */

  /* Brand accent - derive from the client (logo/industry). Generate light/dark
     variants (±~12% lightness). Reference restaurant = gold #c9a84c. */
  --color-primary:#c9a84c; --color-primary-light:#e8c86a; --color-primary-dark:#a8873c;
  /* Complementary secondary for gradients/accents. */
  --color-secondary:#4a7c59; --color-secondary-light:#6aab7a; --color-secondary-dark:#325a40;

  /* Borders share the accent glow at low alpha. */
  --color-border:rgba(201,168,76,.18); --color-border-light:rgba(201,168,76,.09);
  --color-border-dark:rgba(201,168,76,.28);
  --color-text:#f5f0e8; --color-text-muted:rgba(245,240,232,.55);
  --color-text-inverse:#111111; --color-error:#c0392b; --color-success:#27ae60;

  /* Type: a characterful display + a clean sans. Reference: Playfair + Inter. */
  --font-heading:'Playfair Display',Georgia,serif;
  --font-body:'Inter',system-ui,sans-serif;

  /* Copy these verbatim (brand-neutral): fluid type scale (--text-xs..7xl),
     spacing (--sp-1..10 and --spacing-1..13 aliases), radii, shadows,
     transitions (incl. --transition-bounce), z-index scale. */
}
```

Also reproduce the brand-neutral globals: box-sizing reset; flex-column `body`
with two faint radial brand washes; fluid `clamp()` headings; `.sr-only`,
`.skip-to-content`, `:focus-visible`; the `.reveal/.reveal-left/.reveal-right`
utilities + their reduced-motion reset; `.section-eyebrow`; and the Lenis CSS
block (`html.lenis`, `.lenis.lenis-smooth`, etc.).

**Deriving a palette:** pick one brand accent → generate light/dark → pick one
complementary secondary → set all borders as `rgba(accent, .09–.28)` → choose bg
mood. State the palette + font pairing you chose, and why, in one line.

---

## 4. Component system

Two complementary layers, both built on the tokens:

1. **Unified `.content-card` system** (`cards.css`) - the shared vocabulary:
   `.content-card` (tinted border, hover primary outline via `::before`, image
   zoom), `.content-card-image/-body`, `.content-card-stats`, `.content-card-
   story` (+`.reverse`), `.content-card-success/-error`, `.testimonial-card`,
   and layout helpers `.content-card-grid`, `.content-card-strip`. Use these for
   status banners, testimonials, contact cards, and generic content.

2. **Bespoke page-prefixed sections** for the signature marketing layouts -
   named per page (`hm-` home, `ab-` about, `rs-` reservation, etc.), e.g.
   `hm-mission` (image/text split), `hm-stats`, `hm-pillars`, `hm-story`
   (+`-reverse`). These give each page a custom feel while still consuming the
   shared tokens and motion classes. Prefer bespoke sections for hero-adjacent
   marketing content; reuse `.content-card` for repeatable/utility content.

Everything animates via the shared `.reveal*` classes and the motion layer
(§6), so add those classes rather than inventing per-section animation.

> **State components must honor `[hidden]`.** Skeleton, error, and empty-state
> blocks are toggled via the `hidden` attribute, but a class like
> `.content-card-error { display:flex }` or `.skeleton { display:flex }` **wins
> over** the attribute and leaves them visible under real content. Always ship a
> global `[hidden] { display:none !important; }` (in `base.css`) so `hidden`
> actually hides.

---

## 5. Page layouts (keep the pattern; vary the arrangement)

Follow these closely but vary order/counts so each site feels bespoke.

**Shared chrome (every page):** `.skip-to-content`; fixed `.site-nav` (logo,
animated-underline links with active state, optional language toggle, hamburger →
full-screen mobile overlay); `.site-footer` (brand, nav, hours, contact w/ inline
SVG icons + map link, real social links, auto-year, credits); the generative
canvas background; the motion layer + custom cursor.

- **Home** - kinetic-typography hero (bg image + gradient overlay + word-reveal
  headline + dual CTA + scroll chevron, with a scroll-driven exit transition) →
  mission split → stats strip (count-up) → pillars → alternating story blocks →
  parallax CTA band → testimonials → optional dynamic promotions (hidden until
  Firestore returns active rows). Includes JSON-LD structured data (§10).
- **About** - hero → intro split → stats → pillars → alternating stories →
  **pinned heritage scrollytelling** (a `position:sticky` visual/motif that
  stays while numbered narrative steps scroll past - tell the brand's story) →
  contact panel + embedded map (with text fallback).
- **Catalog (Menu/Services)** - short hero → skeleton loader → error card →
  accordion of categories (headers may use a category image as background)
  expanding to a responsive grid of item cards (image/placeholder, name,
  description, optional allergens/tags, price). Data from Firestore, cached in
  `sessionStorage`, re-rendered (not refetched) on language switch.
- **Contact/Reservation** - **multi-step wizard**: a progress indicator + one
  decision per panel (date → party size → time → details → review/confirm) with
  animated transitions, choice chips/buttons, a summary card, then EmailJS
  submit. Pair with a sticky contact card. (A single validated form is an
  acceptable simpler variant.)
- **Admin** - login (email/password) → tabbed CRUD (Categories / Items /
  Promotions) with inline create-edit forms, sortable/filterable tables, delete-
  confirm modal, toast notifications.

### 5.1 Chrome & layout robustness (learned the hard way)
- **Navbar legibility.** A fully transparent nav over a hero image usually has
  poor contrast. Default to a **solid (or backdrop-blurred) nav background**, not
  transparent-at-top, and keep link/logo colors readable against it.
- **Mobile nav must shrink.** Reduce nav height, brand text, and logo size at
  small widths, and **move the primary CTA into the hamburger overlay** rather than
  cramming it into the bar. In the overlay, **scope the large link font to plain
  links**: a generic `.nav-overlay a { font-size: 2rem }` also blows up any `.btn`
  link — override `.nav-overlay a.btn` back to normal button sizing.
- **Logo aspect ratio.** Never force a non-square logo into square dimensions
  (it squishes). Fix only one dimension (`height` + `width:auto`) and set
  `object-fit: contain`. For a transparent landscape logo on a dark hero, present
  it on a compact white "plate" (padding + radius) that is **block-level**
  (`display:flex; width:fit-content`) so it sits on its own line instead of
  sharing a line with an adjacent inline eyebrow; keep it modestly sized and
  aligned with the surrounding text.
- **Hero scroll indicator.** Make it a real `<a href="#next-section">` (keyboard-
  reachable, `pointer-events:auto`), reserve bottom padding on the hero so it never
  overlaps the (possibly longer, localized) headline, and hide it on short/mobile
  viewports.
- **`position:sticky` inside CSS grid is confined to its grid area/row.** The
  pinned scrollytelling visual travels on desktop because its column spans the tall
  row; when you collapse to one column on mobile, a sticky **grid** item can't
  travel. Switch that container to **block flow** on mobile so the sticky visual
  pins across the whole section while the steps scroll beneath it.
- **Stat blocks stack, not inline.** Number and label are separate elements — make
  them block/column so the label sits **below** the number (don't leave them as
  inline spans), and keep the layout responsive (see §10 grid rule).

---

## 6. Motion system (the premium layer)

A cohesive, restrained motion language built on Lenis + GSAP. **Every feature
degrades gracefully** (§6.4).

### 6.1 Smooth scroll + GSAP sync (`smooth-scroll.js`)
Init Lenis (it drives the real window scroll, so native scroll events still fire
for the background and nav). When GSAP is present, drive Lenis from the GSAP
ticker and update ScrollTrigger on Lenis scroll so scroll-linked animations stay
in sync:

```js
if (typeof Lenis === 'undefined') return;
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var lenis = new Lenis({ duration:1.1, smoothWheel:true });
window.lenis = lenis;
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (t){ lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
} else { (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(); }
```
Also make in-page anchor links use `window.lenis.scrollTo(target, {offset:-navH})`
when Lenis is active, so it doesn't fight a hand-rolled scroll.

### 6.2 Scroll reveals + count-up (`motion.js`)
**Trigger reveals with `IntersectionObserver`, NOT scroll-scrubbed GSAP.** This
was learned the hard way: on touch devices Lenis runs in non-smooth mode and does
**not** drive `ScrollTrigger.update` during momentum/native scrolling, so
ScrollTrigger-gated reveals stay hidden until the scroll stops — content "pops in"
only when you lift your finger, and fast up-flicks show blank sections.
IntersectionObserver fires reliably during fast/native scroll and is far cheaper.

- **Reveals:** observe every `.reveal/.reveal-left/.reveal-right`; on intersect
  add `.visible` and `unobserve` (reveal once). Let **CSS** own the animation (the
  `.reveal → .visible` opacity/transform transition in `base.css`), reusing each
  element's inline `transition-delay` as the stagger. Do **not** put a blanket
  `will-change` on every reveal — pinning hundreds of GPU layers causes its own
  jank.
- **Count-up:** observe `[data-count]` elements; on intersect run one
  `requestAnimationFrame` tween, then `unobserve`.
- **Count-up must not clobber sibling markup.** `el.textContent = value` erases
  child nodes, so put `data-count` on a **dedicated inner element** and keep any
  prefix/suffix (`+`, `%`, currency) as a **separate sibling** — never inside the
  counting element.
- **Reduced-motion / no `IntersectionObserver`:** add `.visible` to all reveals
  and write final numbers immediately — content must never stay hidden.

GSAP is still loaded for **decorative, desktop-only** touches (e.g. kinetic type,
§6.3) that never gate content visibility, and Lenis still provides smooth desktop
scrolling. Do **not** rebuild reveals or count-up on GSAP.

### 6.3 Kinetic typography (`kinetic-typography.js`) & custom cursor (`cursor.js`)
- **Kinetic type:** split each `.hero-content h1` into words wrapped in
  overflow-hidden spans, then reveal word-by-word (GSAP `y:'105%'→'0%'` stagger).
  CSS-class fallback when GSAP/reduced-motion. Runs after i18n has populated text.
- **Custom cursor:** a lerp-follow gold circle that grows over interactive
  targets. **Desktop only** - bail out on touch, `maxTouchPoints`, reduced-
  motion, and viewports < 768px.

### 6.4 Graceful degradation (mandatory)
- `prefers-reduced-motion`: no smooth scroll, no reveals/parallax/cursor/kinetic
  motion; content shown immediately, counts run once statically.
- Library missing (Lenis/GSAP fails to load): fall back to native scroll and
  reveal all content immediately - **content must never be left hidden**.

### 6.5 Hero-visibility rule (learned the hard way)
Hero content is visible from the very top of the page. Do **not** attach a
scrubbed `autoAlpha`/opacity/visibility tween to load-animated hero content: at
scroll 0 GSAP freezes it at the captured (hidden) start and sets
`visibility:hidden`, so it only appears once you scroll. Let **CSS** own the hero
content entrance and keep the content crisp.

Also avoid scroll-scrubbed **blur/scale "exit"** effects and scroll-scrubbed
`background-position` **parallax** on the hero: both repaint large areas every
frame (visible jank on desktop and mobile), and users read the blur as the page
"losing focus." If you want depth, animate only a small decorative layer via
`transform`, and disable it under touch/reduced-motion. Keep hero content static.

### 6.6 The signature generative background (`roots-bg.js`)
The brand's most distinctive asset. Keep the *technique*; change the *motif*.

Technique: a fixed full-page `<canvas>` at `z-index:0`, `pointer-events:none`,
drawn with a **seeded PRNG** (deterministic art) in the brand accent color at low
alpha (~0.05–0.12) so it reads as texture. Build the drawing as a list of
**segments tagged with a normalized `[start,end]` position along the motif's
total growth length**; on pages with `data-roots-grow` (opt-in, disabled under
reduced-motion), reveal segments up to a **scroll-progress value** (smoothed with
a rAF lerp) so the motif *grows as you scroll* - partial segments drawn via curve
subdivision. Pages without the attribute (or reduced-motion) draw the full static
motif. Redraw/rebuild on debounced resize. Enable the grow attribute on **every
scrolling content page (not just Home)** so the signature motif animates
site-wide — do it consistently, not only on the landing page. Size the canvas to
the **viewport** (it is `position:fixed`), not the document height, or the drawing
stretches/distorts.

Choose a motif that means something for the brand and adapt it to the logo:

| Brand / industry      | Motif |
|-----------------------|-------|
| Restaurant (heritage) | Tree roots / branches (reference) |
| Bakery                | Drifting wheat, flour dust, dough swirls |
| Coffee shop           | Rising steam curls / bean contours |
| Spa / wellness        | Water ripples, leaves, breathing rings |
| Florist               | Growing vines and petals |
| Tech / SaaS           | Node-and-edge network / circuit traces |
| Law / finance         | Fine geometric lattice / pillars |
| Fitness               | Motion streaks / topographic contours |
| Hotel / travel        | Constellation map / horizon ridgelines |
| Music / studio        | Waveform / oscillating strings |

Keep content at `z-index:1+` above it. **Do not ship an unused alternate
background** (the reference repo still carries a legacy WebGL `shader.js` that no
page loads - do not replicate that).

---

## 7. Internationalization (optional, built-in)

The reference is bilingual English + Macedonian, but Macedonian was
client-specific. **Never hardcode Macedonian.** Primary = English; second
language = whatever the user specifies (French, Spanish, Arabic, …).

- `i18n.<lang>.js` defines `window.i18n_<lang> = { 'key.path':'text' }` - one file
  per language, real ISO codes.
- `i18n.js` engine: persists choice in `localStorage` (`<brand>_lang`), applies
  the active bundle to every `[data-i18n]` via `textContent`, swaps flag + label,
  sets `document.documentElement.lang`, exposes `toggleLang/getLang/setLang/
  applyBundle`, and calls optional `window.onLangChange(lang)` so dynamic pages
  re-render text without refetching.
- RTL second language (Arabic/Hebrew): also set `document.documentElement.dir='rtl'`
  for that language and verify the layout mirrors.
- Mark every visible string with `data-i18n` + a primary-language fallback.
  Dynamic content stores per-language fields in Firestore (`name_en`, `name_<lang>`,
  `description_en`, `description_<lang>`, …).
- **Font glyph coverage (critical, verify per language).** Confirm the chosen
  **display/heading** font actually contains every glyph the target language
  needs — including precomposed accented letters (e.g. Macedonian `ѝ` U+045D, `ѐ`
  U+0450, or other diacritics). If the font lacks a glyph, the browser synthesizes
  it or falls back and often renders a **detached/misplaced combining accent**.
  Many characterful "display" serifs have thin Cyrillic/accent coverage, so
  headings are where this bites. Test headings with real localized copy; pick a
  font with full coverage or reword to avoid the missing glyph. Load font
  subsets/`unicode-range` that include the needed scripts.
- **Language-toggle flags: never use emoji flags.** Emoji flag sequences (🇲🇰,
  🇬🇧) do **not** render on Windows (and some other platforms) — they show as bare
  letter pairs. Use small inline **SVG** flags or image files, swapped by the i18n
  engine (set an `<img src>`, not `textContent`).

Single-language sites: drop the toggle and extra bundles.

---

## 8. Firebase backend

### 8.1 `firebase-init.js` - PLACEHOLDERS only
```js
var firebaseConfig = { apiKey:"YOUR_API_KEY", authDomain:"YOUR_PROJECT.firebaseapp.com",
  projectId:"YOUR_PROJECT_ID", storageBucket:"YOUR_PROJECT.appspot.com",
  messagingSenderId:"YOUR_SENDER_ID", appId:"YOUR_APP_ID" };
firebase.initializeApp(firebaseConfig);
window.db = firebase.firestore(); window.auth = firebase.auth();
window.storage = firebase.storage(); // only if Storage is used
```
Load the compat SDKs in `<head>`, then `firebase-init.js`, then i18n. A web
`apiKey` is a public client id, not a secret - but still use placeholders and let
the user paste their own; never commit another project's real values.

### 8.2 Firestore data model (rename to the domain)
- `menu_categories`: `{ name_<lang>, order, image_url }`
- `menu_items`: `{ category_id, name_<lang>, description_<lang>, allergens_<lang>,
  price, order, image_url }`
- `promotions`: `{ title_<lang>, description_<lang>, active, image_url }`

`order` drives sort; `image_url` is a plain HTTPS URL (see §8.4).

### 8.3 `firestore.rules` - public read, authed write
```
rules_version = '2';
service cloud.firestore { match /databases/{db}/documents {
  match /{col}/{doc} { allow read: if true; allow write: if request.auth != null; }
}}
```
List collections explicitly for tighter control. **Flag to the user** that any
authenticated user can write; for stricter setups gate on a specific admin UID
(`request.auth.uid == "..."`) or a custom claim.

### 8.4 Images: Storage vs URL
Storage needs the paid **Blaze** plan. On the free **Spark** plan, use **image
URLs**: the admin takes an `image_url` field and the site renders it directly
(default; no `storage.rules` needed). Include `storage.rules` + the storage SDK
only on Blaze with direct uploads. Document the chosen approach in the README.

### 8.5 Admin (`admin.js`) & reservation (`<contact>.js`)
- Admin: `onAuthStateChanged` gate; email/password sign-in with friendly errors;
  tabbed CRUD (shared create/edit form via hidden id field); filter/sort tables;
  delete-confirm modal; toasts; deleting a category batch-deletes its items.
- **Empty-database UX + static fallback + auto-seed.** Ship a **static fallback
  dataset** (a `js/*-data.js` file mirroring the Firestore model) so the catalog
  is useful before any backend exists. Render **either** Firestore data **or** the
  fallback — never both (or items duplicate once the DB fills). A fresh, empty DB
  otherwise shows the admin nothing, which is confusing; on first admin login,
  **auto-seed** the collections from the fallback **only when empty** (idempotent:
  check `menu_categories` is empty first; write categories with deterministic doc
  IDs) so the CMS starts populated and the public catalog matches.
- Reservation: EmailJS via CDN with three **placeholder** constants
  (`EMAILJS_SERVICE_ID/TEMPLATE_ID/PUBLIC_KEY`). Multi-step wizard state machine
  (advance/back, per-step validation, choice chips for guests/time, a review
  summary), loading state, success/error banners, `emailjs.send(...)` mapping the
  fields (`from_name`, `email`, `phone`, `date`, `time`, `guests`, `message`),
  then `emailjs.init(PUBLIC_KEY)`. Messages in the active language.

---

## 9. JS conventions to reproduce

- `nav.js`: throttled scroll show/hide + progressive nav background/blur; builds
  the mobile overlay; focus trap + Esc; Lenis-aware smooth anchors; sets
  `#current-year`.
- `smooth-scroll.js`, `motion.js`, `kinetic-typography.js`, `cursor.js`,
  `roots-bg.js`: as specified in §6.
- `font-loading.js`: `fonts-loading` → detect via Font Loading API w/ timeout →
  `fonts-loaded`; CSS swaps serif fallbacks to web fonts (minimizes FOIT).
- `prefetch.js`: prefetch catalog collections into `sessionStorage` for instant
  catalog rendering.
- Wrap page scripts in `DOMContentLoaded`; load page JS with `defer`. Load
  library-dependent init (kinetic) after its library global is available.

---

## 10. Accessibility, performance & SEO checklist

- Semantic landmarks; one `<h1>`/page; logical headings.
- `aria-label`/`-labelledby` on controls/regions; `aria-live` for async; `aria-
  expanded`/`-controls` on accordions, hamburger, wizard steps; `role="progressbar"`
  on the reservation stepper.
- Visible `:focus-visible`; skip link; focus trap in modals/overlays; Esc closes.
- `prefers-reduced-motion` disables smooth scroll, reveals, parallax, kinetic
  type, cursor, and background motion (see §6.4).
- ≥44px touch targets on mobile.
- **Images & scroll performance.** Preload the LCP hero image with
  `<link rel="preload" as="image" fetchpriority="high">` — CSS `background-image`
  heroes are discovered late, so preload them explicitly. Give every `<img>`
  explicit dimensions or an `aspect-ratio`, `decoding="async"`, and a
  `background-color` on the image box so a slow/missing image never shows a broken
  void. **Do not** `loading="lazy"` above-the-fold or scroll-critical imagery — it
  causes decode "pop-in" during fast scroll; eager-load a modest, optimized set so
  it caches up front. **Never** use `background-attachment: fixed` (heavy
  scroll-repaint jank, worst on mobile). Avoid a blanket `will-change`.
- **No horizontal overflow.** Any grid with a fixed track minimum
  (`minmax(300px, 1fr)`) overflows viewports narrower than that track — always
  write `minmax(min(300px, 100%), 1fr)`. Confirm there is **no left/right scroll at
  320px** width.
- **Overflow clipping vs. sticky.** To contain stray horizontal overflow use
  `overflow-x: clip` on `html`/`body` — **not** `overflow-x: hidden`. Hidden turns
  an ancestor into a scroll container and **silently breaks every
  `position: sticky` descendant**; `clip` does not (its counterpart axis stays
  `visible` and it creates no scroll container).
- **`[hidden]` must actually hide** — add a global `[hidden]{display:none
  !important;}`; component `display:flex/grid` otherwise overrides it and leaves
  skeleton/error/empty states stacked under real content (§4).
- `preconnect` fonts; `font-display:swap`.
- Cache headers in `firebase.json`; `sessionStorage` for catalog data.
- Real `alt`; decorative SVGs `aria-hidden="true"`.
- **SEO:** per-page `<title>`; JSON-LD structured data appropriate to the domain
  (e.g. `Restaurant`, `LocalBusiness`, `Product`) in the home page `<head>`/end
  of `<body>`; meaningful link text.

---

## 11. Hosting config

`firebase.json`: `public:"."`, ignore config/docs (`firebase.json`, `.firebaserc`,
rules, `README.md`, `node_modules/**`, `**/.*`), SPA rewrite to `/index.html`,
and cache headers (js/css `max-age=3600`, assets `86400`, html `no-cache`).
`.firebaserc`: `{ "projects": { "default": "YOUR_PROJECT_ID" } }`.

---

## 12. README requirement (ALWAYS produce one)

Generate a client `README.md` in the user's language that gets a non-developer
fully live. Cover, with copy-paste commands: overview; **quick start**; local
preview (use a static server - `file://` breaks CDN/module behavior); create a
Firebase project; register a Web app → paste config into `firebase-init.js`;
enable Firestore + the data model; enable Auth (Email/Password) + **create the
admin user**; publish rules (`firebase deploy --only firestore:rules`) + the
read/write model; images (Spark URL vs Blaze Storage); EmailJS setup + the
template variables; content management via the admin panel; deploy
(`firebase deploy --only hosting`); custom domain; the **dependencies/motion
stack** (Lenis + GSAP via CDN, tracked in `package.json`); and troubleshooting
(blank page = config not pasted or `file://`; permission errors = rules/auth;
emails = EmailJS keys).

---

## 13. Delivery modes

- **In an agent/IDE:** create the full file tree, run a quick local check, and
  give the quick-start.
- **Chat-only (no agent):** generate **all** files and package them into a single
  downloadable **.zip** preserving the structure; if zipping is impossible,
  output each file in a clearly labeled code block with its full path.

---

## 14. Build order

1. Confirm context (§0); state palette, fonts, and background motif.
2. `base.css` tokens → `buttons/cards/nav/hero/footer` css.
3. Shared chrome + the motion/background stack: `nav.js`, `smooth-scroll.js`,
   `motion.js`, `kinetic-typography.js`, `cursor.js`, `roots-bg.js`,
   `font-loading.js`. Add `package.json` (lenis, gsap) and the CDN tags.
4. `index.html` + `home.css` + `home.js` (bespoke `hm-` sections, JSON-LD).
5. Catalog + admin (if backend): Firestore model, `firebase-init.js`
   (placeholders), admin, `<catalog>.js`, `prefetch.js`.
6. Contact/reservation (multi-step + EmailJS).
7. About (bespoke `ab-` sections + pinned scrollytelling + map).
8. i18n (if multilingual).
9. `firebase.json`, `.firebaserc`, `firestore.rules` (+ `storage.rules` if Blaze).
10. `README.md`.
11. **Verify — on a real page, at desktop *and* ~360px mobile widths:**
    - every `[data-i18n]` resolves; headings render all localized **accented
      glyphs** with no detached accents; language **flags render** (no emoji tofu);
    - hero content visible at the very top (§6.5); the hero logo/plate is placed
      cleanly and the scroll cue is clickable and never overlaps the headline;
    - reveals + count-up fire, **and still fire during fast/flung mobile scrolling**
      (IntersectionObserver, §6.2); count-up keeps its `+`/`%` suffix;
    - **no horizontal scrollbar at 320px**; `position:sticky` scrollytelling still
      pins (confirm the overflow guard used `clip`, not `hidden`, §10);
    - nav is legible and uncramped on mobile with the CTA in the overlay;
    - images preload without pop-in; no `background-attachment:fixed`;
    - skeleton/error/empty states disappear once content loads (`[hidden]`
      respected); the empty backend shows the **fallback**, not a crash or a
      duplicated list;
    - multi-step form validates; reduced-motion and no-library fallbacks reveal
      content; no dead/unused files shipped.

---

## 15. Anti-patterns (lessons from the reference)

- ❌ Reusing the gold palette, the "roots" motif, or Macedonian/restaurant copy.
  Re-theme everything.
- ❌ Scrubbing opacity/`autoAlpha` on load-animated hero content - it hides the
  hero until you scroll. Parallax the background instead (§6.5).
- ❌ Binding JS effects to classes the HTML doesn't render (an earlier build wired
  count-up to a non-existent `.about-stat-number`). Match real selectors and
  verify effects fire.
- ❌ Shipping dead/unused files (e.g. the orphan `shader.js`; the unused
  `styles.css` if you link individual sheets).
- ❌ Motion with no reduced-motion / no-library fallback - content can get stuck
  hidden.
- ❌ Hardcoding real Firebase keys - use placeholders.
- ❌ Referencing Storage on a Spark build - use image URLs.
- ❌ Collapsing the per-page/per-concern file split into monoliths.
- ❌ Gating content reveals on scroll-scrubbed GSAP/ScrollTrigger — they stall
  during momentum/native scroll (Lenis is non-smooth on touch) and leave content
  invisible until scrolling stops. Use IntersectionObserver (§6.2).
- ❌ `el.textContent = count` on an element that also holds a `+`/`%` suffix — it
  erases the suffix. Count on an inner element; keep suffixes as siblings.
- ❌ Emoji flags for the language toggle — they don't render on Windows. Use SVG.
- ❌ A display/heading font without full glyph coverage for the target language —
  accented letters render as detached combining marks. Verify or reword.
- ❌ `overflow-x: hidden` on `html`/`body` when the page uses `position: sticky` —
  it breaks sticky. Use `overflow-x: clip`.
- ❌ `minmax(300px, 1fr)` grid tracks — they overflow narrow phones. Use
  `minmax(min(300px, 100%), 1fr)`.
- ❌ Expecting `position: sticky` to travel across a multi-row CSS grid item — it's
  confined to its grid area; use block flow when single-column (§5.1).
- ❌ `background-attachment: fixed`, blanket `will-change`, or `loading="lazy"` on
  above-the-fold images — scroll jank / pop-in.
- ❌ Component classes (`display:flex`) overriding the `hidden` attribute so
  skeleton/error states never disappear. Add `[hidden]{display:none!important}`.
- ❌ Forcing a non-square logo into square dims (squished); a transparent logo with
  no plate on a busy hero (illegible); a fully transparent navbar over a hero
  (low contrast); a mobile nav bar crammed with the CTA instead of moving it into
  the overlay.
