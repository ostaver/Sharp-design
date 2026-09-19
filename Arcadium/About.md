# Arcadium

A dark coin-op arcade design language for arcades, game studios, retro events, esports bars, and play-driven brands. It ships as a **Vite + React 19 + TypeScript project** that builds to a static `dist/`. The page arrives unpowered, and nothing happens until the visitor puts a coin in.

> The instructions the AI follows are in **`arcadium-skill/SKILL.md`**. This file explains what the skill is, when to use it, and how.

---

## What it produces

- A **boot gate**: a CSS-built coin door. Click it or press **C**, and a coin flies into the slot. Its path is measured from the live layout, so it lands at any viewport size. Then the CRT powers on with a flash and a degauss wobble.
- A **WebGL ASCII ring-wave hero** (the required main effect). Its brightness is driven by the coin timeline, and the pointer swells and whites out the glyphs.
- A **scroll-pinned hall of cabinets**. Each cabinet runs its own text-mode attract animation at a chunky 11fps and lights up with a hum pitched and panned to where it stands. A pac-line eats its dots as you walk past.
- **One genuinely playable ASCII game**. After game over you enter three initials, and they are written onto the site's live high-score ledger.
- A **thermal-paper ledger** that prints row by row, then gets hand-stamped.
- A **fluid-simulated ASCII furnace** (the required side effect, `<ascii-flame>`). You can stir it, drag through it, stoke it, and gust it.
- **Coin-flip token cards** for pricing, and a **GAME OVER** footer with an *Insert coin to continue* reboot.
- Every sound comes from a tiny WebAudio synth (square and triangle blips). There are no audio files.

## How to use it

1. **Give the agent the whole `arcadium-skill/` folder**, not just `SKILL.md`. The two required effects live next to it as markdown files, each holding one code block the agent writes out unchanged, and four runtime helpers are copied as-is. No other source is needed, and the repo does not include the reference build.
2. **Provide context:** the brand or venue, a one-line proposition, what the "cabinets" are (games, products, venues, projects), which game should be playable, the pricing tiers, and a contact email or booking URL.
3. **Confirm creative choices:** the agent will state the phosphor/signal/token color triad, the three fonts, the section list and order, the cabinet genres, and the playable game.
4. **Generate:** the agent writes the project folder.
5. **Run:**

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Requirements

- Node 20+ and npm.
- An agent with local file access (Claude Code, Codex, Cursor and similar). This skill outputs a multi-file project and copies bundled files, so it will not work in a plain chat window.
- Network access at runtime for Google Fonts only. Everything else is bundled.

## Tech stack

- **React 19 + TypeScript**, bundled by **Vite 7**.
- **GSAP 3.13 + ScrollTrigger:** the coin and power-on timelines, the pinned horizontal hall, and the reveal vocabulary (CRT power-on, paper feed, cursor wipe, character decode).
- **Lenis 1.3:** smooth scroll, synced to ScrollTrigger through the GSAP ticker.
- **Three.js 0.180:** the ASCII wave shader.
- **Canvas 2D:** cabinet attract screens, the playable game, and the flame (a dependency-free web component).
- **WebAudio:** all sound.
- **External:** Google Fonts (a pixel face, a terminal face, a grotesk).

## Notable characteristics

- **The site is the room.** Every section is a working machine you can walk past, press, play, or feed. None of it is a picture of an arcade.
- **Built against the brief's bans:** no count-up numbers, no logo marquee, no generic IntersectionObserver fades, no gratuitous section numbering, no loader, no generic glows or hovers. Each ban has a named replacement in the skill.
- **Light is physical.** The only glows come from emitters (marquees, screens, LEDs, the furnace). Nothing glows because it was hovered.
- **Stepped motion.** Every CSS loop uses `steps()`, like hardware. Elastic easing appears in exactly two places.
- **Full fallbacks.** Under reduced motion the hall unpins into a native sideways scroller and all text appears finished. The boot gate works from the keyboard, and the game canvas is focusable and labelled.
- **Every build must vary:** color triad, fonts, cabinet count and genres, the playable game, flame preset, section mix, nav labels, and all copy.

## Files in this skill

```structure
Arcadium/
├── arcadium-skill/
│   ├── SKILL.md              # the full instructions the AI follows
│   ├── effects/
│   │   ├── AsciiWave.md      # main effect: WebGL ASCII ring wave → src/effects/AsciiWave.tsx
│   │   ├── ascii-flame.md    # side effect: <ascii-flame> fluid-fire web component → src/effects/ascii-flame.js
│   │   └── AsciiFlame.md     # React wrapper exposing ignite()/gust() → src/effects/AsciiFlame.tsx
│   └── lib/
│       ├── scramble.ts       # character-decode text reveals
│       ├── reveals.ts        # crt / feed / wipe / type entrances
│       ├── hall-of-fame.ts   # game → ledger pub/sub
│       └── sound.ts          # WebAudio blip synth
├── preview-*.png             # boot, hero, floor, ledger, furnace (from the reference build)
├── README.md                 # notes on the reference build (source not included)
└── About.md                  # this overview
```

## Size

- `SKILL.md`: ~7,000 words, ~47,000 characters, **~12k tokens**.
- Bundled files: ~69 KB. The agent copies them and does not need to read them in full.

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

> Arcadium has more moving parts than any other skill in the repo: a pinned scroll track, several canvas loops, a game loop, a boot state machine, and an audio synth. The effects are shipped verbatim so weaker models can't break them. Where weaker models still go wrong is the choreography: the ticker-driven hall, the coin timeline, and the game's collision. If a smaller model is unavoidable, ask for four cabinets and Snake or Breakout.

---
**Overall score: 9.1/10.**
What can be improved: **Heaviest skill in the repo to run, with a ~900 KB bundle and a Node toolchain. It is a strong fit for play-driven brands and a poor fit for conventional business sites.**
What is good: **An unmistakable identity. The site is dead until you pay, it has a real game that writes to a real scoreboard, and both required effects are shipped as tested code instead of being left to the model.**
