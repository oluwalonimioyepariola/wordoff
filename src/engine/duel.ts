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
