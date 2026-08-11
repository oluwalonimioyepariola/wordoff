import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createBrain,
  DuelState,
  forfeit as forfeitDuel,
  keyboardMarks,
  lockIn,
  rowStrength,
  scoredHistory,
  TauntEvent,
  validateGuess,
  WORD_LENGTH,
} from '../engine';
import { useSettings } from '../store/settings';
import { motion } from '../theme';
import { haptic } from './feedback';

/**
 * Drives one standoff on screen: your typing and lock-in, the AI's "aiming"
 * delay, the shot clock, the 3-2-1-DRAW count, the reveal, and taunts.
 * The rules themselves live in the engine; this hook only sequences them.
 */

export type Phase = 'aiming' | 'countdown' | 'reveal' | 'result';
export type CountBeat = 3 | 2 | 1 | 'draw';

interface Options {
  initial: DuelState;
  /** Called after every state change (used to save the daily mid-game). */
  onChange?(state: DuelState): void;
  /** Called once, after the final reveal finishes. */
  onFinish?(state: DuelState): void;
}
