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
