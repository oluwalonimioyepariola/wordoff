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
  migrateStats,
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
  /** The level duel in progress, if any (resumable like the daily). */
  activeLevel: DuelState | null;

  saveDaily(state: DuelState): void;
  saveQuick(state: DuelState): void;
  saveLevel(state: DuelState | null): void;
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
      activeLevel: null,

      saveDaily: (state) => set({ activeDaily: state }),
      saveQuick: (state) => set({ activeQuick: state }),
      saveLevel: (state) => set({ activeLevel: state }),

      startMatch: (opponent, bestOf) => set({ match: createMatch(opponent, bestOf), activeQuick: null }),
      abandonMatch: () => set({ match: null, activeQuick: null }),

      finishDuel: (state) => {
        const { outcome, config, boards } = state;
        if (!outcome) throw new Error('Duel is not finished');
        let record = recordDuel(get().stats, {
          config,
          outcome,
          you: boards.you,
          ai: boards.ai,
          scoutsUsed: state.scouted?.length ?? 0,
        });
        let matchOver = false;

        if (config.mode === 'daily') {
          set({ stats: record.stats, activeDaily: state });
        } else if (config.mode === 'level') {
          set({ stats: record.stats, activeLevel: null });
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

      resetStats: () =>
        set({ stats: createStats(), activeDaily: null, match: null, activeQuick: null, activeLevel: null }),
    }),
    {
      name: 'wordoff-profile',
      storage: deviceStorage,
      version: 2,
      // v1 had no level mode: add level progress, keep everything else.
      migrate: (saved, version) => {
        const state = (saved ?? {}) as Partial<ProfileStore>;
        if (version < 2) {
          const old = (state.stats ?? {}) as Parameters<typeof migrateStats>[0];
          return { ...state, stats: migrateStats(old), activeLevel: null } as ProfileStore;
        }
        return state as ProfileStore;
      },
    },
  ),
);

