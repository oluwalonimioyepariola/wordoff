import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Badge } from '../../art/badges';
import { WoodGrain } from '../../components/FeltTable';
import { ACHIEVEMENTS } from '../../engine';
import { LightStatusBar } from '../../game/statusBar';
import { useProfile } from '../../store/profile';
import { fonts, space } from '../../theme';

const COLUMNS = 3;
const WALNUT = '#24160d';
const CREAM = '#f3e3c3';
const CREAM_SOFT = '#bfa47e';
const BRASS = '#c8962e';

/** A warm glow behind an earned badge, as if a spotlight catches the brass. */
function Glow({ size }: { size: number }) {
  return (
    <Svg pointerEvents="none" width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="g" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#f6c76a" stopOpacity="0.38" />
          <Stop offset="1" stopColor="#f6c76a" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#g)" />
    </Svg>
  );
}

/** An engraved brass nameplate held by two screws. */
function Plaque({ text, earned }: { text: string; earned: boolean }) {
  return (
    <View style={[styles.plaque, earned ? styles.plaqueOn : styles.plaqueOff]}>
      <View style={[styles.screw, { left: 3 }, !earned && styles.screwOff]} />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.plaqueText, { color: earned ? '#3a2109' : '#7a644c' }]}>
        {text}
      </Text>
      <View style={[styles.screw, { right: 3 }, !earned && styles.screwOff]} />
    </View>
  );
}

/** A wooden shelf: a lit front edge with a shadow falling below it. */
function Shelf() {
  return (
    <View style={styles.shelfWrap}>
      <View style={styles.shelfTop} />
      <View style={styles.shelfFront} />
      <View style={styles.shelfShadow} />
    </View>
  );
}

/**
 * The trophy room: a lamplit walnut room, the latest badge in its own
 * spotlight, and every other award on shelves, earned ones in polished brass,
 * the rest as dark blanks. Tap any badge to take it down.
 */
export default function TrophyRoom() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const unlocked = useProfile((s) => s.stats.achievements);
  const earnedList = ACHIEVEMENTS.filter((a) => unlocked[a.id]).sort((a, b) => unlocked[b.id] - unlocked[a.id]);
  const latest = earnedList[0];
  const rest = [...ACHIEVEMENTS.filter((a) => a.id !== latest?.id)].sort(
    (a, b) => (unlocked[a.id] ?? Infinity) - (unlocked[b.id] ?? Infinity),
  );
  const rows: (typeof ACHIEVEMENTS)[] = [];
  for (let i = 0; i < rest.length; i += COLUMNS) rows.push(rest.slice(i, i + COLUMNS));
  const badge = Math.min(84, Math.floor((width - space.base * 2) / COLUMNS) - 26);
  const open = (id: string) => router.push({ pathname: '/award/[id]', params: { id } });
  const pct = earnedList.length / ACHIEVEMENTS.length;

  return (
    <View style={{ flex: 1, backgroundColor: WALNUT }}>
      <LightStatusBar />
      {/* the room: wood grain and a lamp overhead */}
      <WoodGrain lines={22} color="#1a0f08" />
      <Svg pointerEvents="none" width={width} height={520} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="lamp" cx="0.5" cy="0.18" rx="0.8" ry="0.6">
            <Stop offset="0" stopColor="#c98a45" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#c98a45" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={520} fill="url(#lamp)" />
      </Svg>

      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140 }} contentInsetAdjustmentBehavior="never">
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Trophy Room
          </Text>
          <Text style={styles.count}>
            <Text style={styles.countNum}>{earnedList.length}</Text> of {ACHIEVEMENTS.length} badges earned
          </Text>
          {/* the brass rail */}
          <View style={styles.rail} accessibilityLabel={`${Math.round(pct * 100)} percent earned`}>
            <View style={[styles.railFill, { width: `${Math.max(pct * 100, 2)}%` }]} />
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <View key={p} style={[styles.rivet, { left: `${p * 100}%` }]} />
            ))}
          </View>
        </View>

        {latest ? (
          <Pressable
            onPress={() => open(latest.id)}
            accessibilityRole="button"
            accessibilityLabel={`Latest badge: ${latest.name}`}
            style={({ pressed }) => [styles.featured, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <View style={{ width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }}>
              <Glow size={150} />
              <Badge id={latest.id} earned secret={latest.secret} size={108} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.featuredName}>{latest.name}</Text>
              <Text style={styles.featuredDesc}>{latest.description}</Text>
              <Text style={styles.featuredDate}>Earned {new Date(unlocked[latest.id]).toLocaleDateString()}</Text>
            </View>
          </Pressable>
        ) : (
          <Text style={styles.empty}>Win your first standoff to hang a badge here.</Text>
        )}

        {rows.map((row, r) => (
          <View key={r} style={styles.shelfBlock}>
            <View style={styles.row}>
              {row.map((a) => {
                const at = unlocked[a.id];
                const hidden = a.secret && !at;
                return (
                  <Pressable
                    key={a.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${hidden ? 'Secret badge' : a.name}, ${at ? 'earned' : 'locked'}`}
                    onPress={() => open(a.id)}
                    style={({ pressed }) => [styles.cell, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                  >
                    <View style={{ width: badge + 30, height: badge * 1.1 + 10, alignItems: 'center', justifyContent: 'flex-end' }}>
                      {at && <Glow size={badge + 30} />}
                      <Badge id={a.id} earned={!!at} secret={a.secret} size={badge} />
                    </View>
                    <Plaque text={hidden ? '? ? ?' : a.name} earned={!!at} />
                  </Pressable>
                );
              })}
              {Array.from({ length: COLUMNS - row.length }, (_, i) => (
                <View key={`pad${i}`} style={styles.cell} />
              ))}
            </View>
            <Shelf />
          </View>
        ))}
      </ScrollView>
      {/* a soft walnut fade under the status bar so scrolled content never fights the clock */}
      <Svg pointerEvents="none" width={width} height={insets.top + 18} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={WALNUT} stopOpacity="1" />
            <Stop offset="0.7" stopColor={WALNUT} stopOpacity="0.85" />
            <Stop offset="1" stopColor={WALNUT} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={insets.top + 18} fill="url(#scrim)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, gap: 6, marginBottom: space.md },
  title: { fontFamily: fonts.slab, fontSize: 34, color: CREAM },
  count: { fontSize: 15, color: CREAM_SOFT },
  countNum: { fontFamily: fonts.display, fontSize: 20, color: BRASS },
  rail: { height: 8, borderRadius: 4, backgroundColor: '#3a2416', marginTop: space.sm, borderWidth: 1, borderColor: '#4d3220' },
  railFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4, backgroundColor: BRASS },
  rivet: { position: 'absolute', top: -3, width: 12, height: 12, marginLeft: -6, borderRadius: 6, backgroundColor: '#d9ab52', borderWidth: 1.5, borderColor: '#5a3a18' },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.base,
    marginBottom: space.lg,
    padding: space.sm,
    paddingRight: space.base,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: '#5a3a1e',
  },
  featuredName: { fontFamily: fonts.display, fontSize: 22, color: CREAM },
  featuredDesc: { fontSize: 15, color: CREAM_SOFT, lineHeight: 21 },
  featuredDate: { fontFamily: fonts.slabSemi, fontSize: 13, color: BRASS, marginTop: 2 },
  empty: { color: CREAM_SOFT, textAlign: 'center', fontSize: 15, marginBottom: space.lg, paddingHorizontal: space.lg },
  shelfBlock: { marginBottom: space.lg },
  row: { flexDirection: 'row', paddingHorizontal: space.sm },
  cell: { flex: 1, alignItems: 'center', gap: 8 },
  plaque: { minWidth: 76, maxWidth: '96%', paddingHorizontal: 14, paddingVertical: 3, borderRadius: 3, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  plaqueOn: { backgroundColor: '#c8962e', borderColor: '#f0c56a' },
  plaqueOff: { backgroundColor: '#2e1d12', borderColor: '#4a3020' },
  plaqueText: { fontFamily: fonts.slab, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase' },
  screw: { position: 'absolute', top: '50%', width: 4, height: 4, marginTop: -2, borderRadius: 2, backgroundColor: '#7a5310' },
  screwOff: { backgroundColor: '#4a3020' },
  shelfWrap: { marginTop: 4, marginHorizontal: space.xs },
  shelfTop: { height: 5, backgroundColor: '#6e4628', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  shelfFront: { height: 9, backgroundColor: '#4a2d18', borderBottomWidth: 1, borderBottomColor: '#a06a3c' },
  shelfShadow: { height: 12, backgroundColor: '#000', opacity: 0.28, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginHorizontal: 6 },
});
