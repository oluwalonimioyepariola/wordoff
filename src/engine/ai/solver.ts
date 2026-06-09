import { marksToCode, patternCode } from '../evaluate';
import { ScoredGuess, SuddenDeathHint, WORD_LENGTH } from '../types';

/** True when `word` could still be the answer given everything this player has seen. */
export function isConsistent(
  word: string,
  history: readonly ScoredGuess[],
  hint: SuddenDeathHint | null = null,
): boolean {
  if (hint && word[hint.index] !== hint.letter) return false;
  for (const { guess, marks } of history) {
    if (patternCode(guess, word) !== marksToCode(marks)) return false;
  }
  return true;
}

export function filterCandidates(
  words: readonly string[],
  history: readonly ScoredGuess[],
  hint: SuddenDeathHint | null = null,
): string[] {
  return words.filter((w) => isConsistent(w, history, hint));
}

/** Words that keep every green in place but may ignore yellows and grays. */
export function filterGreensOnly(words: readonly string[], history: readonly ScoredGuess[]): string[] {
  const fixed: (string | null)[] = new Array(WORD_LENGTH).fill(null);
  for (const { guess, marks } of history) {
    marks.forEach((m, i) => {
      if (m === 'correct') fixed[i] = guess[i];
    });
  }
  return words.filter((w) => fixed.every((c, i) => c === null || w[i] === c));
}

const counts = new Int32Array(243);

/** Expected information (bits) a guess gives about the remaining candidates. */
export function expectedInformation(guess: string, candidates: readonly string[]): number {
  counts.fill(0);
  for (const answer of candidates) counts[patternCode(guess, answer)]++;
  const n = candidates.length;
  let bits = 0;
  for (let i = 0; i < 243; i++) {
    const c = counts[i];
    if (c) {
      const p = c / n;
      bits -= p * Math.log2(p);
    }
  }
  return bits;
}

/**
 * Picks the guess that best splits the remaining candidates. Words that could
 * themselves be the answer get a small bonus, since they might win outright.
 */
export function bestInformationGuess(candidates: readonly string[], pool: readonly string[]): string {
  if (candidates.length === 0) throw new Error('No candidates left');
  if (candidates.length <= 2) return candidates[0];
  const isCandidate = new Set(candidates);
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const guess of pool) {
    const score = expectedInformation(guess, candidates) + (isCandidate.has(guess) ? 1 / candidates.length : 0);
    if (score > bestScore) {
      bestScore = score;
      best = guess;
    }
  }
  return best;
}
