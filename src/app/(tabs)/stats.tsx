import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portrait } from '../../art';
import { Icon } from '../../components/ui';
import { PaperWear } from '../../components/WantedPoster';
import { dayNumber, getOpponent, OPPONENT_ORDER, streakStatus, totalRecord, winRate } from '../../engine';
import { LightStatusBar, StatusScrim } from '../../game/statusBar';
import { useProfile } from '../../store/profile';
import { fonts, space, useTheme } from '../../theme';

const PAPER = '#f1e1bf';
const INK = '#24160c';
const INK_SOFT = '#6a4c33';
const RULE = '#cdb48a';
const MARGIN = '#b0443a';

/** A ledger section heading: written in the slab, ruled underneath. */
function Section({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.doubleRule} />
    </View>
  );
}

/** One ruled ledger line: an entry on the left, the figure in the right column. */
function Entry({ label, value, strong }: { label: string; value: string | number; strong?: boolean }) {
  return (
    <View style={styles.entry}>
      <Text style={styles.entryLabel}>{label}</Text>
      <View style={styles.leader} />
      <Text style={[styles.entryValue, strong && styles.entryStrong]}>{value}</Text>
    </View>
  );
}

/** The big three at the top of the page, figures in wood type. */
function Headline({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.headline}>
      <Text style={styles.headlineValue}>{value}</Text>
      <Text style={styles.headlineLabel}>{label}</Text>
    </View>
  );
}

/** The sheriff's ledger: every standoff entered by hand on one ruled page. */
export default function Ledger() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { stats, resetStats } = useProfile();
  const [sheetH, setSheetH] = useState(0);
  const sheetW = width - space.base * 2;
  const total = totalRecord(stats);
  const played = total.wins + total.losses + total.draws;
  const maxDist = Math.max(1, ...stats.distribution);
  const streak = streakStatus(stats, dayNumber());

  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <LightStatusBar />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: 140, alignItems: 'center' }} contentInsetAdjustmentBehavior="never">
        <Text style={styles.title} accessibilityRole="header">
          The Ledger
        </Text>

        <View style={[styles.sheet, { width: sheetW }]} onLayout={(e: LayoutChangeEvent) => setSheetH(e.nativeEvent.layout.height)}>
          {sheetH > 0 && <PaperWear width={sheetW} height={sheetH} />}
          {/* the red margin rule of a bookkeeper's page */}
          <View pointerEvents="none" style={styles.margin} />

          <Text style={styles.pageTitle}>Record of Standoffs</Text>
          <View style={styles.headlines}>
            <Headline value={played} label="DUELS" />
            <View style={styles.vRule} />
            <Headline value={`${winRate(total)}%`} label="WON" />
            <View style={styles.vRule} />
            <Headline value={streak.streak} label="DAY STREAK" />
          </View>

          <Section title="The Daily" />
          <Entry label="Standoffs played" value={stats.daily.played} />
          <Entry label="Won" value={`${winRate(stats.daily)}%`} />
          <Entry label="Best streak" value={stats.daily.bestPlayStreak} />
          <Entry label="Win streak (best)" value={`${stats.daily.winStreak} (${stats.daily.bestWinStreak})`} />
          <Entry label="Freezes in hand" value={stats.daily.freezes} />
          <Entry label="Freezes spent" value={stats.daily.freezesUsed} />

          <Section title="Feats" />
          <Entry label="Fastest solve" value={stats.fastestSolveMs ? `${(stats.fastestSolveMs / 1000).toFixed(1)}s` : '—'} strong />
          <Entry label="Best duel run" value={stats.duels.bestWinStreak} />
          <Entry label="Matches won" value={`${stats.matches.wins} of ${stats.matches.played}`} />
          <Entry label="Clean sweeps" value={stats.matches.sweeps} />
          <Entry label="Won in sudden death" value={stats.suddenDeathWins} />
          <Entry label="Won by a hair" value={stats.photoFinishWins} />

          <Section title="Your shots to the word" />
          <View style={{ gap: 6, marginTop: 4 }}>
            {stats.distribution.map((n, i) => (
              <View key={i} style={styles.distRow}>
                <Text style={styles.distLabel}>{i < 6 ? i + 1 : 'SD'}</Text>
                <View style={styles.track}>
                  <View style={[styles.bar, { width: `${Math.max(n ? 10 : 0, (n / maxDist) * 100)}%` }]} />
                  {n === 0 && <View style={styles.emptyTick} />}
                </View>
                <Text style={styles.distCount}>{n}</Text>
              </View>
            ))}
          </View>

          <Section title="Bounty record" />
          {OPPONENT_ORDER.map((id) => {
            const r = stats.vs[id];
            const p = getOpponent(id);
            return (
              <View key={id} style={styles.bounty}>
                <Portrait who={id} size={40} ring={c.brass} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bountyName}>{p.name}</Text>
                  <Text style={styles.bountyMeta}>best run {r.bestStreak}</Text>
                </View>
                <Text style={styles.wld}>
                  <Text style={{ color: c.you }}>{r.wins}W</Text>
                  <Text style={styles.wldSep}> · </Text>
                  <Text style={{ color: c.rival }}>{r.losses}L</Text>
                  <Text style={styles.wldSep}> · </Text>
                  {r.draws}D
                </Text>
              </View>
            );
          })}

          <Pressable onPress={() => router.push('/history')} accessibilityRole="button" style={styles.historyLink}>
            <Icon name="calendar-month-outline" size={18} color={INK} />
            <Text style={styles.historyText}>Turn to the daily history</Text>
            <Icon name="chevron-right" size={18} color={INK} />
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            Alert.alert('Burn the ledger?', 'Stats, streaks, history and badges will be wiped.', [
              { text: 'Keep it', style: 'cancel' },
              { text: 'Burn it', style: 'destructive', onPress: resetStats },
            ])
          }
          accessibilityRole="button"
          hitSlop={8}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset all stats</Text>
        </Pressable>
        <Text style={styles.footnote}>Kept on this device only.</Text>
      </ScrollView>
      <StatusScrim color={c.plank} height={insets.top} width={width} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { alignSelf: 'stretch', paddingHorizontal: space.lg, fontFamily: fonts.slab, fontSize: 34, color: '#f3e3c3', marginBottom: space.md },
  sheet: {
    backgroundColor: PAPER,
    borderRadius: 2,
    paddingLeft: 40,
    paddingRight: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  margin: { position: 'absolute', left: 26, top: 0, bottom: 0, width: 1.5, backgroundColor: MARGIN, opacity: 0.55 },
  pageTitle: { fontFamily: fonts.display, fontSize: 22, color: INK, textAlign: 'center', letterSpacing: 1 },
  headlines: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, marginBottom: space.xs },
  headline: { flex: 1, alignItems: 'center' },
  headlineValue: { fontFamily: fonts.display, fontSize: 30, color: INK, fontVariant: ['tabular-nums'] },
  headlineLabel: { fontFamily: fonts.slab, fontSize: 10, letterSpacing: 2, color: INK_SOFT },
  vRule: { width: 1, height: 38, backgroundColor: RULE },
  section: { marginTop: space.lg, marginBottom: 2 },
  sectionTitle: { fontFamily: fonts.slab, fontSize: 18, color: INK },
  doubleRule: { height: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: INK, marginTop: 3, opacity: 0.7 },
  entry: { flexDirection: 'row', alignItems: 'flex-end', minHeight: 34, borderBottomWidth: 1, borderBottomColor: RULE, paddingBottom: 5, gap: 6 },
  entryLabel: { fontSize: 15, color: INK },
  leader: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#b89a6e', borderStyle: 'dotted', marginBottom: 5 },
  entryValue: { fontFamily: fonts.slab, fontSize: 17, color: INK, fontVariant: ['tabular-nums'] },
  entryStrong: { color: '#9e2b25' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distLabel: { width: 24, fontFamily: fonts.slab, fontSize: 15, color: INK },
  track: { flex: 1, height: 16, justifyContent: 'center' },
  bar: { height: 14, backgroundColor: '#24344f', borderRadius: 2 },
  emptyTick: { width: 6, height: 1.5, backgroundColor: '#b89a6e' },
  distCount: { width: 26, textAlign: 'right', fontFamily: fonts.slab, fontSize: 15, color: INK, fontVariant: ['tabular-nums'] },
  bounty: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: RULE },
  bountyName: { fontFamily: fonts.slab, fontSize: 16, color: INK },
  bountyMeta: { fontSize: 12, color: INK_SOFT },
  wld: { fontFamily: fonts.slab, fontSize: 15, color: INK, fontVariant: ['tabular-nums'] },
  wldSep: { color: '#b89a6e' },
  historyLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.lg, minHeight: 44, borderTopWidth: 1, borderTopColor: RULE },
  historyText: { flex: 1, fontFamily: fonts.slabSemi, fontSize: 16, color: INK },
  reset: { marginTop: space.lg, minHeight: 44, justifyContent: 'center' },
  resetText: { color: '#e0c9a2', fontSize: 14, textDecorationLine: 'underline' },
  footnote: { color: '#a8916c', fontSize: 12 },
});
