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
