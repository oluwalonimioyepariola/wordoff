import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Mark } from '../engine';
import { radius, useTheme } from '../theme';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

interface Props {
  keys: Record<string, Mark>;
  disabled: boolean;
  onLetter(letter: string): void;
  onFire(): void;
  onBack(): void;
}

interface KeyProps {
  label: string;
  value: string;
  flex?: number;
  mark?: Mark;
  disabled: boolean;
  a11y?: string;
  onPress(value: string): void;
}

// Defined at module level (and memoized) so keys aren't remounted on every
// render, which would drop taps that land mid-render during fast typing.
