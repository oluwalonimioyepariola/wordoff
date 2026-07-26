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
