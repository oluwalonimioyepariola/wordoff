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

describe('AI opponents', () => {
  it('only guesses accepted words and never repeats itself', () => {
    for (const id of OPPONENT_ORDER) {
      for (const answer of sample.slice(0, 40)) {
        const guesses = solo(id, answer, `rep-${answer}`);
        assert.ok(guesses.every(isAcceptedWord), `${id}: ${guesses}`);
        assert.equal(new Set(guesses).size, guesses.length, `${id} repeated: ${guesses}`);
      }
    }
  });

  it('is deterministic for the same seed (so the daily AI is the same for everyone)', () => {
    for (const id of OPPONENT_ORDER) {
      assert.deepEqual(solo(id, 'vivid', 'daily-170'), solo(id, 'vivid', 'daily-170'));
    }
  });

  it('always eventually solves, and gets stronger with difficulty', () => {
    const avg: Record<string, number> = {};
    for (const id of OPPONENT_ORDER) {
      let total = 0;
      let failsIn6 = 0;
      for (const answer of sample) {
        const guesses = solo(id, answer, `strength-${answer}`, 15);
        assert.equal(guesses.at(-1), answer, `${id} never found ${answer}`);
        total += guesses.length;
        if (guesses.length > 6) failsIn6++;
      }
      avg[id] = total / sample.length;
      console.log(`  ${id}: avg ${avg[id].toFixed(2)} guesses, ${failsIn6}/${sample.length} over six`);
    }
    assert.ok(avg.sheriff < avg.gunslinger, 'Sheriff should beat Gunslinger on average');
    assert.ok(avg.gunslinger < avg.rookie, 'Gunslinger should beat Rookie on average');
    assert.ok(avg.sheriff < 4.2, `Sheriff too weak: ${avg.sheriff}`);
  });

  it('respects the sudden-death hint', () => {
    const brain = createBrain('rookie', 'hint');
    const history = [{ guess: 'plumb', marks: scoreGuess('plumb', 'crane') }];
    for (let i = 0; i < 20; i++) {
      const g = createBrain('rookie', `hint-${i}`).nextGuess(history, { index: 0, letter: 'c' });
      assert.equal(g[0], 'c');
    }
    assert.ok(brain.thinkTimeMs(0) >= brain.profile.thinkMs.min);
    assert.equal(brain.thinkTimeMs(3), createBrain('rookie', 'hint').thinkTimeMs(3));
  });

  it('only ever narrows to words consistent with its own feedback', () => {
    const history = [
      { guess: 'slate', marks: scoreGuess('slate', 'crane') },
      { guess: 'brick', marks: scoreGuess('brick', 'crane') },
    ];
    const left = filterCandidates(ANSWERS, history);
    assert.ok(left.includes('crane'));
    assert.ok(left.every((w) => w[2] === 'a' && w[4] === 'e'));
  });
});
