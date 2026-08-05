import { useColorScheme } from 'react-native';
import type { Mark } from '../engine';
import { useSettings } from '../store/settings';

/** Tokens from DESIGN.md. */
const light = {
  canvas: '#f9f4f2',
  surface: '#ffffff',
  ink: '#2d2c2b',
  inkSoft: '#63605d',
  hairline: '#e2ded9',
  you: '#0061ef',
  youSoft: '#dce8fd',
  rival: '#d6336c',
  rivalSoft: '#fadbe6',
  correct: '#02873e',
  present: '#ffce00',
  absent: '#8a8580',
  onCorrect: '#ffffff',
  onPresent: '#2d2c2b',
  onAbsent: '#ffffff',
  danger: '#c92a2a',
  dusk: '#3b197f',
  keyIdle: '#e2ded9',
};

export type Palette = typeof light;

const dark: Palette = {
  ...light,
  canvas: '#1b1a19',
  surface: '#262523',
  ink: '#f4efe9',
  inkSoft: '#a8a29b',
  hairline: '#3a3835',
  you: '#4d8ef7',
  youSoft: '#1d2c48',
  rival: '#f06595',
  rivalSoft: '#4a1f30',
  correct: '#2b9a52',
  present: '#e6b800',
  absent: '#4a4744',
  keyIdle: '#3a3835',
};

const colorblind = { correct: '#f5793a', present: '#85c0f9', onPresent: '#2d2c2b' };

export const radius = { tile: 8, key: 8, card: 16, panel: 24, button: 32, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48 };

export const motion = {
  tilePop: 100,
  flipHalf: 220,
  flipStagger: 110,
  shake: 420,
  countdownBeat: 550,
  taunt: 2600,
};

export interface Theme {
  dark: boolean;
  c: Palette;
  reducedMotion: boolean;
  markColor(mark: Mark | undefined): { bg: string; fg: string };
}

export function useTheme(): Theme {
  const system = useColorScheme();
  const { theme, colorblind: cb, reducedMotion } = useSettings();
  const isDark = theme === 'system' ? system === 'dark' : theme === 'dark';
  const c: Palette = { ...(isDark ? dark : light), ...(cb ? colorblind : {}) };
  return {
    dark: isDark,
    c,
    reducedMotion,
    markColor: (mark) => {
      if (mark === 'correct') return { bg: c.correct, fg: c.onCorrect };
      if (mark === 'present') return { bg: c.present, fg: c.onPresent };
      if (mark === 'absent') return { bg: c.absent, fg: c.onAbsent };
      return { bg: c.keyIdle, fg: c.ink };
    },
  };
}
