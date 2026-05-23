import { ScoredGuess } from './types';

const ordinal = (n: number) => ['1st', '2nd', '3rd', '4th', '5th'][n] ?? `${n + 1}th`;

/**
 * Hard mode: every revealed hint must be used in later guesses.
 * Greens must stay put; yellows (and extra greens of the same letter) must
 * appear at least as many times as they were revealed in any single row.
 * Returns an error message, or null when the guess is allowed.
 */
export function hardModeViolation(guess: string, history: readonly ScoredGuess[]): string | null {
  for (const { guess: prev, marks } of history) {
    for (let i = 0; i < prev.length; i++) {
      if (marks[i] === 'correct' && guess[i] !== prev[i]) {
        return `${ordinal(i)} letter must be ${prev[i].toUpperCase()}`;
      }
    }
    const required: Record<string, number> = {};
    for (let i = 0; i < prev.length; i++) {
      if (marks[i] !== 'absent') required[prev[i]] = (required[prev[i]] ?? 0) + 1;
    }
    for (const [letter, count] of Object.entries(required)) {
      const have = guess.split('').filter((c) => c === letter).length;
      if (have < count) return `Guess must contain ${letter.toUpperCase()}`;
    }
  }
  return null;
}
