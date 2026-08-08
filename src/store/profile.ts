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

export const useProfile = create<ProfileStore>()(
  persist(
    (set, get) => ({
      stats: createStats(),
      activeDaily: null,
      match: null,
      activeQuick: null,

      saveDaily: (state) => set({ activeDaily: state }),
      saveQuick: (state) => set({ activeQuick: state }),

      startMatch: (opponent, bestOf) => set({ match: createMatch(opponent, bestOf), activeQuick: null }),
      abandonMatch: () => set({ match: null, activeQuick: null }),

      finishDuel: (state) => {
        const { outcome, config, boards } = state;
        if (!outcome) throw new Error('Duel is not finished');
        let record = recordDuel(get().stats, { config, outcome, you: boards.you, ai: boards.ai });
        let matchOver = false;

        if (config.mode === 'daily') {
          set({ stats: record.stats, activeDaily: state });
        } else {
          let match = get().match;
          if (match) {
            match = recordMatchDuel(match, outcome);
            if (isMatchOver(match)) {
              matchOver = true;
              const m = recordMatch(
                record.stats,
                match.winner === 'you' ? 'win' : match.winner === 'ai' ? 'loss' : 'draw',
                isSweep(match),
              );
              record = { ...record, stats: m.stats, unlocked: [...record.unlocked, ...m.unlocked] };
            }
          }
          set({ stats: record.stats, match, activeQuick: null });
        }
        return { ...record, matchOver };
      },

      resetStats: () => set({ stats: createStats(), activeDaily: null, match: null, activeQuick: null }),
    }),
    { name: 'wordoff-profile', storage: deviceStorage, version: 1 },
  ),
);

