/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ANSWERS_4,
  buildShareText,
  canLockIn,
  canScout,
  createBrain,
  createDuel,
  DuelConfig,
  DuelState,
  getLevel,
  isAcceptedWord,
  levelAnswer,
  lockIn,
  scout,
  scoreGuess,
  sharedRows,
  validateGuess,
  visibleHistory,
  wordTiers,
} from '../src/engine';

const cfg = (over: Partial<DuelConfig> = {}): DuelConfig => ({
  answer: 'lamp',
  opponent: 'rookie',
  mode: 'quick',
  hardMode: false,
  shotClockMs: null,
  seed: 'shared',
  board: 'shared',
  ...over,
});

describe('4-letter words', () => {
  it('scores and accepts 4-letter words', () => {
    assert.deepEqual(scoreGuess('palm', 'lamp'), ['present', 'correct', 'present', 'present']);
    assert.ok(isAcceptedWord('lamp'));
    assert.ok(ANSWERS_4.length > 600 && ANSWERS_4.every((w) => /^[a-z]{4}$/.test(w)));
    assert.equal(createDuel(cfg()).config.wordLength, 4);
  });

  it('rejects words of the wrong length for the duel', () => {
    const s = createDuel(cfg());
    assert.equal(validateGuess(s, 'you', 'crane').ok, false);
    assert.deepEqual(validateGuess(s, 'you', 'PALM'), { ok: true, guess: 'palm' });
  });

  it('has an AI that can play 4-letter words', () => {
    // Gunslinger always keeps greens in place, even on a sloppy shot.
    const brain = createBrain('gunslinger', 'four', {}, 4);
    const h = [{ guess: 'rate', marks: scoreGuess('rate', 'lamp') }];
    const g = brain.nextGuess(h, null);
    assert.equal(g.length, 4);
    assert.equal(g[1], 'a');
  });

  it('tiers 4-letter answers too', () => {
    const t = wordTiers(4);
    assert.ok(t.easy.every((w) => w.length === 4));
    assert.equal(levelAnswer(1, 0).length, 4);
  });
});

describe('shared board', () => {
  const play = (s: DuelState, ...words: string[]) =>
    words.reduce((acc, w) => lockIn(acc, acc.turn, w, 2000), s);

  it('alternates turns starting with you, and reveals each shot at once', () => {
    let s = createDuel(cfg());
    assert.equal(s.turn, 'you');
    assert.ok(canLockIn(s, 'you'));
    assert.ok(!canLockIn(s, 'ai'));
    assert.throws(() => lockIn(s, 'ai', 'rate', 1), /turn/);
    s = lockIn(s, 'you', 'rate', 1500);
    assert.equal(s.turn, 'ai');
    assert.deepEqual(s.lastShot?.row.marks, scoreGuess('rate', 'lamp'));
    assert.equal(s.round, 1);
  });

  it('lets both players see every guess', () => {
    const s = play(createDuel(cfg()), 'rate', 'coin');
    assert.deepEqual(
      visibleHistory(s, 'ai').map((h) => h.guess),
      ['rate', 'coin'],
    );
    assert.deepEqual(visibleHistory(s, 'you'), visibleHistory(s, 'ai'));
    assert.deepEqual(sharedRows(s).map((r) => r.by), ['you', 'ai']);
    // Nobody may repeat a word already on the board.
    assert.equal(validateGuess(s, 'you', 'coin').ok, false);
  });

  it('ends as soon as someone lands the word', () => {
    const s = play(createDuel(cfg()), 'rate', 'lamp');
    assert.equal(s.outcome?.winner, 'ai');
    assert.equal(s.outcome?.reason, 'solved');
    assert.equal(s.boards.ai.solvedRow, 1); // the rival's first shot
  });

  it('goes to sudden death when the board fills, then a draw', () => {
    let s = play(createDuel(cfg()), 'rate', 'coin', 'busy', 'fork', 'dish', 'wing');
    assert.equal(s.outcome, null);
    assert.ok(s.suddenDeath);
    assert.equal(s.maxRows, 8);
    assert.equal(s.hint!.letter, 'lamp'[s.hint!.index]);
    s = play(s, 'jury', 'hood');
    assert.equal(s.outcome?.winner, null);
    assert.equal(s.outcome?.reason, 'exhausted');
  });

  it('lets you scout only on your turn, counting greens from both players', () => {
    let s = createDuel(cfg({ scouts: 4 }));
    s = play(s, 'rate', 'damp'); // rival's damp reveals _amp
    assert.ok(canScout(s));
    s = scout(s);
    assert.deepEqual(s.scouted, [0]); // only the L was unknown
    assert.ok(!canScout(s)); // everything is known now
    s = play(s, 'lamp');
    assert.equal(s.outcome?.winner, 'you');
    const notMyTurn = play(createDuel(cfg({ scouts: 1 })), 'rate');
    assert.ok(!canScout(notMyTurn));
  });

  it('shares one interleaved board with owner markers and no letters', () => {
    const s = play(createDuel(cfg({ mode: 'level', levelId: 1 })), 'rate', 'coin', 'lamp');
    const text = buildShareText(s);
    assert.match(text, /^Wordoff Level 1 🤠/);
    assert.match(text, /Me landed it on shot 3, won/);
    assert.deepEqual(
      text.split('\n').slice(2).map((l) => l.slice(0, 2)),
      ['🔵', '🔴', '🔵'],
    );
    assert.ok(!/lamp|coin/i.test(text));
  });

  it('levels start on the shared board with 4-letter words', () => {
    const l = getLevel(1);
    assert.equal(l.board, 'shared');
    assert.equal(l.wordLength, 4);
    assert.equal(getLevel(11).wordLength, 5);
  });
});
