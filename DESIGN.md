---
version: alpha
name: Wordoff
description: >-
  Saloon Card Table. Every duel is dealt across a saloon table: brown baize
  felt between two seats, a walnut rail around it, cream card-stock tiles that
  turn face up, brass for the primary action and scout chips. Ink navy is
  your seat, oxblood is the rival's. Ultra wood-type for display, Zilla Slab
  for tiles and headings, the platform face for body text.
colors:
  canvas: "#efe3cb"
  surface: "#f8efdd"
  ink: "#2e1d13"
  ink-soft: "#6b5240"
  hairline: "#d8c6a5"
  felt: "#5a3a24"
  felt-deep: "#472d1b"
  felt-ink: "#f1e3c6"
  felt-ink-soft: "#c9b18c"
  walnut: "#2e1d13"
  walnut-ink: "#efe3cb"
  card: "#f6ead2"
  card-edge: "#cdb48a"
  card-back: "#7d2a22"
  you: "#24344f"
  rival: "#9e2b25"
  brass: "#b8862b"
  brass-deep: "#8f6519"
  on-brass: "#24170e"
  correct: "#4f6b2e"
  present: "#c8962e"
  absent: "#8a7562"
  danger: "#b33a1f"
typography:
  display:
    fontFamily: "Ultra"
    fontSize: 40px
    fontWeight: 400
    letterSpacing: "0.5px"
  headline:
    fontFamily: "Zilla Slab"
    fontSize: 28px
    fontWeight: 700
  title:
    fontFamily: "Zilla Slab"
    fontSize: 21px
    fontWeight: 700
  tile:
    fontFamily: "Zilla Slab"
    fontSize: 54%
    fontWeight: 700
  key:
    fontFamily: "Zilla Slab"
    fontSize: 19px
    fontWeight: 700
  body:
    fontFamily: "system-ui"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Zilla Slab"
    fontSize: 11px
    fontWeight: 700
    letterSpacing: "1px"
rounded:
  tile: 6px
  key: 6px
  card: 12px
  button: 14px
  panel: 18px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.on-brass}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: 48px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: 48px
  button-rival:
    backgroundColor: "{colors.rival}"
    textColor: "{colors.card}"
    typography: "{typography.title}"
    rounded: "{rounded.button}"
    height: 48px
  tile-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.tile}"
    rounded: "{rounded.tile}"
  key:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    typography: "{typography.key}"
    rounded: "{rounded.key}"
    height: 54px
  key-fire:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.on-brass}"
    typography: "{typography.display}"
    rounded: "{rounded.key}"
    height: 54px
  felt-panel:
    backgroundColor: "{colors.felt}"
    textColor: "{colors.felt-ink}"
    rounded: "{rounded.panel}"
    padding: 16px
  paper-section:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 16px
---

# Design System: Wordoff

## Overview

**Creative North Star: "The Saloon Card Table"**

Wordoff is a word standoff, and every duel is dealt across a saloon table. The
board is the felt between two seats; each guess is a row of cream cards that
turn face up. The rival sits across the table on the walnut rail; you sit at
the near edge, with your brass scout chips in front of you. Paper screens
(home, levels, stats, settings) are the cream card stock the cards are cut
from, and a piece of felt appears there wherever a table is in play (today's
Daily on the home screen).

The world contributes type, palette, density and one signature move. It never
replaces native navigation, back gestures, switches, alerts or the share sheet.

**Key Characteristics:**
- Brown baize felt is the duel ground in light and dark mode; only the paper screens flip.
- Two seats, hard halves: ink navy for you, oxblood for the rival, never mixed and never used for anything else.
- Cards, not tiles: cream card stock with an edge and a soft offset shadow; a face-down card shows an oxblood back with a brass diamond.
- Brass is the only action colour: the primary button, the FIRE key, scout chips, stars.
- Hierarchy by scale: DRAW!, the wordmark and the cards are large; everything else is small.

## Colors

### Primary
- **Brass** (`brass` #b8862b): primary buttons, the FIRE key, scout chips, level stars. Text on brass is `on-brass` (#24170e).

### Seats
- **Ink navy** (`you` #24344f): your seat chip, your status dot, wins in history.
- **Oxblood** (`rival` #9e2b25): the rival's avatar, seat chip, AIMING/LOCKED badges, taunt slip border, losses.

### Tile results
- **Cactus** (`correct` #4f6b2e), **brass-yellow** (`present` #c8962e), **dusty taupe** (`absent` #8a7562). Colorblind mode swaps correct/present to orange `#d4721f` and blue `#5d8fc9`.

### Neutral
- **Felt** (`felt` #5a3a24), **walnut** (`walnut` #2e1d13), **card stock** (`card` #f6ead2), **paper** (`canvas` #efe3cb, `surface` #f8efdd), walnut ink (`ink` #2e1d13).
- Dark mode: paper becomes walnut (#1f150e / #2a1d14) with cream ink; felt deepens to #3f2818; the navy lifts to #4f6fa6 and oxblood to #d9645a for contrast.

### Named Rules
**The Two Seats Rule.** Navy and oxblood belong to the two players only. Neutral UI uses ink, felt ink and hairline.

**The One Brass Rule.** Brass means "act here". It is never decoration.

## Typography

**Display:** Ultra (wood-type slab), for the WORDOFF wordmark, DRAW!, result headlines and the FIRE key.
**Slab:** Zilla Slab 600/700, for card letters, keys, headings, names and buttons.
**Body:** the platform face (SF Pro / Roboto), for running text and controls.

### Hierarchy
- **Display** (Ultra 40, DRAW! at 58): one per screen at most.
- **Headline** (Zilla Slab 700, 28): screen and panel titles.
- **Title** (Zilla Slab 700, 21): section titles, rival names, buttons (17).
- **Tile** (Zilla Slab 700, 54% of the card): card letters.
- **Body** (system 16/23): explanations and status lines.
- **Label** (Zilla Slab 700, 11, tracked 1px): badges only (AIMING, LOCKED, SUDDEN DEATH).

## Layout

The duel screen stacks three bands: the walnut rail (navigation and the rival's seat), the felt table (the board centred with seat chips on the left of each row, then your seat strip), and the walnut keyboard rail. Paper screens are a single scroll column with 16px gutters and 12–16px gaps.

## Elevation & Depth

Depth comes from material and a single soft shadow: cards and keys sit on the felt with a short offset shadow (0 2px, 3px blur). The DRAW! stamp casts the only large shadow. Paper sections are flat with a hairline border.

## Shapes

6px on cards and keys, 12px on paper sections, 14px on buttons, 18px on the felt table and felt panels, full round on chips and avatars. Seat chips use a dashed rim like a poker chip; scout chips use a solid cream rim.

## Components

### Buttons
Primary is brass with walnut-dark text in Zilla Slab. Secondary is an outline in ink (or felt ink on felt). Rival is oxblood with cream text, used only for calling out a rival in Quick Duel.

### Cards (tiles)
Empty: a dashed outline in the felt. Typed: cream card. Face down: oxblood back with a brass diamond. Scored: turns over around its vertical axis to cactus, brass-yellow or taupe.

### Keyboard
Cream keys on the walnut rail, scored like the cards; FIRE is the one brass key, set in Ultra; delete is a darker card-edge key with an icon.

### Seat chips and scout chips
Each row on the shared board opens with the seat chip of whoever fires it (YOU in navy, the rival's initial in oxblood). Scouts are a stack of brass chips in your seat strip.

### Navigation
The platform's own tab bar (NativeTabs: Liquid Glass on iOS 26, Material on Android) with five rooms: Saloon, Levels, Stats, Awards, Settings, tinted brass. Tab switches never animate. The duel, History and How to duel are pushed or presented on the native stack with the platform back gesture.

### Art
All illustration is authored vector (react-native-svg, `src/art`): a single-action revolver, muzzle flash, cartridges, a lawman's star, saguaro, tumbleweed, the main-street standoff scene, and portraits of the cast (Rookie Rae, Dusty Vance, The Sheriff, and you as the Stranger). Portraits sit in a brass ring; the scene uses the seat colours for its two duelists.

### Motion
- Shot: the shooter's revolver kicks 14° and flashes, finished inside 150ms.
- Ammo: one cartridge per row a player still gets to fire; a fired round lifts out and fades (150ms).
- DRAW!: a 200ms cream flash over the table and a short horizontal shake.
- Sudden death: a tumbleweed rolls across the felt once.
- Result: the wanted poster eases in (250ms), then the verdict stamp lands from 1.6x at -12° (220ms), in the winner's seat colour.
- Reduced motion keeps the flashes and fades and drops every kick, shake, roll and scale.

## Do's and Don'ts

### Do:
- Keep the felt brown in both appearances.
- Use cards for every letter on the table, including the result boards.
- Use real icons (MaterialCommunityIcons) in one weight.

### Don't:
- Don't use emoji or Unicode symbols as icons.
- Don't put a small label or eyebrow above a heading; the heading carries its own weight.
- Don't add a third side colour, or use navy/oxblood for neutral UI.
- Don't fake felt or wood with gradients or noise; the material is carried by flat colour and the cards.
