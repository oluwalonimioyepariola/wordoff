import { StyleSheet, Text, View } from 'react-native';
import { Card, P, Screen } from '../components/ui';
import { dateForDayNumber, dayNumber, getOpponent } from '../engine';
import { useProfile } from '../store/profile';
import { useTheme } from '../theme';

const DAYS_SHOWN = 35;

/** The last five weeks of Daily Standoffs, as a calendar strip plus a list. */
export default function HistoryScreen() {
  const { c } = useTheme();
  const history = useProfile((s) => s.stats.daily.history);
  const today = dayNumber();
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => today - DAYS_SHOWN + 1 + i).filter((d) => d >= 1);
  const records = Object.values(history).sort((a, b) => b.day - a.day);

  const color = (day: number) => {
    const r = history[day];
    if (!r) return c.hairline;
    return r.result === 'win' ? c.correct : r.result === 'loss' ? c.rival : c.present;
  };

  return (
    <Screen title="History">
      <Card>
        <View style={styles.calendar}>
          {days.map((d) => (
            <View
              key={d}
              accessibilityLabel={`Day ${d}: ${history[d]?.result ?? 'not played'}`}
              style={[styles.day, { backgroundColor: color(d), borderColor: d === today ? c.ink : 'transparent' }]}
            >
              <Text style={{ fontSize: 10, color: history[d] ? '#fff' : c.inkSoft }}>{dateForDayNumber(d).getDate()}</Text>
            </View>
          ))}
        </View>
        <P soft>Green: won · Pink: lost · Yellow: draw</P>
      </Card>

      {records.length === 0 && <P soft center>No daily standoffs yet. Today’s is waiting.</P>}
      {records.map((r) => (
        <Card key={r.day} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.ink, fontWeight: '700' }}>
              #{r.day} · {r.answer.toUpperCase()}
            </Text>
            <Text style={{ color: c.inkSoft }}>
              {dateForDayNumber(r.day).toLocaleDateString()} vs {getOpponent(r.opponent).name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: r.result === 'win' ? c.correct : r.result === 'loss' ? c.rival : c.ink, fontWeight: '800' }}>
              {r.result.toUpperCase()}
            </Text>
            <Text style={{ color: c.inkSoft, fontSize: 12 }}>
              you {r.yourSolvedRow ?? 'X'} · rival {r.aiSolvedRow ?? 'X'}
            </Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  day: { width: 32, height: 32, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
