import { StyleSheet, Text, View } from 'react-native';
import { DuelRow, WORD_LENGTH } from '../engine';
import { useTheme } from '../theme';

interface Props {
  rows: DuelRow[];
  totalRows: number;
  cell?: number;
  /** Letters stay hidden during play; they're only shown once the duel is over. */
  showLetters?: boolean;
  /** While the rival aims, how many letters of its next row are "typed" (0–5). */
  typing?: number | null;
}

/** The rival's board: colors only during play, never letters. */
export function RivalBoard({ rows, totalRows, cell = 14, showLetters = false, typing = null }: Props) {
  const { c, markColor } = useTheme();
  return (
    <View style={styles.grid} accessibilityLabel={`Rival has used ${rows.length} of ${totalRows} rows`}>
      {Array.from({ length: totalRows }, (_, r) => {
        const row = rows[r];
        const aimingRow = typing !== null && r === rows.length;
        return (
          <View key={r} style={styles.row}>
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const mark = row?.marks?.[i];
              const blank = row && row.guess === null;
              const typed = aimingRow && i < (typing ?? 0);
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    { width: cell, height: cell },
                    mark
                      ? { backgroundColor: markColor(mark).bg }
                      : typed
                        ? { backgroundColor: c.rivalSoft, borderWidth: 1, borderColor: c.rival }
                        : { borderWidth: 1, borderColor: c.hairline, borderStyle: blank ? 'dashed' : 'solid' },
                  ]}
                >
                  {showLetters && row?.guess && (
                    <Text style={{ color: markColor(mark).fg, fontSize: cell * 0.62, fontWeight: '800', width: cell, textAlign: 'center' }}>
                      {row.guess[i].toUpperCase()}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 3 },
  row: { flexDirection: 'row', gap: 3 },
  cell: { borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
});
