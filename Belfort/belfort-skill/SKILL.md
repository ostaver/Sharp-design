---
name: elegant-business-website
description: >
  Builds a polished, multi-page, bilingual-capable marketing website with a
  dark elegant aesthetic, a unique generative canvas background themed to the
  client's brand, a Firebase (Firestore + Auth) backend, an admin CMS panel,
  and an EmailJS-powered reservation/contact form. Produces vanilla
  HTML/CSS/JS with one file per page and per concern, plus a detailed README
  and Firebase hosting setup. Use when a user asks to build a restaurant,
  cafe, bakery, salon, studio, hotel, boutique, or similar
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
  - generative background
  - canvas animation
  - dark theme
---

# Elegant Business Website Skill

This skill reproduces the architecture, design language, and feature set of a
high-end, dark-themed, multi-page marketing website — but **re-themed for each
client**. The reference implementation is a Macedonian restaurant
("Amanet Gastro Point"). Your job is to keep the *patterns* (structure, motion,
component system, backend, accessibility) while reinventing the *surface*
(colors, fonts, imagery, the signature background motif, copy) to match the new
client's industry, brand, and context.

> Golden rule: **Same skeleton, new skin.** Never copy the restaurant's colors,
> "roots" motif, Macedonian copy, or content verbatim. Derive everything from
> the client's brand. Two sites built with this skill should never look like
> twins.

---

## 0. Before you build: clarify context

If the user's request is missing any of the following, **ask before generating**.
Ask all open questions in a single batch, keep it short, and offer sensible
defaults so the user can answer fast or say "use defaults".

Always try to determine:

1. **Business name + industry** (e.g. "Rustic Crumb, an artisan bakery").
2. **Primary goal / call-to-action** (book a table, request a quote, order online,
   contact, subscribe).
3. **Pages needed.** Default set: Home, Menu/Services/Catalog, Reservation/Contact,
   About. Adjust names to the industry (a bakery has "Products", a salon has
   "Services", a studio has "Portfolio").
4. **Brand colors** (or a mood: warm/earthy, cool/clinical, luxe/dark, fresh/pastel).
   If none given, pick a palette that fits the industry and state your choice.
5. **Logo** — provided file, or should you generate a simple SVG/text logo?
6. **The signature background motif.** This site's identity comes from a unique
   generative canvas background tied to the brand (the restaurant uses tree
   "roots" echoing its heritage logo). Propose a motif that fits the new brand
   (see §6) and confirm.
7. **Languages.** Single language or bilingual? If bilingual, **ask the user which
   second language they want** and use exactly that — do not assume Macedonian
   (that was only the reference client's language). The default primary language
   is English; the second language is whatever the user specifies (e.g. French,
   Spanish, Arabic, German). For a single-language site, just use the one language
   they ask for. The system supports easy i18n; default to a single language
   unless they want more.
8. **Backend needs.** Do they need a content-managed catalog + admin panel
   (Firestore + Auth), or is a static site enough? Do they need a working
   reservation/contact email (EmailJS)?
9. **Contact details** — address, phone, email, hours, social links, map location.

If the user explicitly says "just build it" or "use your judgment", proceed with
documented, industry-appropriate defaults and list the assumptions you made.

---

## 1. Tech stack & principles

- **Vanilla HTML + CSS + JS only.** No build step, no framework, no bundler.
- **One HTML file per page**, **one CSS file per concern/page**, **one JS file
  per page/concern**. Never merge everything into one file.
- **Progressive enhancement & graceful degradation**: the page must render and be
  readable if JS or the backend fails (skeletons, error cards, fallbacks).
- **Accessibility first**: semantic landmarks, ARIA labels, skip links, focus
  management, `prefers-reduced-motion`, 44px min touch targets.
- **Performance**: preconnect/preload fonts & hero, lazy-load below-the-fold
  images, `sessionStorage` caching of backend data, throttled scroll handlers.
- **Firebase** for dynamic content (Firestore), admin auth (Firebase Auth), and
  hosting. Use the **compat** SDK loaded from gstatic CDN (no npm).
- **EmailJS** (CDN) for the reservation/contact form — no server required.

---

## 2. File structure (replicate exactly)

```
project-root/
├── index.html              # Home
├── <catalog>.html          # menu.html / services.html / products.html ...
├── <contact>.html          # reservation.html / contact.html / booking.html
├── about.html
├── admin.html              # CMS panel (only if backend/catalog is needed)
├── assets/
│   ├── logo.(png|svg|webp)
│   ├── hero.(jpg|webp)
│   └── about-*.(jpg|webp)  # section imagery
├── css/
│   ├── base.css            # design tokens, resets, typography, reveal utils
│   ├── nav.css
│   ├── hero.css
│   ├── buttons.css
│   ├── cards.css           # the unified .content-card component system
│   ├── footer.css
│   ├── home.css
│   ├── <catalog>-page.css
│   ├── <contact>.css
│   ├── about-page.css
│   └── admin.css
├── js/
│   ├── firebase-init.js    # config (PLACEHOLDERS) + db/auth/storage globals
│   ├── i18n.js             # engine
│   ├── i18n.<lang>.js      # one bundle per language
│   ├── nav.js              # sticky nav, mobile overlay, lang toggle, smooth scroll
│   ├── scroll-reveal.js    # IntersectionObserver reveals + count-up + tilt
│   ├── bg.js               # the signature generative canvas background
│   ├── font-loading.js     # FOIT-avoidance font loader
│   ├── prefetch.js         # warms the catalog cache for instant nav
│   ├── home.js
│   ├── <catalog>.js
│   ├── <contact>.js
│   └── admin.js
├── firebase.json           # hosting config
├── .firebaserc             # project alias
├── firestore.rules
├── storage.rules           # only if Storage is used (see note)
└── README.md               # full setup + deploy guide (REQUIRED)
```

Rename `<catalog>`, `<contact>`, and `<lang>` to suit the client (e.g.
`menu`, `services`, `products`; `reservation`, `contact`, `booking`; `en`, `mk`,
`fr`). Keep the **separation of concerns** identical.

---

## 3. Design system (themeable tokens)

All visual identity lives in CSS custom properties in `base.css`. **Re-theme by
editing tokens, not components.** Keep the token *names*; change the *values* to
fit the brand.

### 3.1 Token contract (keep these variable names)

```css
:root {
  /* Core surfaces — dark elegant by default. For a light/fresh brand,
     invert: light bg, dark text, but KEEP the token names. */
  --color-bg:            #111111;
  --color-surface:       #1e1e1e;
  --color-surface2:      #272727;
  --color-white:         #f5f0e8;   /* warm off-white text */

  /* Brand accent — derive from the client. Restaurant = gold #c9a84c.
     Bakery = warm caramel; Spa = sage/teal; Tech = electric blue, etc. */
  --color-primary:       #c9a84c;
  --color-primary-light: #e8c86a;
  --color-primary-dark:  #a8873c;

  /* Secondary accent — a complementary natural tone. */
  --color-secondary:     #4a7c59;
  --color-secondary-light:#6aab7a;
  --color-secondary-dark:#325a40;

  /* Borders are tinted with the primary at low alpha (the signature glow). */
  --color-border:       rgba(201,168,76,0.18);
  --color-border-light: rgba(201,168,76,0.09);
  --color-border-dark:  rgba(201,168,76,0.28);

  --color-text:         #f5f0e8;
  --color-text-muted:   rgba(245,240,232,0.55);
  --color-text-inverse: #111111;
  --color-error:        #c0392b;
  --color-success:      #27ae60;

  /* Typography — pair a characterful display serif with a clean sans.
     Restaurant: Playfair Display + Inter. Choose a pairing that fits the
     brand: luxe=serif+sans; modern=geometric sans+grotesk; playful=rounded. */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;

  /* Type scale, spacing scale, radii, shadows, transitions, z-index —
     copy these verbatim; they are brand-neutral. */
  --text-xs:.75rem; --text-sm:.875rem; --text-base:1rem; --text-lg:1.125rem;
  --text-xl:1.25rem; --text-2xl:1.5rem; --text-3xl:1.875rem; --text-4xl:2.25rem;
  --text-5xl:3rem; --text-6xl:3.75rem; --text-7xl:4.5rem;
  --sp-1:.25rem; --sp-2:.5rem; --sp-3:.75rem; --sp-4:1rem; --sp-5:1.25rem;
  --sp-6:1.5rem; --sp-7:2rem; --sp-8:2.5rem; --sp-9:3rem; --sp-10:4rem;
  /* also expose --spacing-1..--spacing-13 as aliases used by some files */
  --radius-sm:.25rem; --radius-md:.5rem; --radius-lg:.75rem; --radius-xl:1rem;
  --radius-2xl:1.5rem; --radius-full:9999px;
  --shadow-sm:0 1px 3px rgba(0,0,0,.2); --shadow-md:0 4px 12px rgba(0,0,0,.25);
  --shadow-lg:0 8px 24px rgba(0,0,0,.3); --shadow-xl:0 16px 40px rgba(0,0,0,.35);
  --transition-fast:150ms ease; --transition-base:300ms ease;
  --transition-slow:500ms ease; --transition-bounce:400ms cubic-bezier(.34,1.56,.64,1);
  --z-fixed:1030; --z-modal:1040; /* etc. */
}
```

Also include the brand-neutral globals from the reference `base.css`:
- `box-sizing` reset, `html{font-size:16px;scroll-behavior:smooth;overflow-x:hidden}`,
  flex-column `body` with two faint radial-gradient brand washes in the background.
- Fluid headings via `clamp()`.
- `.sr-only`, `.skip-to-content`, `:focus-visible` outline using `--color-primary`.
- `.reveal`, `.reveal-left`, `.reveal-right` scroll-reveal utilities + their
  `prefers-reduced-motion` reset.
- `.section-eyebrow` (uppercase, letter-spaced, primary-colored kicker label).

### 3.2 How to derive a palette from a brand

1. Pick **one primary accent** from the brand (logo color, industry convention).
2. Generate `-light` (~+12% lightness) and `-dark` (~-12% lightness) variants.
3. Pick **one complementary secondary** for subtle gradients/accents.
4. Derive all borders as `rgba(<primary>, 0.09–0.28)` so the whole UI shares the
   accent's glow.
5. Choose bg mood: dark luxe (default) or a light variant. If light, set
   `--color-bg` light, `--color-text` dark, and reduce shadow strength.

State the palette and font pairing you chose and why, in one line, before building.

---

## 4. Component system (`cards.css`)

The entire site is built from **one unified card component** with modifiers.
Reproduce these classes; they are theme-neutral and drive visual consistency:

- `.content-card` — base surface: tinted border, hover lifts border to primary,
  an animated `::before` inset primary outline that fades in on hover, image zoom
  on `:hover .content-card-image img`.
- `.content-card-image` / `.content-card-body` — media + text regions.
- `.content-card-stats` — centered stat tile (`.stat-number` + `.stat-label`,
  optional `.stat-icon`). Used in the stats strip.
- `.content-card-story` (+ `.reverse`) — two-column image/text editorial block,
  alternating sides.
- `.content-card-success` / `.content-card-error` — status banners (icon + title + text).
- `.testimonial-card` — italic serif blockquote, star row, gradient top accent
  bar, `figcaption` with em-dash.
- Layout helpers: `.content-card-grid` (3-col→2→1), `.content-card-strip`
  (3-col stats→1).

Build every page from these instead of inventing new card styles.

---

## 5. Page layouts (keep the pattern, vary the arrangement)

Follow these patterns closely but **do not copy the exact section order or counts
verbatim** — vary arrangement so each site feels bespoke (e.g. move testimonials
above the CTA, use 4 stats instead of 3, swap a story block for a gallery).

**Shared chrome on every page:**
- `.skip-to-content` link first in `<body>`.
- Fixed `.site-nav`: logo (links home), nav links with animated underline + active
  state, optional language toggle, hamburger → full-screen mobile overlay.
- `.site-footer`: brand, navigation, hours, contact (with inline SVG icons),
  social links, copyright with auto-updated year (`#current-year`), credits.
- Mobile sticky CTA bar (`.mobile-reserve-bar`) linking to the primary action.
- The generative canvas background (`bg.js`) injected behind everything.

**Home (`index.html`):** full-viewport hero (bg image + gradient overlay +
animated headline/subtitle/tagline + dual CTA + bouncing scroll chevron) →
intro split (text + image, `reveal-left`/`reveal-right`) → stats strip
(count-up) → "pillars" 3-card grid → alternating story blocks →
parallax CTA band → testimonials grid → optional dynamic promotions section
(hidden until Firestore returns active rows).

**Catalog (`menu.html` etc.):** short hero → skeleton loader → error card →
accordion of categories (each header optionally uses a category image as
background) expanding to a responsive grid of item cards (image/placeholder,
name, description, optional allergens/tags, price). Data from Firestore, cached
in `sessionStorage`, re-rendered (not refetched) on language switch.

**Contact/Reservation:** two-column layout — validated form (icon-in-input
fields, inline errors, loading state, success/error banners) + sticky contact
card (address/phone/email/hours + call CTA). Submits via EmailJS.

**About:** hero → stats strip → pillars grid → alternating story blocks →
contact info strip → embedded map (`<iframe>` with text fallback).

**Admin (`admin.html`):** login screen (email/password) → tabbed panel
(Categories / Items / Promotions) with inline create/edit forms, sortable/
filterable tables, delete confirmation modal, and toast notifications.

---

## 6. The signature generative background (the unique part)

The reference site's identity is a **seeded, recursive canvas drawing** of tree
roots growing down the page — echoing the restaurant's heritage ("roots") theme
and logo. **This is the element you must reinvent per client.** Keep the
*technique* (a full-page fixed `<canvas>` at `z-index:0`, `pointer-events:none`,
drawn with a seeded PRNG so it's deterministic, low-opacity in the brand accent
color, redrawn on resize, respecting `prefers-reduced-motion`). Change the
*motif* to something meaningful for the brand:

| Brand / industry      | Suggested motif                                            |
|-----------------------|------------------------------------------------------------|
| Restaurant (heritage) | Tree roots / branches (the reference)                      |
| Bakery                | Drifting wheat stalks, flour dust, or swirling dough lines |
| Coffee shop           | Rising steam curls / coffee-bean contour field            |
| Spa / wellness        | Flowing water ripples, leaves, or breathing concentric rings|
| Florist               | Growing vines and blooming petals                          |
| Tech / SaaS           | Node-and-edge network graph or subtle circuit traces       |
| Law / finance         | Fine geometric lattice / pillars                           |
| Fitness               | Dynamic motion streaks / topographic contours              |
| Hotel / travel        | Constellation map / horizon contour lines                  |
| Music / studio        | Waveform / oscillating string field                        |

Adapt the motif to the brand logo when possible (if the logo is a leaf, grow
leaves; if it's a mountain, draw ridgelines).

### 6.1 Reusable generator template (`bg.js`)

Use this scaffold and swap the `drawMotif` body for the chosen motif. It keeps
the proven parts: seeded PRNG, fixed canvas, accent-colored low-alpha strokes,
debounced resize, reduced-motion guard.

```js
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // optional: still draw a static frame if you prefer

  var canvas = document.createElement('canvas');
  canvas.id = 'site-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:1';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  // Deterministic PRNG so the art is stable across reloads.
  function seededRng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;
    var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;};}

  // === SWAP THIS for the brand motif. Pull the accent color from the brand. ===
  // Read the CSS token so the art always matches the theme:
  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary').trim() || '#c9a84c';

  function drawMotif(rng, W, H) {
    // Example: recursive roots/branches (reference). Replace as needed.
    // Use ctx.strokeStyle with low alpha (e.g. 0.05–0.12) so content stays readable.
    // Keep recursion depth/branching modest for performance.
  }

  function render() {
    var W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    drawMotif(seededRng(0xA3F92C1B), W, H);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', render);
  else render();

  var t; window.addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(render,150); });
})();
```

Notes:
- Keep stroke alpha low (≈0.05–0.12) and color = the brand accent so it reads as
  texture, not clutter. Content sits at `z-index:1+` above it.
- If you want subtle motion, animate with `requestAnimationFrame`, but **always**
  short-circuit (or draw a single static frame) under `prefers-reduced-motion`.
- A WebGL fragment-shader gradient background is an acceptable alternative for
  abstract brands, but the seeded-canvas motif is the signature look — prefer it.
- **Do not ship dead background code.** (The reference repo includes an unused
  `shader.js`; do not replicate unused files.)

---

## 7. Internationalization (optional, but built-in)

The reference client was bilingual **English + Macedonian**, but Macedonian was
specific to that client. **Never hardcode Macedonian.** When a site is bilingual,
the primary language is **English** and the **second language is whatever the user
specifies** (French, Spanish, Arabic, German, etc.). Replace every Macedonian
string, bundle, locale code, and flag with the user's chosen language. If the user
wants a single language, build for that one language only and skip the toggle.

If the client wants more than one language:

- `i18n.<lang>.js` defines `window.i18n_<lang> = { 'key.path': 'text', ... }`,
  one file per language. Use real ISO codes for `<lang>` (e.g. `en`, `fr`, `es`,
  `ar`, `de`) — pick the codes from the languages the user actually requested.
- `i18n.js` engine: reads/writes `localStorage` (`<brand>_lang`), applies the
  active bundle to every `[data-i18n]` element via `textContent`, swaps the flag
  + label (use the correct country/region flag for the user's second language),
  sets `document.documentElement.lang`, exposes
  `window.toggleLang/getLang/setLang/applyBundle`, and calls an optional
  `window.onLangChange(lang)` hook so dynamic pages re-render text without
  refetching. The default/fallback language should match the client's primary
  market.
- For right-to-left second languages (e.g. Arabic, Hebrew), also set
  `document.documentElement.dir = 'rtl'` for that language and verify the layout
  mirrors correctly.
- Mark every visible string with `data-i18n="namespace.key"` and provide a
  human-readable fallback (in the primary language) as the element's default text.
- Dynamic content (catalog items, promotions) stores per-language fields in
  Firestore (`name_en`, `name_<lang>`, `description_en`, `description_<lang>`, ...)
  using the user's chosen language code, and the render function picks the field
  for the active language.

If single-language: skip the toggle and the extra bundles, but still keep copy in
one place where practical. Prefer the user's language for all UI and docs.

---

## 8. Firebase backend

### 8.1 `firebase-init.js` — config with PLACEHOLDERS (never real keys)

```js
/* SETUP: paste your config from Firebase Console > Project Settings >
   Your apps > SDK setup and configuration. */
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
window.db   = firebase.firestore();
window.auth = firebase.auth();
window.storage = firebase.storage(); // include only if Storage is used
```

Load the compat SDKs in `<head>` (app, auth, firestore, [storage]) from
`https://www.gstatic.com/firebasejs/9.22.2/...-compat.js`, then `firebase-init.js`,
then the i18n files.

> Note: a Firebase web `apiKey` is a public client identifier, not a secret —
> but still generate placeholders and let the user paste their own, and never
> commit another project's real values.

### 8.2 Firestore data model (adapt collection names to the domain)

- `menu_categories`: `{ name_<lang>, order, image_url }`
- `menu_items`: `{ category_id, name_<lang>, description_<lang>,
  allergens_<lang>, price, order, image_url }`
- `promotions`: `{ title_<lang>, description_<lang>, active, image_url }`

Rename to fit (e.g. `service_categories`/`services`, `products`, `offers`).
`order` drives sort; `image_url` is a plain HTTPS URL (see §8.4).

### 8.3 `firestore.rules` — public read, authed write

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{col}/{doc} {
      allow read: if true;                 // public site content
      allow write: if request.auth != null; // admins only
    }
  }
}
```

For tighter control, list each collection explicitly (as the reference does)
rather than a wildcard. **Flag to the user** that "any authenticated user can
write" — for stricter setups, gate writes on a specific admin UID or a custom
claim, e.g. `allow write: if request.auth.token.admin == true;`.

### 8.4 Images: Storage vs URL

Firebase **Storage requires the paid Blaze plan**. On the free **Spark plan**,
use **image URLs** instead: the admin panel takes an `image_url` field
(any HTTPS image / CDN link) and the site renders it directly. This is the
default and needs no `storage.rules`. Only include `storage.rules` and the
storage SDK if the user is on Blaze and wants direct uploads. Document the
chosen approach in the README.

### 8.5 Admin panel (`admin.js`)

- `auth.onAuthStateChanged` toggles login view vs panel.
- Email/password sign-in (`signInWithEmailAndPassword`), friendly error mapping,
  Enter-to-submit, sign-out.
- Tabbed CRUD (Categories / Items / Promotions): inline form (create + edit
  reuse the same form via a hidden id field), tables with edit/delete, category
  filter + order sort for items, auto-increment `order` for new items.
- Delete confirmation modal; toast notifications for success/error.
- Deleting a category batch-deletes its items.
- Link the admin page discreetly from the footer.

### 8.6 Reservation/contact via EmailJS (`<contact>.js`)

- Load `@emailjs/browser` from CDN. Keep three **placeholder** constants at the
  top: `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`.
- Client-side validation (required fields, email/phone regex, no past dates,
  guest range), inline per-field errors, emoji stripping, auto-expanding
  textarea, loading state on submit, success/error banners.
- `emailjs.send(...)` with the form fields; `emailjs.init(PUBLIC_KEY)`.
- Keep validation messages in the active language.

---

## 9. JS conventions to reproduce

- `nav.js`: scroll-direction hide/show + progressive background/blur on the
  fixed nav (throttled to ~16ms), builds the mobile overlay, focus trap + Esc to
  close, smooth in-page anchor scrolling with easing, sets `#current-year`.
- `scroll-reveal.js`: `IntersectionObserver` adds `.visible` to
  `.reveal/.reveal-left/.reveal-right`, then `.done` to drop the transition;
  count-up animation for stat numbers; optional 3D tilt on hover for cards.
  **Make selectors match your HTML.** (In the reference, the count-up targets
  `.about-stat-number` and tilt targets `.about-pillar`, but the markup uses
  `.stat-number` and `.content-card` — so neither effect fires. Bind to the
  classes you actually render, e.g. `.stat-number[data-count]` and
  `.content-card`, and verify the count-up runs.)
- `font-loading.js`: add `fonts-loading` class, detect load via the Font Loading
  API with a timeout fallback, then `fonts-loaded`; CSS swaps serif fallbacks to
  the web fonts to minimize FOIT.
- `prefetch.js`: on home/other pages, prefetch the catalog collections into
  `sessionStorage` so the catalog page renders instantly.
- Wrap page scripts in `DOMContentLoaded`; load page JS with `defer`.

---

## 10. Accessibility & performance checklist

- Semantic landmarks (`nav`, `main`, `section`, `article`, `footer`, `address`),
  one `<h1>` per page, logical heading order.
- `aria-label`/`aria-labelledby` on interactive controls and regions; `aria-live`
  on async status; `aria-expanded`/`aria-controls` on accordions & hamburger.
- Visible `:focus-visible` outline; skip link; focus trap in modals/overlays;
  Esc closes; return focus to trigger.
- `prefers-reduced-motion`: disable animations, reveals, parallax, bg motion.
- Touch targets ≥ 44px on mobile.
- `loading="eager"` + preload for hero/logo; `loading="lazy"` +
  width/height + `decoding="async"` for the rest.
- `preconnect` to font origins; `font-display:swap`.
- Cache headers in `firebase.json`; `sessionStorage` for catalog data.
- Provide real `alt` text; mark decorative SVGs `aria-hidden="true"`.

---

## 11. Hosting config

`firebase.json` (SPA-style rewrite to `index.html`, sensible cache headers,
ignore config/docs files):

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", ".firebaserc", "firestore.rules",
               "storage.rules", "README.md", "**/.*"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [
      { "source": "**/*.@(js|css)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }] },
      { "source": "assets/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }] },
      { "source": "**/*.html",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }] }
    ]
  }
}
```

`.firebaserc`:

```json
{ "projects": { "default": "YOUR_PROJECT_ID" } }
```

---

## 12. README requirement (ALWAYS produce one)

Generate a `README.md` for the client, written in the user's language, that lets
a non-developer get fully live. It MUST cover, with concrete commands:

1. **Overview** — what the site is, pages, features.
2. **Local preview** — e.g. `npx serve` or VS Code Live Server (note: opening
   `index.html` via `file://` breaks ES module/CDN behavior; use a local server).
3. **Create a Firebase project** — console.firebase.google.com → Add project.
4. **Register a Web app** → copy the config → paste into `js/firebase-init.js`.
5. **Enable Firestore** (production mode) and paste the data model; explain
   `order` and `image_url`.
6. **Enable Authentication** → Email/Password → **create the admin user**
   (Authentication → Users → Add user) so they can log into `admin.html`.
7. **Publish security rules** — `firestore.rules` (and `storage.rules` only if on
   Blaze). Explain the public-read / authed-write model and how to restrict
   writes to a specific admin UID/claim.
8. **Images** — explain the Spark-plan URL approach (or Storage on Blaze).
9. **EmailJS setup** — create account, add email service + template, copy
   Service ID / Template ID / Public Key into the contact JS, and list the
   template variables to map (`from_name`, `email`, `phone`, `date`, `time`,
   `guests`, `message`).
10. **Content management** — how to log in and use the admin panel.
11. **Deploy to Firebase Hosting**:
    ```
    npm install -g firebase-tools
    firebase login
    firebase use --add        # select your project
    firebase deploy --only hosting
    # deploy rules too:
    firebase deploy --only firestore:rules
    ```
12. **Custom domain** — pointer to Hosting → Add custom domain.
13. **Troubleshooting** — blank page (config not pasted), permission errors
    (rules/auth), CORS/file:// issues, emails not sending (EmailJS keys).
14. **Credits / license**.

Keep it skimmable: numbered steps, copy-paste code blocks, and a short
"first deploy in 10 minutes" quick-start at the top.

---

## 13. Delivery modes

- **Inside an agent/IDE (file tools available):** create the full file tree
  directly in the workspace, then run a quick local check, list the files, and
  give the user the quick-start.
- **No agent (chat-only / non-agentic use):** generate **all** files and package
  them into a single downloadable **.zip** preserving the structure above, and
  provide it to the user along with the README quick-start. Do not paste dozens
  of files inline when a zip is possible; if zipping is impossible in the
  environment, output each file in a clearly labeled, separate code block with
  its full path.

---

## 14. Build order (recommended)

1. Confirm context (§0); state palette, fonts, and background motif chosen.
2. `base.css` tokens → `buttons.css`, `cards.css`, `nav.css`, `hero.css`,
   `footer.css`.
3. Shared chrome (nav + footer) and `nav.js`, `scroll-reveal.js`,
   `font-loading.js`, `bg.js`.
4. `index.html` + `home.css` + `home.js`.
5. Catalog page + admin (if backend needed): Firestore model, `firebase-init.js`
   (placeholders), `admin.html`/`admin.js`/`admin.css`, `<catalog>.js`,
   `prefetch.js`.
6. Contact/reservation page + EmailJS.
7. About page + map.
8. i18n (if multilingual).
9. `firebase.json`, `.firebaserc`, `firestore.rules` (+ `storage.rules` if Blaze).
10. `README.md`.
11. **Verify**: every `[data-i18n]` resolves; reveals/count-up actually fire
    (check selectors!); forms validate; backend reads with empty data show the
    skeleton/empty state, not a crash; reduced-motion disables animation; no dead
    files shipped.

---

## 15. Anti-patterns to avoid (lessons from the reference)

- ❌ Don't reuse the gold palette, the "roots" motif, or any Macedonian/
  restaurant copy. Re-theme everything.
- ❌ Don't bind JS effects to classes the HTML doesn't use (the reference's
  count-up and tilt are wired to non-existent selectors and silently do nothing).
- ❌ Don't ship unused files (e.g. an orphan `shader.js`).
- ❌ Don't hardcode another project's real Firebase keys — use placeholders.
- ❌ Don't reference Storage on a Spark-plan build; use image URLs.
- ❌ Don't collapse the per-page/per-concern file split into monolith files.
- ❌ Don't leave unused helper functions/dead code in shipped JS.
