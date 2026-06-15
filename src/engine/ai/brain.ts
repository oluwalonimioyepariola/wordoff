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

export function createBrain(opponent: OpponentId, seed: string): AiBrain {
  const profile = getOpponent(opponent);
  // Randomness is derived per round rather than from one running sequence, so
  // a duel resumed after the app was closed plays out exactly the same.
  const roundRng = (round: number, purpose: string) => createRng(`${seed}:${opponent}:${round}:${purpose}`);

  const nextGuess: AiBrain['nextGuess'] = (history, hint) => {
    const rng = roundRng(history.length, hint ? 'guess-sd' : 'guess');
    const tried = new Set(history.map((h) => h.guess));
    const fresh = (words: string[]) => words.filter((w) => !tried.has(w));

    if (history.length === 0 && !hint) {
      return profile.strategy === 'loose' ? rng.pick(ANSWERS) : rng.pick(OPENERS);
    }

    const candidates = fresh(filterCandidates(ANSWERS, history, hint));
    // The answer pool is closed, so this only happens if the answer came from
    // outside it (never in normal play). Fall back to anything unguessed.
    if (candidates.length === 0) return rng.pick(fresh(ANSWERS.slice()));

    switch (profile.strategy) {
      case 'information':
        return informationGuess(candidates, rng);
      case 'consistent':
      case 'loose': {
        // Pressure sharpens everyone: discipline rises each row, and sudden
        // death (one shot left) leaves no room for sloppiness.
        const discipline = profile.clueDiscipline + PRESSURE_PER_ROW * history.length;
        if (hint || rng.chance(discipline)) return rng.pick(candidates);
        const sloppy = fresh(filterGreensOnly(ANSWERS, history));
        return sloppy.length ? rng.pick(sloppy) : rng.pick(candidates);
      }
    }
  };

  return {
    profile,
    nextGuess,
    thinkTimeMs: (round) => roundRng(round, 'think').int(profile.thinkMs.min, profile.thinkMs.max),
  };
}
