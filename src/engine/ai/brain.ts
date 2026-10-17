import { createRng, Rng, shuffled } from '../rng';
import { OpponentId, ScoredGuess, SuddenDeathHint } from '../types';
import { answersFor, WordLength } from '../words';
import { getOpponent, OpponentProfile } from './opponents';
import { bestInformationGuess, filterCandidates, filterSensible } from './solver';

/** Strong openers that are also answers, so an opener can win on row one. */
const OPENERS: Record<WordLength, string[]> = {
  4: ['rate', 'late', 'care', 'lane', 'tone', 'rise', 'tale', 'tear'],
  5: ['slate', 'crane', 'trace', 'stare', 'arise', 'raise', 'least', 'crate'],
};

/** Extra non-candidate words the Sheriff considers for splitting the field. */
const PROBE_SAMPLE = 250;

/** How much more likely a loose AI is to use its clues with each row played. */
const PRESSURE_PER_ROW = 0.08;

/**
 * Per-game adjustments on top of an opponent's profile. Level mode uses these
 * to start rivals off weak and sharpen them as the levels climb.
 */
export interface BrainTuning {
  /** Overrides the profile's chance of using every clue (loose/consistent strategies). */
  clueDiscipline?: number;
  /** The first N of its own shots are loose: greens kept, grays avoided, yellows ignored. */
  warmupRows?: number;
  /** Overrides the simulated aiming time. */
  thinkMs?: { min: number; max: number };
  /**
   * Only fire words that could be the answer. On a shared board, probe words
   * would hand the opponent free information, so the duel engine turns this on.
   */
  candidatesOnly?: boolean;
}

export interface AiBrain {
  profile: OpponentProfile;
  /**
   * The AI's next guess. It only ever sees its own board (plus the shared
   * sudden-death hint), never the answer or the player's letters.
   */
  nextGuess(history: readonly ScoredGuess[], hint: SuddenDeathHint | null, ownShots?: number): string;
  /** Simulated aiming time for the guess on this (0-based) round, in ms. */
  thinkTimeMs(round: number): number;
}

export function createBrain(
  opponent: OpponentId,
  seed: string,
  tuning: BrainTuning = {},
  length: WordLength = 5,
): AiBrain {
  const ANSWERS = answersFor(length);
  const base = getOpponent(opponent);
  const profile: OpponentProfile = {
    ...base,
    clueDiscipline: tuning.clueDiscipline ?? base.clueDiscipline,
    thinkMs: tuning.thinkMs ?? base.thinkMs,
  };
  const warmupRows = tuning.warmupRows ?? 0;
  // Randomness is derived per round rather than from one running sequence, so
  // a duel resumed after the app was closed plays out exactly the same.
  const roundRng = (round: number, purpose: string) => createRng(`${seed}:${opponent}:${round}:${purpose}`);

  // `history` is everything the AI can see (on a shared board that includes your
  // rows); `ownShots` counts only its own, which is what warm-up and pressure use.
  const nextGuess: AiBrain['nextGuess'] = (history, hint, ownShots = history.length) => {
    const rng = roundRng(history.length, hint ? 'guess-sd' : 'guess');
    const tried = new Set(history.map((h) => h.guess));
    const fresh = (words: string[]) => words.filter((w) => !tried.has(w));

    if (history.length === 0 && !hint) {
      return profile.strategy === 'loose' || warmupRows > 0 ? rng.pick(ANSWERS) : rng.pick(OPENERS[length]);
    }

    const candidates = fresh(filterCandidates(ANSWERS, history, hint));
    // A loose shot never ignores greens or reuses grays; it only skips the yellow logic.
    const loose = () => {
      const sensible = fresh(filterSensible(ANSWERS, history));
      return sensible.length ? rng.pick(sensible) : rng.pick(candidates.length ? candidates : fresh(ANSWERS.slice()));
    };
    if (ownShots < warmupRows && !hint) return loose();
    // The answer pool is closed, so this only happens if the answer came from
    // outside it (never in normal play). Fall back to anything unguessed.
    if (candidates.length === 0) return rng.pick(fresh(ANSWERS.slice()));

    switch (profile.strategy) {
      case 'information':
        return tuning.candidatesOnly
          ? bestInformationGuess(candidates, candidates)
          : informationGuess(candidates, ANSWERS, rng);
      case 'consistent':
      case 'loose': {
        // Pressure sharpens everyone: discipline rises each row, and sudden
        // death (one shot left) leaves no room for sloppiness.
        const discipline = profile.clueDiscipline + PRESSURE_PER_ROW * ownShots;
        if (hint || rng.chance(discipline)) return rng.pick(candidates);
        return loose();
      }
    }
  };

  return {
    profile,
    nextGuess,
    thinkTimeMs: (round) => roundRng(round, 'think').int(profile.thinkMs.min, profile.thinkMs.max),
  };
}

function informationGuess(candidates: string[], ANSWERS: readonly string[], rng: Rng): string {
  if (candidates.length <= 2) return candidates[0];
  const probes = shuffled(ANSWERS, rng).slice(0, PROBE_SAMPLE);
  const pool = Array.from(new Set([...candidates, ...probes]));
  return bestInformationGuess(candidates, pool);
}
