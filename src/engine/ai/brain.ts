import { createRng, Rng, shuffled } from '../rng';
import { OpponentId, ScoredGuess, SuddenDeathHint } from '../types';
import { ANSWERS } from '../words';
import { getOpponent, OpponentProfile } from './opponents';
import { bestInformationGuess, filterCandidates, filterGreensOnly } from './solver';

/** Strong openers that are also answers, so an opener can win on row one. */
const OPENERS = ['slate', 'crane', 'trace', 'stare', 'arise', 'raise', 'least', 'crate'];

/** Extra non-candidate words the Sheriff considers for splitting the field. */
const PROBE_SAMPLE = 250;

/** How much more likely a loose AI is to use its clues with each row played. */
const PRESSURE_PER_ROW = 0.08;

export interface AiBrain {
  profile: OpponentProfile;
  /**
   * The AI's next guess. It only ever sees its own board (plus the shared
   * sudden-death hint), never the answer or the player's letters.
   */
  nextGuess(history: readonly ScoredGuess[], hint: SuddenDeathHint | null): string;
  /** Simulated aiming time for the guess on this (0-based) round, in ms. */
  thinkTimeMs(round: number): number;
}
