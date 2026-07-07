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
