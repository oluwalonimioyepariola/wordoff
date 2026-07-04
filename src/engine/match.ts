import { DuelOutcome } from './duel';
import { createRng } from './rng';
import { OpponentId, PlayerId } from './types';
import { ANSWERS } from './words';

/** A best-of-N series of Quick Duels. Draws are replayed, up to a cap. */

export type BestOf = 1 | 3 | 5;

export interface MatchState {
  opponent: OpponentId;
  bestOf: BestOf;
  scores: Record<PlayerId, number>;
  draws: number;
  results: DuelOutcome[];
  /** undefined while the match is running; null for a drawn match. */
  winner: PlayerId | null | undefined;
}

export function createMatch(opponent: OpponentId, bestOf: BestOf): MatchState {
  return { opponent, bestOf, scores: { you: 0, ai: 0 }, draws: 0, results: [], winner: undefined };
}
