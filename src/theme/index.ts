import { useColorScheme } from 'react-native';
import type { Mark } from '../engine';
import { useSettings } from '../store/settings';

/**
 * Saloon Card Table. Brown baize felt for the duel table, a walnut rail around
 * it, cream card stock for tiles and keys, brass for the primary action and
 * scout chips. The two seats are hard halves: ink navy for you, oxblood for
 * the rival.
 */
const light = {
  // Paper screens (home, lists, settings): aged cream card stock with walnut ink.
  canvas: '#efe3cb',
  surface: '#f8efdd',
  ink: '#2e1d13',
  inkSoft: '#6b5240',
  hairline: '#d8c6a5',
  // The table.
  felt: '#5a3a24',
  feltDeep: '#472d1b',
  feltInk: '#f1e3c6',
  feltInkSoft: '#c9b18c',
  walnut: '#2e1d13',
  walnutInk: '#efe3cb',
  // The plank wall on Main Street.
  plank: '#4f3020',
  plankSeam: '#2e1a10',
  plankGrain: '#5c3a26',
  ember: '#e8742c',
  // Cards (tiles and keys).
  card: '#f6ead2',
  cardEdge: '#cdb48a',
  cardInk: '#2e1d13',
  cardBack: '#7d2a22',
  // The seats.
  you: '#24344f',
  youSoft: '#d7dbe3',
  rival: '#9e2b25',
  rivalSoft: '#f0d6cf',
  // Brass: primary action, scout chips, stars.
  brass: '#b8862b',
  brassDeep: '#8f6519',
  onBrass: '#24170e',
  // Tile results.
  correct: '#4f6b2e',
  present: '#c8962e',
  absent: '#8a7562',
  onCorrect: '#f6ead2',
  onPresent: '#24170e',
  onAbsent: '#f6ead2',
  danger: '#b33a1f',
  dusk: '#2a1a26',
  keyIdle: '#f6ead2',
};

export type Palette = typeof light;

const dark: Palette = {
  ...light,
  canvas: '#1f150e',
  surface: '#2a1d14',
  ink: '#f1e3c6',
  inkSoft: '#c2a985',
  hairline: '#45321f',
  felt: '#3f2818',
  feltDeep: '#2f1d11',
  walnut: '#140d08',
  plank: '#33200f',
  plankSeam: '#1a0f08',
  plankGrain: '#3d2716',
  card: '#eadbbd',
  cardEdge: '#a68b62',
  you: '#4f6fa6',
  youSoft: '#25324a',
  rival: '#d9645a',
  rivalSoft: '#4a1f1b',
  absent: '#6f5d4c',
  keyIdle: '#eadbbd',
};

const colorblind = { correct: '#d4721f', present: '#5d8fc9', onPresent: '#f6ead2' };

export const fonts = {
  display: 'Ultra_400Regular',
  slab: 'ZillaSlab_700Bold',
  slabSemi: 'ZillaSlab_600SemiBold',
};

export const radius = { tile: 6, key: 6, card: 12, panel: 18, button: 14, pill: 999 };
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
      return { bg: c.card, fg: c.cardInk };
    },
  };
}
