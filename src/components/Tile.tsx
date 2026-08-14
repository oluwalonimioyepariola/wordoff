import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Mark } from '../engine';
import { motion, radius, useTheme } from '../theme';

const LABEL: Record<Mark, string> = { correct: 'correct', present: 'in the word', absent: 'not in the word' };

interface Props {
  letter: string;
  /** Undefined while face down. */
  mark?: Mark;
  /** Flip into the mark with this delay instead of appearing instantly. */
  flipDelay?: number | null;
  /** Hop up after a winning reveal. */
  bounceDelay?: number | null;
  size: number;
  hint?: boolean;
}
