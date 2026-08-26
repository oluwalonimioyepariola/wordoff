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
const Key = memo(function Key({ label, value, flex = 1, mark, disabled, a11y, onPress }: KeyProps) {
  const { markColor } = useTheme();
  const { bg, fg } = markColor(mark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      disabled={disabled}
      onPress={() => onPress(value)}
      style={({ pressed }) => [styles.key, { flex, backgroundColor: bg, opacity: disabled ? 0.55 : pressed ? 0.7 : 1 }]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
});
