---
name: stackable-skill
title: design-stackable-live-event
description: A high-contrast editorial design language for live events, independent festivals, cultural programmes, and music-led campaigns. Use it for loud typographic compositions, poster-like color blocking, live schedule motion, and tactile interactions without copying a reference site's branding or layout.
---

# Stackable

You are designing in the Stackable language. This is not a page to copy. It is a system of visual pressure, typographic scale, and kinetic information design for cultural events. Outputs should feel physical, immediate, and distinctly authored—not like a ticketing product or a generic music-site theme.

## Core conviction

Stackable is loud, warm, and high-contrast. It combines fly-posted gig graphics with a well-run event board: oversized type, hard rules, vivid fields of color, and information that moves with purpose. The page should feel like it has volume before the user scrolls.

"Make the information hit like a poster."

Never:

- Reproduce a reference brand name, lineup, taglines, prices, dates, venue, copy, section sequence, or exact layout.
- Treat all content as cards. Dense programme data can be modular; narrative content should be typographic and open.
- Drift into glossy gradients, glass panels, soft shadows, rounded SaaS components, stock-festival imagery, or generic concert iconography.
- Make motion the only way to understand key information.

---

## Non-negotiable safety invariants

These specific failures have shipped in real Stackable builds. Preventing every one of them is mandatory. A build that exhibits any of these is broken no matter how good it looks, so treat this list as a hard gate before delivery.

1. **Content is never hidden by CSS alone.** Any `opacity: 0`, `visibility: hidden`, `clip`, or large offset used for a reveal must be applied only by JavaScript, and only after GSAP is confirmed loaded and `prefers-reduced-motion` is not set. The default document — no JavaScript, a failed CDN, reduced motion, or a thrown error — must render every heading, paragraph, hero line, programme tile, and control fully visible. Never ship a stylesheet where a reveal rule such as `.reveal { opacity: 0 }` applies unconditionally. This single mistake causes the "text/elements invisible" and "hero text invisible" failures.

2. **Reveals fire once and never reverse.** Scroll-triggered reveals must use a one-way trigger (`once: true`, or `toggleActions: "play none none none"`). Never use `scrub`, `toggleClass` that can remove the visible state, or reverse toggle actions for a content reveal — those make text vanish while scrolling. Every element that starts hidden must have a guaranteed, one-way path to its final visible state.

3. **Every reveal has a watchdog.** Add a load-time timeout that forces all reveal targets back to their visible state if motion setup has not completed. Content must never be able to get stuck hidden because a script errored, a CDN was slow, or a `ScrollTrigger` start never fired for an element already past the viewport.

4. **Native scrollbar stays visible until the custom rail is proven working.** Never hide the native scrollbar in base CSS or inline defaults. Hide it only by adding a JavaScript class after the desktop rail has initialized successfully. If JavaScript fails, the viewport is below desktop, or the rail is torn down, the native scrollbar must return. On desktop, never show a custom rail and a native scrollbar at the same time, and never end up with neither.

5. **The custom scroll rail is hidden by default and shown by JavaScript.** In base CSS the rail is `display: none`. It becomes visible only when desktop width, JavaScript, and a successful init are all true. A rail that renders before it works — or that shows alongside the native scrollbar — is the "both scrollbars visible" failure.

5a. **Invariants 4 and 5 are one CSS rule block, not two separate features.** Showing the rail and hiding the native scrollbar must be gated by the exact same class on `<html>` (e.g. `rail-ready`) and written together in the same place in the stylesheet. A build that adds `html.rail-ready .scroll-rail { display: block; }` but forgets the paired `html.rail-ready { scrollbar-width: none; }` / `::-webkit-scrollbar { width: 0; height: 0; }` rule — or vice versa — ships the "both scrollbars visible" failure while looking finished, because the rail itself renders correctly. Before delivery, grep the stylesheet for `scrollbar-width` and `::-webkit-scrollbar` and confirm both exist, are gated on the same class as the rail's `display: block`, and are absent from base CSS.

6. **Every control specifies its own text and background color at every state.** Never rely on inherited color for a button, link-button, or CTA on a colored surface. Each control sets both `background-color` and `color` explicitly for default, hover, focus-visible, and active. When a hover or active state swaps the background, it must restate the text color. Ink text on an ink background — or any same-token pair — is forbidden; it produces the "black button, black text" failure. Confirm the label is legible in every state.

---

## Voice

Write with direct, dry confidence. It should sound like a trusted local promoter or a sharp independent magazine, not a corporate campaign.

- Open with one clear proposition; avoid superlatives and vague lifestyle claims.
- Keep paragraphs short and operational. Let headings carry attitude.
- Make practical information concrete: what, when, where, access, format, and next step.
- Use playful friction sparingly—one wry observation can carry a section.
- Invent names and labels that suit the supplied context. Do not reuse reference wording.
- Prefer active, physical vocabulary: field, stage, set, night, gate, sound, route, weather, volume, crowd, after. Do not use "signal" as a generic substitute for biography, updates, atmosphere, or a section title.

---

## Composition

These are tendencies, not a fixed page recipe.

- **Hero:** use a near-viewport-height opening with an oversized multi-line proposition, a compact event stamp, and one unmissable next action. It should be off-balance or left-led rather than centered by default.
- **Hierarchy:** pair enormous display typography with compact uppercase metadata. Use scale and weight before decorative effects.
- **Section rhythm:** start from a warm paper or high-energy light field, then make decisive shifts into saturated and near-black sections. Separate acts with hard rules, not floating whitespace alone. A run of nearly identical dark panels is a failure.
- **Section headers:** use a large title with a small sequence number or category marker only where it improves orientation. Vary alignment, density, or the surrounding composition between sections; never stamp the same generic numbered-header block above every section.
- **Programme content:** present artists, speakers, films, or acts in a dense typographic grid. Allow deliberate rotation, differing tile colors, and a small index number, but maintain scanning order.
- **Event details:** use straightforward rows, simple cards, or comparison panels based on the content shape. Avoid repeating the same layout pattern twice in one page.
- **Footer:** end with a bold sign-off and compact utility navigation; it should feel like the bottom edge of a printed poster.

**Refuse:**

- A hero carousel.
- Rounded pills as the dominant interface shape.
- A rainbow of unrelated accents.
- Thin, low-contrast rules and timid typography.
- Decorative imagery that competes with the programme or primary action.

---

## Color

Stackable begins with a warm-paper base, near-black ink, and a small set of saturated print-poster colors. The default composition is light-led: paper or a high-energy light field opens the page, while near-black is a deliberate counterweight for one or two high-impact acts. Do not turn Stackable into a generic dark music theme unless the user explicitly requires a dark-first brand system. No theme toggle is required.

**Commitment level: screen print at noon.** Color blocks should be flat and confident. Use contrast to organize a page, not gradients.

Define semantic tokens on `:root`; do not scatter raw color literals through the stylesheet.

```css
:root {
  --ink: hsl(0 0% 5%);
  --paper: hsl(48 25% 94%);
  --acid: hsl(68 100% 62%);
  --hot: hsl(340 100% 62%);
  --electric: hsl(235 100% 58%);
  --line: var(--ink);
  --pad: clamp(1.25rem, 4vw, 3rem);
  --section-y: clamp(3.5rem, 7vw, 6rem);
}
```

Rules:

- Pick one yellow-green or electric warm light as the primary high-energy field, one hot accent, and optionally one saturated cool counterpoint. Retune their hue per project; preserve their contrast roles.
- Use `--ink` and `--paper` as the stable reading pair. Do not set small text in a light color on a hot saturated field without checking contrast.
- Restrict each major section to one dominant surface plus ink/paper. A new surface marks a new act in the page.
- Use color on numbers, underlines, status marks, active controls, and one featured option—not everywhere.
- Hover states may invert a surface or add a crisp offset shadow; use `0.2s–0.25s ease` transitions.
- Every button, link-button, and CTA must declare `background-color` and `color` together for its default, hover, focus-visible, and active states. A hover that changes the background must also restate the text color. Never let a control's text color equal its background (for example `--ink` on `--ink`, or a black CTA that inherits black text) — verify the label reads clearly on its own fill in every state.
- Under `prefers-contrast: more`, remove low-opacity text, strengthen outlines, and preserve ink/paper contrast.

---

## Typography

Use a two-font system: one compressed display face for force, one durable grotesk sans-serif for all reading and metadata.

- **Display:** choose a condensed or athletic family such as `Big Shoulders Display`, `Barlow Condensed`, `Archivo Narrow`, or `League Gothic`. Use it for hero lines, section titles, act names, prices, and oversized footer statements.
- **Utility sans:** choose `Archivo`, `Inter`, `IBM Plex Sans`, or `Manrope`. Use it for navigation, labels, descriptions, buttons, practical information, and small metadata.

Rules:

- Use no more than two font families and only the weights the page needs.
- Set display type in uppercase by default, with tight line-height around `0.95–1.02` and minimal tracking.
- Hero display type should use `clamp()` and occupy at least two lines when content permits; never force it to fit a single line on mobile.
- Metadata is compact, uppercase, bold, and visibly tracked. Keep it readable rather than microscopic.
- Pair oversized type with generous but intentional empty space; do not add decorative type treatments just because a heading is large.

---

## Motion

Motion is a Stackable baseline, not garnish. It is punchy, staged, and varied: the visitor should feel an authored opening, a clear scroll rhythm, and physical response from selected content. A single universal CSS fade-up is not a Stackable motion system.

### Required GSAP choreography

For a static HTML or client-rendered Stackable output, include GSAP and `ScrollTrigger` as the primary enhancement layer. Pin the library version in the project’s approved dependency mechanism or the page’s CDN URLs. Register the plugin only after both dependencies are available.

Build a composed choreography that fits the actual content. At minimum, it must include:

1. **Hero arrival:** a short timeline for the eyebrow/stamp, display headline, primary action, and one decorative hero element. Use different motion properties or timing for hierarchy; do not fade every item in identically.
2. **Section orientation:** section titles and category markers enter with a compact, directional treatment that supports the page’s reading flow.
3. **One content-specific sequence:** programme tiles, schedule entries, venue rows, access choices, or another actual content collection gets a deliberate stagger with a defined final resting state.
4. **Closing beat:** the footer statement or final action receives a distinct one-time entrance rather than reusing the standard reveal.

Use `transform`, `opacity`, and compositor-friendly properties. Character-level animation is allowed for short display text only; preserve the semantic source text and do not wrap entire paragraphs character by character. Keep animations brief, once-only by default, and use `ScrollTrigger` start positions that do not require pinning or trap focus.

This is progressive enhancement:

- Content is visible in its final state by default.
- Add an enhancement class before applying hidden starting states.
- If GSAP or `ScrollTrigger` cannot load, use a minimal `IntersectionObserver` fallback or show all content immediately.
- Under `prefers-reduced-motion: reduce`, do not create GSAP timelines or `ScrollTrigger` instances. Cancel existing enhancement work if the preference changes at runtime and render all elements at their final state.
- Never use GSAP merely to recreate the same identical fade on every section.

### Reveal safety pattern (mandatory)

Implement reveals so a hidden state can exist only while JavaScript is actively driving it. Prefer `gsap.from()` over a CSS-hidden class: with `gsap.from()` the element's authored state is its final visible state, so the DOM stays visible if the script never runs, the CDN fails, or reduced motion is set.

- Do not write an unconditional CSS rule that hides reveal targets. If you must use a CSS hidden class, it may only be added by JavaScript after the GSAP guard passes, every target must have a one-way path (observer or immediate) that removes it, and a timeout must strip it as a fallback.
- Guard the setup: if `window.gsap` or `window.ScrollTrigger` is absent, or `prefers-reduced-motion` is set, do not hide anything at all.
- Use once-only, non-reversing scroll triggers. Never `scrub` a content reveal.
- Tag every reveal target with a stable hook (e.g. `data-reveal`) so a single watchdog can force them all visible.
- Add a load-time watchdog that clears inline hidden styles if init has not completed, so content can never stay hidden.

Adapt the choreography and selectors to the real content; do not copy this shape verbatim:

    (function () {
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      var targets = document.querySelectorAll('[data-reveal]');
      function forceVisible() {
        targets.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; });
      }
      var ready = false;
      function init() {
        if (reduce || !window.gsap || !window.ScrollTrigger) { forceVisible(); return; }
        gsap.registerPlugin(ScrollTrigger);
        // hero timeline + per-section gsap.from(..., { scrollTrigger: { once: true } })
        ScrollTrigger.refresh();
        ready = true;
      }
      window.addEventListener('load', init);
      // watchdog: never let content stay hidden if init errored or stalled
      setTimeout(function () { if (!ready) forceVisible(); }, 3000);
      // if the preference flips at runtime, tear motion down and show everything
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
        if (e.matches && window.ScrollTrigger) {
          ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
          forceVisible();
        }
      });
    })();

### Allowed supporting interactions

Choose no more than two of these in addition to the GSAP baseline, and only when they serve the supplied content:

- **Kinetic headline:** a pointer, tap, and keyboard-accessible interaction affecting one word, type weight, or hero depth. Scope it to the hero; reset on leave and blur.
- **Desktop cursor dot:** a small follower on fine-pointer desktop devices only. Animate only while catching up to pointer movement; disable it for reduced motion and never let it obscure controls.
- **Depth scene:** a small number of hero layers can shift on pointer movement. Use transforms only, return to rest on leave, and disable it when reduced motion is requested.
- **Content-backed announcement rail:** allowed only when the supplied content includes genuine current status, changing set times, or time-sensitive updates. It must have a concrete label and a matching accessible static representation. Do not create a generic ticker, generic scrolling release list, or a section titled "Signal", "Live Signal", or equivalent filler.

### Scroll and reveal

- Initial reveal states may use a modest `opacity: 0` and `translateY(16px–28px)` only after enhancement is confirmed.
- Let GSAP establish differentiated final states for headings, collections, and the footer. CSS hover and focus transitions stay simple and local.
- Respect `prefers-reduced-motion: reduce`: disable GSAP movement, announcement rails, cursor effects, parallax, transitions, and smooth scrolling. Show all content immediately.

---

## Interaction and navigation

### Focus and accessibility

- Keep a visible, high-contrast `:focus-visible` outline with a clear offset. Never remove an outline without an equally apparent replacement.
- Provide a skip link and semantic `header`, named `nav`, `main`, and `footer` landmarks.
- Add `scroll-margin-top` to hash targets when navigation is fixed.
- Use actual links for destinations and explicit `type="button"` for buttons. A visual CTA must not silently do nothing.
- Ensure targets are at least 44×44 CSS pixels on touch devices.

### Navigation

**Desktop:** use a compact fixed header with a wordmark, a limited set of section links, and one visually inverse CTA. Link hover can be an expanding underline or color inversion.

**Mobile:** use a full-viewport, color-block menu rather than shrinking desktop navigation into cramped links.

- The menu trigger must have `aria-controls`, a state-specific accessible label, and accurate `aria-expanded`.
- While closed, remove menu links from the focus order with `inert` or an equivalent approach.
- On open, move focus into the menu and trap Tab/Shift+Tab within it; close on `Escape` no matter which menu child is focused; lock background scroll only while open. Restore focus to the trigger only when dismissing the menu, not when a navigation link takes the visitor to its destination.
- The overlay transition must not leave hidden links focusable. Test keyboard-only open, forward/backward tabbing, Escape dismissal, link selection, and breakpoint changes.

### Required desktop scroll sidebar

The Stackable desktop baseline includes a fixed, right-edge scroll sidebar. It is a small vertical navigation instrument: a dotted or ruled track, a proportional high-energy thumb, a percentage or position label, and markers aligned with the major page acts. It must be present from the desktop breakpoint upward and deliberately omitted below the tablet breakpoint and in print.

- Reserve its width in the fixed header, hero, sections, and footer so it never overlays primary reading content.
- Place it above ordinary page content but below the fixed header, menu overlay, skip link, and modal layers.
- Keep the Stackable ink/hot-accent palette constant. When it crosses a black or saturated section, give ink marks, labels, and the thumb border a narrow paper-colored keyline/backplate or halo. Do not recolor the sidebar by scroll position.
- Hide native scrollbars only after the enhanced desktop rail has initialized successfully. Retain the native browser scrollbar as the fallback when JavaScript, required APIs, or the desktop breakpoint are unavailable.
- Update geometry from `scroll`, `resize`, completed font loading, and `ResizeObserver`/relevant layout changes, coalesced into one `requestAnimationFrame`. Never poll document dimensions in a permanent frame loop.
- Make the thumb a real keyboard-operable control: `role="scrollbar"`, `tabindex="0"`, `aria-controls`, orientation, min/max/current values, and useful percentage text. Support Arrow keys, Page Up/Down, Home, and End. Pointer dragging and track clicking are enhancements, not the only controls.
- Keep the hit target comfortably larger than the visual thumb, preserve a visible focus ring, and use instant scrolling under reduced-motion preferences.

### Scrollbar visibility pattern (mandatory)

On desktop exactly one scrollbar shows — the custom rail — and the page must never be left with no scroll affordance. Two failures recur: both scrollbars visible (native was never hidden), and no usable scrollbar (native was hidden but the rail failed). This pattern prevents both.

Base CSS — no JavaScript state. Do not hide the native scrollbar here, and keep the rail hidden:

    .scroll-rail { display: none; }        /* rail hidden until proven working */
    /* never place scrollbar-hiding rules in base CSS */

Applied only after successful desktop init, gated by a class on the root element. Write this as one rule block and never split the rail's `display: block` from the native-scrollbar-hiding declarations — they must be added, reviewed, and removed together:

    html.rail-ready { scrollbar-width: none; }                 /* Firefox */
    html.rail-ready::-webkit-scrollbar { width: 0; height: 0; } /* WebKit  */
    html.rail-ready .scroll-rail { display: block; }

JavaScript contract:

- Add `rail-ready` to `<html>` only after all are true: the desktop media query matches, required APIs exist, and the rail has positioned itself once without throwing.
- Remove `rail-ready` on teardown — viewport drops below desktop, or any init error — so the native scrollbar returns immediately.
- Drive enable/disable from a `matchMedia('(min-width: 1024px)')` change listener. Never hide the native scrollbar at tablet or mobile widths.
- Never hide the native scrollbar in base CSS, an inline default, or before init runs.
- At the tablet/mobile breakpoint, explicitly restore native scrollbar behavior (`scrollbar-width: auto`, reset `::-webkit-scrollbar`) inside the same `max-width` media query that force-hides the rail. Do not rely solely on JS teardown timing to remove `rail-ready` before a resize-driven layout repaint.

**Self-check before shipping this feature:** search the final stylesheet for `scrollbar-width` and `-webkit-scrollbar`. If either is missing, the rail was implemented without its required scrollbar-hiding half and the build has the "both scrollbars visible" defect regardless of how correct the rail's own positioning code is.

---

## Content-led section roster

Use only the sections that answer a real visitor need. Four to seven distinct sections is typical; do not repeat a section type or add filler because a previous Stackable page used it.

- **Opening poster** — proposition, event stamp, primary action, and optional restrained depth scene.
- **Programme body** — acts, releases, sessions, films, speakers, or contributors shown in a content-specific grid, collage, or ledger with meaningful metadata.
- **Places / formats** — venue zones, stages, rooms, programme formats, or performance history; choose the semantic structure that fits the supplied subject.
- **Attendance / contact path** — passes, registration types, membership tiers, booking, press, or another genuine next action. Feature one option only when the content justifies it.
- **Field guide** — transport, access, weather, food, accessibility, technical requirements, or operational notes in clear rows.
- **Editorial context** — only when supplied content needs it: a short statement, release context, production note, or factual biography. Never label this section "Signal".
- **Closing poster** — sign-off, useful links, location/date reminder where relevant, and verified social/contact destinations.

An announcement rail is not a default section. Add one only for genuine updates or time-sensitive schedule content, and never use it as a generic scrolling list of names, releases, milestones, or decorative filler.

Always include actual operational information appropriate to the project. Do not invent critical claims such as capacity, accessibility provision, ticket availability, venue address, or dates when they were not supplied.

---

## Architecture and performance

Default to one self-contained HTML file for a promotional landing page. Use semantic HTML, inline CSS, and one JavaScript IIFE at the end of `body`.

- Load web fonts with `preconnect` and `display=swap`; include robust local fallbacks.
- Use CSS, inline SVG, and supplied assets before requesting decorative external imagery.
- Stackable’s GSAP/ScrollTrigger motion layer is required for JavaScript-capable static or client-rendered outputs. Pin its version and implement a non-library fallback that leaves content visible and usable.
- Do not include analytics, trackers, autoplaying audio, or unnecessary third-party widgets.
- Avoid layout reads in continuous loops. Batch scroll and resize work into one scheduled frame.
- Use `ResizeObserver` defensively for components whose dimensions affect custom positioning.
- Keep the first page usable if JavaScript or a CDN fails.

### HTML head and metadata

Every output includes:

- Charset, responsive viewport, title with a short proposition, concise description, and `theme-color`.
- Basic Open Graph title and description; add image, URL, and canonical tags only when verified values exist.
- A lightweight inline SVG favicon.
- Event JSON-LD and an add-to-calendar link only after the factual event details are available.

### Print

Include a print rule that hides navigation overlays, cursor effects, ticker motion, scroll rails, and decorative stickers; removes animation; forces dark text on white; and prevents major sections from splitting where practical.

---

## Completion checklist

Before delivering, verify:

- The output uses original copy, brand, colours, font pair, section order, and information architecture—not a reference page's literal details.
- Landmark structure and heading hierarchy are valid.
- All interactive controls work with keyboard and have visible focus.
- Mobile navigation has complete focus and Escape behavior.
- Core content remains visible without JavaScript and readable under reduced motion.
- No element is stuck hidden after load in any mode. Verify by scrolling top-to-bottom, by disabling JavaScript/blocking the GSAP CDN, and under reduced motion — every heading, hero line, paragraph, tile, and control is visible in all cases.
- Reveals fire once and do not reverse or vanish when scrolling back up.
- On desktop, exactly one scrollbar is visible (the custom rail); the native scrollbar returns whenever the rail is inactive, JavaScript fails, or the viewport is below desktop. The two are never visible together and never both absent.
- The stylesheet contains both halves of the scrollbar-visibility pattern gated on the same class: the rail's `display: block` rule and the native-scrollbar-hiding rule (`scrollbar-width: none` plus `::-webkit-scrollbar`). Confirm this by searching the CSS for `scrollbar-width` — a missing match means the native scrollbar was never hidden and the rail is shipping alongside it.
- Every control's label is legible against its own background in default, hover, focus-visible, and active states; no same-color text-on-fill controls (e.g. black text on a black button).
- Palette combinations pass contrast checks for their text size.
- The GSAP hero timeline, scroll-triggered content sequence, and closing beat are present, differentiated, and have a visible no-GSAP/reduced-motion final state.
- The required desktop scroll sidebar is keyboard-operable, has accurate position semantics, reserves layout space, and remains visible over paper, saturated, and black surfaces without changing its palette.
- No standalone generic ticker or section named "Signal", "Live Signal", or equivalent filler has been added. Any announcement rail is backed by real time-sensitive content and accessible static information.
- Desktop, tablet, narrow mobile, JavaScript-disabled, no-GSAP, reduced-motion, and `prefers-contrast: more` layouts have been checked.

---

## Delivery mandate

When this skill is activated, deliver a working product in the user's project. Do not stop at a moodboard, a section list, code fragments, a design critique, or a proposed implementation unless the user explicitly asks for one of those instead.

### Operating mode

1. **Inspect before building.** Read the relevant project structure, existing implementation, available assets, and repository instructions. Reuse the project’s compatible stack and conventions.
2. **Make a design decision.** Choose the page’s color-role arrangement, font pairing, information hierarchy, section sequence, and up to two signature interactions before editing. Keep these choices coherent through the whole output.
3. **Implement the whole route or page.** Create or update all necessary HTML, CSS, JavaScript, components, assets, and configuration. Do not leave primary sections as prose descriptions, TODOs, broken links, inert buttons, or pseudo-code.
4. **Finish integration.** Wire all supplied navigation, forms, ticket/registration actions, and data to their actual existing routes or handlers. If an endpoint or destination is truly unavailable, use an honest non-deceptive state that is visually complete and clearly identified.
5. **Validate.** Run the smallest relevant lint, typecheck, build, test, and diagnostics commands available in the repository. Inspect failures caused by the change and correct them before delivery.
6. **Report completion.** State the files changed, the visual/functional decisions made, and the exact validation that ran. Be concise, but do not claim validation that was not run.

### Do not ask avoidable questions

Proceed autonomously when the repository, request, or supplied assets provide enough information. Ask a focused question only when a missing decision would make the implementation factually wrong, destructive, unsafe, or impossible to integrate.

Do not ask the user to choose minor styling details. Make a strong choice within this language and implement it.

### Definition of done

A Stackable output is complete only when all applicable items below are true:

- The requested page, route, or component exists in the requested location and renders without an obvious broken state.
- The visual system is intentional at every viewport, not merely a desktop mock-up squeezed onto mobile; it opens light-led and uses dark surfaces as deliberate contrast, not a generic default.
- All supplied real content is represented; no supplied asset or required content area is silently discarded.
- The GSAP choreography and required desktop scroll sidebar are implemented with progressive fallbacks; a basic CSS reveal alone does not satisfy the Stackable baseline.
- Every visible control has a purposeful action, a disabled/explanatory state, or is removed. Decorative elements are not presented as controls.
- Layout, navigation, focus handling, and motion work without a mouse.
- The base experience remains legible if JavaScript, web fonts, a motion library, or a decorative asset fails.
- The work has been checked with project diagnostics and the most appropriate runnable validation.

---

## Build procedure

Use this procedure for every implementation, adapting it to the existing stack rather than forcing a new one.

### 1. Establish the content model

Identify the actual content objects before styling them: event identity, schedule/programme entries, venue or format descriptions, attendance options, visitor information, actions, and legal/utility links.

- Keep repeated data in a single source of truth where the stack allows it.
- Derive repeated visual views from that data rather than manually duplicating schedule entries, programme cards, or pass information.
- If the page is only a visual prototype, keep sample content compact and structurally realistic. Do not invent claims that appear factual.
- Do not hardcode arbitrary examples merely to fill a visual gap. Use supplied content, a neutral structural label, or ask only if the missing content blocks an essential interaction.

### 2. Build the semantic skeleton first

Create the reading order before styling:

```text
body
├── skip link
├── header
│   └── primary navigation
├── main
│   ├── hero
│   ├── programme or announcement region
│   └── selected event-information sections
└── footer
```

- Use one `h1`; maintain an unbroken hierarchy below it.
- Use `section` only for meaningful labelled regions.
- Use lists for lineups and repeated options, articles for independently meaningful cards, and definition lists for label/value event facts.
- Place the mobile menu in a logical navigation landmark even when it is visually an overlay.
- Keep decorative ticker duplicates, stickers, cursor layers, and depth planes out of the accessibility tree.

### 3. Set the visual system before local styling

Define tokens for all surfaces, text, accents, borders, typography, spacing, z-index layers, and header height. Use those tokens rather than introducing ad hoc declarations later.

- Use `clamp()` for page padding, major vertical spacing, hero type, and any display scale that must remain expressive on small screens.
- Establish the hard border thickness once and reuse it across sections, cards, controls, and information rows.
- Choose where the strongest color field appears. Reserve one inversion or featured treatment for the primary action or genuinely featured content.
- Use real CSS layout primitives—grid, flexbox, `minmax`, `gap`, logical properties, and container-aware sizing—rather than absolute positioning for ordinary content.

### 4. Implement responsive composition deliberately

Do not treat mobile as a compressed desktop layout.

- Start with content that can stack naturally and add density at larger breakpoints.
- At narrow widths, preserve display-type impact through line breaks, not overflow or tiny text.
- Turn multi-column programme, venue, and access layouts into readable one-column sequences when the content requires it.
- Hide only nonessential decoration at small widths; never hide a content-bearing control, key fact, date, location, price, access detail, or path to the primary action. Reflow secondary metadata beneath its title instead of using `display: none`.
- Ensure fixed headers, overlays, custom rails, and decorative depth effects do not cover or trap content.
- Test the smallest supported viewport for horizontal overflow, clipped focus rings, overlap, and unreachable controls.

### 5. Add enhancement in layers

Implement a clear non-JavaScript baseline first. Then add the required GSAP motion system and selected supporting interactions.

- Add a root enhancement class before applying any CSS that hides content for reveal animation.
- Load and register GSAP/ScrollTrigger defensively. Create the Stackable timelines only when both are available and reduced motion is not requested.
- Prefer CSS transitions for simple hover/focus states and native APIs for menu state, observers, and scroll position.
- A failed GSAP load must leave all content visible, navigation usable, and the page visually coherent; use a simple observer fallback only as degradation, never as the intended Stackable animation language.
- Scope pointer effects to their intended region. Do not attach costly pointer calculations to the entire document when a hero or button is the only target.
- Use `matchMedia` change listeners to create and tear down desktop-only behavior as the viewport/input capability changes.
- Never run an endless frame loop merely to poll scroll position or layout. Schedule updates from real events and stop effects when inactive or hidden.

### 6. Make all interaction states complete

For each link, button, disclosure, menu, draggable element, filter, or custom control, implement its default, hover, focus-visible, active, disabled, and reduced-motion behavior where applicable.

- Set both `background-color` and `color` on every control at each state; a state that changes the fill must restate the text color so the label never collapses into its background.
- Keep pointer flair secondary to a reliable click, tap, and keyboard action.
- Use native controls whenever their semantics match the task.
- If a custom component imitates a platform control, implement its expected keyboard operation and ARIA state fully; otherwise simplify it into a decorative element.
- Never use `href="#"` as a destination in a production-ready output.
- Do not add inline event attributes when the project supports normal event binding; keep behavior in the appropriate script or component.

### 7. Validate visual and technical quality

At minimum, check the following before declaring the work done:

- There are no diagnostics introduced by the edit.
- The page parses and the relevant script or typecheck succeeds.
- The requested target page loads with no obvious runtime exception.
- Fixed and overlay elements work at desktop and mobile widths.
- Keyboard users can reach the skip link, navigation, primary action, and all interactive controls in a sensible order.
- Reduced-motion settings remove both CSS and JavaScript movement, including smooth-scroll behavior.
- Text remains readable across every surface, especially ink marks and rails crossing dark sections.
- Every unique metadata value remains available on narrow screens; none has been removed merely to make a row fit.
- Page content is still usable with JavaScript disabled or external enhancement dependencies unavailable.
- The mobile menu has been tested for Tab/Shift+Tab containment, Escape dismissal, focus restoration, and no focusable hidden links.
- The hero, header, primary action, and scroll sidebar have been inspected together for overlap, focus-ring clipping, and z-index errors at each breakpoint.

If the project supports browser automation, use it for the main route and at least one narrow viewport. If it does not, run the available static checks and clearly state that visual browser validation was unavailable.

---

## Technical implementation patterns

Use these constraints to keep the language expressive without producing fragile code.

### Style architecture

- Keep CSS organized by tokens, global/base styles, page shell, component/section styles, responsive rules, then accessibility and print overrides.
- Do not use `!important` except for tightly scoped reduced-motion or no-script safety overrides that cannot be expressed otherwise.
- Avoid excessive inline styles. If one visual value must be data-driven, expose a CSS custom property rather than scattering style strings.
- Do not introduce raw color literals after the token layer. Define tokens for muted borders, subdued text, focus, overlay, and contrast keylines as well as main surfaces.
- Implement `prefers-contrast: more` with a token override: eliminate low-opacity essential text, harden borders, strengthen focus outlines, and preserve sidebar legibility.
- Prefer `transform` and `opacity` for motion. Avoid animating layout properties for decorative effects.
- Give all focusable elements enough outline offset that the Stackable’s hard borders do not obscure the focus treatment.

### JavaScript architecture

- Use a single small entry point per standalone page or the existing application entry point in a framework project.
- Guard every optional DOM query and third-party dependency. GSAP and `ScrollTrigger` are required Stackable enhancements when JavaScript is available, but their absence must activate the visible fallback—not throw or leave elements hidden.
- Store cleanup functions for media-query listeners, observers, pointer interactions, GSAP contexts/triggers, and animation frames when the stack has component lifecycle hooks.
- Scope GSAP selectors to the page/component root. Do not target broad selectors that can animate unrelated navigation, overlay, or injected content.
- Mark passive scrolling and pointer listeners passive unless they must call `preventDefault`.
- Treat all externally fetched or user-provided data as untrusted. Do not inject arbitrary strings with `innerHTML`.
- Update page-position or geometry components from `scroll`, `resize`, load/font completion, and observation events, coalesced through one frame.

### Asset policy

- Use user-supplied assets first.
- If no asset is supplied, create the visual energy through type, color, geometry, inline SVG, and CSS rather than fetching generic stock media.
- Do not invent external URLs, tracking pixels, social destinations, checkout links, or contact details.
- If an image is essential and a usable source is not provided, surface the missing requirement or use an explicit, elegant asset placeholder that cannot be mistaken for finished editorial content.

---

## Variation contract

The language must stay recognizable while every generated page remains original.

**Vary for each project:**

- Brand and all copy.
- The event’s information architecture and section order.
- Palette values within the high-contrast print-poster roles.
- Display/utility font pairing from the approved families.
- Hero line breaks, programme representation, spatial asymmetry, and the supporting interactions chosen beyond the required GSAP choreography and scroll sidebar.
- Component dimensions, card rotation, grid density, section backgrounds, and footer composition.

**Keep consistent:**

- Bold display-to-metadata hierarchy.
- Warm-paper/ink reading discipline with small, saturated color fields.
- Hard-edged structural rules and tactile offset interaction states.
- Accessibility-first base layer and progressive enhancement.
- GSAP-led motion that is short, purposeful, varied by content role, and fully disabled under reduced-motion preferences.
- The fixed desktop scroll sidebar, including its constant palette and contrast keyline behavior.
- A refusal of generic SaaS visual language and copied reference content.
