import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { DuelRow, isSolved, SuddenDeathHint } from '../engine';
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
  /** Letters revealed to you; shown in the row you're typing until you type over them. */
  hints: SuddenDeathHint[];
  celebrate: boolean;
  tileSize: number;
  length: number;
}

export function Board({ rows, totalRows, current, currentLocked, revealingRow, shakeKey, hints, celebrate, tileSize, length }: Props) {
  const { c } = useTheme();
  const currentIndex = rows.length;

  return (
    <View style={styles.board} accessibilityLabel="Your board">
      {Array.from({ length: totalRows }, (_, r) => {
        const row = rows[r];
        const isCurrent = r === currentIndex && current !== null;
        const solved = row && isSolved(row.marks);
        return (
          <ShakeRow key={r} shakeKey={isCurrent ? shakeKey : null} lifted={isCurrent && currentLocked}>
            {Array.from({ length }, (_, i) => {
              if (row) {
                if (row.guess === null) {
                  return <View key={i} style={[styles.blank, { width: tileSize, height: tileSize, borderColor: c.inkSoft }]} />;
                }
                return (
                  <Tile
                    key={i}
                    size={tileSize}
                    letter={row.guess[i]}
                    mark={row.marks?.[i]}
                    flipDelay={revealingRow === r ? i * motion.flipStagger : null}
                    bounceDelay={celebrate && solved ? i * 80 : null}
                  />
                );
              }
              const typed = isCurrent ? (current ?? '')[i] ?? '' : '';
              const hint = isCurrent && !typed ? hints.find((h) => h.index === i) : undefined;
              return <Tile key={i} size={tileSize} letter={hint ? hint.letter : typed} hint={!!hint} />;
            })}
          </ShakeRow>
        );
      })}
    </View>
  );
}

function ShakeRow({ children, shakeKey, lifted }: { children: React.ReactNode; shakeKey: number | null; lifted: boolean }) {
  const { reducedMotion } = useTheme();
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  useEffect(() => {
    if (shakeKey === null || reducedMotion) return;
    const step = motion.shake / 6;
    x.value = withSequence(
      withTiming(-8, { duration: step }),
      withTiming(8, { duration: step }),
      withTiming(-8, { duration: step }),
      withTiming(8, { duration: step }),
      withTiming(-4, { duration: step }),
      withTiming(0, { duration: step }),
    );
  }, [shakeKey, reducedMotion, x]);

  useEffect(() => {
    y.value = withTiming(lifted ? -2 : 0, { duration: 120 });
  }, [lifted, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }] }));
  return <Animated.View style={[styles.row, style, lifted && { opacity: 0.85 }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  board: { gap: 6, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 6 },
  blank: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 8 },
});
