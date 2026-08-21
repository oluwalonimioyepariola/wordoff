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

export function Board({ rows, totalRows, current, currentLocked, revealingRow, shakeKey, hint, celebrate, tileSize }: Props) {
  const { c } = useTheme();
  const currentIndex = rows.length;

  return (
    <View style={styles.board} accessibilityLabel="Your board">
      {Array.from({ length: totalRows }, (_, r) => {
        const row = rows[r];
        const isCurrent = r === currentIndex && current !== null;
        const isSuddenDeathRow = hint !== null && r === totalRows - 1;
        const solved = row && isSolved(row.marks);
        return (
          <ShakeRow key={r} shakeKey={isCurrent ? shakeKey : null} lifted={isCurrent && currentLocked}>
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
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
              const showHint = isSuddenDeathRow && !typed && hint!.index === i;
              return <Tile key={i} size={tileSize} letter={showHint ? hint!.letter : typed} hint={showHint} />;
            })}
          </ShakeRow>
        );
      })}
    </View>
  );
}
