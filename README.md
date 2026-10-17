# Wordoff

A word standoff. You and an AI rival chase the **same secret word** on separate
boards. Each round you both lock in a guess, the screen counts **3 · 2 · 1 ·
DRAW!**, and both rows flip at once. You see the rival's colors, never their
letters. Fewest guesses wins; same row goes to the faster aim.

Runs fully offline with React Native (Expo). No server, no account.

## Features

- **Daily Standoff.** One word per day (based on the local date), with the same
  word and the same rival for everyone. One attempt; progress is saved after
  every round, so closing the app can't re-roll it.
- **Quick Duel.** Unlimited random words, played as a single duel or best of 3 or 5.
- **Three AI rivals.** Rookie Rae (loose, ~5.3 guesses), Dusty Vance (reads
  most clues, ~4.2), The Sheriff (maximises information, ~3.2). Each sees only
  its own feedback, gets sharper as rows run out, and talks trash.
- **Standoff rules.** Simultaneous lock-in, shared reveal, photo finish on
  total aim time, sudden death with a shared revealed letter, forfeits.
- **Shot clock (optional).** 20, 30 or 60 seconds per guess; at zero you fire a blank.
- **Hard mode.** Revealed hints must be reused.
- **Streaks.** Daily play streak and win streak. Every 7 days earns a streak
  freeze (max 2) that covers a missed day.
- **Stats.** Win rates, guess distribution, head-to-head records per rival,
  fastest solve, match record and sweeps.
- **Achievements.** 17 of them, including secret ones.
- **History.** A five-week results calendar plus a list of past dailies.
- **Share card.** Both boards as emoji, spoiler-free.
- **Feel.** Tile pop and flip, row shake, the DRAW! slam, win bounce,
  taunts, haptics.
- **Accessibility.** Dark mode, colorblind tiles, reduced motion, labelled tiles.

## Run it

```bash
npm install
npm run ios        # Expo Go in the iOS Simulator
npm test           # engine tests (node:test via tsx)
npm run typecheck
npm run build:words  # regenerate word lists from scripts/answers.txt
```

## Layout

- `src/engine/`: all game logic, pure TypeScript, no React. Covers scoring, daily
  word, duel rules, AI, stats and streaks, achievements, and the share card.
- `src/game/useStandoff.ts`: sequences a duel on screen (AI aiming, countdown,
  reveal, shot clock, taunts).
- `src/app/`: Expo Router screens. `src/components/`: board, tiles, keyboard,
  overlays.
- `src/store/`: persisted settings and profile (AsyncStorage).
- `DESIGN.md`: the Wordoff design system.
- `tests/`: engine tests.
