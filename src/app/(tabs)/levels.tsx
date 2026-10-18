import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Portrait } from '../../art';
import { Icon } from '../../components/ui';
import { PaperWear } from '../../components/WantedPoster';
import { getOpponent, LEVEL_COUNT, LevelDef, LEVELS, totalStars } from '../../engine';
import { LightStatusBar, StatusScrim } from '../../game/statusBar';
import { useProfile } from '../../store/profile';
import { fonts, space, useTheme } from '../../theme';

const PAPER = '#f1e1bf';
const INK = '#24160c';
const INK_SOFT = '#6a4c33';
const TRAIL = '#8a5a32';

/** Vertical gap between stops, and the stop disc size. */
const STEP = 92;
const STOP = 52;

/** x of each stop across the map: the trail winds left and right. */
const WIND = [0.3, 0.62, 0.7, 0.42, 0.2, 0.28, 0.6, 0.72, 0.45, 0.25];

function Stop({ level, x, y, state, stars, labelLeft }: { level: LevelDef; x: number; y: number; state: 'done' | 'current' | 'locked'; stars: number; labelLeft: boolean }) {
  const { c } = useTheme();
  const boss = level.boss;
  const size = boss ? STOP + 12 : STOP;
  const fill = state === 'current' ? c.brass : state === 'done' ? '#f8edd6' : '#d9c39c';
  const ring = state === 'current' ? '#7a5310' : boss ? c.rival : state === 'done' ? INK : '#b89a6e';
  return (
    <Pressable
      disabled={state === 'locked'}
      accessibilityRole="button"
      accessibilityLabel={`Level ${level.id}, ${level.title}${state === 'locked' ? ', locked' : `, ${stars} stars`}`}
      onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(level.id) } })}
      style={({ pressed }) => [
        styles.stopWrap,
        // The name sits beside the stop, on the side away from the trail's next bend.
        labelLeft
          ? { right: undefined, left: x - size / 2 - 128, flexDirection: 'row-reverse' }
          : { left: x - size / 2, flexDirection: 'row' },
        { top: y - size / 2, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      <View
        style={[
          styles.stop,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: fill,
            borderColor: ring,
            borderWidth: boss ? 3.5 : 2.5,
          },
          state === 'current' && styles.stopGlow,
        ]}
      >
        {state === 'locked' ? (
          <Icon name="lock" size={18} color="#a88a5e" />
        ) : boss ? (
          <Icon name="skull-crossbones" size={22} color={state === 'current' ? '#2a160d' : c.rival} />
        ) : (
          <Text style={[styles.stopNum, { color: state === 'current' ? '#2a160d' : INK }]}>{level.id}</Text>
        )}
      </View>
      <View style={[styles.label, { alignItems: labelLeft ? 'flex-end' : 'flex-start' }]}>
        <Text numberOfLines={1} style={[styles.stopTitle, { color: state === 'locked' ? '#a88a5e' : INK }]}>
          {level.title}
        </Text>
        <View style={styles.stars}>
          {[0, 1, 2].map((i) => (
            <Icon key={i} name="star-four-points" size={11} color={i < stars ? c.brass : state === 'locked' ? 'transparent' : '#c9b08a'} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

/** One chapter of the trail: banner, the winding path, and its ten stops. */
function Chapter({ levels, width, unlocked, stars }: { levels: LevelDef[]; width: number; unlocked: number; stars: Record<number, number> }) {
  const { c } = useTheme();
  const first = levels[0];
  const rival = getOpponent(first.opponent);
  const open = first.id <= unlocked;
  const pad = 40;
  const pts = levels.map((_, i) => ({ x: pad + WIND[i] * (width - pad * 2), y: 40 + i * STEP }));
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x} ${p.y}`;
    const q = pts[i - 1];
    const my = (q.y + p.y) / 2;
    return `${acc} C${q.x} ${my} ${p.x} ${my} ${p.x} ${p.y}`;
  }, '');
  const height = 40 + (levels.length - 1) * STEP + 50;
  return (
    <View style={{ opacity: open ? 1 : 0.72 }}>
      <View style={styles.banner}>
        <Portrait who={rival.id} size={50} ring={open ? c.brass : '#b89a6e'} />
        <View style={{ flex: 1 }}>
          <Text style={styles.chapterName}>{first.chapterName}</Text>
          <Text style={styles.chapterMeta}>
            vs {rival.name} · {first.wordLength}-letter {first.tier} words
          </Text>
        </View>
        {!open && <Icon name="lock" size={20} color={INK_SOFT} />}
      </View>
      <View style={{ height }}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path d={d} stroke={TRAIL} strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" fill="none" opacity={0.75} />
        </Svg>
        {levels.map((l, i) => (
          <Stop
            key={l.id}
            level={l}
            x={pts[i].x}
            y={pts[i].y}
            state={l.id > unlocked ? 'locked' : l.id === unlocked ? 'current' : 'done'}
            stars={stars[l.id] ?? 0}
            labelLeft={WIND[i] > 0.5}
          />
        ))}
      </View>
    </View>
  );
}

/** The trail, as a hand-drawn map pinned to the wall. */
export default function TrailMap() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const stats = useProfile((s) => s.stats);
  const { unlocked, stars } = stats.levels;
  const [sheetH, setSheetH] = useState(0);
  const sheetW = width - space.base * 2;
  const inner = sheetW - space.base * 2;
  const chapters = [1, 2, 3].map((n) => LEVELS.filter((l) => l.chapter === n));
  const earned = totalStars(stats);

  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <LightStatusBar />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140, alignItems: 'center' }} contentInsetAdjustmentBehavior="never">
        <View style={styles.head}>
          <Text style={styles.title} accessibilityRole="header">
            The Trail
          </Text>
          <View style={styles.tally}>
            <Icon name="star-four-points" size={16} color={c.brass} />
            <Text style={styles.tallyText}>
              {earned}/{LEVEL_COUNT * 3}
            </Text>
          </View>
        </View>

        <View style={[styles.sheet, { width: sheetW }]} onLayout={(e: LayoutChangeEvent) => setSheetH(e.nativeEvent.layout.height)}>
          {sheetH > 0 && <PaperWear width={sheetW} height={sheetH} />}
          <View style={styles.pin} />
          <View style={styles.compass}>
            <Icon name="compass-rose" size={34} color={INK_SOFT} />
          </View>
          <Text style={styles.mapTitle}>Map of the Territory</Text>
          <Text style={styles.mapSub}>Level {Math.min(unlocked, LEVEL_COUNT)} of {LEVEL_COUNT} · tap a stop to ride</Text>
          {chapters.map((levels, i) => (
            <View key={i} style={{ marginTop: space.lg }}>
              <Chapter levels={levels} width={inner} unlocked={unlocked} stars={stars} />
            </View>
          ))}
          <Text style={styles.legend}>Three stars: land the word on your first or second shot.</Text>
        </View>
      </ScrollView>
      <StatusScrim color={c.plank} height={insets.top} width={width} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.md },
  title: { fontFamily: fonts.slab, fontSize: 34, color: '#f3e3c3' },
  tally: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  tallyText: { fontFamily: fonts.slab, fontSize: 16, color: '#f3e3c3' },
  sheet: {
    backgroundColor: PAPER,
    borderRadius: 2,
    padding: space.base,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  pin: { position: 'absolute', top: 11, alignSelf: 'center', width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#3a2416' },
  compass: { position: 'absolute', bottom: 18, right: 18, opacity: 0.45 },
  mapTitle: { fontFamily: fonts.display, fontSize: 21, color: INK, textAlign: 'center', letterSpacing: 1 },
  mapSub: { fontSize: 13, color: INK_SOFT, textAlign: 'center', fontStyle: 'italic', marginTop: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#b89a6e', paddingVertical: space.sm },
  chapterName: { fontFamily: fonts.slab, fontSize: 20, color: INK },
  chapterMeta: { fontSize: 13, color: INK_SOFT },
  stopWrap: { position: 'absolute', alignItems: 'center', gap: 10 },
  label: { width: 118 },
  stop: { alignItems: 'center', justifyContent: 'center' },
  stopGlow: { shadowColor: '#c8962e', shadowOpacity: 0.8, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  stopNum: { fontFamily: fonts.slab, fontSize: 20 },
  stars: { flexDirection: 'row', marginTop: 1 },
  stopTitle: { fontFamily: fonts.slab, fontSize: 14 },
  legend: { fontSize: 12, color: INK_SOFT, fontStyle: 'italic', textAlign: 'center', marginTop: space.sm },
});
