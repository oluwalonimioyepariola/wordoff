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
