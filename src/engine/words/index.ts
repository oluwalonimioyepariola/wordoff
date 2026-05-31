import { WORD_LENGTH } from '../types';
import { ANSWERS } from './answers';
import { GUESSES_PACKED } from './guesses';

export { ANSWERS };

let accepted: Set<string> | null = null;

/** Every word the game accepts as a guess: answers plus the extra list. */
export function acceptedWords(): Set<string> {
  if (!accepted) {
    accepted = new Set(ANSWERS);
    for (let i = 0; i < GUESSES_PACKED.length; i += WORD_LENGTH) {
      accepted.add(GUESSES_PACKED.slice(i, i + WORD_LENGTH));
    }
  }
  return accepted;
}

export function normalizeWord(input: string): string {
  return input.trim().toLowerCase();
}

export function isAcceptedWord(word: string): boolean {
  return acceptedWords().has(normalizeWord(word));
}

export function isAnswerWord(word: string): boolean {
  return ANSWERS.includes(normalizeWord(word));
}
