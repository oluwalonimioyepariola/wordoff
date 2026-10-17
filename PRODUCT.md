# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

One custom game design shipped to both iPhone and Android with React Native
(Expo). Where platform conventions differ (back gestures, haptics, safe areas,
share sheet), follow each platform's native behavior; the game's look itself is
the same on both.

## Users

Casual daily players: people who already play Wordle-style games for a few
minutes a day, care about streaks, and share results with friends. They play
in short sessions (a commute, a break, before bed), one-handed on a phone.

## Product Purpose

Wordoff turns the daily word puzzle into a duel. You and an AI rival chase the
same secret word; whoever lands it first wins. Success is a player coming back
every day for the Daily Standoff, keeping their streak, and sharing their card.

## Positioning

A word standoff, not a solo puzzle: the rival is visibly playing against you on
the same word, in real time, with a personality. The name is word + standoff,
and the product should feel like a duel at high noon.

## Operating Context

- **Daily Standoff:** one word per day, same word and same rival game for
  everyone (split-board standoff rules), one attempt, streaks and freezes, a
  spoiler-free share card.
- **Level mode:** 30 levels in three chapters (Rookie Rae with 4-letter words,
  Dusty Vance, The Sheriff), stars, unlocks, scouts.
- **Quick Duel:** unlimited duels, 4 or 5 letters, single or best of 3/5.
- **Board styles:** shared board (take turns, see every guess; default for
  levels and Quick Duel) and split board (separate boards, both fire at once,
  3-2-1 DRAW; used for the Daily).
- Fully offline. No account, no server; everything is stored on the device.

## Capabilities and Constraints

- React Native via Expo SDK 58, Expo Router, Reanimated, expo-haptics.
- Game logic lives in a pure TypeScript engine (`src/engine`) with tests; UI
  work must not change game rules.
- Rival letters are hidden on the split board during play (colors only).
- Pass-and-play (two humans, one phone) is planned; online multiplayer is not.
- Undecided: sound effects, final character art, monetisation.

## Brand Commitments

- Name: **Wordoff**. Rivals: **Rookie Rae** (The Greenhorn), **Dusty Vance**
  (The Gunslinger), **The Sheriff** (Law of the Land), each with their own
  taunts.
- Western standoff vocabulary is part of the voice: FIRE, DRAW!, Walk away,
  sudden death, scouts, shots.
- The user has asked for a brown and cream look that feels like a classic
  standoff.
- Must not use another brand's mascots, fonts or illustrations (the old
  Headspace-derived system is reference only).

## Evidence on Hand

No real player data, testimonials or press exist yet. Rival difficulty is
backed by simulations in the test suite. Do not invent player counts, reviews
or rankings.

## Product Principles

1. The rival must always feel present and fair: visibly playing, never
   cheating, never standing around.
2. Short sessions win: a duel should take two to four minutes.
3. The daily is a shared ritual: same game for everyone, worth comparing.
4. Help is earned, not handed out: scouts and easy words over handicapping the
   rival.

## Accessibility & Inclusion

Colorblind tile mode, reduced motion, dark mode, labelled tiles for screen
readers, tap targets of at least 44pt.
