---
version: alpha
name: Wordoff
description: >-
  Wordoff is a word standoff: you and an AI rival chase the same secret word on
  separate boards and reveal each round at the same moment. The surface keeps a
  warm, friendly base (cream canvas, warm charcoal ink, flat soft-rounded
  shapes) and adds what a duel needs: two opposing side colors, a dark mode,
  game tiles, and a motion system built around the "DRAW!" reveal.
lineage: >-
  Adapted from a Headspace-style DESIGN.md (kept for reference in
  docs/reference/headspace-DESIGN.md). Kept: warm canvas, warm charcoal ink,
  flat surfaces, 8/16/24/32 radii. Changed: open font (Inter) instead of a
  proprietary face, two side colors instead of one CTA color, original duelist
  characters instead of another brand's mascots, plus dark mode, tile/keyboard
  specs and motion tokens that the original never had.

colors:
  # Base: warm and calm, so the tension comes from the game, not the chrome.
  canvas: "#f9f4f2"
  surface: "#ffffff"
  ink: "#2d2c2b"
  ink-soft: "#63605d"
  hairline: "#e2ded9"
  # The two sides of the standoff. Never swap them; never use them for anything else.
  you: "#0061ef"
  you-soft: "#dce8fd"
  rival: "#d6336c"
  rival-soft: "#fadbe6"
  # Tile feedback
  correct: "#02873e"
  present: "#ffce00"
  absent: "#8a8580"
  on-correct: "#ffffff"
  on-present: "#2d2c2b"
  on-absent: "#ffffff"
  # Colorblind mode replaces correct/present
  correct-cb: "#f5793a"
  present-cb: "#85c0f9"
  # Moments
  danger: "#c92a2a" # shot clock under 5s, sudden death banner
  dusk: "#3b197f" # sudden death backdrop tint

colors-dark:
  canvas: "#1b1a19"
  surface: "#262523"
  ink: "#f4efe9"
  ink-soft: "#a8a29b"
  hairline: "#3a3835"
  you: "#4d8ef7"
  you-soft: "#1d2c48"
  rival: "#f06595"
  rival-soft: "#4a1f30"
  correct: "#2b9a52"
  present: "#e6b800"
  absent: "#4a4744"

typography:
  family: "Inter, system-ui, sans-serif"
  weights: [400, 500, 700, 800]
  display: { size: 40, weight: 800, tracking: -1.2, use: "DRAW!, result headline" }
  title: { size: 28, weight: 700, tracking: -0.6, use: "screen titles" }
  heading: { size: 20, weight: 700, tracking: -0.3, use: "card titles, rival names" }
  body: { size: 16, weight: 400, lineHeight: 1.5 }
  label: { size: 14, weight: 700, use: "buttons, keyboard keys" }
  caption: { size: 12, weight: 500, use: "meta, timers, stat labels" }
  tile: { size: 30, weight: 800, transform: uppercase }
  tile-mini: { size: 0, use: "rival board shows color only, never letters" }

rounded:
  tile: 8
  key: 8
  card: 16
  panel: 24
  button: 32
  pill: 999

spacing: [4, 8, 12, 16, 24, 32, 48]

motion:
  # Durations in ms. With reduced motion on, every one of these becomes a 150ms fade.
  key-press: 80
  tile-pop: { duration: 100, scale: 1.12 }
  tile-flip: { half: 220, stagger: 110 }
  row-shake: { duration: 420, distance: 8, cycles: 3 }
  countdown-beat: 550 # "3", "2", "1"
  draw-slam: { spring: { damping: 12, stiffness: 220 }, overshoot: 1.15 }
  win-bounce: { duration: 260, stagger: 80, lift: 18 }
  lose-dim: { duration: 400, opacity: 0.45 }
  taunt-bubble: { in: 200, hold: 2600, out: 200 }
  shot-clock-pulse: { under: 5000, period: 500 }
---
