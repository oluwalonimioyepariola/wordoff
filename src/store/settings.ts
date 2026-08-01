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
