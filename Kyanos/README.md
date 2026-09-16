# Cyanotype — *Kyanos*

A single-page site for **Kyanos**, a fictional sun-printing studio and living herbarium on the island of Hydra, and the first build of a new design language for this collection: **Cyanotype**. The whole palette is Prussian blue, cotton paper and the yellow-green of the iron coat. There is nothing else on the page.

The page *is* the process. You arrive at a sheet of sensitised paper and your pointer is the sun. Scrolling lifts the specimens off and runs water down the sheet until it develops into a blue print. That print, *your* print, then hangs as plate 000 on the drying line further down.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the build on http://localhost:4173
```

Requires Node 20.19+ (Vite 8).

## How it differs from the other languages here

| | Cyanotype |
|---|---|
| Palette | One Prussian-blue ramp, cotton paper, the iron coat's yellow-green. No other hues. |
| Type | Host Grotesk for voice and interface, Fraunces italic for Latin names and numerals. |
| Signature | A live photogram: light accumulates in WebGL, then the print is washed by scroll. |
| Motion | "Develop" reveals: words resolve from blurred yellow-green into ink. Prints swing on a line. |
| Imagery | None. Every plate is drawn by code (Canvas 2D) and printed in a shader. |
| Structure | Folios I–V, plate numbers, exposure times, Roman-numeral dates, as on a herbarium sheet. |

## How it works

- **`src/gl/Stage.js`** runs one fixed OGL canvas behind the page. The orthographic camera is measured in CSS pixels, so meshes sit exactly on DOM rects.
- **`src/gl/Ground.js`** draws the page itself as a washed cyanotype, mottled and brush-streaked. The coat stops in ragged strokes where the herbarium's bare paper shows.
- **`src/gl/Photogram.js`** is the hero:
  - Lamp light accumulates in ping-pong render targets (half-float, or 8-bit with stochastic rounding).
  - The sheet shader maps exposure to the colours of a real print.
  - Scroll finishes the exposure, lifts the specimens (their shadows spread), then runs a rippling wash front down the sheet. A coarse CPU grid replays the same light to drive the "% exposed" meter.
- **`src/gl/plate.js`** is one shader for every other print:
  - the process plate, taken through coat → compose → expose → wash → dry;
  - the drying line, where each print is a pendulum hung from its peg;
  - the sessions preview.
- **`src/specimens/`** holds the procedural botanicals and the compositions they are placed in:
  - fern and maidenhair
  - Queen Anne's lace (the umbel)
  - quaking grass
  - ginkgo and dandelion clock
  - forked seaweed after Anna Atkins
  - gull feather and cornflower
- **`src/ui/`** handles the page behaviour:
  - the preloader, where a brush coats the sheet at the pace of the real loading work;
  - navigation, reveals (GSAP SplitText) and scroll choreography (ScrollTrigger with Lenis);
  - the sun clock, which computes the solar altitude for Hydra in the browser.

## Accessibility and fallbacks

- The HTML is complete and readable without JavaScript.
- With `prefers-reduced-motion`, there is no smooth scroll and no scroll-driven rooms. The hero shows a finished print.
- Without WebGL2, the same drawings appear white on blue through Canvas 2D.
- Keyboard: *Let the sun in* exposes the sheet, and the sun chart reads by arrow keys, with an off-screen table.
- Also covered: `prefers-contrast: more`, a print stylesheet, skip link, and a focus-trapped mobile menu.

## Facts on the page

Sir John Herschel described the cyanotype in 1842. Anna Atkins's *Photographs of British Algae: Cyanotype Impressions* (1843) is regarded as the first book illustrated with photographs. The studio, its plates, sessions and address are invented.

## Dev pages

`dev/lab.html` and `dev/sheet-lab.html` render the specimen generators and the hero composition for tuning. They are served by `npm run dev` and are not part of the build.
