/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildShareText,
  createDuel,
  createMatch,
  createStats,
  DuelConfig,
  DuelState,
  FREEZE_EVERY,
  isMatchOver,
  isSweep,
  lockIn,
  pickQuickAnswer,
  recordDuel,
  recordMatch,
  recordMatchDuel,
  Stats,
  streakStatus,
  winRate,
} from '../src/engine';

const cfg = (over: Partial<DuelConfig> = {}): DuelConfig => ({
  answer: 'crane',
  opponent: 'sheriff',
  mode: 'daily',
  hardMode: false,
  shotClockMs: null,
  seed: 's',
  dayNumber: 1,
  ...over,
});

const round = (s: DuelState, you: string, ai: string, youMs = 5000, aiMs = 5000) =>
  lockIn(lockIn(s, 'you', you, youMs), 'ai', ai, aiMs);

/** A finished duel the player wins (on row 2) or loses. */
function finished(result: 'win' | 'loss', over: Partial<DuelConfig> = {}): DuelState {
  const s = round(createDuel(cfg(over)), 'slate', 'trace');
  return result === 'win' ? round(s, 'crane', 'brace') : round(s, 'brace', 'crane');
}

function playDaily(stats: Stats, day: number, result: 'win' | 'loss' = 'win') {
  const d = finished(result, { dayNumber: day });
  return recordDuel(stats, { config: d.config, outcome: d.outcome!, you: d.boards.you, ai: d.boards.ai, now: day });
}

describe('daily streaks', () => {
  it('counts consecutive days and win streaks', () => {
    let s = createStats();
    s = playDaily(s, 10).stats;
    s = playDaily(s, 11).stats;
    s = playDaily(s, 12, 'loss').stats;
    assert.equal(s.daily.playStreak, 3);
    assert.equal(s.daily.winStreak, 0);
    assert.equal(s.daily.bestWinStreak, 2);
    assert.equal(s.daily.played, 3);
    assert.deepEqual([s.daily.wins, s.daily.losses], [2, 1]);
    assert.equal(s.daily.history[12].result, 'loss');
  });

  it('only counts one result per day', () => {
    let s = playDaily(createStats(), 5).stats;
    s = playDaily(s, 5, 'loss').stats;
    assert.equal(s.daily.played, 1);
    assert.equal(s.daily.history[5].result, 'win');
  });

  it('breaks the streak on a missed day with no freezes', () => {
    let s = playDaily(createStats(), 1).stats;
    s = playDaily(s, 3).stats;
    assert.equal(s.daily.playStreak, 1);
    assert.equal(s.daily.bestPlayStreak, 1);
  });

  it(`earns a freeze every ${FREEZE_EVERY} days and spends it on a missed day`, () => {
    let s = createStats();
    let earned = 0;
    for (let day = 1; day <= FREEZE_EVERY; day++) {
      const r = playDaily(s, day);
      s = r.stats;
      if (r.freezeEarned) earned++;
    }
    assert.equal(earned, 1);
    assert.equal(s.daily.freezes, 1);

    assert.equal(streakStatus(s, FREEZE_EVERY + 2).status, 'at-risk');
    const r = playDaily(s, FREEZE_EVERY + 2); // skipped one day
    assert.equal(r.freezesSpent, 1);
    assert.equal(r.stats.daily.playStreak, FREEZE_EVERY + 1);
    assert.equal(r.stats.daily.freezes, 0);
    assert.equal(r.stats.daily.freezesUsed, 1);
  });

  it('reports streak status relative to today', () => {
    const s = playDaily(createStats(), 20).stats;
    assert.deepEqual(streakStatus(s, 20), { streak: 1, status: 'active' });
    assert.deepEqual(streakStatus(s, 21), { streak: 1, status: 'pending' });
    assert.deepEqual(streakStatus(s, 23), { streak: 0, status: 'broken' });
    assert.deepEqual(streakStatus(createStats(), 1), { streak: 0, status: 'broken' });
  });
});
