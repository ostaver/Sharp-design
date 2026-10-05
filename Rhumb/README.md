# Ostarev

A single-page site for **Ostarev**, a fictional coding agent that works overnight. You hand it a ticket at dusk and it has a pull request waiting by first light. The page is that night. It opens in orbit above a dithered planet at 20:00 and runs through the watches. It ends at 08:00, when the dither resolves into Delft ink on paper and the night's end credits roll.

Everything visual is drawn in code: a GLSL shader, some SVG and CSS. The page ships no images apart from the social preview.

## Run it

```bash
npm install
npm run dev        # http://localhost:5175  (add ?skip to bypass the preloader while iterating)
npm run build      # static site in build/, relative paths, deploy anywhere
npm run preview    # serve the build on http://localhost:4175
```

Requires Node 20.19+ (Vite 8).

## Stack

SvelteKit 2 (Svelte 5 runes, fully prerendered with adapter-static) · Vite 8 · GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, DrawSVG, CustomEase) · Lenis · OGL (WebGL2) · self-hosted Geist, Geist Mono and Instrument Serif.

## The night, section by section

| Ship's time | Section | What happens |
| --- | --- | --- |
| 20:00 | **Heading** | Opens letterboxed, the title pulling into focus as the bars lift. A planet limb rendered as pink stochastic dither with a periwinkle rim and a halo of streaming dust; the pointer stirs the dust. Scrolling closes the letterbox and drops the camera through the limb, subtitled, and out onto the night side, where the bars part and the first log line waits in the clear air. Each model takes a turn *at the helm* in a single readout. |
| 20:10 | **Hand-off** | Pinned. Scroll types `ostarev sail …` into a terminal and plays the session: charting, soundings, hazards, the four waypoints, the prompt. The three steps beside it light up in step. |
| 20:20 | **Instruments** | Six live instruments. *Chart* plots a route across a portolan rhumb-line net. *Helm* renames a symbol at every reference. *Soundings* is an echo sounder with a test counter. The others are a scrolling log, crew branches merging back (one red), and an anchor cursor hauling back to a waypoint. They only run while on screen. |
| 20:40 | **Bearing** | A dithered globe with a graticule and a family of 047° loxodromes. The ship sails our line; the globe turns to keep it in view. A label and a BRG/DRIFT readout track the ship, computed in JS with the same matrices as the shader. Each figure is read off its own scale. |
| 21:00 → 06:00 | **The night** | Pinned horizontal log on a ship's-time axis, with half-hour ticks and the bells struck at each. Behind it the sky turns: star trails grow at 15° an hour around the pole. |
| 06:30 | **Signals** | Quotes rotate with a word-level SplitText swap. Each person's initials are hoisted in International Code of Signals flags, and the hoists are the controls: the one flying is the one you're reading. The crews are set as a sentence. |
| 07:15 | **Charter** | Pricing as three articles of a charter party: ruled columns, numbered clauses, prices set in the serif. Dawn starts climbing the sky in ordered-dither bands. |
| 08:00 | **Landfall** | The dither resolves into paper, sweeping up from the bottom. Each block of text turns to Delft ink at the moment the front passes it. A portolan wind rose prints itself onto the paper, masked to the dawn front, and its needle settles on 047°. |
| — | **Footer** | End credits on the page's gutters: a closing line, the links billed in columns, then a grainy gradient from landfall's paper down into Delft with the wordmark set edge to edge between the gutters (sized in container units, so it fits any screen). |

## How it works

- **`src/lib/gl/sky/`** is one fixed WebGL2 canvas behind the whole page. It renders at one texel per dither pixel (about 2 CSS px) and is scaled up with `image-rendering: pixelated`, so every mark is a hard square and the shader stays cheap. Scenes are composited by uniforms:
  - planet and dive
  - globe
  - star trails, stars and meteors
  - dawn bands (Bayer)
  - paper sweep
- **`src/lib/motion/choreo.js`** maps scroll position to everything that isn't local to one section: the sky's scene values, the ship's clock (piecewise, so the night log owns 21:00–06:00), the active section and day/night. It is measured on every ScrollTrigger refresh and evaluated every frame.
- **`src/lib/components/Cinema.svelte`** is the lens over everything: a vignette, film grain (overlay-blended, desktop only) and the letterbox, whose closure is shared through `src/lib/motion/cine.js` by the hero intro and the choreo.
- **`src/lib/components/`** holds one Svelte component per section, plus the nav with the ship's clock and bells, the section rail, the install tabs, the preloader and the flags.
- **`src/lib/audio/bell.js`** synthesises a ship's bell (inharmonic partials, struck in pairs the way watches are kept) and a surf under the footer. Sound is off until the bell button in the nav is pressed.

## Details

- The ship's clock in the nav runs with the scroll and shows the watch and its bells. With sound on, bells strike on each half hour of the night log.
- The rail on the left carries each section's number and its time. The nav picks up a blurred backing once content passes under it, and nav and rail step aside for the footer.
- Install tabs are a proper ARIA tablist with arrow-key navigation. The command scrambles between package managers, and *Copy* confirms with a flash.
- The hero line strikes through *babysitting* as it arrives.
- The preloader takes a bearing: the rose draws itself and the needle swings onto 047° while the page loads.

## Accessibility and fallbacks

- Prerendered HTML: all copy is readable with JavaScript off, and the preloader never shows without it.
- `prefers-reduced-motion`:
  - no smooth scroll, pinning, preloader or scroll-typed terminal
  - the night log becomes a vertical list
  - shaders render still frames
- Without WebGL2, the hero falls back to a CSS-drawn limb.
- On phones there is no backdrop blur and no grain over the live canvas, and section headings skip the focus pull.
- Also covered:
  - skip link and landmarks
  - one `h1` and an unbroken `h2`/`h3` outline
  - `:focus-visible` everywhere, with Delft outlines on paper
  - a focus-trapped mobile menu
  - `prefers-contrast: more` and a print stylesheet

## Customise

Copy, sections, times, tiers and footer links live in `src/lib/content.js`. Colours are tokens at the top of `src/app.css`. The dither palettes are the `PINK`, `RIM` and `DAWN` ramps in `sky.frag.glsl`, and the footer gradient is in `Footer.svelte`.

Ostarev, Leftovers, the people quoted and their companies are invented. Model names appear only as compatibility.
