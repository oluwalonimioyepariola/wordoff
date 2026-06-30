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
