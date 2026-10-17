import { StyleSheet, Text, View } from 'react-native';
import { PlayerId, Shot, SuddenDeathHint } from '../engine';
import { fonts, motion, useTheme } from '../theme';
import { Tile } from './Tile';

interface Props {
  shots: Shot[];
  totalRows: number;
  length: number;
  /** Who fires each row (from the engine's rowOwners). */
  owners: PlayerId[];
  /** What you're typing (on your turn). */
  input: string | null;
  /** How many cards the rival has dealt face down this turn (on its turn). */
  rivalDealt: number | null;
  revealingRow: number | null;
  hints: SuddenDeathHint[];
  rivalInitial: string;
  tileSize: number;
  celebrate?: boolean;
}

/** A seat chip: a poker chip in the seat's colour, marking who fires a row. */
function SeatChip({ owner, label, size, active }: { owner: PlayerId; label: string; size: number; active: boolean }) {
  const { c } = useTheme();
  const color = owner === 'you' ? c.you : c.rival;
  return (
    <View
      accessibilityLabel={owner === 'you' ? 'Your row' : 'Rival row'}
      style={[
        styles.chip,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? c.feltInk : color,
          opacity: active ? 1 : 0.6,
        },
      ]}
    >
      <Text style={{ color: active ? c.feltInk : c.feltInkSoft, fontFamily: fonts.slab, fontSize: size * 0.34 }}>{label}</Text>
    </View>
  );
}

/**
 * The felt between two seats. Turns alternate; each row carries the chip of
 * whoever fires it. Every card on the felt is visible to both players.
 */
export function SharedBoard({
  shots,
  totalRows,
  length,
  owners,
  input,
  rivalDealt,
  revealingRow,
  hints,
  rivalInitial,
  tileSize,
  celebrate = false,
}: Props) {
  const chip = Math.max(26, Math.round(tileSize * 0.52));

  return (
    <View style={styles.board} accessibilityLabel="Shared board">
      {Array.from({ length: totalRows }, (_, r) => {
        const shot = shots[r];
        const owner: PlayerId = shot?.by ?? owners[r] ?? 'you';
        const isCurrent = r === shots.length;
        const active = !!shot || (isCurrent && (owner === 'you' ? input !== null : rivalDealt !== null));
        return (
          <View key={r} style={styles.row}>
            <SeatChip owner={owner} label={owner === 'you' ? 'YOU' : rivalInitial} size={chip} active={active} />
            {Array.from({ length }, (_, i) => {
              if (shot) {
                if (shot.row.guess === null) return <Tile key={i} size={tileSize} letter="" faceDown />;
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
              if (isCurrent && owner === 'ai' && rivalDealt !== null) {
                return <Tile key={i} size={tileSize} letter="" faceDown={i < rivalDealt} />;
              }
              const typed = isCurrent && owner === 'you' ? (input ?? '')[i] ?? '' : '';
              const hint = isCurrent && owner === 'you' && !typed ? hints.find((h) => h.index === i) : undefined;
              return <Tile key={i} size={tileSize} letter={hint ? hint.letter : typed} hint={!!hint} />;
            })}
            <View style={{ width: chip }} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { gap: 7, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  chip: { borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
});
