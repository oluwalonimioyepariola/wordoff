/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANSWERS,
  dailyAnswer,
  dailyOpponent,
  dateForDayNumber,
  dayKey,
  dayNumber,
  formatCountdown,
  msUntilNextDay,
} from '../src/engine';

describe('daily standoff', () => {
  it('starts at #1 on launch day and counts local days', () => {
    assert.equal(dayNumber(new Date(2026, 4, 1, 0, 0, 1)), 1);
    assert.equal(dayNumber(new Date(2026, 4, 1, 23, 59, 59)), 1);
    assert.equal(dayNumber(new Date(2026, 4, 2, 0, 0, 0)), 2);
    assert.equal(dayNumber(new Date(2026, 9, 17, 12)), 170);
  });

  it('is not thrown off by daylight saving changes', () => {
    // Every consecutive calendar day across a full year differs by exactly one.
    let prev = dayNumber(new Date(2026, 0, 1, 12));
    for (let i = 1; i < 366; i++) {
      const n = dayNumber(new Date(2026, 0, 1 + i, 0, 30));
      assert.equal(n, prev + 1);
      prev = n;
    }
  });

  it('round-trips day numbers to dates', () => {
    for (const n of [1, 2, 31, 170, 400]) {
      assert.equal(dayNumber(dateForDayNumber(n)), n);
    }
    assert.equal(dayKey(dateForDayNumber(170)), '2026-10-17');
  });

  it('gives a stable answer from the pool, varying day to day', () => {
    assert.equal(dailyAnswer(170), dailyAnswer(170));
    assert.ok(ANSWERS.includes(dailyAnswer(170)));
    const week = new Set(Array.from({ length: 30 }, (_, i) => dailyAnswer(i + 1)));
    assert.equal(week.size, 30);
  });

  it('does not repeat an answer within one full cycle', () => {
    const seen = new Set(Array.from({ length: ANSWERS.length }, (_, i) => dailyAnswer(i + 1)));
    assert.equal(seen.size, ANSWERS.length);
  });

  it('rotates the daily rival', () => {
    assert.deepEqual([1, 2, 3, 4].map(dailyOpponent), ['rookie', 'gunslinger', 'sheriff', 'rookie']);
  });

  it('counts down to local midnight', () => {
    const ms = msUntilNextDay(new Date(2026, 9, 17, 23, 0, 0));
    assert.equal(ms, 3_600_000);
    assert.equal(formatCountdown(ms), '01:00:00');
    assert.equal(formatCountdown(-5), '00:00:00');
  });
});
