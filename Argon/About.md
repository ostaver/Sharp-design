# Argon

A dark, technical design language for artist portfolios, digital studios, and creative technologists. It produces a single-file, gallery-grade landing page that feels like a terminal at an exhibition opening: monospace structure, serif voice, WebGL atmosphere, and a custom cursor.

> The instructions the AI follows live in **`SKILL.md`**. This file explains what the skill is, when it triggers, and how to use it.

---

## What it produces

- A single, self-contained `index.html` page — no build step, no framework.
- A full-viewport hero with a live WebGL FBM noise background and `mix-blend-mode: difference` typography.
- A horizontal marquee ticker, alternating content sections, a vertical work list, skill bars, stats, and a direct-email contact block.
- A custom dot-and-ring cursor with spring physics (desktop only).
- Print and accessibility guardrails, including `prefers-reduced-motion` and `prefers-contrast: more` support.

## How to use it

1. **Provide context:** brand/studio name, tagline, 3–8 project names with years/tags, 3–5 expertise areas, and a contact email.
2. **Confirm creative choices:** the AI will state the chosen accent hue (cool spectrum only: teal through magenta), serif/monospace font pairing, and ticker keywords.
3. **Generate:** the AI writes `index.html` with inline CSS/JS following the Argon grammar.
4. **Review:** verify the WebGL canvas loads, the cursor behaves on desktop, and content is readable without JavaScript.

## Requirements

- None beyond a modern browser. The page loads Google Fonts via CDN; all other visuals are CSS, inline SVG, or WebGL.
- No Node server, no npm install, no bundler.

## Tech stack

- **HTML** — single semantic page.
- **CSS** — custom properties, no frameworks.
- **JavaScript** — one IIFE block handling shader, cursor, reveals, ticker, and mobile menu.
- **WebGL** — hand-written fragment shader (FBM domain-warped noise), with context-loss handling.
- **Fonts** — Playfair Display (or approved serif) + Space Mono (or approved monospace) via Google Fonts.

## Notable characteristics

- **Dark only.** No light mode, no theme toggle.
- **No forms.** Contact is a `mailto:` link styled as a technical artifact.
- **No cards or pill badges.** Work is a vertical list; information is presented as data, not UI components.
- **Scrollbar hidden globally** (with a thin fallback on touch devices).
- **Every build must vary:** accent hue, font pairing, section order, ticker keywords, and project copy so no two Argon sites look like clones.

## Files in this skill

```
argon-skill/
├── SKILL.md   # the full instructions the AI follows
└── README.md  # this overview
```

## Recommended models

**Recommended:**
- DeepSeek models
- Claude models
- GLM / Z.ai models
- Alibaba / Qwen models (superior models recommended)
- OpenAI / GPT / Codex models
- Grok models (superior models recommended)
- MiniMax models (superior models recommended)
- Step flagship model

**Not recommended:**
- Mistral models
- Meta / Llama models
- Xiaomi / MiMo models (superior models recommended)
- Other weaker models

> Because this skill uses WebGL, models with deep/extended reasoning tend to produce more reliable shader and cursor code.
---
**Overall score: 8.7/10.**
What can be improved: **Originality / Uniqueness / Compression, token optimization.**
