import { StyleSheet, View } from 'react-native';
import { DuelRow, WORD_LENGTH } from '../engine';
import { useTheme } from '../theme';

/** The rival's board: colors only, never letters. */
export function RivalBoard({ rows, totalRows, cell = 12 }: { rows: DuelRow[]; totalRows: number; cell?: number }) {
  const { c, markColor } = useTheme();
  return (
    <View style={styles.grid} accessibilityLabel={`Rival has used ${rows.length} of ${totalRows} rows`}>
      {Array.from({ length: totalRows }, (_, r) => {
        const row = rows[r];
        return (
          <View key={r} style={styles.row}>
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const mark = row?.marks?.[i];
              const blank = row && row.guess === null;
              return (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    { width: cell, height: cell },
                    mark
                      ? { backgroundColor: markColor(mark).bg }
                      : { borderWidth: 1, borderColor: c.hairline, borderStyle: blank ? 'dashed' : 'solid' },
                  ]}
                />
              );
            })}
          </View>
        );
      })}
    </View>
  );
}
