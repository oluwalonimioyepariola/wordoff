import { createRng, shuffled } from './rng';
import { OpponentId } from './types';
import { ANSWERS } from './words';

/** Day #1 of the Daily Standoff (local calendar date). */
export const DAILY_EPOCH = { year: 2026, month: 5, day: 1 };

const MS_PER_DAY = 86_400_000;

/**
 * Days are counted on the local calendar, converted through UTC so daylight
 * saving shifts never make a day 23 or 25 hours long.
 */
function localDayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

const EPOCH_INDEX = Math.floor(
  Date.UTC(DAILY_EPOCH.year, DAILY_EPOCH.month - 1, DAILY_EPOCH.day) / MS_PER_DAY,
);

/** Puzzle number shown to players: 1 on launch day, then +1 every local midnight. */
export function dayNumber(date: Date = new Date()): number {
  return localDayIndex(date) - EPOCH_INDEX + 1;
}

/** Stable key for storing a day's result, e.g. "2026-10-17". */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateForDayNumber(n: number): Date {
  const utc = new Date((EPOCH_INDEX + n - 1) * MS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

let order: string[] | null = null;

/**
 * The answer for a given puzzle number. Answers come from a fixed seeded
 * shuffle so the order isn't alphabetical, and every player gets the same word.
 */
export function dailyAnswer(n: number): string {
  if (!order) order = shuffled(ANSWERS, createRng('wordoff-daily-v1'));
  const i = (((n - 1) % order.length) + order.length) % order.length;
  return order[i];
}
