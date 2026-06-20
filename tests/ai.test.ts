/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANSWERS,
  createBrain,
  createRng,
  filterCandidates,
  isAcceptedWord,
  isSolved,
  OpponentId,
  OPPONENT_ORDER,
  ScoredGuess,
  scoreGuess,
  shuffled,
} from '../src/engine';

/** Lets a brain play solo against an answer; returns the guesses it made. */
function solo(opponent: OpponentId, answer: string, seed: string, maxRows = 10): string[] {
  const brain = createBrain(opponent, seed);
  const history: ScoredGuess[] = [];
  for (let i = 0; i < maxRows; i++) {
    const guess = brain.nextGuess(history, null);
    const marks = scoreGuess(guess, answer);
    history.push({ guess, marks });
    if (isSolved(marks)) break;
  }
  return history.map((h) => h.guess);
}

const sample = shuffled(ANSWERS, createRng('ai-sample')).slice(0, 150);
