import { StyleSheet, Text, View } from 'react-native';
import { PlayerId, Shot, SuddenDeathHint } from '../engine';
import { motion, useTheme } from '../theme';
import { Tile } from './Tile';

interface Props {
  shots: Shot[];
  totalRows: number;
  length: number;
  /** Who fires each row (from the engine's rowOwners). */
  owners: PlayerId[];
  /** What you're typing (on your turn). */
  input: string | null;
  /** What the rival is typing (on its turn). */
  rivalTyping: string | null;
  revealingRow: number | null;
  hints: SuddenDeathHint[];
  rivalInitial: string;
  tileSize: number;
  celebrate?: boolean;
}

/**
 * One board, taking turns. Each row carries a marker for who fired it:
 * blue "You" or the rival's pink initial. Every guess is visible to both.
 */
export function SharedBoard({
  shots,
  totalRows,
  length,
  owners,
  input,
  rivalTyping,
  revealingRow,
  hints,
  rivalInitial,
  tileSize,
  celebrate = false,
}: Props) {
  const { c } = useTheme();
  const marker = Math.max(22, tileSize * 0.5);

  return (
    <View style={styles.board} accessibilityLabel="Shared board">
      {Array.from({ length: totalRows }, (_, r) => {
        const shot = shots[r];
        const owner: PlayerId = shot?.by ?? owners[r] ?? 'you';
        const isCurrent = r === shots.length;
        const ownerColor = owner === 'you' ? c.you : c.rival;
        const active = isCurrent && (owner === 'you' ? input !== null : rivalTyping !== null);
        return (
          <View key={r} style={styles.row}>
            <View
              style={[
                styles.marker,
                {
                  width: marker,
                  height: marker,
                  borderRadius: marker / 2,
                  backgroundColor: shot || active ? ownerColor : 'transparent',
                  borderColor: ownerColor,
                  opacity: shot || active ? 1 : 0.35,
                },
              ]}
              accessibilityLabel={owner === 'you' ? 'Your row' : 'Rival row'}
            >
              <Text style={{ color: shot || active ? '#fff' : ownerColor, fontWeight: '800', fontSize: marker * 0.45 }}>
                {owner === 'you' ? 'You' : rivalInitial}
              </Text>
            </View>
            {Array.from({ length }, (_, i) => {
              if (shot) {
                if (shot.row.guess === null) {
                  return <View key={i} style={[styles.blank, { width: tileSize, height: tileSize, borderColor: c.inkSoft }]} />;
                }
                return (
                  <Tile
                    key={i}
                    size={tileSize}
                    letter={shot.row.guess[i]}
                    mark={shot.row.marks?.[i]}
                    flipDelay={revealingRow === r ? i * motion.flipStagger : null}
                    bounceDelay={celebrate && r === shots.length - 1 ? i * 80 : null}
                  />
                );
              }
              if (isCurrent && owner === 'ai' && rivalTyping !== null) {
                return <Tile key={i} size={tileSize} letter={rivalTyping[i] ?? ''} />;
              }
              const typed = isCurrent && owner === 'you' ? (input ?? '')[i] ?? '' : '';
              const hint = isCurrent && owner === 'you' && !typed ? hints.find((h) => h.index === i) : undefined;
              return <Tile key={i} size={tileSize} letter={hint ? hint.letter : typed} hint={!!hint} />;
            })}
            <View style={{ width: marker }} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { gap: 6, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  marker: { borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  blank: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 8 },
});
