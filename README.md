<p align="center">
  <img src="Banner.png" alt="Sharp Design" width="100%">
</p>

# Sharp Design v0.9

Welcome to Sharp Design, a collection of AI agent skills for building professional award-winning websites. Each skill is a self-contained design language — a set of convictions, proportions, and aesthetic rules that an AI agent follows to produce original, high-quality single-page sites. Drop a skill into your agent's context and it builds to spec.

SKILL Template in use - [SKILL Creator](https://github.com/ostaver/Sharp-Design/blob/main/SKILL%20CREATOR.md).

---

## Quick Start

1. **Pick a design language** — start with [Atelier](#atelier) for a single-file site.
2. **Copy the skill** — open your chosen language's `SKILL.md` file. Or just drag and drop.
3. **Paste into your AI agent** — drop file or copied content into the system prompt or context window of any supported model.
4. **Prompt your AI with description** — tell the agent what you want: *"Create a portfolio website for a ceramic artist. Use the skill **Argon**, 6 sections."*
5. **Run and deploy** — the agent will generate all files locally or give you a single `.html` file ready to open or deploy.

**Simple example prompt for Atelier:**

```md
Use the Atelier skill to build a single-page site for a generative art studio. Include: hero, about, gallery grid, manifest, process, contact. Be unique and original.
```

> **Note:** Skill token costs range from ~3000 to ~20000. Make sure your model supports a long enough context window. We recommend models with at least 128k tokens of context.

---

## What is a skill?

A skill is a `SKILL.md` file that lives inside a design language folder. It defines everything the agent needs: layout grammar, component vocabulary, CSS design tokens, JavaScript runtime, and content guidelines. The agent writes all output files from scratch — no templates are copied, no binaries are bundled.

Every build should feel like it belongs to the design language but never look like a clone of a previous build. Variation is intentional and built into each skill.
> *All the skills are reviewed by a senior frontend engineer.*

---

## Some Design styles

### Argon

> *Dark, technical, gallery-grade.*

Portfolio-first design language for artists, studios, and creative technologists. Lives at the intersection of a gallery opening and a terminal window. Serif voice, monospace structure, WebGL atmosphere, custom cursor.

- **Style:** Dark, editorial, precision-obsessed
- **Stack:** HTML · CSS · JavaScript · WebGL
- **Tokens:** ~5,000 context tokens
- **Score:** 8.7 / 10
- **Best for:** Artist portfolios, digital studios, creative technologists
- **Result File Type:** .html

| OSTAVER Prompt                     | Alex Prompt                  |
|---                                 |---                           |
| ![OSTAVER](Argon/OSTAVER-hero.png) | ![Alex](Argon/Alex-hero.png) |

---

### Atelier

> *Minimalist, typographic, craft-obsessed.*

Boutique design language for studio portfolios and landing pages. Warm restraint, serif headlines, ambient motion. Every element earns its place. Simplicity is key.

- **Style:** Editorial, elegant, enterprise-ready
- **Stack:** HTML · CSS · JavaScript · WebGL
- **Tokens:** ~4,200 context tokens
- **Score:** 9 / 10
- **Best for:** Studios, agencies, boutiques, craft-driven brands
- **Result File Type:** .html

| White Theme                                       | Dark Theme                                      |
|---                                                |---                                              |
| ![Atelier White-Theme](Atelier/Atelier-white.png) | ![Atelier Dark-Theme](Atelier/Atelier-dark.png) |

---

### Binary

> *Dark, monochrome, pixel-perfect. Resource-Heavy*

Fixed-frame technical reference site. Monospace throughout, live WebGL fragment shader hero, percentage loader, CSS glitch image effects, giant footer wordmark, custom cursor, scroll-reveal motion. Everything is fetched from CDNs or written inline — four plain text files, nothing else.

- **Style:** Instrument panel, dark, programmer-grade
- **Stack:** HTML · CSS · JavaScript · WebGL · Node.js
- **External:** Google Fonts · Lucide Icons · Unsplash
- **Tokens:** ~18,600 context tokens
- **Score:** 9.6 / 10
- **Best for:** Technical products, developer tools, SaaS, reference sites
- **Result File Type:** Repository/Folder

| Filip Prompt                                       | Jason Prompt                               |
|---                                                 |---                                         |
| ![Filip Mladenovic](Binary/Filip%20Mladenovic.png) | ![Jason Bourne](Binary/Jason%20Bourne.png) |

---

### Comfort

> *Smooth, minimalistic, buttery.*

An Astro-native design language for studios, product teams, and culture-forward brands. Builds a complete component-based Astro repository with TypeScript, CSS Modules, and Vite. Material voice: adobe, concrete, kiln. Honest materials, honest code.

- **Style:** Smooth, Zen, component-first
- **Stack:** Astro.js · JavaScript · CSS Modules · Vite
- **External:** Google Fonts (`Playfair Display`, `Inter`, `JetBrains Mono`)
- **Tokens:** ~13,000 context tokens
- **Score:** 9.2 / 10
- **Best for:** Studios, product teams, culture brands, editorial platforms
- **Result File Type:** Repository/Folder

| Dark Theme                        | Light Theme                         |
|---                                |---                                  |
| ![Comfort-Dark](Comfort/Dark.png) | ![Comfort-Light](Comfort/Light.png) |

---

### Mirage

> *Achromatic op-art. The content itself is the illusion.*

Strictly black & white design language for perception studios and exhibition sites: kinetic variable-width typography, a cursor-reactive moiré hero, and live optical illusions on canvas — each with a press-and-hold "reveal the trick" interaction. One variable font, no accent color, no dark mode. Animated entirely with anime.js v4. Lives on branch [`Mirage`](https://github.com/ostaver/Sharp-Design/tree/Mirage).

- **Style:** Op-art, achromatic, kinetic type
- **Stack:** HTML · CSS · JavaScript · Canvas 2D · anime.js v4 (CDN)
- **External:** Google Fonts (variable `wdth` family, e.g. `Archivo`)
- **Tokens:** ~7,500 context tokens
- **Score:** 9.4 / 10
- **Best for:** Studios, exhibitions, experimental portfolios, anyone who trusts their eyes
- **Result File Type:** .html (single file)

| Hero                                       | Works                                       |
|---                                         |---                                          |
| ![Mirage Hero](Mirage/preview-hero.png)    | ![Mirage Works](Mirage/preview-works.png)   |

---

## Comparison

| | Argon | Atelier | Binary | Comfort |
| --- | --- | --- | --- | --- |
| Aesthetic | Gallery / terminal | Editorial / warm | Instrument / cold | Warm / editorial |
| Type voice | Serif + mono | Serif + sans | Sans + mono | Serif + sans |
| Hero | WebGL backdrop | Ambient motion | WebGL GLSL shader | Textured gradient / SVG noise |
| Cursor | Custom | Default | Custom | Default |
| Complexity | Medium | Low–Medium | High | High |
| Token cost | ~5k | ~4.2k | ~18.6k | ~13k |
| Result | .html | .html | Folder/Repository | Folder/Repository |

---

## Using a skill

1. Two options: Either an Agent or a direct LLM (Chat).
2. Paste the contents or drag the skill of the `SKILL.md` file into the system prompt or as a context file
3. Tell the agent what you want to build — brand, copy, section ideas
4. The agent produces all output files; you run them locally or deploy as-is

> **Tip:** Some skills output folder structures, it is advised to use an AI Agent for that purpose, integrated into the local system.

### Recommended models

Most skills work well with:

- Claude
- DeepSeek
- GPT /Codex
- Kimi K
- GLM / Z.ai
- Grok
- or *Other models with 200B+ parameters*

Avoid for all skills: Mistral, Meta/Llama, or other smaller open-weight models.

---

## Repo structure

```md
Sharp-design/
├── Argon/
│   ├── About.md                        ← human-readable skill notes
│   ├── argon-developer-skill/
│   │   └── SKILL.md                    ← agent skill file
│   └── *.png                           ← preview images
├── Atelier/
│   ├── About.md
│   ├── atelier-minimalist-skill/
│   │   └── SKILL.md
│   └── *.png
├── ...
└── README.md
```

`About.md` is for humans — model compatibility, token cost, score, notes. `SKILL.md` is for the agent.

---

## Contributing

Contributions are welcome — new design languages, improvements to existing skills, fixes, and documentation.

### Adding a new design language/style

1. **Fork** the repository and create a branch: `git checkout -b skill/design-style-name`
2. Create a folder: `YourSkill/your-style-skill/SKILL.md`
3. Add an `About.md` in the style folder following the existing format or include your own ideas. General information is advised
4. Include at least one preview image in the style folder if possible
5. Open a pull request with a short description of the aesthetic and what makes it distinct from existing styles/skills

**A new style must:**

- Have a clear, named aesthetic conviction (not just "a clean site")
- Produce original output on every run — not a fixed template
- Be fully standalone, no external images
- Include a complete `SKILL.md` with layout grammar, component style, and a runtime implementation
- Read *Style guidelines*

### Improving an existing skill

- **Bug fixes** (broken CSS, JS errors, incorrect CDN URLs) — open a PR directly with a clear description
- **Improvements** (better compression, new variation presets, additional section types) — open an issue first to discuss, then PR
- **Model compatibility updates** — if you find a model produces notably good or bad results with a skill, update the `About.md` and note it in the PR

### Style guidelines

- Keep `SKILL.md` files self-contained — an agent should be able to build a complete site from the file alone, with no outside context
- Prefer compression over verbosity: fewer tokens, clearer instructions
- Do not introduce external API dependencies, authentication, or server-side logic into a skill
- All CDN resources must be from well-known, public hosts (`fonts.googleapis.com`, `unpkg.com`, `images.unsplash.com`, etc.)

### Pull request checklist

- [ ] `SKILL.md` produces a working site when given to a recommended model
- [ ] `About.md` is filled in (token count, word count, character count, model compatibility, score)
- [ ] No binary assets committed (`.woff2`, `.png` previews are the only exception)
- [ ] CDN URLs in examples have been verified as live
- [ ] Branch name follows `style/name` or `fix/description` or `improve/style-name`

### Opening issues

Use issues for:

- Reporting a broken skill (model, prompt used, and observed output help a lot)
- Proposing a new design language concept
- Discussing significant changes to an existing language's grammar

---

## License

See [LICENSE](./LICENSE).
