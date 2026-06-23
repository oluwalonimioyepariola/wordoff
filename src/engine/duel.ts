import { isSolved, scoreGuess } from './evaluate';
import { hardModeViolation } from './hardMode';
import { createRng } from './rng';
import {
  DuelMode,
  Mark,
  MAX_ROWS,
  OpponentId,
  PlayerId,
  ScoredGuess,
  SuddenDeathHint,
  WORD_LENGTH,
} from './types';
import { isAcceptedWord, normalizeWord } from './words';

/**
 * The standoff.
 *
 * Both players chase the same secret word on their own boards. Each round,
 * both lock in a guess without seeing the other's; then both rows are revealed
 * at once ("DRAW!"). Each player sees the other's colors, never their letters.
 *
 * - First to solve wins.
 * - Both solve on the same row: lower total aiming time wins (photo finish).
 * - Nobody solves in six rows: sudden death. One letter is revealed to both
 *   and each gets one final shot.
 * - An empty shot clock fires a blank: the row is spent with no guess.
 */

export interface DuelConfig {
  answer: string;
  opponent: OpponentId;
  mode: DuelMode;
  hardMode: boolean;
  /** Per-guess time limit, or null for no shot clock. */
  shotClockMs: number | null;
  /** Seeds the AI and the sudden-death hint. */
  seed: string;
  dayNumber?: number;
}

export interface DuelRow {
  /** null when the shot clock ran out (a blank). */
  guess: string | null;
  marks: Mark[] | null;
  timeMs: number;
}

export interface Board {
  rows: DuelRow[];
  totalMs: number;
  /** 1-based row the player solved on, or null. */
  solvedRow: number | null;
}

export type OutcomeReason =
  | 'solved' // only one player solved
  | 'photo-finish' // both solved on the same row; decided on time
  | 'dead-heat' // both solved on the same row with identical time
  | 'exhausted' // nobody solved, even in sudden death
  | 'forfeit';
