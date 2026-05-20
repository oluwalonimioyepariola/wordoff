/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANSWERS,
  createRng,
  hardModeViolation,
  isAcceptedWord,
  isSolved,
  keyboardMarks,
  marksToCode,
  patternCode,
  scoreGuess,
} from '../src/engine';

const s = (guess: string, answer: string) =>
  scoreGuess(guess, answer)
    .map((m) => (m === 'correct' ? 'G' : m === 'present' ? 'Y' : '.'))
    .join('');
