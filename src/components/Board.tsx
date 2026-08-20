import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { DuelRow, isSolved, SuddenDeathHint, WORD_LENGTH } from '../engine';
import { motion, useTheme } from '../theme';
import { Tile } from './Tile';

interface Props {
  rows: DuelRow[];
  totalRows: number;
  /** Letters being typed (string) or locked in and waiting (string, dimmed). */
  current: string | null;
  currentLocked: boolean;
  revealingRow: number | null;
  shakeKey: number | null;
  hint: SuddenDeathHint | null;
  celebrate: boolean;
  tileSize: number;
}
