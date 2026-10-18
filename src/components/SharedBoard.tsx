import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
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

/**
 * A seat chip: a real poker chip in the seat's colour, notched edge and inlaid
 * centre, marking who fires a row. Rows still to come show it ghosted.
 */
export function SeatChip({ owner, label, size, active }: { owner: PlayerId; label: string; size: number; active: boolean }) {
  const { c } = useTheme();
  const color = owner === 'you' ? c.you : c.rival;
  const notches = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  return (
    <View accessibilityLabel={owner === 'you' ? 'Your row' : 'Rival row'} style={{ width: size, height: size, opacity: active ? 1 : 0.38 }}>
      <Svg width={size} height={size} viewBox="0 0 40 40">
        <Circle cx={20} cy={21} r={19} fill="#000" opacity={0.35} />
        <Circle cx={20} cy={20} r={19} fill={color} />
        {notches.map((deg) => (
          <Rect key={deg} x={18} y={1} width={4} height={6} rx={1} fill="#f1e3c6" transform={`rotate(${deg} 20 20)`} />
        ))}
        <Circle cx={20} cy={20} r={12.5} fill={color} stroke="#f1e3c6" strokeWidth={1.2} strokeDasharray="2 2" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#f6ead2', fontFamily: fonts.slab, fontSize: size * 0.27 }}>{label}</Text>
      </View>
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
  const chip = Math.max(28, Math.round(tileSize * 0.56));

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
});
