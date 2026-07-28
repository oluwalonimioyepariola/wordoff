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
