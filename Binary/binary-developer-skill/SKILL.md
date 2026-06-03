---
title: design-binary
description: A precise, single-page dark design language for technical reference sites. Fully standalone — zero local binaries. Fonts from Google Fonts, icons from Lucide, imagery from Unsplash, a hand-written WebGL fragment shader for the hero background, CSS glitch imagery, monospace throughout. You author four small text files (index.html, styles.css, app.js, server.js) and run a plain Node server.
---

# Binary

You are building a page in the **Binary** design language: a fixed-frame, dark, monospace technical reference site with a live WebGL shader background, a percentage loader, a custom text cursor, scroll-reveal motion, an alternating glitch case list, and a giant footer wordmark.

This website is **completely standalone**. There are no prebuilt bundles, no copied binary assets, no local files, no icon font, no `_external` API cache, and no `models/` directory. Everything that can be fetched from the internet is fetched from the internet:

- **Fonts** → Google Fonts (`Inter` + `JetBrains Mono`)
- **Icons** → Lucide via CDN (`unpkg.com/lucide`)
- **Imagery** → Unsplash dynamic URLs (or any image CDN)
- **Hero background** → a hand-written WebGL fragment shader (raw WebGL, no library)
- **Noise overlay** → an inline SVG `feTurbulence` data URI (no PNG)
- **Logo / wordmark / corner crosses / loader / audio wave** → inline SVG paths (vector primitives, not binaries)

The result is four hand-written text files plus a Node static server. Nothing is copied from any reference project.

## Make each build original

Binary is a *language*, not a template. Two sites built from it should share the grammar (fixed frame, mono type, glitch cases, wordmark) but never look like clones. Every time you build, vary these so the result feels bespoke:

- **Shader**: pick a different preset / tint / `scale` / `warp` (see the shader section). This is the single biggest visual differentiator.
- **Logo mark**: choose a different glyph from the mark set (or compose one in the same style) — don't default to the chevron every time.
- **Accent color**: set `--up`/`--down` and the wordmark glow to match the shader tint.
- **Type pairing**: swap the Google Fonts pair (keep one bold mono for the wordmark).
- **Structure**: section count, order, case count, fin metrics, and nav all flex to the content (see "Adapting to the user").

Aim for a coherent identity per build: mark + shader tint + accent + glow should all agree.

## Construction method

1. **Create the output folder** and write these four files (full contents below):
   - `index.html` — the page (fill the placeholders in the skeleton)
   - `styles.css` — the complete design language (copy verbatim)
   - `app.js` — the runtime: shader, loader, cursor, scroll, reveals, HUD (copy verbatim)
   - `server.js` — a minimal static Node server (copy verbatim)
2. **Pick CDN resources**: choose a Google Fonts pair, the Lucide icon names you need, and image URLs (Unsplash or similar). Verify each URL returns `200` before wiring it in.
3. **Run** `node server.js` and open `http://localhost:3000`.

There are no files to leave untouched — you write all of them. `styles.css`, `app.js`, and `server.js` are reusable verbatim across any Binary site; you only meaningfully edit `index.html` and the CDN resource choices.

## Project manifest (every file after construction)

```
project/
   index.html     ← you write this (fill the skeleton)
   styles.css     ← copy verbatim (the design language)
   app.js         ← copy verbatim (standalone runtime)
   server.js      ← copy verbatim (plain static server)
```

Four text files. Zero binaries. The page pulls fonts, icons, and images from CDNs at runtime, so it needs network access to render fully (a graceful fallback covers the shader; see notes).

## Internet dependency and integrity

Because assets come from the internet, the page is not air-gapped. Keep these rules:

- **Verify every CDN URL returns `200`** before committing it. Unsplash photo IDs and Lucide icon names both change/exist unpredictably; never guess.
- **Pin Lucide** to a version (e.g. `lucide@0.460.0`) rather than `@latest` for reproducibility in anything beyond a demo.
- **Treat CDN content as untrusted**: only use well-known hosts (`fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com`, `images.unsplash.com`). Do not inject arbitrary third-party scripts.
- **No analytics, no trackers.** The page sends no telemetry.
- Images use Unsplash's dynamic params (`?w=1272&q=80&auto=format&fit=crop`) so you control size and format without storing files.

---

## index.html — DOM skeleton

Fill every `<!-- ... -->` placeholder. The class names, the `data-motion-text` attributes, the corner-cross SVGs, and the overall nesting must match — `styles.css` and `app.js` select on them. Icons are Lucide `<i data-lucide="name">` elements; the script swaps them for inline SVG on load.

```html
<!DOCTYPE html>
<html lang="en" class="boot-loading">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><!-- BRAND — SHORT PROPOSITION --></title>
    <meta name="description" content="<!-- 120-155 char description -->">
    <link rel="canonical" href="<!-- canonical URL -->">
    <!-- Favicon is an inline SVG data URI — no binary file. Reuse the chevron mark. -->
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 20'%3E%3Cpath d='M8 4V20L0 16V0L8 4ZM18 4V20L10 16V0L18 4ZM28 4V20L20 16V0L28 4Z' fill='white'/%3E%3C/svg%3E">
    <meta property="og:title" content="<!-- BRAND — PROPOSITION -->">
    <meta property="og:description" content="<!-- same as meta description -->">
    <meta property="og:url" content="<!-- canonical URL -->">
    <meta name="twitter:title" content="<!-- BRAND — PROPOSITION -->">
    <meta name="twitter:description" content="<!-- same as meta description -->">

    <!-- Fonts via Google Fonts (replaces local woff2). Pick any pair: a sans for body + a bold mono for the wordmark. -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;600&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="loader" aria-hidden="true">
      <div class="loaderContent">
        <svg width="49" height="35" viewBox="0 0 49 35" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 7V35L0 28V0L14 7ZM31.5 7V35L17.5 28V0L31.5 7ZM49 7V35L35 28V0L49 7Z" fill="white"/></svg>
        <div class="loadline"><div class="loading-bar"></div></div>
        <span class="loadpercent">0%</span>
      </div>
    </div>

    <div class="coursor"></div>
    <div class="noise"></div>

    <!-- WebGL shader hero background -->
    <div id="shader-stack" aria-hidden="true"><canvas id="shader-canvas"></canvas></div>
    <div class="edge-blur" aria-hidden="true"><div class="edge-blur__top"></div><div class="edge-blur__bottom"></div></div>

    <div class="frameScreen">
      <div class="progress">
        <div class="line"><div class="activeLine"></div></div>
        <div class="sections">
          <div class="sec"></div><div class="sec"></div><div class="sec"></div>
          <div class="subsec"></div><div class="subsec"></div><div class="subsec"></div><div class="subsec"></div><div class="subsec"></div>
          <div class="sec"></div>
        </div>
      </div>
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
      <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>

      <div class="header">
        <div class="logoBlock">
          <span class="logoText"><!-- BRAND --></span>
          <svg id="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 38.05" data-cursor-text="Enable sound"><title>Audio Wave</title><path d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"/><path d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"/><path d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"/><path d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"/><path d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"/><path d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"/><path d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"/><path d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"/><path d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"/></svg>
        </div>
        <ul class="mainMenu">
          <!-- 3-6 nav links. External links open in a new tab; internal links use #section ids. Icon = Lucide name. -->
          <li><a href="<!-- URL -->" class="link" target="_blank" rel="noopener noreferrer"><span class="link__label"><!-- LABEL --></span><i data-lucide="<!-- icon -->"></i></a></li>
        </ul>
      </div>

      <div class="footer">
        <div class="footerLeft">
          <div class="quote">
            <img src="<!-- avatar image URL (small square) -->" alt="<!-- alt -->" title="<!-- title -->">
            <p class="small"><!-- one-line tagline --></p>
          </div>
          <div class="fin">
            <!-- 3 finCards. Lucide icon + label + value + change indicator (up=green, down=red). -->
            <div class="finCard">
              <i data-lucide="<!-- icon -->" class="icon"></i>
              <div class="finText">
                <span class="finTitle"><!-- LABEL --></span>
                <span class="changePrice"><span class="finPrice"><!-- VALUE --></span><span class="finChange up"><i data-lucide="arrow-up-right"></i><!-- SUB --></span></span>
              </div>
            </div>
            <span class="divider"></span>
            <!-- ...two more finCards, separated by <span class="divider"></span>... -->
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
          </div>
        </div>
        <div class="scrollDown">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="3.5" width="10" height="15" rx="3.5" stroke="white"/><rect x="9.5" y="6" width="1" height="4" rx="0.5" fill="white"/></svg>
          <span>Scroll down</span>
        </div>
        <div class="footNumbers">
          <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
          <div class="footNumbersColumn"><div>Cursor X: <span data-debug-x>0</span></div><div>Cursor Y: <span data-debug-y>0</span></div></div>
          <span class="divider"></span>
          <div class="footNumbersColumn"><div>Scroll: <span data-debug-scroll>0</span></div><div>Time: <span data-debug-time>0</span></div></div>
        </div>
      </div>
    </div>

    <div id="hero-content">
      <div class="hero-inner">
        <div class="logoTitle">
          <svg class="mark" width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4V20L0 16V0L8 4ZM18 4V20L10 16V0L18 4ZM28 4V20L20 16V0L28 4Z" fill="white"/></svg>
          <h1><b><!-- PART 1 --></b> <span class="x"><i data-lucide="x"></i></span> <b><!-- PART 2 --></b> <!-- tagline --></h1>
        </div>
        <p><!-- hero description paragraph --></p>
        <a href="<!-- URL -->" class="btn" data-cursor-text="<!-- hover -->">
          <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
          <span><!-- BUTTON TEXT --></span></a>
      </div>
    </div>

    <div class="scroll-stage" aria-hidden="true"></div>

    <!-- SECTION: Spec/About -->
    <div class="section" id="spec">
      <div class="container">
        <ul class="tags" data-motion-text>
          <!-- 4-6 <li class="motion-piece">TAG</li> -->
        </ul>
        <h2 data-motion-text>
          <b><span class="motion-word"><!-- bold phrase --></span></b> <span class="motion-word"><!-- rest of heading --></span>
        </h2>
        <p class="bio" data-motion-text><span class="motion-piece"><!-- bio paragraph --></span></p>
        <ul class="btnGroup" data-motion-text>
          <li><a href="<!-- URL -->" class="btn motion-piece" data-cursor-text="<!-- hover -->"><!-- 4 corner crosses --><i data-lucide="<!-- icon -->"></i><span><!-- TEXT --></span></a></li>
          <li><a href="<!-- URL -->" class="btn secondary motion-piece" data-cursor-text="<!-- hover -->"><!-- 4 corner crosses --><i data-lucide="<!-- icon -->"></i><span><!-- TEXT --></span></a></li>
        </ul>
      </div>
    </div>

    <!-- SECTION: Cases/Modules -->
    <div class="section" id="cases">
      <div class="container">
        <div class="titleGroup">
          <h2 data-motion-text>
            <b><span class="motion-word"><!-- line 1 --></span></b>
            <a href="<!-- URL -->" target="_blank" rel="noopener noreferrer"><i data-lucide="<!-- icon -->"></i></a>
            <a href="<!-- URL -->" target="_blank" rel="noopener noreferrer"><i data-lucide="<!-- icon -->"></i></a>
            <span class="motion-word"><!-- line 2 --></span>
          </h2>
        </div>
        <ul class="tags" data-motion-text><li class="motion-piece"><!-- one tag --></li></ul>
      </div>
      <div class="caseList">
        <!-- 3-6 .case rows. CSS alternates direction on even rows. Cards are NON-INTERACTIVE
             (no click): the glitch effect is pure CSS on hover. Use 5 identical-URL layers. -->
        <div class="case">
          <div class="imageMask" aria-hidden="true">
            <div class="c-glitch" style="background-image: url('<!-- image URL -->');">
              <div class="c-glitch__img" style="background-image: url('<!-- image URL -->');"></div>
              <div class="c-glitch__img" style="background-image: url('<!-- image URL -->');"></div>
              <div class="c-glitch__img" style="background-image: url('<!-- image URL -->');"></div>
              <div class="c-glitch__img" style="background-image: url('<!-- image URL -->');"></div>
              <div class="c-glitch__img" style="background-image: url('<!-- image URL -->');"></div>
            </div>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="topright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomleft"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg><svg width="5" height="5" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg" class="bottomright"><path d="M3 2H5V3H3V5H2V3H0V2H2V0H3V2Z" fill="#D9D9D9"/></svg>
          </div>
          <div class="caseInfo" data-motion-text>
            <ul class="tags"><li class="motion-piece"><!-- tag --></li><li class="motion-piece"><!-- tag --></li></ul>
            <h3 class="motion-piece"><!-- case title --></h3>
            <p class="motion-piece"><!-- case description --></p>
            <a href="<!-- URL -->" class="btn motion-piece" data-cursor-text="<!-- hover -->"><!-- 4 corner crosses --><span><!-- BUTTON TEXT --></span></a>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: List (2-3 column layout) -->
    <div class="section lalalast" id="exp">
      <div class="container last">
        <div class="block"><div class="col" data-motion-text>
          <h3 class="small motion-piece"><!-- column heading --></h3>
          <ul class="list">
            <li class="motion-piece"><span class="date"><!-- optional date --></span><h4><!-- item heading --></h4><p><!-- item body --></p></li>
          </ul>
        </div></div>
        <!-- up to 3 .block columns -->
      </div>
      <div class="container vse" data-motion-text>
        <div class="vseText"><!-- one <span> per brand letter --></div>
      </div>
    </div>

    <!-- Icons via Lucide CDN (replaces the local icon font). Pin a version in production. -->
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="/app.js"></script>
</body>
</html>
```

---

## Logo mark — pick or compose one per build (don't reuse the same glyph every time)

The default chevron (three sheared bars) appears in three places that must all use the **same** mark: the favicon data-URI (`<link rel="icon">`), the hero `svg.mark`, and the loader SVG. To keep each site original while staying on-brand, choose a *different* mark from the set below (or compose your own) and use it consistently in all three spots.

**Style rules for any Binary mark:** monochrome white on transparent, geometric, 1–3 primitive shapes, no gradients, no rounded "friendly" curves, reads at 20px. Think instrument panel, not app icon. Keep a ~28×20 or square viewBox.

```html
<!-- A. Sheared bars (default) -->
<svg class="mark" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4V20L0 16V0L8 4ZM18 4V20L10 16V0L18 4ZM28 4V20L20 16V0L28 4Z" fill="white"/></svg>

<!-- B. Nested brackets -->
<svg class="mark" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 1L2 10l7 9M19 1l7 9-7 9" stroke="white" stroke-width="2" fill="none"/></svg>

<!-- C. Stacked grid (2×2 with one filled) -->
<svg class="mark" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="8" height="8" fill="white"/><rect x="11" y="1" width="8" height="8" stroke="white"/><rect x="1" y="11" width="8" height="8" stroke="white"/><rect x="11" y="11" width="8" height="8" stroke="white"/></svg>

<!-- D. Concentric squares (aperture) -->
<svg class="mark" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="18" height="18" stroke="white"/><rect x="6" y="6" width="8" height="8" stroke="white"/><rect x="9" y="9" width="2" height="2" fill="white"/></svg>

<!-- E. Ascending blocks (bar chart) -->
<svg class="mark" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="12" width="6" height="8" fill="white"/><rect x="8" y="6" width="6" height="14" fill="white"/><rect x="16" y="0" width="6" height="20" fill="white"/></svg>

<!-- F. Diagonal slash field -->
<svg class="mark" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L14 0M11 20L21 0" stroke="white" stroke-width="2"/><path d="M0 20L4 12" stroke="white" stroke-width="2"/></svg>
```

To use a mark in the **favicon**, URL-encode the same SVG into the `<link rel="icon" href="data:image/svg+xml,...">` (encode `<`→`%3C`, `>`→`%3E`, `#`→`%23`, spaces→`%20`, `"`→`'`). The loader's larger glyph can be the same mark scaled up, or keep the default loader bars — but the favicon and hero `svg.mark` must match.

**Pair the mark with the shader tint and wordmark glow** so the identity is cohesive: a teal build uses mark + `tint:[0.42,0.80,0.86]` + teal glow; an ember build uses mark + `tint:[1.0,0.55,0.30]` + warm glow.

---

## styles.css — the design language (copy verbatim)

This is the complete stylesheet. Copy it as-is. The only values you might tune are the accent colors in `:root` (`--up`, `--down`) and the wordmark glow hue in `.vseText span` / `@keyframes vseGlow`. Everything else is structural.

Key behaviors baked in:
- **Custom cursor is pointer-centered** via `transform: ... translate(-50%,-50%)` plus `will-change: transform`; the `.dot` state is a clean 7px dot with no padding box. (`app.js` supplies the snappy follow.)
- **Scroll cue (`.scrollDown`) and avatar (`.quote`) fade together** when the user starts scrolling (>40px), via the shared `.hidden` class; both fade back in at the top.
- **Footer fin cards (`.fin`) and the debug HUD (`.footNumbers`) fade out only at the very bottom** of the page (`scrollY >= max - 4`) and fade back in as soon as you scroll up. `app.js` drives all four toggles in `onScroll`.
- **Wordmark (`.vseText`) glows** with a layered `text-shadow` and a staggered `vseGlow` pulse per letter; disabled under `prefers-reduced-motion`.
- **Responsive**: desktop frame chrome (progress rail, footer cards, scroll cue) is shed on phones; the hero converts from a fixed overlay to an in-flow block so it can never clip on small screens.

```css
/* =========================================================================
   BINARY — standalone design language
   No local font/image/JS binaries. Fonts via Google Fonts, icons via Lucide,
   imagery via Unsplash, hero via a hand-written WebGL shader.
   ========================================================================= */

:root {
  --bg: #0f0f0f;
  --line: rgb(255 255 255 / 10%);
  --dim: rgb(255 255 255 / 60%);
  --up: #7dd493;
  --down: #fb8989;
  --mono: "JetBrains Mono", ui-monospace, "Cartograph Mono CF", monospace;
  --sans: "Inter", system-ui, sans-serif;
  --hero-scale: 1;
  --hero-opacity: 1;
  --hero-blur: 0px;
}

* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); }
html { scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar {
  display: none !important; width: 0 !important; height: 0 !important; background: transparent !important;
}
body {
  font-family: var(--sans);
  color: #fff;
  overflow-x: hidden;
  cursor: none;
}
@media (pointer: coarse) { body { cursor: auto; } }
a { color: inherit; }

/* ---------- Loader ---------- */
.loader { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: var(--bg); transition: opacity .5s ease, visibility .5s ease; }
.loader.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.loaderContent { display: flex; flex-direction: column; align-items: center; gap: 20px; }
.loaderContent svg { display: block; width: 30px; height: auto; }
.loadline { position: relative; width: 200px; height: 1px; overflow: hidden; background: rgb(255 255 255 / 10%); }
.loading-bar { position: absolute; inset: 0 auto 0 0; width: 0%; height: 1px; background: #fff; transition: width .2s linear; }
.loadpercent { font-family: var(--mono); font-size: 12px; letter-spacing: 1px; color: #fff; }
.boot-loading body > :not(.loader) { opacity: 0 !important; visibility: hidden !important; }

/* ---------- Custom cursor (pointer-centered, no offset drift) ---------- */
.coursor {
  position: fixed; top: 0; left: 0; z-index: 9990; padding: 4px 8px 5px;
  background: #ffffff1a; backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
  font-family: var(--mono); text-transform: uppercase; font-size: 11px; letter-spacing: .5px;
  border-radius: 2px; pointer-events: none; transform: translate3d(-100px,-100px,0) translate(-50%,-50%);
  transition: opacity .2s ease; opacity: 0; white-space: nowrap; will-change: transform;
}
.coursor.dot { padding: 0; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; }
.coursor.dot::after { content: ""; display: block; width: 7px; height: 7px; background: #fff; border-radius: 50%; }
@media (pointer: coarse) { .coursor { display: none; } }

/* ---------- Noise overlay (generated SVG turbulence, no binary) ---------- */
.noise {
  position: fixed; left: -25%; top: -25%; width: 150%; height: 150%;
  pointer-events: none; z-index: 99; opacity: .09; will-change: transform;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: noise .12s steps(2) infinite;
}
@keyframes noise {
  0% { transform: translate(0,0); } 25% { transform: translate(-4%,2%); }
  50% { transform: translate(3%,-3%); } 75% { transform: translate(-2%,4%); } 100% { transform: translate(2%,-1%); }
}

/* ---------- WebGL shader hero background ---------- */
#shader-stack { position: fixed; inset: 0; z-index: 1; overflow: hidden; }
#shader-canvas { display: block; width: 100%; height: 100%; }
.edge-blur { position: fixed; inset: 0; z-index: 8; pointer-events: none; }
.edge-blur__top, .edge-blur__bottom { position: absolute; left: 0; width: 100%; height: 90px; background: #0000000f; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); -webkit-mask-image: linear-gradient(to bottom, #000, transparent); }
.edge-blur__top { top: 0; }
.edge-blur__bottom { bottom: 0; transform: scaleY(-1); }

/* ---------- Fixed frame ---------- */
.frameScreen { position: fixed; z-index: 50; inset: 10px; border: 1px solid var(--line); display: flex; flex-direction: column; justify-content: space-between; pointer-events: none; }
.topleft, .topright, .bottomleft, .bottomright { position: absolute; }
.topleft { top: -3px; left: -3px; } .topright { top: -3px; right: -3px; }
.bottomleft { bottom: -3px; left: -3px; } .bottomright { bottom: -3px; right: -3px; }

/* progress rail */
.progress { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 10px; height: 250px; display: flex; align-items: center; }
.progress .line { position: relative; width: 1px; height: 100%; background: var(--line); margin: 0 auto; }
.progress .activeLine { position: absolute; top: 0; left: 0; width: 1px; height: 100%; background: #fff; transform-origin: top; transform: scaleY(0); }
.progress .sections { position: absolute; left: 4px; top: 0; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.sec, .subsec { background: var(--line); height: 1px; }
.sec { width: 7px; } .subsec { width: 4px; }

/* header */
.header { display: flex; flex-direction: row; justify-content: space-between; padding: 10px 20px; border-bottom: 1px solid var(--line); align-items: center; pointer-events: auto; position: relative; }
.logoBlock { display: flex; align-items: center; gap: 14px; }
.logoText { font-family: var(--mono); font-weight: 700; font-size: 14px; color: #fff; letter-spacing: .08em; text-transform: uppercase; }
#wave { width: 26px; height: auto; cursor: pointer; }
#wave path { fill: #fff; transform-box: fill-box; transform-origin: center; animation: pulse 1.2s ease-in-out infinite; }
#wave path:nth-child(2){animation-delay:.15s}#wave path:nth-child(3){animation-delay:.3s}#wave path:nth-child(4){animation-delay:.45s}#wave path:nth-child(5){animation-delay:.6s}#wave path:nth-child(6){animation-delay:.75s}#wave path:nth-child(7){animation-delay:.9s}#wave path:nth-child(8){animation-delay:1.05s}#wave path:nth-child(9){animation-delay:1.2s}
@keyframes pulse { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.45); } }

.mainMenu { display: flex; gap: 18px; margin: 0; padding: 0; list-style: none; }
.mainMenu li { position: relative; }
.link { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: .5px; color: var(--dim); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 4px 2px; transition: color .2s ease; }
.link:hover { color: #fff; }
.link svg { width: 11px; height: 11px; opacity: .6; }

/* footer */
.footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 0; pointer-events: auto; }
.footerLeft { display: flex; flex-direction: column; }
.quote { display: flex; align-items: center; gap: 12px; padding: 12px; transition: opacity .4s ease, transform .4s ease; }
.quote.hidden { opacity: 0; transform: translateY(8px); pointer-events: none; }
.quote img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.quote .small { margin: 0; font-size: 12px; color: var(--dim); max-width: 220px; line-height: 1.35; }
.fin { display: flex; flex-direction: row; gap: 16px; padding: 12px; border-top: 1px solid var(--line); border-right: 1px solid var(--line); position: relative; transition: opacity .4s ease, transform .4s ease; }
.fin.hidden { opacity: 0; transform: translateY(8px); pointer-events: none; }
.finCard { display: flex; gap: 8px; align-items: center; }
.finCard svg.icon { width: 22px; height: 22px; padding: 5px; border-radius: 50%; background: #ffffff1a; color: #fff; }
.finText { display: flex; flex-direction: column; gap: 2px; }
.finTitle { font-family: var(--mono); font-size: 10px; letter-spacing: 1px; color: var(--dim); text-transform: uppercase; }
.changePrice { display: flex; align-items: baseline; gap: 6px; }
.finPrice { font-family: var(--mono); font-size: 13px; }
.finChange { display: inline-flex; align-items: center; gap: 2px; font-family: var(--mono); font-size: 10px; }
.finChange svg { width: 9px; height: 9px; }
.finChange.up { color: var(--up); } .finChange.down { color: var(--down); }
.divider { width: 1px; align-self: stretch; background: var(--line); }

/* scroll cue — absolutely centered at frame bottom, hides on scroll */
.scrollDown { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--dim); transition: opacity .4s ease, transform .4s ease; }
.scrollDown.hidden { opacity: 0; transform: translateX(-50%) translateY(10px); pointer-events: none; }
.scrollDown svg { width: 20px; height: 20px; animation: bob 1.6s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.scrollDown span { font-family: var(--mono); font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }

.footNumbers { position: relative; display: flex; gap: 16px; padding: 12px; border-top: 1px solid var(--line); border-left: 1px solid var(--line); font-family: var(--mono); font-size: 10px; color: var(--dim); transition: opacity .4s ease, transform .4s ease; }
.footNumbers.hidden { opacity: 0; transform: translateY(8px); pointer-events: none; }
.footNumbersColumn { display: flex; flex-direction: column; gap: 2px; }

/* ---------- Hero ---------- */
#hero-content { position: fixed; inset: 0; z-index: 9; display: grid; place-items: center; pointer-events: none; }
.hero-inner { pointer-events: auto; max-width: 440px; padding: 0 24px; display: flex; flex-direction: column; align-items: center; gap: 18px; text-align: center; transform: scale(var(--hero-scale)); opacity: var(--hero-opacity); filter: blur(var(--hero-blur)); transition: transform .1s linear; }
.logoTitle { display: flex; flex-direction: column; align-items: center; gap: 22px; }
.logoTitle > svg.mark { width: 30px; height: auto; }
.hero-inner h1 { font-family: var(--sans); font-weight: 300; font-size: clamp(22px, 3vw, 30px); line-height: 1.25; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
.hero-inner h1 b { font-weight: 600; }
.hero-inner h1 .x { display: inline-flex; vertical-align: middle; margin: 0 2px; }
.hero-inner h1 .x svg { width: 14px; height: 14px; }
.hero-inner p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--dim); }

/* ---------- Buttons with corner crosses ---------- */
.btn { font-family: var(--mono); font-size: 12px; line-height: 1.2; text-decoration: none; color: #fff; border: 1px solid var(--line); padding: 16px 20px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; position: relative; transition: background .2s ease, border-color .2s ease; text-transform: uppercase; letter-spacing: .5px; background: #ffffff05; }
.btn:hover { background: #ffffff12; border-color: rgb(255 255 255 / 25%); }
.btn.secondary { background: transparent; }
.btn .topleft, .btn .topright, .btn .bottomleft, .btn .bottomright { opacity: 0; transition: opacity .2s ease; }
.btn:hover .topleft, .btn:hover .topright, .btn:hover .bottomleft, .btn:hover .bottomright { opacity: 1; }
.btnGroup { display: flex; gap: 12px; list-style: none; padding: 0; margin: 0; flex-wrap: wrap; }

/* ---------- Sections ---------- */
.scroll-stage { height: 100vh; }
.section { position: relative; z-index: 10; padding: 120px 0; background: linear-gradient(180deg, transparent, #0f0f0fcc 12%, #0f0f0f 30%, #0f0f0f 70%, #0f0f0fcc 88%, transparent); }
.section:first-of-type { background: linear-gradient(180deg, transparent, #0f0f0f 22%, #0f0f0f 100%); }
.container { width: min(1100px, 90vw); margin: 0 auto; }
.container.last { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; align-items: start; }
@media (max-width: 860px) { .container.last { grid-template-columns: 1fr; } }

.tags { display: flex; flex-wrap: wrap; list-style: none; gap: 10px; text-transform: uppercase; font-size: 12px; line-height: 1.2; color: #fff9; margin: 0 0 28px; padding: 0; letter-spacing: 1px; font-family: var(--mono); }
.tags li { position: relative; padding-left: 14px; }
.tags li::before { content: "+"; position: absolute; left: 0; color: #fff6; }

.section h2 { font-family: var(--sans); font-weight: 300; font-size: clamp(26px, 4vw, 44px); line-height: 1.18; letter-spacing: 1px; margin: 0 0 28px; }
.section h2 b { font-weight: 600; }
.section h2 a { display: inline-flex; vertical-align: middle; margin: 0 6px; opacity: .7; }
.section h2 a svg { width: 22px; height: 22px; }
.section h2 a:hover { opacity: 1; }
.bio { font-size: 15px; line-height: 1.6; color: var(--dim); max-width: 640px; margin: 0 0 32px; }

.titleGroup { margin-bottom: 32px; }

/* ---------- Case list ---------- */
.caseList { width: min(1100px, 90vw); margin: 60px auto 0; display: flex; flex-direction: column; gap: 120px; }
.case { display: flex; gap: 48px; align-items: center; }
.case:nth-child(even) { flex-direction: row-reverse; }

.imageMask { position: relative; flex: 0 0 auto; width: min(560px, 100%); }
.c-glitch { position: relative; width: 100%; aspect-ratio: 636 / 400; overflow: hidden; filter: saturate(.5); background-size: cover; background-position: 50% 50%; }
.c-glitch__img { position: absolute; inset: 0; background-size: cover; background-position: 50% 50%; }
.c-glitch__img:nth-child(1) { z-index: 5; }
.imageMask:hover .c-glitch__img:nth-child(2) { animation: glitch-a .4s steps(2) infinite; mix-blend-mode: screen; }
.imageMask:hover .c-glitch__img:nth-child(3) { animation: glitch-b .4s steps(2) infinite; mix-blend-mode: screen; }
.imageMask:hover .c-glitch__img:nth-child(4) { animation: glitch-a .3s steps(3) infinite reverse; mix-blend-mode: screen; opacity: .6; }
.imageMask:hover .c-glitch__img:nth-child(5) { animation: glitch-b .25s steps(2) infinite; mix-blend-mode: screen; opacity: .5; }
@keyframes glitch-a { 0%{clip-path:inset(10% 0 80% 0);transform:translate(-4px,0)} 50%{clip-path:inset(50% 0 30% 0);transform:translate(4px,0)} 100%{clip-path:inset(70% 0 10% 0);transform:translate(-2px,0)} }
@keyframes glitch-b { 0%{clip-path:inset(60% 0 20% 0);transform:translate(4px,0)} 50%{clip-path:inset(20% 0 60% 0);transform:translate(-5px,0)} 100%{clip-path:inset(40% 0 40% 0);transform:translate(3px,0)} }
.imageMask .topleft, .imageMask .topright, .imageMask .bottomleft, .imageMask .bottomright { z-index: 6; }

.caseInfo { display: flex; flex-direction: column; flex: 1; }
.caseInfo .tags { margin-bottom: 16px; }
.caseInfo h3 { font-family: var(--sans); font-weight: 600; font-size: 24px; margin: 0 0 12px; letter-spacing: .5px; }
.caseInfo p { margin: 0 0 24px; color: var(--dim); font-size: 14px; line-height: 1.55; max-width: 420px; }
.caseInfo .btn { align-self: flex-start; }

/* ---------- List section ---------- */
.lalalast { padding-bottom: 60px; }
.col h3.small { font-family: var(--mono); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: var(--dim); margin: 0 0 24px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 28px; }
.list li { display: flex; flex-direction: column; gap: 6px; }
.list .date { font-family: var(--mono); font-size: 11px; color: #fff7; letter-spacing: .5px; }
.list h4 { font-size: 15px; font-weight: 600; margin: 0; }
.list h4 .soon { font-family: var(--mono); font-weight: 400; font-size: 10px; color: var(--up); letter-spacing: 1px; }
.list p { margin: 0; font-size: 13px; line-height: 1.5; color: var(--dim); }
.list .logo { width: 26px; height: auto; margin-bottom: 4px; color: #fff; }
.list .btn { align-self: flex-start; margin-top: 6px; }

/* wordmark — layered glow + staggered per-letter pulse */
.vse { width: 100%; max-width: 100%; padding: 0; margin-top: 100px; }
.vseText { display: flex; justify-content: space-between; width: 100%; padding: 0 clamp(.5rem, 2vw, 2rem); }
.vseText span {
  font-family: var(--mono); font-weight: 700; font-size: clamp(3rem, 14vw, 11rem);
  color: #fff; text-transform: uppercase; line-height: 1; flex-shrink: 0;
  text-shadow: 0 0 14px rgba(255,255,255,0.35), 0 0 42px rgba(125,212,147,0.30), 0 0 90px rgba(125,212,147,0.18);
  animation: vseGlow 4s ease-in-out infinite;
}
.vseText span:nth-child(2) { animation-delay: .4s; }
.vseText span:nth-child(3) { animation-delay: .8s; }
.vseText span:nth-child(4) { animation-delay: 1.2s; }
.vseText span:nth-child(5) { animation-delay: 1.6s; }
.vseText span:nth-child(6) { animation-delay: 2s; }
.vseText span:nth-child(7) { animation-delay: 2.4s; }
@keyframes vseGlow {
  0%, 100% { text-shadow: 0 0 14px rgba(255,255,255,0.30), 0 0 42px rgba(125,212,147,0.22), 0 0 90px rgba(125,212,147,0.12); }
  50% { text-shadow: 0 0 20px rgba(255,255,255,0.55), 0 0 60px rgba(125,212,147,0.45), 0 0 120px rgba(125,212,147,0.28); }
}
@media (prefers-reduced-motion: reduce) { .vseText span { animation: none; } }

/* ---------- Scroll reveal ---------- */
[data-motion-text] .motion-piece,
[data-motion-text].motion-piece,
.motion-word, .motion-inline-piece {
  opacity: .16; filter: blur(10px); transform: translateY(28px);
  transition: opacity .55s ease, filter .55s ease, transform .55s ease;
}
.revealed .motion-piece, .revealed.motion-piece,
.revealed .motion-word, .revealed .motion-inline-piece {
  opacity: 1; filter: blur(0); transform: translateY(0);
}
.revealed .motion-piece { transition-delay: calc(var(--i, 0) * 60ms); }

/* =========================================================================
   Responsive — tablet & phone
   The frame HUD (progress rail, footer cards, scroll cue) is desktop chrome;
   on small screens we shed it and let content breathe.
   ========================================================================= */

/* Tablet */
@media (max-width: 900px) {
  .frameScreen { inset: 6px; }
  .header { padding: 10px 14px; }
  .mainMenu { gap: 12px; }
  .link__label { display: none; }            /* icon-only nav on tablet */
  .link svg, .link i { width: 15px; height: 15px; opacity: .8; }
  .section { padding: 90px 0; }
  .caseList { gap: 80px; }
  .case { gap: 32px; }
}

/* Phone */
@media (max-width: 600px) {
  body { cursor: auto; }                      /* native cursor on touch */
  .coursor { display: none; }

  /* Shed desktop frame chrome that crowds small screens */
  .frameScreen { position: absolute; inset: 0; border: none; }
  .frameScreen > .topleft, .frameScreen > .topright,
  .frameScreen > .bottomleft, .frameScreen > .bottomright { display: none; }
  .progress, .footer, .scrollDown { display: none; }

  /* Header becomes a simple top bar */
  .header { position: fixed; top: 0; left: 0; right: 0; z-index: 60; background: #0f0f0fcc; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
  .mainMenu { gap: 14px; }

  /* Hero: switch from fixed overlay to in-flow block so it can't clip */
  #hero-content { position: relative; min-height: 100svh; padding-top: 64px; }
  .hero-inner { transform: none !important; opacity: 1 !important; filter: none !important; max-width: 100%; }
  .hero-inner h1 { font-size: clamp(20px, 6vw, 26px); }
  .hero-inner p { font-size: 13px; }
  .scroll-stage { display: none; }            /* no parallax spacer needed */

  /* Shader stays but as a static-ish backdrop; keep it cheap */
  #shader-stack { position: fixed; }

  .section { padding: 64px 0; }
  .section:first-of-type { background: #0f0f0f; }
  .container { width: 90vw; }
  .section h2 { font-size: clamp(24px, 7vw, 32px); }
  .bio { font-size: 14px; }

  .caseList { gap: 56px; margin-top: 32px; }
  .case, .case:nth-child(even) { flex-direction: column; gap: 18px; }
  .imageMask { width: 100%; }
  .caseInfo h3 { font-size: 20px; }
  .caseInfo p, .caseInfo .btn { max-width: 100%; }

  .btn { padding: 14px 16px; }
  .btnGroup { width: 100%; }
  .btnGroup .btn { flex: 1; }

  .container.last { gap: 32px; }
  .vse { margin-top: 56px; }
  .vseText span { font-size: clamp(2.2rem, 16vw, 5rem); }
}

/* Very small phones */
@media (max-width: 380px) {
  .mainMenu { gap: 10px; }
  .hero-inner h1 { letter-spacing: 1px; }
}

/* Respect reduced-motion across decorative animations */
@media (prefers-reduced-motion: reduce) {
  .noise { animation: none; }
  .scrollDown svg { animation: none; }
  #wave path { animation: none; }
}
```

---

## app.js — the runtime (copy verbatim)

Standalone, no dependencies (Lucide is loaded separately in the HTML for icons). Handles the WebGL shader, loader, custom cursor, scroll progress + hero transform + debug HUD, scroll-reveal motion, and the audio-wave toggle.

**Shader knobs.** The hero shader is re-skinnable from one config object at the top of `initShader()` — no GLSL editing required:

```js
const SHADER = {
  speed: 0.9,                         // time rate (0.2 calm … 2.0 frantic)
  scale: 2.35,                        // field zoom (1.8 large soft blobs … 3.0 fine detail)
  warp: 1.15,                         // domain-warp strength (0.6 gentle … 1.8 turbulent)
  grid: 8.0,                          // scanline density (6 wide … 14 tight); 0 = no grid
  tint: [0.42, 0.80, 0.86],           // accent filament color, 0–1 per channel
  intensity: 1.05,                    // accent brightness multiplier
  base: [[0.03,0.03,0.045],[0.09,0.10,0.13]], // [shadow, midtone] of the dark field
};
```

- **Vary these per build** so no two Binary sites look identical. Either pick a preset below or randomize within the ranges in the comments.
- `tint` is the strongest brand lever — match it to the accent color. `base` shifts the whole field warm/cool; `grid: 0` removes the scanline texture for a softer look; lower `warp` + `scale` reads calmer, higher reads more turbulent/technical.

**Variation presets** (drop any one into `SHADER` — each is on-brand but distinct):

| Name | speed | scale | warp | grid | tint | base shadow→mid |
|---|---|---|---|---|---|---|
| Steel (neutral) | 1.0 | 2.2 | 1.0 | 9 | `[0.16,0.17,0.20]` | `[0.03,0.03,0.04]→[0.10,0.11,0.13]` |
| Teal (default) | 0.9 | 2.35 | 1.15 | 8 | `[0.42,0.80,0.86]` | `[0.03,0.03,0.045]→[0.09,0.10,0.13]` |
| Indigo | 0.8 | 2.5 | 1.0 | 10 | `[0.55,0.62,1.0]` | `[0.03,0.03,0.05]→[0.09,0.10,0.16]` |
| Ember | 1.1 | 2.1 | 1.3 | 7 | `[1.0,0.55,0.30]` | `[0.04,0.03,0.03]→[0.13,0.10,0.09]` |
| Acid | 1.3 | 2.7 | 1.5 | 12 | `[0.70,0.95,0.35]` | `[0.03,0.04,0.03]→[0.09,0.12,0.09]` |
| Mono (calm) | 0.7 | 2.0 | 0.7 | 0 | `[0.60,0.62,0.66]` | `[0.03,0.03,0.04]→[0.10,0.10,0.12]` |

**Performance / mobile.** `resize()` caps `devicePixelRatio` at 2 on desktop but 1.3 on coarse-pointer devices, and the RAF loop pauses on `visibilitychange`, so the shader is cheap on phones and idle tabs.

```javascript
/* =========================================================================
   BINARY standalone runtime — no bundler.
   Handles: WebGL shader hero, loader, custom cursor, scroll progress,
   scroll-reveal motion, hero scroll transform, debug HUD, audio wave toggle.
   ========================================================================= */
(() => {
  "use strict";

  /* ---------------- WebGL shader hero ---------------- */
  // Tunable knobs — vary these per build so no two Binary sites look alike.
  //   speed     — flow rate (0.2 calm … 2.0 frantic)
  //   scale     — field zoom (1.8 soft blobs … 3.0 fine detail)
  //   warp      — domain-warp strength (0.6 gentle … 1.8 turbulent)
  //   grid      — scanline density (6 wide … 14 tight); 0 disables the grid
  //   tint      — RGB of the bright filaments / accent (0–1 per channel)
  //   intensity — brightness multiplier of the accent filaments
  //   base      — [shadow, midtone] RGB of the dark field
  const SHADER = {
    speed: 0.9,
    scale: 2.35,
    warp: 1.15,
    grid: 8.0,
    tint: [0.42, 0.80, 0.86],
    intensity: 1.05,
    base: [[0.03, 0.03, 0.045], [0.09, 0.10, 0.13]],
  };

  function initShader() {
    const canvas = document.getElementById("shader-canvas");
    if (!canvas) return;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) { document.getElementById("shader-stack").style.background = "#0b0b0d"; return; }

    const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

    // Domain-warped fractal noise field — a slow, dark "data flow" background.
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec3 u_tint;
      uniform float u_intensity;
      uniform float u_scale;
      uniform float u_warp;
      uniform float u_grid;
      uniform vec3 u_base0;
      uniform vec3 u_base1;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v = 0.0, amp = 0.5;
        for(int i=0;i<6;i++){ v += amp*noise(p); p *= 2.02; amp *= 0.5; }
        return v;
      }
      void main(){
        vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
        float t = u_time;
        vec2 m = (u_mouse - 0.5) * 0.6;
        float s = u_scale;

        vec2 q = vec2(fbm(uv*s + t + m), fbm(uv*s - t*0.8));
        vec2 r = vec2(fbm(uv*s + q*u_warp + t*0.5), fbm(uv*s + q*u_warp - t*0.4));
        float f = fbm(uv*s + r*1.8);

        // optional grid scanline accent
        float grid = 1.0;
        if (u_grid > 0.0) {
          vec2 g = abs(fract(uv*u_grid) - 0.5);
          grid = smoothstep(0.0, 0.02, min(g.x, g.y));
        }

        float v = pow(f, 1.7);
        vec3 base = mix(u_base0, u_base1, v);
        base += u_tint * pow(r.x, 3.0) * 0.9 * u_intensity;     // bright filaments (tinted)
        base *= mix(0.92, 1.0, grid);                           // faint grid
        float vig = smoothstep(1.25, 0.2, length(uv));
        base *= vig;
        gl_FragColor = vec4(base, 1.0);
      }`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    const prog = gl.createProgram();
    const vs = compile(gl.VERTEX_SHADER, vert), fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTint = gl.getUniformLocation(prog, "u_tint");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");
    const uScale = gl.getUniformLocation(prog, "u_scale");
    const uWarp = gl.getUniformLocation(prog, "u_warp");
    const uGrid = gl.getUniformLocation(prog, "u_grid");
    const uBase0 = gl.getUniformLocation(prog, "u_base0");
    const uBase1 = gl.getUniformLocation(prog, "u_base1");
    // static uniforms set once
    gl.uniform3f(uTint, SHADER.tint[0], SHADER.tint[1], SHADER.tint[2]);
    gl.uniform1f(uIntensity, SHADER.intensity);
    gl.uniform1f(uScale, SHADER.scale);
    gl.uniform1f(uWarp, SHADER.warp);
    gl.uniform1f(uGrid, SHADER.grid);
    gl.uniform3f(uBase0, SHADER.base[0][0], SHADER.base[0][1], SHADER.base[0][2]);
    gl.uniform3f(uBase1, SHADER.base[1][0], SHADER.base[1][1], SHADER.base[1][2]);
    const mouse = { x: 0.5, y: 0.5 };
    window.addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth; mouse.y = 1 - e.clientY / innerHeight; });

    // Smaller, cheaper buffer on phones/tablets; cap DPR harder on coarse pointers.
    const coarse = matchMedia("(pointer: coarse)").matches;
    function resize() {
      const dprCap = coarse ? 1.3 : 2;
      const dpr = Math.min(devicePixelRatio || 1, dprCap);
      const w = Math.floor(innerWidth * dpr), h = Math.floor(innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resize); resize();

    const start = performance.now();
    let raf;
    function frame(now) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, ((now - start) / 1000) * 0.04 * SHADER.speed);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    });
  }

  /* ---------------- Loader ---------------- */
  function initLoader() {
    const loader = document.querySelector(".loader");
    const bar = document.querySelector(".loading-bar");
    const pct = document.querySelector(".loadpercent");
    document.documentElement.classList.remove("boot-loading");
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 18 + 6);
      if (bar) bar.style.width = p + "%";
      if (pct) pct.textContent = Math.round(p) + "%";
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => loader && loader.classList.add("is-hidden"), 250);
      }
    }, 120);
  }

  /* ---------------- Custom cursor (centered on pointer, snappy follow) ---------------- */
  function initCursor() {
    const cur = document.querySelector(".coursor");
    if (!cur || matchMedia("(pointer: coarse)").matches) return;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY; cur.style.opacity = "1";
      const t = e.target.closest("[data-cursor-text]");
      if (t) { cur.textContent = t.getAttribute("data-cursor-text"); cur.classList.remove("dot"); }
      else { cur.textContent = ""; cur.classList.add("dot"); }
    });
    window.addEventListener("pointerleave", () => cur.style.opacity = "0");
    document.addEventListener("mouseleave", () => cur.style.opacity = "0");
    (function loop() {
      // snappier follow + centered on the real pointer (no offset drift)
      x += (tx - x) * 0.35; y += (ty - y) * 0.35;
      cur.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- Scroll progress + hero transform + debug HUD ---------------- */
  function initScroll() {
    const active = document.querySelector(".activeLine");
    const scrollDown = document.querySelector(".scrollDown");
    const quote = document.querySelector(".quote");
    const fin = document.querySelector(".fin");
    const footNumbers = document.querySelector(".footNumbers");
    const dbgX = document.querySelector("[data-debug-x]");
    const dbgY = document.querySelector("[data-debug-y]");
    const dbgScroll = document.querySelector("[data-debug-scroll]");
    const dbgTime = document.querySelector("[data-debug-time]");
    const root = document.documentElement;
    const t0 = performance.now();

    window.addEventListener("pointermove", (e) => {
      if (dbgX) dbgX.textContent = e.clientX;
      if (dbgY) dbgY.textContent = e.clientY;
    });

    function onScroll() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const sp = max > 0 ? scrollY / max : 0;
      if (active) active.style.transform = `scaleY(${sp})`;
      if (dbgScroll) dbgScroll.textContent = sp.toFixed(3);
      // scroll cue + avatar quote fade out once the user starts scrolling
      const scrolled = scrollY > 40;
      if (scrollDown) scrollDown.classList.toggle("hidden", scrolled);
      if (quote) quote.classList.toggle("hidden", scrolled);
      // fin cards + debug HUD fade out only at the very bottom of the page
      const atBottom = max > 0 && scrollY >= max - 4;
      if (fin) fin.classList.toggle("hidden", atBottom);
      if (footNumbers) footNumbers.classList.toggle("hidden", atBottom);
      // hero recedes as you scroll past the first viewport
      const k = Math.min(1, scrollY / innerHeight);
      root.style.setProperty("--hero-scale", (1 - k * 0.12).toFixed(3));
      root.style.setProperty("--hero-opacity", (1 - k * 1.1).toFixed(3));
      root.style.setProperty("--hero-blur", (k * 8).toFixed(2) + "px");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    setInterval(() => { if (dbgTime) dbgTime.textContent = ((performance.now() - t0) / 1000).toFixed(1) + "s"; }, 100);
  }

  /* ---------------- Scroll-reveal motion ---------------- */
  function initReveal() {
    document.querySelectorAll("[data-motion-text]").forEach((block) => {
      block.querySelectorAll(":scope > *, .motion-piece").forEach((el, i) => el.style.setProperty("--i", i % 12));
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll("[data-motion-text]").forEach((el) => io.observe(el));
  }

  /* ---------------- Audio wave toggle (visual only, optional WebAudio hum) ---------------- */
  function initWave() {
    const wave = document.getElementById("wave");
    if (!wave) return;
    let ctx = null, osc = null, on = false;
    wave.addEventListener("click", () => {
      on = !on;
      wave.setAttribute("data-cursor-text", on ? "Disable sound" : "Enable sound");
      try {
        if (on) {
          ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
          osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = 110; g.gain.value = 0.02;
          osc.connect(g); g.connect(ctx.destination); osc.start();
          wave._g = g;
        } else if (osc) { osc.stop(); osc.disconnect(); }
      } catch (_) {}
      wave.style.opacity = on ? "1" : "0.55";
    });
  }

  /* ---------------- Boot ---------------- */
  function boot() {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
    initShader(); initLoader(); initCursor(); initScroll(); initReveal(); initWave();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
```

---

## server.js — minimal static server (copy verbatim)

A dependency-free Node static file server that falls back to `index.html`. No API proxy, no external cache.

```javascript
// Minimal standalone static server. No API proxy, no external cache.
// Serves the current directory and falls back to index.html.
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function serve(filePath, res) {
  const resolved = path.resolve(filePath);
  if (resolved.indexOf(ROOT) !== 0) { res.writeHead(403); res.end(); return true; }
  try {
    const stat = fs.statSync(resolved);
    if (stat.isFile()) {
      res.writeHead(200, {
        "Content-Type": MIME[path.extname(resolved).toLowerCase()] || "application/octet-stream",
        "Content-Length": stat.size,
        "Cache-Control": "no-cache",
      });
      fs.createReadStream(resolved).pipe(res);
      return true;
    }
  } catch (_) {}
  return false;
}

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const target = urlPath === "/" ? "/index.html" : urlPath;
  if (serve(path.join(ROOT, target), res)) return;
  if (serve(path.join(ROOT, "index.html"), res)) return;
  res.writeHead(404, { "Content-Type": "text/html" });
  res.end("<h1>404 - Not Found</h1>");
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Root: ${ROOT}`);
});
```

---

## Adapting to the user

The skeleton above is a **starting structure, not a fixed contract**. When the user asks for something extra — a bonus section, another button, a pricing table, more cases, an FAQ — add it using the existing class vocabulary so it inherits the design language for free. Rules of thumb:

- **Reuse classes, don't invent them.** New content should be built from `.section`, `.container`, `.tags`, `.btn`, `.motion-piece`/`.motion-word`, `.col`/`.list`, `.finCard`, and the corner-cross SVGs. Only add a new class when nothing existing fits, and then style it in the same monochrome/mono idiom.
- **Wrap every new text block in `data-motion-text`** (and mark children `.motion-piece`) so it scroll-reveals like the rest.
- **Give new sections a unique `id`** and add a matching nav link if it's a primary destination. Section count is free-form (the left progress rail is decorative and does not need to match).
- **Keep the rhythm**: sections use `padding: 120px 0`, headings are `<h2 data-motion-text>`, supporting copy uses `.bio` or `.col`/`.list`.

### Add a section
```html
<div class="section" id="newid">
  <div class="container">
    <ul class="tags" data-motion-text><li class="motion-piece">LABEL</li></ul>
    <h2 data-motion-text><b><span class="motion-word">Bold</span></b> <span class="motion-word">heading</span></h2>
    <p class="bio" data-motion-text><span class="motion-piece">Body copy.</span></p>
  </div>
</div>
```

### Add another button
Buttons are `.btn` (filled) or `.btn secondary` (outline). Each needs the four corner-cross SVGs and a `<span>` label; an optional leading `<i data-lucide="...">`. Inside a `data-motion-text` block add `motion-piece`:
```html
<a href="URL" class="btn motion-piece" data-cursor-text="hover label">
  <!-- 4 corner crosses --><i data-lucide="download"></i><span>LABEL</span></a>
```
Group multiple in a `<ul class="btnGroup" data-motion-text>` with each in an `<li>`.

### Add more cases / a fin card / nav link
- **Case**: copy a `.case` block; CSS auto-alternates left/right by `:nth-child(even)`. Any count works.
- **Fin card**: copy a `.finCard` (+ a `<span class="divider">` between cards). `up`=green, `down`=red, drop the class for neutral.
- **Nav link**: add an `<li><a class="link">` with a `.link__label` + Lucide icon; internal links use `#id`.

### Common extra blocks (composed from existing classes)
- **Pricing / feature tiers** → reuse the 3-column `.container.last` with `.block`/`.col`; put the price in an `<h4>` and features in the `.list`.
- **FAQ** → a `.section` whose `.container` holds `<h2>` + a `.list` of `<li class="motion-piece"><h4>Q</h4><p>A</p></li>`.
- **Stat strip** → a row of `.finCard`s lifted out of the footer into a `.section`.
- **Logo/partner row** → `.tags` with each item a `.motion-piece`, or a flex row of Lucide icons.

If a request truly doesn't fit (e.g. a full data table, a form, a carousel), build it minimally in the same monochrome + mono + 1px-line + corner-cross idiom, keep it `data-motion-text`-wrapped, and avoid introducing new colors beyond the accent.

## Customization quick reference

| Want to change… | Where |
|---|---|
| Hero background speed / flow | `app.js` → `SHADER.speed`, `SHADER.warp` |
| Hero background color | `app.js` → `SHADER.tint`, `SHADER.intensity`, `SHADER.base` |
| Hero background texture | `app.js` → `SHADER.scale` (zoom), `SHADER.grid` (scanlines; 0 = off) |
| Whole shader look | `app.js` → drop in a variation preset (see shader section) |
| Logo mark | `index.html` → favicon data-URI + hero `svg.mark` (+ loader); pick from the mark set |
| Accent up/down colors | `styles.css` → `:root { --up; --down }` |
| Wordmark glow hue | `styles.css` → `.vseText span` text-shadow + `@keyframes vseGlow` |
| Brand text | `index.html` → `.logoText`, hero `<h1>`, `.vseText` spans, `<title>`/meta |
| Fonts | `index.html` Google Fonts `<link>` + `styles.css` `--mono`/`--sans` |
| Add sections / buttons / cases | see "Adapting to the user" |

## Mobile / responsiveness notes

- The desktop "instrument frame" (left progress rail, footer fin cards, bottom scroll cue) is **chrome, not content**. Below 600px it is hidden and the hero becomes an in-flow block (`position: relative; min-height: 100svh`) so nothing clips behind the fixed frame.
- The custom cursor is disabled on coarse pointers; native cursor returns.
- The shader caps DPR at 1.3 on touch devices and pauses when the tab is hidden, keeping it light on phones.
- All decorative animations (noise, scroll bob, audio wave, wordmark glow) honor `prefers-reduced-motion: reduce`.
- Use `100svh` (small viewport height) rather than `100vh` for the mobile hero to avoid the iOS URL-bar jump.
