import type { BrainTuning } from './ai/brain';
import { getOpponent } from './ai/opponents';
import { createRng } from './rng';
import { OpponentId } from './types';
import { ANSWERS } from './words';

/**
 * Level mode: a 30-level trail across three chapters. Early levels use easy
 * words, give you scouts, and handicap the rival with wild warm-up shots.
 * Later levels take those away, and the last ones add the shot clock and hard mode.
 */

export type WordTier = 'easy' | 'medium' | 'hard';

export interface LevelDef {
  id: number;
  chapter: number;
  chapterName: string;
  title: string;
  opponent: OpponentId;
  tier: WordTier;
  tuning: BrainTuning;
  scouts: number;
  shotClockMs: number | null;
  hardMode: boolean;
  boss: boolean;
  /** Solve on or before row stars[0] for ★★★, stars[1] for ★★. Any win is ★. */
  stars: [number, number];
}

const RARE = new Set('jqxzvkwyfb');

let tiers: Record<WordTier, string[]> | null = null;

/**
 * Ranks answers by how findable they are: common letters, no repeats, no rare
 * letters rank easiest. Split into thirds.
 */
export function wordTiers(): Record<WordTier, string[]> {
  if (tiers) return tiers;
  const freq: Record<string, number> = {};
  for (const w of ANSWERS) for (const c of new Set(w)) freq[c] = (freq[c] ?? 0) + 1;
  const score = (w: string) => {
    const unique = new Set(w);
    let s = 0;
    for (const c of unique) s += freq[c];
    s -= (5 - unique.size) * 250; // repeated letters are hard to spot
    for (const c of w) if (RARE.has(c)) s -= 120;
    return s;
  };
  const ranked = [...ANSWERS].sort((a, b) => score(b) - score(a) || a.localeCompare(b));
  const third = Math.ceil(ranked.length / 3);
  tiers = { easy: ranked.slice(0, third), medium: ranked.slice(third, third * 2), hard: ranked.slice(third * 2) };
  return tiers;
}

export function tierOf(word: string): WordTier {
  const t = wordTiers();
  return t.easy.includes(word) ? 'easy' : t.medium.includes(word) ? 'medium' : 'hard';
}

const CHAPTERS: { name: string; opponent: OpponentId; tier: WordTier }[] = [
  { name: 'Dusty Trail', opponent: 'rookie', tier: 'easy' },
  { name: 'Gunsmoke Gulch', opponent: 'gunslinger', tier: 'medium' },
  { name: 'High Noon', opponent: 'sheriff', tier: 'hard' },
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
      let shotClockMs: number | null = null;
      let hardMode = false;
      if (c === 0) {
        tuning = { warmupRows: Math.round(ramp(step, 4, 1)), clueDiscipline: ramp(step, 0, 0.15) };
        scouts = Math.round(ramp(step, 3, 1));
      } else if (c === 1) {
        tuning = { warmupRows: Math.round(ramp(step, 2, 0)), clueDiscipline: ramp(step, 0.25, 0.5) };
        scouts = Math.round(ramp(step, 2, 1));
        if (step >= 7) shotClockMs = 60_000;
      } else {
        tuning = { warmupRows: Math.round(ramp(step, 2, 0)) };
        scouts = step < 5 ? 1 : 0;
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
        tuning,
        scouts,
        shotClockMs,
        hardMode,
        boss,
        stars: c === 0 ? [4, 5] : c === 1 ? [3, 5] : [3, 4],
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
  return createRng(`level-${id}-attempt-${attempt}`).pick(wordTiers()[level.tier]);
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
    level.scouts > 0 && `${level.scouts} scout${level.scouts > 1 ? 's' : ''}`,
    level.shotClockMs && `${level.shotClockMs / 1000}s shot clock`,
    level.hardMode && 'hard mode',
    (level.tuning.warmupRows ?? 0) > 0 && `${rival.split(' ')[0]} warms up for ${level.tuning.warmupRows} row${level.tuning.warmupRows! > 1 ? 's' : ''}`,
  ].filter(Boolean);
  return `${level.tier} words vs ${rival}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}
