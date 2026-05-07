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
