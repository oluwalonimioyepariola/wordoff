import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Mark } from '../engine';
import { fonts, radius, useTheme } from '../theme';

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
  kind?: 'letter' | 'fire' | 'back';
  disabled: boolean;
  a11y?: string;
  onPress(value: string): void;
}

// Defined at module level (and memoized) so keys aren't remounted on every
// render, which would drop taps that land mid-render during fast typing.
const Key = memo(function Key({ label, value, flex = 1, mark, kind = 'letter', disabled, a11y, onPress }: KeyProps) {
  const { c, markColor } = useTheme();
  const scored = markColor(mark);
  const bg = kind === 'fire' ? c.brass : kind === 'back' ? c.cardEdge : scored.bg;
  const fg = kind === 'fire' ? c.onBrass : kind === 'back' ? c.cardInk : scored.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y ?? label}
      disabled={disabled}
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.key,
        {
          flex,
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
          transform: [{ translateY: pressed ? 2 : 0 }],
          shadowOpacity: pressed ? 0 : 0.45,
        },
      ]}
    >
      {kind === 'back' ? (
        <MaterialCommunityIcons name="backspace-outline" size={22} color={fg} />
      ) : (
        <Text style={[kind === 'fire' ? styles.fire : styles.label, { color: fg }]}>{label}</Text>
      )}
    </Pressable>
  );
});

/** Cream card-stock keys on the walnut rail; FIRE is the one brass key. */
export function Keyboard({ keys, disabled, onLetter, onFire, onBack }: Props) {
  const { c } = useTheme();
  return (
    <View style={[styles.rail, { backgroundColor: c.walnut }]}>
      {ROWS.map((row, r) => (
        <View key={row} style={styles.row}>
          {r === 2 && <Key label="FIRE" value="fire" kind="fire" flex={1.7} disabled={disabled} onPress={onFire} a11y="Fire guess" />}
          {row.split('').map((l) => (
            <Key key={l} label={l.toUpperCase()} value={l} mark={keys[l]} disabled={disabled} onPress={onLetter} />
          ))}
          {r === 2 && <Key label="Delete" value="back" kind="back" flex={1.5} disabled={disabled} onPress={onBack} a11y="Delete letter" />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { gap: 8, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 },
  row: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  key: {
    height: 54,
    borderRadius: radius.key,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontFamily: fonts.slab, fontSize: 19 },
  fire: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 1 },
});
