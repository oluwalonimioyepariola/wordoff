import type { BrainTuning } from './ai/brain';
import { getOpponent } from './ai/opponents';
import { createRng } from './rng';
import type { BoardStyle } from './duel';
import { OpponentId, PlayerId } from './types';
import { answersFor, WordLength } from './words';

/**
 * Level mode: a 30-level trail across three chapters, all on the shared board
 * (take turns, see every guess). Chapter 1 uses short, easy 4-letter words with
 * scouts and a rival who warms up with wild shots; later chapters move to
 * 5-letter words and take the help away, adding the shot clock and hard mode.
 */

export type WordTier = 'easy' | 'medium' | 'hard';

export interface LevelDef {
  id: number;
  chapter: number;
  chapterName: string;
  title: string;
  opponent: OpponentId;
  tier: WordTier;
  wordLength: WordLength;
  board: BoardStyle;
  /** Shared rows before sudden death. */
  maxRows: number;
  tuning: BrainTuning;
  scouts: number;
  /** Shots you fire before the rival's first turn. */
  headStart: number;
  /** Who takes the first shot. */
  firstShooter: PlayerId;
  shotClockMs: number | null;
  hardMode: boolean;
  boss: boolean;
  /** Land it on or before your shot stars[0] for ★★★, stars[1] for ★★. Any win is ★. */
  stars: [number, number];
}

const RARE = new Set('jqxzvkwyfb');

const tierCache: Partial<Record<WordLength, Record<WordTier, string[]>>> = {};

/**
 * Ranks answers by how findable they are: common letters, no repeats, no rare
 * letters rank easiest. Split into thirds.
 */
export function wordTiers(length: WordLength = 5): Record<WordTier, string[]> {
  const cached = tierCache[length];
  if (cached) return cached;
  const ANSWERS = answersFor(length);
  const freq: Record<string, number> = {};
  for (const w of ANSWERS) for (const c of new Set(w)) freq[c] = (freq[c] ?? 0) + 1;
  const score = (w: string) => {
    const unique = new Set(w);
    let s = 0;
    for (const c of unique) s += freq[c];
    s -= (w.length - unique.size) * 250; // repeated letters are hard to spot
    for (const c of w) if (RARE.has(c)) s -= 120;
    return s;
  };
  const ranked = [...ANSWERS].sort((a, b) => score(b) - score(a) || a.localeCompare(b));
  const third = Math.ceil(ranked.length / 3);
  const tiers = { easy: ranked.slice(0, third), medium: ranked.slice(third, third * 2), hard: ranked.slice(third * 2) };
  tierCache[length] = tiers;
  return tiers;
}

export function tierOf(word: string): WordTier {
  const t = wordTiers(word.length as WordLength);
  return t.easy.includes(word) ? 'easy' : t.medium.includes(word) ? 'medium' : 'hard';
}

const CHAPTERS: { name: string; opponent: OpponentId; tier: WordTier; wordLength: WordLength }[] = [
  { name: 'Dusty Trail', opponent: 'rookie', tier: 'easy', wordLength: 4 },
  { name: 'Gunsmoke Gulch', opponent: 'gunslinger', tier: 'medium', wordLength: 5 },
  { name: 'High Noon', opponent: 'sheriff', tier: 'hard', wordLength: 5 },
];

const TITLES = [
  ['First Steps', 'Fresh Tracks', 'Tumbleweed', 'Saloon Doors', 'Horseshoe', 'Campfire', 'Canteen', 'Prairie Wind', 'Sundown', 'Rae’s Last Stand'],
  ['Dust Devil', 'Rattlesnake', 'Stagecoach', 'Canyon Echo', 'Gold Rush', 'Deadwood', 'Bounty', 'Quick Hands', 'Smoke Signal', 'Dusty’s Duel'],
  ['Long Shadow', 'Wanted', 'Iron Horse', 'Vulture Ridge', 'Ghost Town', 'Steel Nerves', 'Last Chance', 'Showdown Street', 'Clock Tower', 'High Noon'],
];

/** Interpolates a value from the first level of a chapter (0) to the last (9). */
const ramp = (step: number, from: number, to: number) => from + ((to - from) * step) / 9;

function buildLevels(): LevelDef[] {
  const levels: LevelDef[] = [];
  CHAPTERS.forEach((ch, c) => {
    for (let step = 0; step < 10; step++) {
      const id = c * 10 + step + 1;
      const boss = step === 9;
      let tuning: BrainTuning;
      let scouts: number;
      let headStart = 0;
      let firstShooter: PlayerId = 'you';
      let shotClockMs: number | null = null;
      let hardMode = false;
      if (c === 0) {
        tuning = { warmupRows: Math.round(ramp(step, 3, 1)), clueDiscipline: ramp(step, 0, 0.2) };
        scouts = Math.round(ramp(step, 3, 1));
        headStart = step < 4 ? 2 : step < 8 ? 1 : 0;
      } else if (c === 1) {
        tuning = { warmupRows: Math.round(ramp(step, 2, 0)), clueDiscipline: ramp(step, 0.25, 0.6) };
        scouts = step < 5 ? 1 : 0;
        headStart = step < 3 ? 1 : 0;
        if (step >= 7) shotClockMs = 60_000;
      } else {
        tuning = {};
        scouts = 0;
        if (step >= 5) firstShooter = 'ai';
        if (step >= 6) shotClockMs = step >= 8 ? 30_000 : 60_000;
        hardMode = step >= 7;
      }
      levels.push({
        id,
        chapter: c + 1,
        chapterName: ch.name,
        title: TITLES[c][step],
        opponent: ch.opponent,
        tier: ch.tier,
        wordLength: ch.wordLength,
        board: 'shared',
        maxRows: 6,
        tuning,
        scouts,
        headStart,
        firstShooter,
        shotClockMs,
        hardMode,
        boss,
        stars: [2, 3],
      });
    }
  });
  return levels;
}

export const LEVELS: LevelDef[] = buildLevels();
export const LEVEL_COUNT = LEVELS.length;

export function getLevel(id: number): LevelDef {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`No level ${id}`);
  return level;
}

/** A fresh word for each attempt, so retrying a level isn't a memory test. */
export function levelAnswer(id: number, attempt: number): string {
  const level = getLevel(id);
  return createRng(`level-${id}-attempt-${attempt}`).pick(wordTiers(level.wordLength)[level.tier]);
}

export function levelSeed(id: number, attempt: number): string {
  return `level-${id}-${attempt}`;
}

/** Stars for a level result: 0 for anything but a win. */
export function starsFor(level: LevelDef, won: boolean, solvedRow: number | null): number {
  if (!won || solvedRow === null) return 0;
  if (solvedRow <= level.stars[0]) return 3;
  if (solvedRow <= level.stars[1]) return 2;
  return 1;
}

export function levelBlurb(level: LevelDef): string {
  const rival = getOpponent(level.opponent).name;
  const extras = [
    level.headStart > 0 && `${level.headStart}-shot head start`,
    level.firstShooter === 'ai' && `${rival.replace('The ', '')} shoots first`,
    level.scouts > 0 && `${level.scouts} scout${level.scouts > 1 ? 's' : ''}`,
    level.shotClockMs && `${level.shotClockMs / 1000}s shot clock`,
    level.hardMode && 'hard mode',
  ].filter(Boolean);
  return `${level.wordLength}-letter ${level.tier} words vs ${rival}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}
