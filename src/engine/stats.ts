import { evaluateAchievements } from './achievements';
import { Board, DuelConfig, DuelOutcome } from './duel';
import { OpponentId } from './types';

export interface WLD {
  wins: number;
  losses: number;
  draws: number;
}

export type ResultKind = 'win' | 'loss' | 'draw';

export interface DailyRecord {
  day: number;
  answer: string;
  opponent: OpponentId;
  result: ResultKind;
  reason: DuelOutcome['reason'];
  yourSolvedRow: number | null;
  aiSolvedRow: number | null;
  yourMs: number;
  playedAt: number;
}

export interface Stats {
  version: 1;
  daily: WLD & {
    played: number;
    /** Consecutive days with a finished Daily Standoff (protected by freezes). */
    playStreak: number;
    bestPlayStreak: number;
    /** Consecutive Daily Standoff wins. */
    winStreak: number;
    bestWinStreak: number;
    lastDay: number | null;
    freezes: number;
    freezesUsed: number;
    history: Record<number, DailyRecord>;
  };
  duels: WLD & { played: number; winStreak: number; bestWinStreak: number };
  matches: WLD & { played: number; sweeps: number };
  vs: Record<OpponentId, WLD & { streak: number; bestStreak: number }>;
  /** Index 0–5: solved on row 1–6. Index 6: solved in sudden death. */
  distribution: number[];
  fastestSolveMs: number | null;
  suddenDeathWins: number;
  photoFinishWins: number;
  hardModeWins: number;
  shotClockWins: number;
  achievements: Record<string, number>;
  recentAnswers: string[];
}

export const MAX_FREEZES = 2;
/** A freeze is earned every time the play streak reaches a multiple of this. */
export const FREEZE_EVERY = 7;
const RECENT_LIMIT = 150;

const wld = (): WLD => ({ wins: 0, losses: 0, draws: 0 });
const vsRecord = () => ({ ...wld(), streak: 0, bestStreak: 0 });

export function createStats(): Stats {
  return {
    version: 1,
    daily: {
      ...wld(),
      played: 0,
      playStreak: 0,
      bestPlayStreak: 0,
      winStreak: 0,
      bestWinStreak: 0,
      lastDay: null,
      freezes: 0,
      freezesUsed: 0,
      history: {},
    },
    duels: { ...wld(), played: 0, winStreak: 0, bestWinStreak: 0 },
    matches: { ...wld(), played: 0, sweeps: 0 },
    vs: { rookie: vsRecord(), gunslinger: vsRecord(), sheriff: vsRecord() },
    distribution: [0, 0, 0, 0, 0, 0, 0],
    fastestSolveMs: null,
    suddenDeathWins: 0,
    photoFinishWins: 0,
    hardModeWins: 0,
    shotClockWins: 0,
    achievements: {},
    recentAnswers: [],
  };
}

/** Stats are plain JSON, so a JSON round-trip is a safe deep copy on every JS engine. */
function cloneStats(stats: Stats): Stats {
  return JSON.parse(JSON.stringify(stats));
}
