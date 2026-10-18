import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PosterPortrait } from '../art';
import type { OpponentProfile } from '../engine';
import { fonts, useTheme } from '../theme';
import { Icon } from './ui';

const PAPER = '#f1e1bf';
const INK = '#24160c';
const INK_SOFT = '#6a4c33';

interface Props {
  rival: OpponentProfile;
  day: number;
  /** Set once today's standoff is played. */
  verdict: { text: string; won: boolean; answer: string; next: string } | null;
  resumeRow: number | null;
  onDraw(): void;
  onShare?: () => void;
  width: number;
}

/** Aged paper: darkened edges, a torn top corner, a faint ring where a cup sat. */
export function PaperWear({ width, height }: { width: number; height: number }) {
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="age" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#8a5a2c" stopOpacity="0" />
          <Stop offset="1" stopColor="#7a4a22" stopOpacity="0.38" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#age)" />
      <Circle cx={width * 0.8} cy={height * 0.74} r={34} fill="none" stroke="#9a6e3c" strokeWidth={2.5} opacity={0.16} />
      <Circle cx={width * 0.8} cy={height * 0.74} r={30} fill="none" stroke="#9a6e3c" strokeWidth={1} opacity={0.1} />
      {/* the torn corner shows the wall behind */}
      <Path d={`M${width - 34} 0 L${width} 0 L${width} 30 L${width - 8} 18 L${width - 18} 14 L${width - 22} 6 Z`} fill="#4a2e1c" />
    </Svg>
  );
}

/**
 * Today's Daily Standoff as a wanted poster nailed to the wall: the rival's
 * sepia portrait, almost no words, and the action stamped on as a brass seal.
 */
export function WantedPoster({ rival, day, verdict, resumeRow, onDraw, onShare, width }: Props) {
  const { c } = useTheme();
  const height = verdict ? 470 : 446;
  const stampInk = verdict?.won ? c.you : c.rival;

  return (
    <View style={[styles.poster, { width, height }]}>
      <PaperWear width={width} height={height} />
      <View style={[styles.nail, { backgroundColor: '#3a2416' }]} />

      <Text style={styles.wanted} accessibilityRole="header">
        WANTED
      </Text>
      <Text style={styles.kickerLine}>DAILY STANDOFF · No. {day}</Text>

      <View style={styles.frameOuter}>
        <View style={styles.frameInner}>
          <PosterPortrait who={rival.id} size={150} />
          {/* sepia wash over the print */}
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#7a4a22', opacity: 0.16 }]} />
        </View>
        {verdict && (
          <View style={[styles.stamp, { borderColor: stampInk }]}>
            <Text style={[styles.stampText, { color: stampInk }]}>{verdict.text}</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{rival.name.toUpperCase()}</Text>
      <Text style={styles.alias}>alias “{rival.title}”</Text>

      {verdict ? (
        <View style={styles.after}>
          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Text style={styles.answer}>{verdict.answer}</Text>
            <View style={styles.rule} />
          </View>
          <Text style={styles.next}>Next poster goes up in {verdict.next}</Text>
          {onShare && (
            <Pressable onPress={onShare} accessibilityRole="button" style={styles.shareLink} hitSlop={8}>
              <Icon name="share-variant" size={16} color={INK} />
              <Text style={styles.shareText}>Share your card</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={resumeRow ? `Resume the standoff at row ${resumeRow}` : `Draw on ${rival.name}`}
          onPress={onDraw}
          style={({ pressed }) => [styles.seal, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        >
          <View style={styles.sealInner}>
            <Icon name="pistol" size={20} color="#2a160d" />
            <Text style={styles.sealText}>{resumeRow ? `RESUME · ROW ${resumeRow}` : 'DRAW'}</Text>
          </View>
        </Pressable>
      )}
      <Text style={styles.footnote}>Same word and same rival for everyone today.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  poster: {
    backgroundColor: PAPER,
    borderRadius: 2,
    alignItems: 'center',
    paddingTop: 26,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  nail: { position: 'absolute', top: 10, width: 9, height: 9, borderRadius: 4.5 },
  wanted: { fontFamily: fonts.display, fontSize: 54, color: INK, letterSpacing: 5, lineHeight: 60 },
  kickerLine: { fontFamily: fonts.slab, fontSize: 12, color: INK_SOFT, letterSpacing: 3, marginTop: -2 },
  frameOuter: { marginTop: 14, padding: 3, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  frameInner: { borderWidth: 1, borderColor: INK, overflow: 'hidden' },
  stamp: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    transform: [{ rotate: '-14deg' }],
    backgroundColor: 'rgba(241,225,191,0.55)',
  },
  stampText: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 1.5 },
  name: { fontFamily: fonts.slab, fontSize: 20, color: INK, letterSpacing: 3, marginTop: 12 },
  alias: { fontSize: 14, color: INK_SOFT, fontStyle: 'italic', marginTop: 1 },
  seal: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: '#c8962e',
    borderRadius: 6,
    padding: 3,
    shadowColor: '#3a2109',
    shadowOpacity: 0.4,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  sealInner: {
    minHeight: 46,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#7a5310',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sealText: { fontFamily: fonts.display, fontSize: 18, color: '#2a160d', letterSpacing: 3 },
  after: { alignSelf: 'stretch', alignItems: 'center', marginTop: 12, gap: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: '#b89a6e' },
  answer: { fontFamily: fonts.slab, fontSize: 22, color: INK, letterSpacing: 5 },
  next: { color: INK_SOFT, fontSize: 13, fontVariant: ['tabular-nums'] },
  shareLink: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40 },
  shareText: { fontFamily: fonts.slabSemi, fontSize: 15, color: INK, textDecorationLine: 'underline' },
  footnote: { position: 'absolute', bottom: 12, fontSize: 11, color: INK_SOFT, fontStyle: 'italic' },
});
