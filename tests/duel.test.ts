/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createDuel, DuelConfig, DuelState, forfeit, lockIn, outcomeHeadline, validateGuess } from '../src/engine';

const config = (over: Partial<DuelConfig> = {}): DuelConfig => ({
  answer: 'crane',
  opponent: 'gunslinger',
  mode: 'quick',
  hardMode: false,
  shotClockMs: null,
  seed: 'test',
  ...over,
});

/** Plays one round: you then AI. */
const round = (s: DuelState, you: string | null, ai: string | null, youMs = 1000, aiMs = 1000) =>
  lockIn(lockIn(s, 'you', you, youMs), 'ai', ai, aiMs);

describe('duel: simultaneous rounds', () => {
  it('waits for both players before revealing', () => {
    const s = lockIn(createDuel(config()), 'you', 'slate', 900);
    assert.equal(s.boards.you.rows.length, 0);
    assert.ok(s.locked.you);
    assert.equal(s.locked.you?.marks, null);
    assert.throws(() => lockIn(s, 'you', 'trace', 10), /already locked/);
  });

  it('reveals both rows at once and moves to the next round', () => {
    const s = round(createDuel(config()), 'slate', 'trace');
    assert.equal(s.round, 1);
    assert.equal(s.boards.you.rows[0].marks?.length, 5);
    assert.equal(s.boards.ai.rows[0].guess, 'trace');
    assert.equal(s.lastReveal?.round, 0);
    assert.deepEqual(s.locked, {});
    assert.equal(s.outcome, null);
  });

  it('first to solve wins', () => {
    const s = round(round(createDuel(config()), 'slate', 'trace'), 'crane', 'brace');
    assert.deepEqual(s.outcome, { winner: 'you', reason: 'solved', rounds: 2, suddenDeath: false });
    assert.equal(s.boards.you.solvedRow, 2);
    assert.throws(() => lockIn(s, 'you', 'slate', 1), /over/);
  });

  it('decides a same-row solve on total time (photo finish)', () => {
    let s = round(createDuel(config()), 'slate', 'trace', 4000, 2000);
    s = round(s, 'crane', 'crane', 1000, 2500);
    // you: 5000ms, ai: 4500ms
    assert.equal(s.outcome?.winner, 'ai');
    assert.equal(s.outcome?.reason, 'photo-finish');
    assert.equal(outcomeHeadline(s.outcome!), 'Lost by a hair');
  });

  it('calls an identical-time double solve a dead heat', () => {
    const s = round(createDuel(config()), 'crane', 'crane', 1234, 1234);
    assert.equal(s.outcome?.winner, null);
    assert.equal(s.outcome?.reason, 'dead-heat');
  });
});

describe('duel: blanks, sudden death, forfeits', () => {
  const misses = ['plumb', 'fight', 'dusky', 'vowel', 'jumpy', 'stock'];

  it('spends the row on a blank shot', () => {
    const s = round(createDuel(config({ shotClockMs: 30_000 })), null, 'slate', 30_000, 1000);
    assert.equal(s.boards.you.rows[0].guess, null);
    assert.equal(s.boards.you.rows[0].marks, null);
    assert.equal(s.round, 1);
  });

  it('goes to sudden death after six misses, with a shared hint', () => {
    let s = createDuel(config());
    for (const w of misses) s = round(s, w, w);
    assert.equal(s.outcome, null);
    assert.equal(s.suddenDeath, true);
    assert.equal(s.maxRows, 7);
    assert.ok(s.hint);
    assert.equal(s.hint!.letter, 'crane'[s.hint!.index]);
  });

  it('picks a hint position nobody has found yet', () => {
    let s = createDuel(config());
    const pinned = ['brine', 'drank', 'grand', 'frame', 'trade', 'shape'];
    for (const w of pinned) s = round(s, w, w);
    const green = new Set<number>();
    for (const r of s.boards.you.rows) r.marks?.forEach((m, i) => m === 'correct' && green.add(i));
    if (green.size < 5) assert.ok(!green.has(s.hint!.index));
  });

  it('ends in a draw when nobody solves in sudden death', () => {
    let s = createDuel(config());
    for (const w of misses) s = round(s, w, w);
    s = round(s, 'witty', 'witty');
    assert.equal(s.outcome?.winner, null);
    assert.equal(s.outcome?.reason, 'exhausted');
    assert.equal(s.outcome?.suddenDeath, true);
  });

  it('can be won in sudden death', () => {
    let s = createDuel(config());
    for (const w of misses) s = round(s, w, w);
    s = round(s, 'witty', 'crane');
    assert.equal(s.outcome?.winner, 'ai');
    assert.equal(s.outcome?.suddenDeath, true);
    assert.equal(s.boards.ai.solvedRow, 7);
  });

  it('forfeit hands the win to the other side', () => {
    const s = forfeit(round(createDuel(config()), 'slate', 'trace'), 'you');
    assert.equal(s.outcome?.winner, 'ai');
    assert.equal(s.outcome?.reason, 'forfeit');
  });
});

describe('duel: guess validation', () => {
  it('rejects short, unknown, repeated, and hard-mode-breaking guesses', () => {
    let s = createDuel(config({ hardMode: true }));
    assert.equal(validateGuess(s, 'you', 'cra').ok, false);
    assert.deepEqual(validateGuess(s, 'you', 'zzzzz'), { ok: false, reason: 'not-a-word', message: 'Not in word list' });
    s = round(s, 'slate', 'trace');
    const repeat = validateGuess(s, 'you', 'slate');
    assert.equal(repeat.ok, false);
    const hard = validateGuess(s, 'you', 'brick');
    assert.equal(hard.ok || hard.reason, 'hard-mode');
    assert.deepEqual(validateGuess(s, 'you', 'CRANE'), { ok: true, guess: 'crane' });
  });

  it('refuses to lock in an invalid word', () => {
    assert.throws(() => lockIn(createDuel(config()), 'you', 'qqqqq', 10), /word list/);
  });
});
