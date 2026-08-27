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

export function Keyboard({ keys, disabled, onLetter, onFire, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {ROWS.map((row, r) => (
        <View key={row} style={styles.row}>
          {r === 2 && <Key label="FIRE" value="fire" flex={1.6} disabled={disabled} onPress={onFire} a11y="Fire guess" />}
          {row.split('').map((l) => (
            <Key key={l} label={l.toUpperCase()} value={l} mark={keys[l]} disabled={disabled} onPress={onLetter} />
          ))}
          {r === 2 && <Key label="⌫" value="back" flex={1.6} disabled={disabled} onPress={onBack} a11y="Delete letter" />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingHorizontal: 8 },
  row: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  key: { height: 56, borderRadius: radius.key, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '700' },
});
