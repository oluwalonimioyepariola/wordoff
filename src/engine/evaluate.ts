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

/**
 * Same result as scoreGuess, packed into one base-3 number (0..242).
 * The solver calls this hundreds of thousands of times, so it avoids arrays.
 */
export function patternCode(guess: string, answer: string): number {
  let code = 0;
  let used = 0; // bitmask of answer positions already claimed
  let greens = 0;
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess.charCodeAt(i) === answer.charCodeAt(i)) {
      greens |= 1 << i;
      used |= 1 << i;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    let digit = 0;
    if (greens & (1 << i)) {
      digit = 2;
    } else {
      const c = guess.charCodeAt(i);
      for (let j = 0; j < WORD_LENGTH; j++) {
        if (!(used & (1 << j)) && answer.charCodeAt(j) === c) {
          used |= 1 << j;
          digit = 1;
          break;
        }
      }
    }
    code = code * 3 + digit;
  }
  return code;
}

export function marksToCode(marks: readonly Mark[]): number {
  return marks.reduce((code, m) => code * 3 + (m === 'correct' ? 2 : m === 'present' ? 1 : 0), 0);
}

export function isSolved(marks: readonly Mark[] | null | undefined): boolean {
  return !!marks && marks.length === WORD_LENGTH && marks.every((m) => m === 'correct');
}
