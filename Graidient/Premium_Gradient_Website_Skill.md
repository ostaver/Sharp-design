# Skill: Premium Gradient-Forward React Website

## Agent Role
You are a senior creative developer and UI engineer. Your task is to build a **professional, unique, editorial-grade website** using React and modern WebGL technologies. The site must be visually anchored by the `Grainient` WebGL shader component and must feel intentionally crafted—like a high-end fashion label or contemporary art gallery—not "vibe coded" or generically templated.

---

## Core Visual Reference

### The Grainient Component
- **Colors**: `#FF9FFC` (soft lavender-pink), `#5227FF` (deep electric purple), `#B497CF` (muted mauve-purple)
- **Texture**: Organic warp distortion, subtle film grain, noise-driven rotation
- **Mood**: Ethereal, dreamy, sophisticated, luxurious
- **Behavior**: Slow, breathing animation; colors bleed organically without hard edges

### Image Reference
A soft, wide gradient field with subtle noise texture. The transition between pink and purple is fluid and tactile. The overall feeling is elegant, modern, and premium.

---

## Anti-Vibe-Coding Rules (STRICT)

You MUST avoid these patterns that make websites look AI-generated and generic:

1. **NO Generic Hero Layouts**: Do not use "Headline + Subheadline + CTA Button + 3 Feature Cards" as the first viewport.
2. **NO Default Tailwind Aesthetics**: If using Tailwind, it must be heavily customized. Do not use default spacing, default colors, or `rounded-xl` cards everywhere. Prefer CSS Modules or vanilla-extract.
3. **NO Glassmorphism Cards**: Do not use `backdrop-filter: blur(10px)` with semi-transparent white backgrounds as a primary layout device.
4. **NO Generic Stock Imagery**: Do not use placeholder AI illustrations, 3D cartoon characters, or generic Unsplash "team meeting" photos.
5. **NO SaaS Cliché Copy**: Avoid words like "revolutionize," "streamline," "unlock potential," "synergy," "AI-powered," "boost productivity."
6. **NO Emoji in UI**: Never use emoji in headings, buttons, or navigation.
7. **NO Standard Icon-Feature Grids**: Do not create rows of 3-4 cards with Lucide icons and small headings describing "Fast," "Secure," "Scalable."
8. **NO Bouncy Gimmick Animations**: No spring physics on every hover, no parallax on every element, no confetti.
9. **NO Centered-Everything**: Avoid center-aligning all text by default. Use left-aligned editorial layouts with intentional asymmetry.
10. **NO Heavy Shadows**: Avoid large drop shadows (`box-shadow: 0 20px 50px rgba(0,0,0,0.3)`) to create depth. Use whitespace, borders, and layering instead.

---

## Design Philosophy

### 1. Typography First
- **Display Font**: High-contrast serif (e.g., Cormorant, Playfair Display, or Editorial New). Use it LARGE: minimum `4rem` for primary headlines, tight leading (`0.9–1.0`), and negative letter-spacing (`-0.02em` to `-0.04em`).
- **UI/Body Font**: Neo-grotesque sans-serif (e.g., Inter, Suisse Intl, Neue Montreal, or Geist). Use for navigation, captions, and body copy. Size `0.875rem` to `1rem`, generous line-height (`1.5–1.6`).
- **Type Scale**: Dramatic. Let headlines dominate the viewport. Body text should feel small and precise in contrast.

### 2. Asymmetric & Editorial Layouts
- Use a **12-column CSS Grid** with intentional asymmetry. Content should span unusual column combinations (e.g., 7 columns + 1 column gap + 4 columns).
- **Whitespace is a material**. Use massive top/bottom padding (`8rem` to `16rem`) to separate sections.
- Allow text to overlap the gradient edge. Place a large headline partially off-screen or bleeding into the shader background.
- Use **1px hairline borders** (`rgba(255,255,255,0.1)` or `rgba(0,0,0,0.1)`) to separate sections instead of cards or boxes.

### 3. Color Strategy
- **Dark Mode Base**: Deep near-black with purple undertone (`#0a0612` or `#0f0b1a`). Text in warm off-white (`#f0e6ff` or `#e8e0f0`).
- **Light Mode Base** (if needed): Warm off-white (`#faf8f5`). Text in deep charcoal (`#1a1a1a`).
- **Gradient Usage**: The `Grainient` shader should be used as a **background atmosphere**, not a decorative blob. It can also be applied to text via `background-clip: text` for single impactful words.
- **Accents**: Use the three gradient colors sparingly:
  - Text selection color: `#5227FF`
  - Hover states: `#FF9FFC`
  - Thin rules/lines: `#B497CF` at low opacity

### 4. Texture & Tactility
- Echo the shader's grain across the UI. Apply a subtle static noise overlay (CSS `mix-blend-mode: overlay` at `3–5% opacity`) on solid-color sections to unify the texture.
- Avoid flat, sterile solid colors. Every surface should feel slightly organic.

### 5. Motion Philosophy
- **Shader Motion**: Keep the Grainient animation slow and meditative. Suggested props: `timeSpeed={0.15}`, `grainAmount={0.08}`, `warpStrength={0.8}`, `contrast={1.3}`.
- **Scroll Motion**: Use GSAP + ScrollTrigger for entrance animations. Elements should enter with `transform: translateY(24px)` + `opacity: 0 → 1`, duration `0.8s`, ease `power2.out`. No bounce.
- **Smooth Scrolling**: Implement Lenis (or similar) with `lerp: 0.1` for a weighted, premium scroll feel.
- **Respect `prefers-reduced-motion`**: Disable all motion for users who request it.
- **Custom Cursor** (optional): A small dot (`8px`) that inverts color over the gradient. No trailing lag effect.

---

## Technical Stack

| Technology | Purpose |
|------------|---------|
| **React 18+** (TypeScript) | UI Framework |
| **Vite** | Build Tool |
| **ogl** | WebGL renderer for the Grainient shader (minimal, performant) |
| **GSAP + ScrollTrigger** | Scroll-driven animations and reveals |
| **Lenis** | Smooth scroll with inertia |
| **CSS Modules** or **vanilla-extract** | Scoped, custom styling (avoid default Tailwind utility classes) |
| **Fontsource** or `@font-face` | Self-hosted custom fonts |

---

## Component Architecture

### Grainient Background
```tsx
// Fixed, full-viewport background layer
<div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
  <Grainient
    color1="#FF9FFC"
    color2="#5227FF"
    color3="#B497CF"
    timeSpeed={0.15}
    colorBalance={0.0}
    warpStrength={0.8}
    warpFrequency={5.0}
    warpSpeed={2.0}
    warpAmplitude={50.0}
    blendAngle={0.0}
    blendSoftness={0.05}
    rotationAmount={500.0}
    noiseScale={2.0}
    grainAmount={0.08}
    grainScale={2.0}
    grainAnimated={false}
    contrast={1.3}
    gamma={1.0}
    saturation={1.0}
    centerX={0.0}
    centerY={0.0}
    zoom={0.9}
  />
</div>
```

### Content Layer
- All content sections must sit **above** the shader with `position: relative; z-index: 1`.
- Use `pointer-events: none` on wrapper divs where you want clicks to pass through to the canvas, then re-enable `pointer-events: auto` on interactive elements (links, buttons).

### Navigation
- Fixed top, minimal height (`64px` or less).
- No background color, no blur. Use `mix-blend-mode: difference` if text sits over the gradient.
- Logo left (wordmark in sans-serif, tracked out). Links right (small, uppercase, `letter-spacing: 0.1em`).
- No hamburger menu on desktop. On mobile, a simple full-screen overlay with large serif links.

---

## Suggested Site Structure

Adapt this structure to the project's actual content, but maintain the editorial rhythm:

### 1. Preloader (Optional but Recommended)
- A brief (`1.2s`) fade-in.
- The brand wordmark resolves from static noise into crisp text.
- Background: `#0a0612`.

### 2. Hero Section
- **Full viewport** (`100vh`).
- **No centered text block**. Place a large, left-aligned (or right-aligned) serif headline. Let it partially overlap the brightest part of the gradient.
- A single thin horizontal rule (`1px`, `rgba(255,255,255,0.2)`) below or beside the headline.
- A small paragraph (sans-serif, `0.875rem`, uppercase, tracked out) in the bottom-right or bottom-left corner. Like a gallery placard.
- **No primary CTA button**. If a link is needed, use text-only with a small arrow (`→`) that shifts right on hover.

### 3. Manifesto / Philosophy Section
- **Asymmetric two-column grid** (e.g., 5 columns + 7 columns).
- Left: A large serif pull-quote (`2.5rem`, italic optional). Let a single word use `background-clip: text` with the Grainient colors.
- Right: Small, precise sans-serif body copy (`1rem`, `1.6` line-height). Generous padding.
- Background: `#0a0612` (dark void). The Grainient is no longer visible here; the texture comes from the static noise overlay.

### 4. Work / Projects / Gallery
- **Full-bleed imagery**. Images should be high-quality photography (fashion, architecture, or abstract art).
- Overlay the gradient on images using `mix-blend-mode: soft-light` or `color` at low opacity (`20%`) to tint them into the brand palette.
- Titles: Small, uppercase, sans-serif, `letter-spacing: 0.15em`, placed at the bottom-left of each image.
- Use a **staggered grid**: some images span 6 columns, others 4, with vertical offsets (`margin-top: 4rem` on alternating items).

### 5. Contact / Footer
- Minimal. Almost stark.
- A single large email link (`2rem`, serif) that changes from off-white to `#FF9FFC` on hover.
- No contact form unless absolutely necessary. If a form is required, use minimal inputs: `1px` bottom border only, no background, no outline on focus (just border color change to `#5227FF`).
- Footer links: Tiny, uppercase, tracked out, spaced far apart.

---

## Typography & Spacing Guidelines

| Element | Specification |
|---------|---------------|
| **H1 (Hero)** | Serif, `clamp(3rem, 6vw, 7rem)`, `line-height: 0.95`, `letter-spacing: -0.03em`, `font-weight: 400` |
| **H2 (Section)** | Serif, `clamp(2rem, 4vw, 4rem)`, `line-height: 1.0`, `letter-spacing: -0.02em` |
| **Body** | Sans-serif, `1rem`, `line-height: 1.6`, `color: rgba(240, 230, 255, 0.7)` |
| **Caption / Label** | Sans-serif, `0.75rem`, `uppercase`, `letter-spacing: 0.12em`, `color: rgba(240, 230, 255, 0.5)` |
| **Section Padding** | `padding: 8rem 0` minimum. Between major sections: `12rem` to `16rem`. |
| **Grid Gap** | `2rem` for tight, `4rem` for editorial breathing room. |

---

## Interaction Details

- **Links**: No underline by default. On hover, a `1px` line draws in from left to right (CSS `scaleX` transform, `transform-origin: left`). Color shifts to `#FF9FFC`.
- **Buttons**: Avoid filled buttons. Use `1px` outline (`rgba(255,255,255,0.3)`), transparent background, small padding (`0.75rem 1.5rem`). On hover: outline color becomes `#FF9FFC`, text color becomes `#FF9FFC`.
- **Images**: On hover, a very subtle scale (`transform: scale(1.02)`) over `0.6s ease-out`. No sudden brightness changes.
- **Grainient Interaction**: Optionally, map the mouse position to `centerX` and `centerY` with extreme smoothing (`lerp: 0.05`) so the gradient subtly follows the cursor like a slow-moving liquid.

---

## Quality Assurance Checklist

Before finalizing, verify:

- [ ] **Does it look like a contemporary fashion brand or art gallery website?** If it looks like a SaaS startup, redesign.
- [ ] **Is the typography confident?** Headlines should feel almost too large. Body text should feel small and precise.
- [ ] **Is there any generic "features" section with icons?** Remove it.
- [ ] **Does the gradient feel integrated?** It should feel like light bleeding through fabric, not a CSS `linear-gradient` slapped behind text.
- [ ] **Is the mobile experience respectful?** On mobile, the editorial layout should stack vertically but maintain large type and generous whitespace. Do not cram everything into tiny cards.
- [ ] **Is the performance acceptable?** The WebGL canvas should pause via `IntersectionObserver` and `visibilitychange` when off-screen or tab-hidden (handled by the Grainient component).
- [ ] **Are there any generic animations?** Every motion should feel slow, weighted, and expensive.
- [ ] **Is the content real?** Use actual project names, real copy, and meaningful imagery. No lorem ipsum.

---

## Final Instruction

Build a website that feels **expensive, quiet, and intentional**. The Grainient shader is the soul of the design—let it breathe. Everything else should serve it: typography that stands against it, whitespace that frames it, and motion that mirrors its slow, organic rhythm. Do not build a template. Build a singular piece of digital craft.
