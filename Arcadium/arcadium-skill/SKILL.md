---
title: design-arcadium-arcade
description: "A dark coin-op arcade design language for arcades, game studios, retro events, and play-driven brands. The page arrives unpowered and boots when a coin goes in; a live WebGL ASCII ring-wave hero, a scroll-pinned hall of cabinets running text-mode attract loops, one genuinely playable ASCII game, a printed high-score ledger, and a fluid-simulated ASCII furnace. Vite + React 19 + TypeScript, animated with GSAP/ScrollTrigger and Lenis, with a WebAudio synth for every sound."
---

# Arcadium

You are designing in the Arcadium language. This is not a template to copy. It is a set of convictions, proportions, and taste lines that produce dark, tactile, playable pages. The output should feel unmistakably from the same language but never identical to a prior run.

## Core conviction

Arcadium runs on cabinet black lit by phosphor. **This is absolute — dark only, no theme toggle.** The aesthetic lives at the intersection of the coin-op arcade and the conservation archive: tactile, nocturnal, wry. Every detail is deliberate: a coin that flies into a slot measured off live geometry, cabinets that hum at their own pitch when their tube lights, a score sheet stamped by hand before it goes into the fire. "The site is the room."

The page is a machine, not a brochure about one. It arrives dead. Nothing happens until the visitor puts a coin in. After that, every section is something you walk past, press, play, or feed — never a picture of an arcade, always a working piece of one. If a section could be replaced by a screenshot without loss, it does not belong in this language.

Map the client's content onto the machine:

| Client content | Arcadium form |
|---|---|
| Brand arrival | Boot gate + powered hero |
| Projects, products, venues, games | Cabinets in the hall |
| Demo, trial, interactive proof | The one playable machine |
| Rankings, testimonials, changelog, records | The ledger printout |
| Closing time, archive, "what we let go" | The furnace |
| Pricing, membership, tickets | Tokens |
| Final CTA | Game over / continue |

Two things you must never do:

- **Do not reproduce the exact copy.** The brand name, tagline, cabinet names, lore, ledger rows, staff names, and section headers in any reference are specific to that page. Invent your own that match the voice.
- **Do not reproduce the exact layout.** A reference may run boot → hero → floor → play → ledger → furnace → tokens → game over. You may reorder the middle, add or remove from the approved roster, or vary the section count. Never repeat a section type within one page.

---

## Voice

The tone is dry, affectionate, and procedural. It borrows from arcade attract screens, operator manuals, museum conservation records, and the backs of coin doors. The writer speaks like a night-shift floor manager who has repaired every machine twice: no nostalgia syrup, no "relive the golden age", no exclamation marks.

**Rules:**

- State facts like a service log. The fiction is strange enough: "The torch flicker is a failing capacitor we refuse to replace."
- No marketing superlatives ("epic", "ultimate", "next-level", "immersive"). The machine is running; it does not need selling.
- Paragraphs are two to three sentences. Cabinet lore is one to two. Notes and HUD lines are one.
- Interface text is UPPERCASE machine speak: `INSERT COIN`, `PRESS SPACE TO SERVE`, `FILE YOUR INITIALS`, `STANDBY`, `CREDIT 01`, `SND:ON`. Prose is sentence case.
- Section transitions read like signage, not chapters: "The floor", "Closing time", "The change machine". Never "01 / Section".
- Every object has a status line in conservation language: `ORIGINAL PCB — PLAYS`, `CHARACTER FAULT — PLAYS`, `DO NOT REPAIR — PLAYS`.
- One dry joke per section, maximum, and always in a footnote position (a status, a floor note, a footer line): "41 MACHINES SAVED · 3 ON LOAN · 1 HAUNTED".
- Names, brands, and titles should feel like cabinet marquees and small operators (e.g., "Starlancer", "Graveyard Shift", "Depth Charge", "Kestrel Electronics", "Nightowl Amusements").
- Approved vocabulary blends arcade and archive: coin, credit, token, cabinet, marquee, attract mode, sheet, initials, ledger, tube, phosphor, bezel, board, relay, free play, verified, conserved, floor.
- Real titles only when they are genuinely real and correctly dated (e.g., Breakout — Atari, 1976). Everything else is invented; never attribute invented machines to real manufacturers.

---

## Composition

**Not a recipe, but tendencies:**

- **Hero:** full `100vh`, `min-height: 640px`, `overflow: hidden`. The ASCII wave fills it edge to edge. The title sits dead center over a dark radial scrim (`rgba(ink,.88)` to ~30%, transparent by ~78%) so the field reads around it, not through it. Corner HUD text top-left/top-right, a three-part HUD strip along the bottom.
- **Separators:** a single `1px solid var(--line-soft)` top border per section. Dashed rules (`1px dashed`) for machine-printed things — footer base, ledger rows, token stubs. Nothing else divides sections.
- **Spacing:** one horizontal token, `--pad: clamp(20px, 5vw, 72px)`, and one vertical token, `--py: clamp(90px, 12vh, 160px)`. Content max width `1480px`.
- **Backgrounds:** always `--ink`. A section may carry **one** faint radial light at 5–9% opacity in its own source color (the play section in signal color from the top, the furnace in orange from below, the floor in phosphor from below) — as if lit by what is inside it. Never a decorative gradient.
- **Headers:** section head is a flex row: left column = blinking-LED kicker + display h2; right column = a `.section-note` in the terminal face, uppercase, right-aligned, `max-width: 300px`. Headings are named places, never numbered.
- **Content:** alternates between prose-forward (lede + quote) and machine-forward (cabinet, game, printout, furnace). Two-column grids are asymmetric: `4fr / 5fr` or `5fr / 4fr`, collapsing to one column below 980px.
- **Data display:** numbers are printed ink or live game state. Scores are zero-padded (`000420`), credits are two-digit (`CREDIT 01`), prices are terminal type in token color. A number only changes because the visitor did something.

**Refuse (from the brief — these are hard bans):**

- Numbers that count up on scroll or load.
- Brand-logo marquees / scrolling logo strips. A marquee in Arcadium is a cabinet nameplate, physically part of the cabinet.
- Standard IntersectionObserver fade-and-rise reveals. Every entrance is a machine behavior (see Motion).
- Indexing sections or adding page numbers for no reason (`01`, `02 / 06`, `§3`).
- A loading screen with a percentage. There is no loader. The machine is off until a coin goes in.
- Generic soft glows and hover lifts: `box-shadow: 0 0 40px accent` on hover, `translateY(-4px)` cards, opacity-fade hovers.

**Refuse (to avoid the vibe-coded look):**

- Rounded SaaS cards with drop shadows, pill badges, glassmorphism panels, gradient text, purple-to-blue gradients.
- Icon libraries and emoji. Glyphs are typed characters (`▶ ▼ ● ○ » ▖ ᗧ ᗣ █ ▓ ▒ ░`) or CSS-built hardware.
- Stock photography and illustrations. Every visual is CSS hardware, canvas text, or WebGL.
- Marketing CTAs ("Get Started", "Book a Demo") and social-proof strips.
- Lorem ipsum, fake testimonials in quote cards, "Trusted by" rows.

---

## Color

Arcadium is a **single-theme system: dark only**. There is no theme toggle. The only light surface on the page is the ledger's thermal paper, which is an object in the room, not a theme.

**Commitment level: arcade floor at 1 a.m.** The room is near-black with a blue cast. Light comes only from things that emit it — screens, marquees, LEDs, the furnace — in three saturated hardware colors. Warm bone is the only text white.

**CSS custom properties — define these on `:root`:**

```css
:root {
  /* Surfaces */
  --ink:        #04050a;   /* the room */
  --panel:      #0a0c14;   /* token faces, plates */
  --panel-2:    #101322;   /* reverse faces */
  /* Text */
  --bone:       #ece9dd;   /* headlines, primary text */
  --bone-dim:   #b9bcae;   /* ledes, lists */
  --prose:      #a9ad9f;   /* body prose, lore */
  --dim:        #7b86a8;   /* HUD, notes, meta */
  /* Hardware light — three roles */
  --phosphor:   #00fff8;   /* screens, active states, kickers */
  --signal:     #ff2e7e;   /* player/danger, primary buttons, ghosts */
  --token:      #ffb000;   /* coins, credits, scores, prices */
  /* Lines */
  --line:       rgba(0, 255, 248, 0.16);
  --line-soft:  rgba(236, 233, 221, 0.09);
  /* Thermal paper (ledger only) */
  --paper:      #efe9d6;
  --paper-2:    #e6dfc7;
  --paper-ink:  #191a12;
  --paper-dim:  #5c5844;
  --stamp:      #b3302a;
  /* Structure */
  --font-pixel: "Silkscreen", "Courier New", monospace;
  --font-term:  "VT323", "Courier New", monospace;
  --font-body:  "Space Grotesk", system-ui, sans-serif;
  --pad:        clamp(20px, 5vw, 72px);
  --py:         clamp(90px, 12vh, 160px);
  --maxw:       1480px;
}
```

Use CSS variables for every color in the stylesheet; mix with `color-mix(in srgb, var(--x) N%, transparent)` rather than writing new rgba literals. Canvas and WebGL are the exception — they need literal strings — so **read the tokens once at mount** with `getComputedStyle(document.documentElement).getPropertyValue("--phosphor")` and pass them in. Never invent a canvas color that is not a token or a darkened step of one.

**Rules:**

- **Accent range:** three hardware roles, each saturated and emissive. Phosphor is a cool screen color (cyan `#00fff8`, green `#39ff88`, ice `#6ae4ff`, aqua `#00e5c3`). Signal is a hot pink-red (`#ff2e7e`, `#ff3b5c`, `#ff4fd8`, `#ff2a4d`). Token is a metallic warm (`#ffb000`, `#ffc23d`, `#ff9f1c`, `#f5c542`). Forbidden: pastels, browns, purples as a role, any desaturated accent, and any fourth accent.
- **Where each role appears:** phosphor — kickers and their LED, nav active/hover fill, sound toggle on, hero wave ink, terminal hints, focus outline, `::selection`. Signal — primary machine button face, joystick ball, nav `▶` pointer, custom cursor hot state, game-over text, bullets (`»`). Token — coins, credits, scores, prices, lede `<em>`, blockquote rule, amber button face.
- **Per-cabinet accent:** each cabinet sets its own `--accent` inline from a curated set (the three roles plus one or two tints like `#00c9a8`, `#ff7b3a`, `#eafffd`). The marquee, year, status stamp, light cone, and floor reflection all derive from it.
- **Light is physical.** The only glows permitted come from emitters: a lit marquee's `box-shadow: 0 0 34px color-mix(accent 45%)`, the screen's light cone and floor reflection, LED kickers, the coin slot's inner glow. Nothing glows because it was hovered.
- **Chromatic misconvergence** on display type only: `text-shadow: 4px 0 0 rgba(signal,.28), -4px 0 0 rgba(phosphor,.28)` (3px on the footer). It is a CRT convergence fault, never a blur glow.
- `::selection { background: var(--phosphor); color: var(--ink); }`. Scrollbar: `scrollbar-color: var(--phosphor) var(--ink)`.
- All `color` / `background` transitions are `0.12s linear` — hardware switches, not fades.
- Respect `prefers-contrast: more`: `--dim` → `#b4bdd6`, `--prose` → `--bone`, `--line-soft` → `rgba(236,233,221,.3)`, remove the CRT scanline overlay and vignette, focus outline `3px`.
- **Vary the triad between projects** within the ranges above. Never ship the same phosphor/signal/token triad twice in a row.

---

## Typography

This is a **three-font system**: a pixel face for the machine's voice, a terminal face for everything the machine prints, and a grotesk for the humans who write about it.

**Pixel (display):** `Silkscreen` (Google Fonts, weights 400, 700). Used for the hero title, section h2s, cabinet marquees and plates, button labels, token names, footer "GAME OVER", nav brand.

**Terminal (machine print):** `VT323` (Google Fonts, 400). Used for kickers, nav links, HUD, section notes, spec lines, statuses, ledger printout, controls lists, all canvas text (cabinet screens, game, flame).

**Body (human prose):** `Space Grotesk` (Google Fonts, weights 400, 500, 700). Used for ledes, lore paragraphs, play-copy prose.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=VT323&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
```

**Scale (pixel display):**

- Hero title: `clamp(52px, 11.5vw, 190px)`, weight 700, uppercase, `line-height: .95`, `letter-spacing: .01em`
- Footer "GAME OVER": `clamp(58px, 13vw, 210px)`, weight 700, `line-height: .9`
- Section h2: `clamp(38px, 6.4vw, 96px)`, weight 700, `white-space: pre-line` (lets `data-text` carry `\n`)
- Floor h2 (inside the pin): `clamp(30px, 4.6vw, 68px)`
- Boot prompt: `clamp(22px, 3.4vw, 44px)`, blinking
- Sub-heads (play copy, token names): `clamp(18px, 2vw, 28px)`; marquee `13px`; buttons `14px`, `letter-spacing: .06em`

**Terminal rhythm:**

| Element | Size | Weight | Spacing | Case |
|---|---|---|---|---|
| Kicker | `clamp(18px, 1.6vw, 22px)` | 400 | `.14em` | upper |
| Nav link / HUD / section note | `19px` | 400 | `.10em`–`.14em` | upper |
| Hero sub | `clamp(19px, 2vw, 26px)` | 400 | `.08em` | upper |
| Spec / status / hint | `16px`–`18px` | 400 | `.12em`–`.20em` | upper |
| Ledger table | `21px` (head `17px`) | 400 | `.08em` (head `.2em`) | upper |
| Blockquote | `clamp(21px, 2vw, 26px)` | 400 | `.04em` | — |

**Body:** `16px` base, `line-height: 1.6`; ledes `clamp(15px, 1.25vw, 18px)`, `max-width: 56ch`; lore `14.5px`, `line-height: 1.55`.

**Rules:**

- Never introduce a fourth font. No icon fonts.
- Load only the weights listed — five variants total.
- Pixel and terminal faces are always uppercase; the grotesk never is.
- Pixel headline letter-spacing stays near zero (`0`–`.04em`); terminal type always runs loose (`.08em`–`.28em`). The contrast is the texture.
- Canvas text uses the terminal face, set as `${Math.floor(cellHeight)}px "<terminal font>", monospace`, and must wait for `document.fonts.ready` before its first measured paint (or repaint on `document.fonts` `loadingdone`).
- **Vary the fonts between projects** from the approved lists: pixel — `Silkscreen`, `Press Start 2P`, `Pixelify Sans`, `Tiny5`, `Jersey 10`; terminal — `VT323`, `Share Tech Mono`, `Space Mono`, `Martian Mono`; body — `Space Grotesk`, `Chakra Petch`, `Rubik`, `Sora`. Press Start 2P runs wide: drop its display clamps by ~30%.

---

## Motion

Motion in Arcadium is **mechanical, stepped, and caused**. Things switch on, snap, feed, flicker, and jolt — the way hardware does. Loops are stepped like hardware (`steps(1)`, `steps(2)`), and nothing moves unless it is powered, played, or passed.

**Libraries:** GSAP 3.13 (core + `ScrollTrigger`), Lenis 1.3 for smooth scroll, Three.js 0.180 for the hero field. Register ScrollTrigger once per module that uses it.

**Scroll plumbing (in `App.tsx`):**

```ts
const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.05 });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

Skip Lenis entirely under reduced motion. Until the coin lands, `body.locked { overflow: hidden; height: 100vh }` and `lenis.stop()`; after boot, `lenis.start()`.

### Signature feature 1: the boot gate (insert coin)

The first screen is a dead machine: a dim brand line (pixel, `letter-spacing: .42em`), a blinking `INSERT COIN` prompt, and a CSS-built **coin door** (`148×210px`, beveled dark gradient, two screw heads via `::before/::after`, a lit vertical slot with a faint phosphor inner glow, a denomination label in token color, a reject button, and a return cup). Beneath it: `CLICK THE DOOR OR PRESS [C]`.

- The door is `role="button" tabIndex={0}` with `aria-label="Insert coin to power on …"`, fires on click, Enter, Space, and a global `C` key while unbooted.
- **Coin flight** is a three-stage GSAP timeline measured from live `getBoundingClientRect()`s so it lands in the slot at any viewport size: rise-and-arc toward the slot (`0.34s power2.out`, rotate to 420°), drop into the slot (`0.30s power2.in`, rotate to 720°), vanish (`0.14s`, scale `.3`, opacity 0, `sfx.clunk()` on start). The coin is a CSS radial-gradient disc in token color with its value printed on it.
- **Power-on** runs off one timeline: a full-screen `.crt-flash` (`#eafffd`) opens from `scaleY(.004)` to `1` (`0.22s power3.out`) then fades (`0.45s`); the hero **degausses** from `filter: hue-rotate(40deg) saturate(3); scale: 1.015` back to normal with `elastic.out(1, .4)` over `0.9s` — the **only** elastic ease in the language; the field's `uPower` ramps `0 → .82` over `1.6s power2.inOut`; the boot layer fades out (`0.35s`) and becomes `visibility: hidden`; at `0.55s` the title and sub **decode**; at `1.25s` the HUD and corners fade in with `0.08s` stagger.
- Credits go `00 → 01` in the nav when the coin lands. Main content carries `aria-hidden` until booted.

### Signature feature 2: the ASCII wave field (required main effect)

Use `effects/AsciiWave.tsx` from this skill folder **verbatim**. It is a Three.js full-screen quad whose fragment shader tiles the canvas into cells, picks one of 11 hand-drawn 4×6 bitmap glyphs per cell from an expanding sine ring wave centred on the screen, and swells/whites-out the glyphs around the pointer.

- Props: `ink`, `lit`, `cell` (8–60), `rings` (1–20), `speed` (0–20), `swell`, `warp`, `radius` (40–400), `weight`. Reference tuning: `cell={26} rings={14} speed={6}`, `ink` = phosphor, `lit` = `#ffffff`.
- Handle: `setPower(0..1)` drives the `uPower` uniform. It starts at `0` (dark), is ramped by the coin timeline, and is flickered `1 → .15 → 1` (`0.18s`, yoyo) on "continue".
- Pointer is eased at `1 - exp(-dt * 8.5)`, hold at `1 - exp(-dt * 5)`; `dt` is clamped to `50ms`.
- Built-in guardrails you must keep: DPR capped at 2; construction wrapped in `try/catch` (fail silently — the hero stays a dark room with its title); `ResizeObserver` sizing; `webglcontextlost` (preventDefault + stop loop) / `webglcontextrestored` (restart); full disposal on unmount.
- The container has `role="img"` and an `aria-label` describing the field.
- **Vary between builds:** ink hue (always the build's phosphor), `cell` 20–30, `rings` 10–18, `speed` 4–8. Never change the glyph table, the ring-wave math, or the power ramp.

### Signature feature 3: the hall of cabinets (pinned horizontal walk)

Scrolling walks sideways down a dark hall. The floor section pins for exactly the track's overflow.

```ts
const tween = gsap.to(track, {
  x: () => -(track.scrollWidth - pin.clientWidth),
  ease: "none",
  scrollTrigger: { trigger: pin, start: "top top",
    end: () => `+=${track.scrollWidth - pin.clientWidth}`,
    pin: true, scrub: 0.6, invalidateOnRefresh: true },
});
```

- **Progress-driven work runs on `gsap.ticker`, reading `tween.progress()` and live rects** — never in `onUpdate` — so nothing lags the scrub. Refresh ScrollTrigger ~400ms after mount for late fonts.
- **Cabinet lighting:** a cabinet lights once when its center enters `10%–95%` of the viewport width: add `.is-lit`, play `sfx.ignite(index, pan)` where pan is its horizontal position (`-.7..+.7`) — each machine hums at its own pitch from where it stands.
- **Lit sequence (CSS, stepped):** screen `tube-on` (0.85s `steps(1)` opacity stutter), marquee `tube-on` then a `marquee-hum` brightness wobble (`3.4s steps(2) infinite`), joystick idles (`rotate(-4deg ↔ 5deg)`), button 1 mashes (`1.7s steps(2)`), the `STANDBY` cover fades, light cone and floor reflection fade in. Unlit cabinets sit at `saturate(.92)`.
- **Pac-line progress:** a row of ~26 token-color dots bottom-centre; a `ᗧ/ᗤ` eater moves `p * width` and eats dots `i < floor(p * N)`; two ghosts (`ᗣ ᗥ ᗤ ᗦ`, signal and phosphor) trail at `-44px` / `-88px` bobbing on their own sines. The last dot is a blinking power pellet; at `p ≥ .99` the eaten dots flash phosphor/token (`steps(2)`) and `sfx.pellet()` fires; it re-arms below `.9`. Hidden below 760px.
- **Depth:** a perspective wire floor (`repeating-linear-gradient` grid in phosphor at 13%, `perspective(420px) rotateX(58deg)`, masked to fade in from the horizon), five dust motes (1px radial gradients), and a foreground silhouette layer (stools, a plant, a bin in near-black) parallaxing at `x = p * -0.35 * innerWidth`.
- **Coin doors reject you:** clicking a cabinet's coin door shakes it (`x: -3 → 0`, `0.09s`, 3 yoyo repeats) with `sfx.reject()`.
- **Hover:** the tube glitches once (`clip-path` slice + `translateX ±3px` + hue shift, `0.32s steps(2)`) and the marquee brightens to `1.22`. That is the entire hover vocabulary.
- An endcap closes the row in terminal type ("END OF ROW A ▖ ROW B IS IN THE BASEMENT").
- **Reduced motion:** no pin; the track becomes a native `overflow-x: auto` scroller with `height: auto`, and every cabinet renders lit.

### Signature feature 4: text-mode attract screens

Each cabinet screen is one `<canvas>` painting a hand-written attract loop as **characters on a 34×25 cell grid at a chunky 11fps** (skip frames closer than 90ms). Painters are pure functions `(ctx, cw, ch, t) => void`: fill the screen dark, then `fillText` glyphs at `floor(x) * cw, floor(y) * ch`. A scanline `::after` (`transparent 0 2px, rgba(0,0,0,.25) 3px`) sits over every screen.

Write 4–7 painters per build, each a different genre, e.g.: a vector starfield warp, a maze chase from an ASCII map with blinking power pills, a wheel-road horizon with `/ \` edges and scrolling lane marks, a sonar sweep with fading blips, a dungeon room lit by a sine-flickered torch, an orbital league, a falling-block well, a lunar lander over `^` terrain, a lane of invaders stepping in unison. Paint only when the cabinet is powered (`active`), repaint on `ResizeObserver`, `aria-hidden="true"` on the canvas.

### Signature feature 5: one playable machine

Exactly one section holds a genuinely playable game, rendered as text on canvas: internal resolution `920×520` (46×26 cells), scaled by CSS with `image-rendering: pixelated`, inside a CRT housing (bezel, inner vignette, heavier scanlines) and a status bar below: `SCORE 000000 · SHEET n · BALLS ●●○ · STATE`.

- Reference game is Breakout (Atari, 1976): bricks as `███ ▓▓▓ ▒▒▒` in signal/token/phosphor rows worth 70/40/20, angle-off-the-bat reflection (`±π/3.2`), speed creeping to a cap, escalating sheets with gaps. **Vary the game per build**: Breakout, Snake, a lane-crossing frogger, a fixed-shooter invaders, Pong against the house, an asteroid field. It must be finishable in under two minutes and fair.
- Game feel is mandatory: glyph-shatter particles (`▓▒░▪·`) with gravity on hits, an 8-point phosphor trail behind the moving object, paddle/player squash on impact, a canvas shake on hits, a **whole-cabinet** GSAP jolt on life lost (6 random offsets, 40ms each), and a `difference`-blend invert flash on clearing a sheet.
- Controls: pointer/touch position, arrow keys, Space to serve/advance. Three lives, no continues. `dt` clamped to 50ms.
- **Initials entry:** on game over, the classic three-letter entry on canvas (blinking cell cursor, A–Z/0–9, Backspace, Enter). Enter **files the score to the ledger** through `lib/hall-of-fame.ts` (a tiny pub/sub), which inserts a live row at the top of the printout that flashes token color, then settles.
- The canvas is `tabIndex={0} role="application"` with an `aria-label` describing every control, and a visible controls list in the copy column.

### Signature feature 6: the furnace (required side effect)

Use `effects/ascii-flame.js` (a dependency-free `<ascii-flame>` web component: 2D stable-fluids fire with buoyancy, curl-noise turbulence, vorticity confinement, SOR pressure projection, RK2 advection, glyph-ramp rendering, embers, smoke, and two-pass bloom) and its React wrapper `effects/AsciiFlame.tsx`, both **verbatim**.

- Mount it inside a furnace door: dark riveted frame (rivets via a masked radial-gradient border), a dashed token-color inner rule, a louvered vent strip below, and a hint line: `POINTER STIRS THE AIR · CLICK TO IGNITE · DRAG TO PAINT FIRE`.
- Reference props: `preset="campfire" palette="fire" glyphs="flame" intensity={1.15} glow={0.75} embers={1.4} quality="medium" interactive`. Font comes from CSS: `ascii-flame { width:100%; height:100%; font-family: var(--font-term); font-size: 13px }`. The view is `height: clamp(340px, 52vh, 520px)`.
- Two machine buttons drive it through the handle: one throws fuel in (`ignite(0.3 + rand * 0.4, 0.7, 1.4)` + `sfx.clunk()`), one gusts (`gust(2.2)` + `sfx.gust()`).
- The component already caps itself at 24fps and slows to 0.4× under reduced motion. Do not override that.
- **Vary between builds:** preset (`campfire`, `torch`, `inferno`, `burner`), palette (`fire`, `coal`, `gas`), glyph set (`flame`, `flow`, `blocks`), and what is being burned — it must be the section's story, not decoration.

### Entrances (the reveal vocabulary)

Every entrance is a ScrollTrigger with `once: true`, bound after boot by `lib/reveals.ts` via `data-reveal`:

- **`crt`** — panels power on like a tube: from `scaleY: .012; opacity: 0; filter: brightness(4)` (origin top) to `scaleY: 1` (`0.24s power4.in`), then opacity/brightness settle (`0.3s`), with a `skewX: -1.4 → 0` shear. For the game housing, furnace door, token grid.
- **`feed`** — paper feeds out of a slot: `clip-path: inset(-2% 0 101% 0) → inset(-2% 0 -2% 0)`, `0.75s power3.inOut`. For the ledger printout only.
- **`wipe`** — copy sweeps in behind a cursor bar: `clip-path: inset(-10% 101% -10% 0) → inset(-10% -2% -10% 0)`, `0.6s expo.out`. For ledes, notes, quotes, lists.
- **`type`** — text resolves character by character via `scrambleTo`, 460ms. For kickers and small heads.
- **Section h2s** carry `data-text` and **decode** with `scrambleTo(el, text, { duration: 800 })` at `top 85%`.

`lib/scramble.ts` resolves each character at a staggered settle time (`i/len * 75%` of duration + up to 25% random), filling unresolved cells from `▚▞▛▟#%&@$?!=+<>/\|~^*01`, spaces never scramble. Text arrives by decoding — never by fading.

### The ledger printout

A thermal-paper sheet (`--paper` gradient with ruled lines every 27px, perforated top and bottom edges from radial-gradient scallops, `rotate(-0.6deg)`, deep drop shadow) in the terminal face. Rows print cell by cell: each cell decodes (`420ms`, step 24) at `i * 55ms`; every completed row gets an `ink-land` bleed (`text-shadow` blur → 0) and `sfx.ding()` (typewriter thock + bell). When the last row lands, a rubber **stamp** slams from `scale 2.6, rotate -22°` to `scale 1, rotate -8°` (`0.28s power4.in`), `sfx.stamp()` fires, and the whole sheet jolts (`rotate -1.5 → -0.6`, `elastic.out(1,.32)`). Pair it with a lede and a blockquote with a token-color left rule and an attributed floor-staff line.

### Tokens (coin flip)

Three coins on `perspective: 900px` cards `420px` tall. Front: a 170px coin (radial-gradient metal, `repeating-conic-gradient` milled edge, dashed inner ring, a pixel glyph and a stamped word), the tier name, the price in token color, and `— FLIP THE COIN —`. Back: perks in terminal type with signal `»` bullets and a machine button. The card flips `rotateY(180deg)` over `0.7s cubic-bezier(.2,.7,.2,1)` on `:hover` **and** `:focus-within`. Metals vary per tier (brass/nickel/steel, or copper/silver/gold) via `--coin-c1..c3`. The button must go somewhere real (anchor, `mailto:`, or checkout URL supplied by the client) — never a dead button.

### Game over (footer)

`GAME OVER` decodes at footer scale (`1600ms`, step 40). Below it, a machine button `▶ Insert coin to continue` that scrolls to top (`lenis.scrollTo(0, { duration: 1.2 })`), collapses the CRT flash to a line and reopens it, flickers the wave's power, and re-decodes the hero title. Then a three-column terminal grid (address / hours / wire links + `mailto:`), and a dashed-rule base line of three uppercase items, one of them a dry joke.

### The CRT room (global, always on)

Four fixed, `pointer-events: none`, `aria-hidden` layers above everything: scanlines (`repeating-linear-gradient` 3px period, `multiply`, opacity .7, z 90), vignette (radial to `rgba(ink,.55)`, z 91), flicker (`rgba(190,255,250,.015)` on a `4.2s steps(2)` opacity stutter, z 92), and the power flash (z 150).

### Custom cursor

On `(hover: hover) and (pointer: fine)` only: a typed `+` in phosphor, `mix-blend-mode: difference`, following via `gsap.quickTo` (`0.12s power2.out`), centered with `xPercent/yPercent: -50`. Over anything interactive (`a, button, [role=button], canvas, .coin-door, .token-card`) it becomes a signal-color `▶` at 30px. Add `body.custom-cursor { cursor: none }` only after the listener attaches.

### Sound

`lib/sound.ts` is a tiny WebAudio synth — every sound is a square, triangle, or sawtooth blip with exponential decay, optional pitch slide, and stereo pan. **No audio files.** The context is created lazily on the first user gesture (the coin), so nothing ever autoplays. Every interaction has its own sound: coin, clunk, power, select, move, brick/paddle/wall, lose, win, gust, ding, stamp, reject, ignite (per-cabinet pitch + pan), pellet. Keep gains between `0.02` and `0.16`. A `SND:ON / SND:OFF` toggle lives in the nav with `aria-pressed`.

**Motion rules:**

- Approved eases: `power2–4` in/out for mechanical travel, `expo.out` for wipes, `none` for scrubbed scroll, `steps(1)`/`steps(2)` for every CSS loop (blinks, hums, flicker, mash). `elastic.out` exists in exactly two places: the degauss and the ledger jolt.
- No smooth infinite pulses, no floating/bobbing cards, no `ease-in-out` breathing glows. A loop that isn't stepped is a defect.
- Every continuous animation must be caused by power (booted, lit), play (the game, the furnace), or passage (scroll). Nothing animates in a dead room.
- One loop per system: the GSAP ticker drives Lenis and the floor; each canvas owns its own throttled rAF; the flame manages itself. Never spawn a rAF per element.
- **Respect `prefers-reduced-motion: reduce` globally:** no Lenis, no pin (native sideways scroller), the field power set instantly, headings and ledger printed finished, reveals skipped (content visible), CRT flicker, blinks, hums, mash, cursor bob, and pellet all `animation: none`, no cabinet shake, token flip without transition, flame capped at 24fps. The boot gate still works — the coin simply lands instantly.

---

## Interaction & navigation

### Focus & accessibility

- `:focus-visible { outline: 2px solid var(--phosphor); outline-offset: 3px }` on every interactive element, including the coin door, canvases, token cards, and cabinet coin doors. Never `outline: none` without a replacement.
- A skip link (`Skip to the floor`) is the first element in `<body>`, hidden off-screen until focused, and only reachable after boot (it targets `main`).
- The coin door, the game canvas, and every cabinet coin door (`role="button" tabIndex={0}`, Enter/Space) are keyboard-operable.
- Global key handlers must ignore events whose target is an input, textarea, or the game canvas.

### Navigation

**Desktop:**

- Fixed, full-width, `z-index: 100`, `padding: 14px var(--pad)`, `1px solid var(--line)` bottom border, a dark top-to-bottom translucent gradient with `backdrop-filter: blur(6px)`. Hidden until booted, then fades in (`0.5s`).
- Left: a blinking signal-color pip + the brand in pixel type. Center: 4–5 section links in terminal type, `--dim`. Right: the `SND:ON` toggle and a dashed token-color `CREDIT 01` counter.
- Hover / focus / active: the link **inverts to a cursor bar** — `background: var(--phosphor); color: var(--ink)` — and a signal `▶` appears to its left. No underline, no glow.
- Active link is geometry-driven: in a rAF, the section whose rect spans `42%` of viewport height is active (ScrollTrigger toggles misfire while the floor is pinned).
- Link clicks play `sfx.move()` and smooth-scroll to the section. There is no CTA button in the nav.
- **Vary nav link labels between projects.** e.g. `The Floor / Attract Mode / The Ledger / The Furnace / Tokens`, or `Cabinets / House Machine / High Scores / Closing Time / Admission`, or `Row A / Free Play / Tonight's Sheet / Incinerator / Change Machine`.

**Mobile (below 900px):**

- Links hide; a `MENU` button in terminal type appears (`aria-expanded`, `aria-controls`).
- The menu is a full-screen `--ink` overlay styled as a **cabinet select screen**: `SELECT A ROOM` heading in pixel type, links in pixel type at `clamp(28px, 8vw, 44px)`, a blinking `▶` on the focused item, arrow keys move focus, Enter selects, Escape closes. Items decode in with `scrambleTo` at `60ms` stagger.
- Opening locks scroll (`lenis.stop()` + `body.locked`), moves focus to the first link, traps Tab inside, sets `aria-hidden` on `main`; closing restores focus to `MENU`.

### Forms & contact

Arcadium has no contact form. Contact is a `mailto:` in the footer wire column, plus any real booking/ticket URL the client provides on the token buttons. If the client insists on a form, style it as a **high-score entry**: terminal-type fields on `--panel` with a blinking block caret, labels as `ENTER NAME`, submit as a machine button, success as a decoded `ENTRY FILED`.

---

## Layout sections (approved roster)

The **boot + hero** is always first, the **furnace** is always present (it carries the required side effect), and **game over** is always last. Between hero and footer use 4–6 of these in any order. Never repeat a type.

- **Boot + Hero** — mandatory. Coin door gate over the dark field; after power: decoded title, one-line terminal sub (phosphor), two corner HUD blocks (location/status, hours/mode), and a bottom HUD strip with a stepped-bobbing `▼ … ▼` cue in the middle.
- **The floor** — the pinned hall: head overlaid top-left (kicker + h2 + note), 4–7 cabinets, each a CSS-built machine (trapezoid marquee `clip-path: polygon(6% 0, 94% 0, 100% 100%, 0 100%)`, body with 4:3 bezelled screen, control deck with joystick and two buttons, coin door with two slots and a price, base plinth, light cone, floor reflection) beside a nameplate (name + year, maker — spec line, lore, dashed status stamp). Pac-line progress, wire floor, parallax silhouettes, endcap.
- **Attract mode / Play** — `5fr / 4fr`: the playable machine in its housing, then "house rules" prose and a two-column controls list (input in phosphor, effect in `--dim`, dashed separators).
- **The ledger** — `4fr / 5fr`: lede + attributed blockquote, then the printout table (initials, cabinet, score right-aligned bold, note) with its stamp and the live row from the game.
- **The furnace** — mandatory. `4fr / 5fr`: lede explaining what burns and why, two machine buttons (token and phosphor faces), then the furnace door.
- **Tokens** — three coin-flip cards for pricing or membership tiers.
- **Prize counter** — for merch/products: a glass display case (dark panel, `1px var(--line)` shelves, faint phosphor top light) holding 4–8 CSS-or-glyph-built prizes; each prize has a ticket price in token color. On hover/focus a paper ticket strip unrolls from the counter slot (`clip-path` feed) showing the item's details. No product photos.
- **Floor map** — for locations/visit info: the venue plan drawn in box-drawing characters (`┌─┐│└┘╔═╗`) inside a `<pre>` or canvas, zones labelled in terminal type; hovering/focusing a legend entry lights its zone in that zone's accent (`steps(1)` blink twice, then steady) and prints its note beside the map.
- **Service bay** — for process/about/team: a technician's repair log as a dashed-ruled table (date, board, fault, fix, initials) next to a circuit board drawn in text (traces `─┼┤`, chips `▐██▌`); hovering a log row lights the board component it touched.
- **Game over** — mandatory, last. Decoded `GAME OVER`, the continue button, the three-column wire grid, the dashed base line.

**Mandatory placement rules:** the page has exactly one hero field, one playable game, and one furnace. The footer uses `--ink` with at most one faint signal-color radial from the top. Sections never alternate background panels.

---

## Architecture & performance guardrails

The output shape is a **Vite + React + TypeScript project** that builds to a static `dist/`. No backend, no CMS, no dependencies beyond the five runtime packages below.

**Canonical stack:**

```json
"dependencies": {
  "gsap": "^3.13.0",
  "lenis": "^1.3.11",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "three": "^0.180.0"
},
"devDependencies": {
  "@types/react": "^19.1.13",
  "@types/react-dom": "^19.1.9",
  "@types/three": "^0.180.0",
  "@vitejs/plugin-react": "^5.0.3",
  "typescript": "^5.9.2",
  "vite": "^7.1.6"
}
```

Scripts: `"dev": "vite --port 5173 --strictPort"`, `"build": "tsc --noEmit && vite build"`, `"preview": "vite preview --port 4173 --strictPort"`. Requires Node 20+. `tsconfig`: `target ES2022`, `module ESNext`, `moduleResolution bundler`, `jsx react-jsx`, `strict true`, `noEmit true`, `verbatimModuleSyntax true`, `include ["src"]`. `vite.config.ts` is just `defineConfig({ plugins: [react()] })`.

**Project manifest:**

```
project/
├── index.html                    — author per build (head/meta rules below, fonts, #root, noscript)
├── package.json                  — verbatim deps/scripts above; name/description per build
├── tsconfig.json                 — verbatim settings above
├── vite.config.ts                — verbatim
├── .gitignore                    — node_modules, dist, .DS_Store, *.local
├── README.md                     — author per build: what the site is, run commands, constraints honoured
├── public/favicon.svg            — author per build (see meta)
└── src/
    ├── main.tsx                  — verbatim: createRoot + StrictMode + import "./styles.css"
    ├── App.tsx                   — author per build: boot state, credits, session, Lenis, cursor, CRT layers, heading decode, reboot
    ├── styles.css                — author per build within the tokens and rules of this skill
    ├── effects/
    │   ├── AsciiWave.tsx         — VERBATIM from this skill's effects/
    │   ├── ascii-flame.js        — VERBATIM from this skill's effects/
    │   └── AsciiFlame.tsx        — VERBATIM from this skill's effects/
    ├── lib/
    │   ├── scramble.ts           — VERBATIM from this skill's lib/ (glyph string may vary)
    │   ├── reveals.ts            — VERBATIM from this skill's lib/
    │   ├── hall-of-fame.ts       — VERBATIM from this skill's lib/
    │   └── sound.ts              — from this skill's lib/; extend or retune sfx per build
    └── components/
        ├── Nav.tsx               — author per build
        ├── Hero.tsx              — author per build (coin door, power-on timeline, field)
        ├── Floor.tsx             — author per build (cabinet data, pin, ticker)
        ├── CabinetScreen.tsx     — author per build (4–7 painters)
        ├── <Game>.tsx            — author per build (the one playable machine)
        ├── Ledger.tsx, Furnace.tsx, Tokens.tsx, Footer.tsx, … — author per build, one per chosen section
```

**Construction method:**

1. Scaffold the folder by hand (do not run a generator), write `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`.
2. Copy the verbatim files from this skill's `effects/` and `lib/` folders into `src/effects/` and `src/lib/` unchanged. If the skill folder is not available, stop and ask for it — do not rewrite the effects from memory.
3. Write `styles.css` tokens first, then shared parts (CRT room, cursor, kicker, `.h-display`, `.btn-machine`, section shell), then one block per section, then reduced-motion, contrast, and print blocks.
4. Write components in page order; wire `App.tsx` last.
5. Resolve fonts from the approved lists and verify the Google Fonts URL returns `200`.
6. `npm install && npm run build` must pass `tsc` with zero errors; then `npm run dev` and play through: coin → hero → walk the floor → play a round and file initials → watch the ledger → stoke the furnace → flip a token → continue.

**The machine button** (`.btn-machine`) is the only button style: pixel type `14px` uppercase on a flat hardware face (`--btn-face`: signal by default, `.amber` token, `.cyan` phosphor), a bevel from inset highlights (`inset -3px -3px 0 rgba(0,0,0,.35), inset 3px 3px 0 rgba(255,255,255,.35)`) and a hard `0 6px 0` plinth; on `:active` it travels `translateY(5px)` and the plinth shrinks to `1px` (`0.06s`). No hover glow, no radius.

**Integrity & privacy:**

- Pin dependency majors/minors as above; never `@latest`. Only Google Fonts is fetched at runtime.
- No analytics, trackers, telemetry, or third-party scripts. No audio, image, or video files.
- `<noscript>`: a centred terminal-type message in voice ("THIS MACHINE NEEDS POWER. ENABLE JAVASCRIPT TO INSERT A COIN.") plus the venue/contact details as plain text.

**Size/performance target:** JS bundle under ~1MB minified / ~300KB gzipped (the original reference build came to ~900KB; Three.js and the flame solver are most of it). If over, cut in this order: (1) a section from the optional roster, (2) cabinets down to four, (3) the prize counter or map canvas. Never cut the wave, the furnace, the game, or accessibility markup. Canvas painters at 11fps, game at display rate, flame at ≤60fps. No layout reads inside CSS-animated loops except the floor ticker and nav active check.

---

## HTML head & meta tags

Every page must include:

- `<meta charset="UTF-8">` and `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- `<title>` — format: `BRAND — The <Noun> <Noun>` (e.g., `ARCADIUM — The Coin-Op Archive`). Never just the brand.
- `<meta name="description">` — one to two flat sentences in voice, 120–155 characters, ending on the call to play ("Insert coin.").
- `<meta name="theme-color" content="#04050a">` — matching `--ink`.
- `<meta name="color-scheme" content="dark">`.
- `og:title`, `og:description`, `og:type` (`website`).
- Favicon: `public/favicon.svg` — a coin (token-color circle with the brand initial in dark pixel strokes) or a single blinking-pip square in signal color. No PNG, no external request.

---

## Print stylesheet

Include a `@media print` block that:

- Hides: nav, cursor, all four CRT layers, the boot layer, the hero field, the pac-line, floor grid/haze/foreground, cabinet canvases, the game canvas, the flame, machine buttons, and the mobile menu.
- Releases the pin (`.floor-pin { height: auto }`, track `position: static; transform: none; flex-wrap: wrap`) and the hero (`height: auto; min-height: 0`).
- Prints headings from their `data-text` values (they may be mid-decode) and shows token card backs below their fronts (no 3D).
- Sets sections to `break-inside: avoid`, removes all animations and transitions.
- Forces text to black on white (the ledger stays paper), removes every `mix-blend-mode` and `text-shadow`.

---

## Accessibility checklist

Every output must satisfy all of these before it is complete.

**Structure:**

- Landmarks: `<header>` for the hero, `<nav aria-label="Site">`, `<main>` (with `aria-hidden` only until boot), `<footer>`; skip link first in `<body>`.
- Every section has an `id` and is linked to its h2 via `aria-labelledby` (or `aria-label` for the pinned floor).
- Strict heading hierarchy: h1 hero title (with `aria-label` because it decodes) → h2 sections → h3 cabinet names, sub-heads → h4 token backs. Scrambling elements carry their final text in `aria-label` so screen readers never hear noise.

**Interactive elements:**

- Buttons have an explicit `type="button"`.
- `aria-label` on the coin door, the game canvas, the sound toggle, the menu button, and each cabinet coin door.
- `:focus-visible` outline on every interactive element; token cards flip on `:focus-within`.
- Touch targets ≥ 44×44px (the coin door and machine buttons already exceed this; pad nav links to it on touch).

**State management:**

- `aria-pressed` on the sound toggle; `aria-expanded` / `aria-controls` on the menu button; `aria-hidden` toggled on `main` (boot, open menu) and on the boot layer after power-on.
- Decorative layers — CRT overlays, cursor, cabinet canvases, pac-line, wire floor, haze, silhouettes, cones, reflections — are `aria-hidden="true"`. The hero field is `role="img"` with a label.
- The live ledger row is announced via an `aria-live="polite"` region ("Score filed: ABC, 004210").

**Media queries:**

- `prefers-reduced-motion: reduce` fully implemented as described under Motion.
- `prefers-contrast: more` fully implemented as described under Color.
- `(hover: hover) and (pointer: fine)` gates the custom cursor and hover glitches; `pointer: coarse` gets touch controls in the game (drag moves, tap serves) and never a dead interface.

---

## LLM directives: vary vs. freeze

**Vary between generation runs:**

- The phosphor / signal / token triad (within ranges) and per-cabinet accents.
- Font families from the three approved lists.
- Brand name, venue, tagline, cabinet names, makers, years, lore, statuses, ledger rows, staff names, prices, and all copy.
- Section selection (4–6 from the roster), order between hero and footer, and nav labels.
- Number of cabinets (4–7) and which attract-mode genres they run.
- Which game is playable, its glyphs, and its scoring.
- The wave's `cell`, `rings`, `speed`; the flame's preset, palette, glyphs, and what burns.
- The coin's denomination and metal, token tiers and metals, the scramble glyph set.

**Never vary:**

- Dark only; the three-role emissive color system; light only from emitters.
- The three-font system (pixel / terminal / grotesk) and uppercase-machine vs sentence-case-human split.
- The boot gate: the site is dead until a coin goes in, keyboard included.
- The ASCII wave hero driven by `setPower`, and the ascii-flame furnace — both from the verbatim effect files.
- Text arriving by decode; panels by CRT power-on; paper by feed; copy by wipe. No fades, no counters, no loaders.
- Stepped loops, the two-elastic rule, the WebAudio-only sound, and the four-layer CRT room.
- Exactly one playable game that files initials to the ledger.
- The banned list from the brief, the Vite + React + GSAP + Lenis + Three stack, and the accessibility, reduced-motion, and privacy baselines.
