# Stoicism

A risograph design language for cultural sites, publications, portfolios and institutions. Blue-violet paper, deep key ink, inscriptional typography and a misregistered pastel second drum remain recognizable. The page composition does not stay fixed.

**Agent instructions:** `stoicism-skill/SKILL.md`. The preview images demonstrate the material treatment of one older build, not a template to reproduce.

## What changed

The previous generator varied ink, font, temple side and section order while prescribing the same oversized-wordmark temple opening and carved facade ending. Those changes did not reliably produce distinct-looking sites.

The updated skill separates **material identity** from **macro composition**:

| Axis | Available structures |
|---|---|
| Hero | Monument, diptych, typographic broadside, image aperture, publication index |
| Collection | Column portico, alternating editorial spreads, compact ruled catalog |
| Ending | Dust-carved facade, light-paper colophon, split image/action spread |
| Navigation | Fixed chapter bar, static publication masthead, vertical chapter rail |
| Rhythm | Processional, editorial, compact |

These are different spatial structures, not five skins on the temple layout. The literal temple appears only in a monument hero. Dust and the stepped facade belong only to a facade ending. A visual print lab is optional and must serve the subject. Content and imagery must belong to the requested domain; a music site should not automatically turn into a creative-developer portfolio.

## History-aware generation

```sh
node stoicism-skill/roll.mjs --sections manifesto,colonnade --out path/to/new-project
```

- The author selects 2–5 content-eligible middle sections from `manifesto,colonnade,orders,press,ascent` before rolling. A larger eligible pool may be sampled; the generator never inserts an ineligible type.
- The generator emits a typed `composition`, section chart, material tokens, self-hosted fonts and full `stoicism.chart.json`.
- Each fresh output build reserves its structural fingerprint in `.stoicism-history.json` next to the generator. Keep this ledger with the skill across sessions.
- Exact structural fingerprints cannot repeat anywhere in known history. The immediate next build must change its hero and at least three active macro axes; comparisons with each of the four preceding builds require at least two changed active axes.
- A collection axis is inactive when either compared chart lacks a colonnade. Cosmetic changes and unused parameters do not earn novelty credit.
- If candidate selection cannot meet the policy, it fails rather than silently lowering the threshold.

### Existing projects and shared history

```sh
# Import an old build without modifying it (including pre-composition charts).
node stoicism-skill/roll.mjs --remember path/to/old-project/stoicism.chart.json

# Compare directly with an external chart, without enrolling that chart.
node stoicism-skill/roll.mjs --against path/to/old-chart.json --out path/to/new-project

# Use the same ledger from multiple installed copies of the skill.
node stoicism-skill/roll.mjs --history path/to/shared-history.json --out path/to/new-project

# Preview a candidate; no files or history entry are written without --out.
node stoicism-skill/roll.mjs

# Repair a generated project; no new history entry is reserved.
node stoicism-skill/roll.mjs --seed <accepted-seed> --out path/to/existing-project
```

Seeded reproduction is not a new-design operation. The seed plus original eligible-section pool reproduces the design independently of later history. Repairing the same project restores its saved pool; reproducing into another folder requires the original `--sections` when it was constrained. Fresh rolls cannot silently overwrite a project that already has a chart.

Repair applies to schema-2 charts from the updated generator. Legacy charts are supported for enrollment/comparison, not regeneration; their existing project files remain untouched.

**Limits:** the ledger knows registered charts, not every website ever made. Separate ledgers do not compare against each other. It records planned structure, not proof that an author implemented it. Share the ledger for sequential builds; parallel writers are not serialized. Do not delete history or manufacture changed axis labels to pass.

## Visual acceptance

The author must state a subject-specific visual thesis before coding, then compare the desktop opening and representative/full-page screenshots with the latest available build. At least three implemented macro differences must be visible. Phone compositions must also preserve their family’s differences rather than all becoming the same stacked hero.

Each project README records the seed, eligible pool, comparison baseline, changed active axes, actual design decisions and screenshots examined. If no prior screenshot is available, the author must say so. New colors or a new UUID do not pass this gate; a visually repeated template must be corrected before delivery.

## Rendering and accessibility

The supplied kit remains a reusable material engine, copied into `src/` unchanged:

- One OGL canvas reprints all image planes with the rolled five-step ramp, stipple and second ink. Context loss restores real image fallbacks.
- Site ink controls re-ink every mounted image, optional temple/dust and misregistered type.
- Optional Three.js TempleScene, DustInscription and drawn capitals serve the selected composition, not a universal checklist.
- Preloader listens for `stoa:hero` / `window.__stoaHero`, so image/type heroes do not need a hidden temple to load.
- Keyboard navigation, focus trapping/restoration, reduced motion, higher contrast, mobile overflow checks and WebGL recovery remain requirements.

Output: React + TypeScript + Vite static `dist/`, self-hosted fonts, no analytics, no implied backend. Three.js is only loaded when a temple is used. Every visible control must perform a real action; do not replace missing contact details or content with fake success.

## Use and verification

Give the agent the whole `stoicism-skill/` folder plus the actual site brief, available content/media, primary action and any prior site to avoid. No need to invent capabilities, client projects or a chronology merely to fill the page.

Requires Node.js 20.19+ (or a later runtime supported by the chosen Vite version). Generator and tests need no installed dependencies or network:

```sh
node --test stoicism-skill/roll.test.mjs
```

Generated projects use:

```sh
npm install
npm run dev
npm run build
```

The generator regression suite exercises real CLI outputs, known-history distance, legacy enrollment, seed reproduction, content eligibility and damaged-history failures. This is not proof of a newly authored site’s visual uniqueness; the browser difference gate is separate.

## Files

```text
Stoicism/
  About.md
  preview-*.png                 Material references from an older build
  stoicism-skill/
    SKILL.md                    Authoring and visual acceptance rules
    roll.mjs                    Seeded generator and CLI
    novelty.mjs                 Fingerprints, admission policy and history IO
    roll.test.mjs               Node behavioral regression suite
    .stoicism-history.json      Persistent registered-build ledger
    kit/                        Rendering, motion, typography and access primitives
```
