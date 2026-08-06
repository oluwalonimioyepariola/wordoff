import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  BestOf,
  createMatch,
  createStats,
  DuelState,
  isMatchOver,
  isSweep,
  MatchState,
  OpponentId,
  recordDuel,
  recordMatch,
  recordMatchDuel,
  RecordResult,
  Stats,
} from '../engine';
import { deviceStorage } from './storage';

interface ProfileStore {
  stats: Stats;
  /**
   * Today's Daily Standoff while it's being played. Saved after every round so
   * closing the app can't be used to re-roll a bad daily.
   */
  activeDaily: DuelState | null;
  /** The running Quick Duel match and its current duel, if any. */
  match: MatchState | null;
  activeQuick: DuelState | null;

  saveDaily(state: DuelState): void;
  saveQuick(state: DuelState): void;
  startMatch(opponent: OpponentId, bestOf: BestOf): void;
  abandonMatch(): void;
  /** Records a finished duel (and its match, if that finished too). */
  finishDuel(state: DuelState): RecordResult & { matchOver: boolean };
  resetStats(): void;
}
