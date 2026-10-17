import { ANSWERS } from './answers';
import { ANSWERS_4 } from './answers4';
import { GUESSES_PACKED } from './guesses';
import { GUESSES4_PACKED } from './guesses4';

export { ANSWERS, ANSWERS_4 };

/** Word lengths the game supports. */
export type WordLength = 4 | 5;
export const WORD_LENGTHS: WordLength[] = [4, 5];

const SOURCES: Record<WordLength, { answers: readonly string[]; packed: string }> = {
  4: { answers: ANSWERS_4, packed: GUESSES4_PACKED },
  5: { answers: ANSWERS, packed: GUESSES_PACKED },
};

const accepted: Partial<Record<WordLength, Set<string>>> = {};

export function answersFor(length: WordLength = 5): readonly string[] {
  return SOURCES[length].answers;
}

/** Every word of this length the game accepts as a guess: answers plus the extra list. */
export function acceptedWords(length: WordLength = 5): Set<string> {
  let set = accepted[length];
  if (!set) {
    const { answers, packed } = SOURCES[length];
    set = new Set(answers);
    for (let i = 0; i < packed.length; i += length) set.add(packed.slice(i, i + length));
    accepted[length] = set;
  }
  return set;
}

export function normalizeWord(input: string): string {
  return input.trim().toLowerCase();
}

export function isAcceptedWord(word: string): boolean {
  const w = normalizeWord(word);
  return (w.length === 4 || w.length === 5) && acceptedWords(w.length).has(w);
}

export function isAnswerWord(word: string): boolean {
  const w = normalizeWord(word);
  return (w.length === 4 || w.length === 5) && answersFor(w.length).includes(w);
}
