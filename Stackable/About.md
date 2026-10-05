# Stackable

A high-contrast colorful editorial design language for independent festivals, live events, cultural programmes, and music-led campaigns. It turns dense event information into a tactile poster-like experience: compressed display type, flat saturated color fields, hard rules, kinetic programme cues, and precise interaction states.

> The agent instructions live in [`stackable-skill/SKILL.md`](stackable-skill/SKILL.md). This file explains what the skill produces.

---

## What it produces

- A semantic, responsive, single-page event site with a full-impact opening, programme content, access information, and a closing poster.
- Strong display typography paired with clear metadata and operational copy.
- Flat high-contrast surfaces rather than gradients, glass panels, or generic ticketing UI.
- Required GSAP/ScrollTrigger choreography and a required desktop scroll sidebar, each with visible no-script/no-library and reduced-motion fallbacks.
- Optional kinetic hero detail, custom cursor, depth scene, or a content-backed announcement rail; generic signal/ticker filler is explicitly prohibited.
- Accessible navigation, keyboard interactions, focus states, and readable no-JavaScript content.

## How to use it

1. Provide the real project context: name, purpose, dates, venue/location, programme, attendance options, and practical visitor information.
2. State any supplied brand assets, preferred colours, and whether motion should be restrained or maximal.
3. Generate an original composition using the Stackable rules; do not recreate a previous festival page.
4. Review at desktop and mobile widths, with reduced motion enabled, before publishing.

## Requirements

- A modern browser.
- No framework or build step for the default single-file version.
- Web fonts and the required GSAP/ScrollTrigger enhancement layer must have clear visible fallbacks; no analytics or trackers.

## Tech stack

- **HTML** — single semantic document with landmarks, accessibility labels, and `aria-labelledby` sections.
- **CSS** — custom properties, hard border system, print stylesheet, no frameworks.
- **JavaScript** — vanilla JS enhancement layer for GSAP timeline choreography, pinned desktop scroll sidebar, and mobile menu.
- **GSAP 3 + ScrollTrigger** — pinned sidebar, arrival sequence, and coordinated choreography loaded via CDN with visible no-script fallbacks.
- **Fonts** — condensed display pairing (e.g. Oswald, Anton, Barlow Condensed) + clean sans/mono via Google Fonts.

## Notable characteristics

- High-energy, print-poster color blocking with deliberate contrast.
- Condensed display typography and compact uppercase utility labels.
- Programme data that can be expressive without becoming unreadable.
- GSAP motion with a distinct hero arrival, content sequence, and closing beat—not a repeated fade-up.
- A required desktop scroll sidebar that remains visible across dark and light content via a contrast keyline rather than palette swapping.
- Content-led structure: no standalone generic "Signal" section or decorative scrolling filler.

## Files in this skill

```structure
Stackable/
├── stackable-skill/
│   └── SKILL.md            # the full instructions the AI follows
├── Hero.png
├── Middle Section.png
└── About.md                # this overview
```

## Size

- `SKILL.md`: ~6,245 words, ~42,650 characters, **~10.7k tokens**.

## Recommended models

**Recommended:**

- Claude models
- OpenAI / GPT / Codex models
- DeepSeek models
- Grok models (superior models recommended)
- Qwen models (larger models recommended)

**Not recommended:**

- Mistral models
- Meta / Llama models
- Flash / mini / small-tier models of any family

> Stackable relies on tightly composed GSAP timelines and a desktop pinned sidebar that must degrade cleanly when scripts or plugins fail to load. Weaker models frequently drop timeline cleanup on resize, introduce scroll snapping bugs, or fall back to generic staggered card fades instead of the bold poster arrival sequence.

---
**Overall score: 8.8/10.**
What can be improved: **High visual density and loud poster aesthetic make it niche for corporate or quiet products. Complex GSAP timeline choreography and desktop sidebar pinning can challenge smaller models without plan mode.**
What is good: **Zero-build single HTML output, striking tactile poster aesthetics with high-contrast color fields, robust no-JS and reduced-motion fallbacks, and memorable responsive typography.**
