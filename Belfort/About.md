# Elegant Business Website — Skill

A reusable skill that lets an AI build a polished, multi‑page, optionally
bilingual marketing website with a dark elegant aesthetic, a **unique generative
canvas background themed to each client's brand**, a Firebase backend
(Firestore + Auth), an admin CMS panel, and an EmailJS contact/reservation form.

It produces **vanilla HTML/CSS/JS** (no build step) with one file per page and
per concern, plus a detailed client README and Firebase hosting setup.

> The instructions the AI follows live in **`SKILL.md`**. This file explains what
> the skill is, when it triggers, and how to use it.

---

## What it produces

- A complete static site: Home, a catalog page (Menu/Services/Products/…),
  a Contact/Reservation page, an About page, and an optional Admin panel.
- A **token‑driven design system** (colors, typography, spacing, shadows) that is
  re‑themed per client by editing CSS custom properties, not components.
- A unified `.content-card` component system reused across every page.
- A **signature animated background** rendered to a full‑page canvas, with the
  motif chosen to match the brand (roots, steam, wheat, ripples, network graph…).
- Firebase wiring: Firestore data model, `firestore.rules`, admin auth, and
  `firebase.json` hosting config — all with **placeholder** credentials.
- Optional internationalization: English primary + a **user‑specified** second
  language (never assumed).
- A thorough **client `README.md`** covering Firebase setup, EmailJS, content
  management, deployment, and troubleshooting.

---

## When this skill activates

Use it when a user asks to build a brand / marketing / landing website for a
business such as a restaurant, cafe, bakery, salon, studio, hotel, boutique, gym,
clinic, or similar — especially when they want a refined, animated, dark, and/or
content‑managed feel. Trigger keywords include: *website, landing page, marketing
site, business website, restaurant/cafe/bakery site, firebase, firestore, admin
panel, CMS, multilingual / i18n, reservation / booking, generative background,
dark theme.*

---

## Core philosophy: same skeleton, new skin

The skill is derived from a real reference site (a Macedonian restaurant). The AI
keeps the **patterns** — structure, motion, component system, backend,
accessibility, hosting — but reinvents the **surface** for every client:

- New palette derived from the client's brand (not the reference's gold).
- New font pairing suited to the industry.
- A **new background motif** tied to the brand (the reference's tree "roots"
  become wheat for a bakery, ripples for a spa, a node graph for a SaaS, etc.).
- New copy, imagery, and section arrangement so no two sites look alike.

---

## How to use it

1. **Provide context.** Tell the AI the business name, industry, goal/CTA,
   desired pages, brand colors or mood, logo, languages, whether you need a
   content‑managed backend + admin, and contact details. If anything's missing,
   the skill instructs the AI to ask before building.
2. **Confirm the creative choices.** The AI states the palette, font pairing, and
   the proposed background motif up front.
3. **Generate.** The AI builds the full file tree (see `SKILL.md` §2) following
   the build order in §14, then verifies translations resolve, animations fire,
   forms validate, and empty‑backend states render gracefully.
4. **Configure & deploy.** Follow the generated client `README.md` to paste your
   Firebase config and EmailJS keys, create the admin user, publish rules, and
   `firebase deploy`.

### Delivery modes
- **In an agent/IDE:** files are created directly in the workspace.
- **Chat‑only (no agent):** the AI packages all files into a single downloadable
  **.zip** preserving the structure, or outputs each file in a clearly labeled
  code block with its full path if zipping isn't possible.

---

## Files in this skill

```
elegant-business-website/
├── SKILL.md   # the full instructions the AI follows when the skill is active
└── README.md  # this overview
```

`SKILL.md` is the source of truth. Key sections:

| Section | Contents |
|---|---|
| §0  | Clarifying questions to ask before building |
| §1–2 | Tech stack, principles, and the exact file structure |
| §3  | Themeable design‑token contract + palette derivation |
| §4  | The unified card component system |
| §5  | Page‑by‑page layout patterns |
| §6  | The signature generative background (motif table + `bg.js` template) |
| §7  | Internationalization (English + user‑specified second language) |
| §8  | Firebase: data model, rules, admin, EmailJS, Spark vs Blaze images |
| §9–11 | JS conventions, accessibility/perf checklist, hosting config |
| §12 | Required client README specification |
| §13–14 | Delivery modes and recommended build order |
| §15 | Anti‑patterns (real flaws found in the reference, fixed here) |

---

## Notable improvements over the reference

The skill bakes in fixes for issues discovered in the original site so generated
sites don't inherit them:

- JS effects are bound to the classes the HTML actually renders (the reference's
  count‑up and hover‑tilt were wired to non‑existent selectors and silently did
  nothing).
- Firebase config ships as **placeholders**, never real keys.
- No dead/unused files (the reference shipped an orphaned `shader.js`).
- Image handling matches the Firebase plan (URL‑based on Spark; Storage only on
  Blaze).
- The per‑page / per‑concern file split is preserved — no monolith files.

---

## Requirements for generated sites

- A Firebase project (free **Spark** plan is enough; **Blaze** only if you want
  Storage uploads).
- An [EmailJS](https://www.emailjs.com) account if the contact/reservation form
  must send email.
- The Firebase CLI (`npm install -g firebase-tools`) to deploy.
- No framework or build tooling — the output is static files served as‑is.
