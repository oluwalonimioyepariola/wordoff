import type { BrainTuning } from './ai/brain';
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
} from './types';
import { acceptedWords, normalizeWord, WordLength } from './words';

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
 * - Scouting reveals one of the answer's letters to you, at a time penalty.
 *
 * Shared board (the default for new games) is the friendlier variant: one
 * board, turns alternate, and every guess (letters and colors) is visible to
 * both players. First to land the word wins. If the board fills up, sudden
 * death reveals a letter and each player gets one more shot.
 */

export type BoardStyle = 'split' | 'shared';

/** Time added to your total for each scout (only matters in a photo finish). */
export const SCOUT_PENALTY_MS = 10_000;

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
  levelId?: number;
  /** How many letters you may scout this duel (default 0). */
  scouts?: number;
  /** Level-mode adjustments to the rival. */
  tuning?: BrainTuning;
  /** 'split' (simultaneous standoff, default for older saves) or 'shared' (take turns). */
  board?: BoardStyle;
  wordLength?: WordLength;
  /** Rows before sudden death: per player on split boards, in total on shared ones. */
  maxRows?: number;
  /** Shared board: who shoots first (default you). */
  firstShooter?: PlayerId;
  /** Shared board: extra shots you fire before the rival's first turn (easy levels). */
  headStart?: number;
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

export interface Shot {
  by: PlayerId;
  row: DuelRow;
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
  /** Answer positions you've scouted, in the order you scouted them. */
  scouted: number[];
  /** Shared board: whose shot it is. */
  turn: PlayerId;
  /** Shared board: who fired each row, in order. */
  order: PlayerId[];
  /** Shared board: the most recent shot. */
  lastShot: Shot | null;
}

export type GuessCheck =
  | { ok: true; guess: string }
  | { ok: false; reason: 'length' | 'not-a-word' | 'hard-mode' | 'repeat'; message: string };

const emptyBoard = (): Board => ({ rows: [], totalMs: 0, solvedRow: null });

export function createDuel(config: DuelConfig): DuelState {
  const answer = normalizeWord(config.answer);
  return {
    config: { ...config, answer, wordLength: (config.wordLength ?? answer.length) as WordLength },
    round: 0,
    maxRows: config.maxRows ?? MAX_ROWS,
    suddenDeath: false,
    hint: null,
    boards: { you: emptyBoard(), ai: emptyBoard() },
    locked: {},
    lastReveal: null,
    outcome: null,
    scouted: [],
    turn: config.firstShooter ?? 'you',
    order: [],
    lastShot: null,
  };
}

export function wordLengthOf(state: DuelState): WordLength {
  return (state.config.wordLength ?? state.config.answer.length) as WordLength;
}

export function isShared(state: DuelState): boolean {
  return state.config.board === 'shared';
}

/** Shared board rows in the order they were fired. */
export function sharedRows(state: DuelState): Shot[] {
  const next: Record<PlayerId, number> = { you: 0, ai: 0 };
  return (state.order ?? []).map((by) => ({ by, row: state.boards[by].rows[next[by]++] }));
}

/** Everything a player can see: their own board, or the whole shared board. */
export function visibleHistory(state: DuelState, player: PlayerId): ScoredGuess[] {
  if (!isShared(state)) return scoredHistory(state.boards[player]);
  return sharedRows(state).flatMap(({ row }) => (row.guess && row.marks ? [{ guess: row.guess, marks: row.marks }] : []));
}

/** Rows that carry a real guess, in the shape the solver and hard mode use. */
export function scoredHistory(board: Board): ScoredGuess[] {
  return board.rows.flatMap((r) => (r.guess && r.marks ? [{ guess: r.guess, marks: r.marks }] : []));
}

export function validateGuess(state: DuelState, player: PlayerId, input: string): GuessCheck {
  const guess = normalizeWord(input);
  const length = wordLengthOf(state);
  if (guess.length !== length || !/^[a-z]+$/.test(guess)) {
    return { ok: false, reason: 'length', message: 'Not enough letters' };
  }
  if (!acceptedWords(length).has(guess)) {
    return { ok: false, reason: 'not-a-word', message: 'Not in word list' };
  }
  const history = visibleHistory(state, player);
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
  if (state.outcome) return false;
  return isShared(state) ? state.turn === player : !state.locked[player];
}

/**
 * Locks in a player's shot for this round. Pass `null` for a blank (shot
 * clock expired). When both players are locked, the round resolves.
 */
export function lockIn(state: DuelState, player: PlayerId, guess: string | null, timeMs: number): DuelState {
  if (state.outcome) throw new Error('The standoff is over');
  if (isShared(state) && state.turn !== player) throw new Error(`Not ${player}'s turn`);
  if (state.locked[player]) throw new Error(`${player} already locked in this round`);

  let word: string | null = null;
  if (guess !== null) {
    const check = validateGuess(state, player, guess);
    if (!check.ok) throw new Error(check.message);
    word = check.guess;
  }
  if (isShared(state)) return fireShared(state, player, word, Math.max(0, timeMs));

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

/** Shared board: score the shot immediately, check for a win, pass the turn. */
function fireShared(state: DuelState, player: PlayerId, guess: string | null, timeMs: number): DuelState {
  const row = scoreRow({ guess, marks: null, timeMs }, state.config.answer);
  const shotNumber = state.boards[player].rows.length + 1;
  const boards = { ...state.boards, [player]: addRow(state.boards[player], row, shotNumber) };
  const rowNumber = state.round + 1;
  const base: DuelState = {
    ...state,
    boards,
    order: [...(state.order ?? []), player],
    lastShot: { by: player, row },
    round: rowNumber,
    // A head start keeps the turn with you until you've fired your bonus shots.
    turn:
      player === 'you' && state.boards.ai.rows.length === 0 && shotNumber <= (state.config.headStart ?? 0)
        ? 'you'
        : opponentOf(player),
  };
  const end = (winner: PlayerId | null, reason: OutcomeReason): DuelState => ({
    ...base,
    outcome: { winner, reason, rounds: rowNumber, suddenDeath: state.suddenDeath },
  });

  if (isSolved(row.marks)) return end(player, 'solved');
  if (rowNumber < state.maxRows) return base;
  if (state.suddenDeath) return end(null, 'exhausted');
  // Board full: reveal a letter, one more shot each.
  return { ...base, suddenDeath: true, maxRows: state.maxRows + 2, hint: pickSuddenDeathHint(base) };
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
  const positions = [...Array(wordLengthOf(state)).keys()];
  const open = positions.filter((i) => !known.has(i));
  const rng = createRng(`${seed}:sudden-death`);
  const index = rng.pick(open.length ? open : positions);
  return { index, letter: answer[index] };
}

export function scoutsLeft(state: DuelState): number {
  return Math.max(0, (state.config.scouts ?? 0) - (state.scouted?.length ?? 0));
}

/** Answer positions you already know: greens you can see plus scouted letters. */
function knownToYou(state: DuelState): Set<number> {
  const known = new Set(state.scouted ?? []);
  for (const { marks } of visibleHistory(state, 'you')) marks.forEach((m, i) => m === 'correct' && known.add(i));
  return known;
}

export function canScout(state: DuelState): boolean {
  return (
    canLockIn(state, 'you') && scoutsLeft(state) > 0 && knownToYou(state).size < wordLengthOf(state)
  );
}

/** Reveals one answer letter you haven't found yet, adding a time penalty. */
export function scout(state: DuelState): DuelState {
  if (!canScout(state)) return state;
  const known = knownToYou(state);
  const open = [...Array(wordLengthOf(state)).keys()].filter((i) => !known.has(i));
  const rng = createRng(`${state.config.seed}:scout:${state.scouted?.length ?? 0}`);
  const index = rng.pick(open);
  const you = state.boards.you;
  return {
    ...state,
    scouted: [...(state.scouted ?? []), index],
    boards: { ...state.boards, you: { ...you, totalMs: you.totalMs + SCOUT_PENALTY_MS } },
  };
}

/** Letters revealed to you: scouted ones plus the sudden-death hint. */
export function revealedToYou(state: DuelState): SuddenDeathHint[] {
  const hints = (state.scouted ?? []).map((index) => ({ index, letter: state.config.answer[index] }));
  if (state.hint && !hints.some((h) => h.index === state.hint!.index)) hints.push(state.hint);
  return hints.sort((a, b) => a.index - b.index);
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
