# Pellucid

A light, optical design language for object makers, material brands, and studios whose product is how something looks *through* it. It builds a small static site around a live WebGL liquid-glass object that refracts the page's own typography: morphing through forms as you scroll, splitting light into colour, and casting a spectral caustic on a porcelain grid.

> The instructions the AI follows live in [`pellucid-skill/SKILL.md`](pellucid-skill/SKILL.md). This file explains what the skill produces and how to use it. An AI agent (with file access) is recommended.

---

## What it produces

- A four-file static folder (`index.html`, `css/style.css`, `js/glass.js`, `js/main.js`). No framework, no build step; it opens from `file://` or any static server.
- An intro veil: a single beam of light splits into red, green, and blue and opens the page while a real optical value counts up.
- A pinned hero "optical stage": one raymarched glass object morphs between torus, sphere, cross, and a four-point glint as you scroll, while the giant word behind it rolls to the next.
- A rendered gallery: every product image is a still generated in the browser by the same glass renderer. There are no photographs.
- The Bench, an interactive configurator: pick the form, backdrop, dispersion, frost, thickness, and tint, then type your own words to see them through glass.
- A scroll-drawn SVG optical diagram, count-up spec rows, and a dark closing stage with the glass over a two-line statement.

## How to use it

1. **Provide context:** the brand or studio, what they make, 4–6 objects or offerings (name, material, size, edition/price if relevant), 3–5 process steps, a few measurable specs, contact email, and city/time zone.
2. **Let the agent choose the variables:** fonts from the approved width-axis list, ground hue, aurora palette, hero words and shape order, and the section roster (6–9 sections).
3. **Generate:** the agent copies the glass renderer verbatim and authors the rest to the language's rules.
4. **Review:** serve the folder (`python -m http.server 5173`) and check the invariants at 1440×900, at 390×844, and with reduced motion.

## Requirements

- A modern browser with WebGL. If WebGL is unavailable, the page falls back to static plates.
- Internet access at runtime for Google Fonts, GSAP (cdnjs), and Lenis (jsDelivr), all version-pinned.
- No Node, npm, or bundler.

## Tech stack

- **HTML / CSS / JavaScript**: vanilla, classic `defer` scripts.
- **WebGL**: a two-pass liquid-glass raymarcher (a plate pass with shadow and caustic, then a glass pass with SDF morphing, RGB dispersion, frost, fresnel studio reflection, and thin-film iridescence). It is a vanilla port and extension of the Originkit "Glass Icon" component.
- **GSAP 3.15**: ScrollTrigger (pins, scrub, containerAnimation), SplitText (line masks, word scrub), CustomEase.
- **Lenis 1.3.26**: smooth scrolling synced to ScrollTrigger.
- **Fonts**: a variable display face with a width axis (Bricolage Grotesque, Archivo, Anybody, Encode Sans) plus a grotesk body (Geist, Instrument Sans, Figtree, Manrope).

## Notable characteristics

- **Colour only as light.** Porcelain grounds and ink type. Colour appears as refraction, caustics, iridescence, and a prism gradient reserved for a handful of accents.
- **Exactly one dark section**, the closing stage.
- **CSS glass as companion UI only:** nav pill, captions, and tags. No glass cards.
- **No photos, custom cursors, tickers, or percentage loaders.**
- **Hard invariants learned from real bugs:** glint geometry, caustic seams, font-loading before canvas text, plate/DOM collision on mobile, touch scrolling over canvases, and a failsafe for the intro veil.
- **Every build must vary:** brand, copy, section roster, fonts, ground hue, aurora palette, hero words, and shape order.

## Files

```
Pellucid/
├── pellucid-skill/
│   └── SKILL.md    # the full instructions the AI follows (renderer embedded verbatim)
├── Hero.png        # hero stage, torus phase
├── Disperse.png    # hero stage, dispersion phase
├── Bench.png       # the live configurator
├── Closing.png     # dark closing stage
├── Mobile.png      # hero on a 390px phone
└── About.md        # this overview
```

## Size

- ~16,700 context tokens (estimated) · 8,199 words · 60,062 characters
- About 7k of those tokens are the verbatim WebGL renderer. That code is embedded on purpose so models don't re-derive the raymarch maths.

## Recommended models

**Tested:** Claude (reference build).

**Expected to work:** strong reasoning models with long context (DeepSeek, GPT / Codex, Qwen, GLM, Kimi flagships). Because the skill embeds a WebGL renderer and a multi-part GSAP choreography, models with deep or extended reasoning give the most reliable results.

**Not recommended:** small models (< 30B parameters) or short-context models.

---
**Overall score: pending review.**
What can be improved: **cross-model testing, token compression of the choreography sections, an additional night-first variant.**
