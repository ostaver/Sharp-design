# Kyanos

A single-page site for **Kyanos**, a fictional sun-printing studio and living herbarium on the island of Hydra, and the first build of a new design language for this collection. The whole palette is Prussian blue, cotton paper and the yellow-green of the iron coat. There is nothing else on the page.

The page *is* the process:
- You arrive at a sheet of sensitised paper. Your pointer is the sun, carried by a burning glass, and the tray water already laps at the foot of the sheet.
- Scrolling lowers the sheet into the water. The specimens lift off and the print develops blue.
- That print, *your* print, then hangs as plate 000 on the drying line further down. Its sheet is cut to fit it, and the printer pencils its time in the sun underneath. *Take it off the line* saves it as a PNG.
- The page ends on a stroke of raw sensitiser. Press it and a fresh sheet is coated at the top.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the build on http://localhost:4173
```

Requires Node 20.19+ (Vite 8).

## How it differs from the other languages here

| | Kyanos |
|---|---|
| Palette | One Prussian-blue ramp, cotton paper, the iron coat's yellow-green. No other hues. |
| Type | Ysabeau, a humanist sans on Garamond's bones, for the voice, with every label in its true small capitals. Cardo italic for Latin names, years and numerals. Each plate carries its name in a hand (La Belle Aurore), the way Anna Atkins labelled hers. |
| Signature | A live photogram: light accumulates in WebGL under a burning-glass cursor, then the scroll lowers the sheet into the water. |
| Motion | Headings develop as a water line rises through them, clearing the coat's yellow-green to the section's colour. Prints swing on a line, and session rows expose like strips of paper. There are no blur, fade-up or counter animations. |
| Imagery | None. Every plate is drawn by code (Canvas 2D) and printed in a shader. |
| Structure | Folios I–V, plate numbers, exposure times and Roman-numeral dates, as on a herbarium sheet. |

## How it works

- **`src/gl/Stage.js`** runs one fixed OGL canvas behind the page. The orthographic camera is measured in CSS pixels, so meshes sit exactly on DOM rects.
- **`src/gl/Ground.js`** draws the page itself as a washed cyanotype, mottled and brush-streaked. The coat stops in ragged strokes where the herbarium's bare paper shows.
- **`src/gl/Photogram.js`** is the hero:
  - Lamp light accumulates in ping-pong render targets (half-float, or 8-bit with stochastic rounding).
  - The sheet shader maps exposure to the colours of a real print.
  - The cursor is drawn in the shader as a burning glass that magnifies the paper under it.
  - Before the wash, a shallow tide of tray water rocks at the foot of the sheet and already clears the coat it touches. It is the page's only cue to scroll.
  - Scroll finishes the exposure, lifts the specimens (their shadows spread) and raises the water over the sheet.
  - A coarse CPU grid replays the same light to drive the "% exposed" meter.
- **`src/gl/plate.js`** is one shader for every other print:
  - the process plate, taken through coat → compose → expose → wash → dry;
  - the drying line (`DryingLine.js`), where each print is a pendulum hung from its peg. The scroll swings them, and so does a mouse brushed across one. Plate 000 is re-rendered flat and large off-screen when the visitor takes it home.
- **`src/specimens/`** holds the procedural botanicals and the compositions they are placed in:
  - fern and maidenhair
  - Queen Anne's lace (the umbel)
  - quaking grass
  - ginkgo and dandelion clock
  - forked seaweed after Anna Atkins
  - gull feather and cornflower

  Plates get their handwritten names here, and session rows get their horizontal strips.
- **`src/ui/`** handles the page behaviour:
  - the preloader, where a brush coats the sheet at the pace of the real loading work (`brush.js` is shared with the closing stroke);
  - `coat.js`, the closing brushstroke and the veil that coats a fresh sheet on the way back to the top;
  - `sessions.js`, the seat tables and the row strips;
  - navigation, the heading reveals (GSAP SplitText) and scroll choreography (ScrollTrigger with Lenis);
  - the sun clock, which computes the solar altitude for Hydra in the browser and draws today's arc in the nav.

## Accessibility and fallbacks

- The HTML is complete and readable without JavaScript. The closing stroke is a plain link to the top.
- With `prefers-reduced-motion`, there is no smooth scroll and no scroll-driven rooms. The hero shows a finished print.
- Without WebGL2, the same drawings appear white on blue through Canvas 2D.
- On screens too short to pin the drying line (small or landscape phones, squat windows), it becomes a sideways scroller in the normal flow of the page.
- Keyboard: *Let the sun in* exposes the sheet, and focusing a session row exposes its strip as hovering does. The sun chart reads by arrow keys, with an off-screen table.
- Also covered: `prefers-contrast: more`, a print stylesheet, skip link, and a focus-trapped contents menu on small screens.

## Facts on the page

Sir John Herschel described the cyanotype in 1842. Anna Atkins's *Photographs of British Algae: Cyanotype Impressions* (1843) is regarded as the first book illustrated with photographs. The studio, its plates, sessions and address are invented.

## Dev pages

`dev/lab.html` and `dev/sheet-lab.html` render the specimen generators and the hero composition for tuning. They are served by `npm run dev` and are not part of the build.
