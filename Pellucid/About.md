# Pellucid

A light, optical design language for object makers, material brands, and studios whose product is how something looks *through* it. It builds a small static site around a live WebGL liquid-glass object that refracts the page's own typography: morphing through forms as you scroll, splitting light into colour, and casting a spectral caustic on a porcelain grid.

> The instructions the AI follows live in **[`pellucid-skill/SKILL.md`](pellucid-skill/SKILL.md)**. This file explains what the skill produces, when to use it, and how.

---

## What it produces

- **A vanilla TypeScript Vite project** (`index.html`, `src/style.css`, `src/glass.ts`, `src/main.ts`, `package.json`, lockfile, and strict `tsconfig.json`). No UI framework; Vite builds browser JavaScript and CSS into `dist/` for a static HTTP(S) host.
- **An intro veil:** a single beam of light splits into red, green, and blue and opens the page while a real optical value counts up.
- **A pinned hero "optical stage":** one raymarched glass object morphs between torus, sphere, cross, and a four-point glint as you scroll, while the giant word behind it rolls to the next.
- **A rendered gallery:** every product image is a still generated in the browser by the same glass renderer. There are no photographs.
- **The Bench, an interactive configurator:** pick the form, backdrop, dispersion, frost, thickness, and tint, then type your own words to see them through glass.
- **A scroll-drawn SVG optical diagram**, count-up spec rows, and a dark closing stage with the glass over a two-line statement.

## How to use it

1. **Give the agent the `pellucid-skill/` folder** (which includes `kit/glass.ts`).
2. **Provide context:** the brand or studio, what they make, 4–6 objects or offerings (name, material, size, edition/price if relevant), 3–5 process steps, a few measurable specs, contact email, and city/time zone.
3. **Let the agent choose the variables:** fonts from the approved width-axis list, ground hue, aurora palette, hero words and shape order, and the section roster (6–9 sections).
4. **Generate:** scaffold with `npm create vite@latest project -- --template vanilla-ts`, install dependencies with `npm install` and `npm install --save-exact gsap@3.15.0 lenis@1.3.26`. The agent copies `kit/glass.ts` to `src/glass.ts` byte for byte, imports the named `PellucidGlass` export in `src/main.ts`, and authors the HTML, CSS, and typed choreography. Keep strict TypeScript and the `tsc && vite build` build script. Raw TS must not be renamed to JS or loaded as a classic script.
5. **Review:** run `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 5173`. Check the invariants at 1440×900, at 390×844, and with reduced motion: veil completion, hero forms and refraction, gallery snapshots, Bench controls/drag, closing, touch scrolling, and WebGL-disabled/lost-context plate fallback. Deploy `dist/`, not the source folder; `file://` is unsupported.

## Requirements

- A modern browser with WebGL. If WebGL is unavailable, the page falls back to static plates.
- Node.js 20.19+ or 22.12+ supported by Vite, npm, TypeScript, and Vite for authoring/builds; install GSAP and Lenis as pinned npm modules with their real package types.
- Internet access at runtime for Google Fonts. Motion libraries are bundled locally; the built site needs only a static HTTP(S) host, not a Node runtime.

## Tech stack

- **HTML / CSS / TypeScript**: vanilla ES modules, strict type-checking, and Vite compilation to browser JavaScript.
- **WebGL**: a two-pass liquid-glass raymarcher (a plate pass with shadow and caustic, then a glass pass with SDF morphing, RGB dispersion, frost, fresnel studio reflection, and thin-film iridescence).
- **GSAP 3.15**: ScrollTrigger (pins, scrub, containerAnimation), SplitText (line masks, word scrub), CustomEase (`lens`).
- **Lenis 1.3.26**: smooth scrolling synced to ScrollTrigger.
- **Fonts**: a variable display face with a width axis (Bricolage Grotesque, Archivo, Anybody, Encode Sans) plus a grotesk body (Geist, Instrument Sans, Figtree, Manrope).

## Notable characteristics

- **Colour only as light.** Porcelain grounds and ink type. Colour appears as refraction, caustics, iridescence, and a prism gradient reserved for a handful of accents.
- **Exactly one dark section**, the closing stage.
- **CSS glass as companion UI only:** nav pill, captions, and tags. No glass cards.
- **No photos, custom cursors, tickers, or percentage loaders.**
- **Hard invariants learned from real bugs:** glint geometry, caustic seams, font-loading before canvas text, plate/DOM collision on mobile, touch scrolling over canvases, and a failsafe for the intro veil.
- **Every build must vary:** brand, copy, section roster, fonts, ground hue, aurora palette, hero words, and shape order.

## Files in this skill

```structure
Pellucid/
├── pellucid-skill/
│   ├── SKILL.md                 # the full instructions the AI follows
│   └── kit/
│       └── glass.ts             # renderer module copied into src/glass.ts
├── preview-hero.png             # hero stage, torus phase
├── preview-disperse.png         # hero stage, dispersion phase
├── preview-bench.png            # the live configurator
├── preview-closing.png          # dark closing stage
├── preview-mobile.png           # hero on a 390px phone
└── About.md                     # this overview
```

## Size

- `SKILL.md`: the design, typed plates toolkit, Vite project manifest, and build/review instructions.
- Kit: `kit/glass.ts`. The agent copies it byte for byte; original shader strings and runtime behavior are preserved while the renderer exposes a typed named module API.

## Recommended models

**Recommended:**

- Claude models
- OpenAI / GPT / Codex models
- DeepSeek models
- Kimi K2.6 or Kimi K2.5
- GLM / Z.ai models
- Qwen models (larger models recommended)

**Not recommended:**

- Mistral models
- Meta / Llama models
- Flash / mini / small-tier models of any family

---
**Overall score: 9.3/10.**
What can be improved: **Requires an agent with local file access to copy `kit/glass.ts` rather than a single inline prompt. The high-key optical aesthetic is tightly focused on physical objects, glass, lighting, jewellery, and hardware studios.**
What is good: **Gallery-grade optical realism running entirely in client-side WebGL with zero image assets. The 2D plate + 3D raymarch architecture delivers genuine refractive typography, live dispersion, and a hands-on optical bench with robust mobile touch and no-WebGL fallbacks.**
