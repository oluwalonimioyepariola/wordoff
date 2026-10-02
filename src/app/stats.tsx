import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, H, P, Screen } from '../components/ui';
import { dayNumber, getOpponent, OPPONENT_ORDER, streakStatus, totalRecord, winRate } from '../engine';
import { useProfile } from '../store/profile';
import { useTheme } from '../theme';

export default function StatsScreen() {
  const { c } = useTheme();
  const { stats, resetStats } = useProfile();
  const total = totalRecord(stats);
  const played = total.wins + total.losses + total.draws;
  const maxDist = Math.max(1, ...stats.distribution);
  const streak = streakStatus(stats, dayNumber());

  const Stat = ({ value, label }: { value: string | number; label: string }) => (
    <View style={styles.stat}>
      <Text style={[styles.value, { color: c.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: c.inkSoft }]}>{label}</Text>
    </View>
  );

  return (
    <Screen title="Stats">
      <Card>
        <H>Daily Standoff</H>
        <View style={styles.grid}>
          <Stat value={stats.daily.played} label="Played" />
          <Stat value={`${winRate(stats.daily)}%`} label="Win rate" />
          <Stat value={streak.streak} label="Streak" />
          <Stat value={stats.daily.bestPlayStreak} label="Best streak" />
          <Stat value={stats.daily.winStreak} label="Win streak" />
          <Stat value={stats.daily.bestWinStreak} label="Best wins" />
          <Stat value={stats.daily.freezes} label="Freezes" />
          <Stat value={stats.daily.freezesUsed} label="Freezes used" />
        </View>
      </Card>

      <Card>
        <H>All standoffs</H>
        <View style={styles.grid}>
          <Stat value={played} label="Played" />
          <Stat value={`${winRate(total)}%`} label="Win rate" />
          <Stat value={stats.duels.bestWinStreak} label="Best duel run" />
          <Stat value={stats.fastestSolveMs ? `${(stats.fastestSolveMs / 1000).toFixed(1)}s` : '–'} label="Fastest solve" />
          <Stat value={`${stats.matches.wins}/${stats.matches.played}`} label="Matches won" />
          <Stat value={stats.matches.sweeps} label="Sweeps" />
          <Stat value={stats.suddenDeathWins} label="Sudden death wins" />
          <Stat value={stats.photoFinishWins} label="Photo finishes" />
        </View>
      </Card>

      <Card>
        <H>Your solves</H>
        {stats.distribution.map((n, i) => (
          <View key={i} style={styles.distRow}>
            <Text style={{ color: c.ink, width: 28, fontWeight: '700' }}>{i < 6 ? i + 1 : 'SD'}</Text>
            <View style={[styles.bar, { width: `${Math.max(8, (n / maxDist) * 100)}%`, backgroundColor: n ? c.you : c.hairline }]}>
              <Text style={styles.barText}>{n}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card>
        <H>Head to head</H>
        {OPPONENT_ORDER.map((id) => {
          const r = stats.vs[id];
          return (
            <View key={id} style={styles.vsRow}>
              <Text style={{ color: c.ink, fontWeight: '700', flex: 1 }}>{getOpponent(id).name}</Text>
              <Text style={{ color: c.inkSoft }}>
                {r.wins}W · {r.losses}L · {r.draws}D · best run {r.bestStreak}
              </Text>
            </View>
          );
        })}
      </Card>

      <Button
        kind="secondary"
        label="Reset all stats"
        onPress={() =>
          Alert.alert('Reset everything?', 'Stats, streaks, history and achievements will be wiped.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: resetStats },
          ])
        }
      />
      <P soft center>Everything is stored on this device only.</P>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  stat: { width: '25%', paddingVertical: 8, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 11, textAlign: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bar: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'flex-end' },
  barText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  vsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
});
