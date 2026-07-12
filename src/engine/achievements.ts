import type { DuelRecordInput, ResultKind, Stats } from './stats';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  /** Hidden until unlocked. */
  secret?: boolean;
}

export type AchievementEvent =
  | { kind: 'duel'; input: DuelRecordInput; result: ResultKind }
  | { kind: 'match'; result: ResultKind; sweep: boolean };

interface Rule extends Achievement {
  check(stats: Stats, event: AchievementEvent): boolean;
}

const duelWin = (e: AchievementEvent) => e.kind === 'duel' && e.result === 'win';
const totalWins = (s: Stats) => s.vs.rookie.wins + s.vs.gunslinger.wins + s.vs.sheriff.wins;
const totalPlayed = (s: Stats) => s.daily.played + s.duels.played;

const RULES: Rule[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Win your first standoff.',
    check: (s) => totalWins(s) >= 1,
  },
  {
    id: 'quickdraw',
    name: 'Quickdraw',
    description: 'Solve in two guesses.',
    check: (_, e) => e.kind === 'duel' && e.input.you.solvedRow !== null && e.input.you.solvedRow <= 2,
  },
  {
    id: 'deadeye',
    name: 'Deadeye',
    description: 'Solve on your very first shot.',
    secret: true,
    check: (_, e) => e.kind === 'duel' && e.input.you.solvedRow === 1,
  },
  {
    id: 'rookie-wrangler',
    name: 'Rookie Wrangler',
    description: 'Beat Rookie Rae five times.',
    check: (s) => s.vs.rookie.wins >= 5,
  },
  {
    id: 'outdrawn',
    name: 'Outdrawn',
    description: 'Beat Dusty Vance, the Gunslinger.',
    check: (s) => s.vs.gunslinger.wins >= 1,
  },
  {
    id: 'sheriff-slayer',
    name: 'Sheriff Slayer',
    description: 'Beat The Sheriff.',
    check: (s) => s.vs.sheriff.wins >= 1,
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Beat The Sheriff five times in a row.',
    check: (s) => s.vs.sheriff.bestStreak >= 5,
  },
  {
    id: 'last-bullet',
    name: 'Last Bullet',
    description: 'Win in sudden death.',
    check: (_, e) => duelWin(e) && e.kind === 'duel' && e.input.outcome.suddenDeath,
  },
  {
    id: 'photo-finish',
    name: 'Photo Finish',
    description: 'Win a standoff decided on time.',
    check: (_, e) => duelWin(e) && e.kind === 'duel' && e.input.outcome.reason === 'photo-finish',
  },
  {
    id: 'hard-boiled',
    name: 'Hard Boiled',
    description: 'Win with hard mode on.',
    check: (_, e) => duelWin(e) && e.kind === 'duel' && e.input.config.hardMode,
  },
  {
    id: 'beat-the-clock',
    name: 'Beat the Clock',
    description: 'Win with the shot clock on.',
    check: (_, e) => duelWin(e) && e.kind === 'duel' && e.input.config.shotClockMs !== null,
  },
  {
    id: 'lightning',
    name: 'Lightning Hands',
    description: 'Solve in under 30 seconds of total aiming time.',
    check: (_, e) => e.kind === 'duel' && e.input.you.solvedRow !== null && e.input.you.totalMs < 30_000,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Keep a 7-day Daily Standoff streak.',
    check: (s) => s.daily.bestPlayStreak >= 7,
  },
  {
    id: 'iron-streak',
    name: 'Iron Streak',
    description: 'Keep a 30-day Daily Standoff streak.',
    check: (s) => s.daily.bestPlayStreak >= 30,
  },
  {
    id: 'hot-hand',
    name: 'Hot Hand',
    description: 'Win 5 Quick Duels in a row.',
    check: (s) => s.duels.bestWinStreak >= 5,
  },
  {
    id: 'clean-sweep',
    name: 'Clean Sweep',
    description: 'Win a best-of-3 or best-of-5 match without dropping a duel.',
    check: (_, e) => e.kind === 'match' && e.sweep,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Play 100 standoffs.',
    check: (s) => totalPlayed(s) >= 100,
  },
];

export const ACHIEVEMENTS: Achievement[] = RULES.map(({ check: _check, ...a }) => a);

/** IDs newly unlocked by this event (already-unlocked ones are skipped). */
export function evaluateAchievements(stats: Stats, event: AchievementEvent): string[] {
  return RULES.filter((r) => !stats.achievements[r.id] && r.check(stats, event)).map((r) => r.id);
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
