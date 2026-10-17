import { DuelOutcome } from './duel';
import { createRng } from './rng';
import { OpponentId, PlayerId } from './types';
import { answersFor, WordLength } from './words';

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

export function winsNeeded(bestOf: BestOf): number {
  return Math.ceil(bestOf / 2);
}

/** Hard cap so a run of draws can't go on forever. */
export function maxDuels(bestOf: BestOf): number {
  return bestOf * 2;
}

export function recordMatchDuel(match: MatchState, outcome: DuelOutcome): MatchState {
  if (match.winner !== undefined) return match;
  const scores = { ...match.scores };
  let draws = match.draws;
  if (outcome.winner) scores[outcome.winner]++;
  else draws++;

  const results = [...match.results, outcome];
  const need = winsNeeded(match.bestOf);
  let winner: MatchState['winner'];
  if (scores.you >= need) winner = 'you';
  else if (scores.ai >= need) winner = 'ai';
  else if (results.length >= maxDuels(match.bestOf)) {
    winner = scores.you === scores.ai ? null : scores.you > scores.ai ? 'you' : 'ai';
  }
  return { ...match, scores, draws, results, winner };
}

export function isMatchOver(match: MatchState): boolean {
  return match.winner !== undefined;
}

/** A clean sweep: won every duel without dropping one (e.g. 3–0 in a best of 5). */
export function isSweep(match: MatchState): boolean {
  return match.winner === 'you' && match.bestOf > 1 && match.scores.ai === 0 && match.draws === 0;
}

/** Random answer for a Quick Duel, avoiding words played recently. */
export function pickQuickAnswer(seed: string, recent: readonly string[], length: WordLength = 5): string {
  const rng = createRng(seed);
  const avoid = new Set(recent);
  const pool = answersFor(length);
  const fresh = pool.filter((w) => !avoid.has(w));
  return rng.pick(fresh.length ? fresh : pool);
}
