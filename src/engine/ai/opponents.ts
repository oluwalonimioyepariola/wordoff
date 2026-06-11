import { OpponentId } from '../types';

export type TauntEvent =
  | 'intro'
  | 'aiStrongRow' // AI just revealed 3+ greens
  | 'youStrongRow' // you just revealed 3+ greens
  | 'aiWins'
  | 'youWin'
  | 'draw'
  | 'suddenDeath'
  | 'youBlank' // your shot clock ran out
  | 'photoFinish'; // both solved on the same row, decided on time

export type Strategy = 'loose' | 'consistent' | 'information';

export interface OpponentProfile {
  id: OpponentId;
  name: string;
  title: string;
  blurb: string;
  /** 1–3, shown as difficulty pips. */
  difficulty: 1 | 2 | 3;
  strategy: Strategy;
  /** Chance per turn the AI actually uses every clue it has (loose / consistent strategies). */
  clueDiscipline: number;
  /** Simulated time spent "aiming" per guess. Matters for photo finishes. */
  thinkMs: { min: number; max: number };
  taunts: Record<TauntEvent, string[]>;
}
