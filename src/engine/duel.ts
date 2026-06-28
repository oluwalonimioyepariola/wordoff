import { isSolved, scoreGuess } from './evaluate';
import { hardModeViolation } from './hardMode';
import { createRng } from './rng';
import {
  DuelMode,
  Mark,
  MAX_ROWS,
  OpponentId,
  PlayerId,
  ScoredGuess,
  SuddenDeathHint,
  WORD_LENGTH,
} from './types';
import { isAcceptedWord, normalizeWord } from './words';

/**
 * The standoff.
 *
 * Both players chase the same secret word on their own boards. Each round,
 * both lock in a guess without seeing the other's; then both rows are revealed
 * at once ("DRAW!"). Each player sees the other's colors, never their letters.
 *
 * - First to solve wins.
 * - Both solve on the same row: lower total aiming time wins (photo finish).
 * - Nobody solves in six rows: sudden death. One letter is revealed to both
 *   and each gets one final shot.
 * - An empty shot clock fires a blank: the row is spent with no guess.
 */

export interface DuelConfig {
  answer: string;
  opponent: OpponentId;
  mode: DuelMode;
  hardMode: boolean;
  /** Per-guess time limit, or null for no shot clock. */
  shotClockMs: number | null;
  /** Seeds the AI and the sudden-death hint. */
  seed: string;
  dayNumber?: number;
}

export interface DuelRow {
  /** null when the shot clock ran out (a blank). */
  guess: string | null;
  marks: Mark[] | null;
  timeMs: number;
}

export interface Board {
  rows: DuelRow[];
  totalMs: number;
  /** 1-based row the player solved on, or null. */
  solvedRow: number | null;
}

export type OutcomeReason =
  | 'solved' // only one player solved
  | 'photo-finish' // both solved on the same row; decided on time
  | 'dead-heat' // both solved on the same row with identical time
  | 'exhausted' // nobody solved, even in sudden death
  | 'forfeit';

export interface DuelOutcome {
  winner: PlayerId | null;
  reason: OutcomeReason;
  rounds: number;
  suddenDeath: boolean;
  forfeitedBy?: PlayerId;
}

export interface RoundReveal {
  round: number;
  you: DuelRow;
  ai: DuelRow;
}

export interface DuelState {
  config: DuelConfig;
  /** 0-based index of the round being played. */
  round: number;
  maxRows: number;
  suddenDeath: boolean;
  hint: SuddenDeathHint | null;
  boards: Record<PlayerId, Board>;
  /** Guesses locked in for the current round, not yet revealed. */
  locked: Partial<Record<PlayerId, DuelRow>>;
  lastReveal: RoundReveal | null;
  outcome: DuelOutcome | null;
}

export type GuessCheck =
  | { ok: true; guess: string }
  | { ok: false; reason: 'length' | 'not-a-word' | 'hard-mode' | 'repeat'; message: string };

const emptyBoard = (): Board => ({ rows: [], totalMs: 0, solvedRow: null });

export function createDuel(config: DuelConfig): DuelState {
  return {
    config: { ...config, answer: normalizeWord(config.answer) },
    round: 0,
    maxRows: MAX_ROWS,
    suddenDeath: false,
    hint: null,
    boards: { you: emptyBoard(), ai: emptyBoard() },
    locked: {},
    lastReveal: null,
    outcome: null,
  };
}

/** Rows that carry a real guess, in the shape the solver and hard mode use. */
export function scoredHistory(board: Board): ScoredGuess[] {
  return board.rows.flatMap((r) => (r.guess && r.marks ? [{ guess: r.guess, marks: r.marks }] : []));
}

export function validateGuess(state: DuelState, player: PlayerId, input: string): GuessCheck {
  const guess = normalizeWord(input);
  if (guess.length !== WORD_LENGTH || !/^[a-z]+$/.test(guess)) {
    return { ok: false, reason: 'length', message: 'Not enough letters' };
  }
  if (!isAcceptedWord(guess)) {
    return { ok: false, reason: 'not-a-word', message: 'Not in word list' };
  }
  const history = scoredHistory(state.boards[player]);
  if (history.some((h) => h.guess === guess)) {
    return { ok: false, reason: 'repeat', message: 'Already fired that one' };
  }
  if (state.config.hardMode) {
    const violation = hardModeViolation(guess, history);
    if (violation) return { ok: false, reason: 'hard-mode', message: violation };
  }
  return { ok: true, guess };
}

export function canLockIn(state: DuelState, player: PlayerId): boolean {
  return !state.outcome && !state.locked[player];
}

/**
 * Locks in a player's shot for this round. Pass `null` for a blank (shot
 * clock expired). When both players are locked, the round resolves.
 */
export function lockIn(state: DuelState, player: PlayerId, guess: string | null, timeMs: number): DuelState {
  if (state.outcome) throw new Error('The standoff is over');
  if (state.locked[player]) throw new Error(`${player} already locked in this round`);

  let word: string | null = null;
  if (guess !== null) {
    const check = validateGuess(state, player, guess);
    if (!check.ok) throw new Error(check.message);
    word = check.guess;
  }

  const next: DuelState = {
    ...state,
    locked: { ...state.locked, [player]: { guess: word, marks: null, timeMs: Math.max(0, timeMs) } },
  };
  return next.locked.you && next.locked.ai ? resolveRound(next) : next;
}

function scoreRow(row: DuelRow, answer: string): DuelRow {
  return row.guess ? { ...row, marks: scoreGuess(row.guess, answer) } : row;
}

function addRow(board: Board, row: DuelRow, rowNumber: number): Board {
  return {
    rows: [...board.rows, row],
    totalMs: board.totalMs + row.timeMs,
    solvedRow: board.solvedRow ?? (isSolved(row.marks) ? rowNumber : null),
  };
}

function resolveRound(state: DuelState): DuelState {
  const { answer } = state.config;
  const you = scoreRow(state.locked.you!, answer);
  const ai = scoreRow(state.locked.ai!, answer);
  const rowNumber = state.round + 1;

  const boards = {
    you: addRow(state.boards.you, you, rowNumber),
    ai: addRow(state.boards.ai, ai, rowNumber),
  };
  const base: DuelState = {
    ...state,
    boards,
    locked: {},
    lastReveal: { round: state.round, you, ai },
  };

  const youSolved = isSolved(you.marks);
  const aiSolved = isSolved(ai.marks);
  const end = (winner: PlayerId | null, reason: OutcomeReason): DuelState => ({
    ...base,
    outcome: { winner, reason, rounds: rowNumber, suddenDeath: state.suddenDeath },
  });

  if (youSolved && aiSolved) {
    if (boards.you.totalMs === boards.ai.totalMs) return end(null, 'dead-heat');
    return end(boards.you.totalMs < boards.ai.totalMs ? 'you' : 'ai', 'photo-finish');
  }
  if (youSolved) return end('you', 'solved');
  if (aiSolved) return end('ai', 'solved');

  if (rowNumber < state.maxRows) return { ...base, round: rowNumber };
  if (state.suddenDeath) return end(null, 'exhausted');

  return {
    ...base,
    round: rowNumber,
    maxRows: state.maxRows + 1,
    suddenDeath: true,
    hint: pickSuddenDeathHint(base),
  };
}

/** Reveals a letter neither player has pinned down yet, if there is one. */
function pickSuddenDeathHint(state: DuelState): SuddenDeathHint {
  const { answer, seed } = state.config;
  const known = new Set<number>();
  for (const board of Object.values(state.boards)) {
    for (const row of board.rows) {
      row.marks?.forEach((m, i) => m === 'correct' && known.add(i));
    }
  }
  const open = [...Array(WORD_LENGTH).keys()].filter((i) => !known.has(i));
  const rng = createRng(`${seed}:sudden-death`);
  const index = rng.pick(open.length ? open : [...Array(WORD_LENGTH).keys()]);
  return { index, letter: answer[index] };
}

export function forfeit(state: DuelState, player: PlayerId): DuelState {
  if (state.outcome) return state;
  return {
    ...state,
    locked: {},
    outcome: {
      winner: player === 'you' ? 'ai' : 'you',
      reason: 'forfeit',
      rounds: state.round,
      suddenDeath: state.suddenDeath,
      forfeitedBy: player,
    },
  };
}

export function opponentOf(player: PlayerId): PlayerId {
  return player === 'you' ? 'ai' : 'you';
}

/** Short headline for the result screen. */
export function outcomeHeadline(outcome: DuelOutcome): string {
  if (outcome.reason === 'forfeit') {
    return outcome.forfeitedBy === 'you' ? 'You walked away' : 'Your rival fled town';
  }
  if (outcome.winner === null) {
    return outcome.reason === 'dead-heat' ? 'Dead heat' : 'Both left standing';
  }
  if (outcome.reason === 'photo-finish') {
    return outcome.winner === 'you' ? 'Won by a hair' : 'Lost by a hair';
  }
  return outcome.winner === 'you' ? 'You win the standoff' : 'Shot down';
}
