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

## Notable characteristics

- High-energy, print-poster color blocking with deliberate contrast.
- Condensed display typography and compact uppercase utility labels.
- Programme data that can be expressive without becoming unreadable.
- GSAP motion with a distinct hero arrival, content sequence, and closing beat—not a repeated fade-up.
- A required desktop scroll sidebar that remains visible across dark and light content via a contrast keyline rather than palette swapping.
- Content-led structure: no standalone generic "Signal" section or decorative scrolling filler.

## Files

```text
Stackable/
├── stackable-skill/
│   └── SKILL.md
└── About.md
```
