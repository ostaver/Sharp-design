# Mirage

A strictly achromatic op-art design language for perception studios, experimental portfolios, and exhibition sites. It ships as a **single self-contained `index.html`** — markup, styles, and runtime in one file — with zero local assets. The only external resources are Google Fonts (one variable family) and anime.js v4 from jsDelivr.

> The instructions the AI follows live in **`mirage-skill/SKILL.md`**. This file explains what the skill is, when it triggers, and how to use it.

---

## What it produces

- One file: `index.html`. No build step, no framework, no images.
- A pure black-and-white page: paper `#ffffff`, ink `#0a0a0a`, and a ladder of ink opacities doing all tonal work. No dark mode, no accent color.
- A cursor-reactive **moiré hero** built from two interfering `repeating-radial-gradient` ring fields under a white radial halo.
- A **kinetic wordmark** — one variable font animated on its `wdth` and `wght` axes per character, with an entrance, a desynchronised idle breath, and cursor-proximity weight.
- Two to four **live optical illusions on canvas**, each with the signature **press-and-hold "reveal the trick"** interaction that tweens the piece into its own explanation (pointer *and* keyboard).
- A scroll-pinned horizontal **method** track, an optometrist-style **eye-chart** stat block, and a giant footer wordmark.
- Chromatic aberration (red/cyan `text-shadow` split) as the only chroma on the page, and only on hover.

## How to use it

1. **Provide context:** brand/project name, a one-line proposition, three to four manifesto lines, two to four illusions you want (or let the AI pick), method steps, chart figures, and a contact email.
2. **Confirm creative choices:** the AI will state the chosen variable font, the ink value, the aberration pair, the illusion set, and the section order.
3. **Generate:** the AI writes one `index.html` containing everything.
4. **Verify CDN URLs:** confirm the Google Fonts and jsDelivr URLs return `200` before sharing or deploying.
5. **Run:** open `index.html` directly, or serve the folder with `npx serve .` / `python -m http.server`.

## Requirements

- A browser. That is the whole build tooling.
- Network access at runtime — the variable font and anime.js are fetched from CDNs. The page degrades to a complete, fully legible static document if either fails.
- No Node, no npm, no bundler.

## Tech stack

- **HTML** — single semantic document with landmarks, skip link, and `aria-labelledby` sections.
- **CSS** — the full design language inline: custom-property tokens, `clamp()` rhythm, `repeating-radial-gradient` moiré, `mix-blend-mode: multiply`, mask reveals, `position: sticky` pin, print styles.
- **JavaScript** — one vanilla IIFE: canvas rig, illusion draw functions, hold-to-reveal wiring, IntersectionObserver reveals, and a single master `requestAnimationFrame` loop driving moiré, hero scroll, the pin, and font-axis proximity.
- **Canvas 2D** — every illusion, DPR-capped and `ResizeObserver`-driven.
- **External CDNs:** Google Fonts (variable family with a real `wdth` axis), anime.js v4 (UMD global).

## Notable characteristics

- **Zero local assets.** No images, no icon font, no `.woff2`. Every visual is CSS, canvas, or inline SVG — the favicon included.
- **One-font system.** No serif for voice, no mono for structure. All range comes from the variable axes; `font-stretch` is the emphasis axis, reached for before size.
- **Motion is load-bearing.** The animation *is* the illusion — a still screenshot of a Mirage page is an incomplete page.
- **The content confesses.** Every illusion carries its own explanation behind a press-and-hold, keyboard included.
- **Honest citations.** Real effects, real names, real years (Fraser 1908, Café Wall 1973, Kitaoka 2003, Necker 1832, Troxler 1804). Never invented attributions.
- **Every build must vary:** variable font family and axis ranges, ink value, aberration pair, illusion set and count, section order, nav labels, and all copy — so no two Mirage sites read as clones.

## Files in this skill

```structure
Mirage/
├── mirage-skill/
│   └── SKILL.md          # the full instructions the AI follows
├── index.html            # reference build of the language
├── preview-hero.png
├── preview-works.png
├── README.md             # notes on the reference build
└── About.md              # this overview
```

## Recommended models

**Recommended:**

- Claude models
- DeepSeek models
- OpenAI / GPT / Codex models
- Kimi K2.6 or Kimi K2.5
- GLM / Z.ai models
- Grok models (superior models recommended)
- Alibaba / Qwen models (superior models recommended)
- MiniMax models (superior models recommended)

**Not recommended:**

- Mistral models
- Meta / Llama models
- Flash / mini / small-tier models of any family

> The illusions are real geometry, not decoration — a mis-tuned Fraser spiral or café wall is just a pattern. Models with extended reasoning get the canvas math right on the first pass; weaker ones tend to ship figures where the effect does not actually appear. If a smaller model is unavoidable, ask for two illusions rather than four.
---
**Overall score: 9.4/10.**
What can be improved: **Illusion math is the failure point on weaker models / the language is narrow by design — it fits studios and exhibitions, not general business sites.**
What is good: **Single file, zero assets, unmistakable identity, and an interaction signature (hold-to-reveal) that no other language in the repo has.**
