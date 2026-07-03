# Atelier

A boutique design language for studio portfolios and craft-driven landing pages. Minimalist, typographic, and editorial — built on warm restraint, a serif voice, soft ambient motion, and an optional light/dark theme.

> The instructions the AI follows live in **`SKILL.md`**. This file explains what the skill is, when it triggers, and how to use it.

---

## What it produces

- A single, self-contained `index.html` page — no build step, no framework.
- An editorial hero with a warm ambient background effect (CSS gradient, SVG filter, 2D canvas, or optional WebGL shader).
- A curated selection of 3–5 sections: philosophy, work grid, services, process, journal, contact, and footer.
- Card-based project displays with subtle hover lift and a soft shadow language.
- A simulated contact form with loading, success, and screen-reader-friendly focus management.
- A theme toggle that respects `prefers-color-scheme` and persists the choice in `localStorage`.

## How to use it

1. **Provide context:** studio name, one clear proposition, 2–6 projects with descriptions, services or process steps, and contact details.
2. **Confirm creative choices:** the AI will state the chosen warm-earth accent hue, serif + sans font pairing, and background-effect technique.
3. **Generate:** the AI writes `index.html` with inline CSS/JS following the Atelier grammar.
4. **Review:** check that the theme toggle works, motion respects reduced-motion preferences, and the layout holds at mobile widths.

## Requirements

- None beyond a modern browser. The page loads Google Fonts via CDN; all visuals are CSS or inline SVG.
- No Node server, no npm install, no bundler.

## Tech stack

- **HTML** — single semantic page.
- **CSS** — custom properties, light/dark themes, no frameworks.
- **JavaScript** — one script block handling reveals, theme, form simulation, and mobile menu.
- **Fonts** — Instrument Serif (or approved editorial serif) + Inter (or approved neutral sans) via Google Fonts.
- **Background** — one of four ambient techniques per project, chosen for appropriateness and complexity.

## Notable characteristics

- **Warm, whisper-quiet palette.** Earthy accent colors only: brass, ochre, clay, terracotta, dusty rose, muted olive. No cold tech blues or neon.
- **Editorial voice.** Short paragraphs, no marketing superlatives, restraint over decoration.
- **Two-font system.** Serif for headlines, sans for everything else.
- **Theme-aware.** Light paper default with a warm lamplit dark mode.
- **Every build must vary:** accent hue, font pairing, section selection/order, background technique, and copy so no two Atelier sites look like clones.

## Files in this skill

```
atelier/
├── atelier-skill/
│   └── SKILL.md  # the full instructions the AI follows
├── Atelier-dark.png
├── Atelier-white.png
└── About.md  # this overview
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

**Not recommended:**
- DeepMind / Gemini flash models
- Mistral models
- Step models
- Meta / Llama models
- Other weaker models

> Because this skill can use optional WebGL for the background effect, models with deep/extended reasoning tend to produce more reliable shader code when that option is chosen.
---
**Overall score: 9/10.**
What can be improved: **Context optimization / compression / less words, more meaning.**
What is good: **Elegant, enterprise ready, gives unique results each iteration.**