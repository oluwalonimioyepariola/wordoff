import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Portrait } from '../art';
import { PAPER_INK, PAPER_INK_SOFT, PAPER_RULE, PaperSheet, PlankScreen } from '../components/PaperPage';
import { dateForDayNumber, dayNumber, getOpponent } from '../engine';
import { useProfile } from '../store/profile';
import { fonts, space, useTheme } from '../theme';

const WEEKS = 5;
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** A day on the calendar: plain numeral, or stamped with the day's verdict. */
function Day({ n, date, result, today }: { n: number | null; date: number; result?: 'win' | 'loss' | 'draw'; today: boolean }) {
  const { c } = useTheme();
  const ink = result === 'win' ? c.you : result === 'loss' ? c.rival : c.brass;
  return (
    <View style={styles.cell} accessibilityLabel={n === null ? undefined : `Day ${n}: ${result ?? 'not played'}`}>
      {n !== null && (
        <View style={[styles.day, today && styles.today]}>
          <Text style={[styles.dayNum, { color: result ? '#b89a6e' : PAPER_INK }]}>{date}</Text>
          {result && (
            <View style={[styles.stamp, { borderColor: ink }]}>
              <Text style={[styles.stampText, { color: ink }]}>{result === 'win' ? 'W' : result === 'loss' ? 'L' : 'D'}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/** Daily history: a stamped calendar of the last five weeks, then every standoff entered in the book. */
export default function HistoryScreen() {
  const { c } = useTheme();
  const history = useProfile((s) => s.stats.daily.history);
  const today = dayNumber();
  // Start on the Monday five weeks back so columns line up with weekdays.
  const todayDate = dateForDayNumber(today);
  const mondayOffset = (todayDate.getDay() + 6) % 7;
  const start = today - mondayOffset - (WEEKS - 1) * 7;
  const cells = Array.from({ length: WEEKS * 7 }, (_, i) => start + i);
  const records = Object.values(history).sort((a, b) => b.day - a.day);
  const wins = records.filter((r) => r.result === 'win').length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Daily History',
          headerStyle: { backgroundColor: c.plank },
          headerTintColor: '#f3e3c3',
          headerTitleStyle: { fontFamily: fonts.slab, fontSize: 19, color: '#f3e3c3' },
        }}
      />
      <PlankScreen topInset={false}>
        <PaperSheet>
          <Text style={styles.sheetTitle}>Standoff Calendar</Text>
          <Text style={styles.sheetSub}>
            {records.length} played · {wins} won · last {WEEKS} weeks below
          </Text>
          <View style={styles.weekdays}>
            {WEEKDAYS.map((d, i) => (
              <Text key={i} style={styles.weekday}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((d) => (
              <Day key={d} n={d >= 1 && d <= today ? d : null} date={dateForDayNumber(d).getDate()} result={history[d]?.result} today={d === today} />
            ))}
          </View>
          <View style={styles.key}>
            {(
              [
                ['W', c.you, 'won'],
                ['L', c.rival, 'lost'],
                ['D', c.brass, 'draw'],
              ] as const
            ).map(([l, col, label]) => (
              <View key={l} style={styles.keyItem}>
                <View style={[styles.keyStamp, { borderColor: col }]}>
                  <Text style={[styles.keyText, { color: col }]}>{l}</Text>
                </View>
                <Text style={styles.keyLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </PaperSheet>

        <PaperSheet tilt={0.6}>
          <Text style={styles.sheetTitle}>The Book</Text>
          {records.length === 0 && <Text style={styles.empty}>No standoffs entered yet. Today’s poster is waiting.</Text>}
          {records.map((r) => {
            const col = r.result === 'win' ? c.you : r.result === 'loss' ? c.rival : c.brass;
            return (
              <View key={r.day} style={styles.entry}>
                <Portrait who={r.opponent} size={38} ring={c.brass} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryTitle}>
                    No. {r.day} · <Text style={{ letterSpacing: 2 }}>{r.answer.toUpperCase()}</Text>
                  </Text>
                  <Text style={styles.entryMeta}>
                    {dateForDayNumber(r.day).toLocaleDateString()} · vs {getOpponent(r.opponent).shortName}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.verdict, { color: col }]}>{r.result === 'win' ? 'WON' : r.result === 'loss' ? 'LOST' : 'DRAW'}</Text>
                  <Text style={styles.entryMeta}>
                    you {r.yourSolvedRow ?? 'X'} · rival {r.aiSolvedRow ?? 'X'}
                  </Text>
                </View>
              </View>
            );
          })}
        </PaperSheet>
      </PlankScreen>
    </>
  );
}

const styles = StyleSheet.create({
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, color: PAPER_INK, textAlign: 'center', letterSpacing: 1 },
  sheetSub: { fontSize: 13, color: PAPER_INK_SOFT, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  weekdays: { flexDirection: 'row', marginTop: space.md, borderBottomWidth: 1, borderBottomColor: PAPER_INK, paddingBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.slab, fontSize: 12, color: PAPER_INK_SOFT },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, borderBottomWidth: 1, borderBottomColor: PAPER_RULE },
  day: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  today: { borderWidth: 1.5, borderColor: PAPER_INK },
  dayNum: { fontFamily: fonts.slabSemi, fontSize: 14 },
  stamp: { position: 'absolute', width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  stampText: { fontFamily: fonts.display, fontSize: 14 },
  key: { flexDirection: 'row', justifyContent: 'center', gap: space.lg, marginTop: space.md },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyStamp: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontFamily: fonts.display, fontSize: 10 },
  keyLabel: { fontSize: 13, color: PAPER_INK_SOFT },
  empty: { textAlign: 'center', color: PAPER_INK_SOFT, fontStyle: 'italic', marginTop: space.md },
  entry: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: PAPER_RULE },
  entryTitle: { fontFamily: fonts.slab, fontSize: 16, color: PAPER_INK },
  entryMeta: { fontSize: 12, color: PAPER_INK_SOFT },
  verdict: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 1 },
});
