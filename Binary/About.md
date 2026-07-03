# Binary

A precise, fixed-frame, dark design language for technical reference sites. It ships as four hand-written text files — `index.html`, `styles.css`, `app.js`, and `server.js` — with zero local binary assets. Fonts, icons, and imagery are pulled from trusted CDNs; the hero background is a hand-written WebGL fragment shader.

> The instructions the AI follows live in **`SKILL.md`**. This file explains what the skill is, when it triggers, and how to use it.

---

## What it produces

- Four text files: `index.html`, `styles.css`, `app.js`, and `server.js`.
- A fixed-frame dark single-page site with a percentage loader, custom text cursor, scroll-reveal motion, and a giant glowing footer wordmark.
- A WebGL fragment-shader hero background with configurable tint and warp.
- An alternating "glitch" case list using layered CSS background-image slices.
- A small debug HUD and fin-cards in the footer chrome.
- Fully standalone: no build step, no framework, no copied assets.

## How to use it

1. **Provide context:** brand/project name, tagline, 3–6 case studies with image URLs, 2–3 list columns (e.g., experience, stack, metrics), and a primary CTA link.
2. **Confirm creative choices:** the AI will state the chosen shader tint, accent colors (`--up`/`--down`), geometric mark, and font pair.
3. **Generate:** the AI writes all four files. `styles.css`, `app.js`, and `server.js` are reusable verbatim; `index.html` carries the content.
4. **Verify CDN URLs:** confirm every Google Fonts, Lucide, and Unsplash URL returns `200` before sharing or deploying.
5. **Run:** `node server.js` and open `http://localhost:3000`.

## Requirements

- **Node.js** — to run the included `server.js` static server.
- Network access at runtime — fonts, icons, and images are fetched from CDNs.
- No build tooling, no npm install step (unless you replace the static server).

## Tech stack

- **HTML** — semantic skeleton with placeholder comments to fill.
- **CSS** — complete design language, copied verbatim per build.
- **JavaScript** — standalone runtime: shader, loader, cursor, scroll progress, reveals, HUD, and icon injection.
- **Node.js** — minimal static file server.
- **WebGL** — hand-written fragment shader (raw WebGL, no library).
- **External CDNs:** Google Fonts, Lucide icons (pin a version for production), Unsplash imagery.

## Notable characteristics

- **Zero local binaries.** Every visual is either inline SVG, CSS, WebGL, or fetched from a CDN.
- **Fixed-frame UI.** A persistent border, corner crosses, progress rail, and footer chrome frame the content.
- **Custom text cursor.** A label-aware cursor that snaps to interactive targets (desktop only).
- **CSS glitch imagery.** Case-study images are split into five identical layers for a pure-CSS hover glitch.
- **Every build must vary:** shader form/tint, geometric mark, accent colors, font pairing, case count/order, and copy so no two Binary sites look like clones.

## Files in this skill

```
binary-skill/
├── SKILL.md   # the full instructions the AI follows
└── README.md  # this overview
```

## Recommended models

**Recommended:**
- DeepSeek models
- Claude models
- Kimi K2.6 or Kimi K2.5
- GLM / Z.ai models
- MiniMax models (superior models recommended)
- Xiaomi / MiMo models (superior models recommended)
- Alibaba / Qwen models (superior models recommended)
- OpenAI / GPT / Codex models
- Grok models (superior models recommended)
- Step models
- DeepMind / Gemini flash models

**Not recommended:**
- Mistral models
- Meta / Llama models
- Other weaker models

> Because this skill uses raw WebGL shaders (GLSL) for the hero background, models with deep/extended reasoning produce more reliable results.
---
**Overall score: 9.6/10.**
What can be improved: **Context optimization / Compression - the skill is comprehensive but token-heavy due to complete file contents / Originality.**
What is good: **Almost any model, even the smaller ones can give good results.**
