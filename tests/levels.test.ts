/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canScout,
  createBrain,
  createDuel,
  createStats,
  DuelConfig,
  getLevel,
  isSolved,
  LEVEL_COUNT,
  LEVELS,
  levelAnswer,
  lockIn,
  migrateStats,
  recordDuel,
  revealedToYou,
  ScoredGuess,
  scoreGuess,
  scout,
  SCOUT_PENALTY_MS,
  scoutsLeft,
  starsFor,
  totalStars,
  wordTiers,
} from '../src/engine';

const cfg = (over: Partial<DuelConfig> = {}): DuelConfig => ({
  answer: 'crane',
  opponent: 'rookie',
  mode: 'level',
  hardMode: false,
  shotClockMs: null,
  seed: 'lvl',
  levelId: 1,
  scouts: 2,
  ...over,
});

describe('scouting', () => {
  it('reveals letters you have not found yet, with a time penalty', () => {
    let s = createDuel(cfg());
    assert.equal(scoutsLeft(s), 2);
    s = scout(s);
    s = scout(s);
    assert.equal(scoutsLeft(s), 0);
    assert.equal(canScout(s), false);
    assert.equal(new Set(s.scouted).size, 2);
    for (const h of revealedToYou(s)) assert.equal(h.letter, 'crane'[h.index]);
    assert.equal(s.boards.you.totalMs, 2 * SCOUT_PENALTY_MS);
    assert.equal(scout(s), s); // no scouts left: no-op
  });

  it('skips letters you already have green, and keeps the penalty through rounds', () => {
    let s = createDuel(cfg({ scouts: 3 }));
    s = lockIn(lockIn(s, 'you', 'brine', 1000), 'ai', 'plumb', 1000); // _r_ne → r, n, e green
    for (let i = 0; i < 3; i++) s = scout(s);
    assert.deepEqual([...s.scouted].sort(), [0, 2]); // only c and a were unknown
    assert.equal(s.boards.you.totalMs, 1000 + 2 * SCOUT_PENALTY_MS);
  });

  it('is unavailable without scouts or once you have locked in', () => {
    assert.equal(canScout(createDuel(cfg({ scouts: 0 }))), false);
    assert.equal(canScout(lockIn(createDuel(cfg()), 'you', 'slate', 10)), false);
  });
});

describe('levels', () => {
  it('has 30 levels in three chapters with a boss at the end of each', () => {
    assert.equal(LEVEL_COUNT, 30);
    assert.deepEqual(LEVELS.filter((l) => l.boss).map((l) => l.id), [10, 20, 30]);
    assert.equal(getLevel(1).opponent, 'rookie');
    assert.equal(getLevel(30).opponent, 'sheriff');
    assert.ok(getLevel(30).hardMode);
    assert.ok(getLevel(1).scouts > getLevel(30).scouts);
  });

  it('splits answers into easy/medium/hard tiers', () => {
    const t = wordTiers();
    assert.ok(t.easy.length > 300 && t.hard.length > 300);
    assert.ok(t.easy.includes('arise') || t.easy.includes('stare'));
    assert.ok(t.hard.includes('fuzzy') || t.hard.includes('kayak') || t.hard.includes('dizzy'));
    assert.ok(wordTiers(4).easy.includes(levelAnswer(1, 0)));
    assert.notEqual(levelAnswer(1, 0), levelAnswer(1, 1));
  });

  it('rival gets stronger from the first level to the last', () => {
    const avg = (id: number) => {
      const level = getLevel(id);
      let total = 0;
      for (let a = 0; a < 80; a++) {
        const answer = levelAnswer(id, a);
        const brain = createBrain(level.opponent, `t-${id}-${a}`, level.tuning);
        const h: ScoredGuess[] = [];
        for (let i = 0; i < 15; i++) {
          const g = brain.nextGuess(h, null);
          h.push({ guess: g, marks: scoreGuess(g, answer) });
          if (isSolved(h.at(-1)!.marks)) break;
        }
        total += h.length;
      }
      return total / 80;
    };
    const [l1, l15, l30] = [avg(1), avg(15), avg(30)];
    assert.ok(l1 > l15 && l15 > l30, `${l1} > ${l15} > ${l30}`);
    assert.ok(l1 > 5.5, `level 1 rival should be gentle, got ${l1}`);
  });

  it('awards stars by solve row', () => {
    const l = getLevel(1); // stars [2, 3]: counted in your own shots
    assert.equal(starsFor(l, true, 2), 3);
    assert.equal(starsFor(l, true, 3), 2);
    assert.equal(starsFor(l, true, 5), 1);
    assert.equal(starsFor(l, false, 3), 0);
  });
});

describe('level progress', () => {
  const finish = (levelId: number, win: boolean) => {
    let s = createDuel(cfg({ levelId }));
    s = lockIn(lockIn(s, 'you', 'slate', 1000), 'ai', 'plumb', 1000);
    s = win ? lockIn(lockIn(s, 'you', 'crane', 1000), 'ai', 'witty', 1000) : lockIn(lockIn(s, 'you', 'witty', 1000), 'ai', 'crane', 1000);
    return s;
  };

  it('unlocks the next level on a win and keeps the best stars', () => {
    let stats = createStats();
    const lose = finish(1, false);
    stats = recordDuel(stats, { config: lose.config, outcome: lose.outcome!, you: lose.boards.you, ai: lose.boards.ai }).stats;
    assert.equal(stats.levels.unlocked, 1);
    assert.equal(stats.levels.attempts[1], 1);

    const win = finish(1, true);
    const r = recordDuel(stats, { config: win.config, outcome: win.outcome!, you: win.boards.you, ai: win.boards.ai, scoutsUsed: 0 });
    stats = r.stats;
    assert.equal(stats.levels.unlocked, 2);
    assert.equal(stats.levels.stars[1], 3);
    assert.equal(totalStars(stats), 3);
    assert.ok(r.unlocked.includes('no-scouts'));
    assert.equal(stats.duels.played, 0); // levels don't count as quick duels
    assert.equal(stats.vs.rookie.wins, 1);
  });

  it('does not unlock past the frontier when replaying an old level', () => {
    let stats = createStats();
    stats.levels.unlocked = 5;
    const win = finish(2, true);
    stats = recordDuel(stats, { config: win.config, outcome: win.outcome!, you: win.boards.you, ai: win.boards.ai }).stats;
    assert.equal(stats.levels.unlocked, 5);
  });

  it('migrates stats saved before levels existed', () => {
    const old = { ...createStats(), version: 1 } as Record<string, unknown>;
    delete old.levels;
    const migrated = migrateStats(old);
    assert.equal(migrated.version, 2);
    assert.equal(migrated.levels.unlocked, 1);
  });
});
