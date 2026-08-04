import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deviceStorage } from './storage';

export type ThemePref = 'system' | 'light' | 'dark';
export type ShotClock = null | 20 | 30 | 60;

export interface Settings {
  hardMode: boolean;
  /** Seconds per guess, or null for no shot clock. */
  shotClock: ShotClock;
  colorblind: boolean;
  reducedMotion: boolean;
  haptics: boolean;
  taunts: boolean;
  theme: ThemePref;
  seenHowTo: boolean;
}

interface SettingsStore extends Settings {
  set<K extends keyof Settings>(key: K, value: Settings[K]): void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      hardMode: false,
      shotClock: null,
      colorblind: false,
      reducedMotion: false,
      haptics: true,
      taunts: true,
      theme: 'system',
      seenHowTo: false,
      set: (key, value) => set({ [key]: value } as Partial<Settings>),
    }),
    { name: 'wordoff-settings', storage: deviceStorage, version: 1 },
  ),
);
