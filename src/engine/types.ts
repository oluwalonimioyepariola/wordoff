export const WORD_LENGTH = 5;
export const MAX_ROWS = 6;

/** Feedback for one letter: right spot, in the word, or not in the word. */
export type Mark = 'correct' | 'present' | 'absent';

export type PlayerId = 'you' | 'ai';

export type OpponentId = 'rookie' | 'gunslinger' | 'sheriff';

export type DuelMode = 'daily' | 'quick' | 'level';

export interface ScoredGuess {
  guess: string;
  marks: Mark[];
}

/** A letter revealed to both players when a standoff goes to sudden death. */
export interface SuddenDeathHint {
  index: number;
  letter: string;
}
