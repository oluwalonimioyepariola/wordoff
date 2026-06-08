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
