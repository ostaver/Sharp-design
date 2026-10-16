# Honor

Design and behavior clone of the homepage at https://heronaiapp.com/, rebuilt as a clean Vite project.
All copy is lorem ipsum except the company name, which is HONOR (page title, header wordmark, footer wordmark, copyright). Photos are from Unsplash (see `src/assets/photos/SOURCES.md`); logos and illustrations are original; fonts are open-source stand-ins.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build into dist/
```

## What the original site is built with (detected)

| Layer | Finding |
| --- | --- |
| Builder / host | Webflow (`data-wf-site`, `webflow.js`, jQuery 3.5.1), assets on `cdn.prod.website-files.com` |
| Custom app code | Obfuscated Vite ESM bundle (`main.js`) served from Netlify, plus a `config.js` dev/prod loader (`localhost:3000` in dev) |
| Animation | GSAP 3.12.5 + ScrollTrigger, SplitText 3.13, TextPlugin 3.13 |
| Smooth scroll | Lenis 1.1.5 (wrapper = `.main-inner`, not `window`) |
| Page transitions | Barba.js (core + prefetch), single page used here |
| Sliders | Swiper 11 (mobile slider for the problem cards) |
| Visual FX | SVG `feTurbulence` + `feDisplacementMap` ink-reveal masks, CSS `mask-position` sprite wipe on buttons, hand-built loader with coordinate ruler |
| Analytics | Google Analytics 4, Mixpanel, Microsoft Clarity (not carried over) |
| Fonts | BT Grotesk (commercial), Geist Mono |
| SEO | Open Graph / Twitter cards, `SoftwareApplication` JSON-LD |

## Layout of this repo

```
index.html       page shell, composes the partials
vite.config.js   dev server + tiny <include src="..."> HTML partial plugin
src/
  main.js        boots Lenis, buttons, ink masks, then every file in scripts/sections/
  partials/      decompiled markup: layout/, sections/, common/, components/, icons/, svg/
  styles/        decompiled CSS split into base/, components/, sections/
  scripts/
    core/        gsap registration, Lenis scroller
    components/  button wipe, ink-mask reveal, scroll reveals, crosshair
    sections/    one module per behavior, run in filename order (00-loader first)
  assets/        photos, generated placeholders and decorative patterns
```

## Notes

- The page scrolls inside `.main-inner`, not the window. Lenis smooths the wheel; touch and keyboard scrolling are native, so `.main-inner` is a real `overflow-y: auto` box with a hidden scrollbar (`base/utilities.css`). Phones and tablets scroll with the finger and ScrollTrigger follows. In dev, `window.__lenis` is exposed for scripted scrolling.
- Layout is proportional: `html { font-size }` is viewport-relative (`base/reset.css`), everything is in `rem`, and the breakpoints are 991 / 767 / 479.
- Motion respects `prefers-reduced-motion`: no loader, no reveals, no ink masks, static map story, finished wordmark.
- Webflow variant hashes were turned into readable `v-<name>` modifier classes; per-element `#w-node-*` grid placement rules live in `styles/base/grid-placement.css`.
- Only the homepage is cloned; navigation links point to `#`.
- The build uses a relative base (`./`), so `dist/` works from any subfolder (it is published at `/honor/` in the Flare Design showcase). Every pattern, including those referenced from CSS custom properties (`--bg-img`, `--bg-grid`, `--ph-mask-image`), lives in `src/assets/patterns/` and is fingerprinted by Vite.
- The footer wordmark is a hand-built SVG (`src/partials/svg/footer-wordmark.html`): hairline letter outlines with drafting marks, drawn on scroll with GSAP DrawSVG; under a pointer (or a finger) the solid letters are inked in through an `feTurbulence` displaced mask, the same technique as the original.
