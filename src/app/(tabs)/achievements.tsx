import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge } from '../../art/badges';
import { ACHIEVEMENTS } from '../../engine';
import { useProfile } from '../../store/profile';
import { fonts, radius, space, useTheme } from '../../theme';

const COLUMNS = 3;

/**
 * The Trophy Wall: every award as a badge hung on a walnut board, earned ones
 * in polished brass, the rest as dark blanks. Tap a badge to take it down and
 * read it.
 */
export default function TrophyWall() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const unlocked = useProfile((s) => s.stats.achievements);
  const earned = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
  const boardPad = space.md;
  const BORDER = 3;
  const cell = Math.floor((width - space.base * 2 - boardPad * 2 - BORDER * 2) / COLUMNS);
  const badge = Math.min(92, cell - 18);
  // One cell: vertical padding + badge + gap + nameplate.
  const rowH = space.sm * 2 + badge * 1.1 + 6 + 20;
  // Earned first, in unlock order; then the rest as listed.
  const order = [...ACHIEVEMENTS].sort((a, b) => {
    const ua = unlocked[a.id] ?? Infinity;
    const ub = unlocked[b.id] ?? Infinity;
    return ua - ub;
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <ScrollView contentContainerStyle={styles.scroll} contentInsetAdjustmentBehavior="automatic">
        <Text style={[styles.title, { color: c.ink }]} accessibilityRole="header">
          Trophy Wall
        </Text>
        <View style={styles.tallyRow}>
          <Text style={[styles.tally, { color: c.ink }]}>
            {earned} <Text style={{ color: c.inkSoft }}>of {ACHIEVEMENTS.length} badges earned</Text>
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: c.hairline }]}>
          <View style={[styles.fill, { backgroundColor: c.brass, width: `${(earned / ACHIEVEMENTS.length) * 100}%` }]} />
        </View>

        <View style={[styles.board, { backgroundColor: c.walnut, padding: boardPad }]}>
          {/* plank seams */}
          {Array.from({ length: Math.ceil(order.length / COLUMNS) }, (_, r) => (
            <View key={r} pointerEvents="none" style={[styles.seam, { top: boardPad + (r + 1) * rowH - 1 }]} />
          ))}
          <View style={styles.grid}>
            {order.map((a) => {
              const at = unlocked[a.id];
              const hidden = a.secret && !at;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${hidden ? 'Secret badge' : a.name}, ${at ? 'earned' : 'locked'}`}
                  onPress={() => router.push({ pathname: '/award/[id]', params: { id: a.id } })}
                  style={({ pressed }) => [styles.cell, { transform: [{ scale: pressed ? 0.96 : 1 }] }]}
                >
                  <Badge id={a.id} earned={!!at} secret={a.secret} size={badge} />
                  <View style={[styles.plate, { backgroundColor: at ? c.brass : '#3a281b', borderColor: at ? c.brassDeep : '#2a1c12' }]}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.plateText, { color: at ? c.onBrass : '#8a7562' }]}>
                      {hidden ? '? ? ?' : a.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.base, gap: space.sm, paddingBottom: space.xxl },
  title: { fontFamily: fonts.slab, fontSize: 34, marginTop: space.sm },
  tallyRow: { flexDirection: 'row', alignItems: 'center' },
  tally: { fontFamily: fonts.slab, fontSize: 18 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: space.sm },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  board: { borderRadius: radius.panel, borderWidth: 3, borderColor: '#1a110a', overflow: 'hidden' },
  seam: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#1a110a', opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // Percentage width: exactly three across on every screen size.
  cell: { width: `${100 / COLUMNS}%`, alignItems: 'center', paddingVertical: space.sm, gap: 6, minHeight: 44 },
  plate: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, maxWidth: '92%' },
  plateText: { fontFamily: fonts.slab, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
});
