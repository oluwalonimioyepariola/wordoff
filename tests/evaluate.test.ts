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

describe('scoreGuess', () => {
  it('marks greens, yellows, and grays', () => {
    assert.equal(s('crane', 'crane'), 'GGGGG');
    assert.equal(s('slate', 'crane'), '..G.G');
    assert.equal(s('react', 'crane'), 'YYGY.');
  });

  it('does not over-count repeated letters', () => {
    // Only one E in "crane"; the green claims it, so the other E is gray.
    assert.equal(s('eerie', 'crane'), '..Y.G');
    // Two Ls guessed, one L in the answer.
    assert.equal(s('hello', 'world'), '...GY');
    assert.equal(s('llama', 'hello'), 'YY...');
  });

  it('gives yellows left to right when copies run out', () => {
    assert.equal(s('speed', 'abide'), '..Y.Y');
    assert.equal(s('geese', 'eagle'), 'YY..G');
  });

  it('agrees with the packed pattern code on random pairs', () => {
    const rng = createRng('pattern');
    for (let i = 0; i < 3000; i++) {
      const g = rng.pick(ANSWERS);
      const a = rng.pick(ANSWERS);
      assert.equal(patternCode(g, a), marksToCode(scoreGuess(g, a)), `${g} vs ${a}`);
    }
  });

  it('detects a solve', () => {
    assert.ok(isSolved(scoreGuess('vivid', 'vivid')));
    assert.ok(!isSolved(scoreGuess('vivid', 'valid')));
    assert.ok(!isSolved(null));
  });
});

describe('keyboardMarks', () => {
  it('keeps the best mark seen per letter', () => {
    const keys = keyboardMarks([
      { guess: 'react', marks: scoreGuess('react', 'crane') },
      { guess: 'crane', marks: scoreGuess('crane', 'crane') },
    ]);
    assert.equal(keys.r, 'correct');
    assert.equal(keys.t, 'absent');
    assert.equal(keys.e, 'correct');
  });
});
