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
  - gsap
  - scrolltrigger
  - lenis
  - smooth scroll
---

# Elegant Business Website Skill

This skill reproduces the architecture, design language, and feature set of a
high-end, dark-themed, multi-page marketing website - but **re-themed for each
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
5. **Logo** - provided file, or should you generate a simple SVG/text logo?
6. **The signature background motif.** This site's identity comes from a unique
   generative canvas background tied to the brand (the restaurant uses tree
   "roots" echoing its heritage logo). Propose a motif that fits the new brand
   (see §6) and confirm.
7. **Languages.** Single language or bilingual? If bilingual, **ask the user which
   second language they want** and use exactly that - do not assume Macedonian
   (that was only the reference client's language). The default primary language
   is English; the second language is whatever the user specifies (e.g. French,
   Spanish, Arabic, German). For a single-language site, just use the one language
   they ask for. The system supports easy i18n; default to a single language
   unless they want more.
8. **Backend needs.** Do they need a content-managed catalog + admin panel
   (Firestore + Auth), or is a static site enough? Do they need a working
   reservation/contact email (EmailJS)?
9. **Contact details** - address, phone, email, hours, social links, map location.

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
- **EmailJS** (CDN) for the reservation/contact form - no server required.
- **GSAP + ScrollTrigger** (CDN) for orchestrated scroll animations - replaces
  IntersectionObserver-based reveals with timeline-driven, scrubbed animations
  (parallax, hero exit transitions, stagger reveals).
- **Lenis** (CDN/npm) for smooth scrolling, integrated with GSAP's ticker so
  scroll-linked animations stay in sync with the smoothed scroll position.

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
│   ├── base.css            # design tokens, resets, typography, scrollbar hide
│   ├── nav.css
│   ├── hero.css
│   ├── buttons.css
│   ├── cards.css           # unified .content-card component system (banners, errors)
│   ├── footer.css
│   ├── home.css            # editorial .hm-* layout
│   ├── <catalog>-page.css
│   ├── <contact>.css       # multi-step reservation form
│   ├── about-page.css      # editorial .ab-* layout + heritage scrollytelling
│   └── admin.css
├── js/
│   ├── firebase-init.js    # config (PLACEHOLDERS) + db/auth/storage globals
│   ├── i18n.js             # engine
│   ├── i18n.<lang>.js      # one bundle per language
│   ├── nav.js              # sticky nav, mobile overlay, lang toggle, smooth scroll
│   ├── motion.js           # GSAP + ScrollTrigger reveals, parallax, hero exit,
│   │                       # count-up (replaces scroll-reveal.js)
│   ├── smooth-scroll.js    # Lenis smooth scroll, GSAP ticker integration
│   ├── kinetic-typography.js # word-by-word mask-reveal for hero headlines
│   ├── cursor.js           # custom gold-glow circle cursor (desktop only)
│   ├── bg.js               # the signature generative canvas background
│   ├── font-loading.js     # FOIT-avoidance font loader
│   ├── prefetch.js         # warms the catalog cache for instant nav
│   ├── home.js
│   ├── <catalog>.js        # accordion catalog from Firestore
│   ├── <contact>.js        # multi-step reservation with EmailJS
│   ├── about.js            # heritage scrollytelling step highlighting
│   └── admin.js
├── package.json            # dependencies: gsap, lenis
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
  /* Core surfaces - dark elegant by default. For a light/fresh brand,
     invert: light bg, dark text, but KEEP the token names. */
  --color-bg:            #111111;
  --color-surface:       #1e1e1e;
  --color-surface2:      #272727;
  --color-white:         #f5f0e8;   /* warm off-white text */

  /* Brand accent - derive from the client. Restaurant = gold #c9a84c.
     Bakery = warm caramel; Spa = sage/teal; Tech = electric blue, etc. */
  --color-primary:       #c9a84c;
  --color-primary-light: #e8c86a;
  --color-primary-dark:  #a8873c;

  /* Secondary accent - a complementary natural tone. */
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

  /* Typography - pair a characterful display serif with a clean sans. */
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;

  /* Type scale, spacing scale, radii, shadows, transitions, z-index -
     copy these verbatim; they are brand-neutral. */
  --text-xs:.75rem; --text-sm:.875rem; --text-base:1rem; --text-lg:1.125rem;
  --text-xl:1.25rem; --text-2xl:1.5rem; --text-3xl:1.875rem; --text-4xl:2.25rem;
  --text-5xl:3rem; --text-6xl:3.75rem; --text-7xl:4.5rem;
  --sp-1:.25rem; --sp-2:.5rem; --sp-3:.75rem; --sp-4:1rem; --sp-5:1.25rem;
  --sp-6:1.5rem; --sp-7:2rem; --sp-8:2.5rem; --sp-9:3rem; --sp-10:4rem;
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
- `box-sizing` reset, `html{font-size:16px;scroll-behavior:smooth;overflow-x:hidden;scrollbar-width:none}`
  (scrollbar hidden on desktop).
- Flex-column `body` with two faint radial-gradient brand washes in the background
  and `min-height:100dvh` for mobile viewport stability.
- Fluid headings via `clamp()`.
- `.reveal`, `.reveal-left`, `.reveal-right` scroll-reveal utilities + their
  `prefers-reduced-motion` reset.
- `.section-eyebrow` (uppercase, letter-spaced, primary-colored kicker label).
- `.custom-cursor` styling for the gold-glow circle cursor.

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

## 4. Component system (`cards.css` + editorial layouts)

The site has **two layout modes** that coexist:

### 4.1 Card system (`cards.css` - for admin, banners, errors, testimonials)

- `.content-card` - base surface: tinted border, hover lifts border to primary,
  an animated `::before` inset primary outline that fades in on hover.
- `.content-card-image` / `.content-card-body` - media + text regions.
- `.content-card-success` / `.content-card-error` - status banners.
- `.testimonial-card` - elegant card with quote mark, star row, border hover glow.
- Layout helpers: `.content-card-grid` (3-col→2→1), `.content-card-strip` (3-col→1).

### 4.2 Editorial layout (home.css, about-page.css - for main content)

For the primary pages (home, about), use the **editorial `.hm-*` / `.ab-*` system**:

- **Split sections** (`.hm-mission`, `.ab-intro`): 2-column image/text grid,
  rounded container, transparent backgrounds so the canvas shows through.
- **Stat strips** (`.hm-stats`, `.ab-stats`): 3-column number strip with
  count-up animation, translucent cells with golden border hover.
- **Pillar grids** (`.hm-pillars`, `.ab-pillars`): 3-column image+text grid,
  rounded cards, image zoom on hover, golden border hover.
- **Story blocks** (`.hm-story`, `.ab-story`): 2-column alternating
  image/text split sections, full height.
- **Heritage scrollytelling** (`.heritage-scroll`): centered motif + 2x2 grid
  of step cards with IntersectionObserver highlight.
- **Contact + map** (`.ab-contact`): side-by-side details and map embed.

All editorial sections use `width:80%; max-width:1400px; margin-inline:auto`
on desktop for breathing room, collapsing to full-width on mobile.

---

## 5. Page layouts (keep the pattern, vary the arrangement)

**Shared chrome on every page:**
- Fixed `.site-nav`: logo (links home), nav links with animated underline + active
  state, optional language toggle, hamburger → full-screen mobile overlay.
- `.site-footer`: brand, navigation (2-col grid on mobile), hours, contact,
  social links (filled Facebook/Instagram SVGs), copyright, credits, address
  as clickable Google Maps link.
- The generative canvas background (`bg.js`) injected behind everything.
- Custom gold-glow cursor (`cursor.js`) on desktop (non-touch only, disabled
  under `prefers-reduced-motion`).
- GSAP + Lenis for smooth scrolling and scroll-linked animations.
- Word-by-word kinetic typography reveal on hero headlines (`kinetic-typography.js`).
- Scrollbar hidden via CSS (`scrollbar-width:none`) on desktop.

**Home (`index.html`):** full-viewport hero (bg image + gradient overlay +
kinetic headline/subtitle/tagline + dual CTA + bouncing scroll chevron) →
mission split (text + image) → stats strip (count-up) → pillars 3-col grid →
alternating story blocks → minimal CTA band (no background image) →
testimonials grid (elegant quote cards) → optional dynamic promotions section.

**Catalog (`menu.html` etc.):** short hero → skeleton loader → error card →
accordion of categories (each header optionally uses a category image as
background) expanding to a responsive grid of item cards (image/placeholder,
name, description, optional allergens, price). Data from Firestore, cached
in `sessionStorage`, re-rendered on language switch.

**Contact/Reservation:** multi-step conversational flow — progress bar →
Step 1: Date → Step 2: Guest count selector → Step 3: Time slot grid →
Step 4: Contact details (name, phone, email, message) → Step 5: Summary → submit.
Validation per step, inline errors, EmailJS submission. Sticky contact card
sidebar. Page is fixed-height (`100vh`) with full static roots background
(no scroll-triggered growth). On mobile, allows scrolling and shows footer.

**About:** short hero → editorial intro split → stats strip → pillars grid →
alternating story blocks → heritage scrollytelling (centered motif + 2x2 step
cards) → contact details + map split. Same editorial 80% width system.

**Admin (`admin.html`):** login screen → tabbed panel (Categories / Items /
Promotions) with inline create/edit forms, tables with edit/delete, toggle
button shows "Activate"/"Deactivate" based on state, delete confirmation modal,
toast notifications.

---

## 6. The signature generative background (the unique part)

The reference site's identity is a **seeded, recursive canvas drawing** of tree
roots growing down the page - echoing the restaurant's heritage ("roots") theme
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
| Spa / wellness        | Flowing water ripples, leaves, or concentric rings         |
| Florist               | Growing vines and blooming petals                          |
| Tech / SaaS           | Node-and-edge network graph or subtle circuit traces       |
| Law / finance         | Fine geometric lattice / pillars                           |
| Fitness               | Dynamic motion streaks / topographic contours              |
| Hotel / travel        | Constellation map / horizon contour lines                  |
| Music / studio        | Waveform / oscillating string field                        |

Adapt the motif to the brand logo when possible.

### 6.1 Scroll-driven growth

The reference `roots-bg.js` supports two modes via `data-*` attributes on `<body>`:
- `data-roots-grow` — roots grow as the user scrolls down the page (home,
  catalog, about). Progress is smoothed with a lerp.
- `data-roots-full` (or no attribute) — draws the full static tree immediately
  (used on the fixed-height reservation page).

Both modes respect `prefers-reduced-motion`.

### 6.2 Reusable generator template (`bg.js`)

Use this scaffold and swap the `drawMotif` body for the chosen motif:

```js
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'site-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:1';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  function seededRng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;
    var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;};}

  var accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary').trim() || '#c9a84c';

  function drawMotif(rng, W, H) {
    // Replace with brand motif. Use ctx.strokeStyle with low alpha (0.05-0.12).
  }

  function render() {
    var W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    drawMotif(seededRng(0xA3F92C1B), W, H);
  }

  // Support scroll-growth: store segments, expose draw(p) and targetP()
  // See roots-bg.js for the full scroll-growth implementation.

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', render);
  else render();

  var t; window.addEventListener('resize', function(){ clearTimeout(t); t=setTimeout(render,150); });
})();
```

Notes:
- Keep stroke alpha low (≈0.05–0.12) so it reads as texture, not clutter.
- Content sections use transparent/semi-transparent backgrounds so the canvas
  shows through.
- Short-circuit under `prefers-reduced-motion`.
- **Do not ship unused background code.** (Remove any orphan files like `shader.js`.)

---

## 7. Internationalization

Same as the reference: `i18n.js` engine, one bundle per language, `data-i18n`
attributes, `window.onLangChange` hook for dynamic re-rendering. Never hardcode
Macedonian — use the client's chosen languages.

---

## 8. Firebase backend

### 8.1 `firebase-init.js`

Same as the reference: compat SDK from gstatic CDN, placeholder config.

### 8.2 Firestore data model

- `menu_categories`: `{ name_<lang>, order, image_url }`
- `menu_items`: `{ category_id, name_<lang>, description_<lang>,
  allergens_<lang>, price, order, image_url }`
- `promotions`: `{ title_<lang>, description_<lang>, active, image_url }`

### 8.3 `firestore.rules` - public read, authed write

Same as the reference.

### 8.4 Images / Storage

Same approach: HTTPS image URLs for free plan. Only include Storage if on Blaze.

### 8.5 Admin panel (`admin.js`)

Same CRUD pattern. Key difference: the promotion toggle button text dynamically
shows "Activate" (when inactive) or "Deactivate" (when active) via i18n keys
`admin.activate` / `admin.deactivate`.

### 8.6 Reservation via EmailJS (`<contact>.js`)

Multi-step conversational flow instead of a single form:
- Progress bar with 5 steps (Date → Guests → Time → Details → Confirm).
- Guest count uses pill button selector; time uses a clickable hour grid.
- Summary card on the final step before submission.
- Step-by-step validation with per-field errors.
- Same EmailJS integration with three placeholder constants.

---

## 9. JS conventions to reproduce

- `nav.js`: scroll-direction hide/show + progressive background/blur on the
  fixed nav (throttled), builds the mobile overlay, focus trap + Esc to close,
  smooth in-page anchor scrolling with easing, sets `#current-year`. Calls
  `updateMobileOverlayLang()` on language toggle to keep the overlay links in sync.
- `motion.js` (replaces the older `scroll-reveal.js`):
  - GSAP + ScrollTrigger-powered reveals (`autoAlpha`, `x`, `y`) for
    `.reveal`/`.reveal-left`/`.reveal-right`.
  - Hero parallax: background position shifts on scroll.
  - Hero exit transition: content scales down, blurs, and fades out as the next
    section rises over it.
  - Count-up animation (GSAP-scrubbed) for stat numbers. **Bind selectors to
    the classes you actually render** (e.g. `.hm-stat-number[data-count]`,
    `.ab-stat-number[data-count]`).
  - Gracefully degrades under `prefers-reduced-motion` or missing GSAP.
- `smooth-scroll.js`: Lenis smooth scroll, driven by GSAP's ticker when available.
  Disabled under `prefers-reduced-motion`.
- `kinetic-typography.js`: splits `h1` text into word spans with overflow-hidden
  wrappers, animates them with GSAP stagger (or CSS fallback). Fires immediately
  (no artificial delay).
- `cursor.js`: creates a single gold-glow circle (40px → 60px on hover) that
  follows the cursor with smooth interpolation. Desktop-only, disabled on touch
  devices, narrow viewports, and `prefers-reduced-motion`.
- `font-loading.js`: same FOIT-avoidance approach.
- `prefetch.js`: prefetches catalog data into `sessionStorage`.
- `about.js`: simple IntersectionObserver for heritage step highlighting (GSAP
  pinning was removed in favor of a simpler vertical layout).
- Wrap page scripts in `DOMContentLoaded`; load page JS with `defer`.

---

## 10. Accessibility & performance checklist

- Semantic landmarks, one `<h1>` per page, logical heading order.
- `aria-label`/`aria-labelledby` on interactive controls and regions; `aria-live`
  on async status; `aria-expanded`/`aria-controls` on accordions & hamburger.
- Visible `:focus-visible` outline; skip link; focus trap in overlays; Esc closes.
- `prefers-reduced-motion`: disable animations, reveals, parallax, GSAP, motion,
  custom cursor.
- Touch targets ≥ 44px on mobile.
- `loading="eager"` + preload for hero/logo; `loading="lazy"` + width/height +
  `decoding="async"` for the rest.
- `preconnect` to font origins; `font-display:swap`.
- `min-height:100dvh` on body for mobile viewport stability.
- Scrollbar hidden on desktop (`scrollbar-width:none`).
- Cache headers in `firebase.json`; `sessionStorage` for catalog data.

---

## 11. Hosting config

Same as the reference SPA-rewrite `firebase.json`.

---

## 12. README requirement (ALWAYS produce one)

Same structure as reference but updated for the current features:
1. Overview (editorial layout, multi-step reservation, GSAP motion, smooth scroll).
2. Local preview (`npx serve .`).
3. Firebase project creation + config paste.
4. Enable Firestore with data model.
5. Enable Auth + create admin user.
6. Publish security rules.
7. Images (URL approach on Spark).
8. EmailJS setup with template variables.
9. Content management via admin panel.
10. Deploy to Firebase Hosting.
11. Custom domain setup.
12. Troubleshooting.
13. Credits / license.

---

## 13. Delivery modes

Same as reference: file tools available → create tree directly; chat-only → zip.

---

## 14. Build order (recommended)

1. Confirm context (§0); state palette, fonts, and background motif chosen.
2. `base.css` tokens → `buttons.css`, `cards.css`, `nav.css`, `hero.css`,
   `footer.css`.
3. Shared chrome (nav + footer) and `nav.js`, `motion.js`, `smooth-scroll.js`,
   `kinetic-typography.js`, `cursor.js`, `font-loading.js`, `bg.js`.
4. `index.html` + `home.css` + `home.js`.
5. Catalog page + admin (if backend needed): Firestore model, `firebase-init.js`,
   `admin.html`/`admin.js`/`admin.css`, `<catalog>.js`, `prefetch.js`.
6. Contact/reservation page + EmailJS (multi-step flow).
7. About page + heritage scrollytelling + map.
8. i18n (if multilingual).
9. `firebase.json`, `.firebaserc`, `firestore.rules`.
10. `README.md`.
11. **Verify**: reveals/count-up selectors match HTML; multi-step form works;
    GSAP/Lenis degrade gracefully; reduced-motion disables animations;
    `data-roots-grow` vs `data-roots-full` correct per page; no dead files shipped.

---

## 15. Anti-patterns to avoid (lessons from the reference)

- ❌ Don't reuse the gold palette, the "roots" motif, or any Macedonian/
  restaurant copy. Re-theme everything.
- ❌ Don't bind JS effects to classes the HTML doesn't use.
- ❌ Don't ship unused files (e.g. orphan `shader.js` — remove it).
- ❌ Don't hardcode another project's real Firebase keys - use placeholders.
- ❌ Don't reference Storage on a Spark-plan build; use image URLs.
- ❌ Don't collapse per-file splits into monoliths.
- ❌ Don't leave unused helper functions/dead code in shipped JS.
