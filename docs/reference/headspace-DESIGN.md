---
version: alpha
name: Headspace
website: "https://www.headspace.com"
description: >-
  Headspace's marketing system is a meditation-app surface dressed as a friendly
  children's-book classroom — a warm off-white canvas ("#f9f4f2"), a deep warm
  charcoal ink ("#2d2c2b") carrying every headline, a saturated blue CTA pill
  ("#0061ef") that lives on a 32px pill geometry and a 48px tap height, and a
  cast of hand-drawn character orbs in saffron yellow ("#ffce00"), bubble pink
  ("#ffa1cc"), aqua ("#00a4ff"), grass green ("#02873e"), and ultraviolet
  ("#3b197f") floating between sections instead of stock photography. Type
  runs Headspace Apercu across every signature, from 12px nav meta to a 64px /
  weight-700 / -1.92px tracked hero — one custom family, no display serif, no
  italic, no monospace, no second voice.

seo:
  title: "Headspace Design System for React — Apercu, blue CTA #0061ef, 18 components"
  metaDescription: "Headspace's design system as a DESIGN.md file. Warm charcoal #2d2c2b, blue pill #0061ef, Apercu, character-orb mascots, 18 colors. For React, Next.js, and AI tools."
  highlights:
    - "Warm charcoal monopoly — #2d2c2b carries every h1, h2, h3, and body paragraph; pure black appears only in form-input text"
    - "One CTA voltage — #0061ef on a 32px-radius pill, 48px tall, weight 700 / 14px / uppercase-free; no second saturated fill anywhere in the chrome"
    - "Character-orb mascots — saffron #ffce00, pink #ffa1cc, aqua #00a4ff, grass #02873e, ultraviolet #3b197f orbs replace photography, gradients, and mesh"
    - "Cream-as-canvas — #f9f4f2 off-white runs the full page floor where wellness peers reach for terracotta or sage"
    - "House radii of 16/24/32px — soft-rectangle cards, larger feature plates, fully-pill CTAs; no 4px, no 8px, no 12px in the visible chrome"
  tags:
    - "Healthcare & Wellness"
  lastUpdated: "2026-05-13"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Headspace's marketing surface reads as a children's storybook re-rendered with platform-grade UI scaffolding. The page floor is a warm off-white ("#f9f4f2") rather than the cold "#ffffff" most app marketing reaches for; the load-bearing text color is a warm charcoal ("#2d2c2b") that sits softer on the eye than pure black; and floating between every section is a cast of hand-drawn character orbs — saffron yellow, bubble pink, aqua, grass green, ultraviolet purple — each one a member of the brand's mascot taxonomy rather than a stock photograph or gradient background. The single saturated voltage is a blue ("#0061ef") that lives only on the primary CTA pill and a handful of inline accent dots. Where most meditation brands reach for sage greens or soft terracotta to signal serenity, Headspace argues — through its chrome — that wellness can be playful, even loud, as long as the type stays warm and the canvas stays cream.

    This DESIGN.md packages the surface using the Google Labs spec: 18 color tokens (5 character-orb mascots, the blue CTA voltage, warm charcoal ink, off-white canvas, plus structural hairlines and grays), 12 typography levels (all Headspace Apercu, weights 400 / 500 / 700, sizes ranging from 12px nav meta to a 64px / weight-700 / -1.92px-tracked hero h2), 5 corner radii anchored at 16px for cards and 32px for CTAs, 8 spacing values built around a 4 / 8 / 24 / 32 / 48px scale, and 17 components covering the blue CTA pill, secondary outline button, dark "chat with Ebb" pill, character-orb tile, testimonial card, FAQ row, the warm-charcoal-on-yellow feature panel, and the blue enterprise band that anchors the page below the fold. Every hex is grounded in the live extraction.

    Feed this file to an AI coding tool and the agent will reproduce Headspace's specific dialect — warm charcoal on cream, blue pill CTAs at 32px radius, character orbs in the margin, Apercu at three weights — rather than a generic wellness theme of pastel greens and Inter headings. Or use the spec as a reference: every hex, font weight, radius, and spacing value is a quoted token ready for Tailwind config or CSS variables. The result is a meditation-app surface that earns its warmth by refusing the visual shortcuts most peers depend on — no nature photography, no soft-serif gestures, no eucalyptus-green wash, no lotus illustration. Just cream canvas, warm charcoal ink, one blue pill, and a cast of character orbs.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.headspace.com"
      title: "Headspace — official site"
      description: "The mental-health app for meditation, sleep, and therapy — the live marketing surface this design system was extracted from."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files."
  questions:
    - id: "primary-color"
      title: "What is Headspace's primary brand color?"
      answer: "Headspace's primary voltage is a saturated blue at #0061ef — the exact hex carried by the 'Try for free' CTA pill, the enterprise 'Over 4,000 leading organizations choose Headspace' band, and a handful of inline accent dots inside feature chips. The load-bearing text color is the warm charcoal #2d2c2b that runs every h1, h2, h3, and body paragraph (frequency 309 across text and borders). Pure black (#000000) appears only inside form-input value text. The brand refuses to introduce a second saturated CTA color — secondary actions render as a dark pill ('Chat with Ebb') on a warm-yellow surface, not as a competing blue."
    - id: "typography"
      title: "What typography does Headspace use, and what's the substitute?"
      answer: "Headspace runs one custom typeface — Headspace Apercu — across every type signature on the page: display headlines at 64px / 52px / 40px / 32px in weight 700, sub-heads at 24px in weight 500, body paragraphs at 18–20px in weight 400, nav meta at 12px in weight 500, and CTA labels at 14px in weight 700 with normal letter-spacing. There is no display serif, no italic, no monospace, and no second family. Apercu is a Swiss humanist sans by Colophon Foundry; if it isn't available, the closest open-source substitute is Inter — bump line-heights up by ~5% to match Apercu's slightly wider counters."
    - id: "ctas"
      title: "Why are Headspace's primary buttons a 32px-radius blue pill at 48px height?"
      answer: "The primary CTA renders Apercu at 14px / weight 700 / normal letter-spacing on a #0061ef fill with white text, 32px border-radius, 48px tall, 14.3×24px padding. The 32px radius (not the fully-pill 800px that the secondary outline pills use) is the brand's signature — soft enough to read as friendly but not so round that it loses its UI button identity. The 48px height clears the WCAG AAA tap-target threshold. The brand never uses sentence-case rectangles or 4–8px-radius corporate buttons for the primary; the pill geometry is non-negotiable."
    - id: "mascots"
      title: "What role do the character orbs play in the system?"
      answer: "The character orbs are the entire decoration layer. The site has zero stock photography of meditators in lotus pose, zero gradient meshes, zero atmospheric mountain scenes — instead, hand-drawn orbs in saffron yellow (#ffce00), bubble pink (#ffa1cc), aqua (#00a4ff), grass green (#02873e), and ultraviolet (#3b197f) float between sections, each one a member of Headspace's mascot taxonomy. They cluster above section headlines, sit inside feature chips ('Stress less', 'Sleep soundly', 'Manage anxiety'), and anchor the testimonial band. Substituting stock photography breaks the brand voice; the character set is Headspace IP."
    - id: "canvas-warmth"
      title: "Why is the canvas #f9f4f2 instead of #ffffff?"
      answer: "Headspace's canvas is a warm off-white (#f9f4f2 — frequency 27 on backgrounds) rather than pure white. The choice is deliberate: pure white reads cold and clinical alongside warm-charcoal type, while #f9f4f2 has just enough cream warmth to feel skin-temperature without tipping into the beige territory of spa marketing. Pure white (#ffffff) still appears in the system (frequency 197) but is reserved for card surfaces, feature plates, and form inputs floating over the cream canvas — never as the page floor."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build a React wellness or meditation app?"
      answer: "Yes — the file feeds AI coding tools and the agent will reproduce Headspace's specific dialect (warm-charcoal headlines on cream, blue 32px pill CTAs, character-orb mascots in the margin, Apercu at three weights) rather than a generic shadcn theme of pastel greens and grayscale Inter. Every hex, type token, radius, and spacing value is a quoted token you can paste into Tailwind config or CSS variables. The character-orb illustrations are Headspace IP — source your own mascot set, or use placeholder colored circles to preserve the chromatic rhythm when reusing the system."

colors:
  primary: "#0061ef"
  primary-deep: "#0000ee"
  ink: "#2d2c2b"
  ink-strong: "#141313"
  ink-soft: "#44423f"
  ink-muted: "#4b4c4d"
  ink-meta: "#63605d"
  canvas: "#f9f4f2"
  surface: "#ffffff"
  hairline: "#e2ded9"
  hairline-cool: "#d2d5de"
  on-primary: "#ffffff"
  on-canvas: "#000000"
  orb-saffron: "#ffce00"
  orb-pink: "#ffa1cc"
  orb-aqua: "#00a4ff"
  orb-grass: "#02873e"
  orb-ultraviolet: "#3b197f"

typography:
  display-xl:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-1.92px"
  display-lg:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 52px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-1.56px"
  display-md:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-1.2px"
  display-sm:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.96px"
  heading-md:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.96px"
  heading-sm:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: "-0.6px"
  body-lg:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.72px"
  body-md:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.2px"
  body-sm:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.44
    letterSpacing: "-0.18px"
  body-xs:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  button-md:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0
  caption:
    fontFamily: "'Headspace Apercu', sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.12px"

rounded:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  full: "800px"

spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.xl}"
    padding: "14.3px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "12.1px 24px"
    height: "48px"
    borderColor: "{colors.ink}"
  button-dark-pill:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "8px 16px 8px 24px"
    height: "40px"
  button-tertiary-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    border: "0"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-xs}"
    height: "64px"
    padding: "16px 24px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-xs}"
    padding: "0"
  hero-headline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    padding: "0"
  hero-subhead:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: "0"
  feature-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "16px"
    height: "56px"
    borderColor: "{colors.hairline}"
  orb-tile:
    backgroundColor: "{colors.orb-saffron}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    rounded: "{rounded.lg}"
    padding: "24px 19.2px 32px"
  testimonial-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "24px"
    borderColor: "{colors.hairline}"
  enterprise-band:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-sm}"
    rounded: "{rounded.lg}"
    padding: "48px"
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-canvas}"
    typography: "{typography.body-xs}"
    rounded: "{rounded.sm}"
    padding: "24px 16px 8px"
    height: "58px"
    borderColor: "{colors.hairline-cool}"
  faq-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-sm}"
    padding: "24px 0"
    borderColor: "{colors.hairline}"
  footer-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-xs}"
    padding: "48px 24px"
  banner-link:
    backgroundColor: "{colors.orb-saffron}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    padding: "8px 16px"
    height: "32px"
---

## Overview

Headspace's marketing surface reads less like a meditation app and more like a children's storybook re-laid as a web product page. The base canvas is a **warm off-white** (`{colors.canvas}` — #f9f4f2), the load-bearing ink is a **warm charcoal** (`{colors.ink}` — #2d2c2b) running every h1, h2, h3, and body paragraph, and the single saturated voltage is a confident blue (`{colors.primary}` — #0061ef) on the "Try for free" CTA pill. Where most meditation brands reach for sage greens or terracotta to signal serenity, Headspace argues through its chrome that wellness can be playful — even loud — as long as the type stays warm and the canvas stays cream.

**Mascot-as-decoration**: The page has no stock photography of meditators in lotus pose, no gradient meshes, no atmospheric mountain scenes. Instead, hand-drawn character orbs — saffron yellow (`{colors.orb-saffron}` — #ffce00), bubble pink (`{colors.orb-pink}` — #ffa1cc), aqua (`{colors.orb-aqua}` — #00a4ff), grass green (`{colors.orb-grass}` — #02873e), ultraviolet (`{colors.orb-ultraviolet}` — #3b197f) — float between sections, cluster above section headings, and sit inside feature chips. Unlike the convention of wellness brands using nature photography as the emotional carrier, Headspace lets the mascots do that work, and reserves the chrome for warm, scarcely-decorated type.

Type runs **Headspace Apercu** alone — display, body, navigation, captions, button labels. There is no display serif, no italic, no monospace, no second family. The system pivots on three weights (400 / 500 / 700) and a size scale climbing from 12px caption (`{typography.caption}`) to a 64px / weight-700 / -1.92px-tracked hero (`{typography.display-xl}`). Shape language is equally restrained: 16px on cards (`{rounded.md}`), 24px on orb tiles and the enterprise band (`{rounded.lg}`), 32px on the primary CTA (`{rounded.xl}`), and the fully-pill 800px (`{rounded.full}`) on secondary outline buttons and the dark "Chat with Ebb" pill. There is no 4px, no 12px in the visible chrome — five radii cover the entire surface.

**Key Characteristics:**
- Single CTA voltage: `{colors.primary}` (#0061ef) carries the "Try for free" pill, the enterprise band, and a few inline accent dots. No second saturated fill anywhere.
- Warm-charcoal ink monopoly: `{colors.ink}` (#2d2c2b, frequency 309) runs every h1, h2, h3, and body paragraph. Pure black appears only inside form-input value text.
- Five-orb mascot taxonomy: saffron, pink, aqua, grass, ultraviolet — each a hand-drawn character that replaces stock photography, gradients, and mesh backgrounds.
- Cream-as-canvas: `{colors.canvas}` (#f9f4f2) runs the page floor where pure white (`{colors.surface}` — #ffffff, frequency 197) is reserved for card surfaces and form inputs floating over it.
- One typeface, three weights: Headspace Apercu at 400 / 500 / 700, sizes 12px caption to 64px hero. No serif, no italic.
- Five-radius geometry: 8 / 16 / 24 / 32 / 800px. The 32px primary CTA radius is the brand's signature — soft enough to read friendly without losing the UI button identity.
- Hero typography over open canvas: 64px / weight 700 / -1.92px letter-spacing h2 in warm charcoal — the page's loudest typographic moment.
- No box-shadow tier: every card, every nav surface, every button sits flat — depth comes from 1px `{colors.hairline}` (#e2ded9) hairlines and 16px corner rounding.

## Colors

### Brand & Voltage
- **Primary Blue** (`{colors.primary}` — #0061ef) — frequency 14. Used as bg (6), text (4), border (4). The single saturated voltage. Anchors the "Try for free" CTA pill, the enterprise "Over 4,000 leading organizations" band, and accent dots inside feature chips. Reserved as the only blue fill — never appears on cards, headlines, or section bands.
- **Primary Deep** (`{colors.primary-deep}` — #0000ee) — frequency 100. Used as text (50), border (50). A deeper indigo that surfaces on inline link text and the press state of the primary CTA pill. Despite the high raw count, it appears only on links inside body paragraphs — never as a fill.

### Surface
- **Canvas** (`{colors.canvas}` — #f9f4f2) — frequency 27. Used as bg (27). The warm off-white page floor. Carries every major section band; pure white is reserved for cards floating over it.
- **Surface** (`{colors.surface}` — #ffffff) — frequency 197. Used as text (91), bg (23), border (83). Pure white — reserved for feature chips, testimonial cards, the form input fill, and the "Try for free" button text. Never used as the page floor.

### Ink & Body
- **Ink** (`{colors.ink}` — #2d2c2b) — frequency 309. Used as text (151), bg (9), border (149). The signature warm charcoal. Every h1, h2, h3, and body paragraph renders in this tone — the dominant ink color on the page.
- **Ink Strong** (`{colors.ink-strong}` — #141313) — frequency 1. Used as shadow (1). The near-black used inside the rare drop-shadow stack on the "Chat with Ebb" pill.
- **Ink Soft** (`{colors.ink-soft}` — #44423f) — frequency 292. Used as text (148), bg (7), border (134). A slightly graphite charcoal for secondary running text — fine-print disclaimers and footer copy.
- **Ink Muted** (`{colors.ink-muted}` — #4b4c4d) — frequency 911. Used as text (459), border (452). The workhorse mid-gray that appears across nav links, body meta, and hairline borders — the highest-count token in the extraction.
- **Ink Meta** (`{colors.ink-meta}` — #63605d) — frequency 8. Used as text (4), border (4). The dimmest tier — reserved for tertiary meta labels like "Member on processing through their feelings".

### Hairlines
- **Hairline** (`{colors.hairline}` — #e2ded9) — frequency 6. Used as border (6). The default 1px warm-gray hairline on feature chips, testimonial cards, and FAQ row dividers.
- **Hairline Cool** (`{colors.hairline-cool}` — #d2d5de) — frequency 1. Used as border (1). The slightly cooler hairline reserved for the subscription form's text input — the only cool-spectrum border in the system.

### Mascot Orbs
- **Orb Saffron** (`{colors.orb-saffron}` — #ffce00) — frequency 4. Used as bg (4). The yellow character orb — anchors the "Always-there support" feature panel and the top-of-page banner ribbon.
- **Orb Pink** (`{colors.orb-pink}` — #ffa1cc) — frequency 1. Used as bg (1). The pink character orb — appears once in the hero mascot cluster.
- **Orb Aqua** (`{colors.orb-aqua}` — #00a4ff) — frequency 1. Used as bg (1). The aqua character orb — appears once in the feature-chip row ("Manage anxiety").
- **Orb Grass** (`{colors.orb-grass}` — #02873e) — frequency 1. Used as bg (1). The grass-green character orb — appears once in the mascot constellation above the testimonial band.
- **Orb Ultraviolet** (`{colors.orb-ultraviolet}` — #3b197f) — frequency 1. Used as bg (1). The deep-purple character orb — the rarest of the five, appearing once as a contrasting weight in the top mascot cluster.

### On-Color
- **On Primary** (`{colors.on-primary}` — #ffffff) — white text inside the blue CTA pill and the dark "Chat with Ebb" pill.
- **On Canvas** (`{colors.on-canvas}` — #000000) — frequency 5. Used as text (3), border (2). Reserved exclusively for value text inside the email subscription input — the only place pure black appears in the system.

## Typography

### Font Family
The system runs **Headspace Apercu** for everything — display, body, navigation, captions, button labels, footer links. There is no separate display family, no italic family, and no monospace family. Apercu is a Swiss humanist sans by Colophon Foundry; Headspace's custom cut tightens the apertures and adds a slightly wider 'o' counter, which keeps the 64px hero from feeling architectural.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.display-xl}` | 64px | 700 | 1 | Hero h2 ("Members are enjoying happier and healthier lives") |
| `{typography.display-lg}` | 52px | 700 | 1.1 | Section h2 ("all with Headspace") |
| `{typography.display-md}` | 40px | 700 | 1.15 | Mid-page h2 / h3 ("Over 4,000 leading organizations choose Headspace") |
| `{typography.display-sm}` | 32px | 700 | 1.2 | Sub-section h2 / h5 ("Sleep better", "The mental health app for every moment") |
| `{typography.heading-md}` | 32px | 500 | 1.2 | Heading sub-variant for softer section titles |
| `{typography.heading-sm}` | 24px | 700 | 1.33 | Feature card titles ("Mental health app with expert-led meditations and tools") |
| `{typography.body-lg}` | 24px | 400 | 1.2 | Lead paragraph beneath hero h2 |
| `{typography.body-md}` | 20px | 400 | 1.5 | Default body — testimonial copy, feature descriptions |
| `{typography.body-sm}` | 18px | 500 | 1.44 | Banner-link copy, secondary section labels |
| `{typography.body-xs}` | 16px | 400 | 1.5 | Nav meta, form labels, footer running text |
| `{typography.button-md}` | 14px | 700 | 1.1 | Primary CTA pill label ("Try for free"), secondary outline labels |
| `{typography.caption}` | 12px | 500 | 1.15 | Top-bar meta links, copyright lines, fine-print disclaimers |

### Principles
**Weight-light display**: Headspace's display hierarchy lives almost entirely at weight 700 — the 64px hero, the 52px section h2, the 40px enterprise band, and the 32px sub-section heads all run weight 700 with negative letter-spacing (-0.96px to -1.92px). Where most marketing systems use a 600 → 700 ladder to separate display tiers, Headspace flattens that to a single weight and lets size + tracking do the work. The slight tracking compression on the largest sizes (-1.92px on 64px ≈ -3% of em) keeps the heavy weight from blowing out the page's open rhythm.

The single sub-display moment at weight 500 is `{typography.heading-md}` (32px / 500) — a softer header treatment reserved for testimonial section titles where the weight 700 would feel evangelistic.

### Note on Font Substitutes
If Headspace Apercu is unavailable, **Inter** is the closest open-source substitute. Bump line-heights up by ~5% and tighten letter-spacing slightly on display sizes (~-2% of em on 40px+) to approximate Apercu's wider counters and the brand's tracked-display feel.

## Layout

### Spacing System
- **Base unit:** 4px (with 6px and 8px modal steps).
- **Tokens:** `{spacing.xxs}` 4px · `{spacing.xs}` 6px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.2xl}` 48px.
- **Section padding (vertical):** `{spacing.2xl}` (48px, frequency 5) between major bands — hero → feature chip row → orb-tile carousel → testimonial → enterprise band → FAQ rhythm.
- **Card internal padding:** `{spacing.lg}` (24px) on testimonial cards and FAQ rows; a 24px 19.2px 32px composite on orb tiles (frequency 7); 16px on feature chips.
- **Gutters:** `{spacing.xxs}` (4px, frequency 47) between inline icon and label pairs — the highest-frequency spacing in the extraction.

### Grid & Container
- **Max content width:** ~1280px centered on the homepage.
- **Hero band:** centered single-column composition. A small saffron banner ribbon sits at the very top ("Take a Global Deep Breath on May 13th"); below it the Headspace wordmark and product menu sit flush left, account utilities flush right, with the "Try for free" pill anchoring the right edge.
- **Feature-chip row:** 3-column grid at desktop with each white-on-white chip housing a label ("Stress less", "Sleep soundly", "Manage anxiety", "Process thoughts", "Practice meditation", "Start therapy"), an orb icon, and a 1px hairline border.
- **Orb-tile carousel:** a horizontal scroll of large rounded tiles, the first one a saffron-yellow panel housing the "Always-there support" feature with a pink mascot orb and an inline "Chat with Ebb" dark pill.
- **Testimonial grid:** 3-column white card row with each card carrying a 5-star icon header, a multi-line review excerpt, and a member-name label in `{typography.caption}`.
- **Enterprise band:** single-column blue card-band (#0061ef on cream) carrying the 40px / weight-700 headline "Over 4,000 leading organizations choose Headspace" plus paired CTAs ("Request a demo", "Learn more").

### Whitespace Philosophy
The system gives feature chip rows 4px-tight inline gutters but pads major bands at 48px vertical breathing room. The contrast reinforces the brand's voice: dense, friendly UI at the chip scale; generous, contemplative breathing room at the section scale. Headspace pads the page where the brand is most emotional, and compresses it where the page is most utilitarian.

## Elevation

The system has **no shadow tier** in the body chrome — every card, every nav surface, every button sits flat against the cream canvas. Depth comes from color separation (white card on cream, blue band on cream, dark "Chat with Ebb" pill on saffron orb tile) and from 16/24px corner rounding.

- **Flat (no shadow):** ~99% of surfaces. Feature chips, testimonial cards, FAQ rows, top nav, footer — every component renders without a box-shadow.
- **Single shadow exception:** the "Chat with Ebb" dark pill on the saffron orb tile carries a single near-black drop shadow at `{colors.ink-strong}` (#141313, frequency 1) — the only shadow token in the entire extraction. It reads as a press-state lift on a tactile button rather than as ambient elevation.

**Flat-as-warmth**: Where most wellness systems reach for soft drop-shadows to signal pillowy comfort, Headspace argues — through its chrome — that warmth comes from cream canvas and warm-charcoal type, not from softening every surface with a 12px shadow blur. The flatness lets the mascot orbs carry the brand's atmosphere instead.

## Shapes

The corner-radius scale is narrow but the jumps between tiers are dramatic: **five radii cover every interactive surface**.

- **8px** (`{rounded.sm}`) — frequency 7. Reserved for the text input on the subscription form — the only small-radius surface in the system.
- **16px** (`{rounded.md}`) — frequency 24. The house radius. Feature chips, testimonial cards, image plates, and FAQ surfaces.
- **24px** (`{rounded.lg}`) — frequency 12. Larger feature plates and the enterprise band. The first geometric tier where rounding starts to read as "card with attitude" rather than "soft rectangle".
- **32px** (`{rounded.xl}`) — frequency 18. The primary CTA radius. Soft enough to read friendly, sharp enough to keep its UI button identity. Reserved exclusively for the "Try for free" pill and a few inline orbs.
- **800px** (`{rounded.full}`) — frequency 4. Fully-pill geometry. Reserved for secondary outline buttons ("Check your coverage", "Learn more") and the dark "Chat with Ebb" pill. The clearest CTA-hierarchy signal in the system: primary CTAs at 32px (`{rounded.xl}`), secondary CTAs at 800px (`{rounded.full}`).

There is no 4px radius, no 12px radius, and no 20px radius. The system collapses the conventional scale into five tiers where the jumps (8 → 16 → 24 → 32 → 800) are large enough that geometry alone signals component role.

## Components

### Buttons

**`button-primary`** — Blue pill (`{colors.primary}` — #0061ef), white text, 32px radius (`{rounded.xl}`), 14.3×24px padding, 48px height, weight 700, 14px label. The single voltage moment on the page — "Try for free", "Get started". No secondary blue exists.

**`button-primary-hover`** — Press state shifts the fill toward `{colors.primary-deep}` (#0000ee). No transform, no shadow change.

**`button-secondary`** — White fill, warm-charcoal text, 1px warm-charcoal hairline (`{colors.ink}` — #2d2c2b), 800px fully-pill radius. Used for inverse CTAs ("Check your coverage", "Learn more"). The radius difference (`{rounded.full}` vs. `{rounded.xl}`) is the system's clearest CTA-hierarchy signal.

**`button-dark-pill`** — Warm-charcoal fill (`{colors.ink}`), white text, 800px radius, 8×16×8×24px asymmetric padding. The signature inline pill ("Chat with Ebb") that anchors the saffron orb-tile feature panel — the only place a dark fill button appears.

**`button-tertiary-text`** — Plain warm-charcoal text in `{typography.caption}`, no surface, no border. Used for inline footer links and top-bar copyright meta.

### Top Navigation

**`top-nav`** — Cream surface (`{colors.canvas}`), 64px height, 16×24px padding, no bottom hairline. The Headspace wordmark and orb logomark sit flush left; the product menu items ("For You", "For Business", "For Providers", "Our Plans", "Resources", "About") sit center; account utilities ("Log In", "Help", "Try for free") sit flush right.

**`nav-link`** — Plain warm-charcoal text in `{typography.body-xs}` (16px / 400). No pill background, no underline, no hover-surface fill on the static page — hover state is reserved to the live product, not the marketing scroll.

### Hero

**`hero-headline`** — The 64px / weight-700 / -1.92px-tracked h2 ("Members are enjoying happier and healthier lives") in warm charcoal. Sits over the cream canvas with mascot orbs (pink, aqua, grass, ultraviolet) floating around it as a constellation rather than as a photograph.

**`hero-subhead`** — 18px / 500 / -0.18px-tracked paragraph in warm charcoal ("Take a Global Deep Breath on May 13th") sitting inside the top saffron banner ribbon as a date-specific event prompt.

### Cards & Tiles

**`feature-chip`** — White surface, warm-charcoal text, 16px radius (`{rounded.md}`), 16px padding, 56px height, 1px hairline (`{colors.hairline}`) border. Houses a label + orb icon pair — six of them stack in a 3×2 grid above the orb-tile carousel.

**`orb-tile`** — Saffron-yellow surface (`{colors.orb-saffron}`), warm-charcoal text, 24px radius (`{rounded.lg}`), 24×19.2×32px composite padding. The signature feature panel — houses a chat-bubble illustration, a 24px / 700 title ("Always-there support"), a body paragraph in `{typography.body-md}`, and the inline dark "Chat with Ebb" pill. The page's only saturated-color surface band aside from the blue enterprise band.

**`testimonial-card`** — White surface, warm-charcoal text, 16px radius, 24px padding, 1px hairline (`{colors.hairline}`) border. Houses a member-quote in `{typography.body-md}` plus a member-name label in `{typography.caption}` ("Member on forming new helpful habits").

**`enterprise-band`** — Blue surface (`{colors.primary}` — #0061ef), white text, 24px radius (`{rounded.lg}`), 48px padding. The mid-scroll anchor: houses the 40px / weight-700 enterprise headline plus paired "Request a demo" and "Learn more" CTAs. The only band that uses the primary blue as a surface fill.
