import { Mark, ScoredGuess, WORD_LENGTH } from './types';

/**
 * Scores a guess against the answer the way Wordle does, including repeated
 * letters: greens are claimed first, then yellows only while unclaimed copies
 * of that letter remain in the answer.
 */
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = new Array(WORD_LENGTH).fill('absent');
  const remaining: Record<string, number> = {};

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      marks[i] = 'correct';
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (marks[i] === 'correct') continue;
    const letter = guess[i];
    if (remaining[letter]) {
      marks[i] = 'present';
      remaining[letter]--;
    }
  }
  return marks;
}
