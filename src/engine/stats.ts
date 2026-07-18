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

export function resultFor(outcome: DuelOutcome): ResultKind {
  return outcome.winner === 'you' ? 'win' : outcome.winner === 'ai' ? 'loss' : 'draw';
}

function bump(record: WLD, result: ResultKind): WLD {
  return {
    wins: record.wins + (result === 'win' ? 1 : 0),
    losses: record.losses + (result === 'loss' ? 1 : 0),
    draws: record.draws + (result === 'draw' ? 1 : 0),
  };
}

export interface DuelRecordInput {
  config: DuelConfig;
  outcome: DuelOutcome;
  you: Board;
  ai: Board;
  now?: number;
}

export interface RecordResult {
  stats: Stats;
  unlocked: string[];
  freezeEarned: boolean;
  freezesSpent: number;
}

/** Folds a finished standoff into the player's stats. Pure: returns a new object. */
export function recordDuel(prev: Stats, input: DuelRecordInput): RecordResult {
  const { config, outcome, you, ai } = input;
  const now = input.now ?? Date.now();
  const result = resultFor(outcome);
  const won = result === 'win';
  const stats = cloneStats(prev);

  // Your solve, whether or not you won the standoff.
  if (you.solvedRow !== null) {
    const slot = you.solvedRow > 6 ? 6 : you.solvedRow - 1;
    stats.distribution[slot]++;
    if (stats.fastestSolveMs === null || you.totalMs < stats.fastestSolveMs) stats.fastestSolveMs = you.totalMs;
  }

  // Head-to-head record against this opponent.
  const vs = stats.vs[config.opponent];
  Object.assign(vs, bump(vs, result));
  vs.streak = won ? vs.streak + 1 : 0;
  vs.bestStreak = Math.max(vs.bestStreak, vs.streak);

  if (won) {
    if (outcome.suddenDeath) stats.suddenDeathWins++;
    if (outcome.reason === 'photo-finish') stats.photoFinishWins++;
    if (config.hardMode) stats.hardModeWins++;
    if (config.shotClockMs !== null) stats.shotClockWins++;
  }

  let freezeEarned = false;
  let freezesSpent = 0;

  if (config.mode === 'daily' && config.dayNumber !== undefined) {
    const day = config.dayNumber;
    const d = stats.daily;
    if (!d.history[day]) {
      const gap = d.lastDay === null ? 1 : day - d.lastDay;
      if (gap > 1) {
        const missed = gap - 1;
        if (missed <= d.freezes) {
          d.freezes -= missed;
          d.freezesUsed += missed;
          freezesSpent = missed;
        } else {
          d.playStreak = 0;
          d.winStreak = 0;
        }
      }
      // gap < 1 means a past day is being recorded late; keep streaks as they are.
      if (gap >= 1) {
        d.playStreak++;
        d.lastDay = day;
        if (d.playStreak % FREEZE_EVERY === 0 && d.freezes < MAX_FREEZES) {
          d.freezes++;
          freezeEarned = true;
        }
      }
      d.bestPlayStreak = Math.max(d.bestPlayStreak, d.playStreak);
      d.winStreak = won ? d.winStreak + 1 : 0;
      d.bestWinStreak = Math.max(d.bestWinStreak, d.winStreak);
      d.played++;
      Object.assign(d, bump(d, result));
      d.history[day] = {
        day,
        answer: config.answer,
        opponent: config.opponent,
        result,
        reason: outcome.reason,
        yourSolvedRow: you.solvedRow,
        aiSolvedRow: ai.solvedRow,
        yourMs: you.totalMs,
        playedAt: now,
      };
    }
  } else {
    const q = stats.duels;
    q.played++;
    Object.assign(q, bump(q, result));
    q.winStreak = won ? q.winStreak + 1 : 0;
    q.bestWinStreak = Math.max(q.bestWinStreak, q.winStreak);
    stats.recentAnswers = [config.answer, ...stats.recentAnswers].slice(0, RECENT_LIMIT);
  }

  const unlocked = evaluateAchievements(stats, { kind: 'duel', input, result });
  for (const id of unlocked) stats.achievements[id] = now;

  return { stats, unlocked, freezeEarned, freezesSpent };
}
