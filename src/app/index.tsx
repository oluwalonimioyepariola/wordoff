import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card, H, P, Pips, Segmented } from '../components/ui';
import {
  BestOf,
  buildShareText,
  dailyOpponent,
  dayNumber,
  formatCountdown,
  getLevel,
  getOpponent,
  isMatchOver,
  LEVEL_COUNT,
  levelBlurb,
  msUntilNextDay,
  OPPONENT_ORDER,
  OpponentId,
  streakStatus,
  totalStars,
} from '../engine';
import { useProfile } from '../store/profile';
import { useSettings } from '../store/settings';
import { space, useTheme } from '../theme';

const STREAK_COPY = {
  active: 'Today’s standoff is done. See you tomorrow.',
  pending: 'Play today to keep it alive.',
  'at-risk': 'You missed a day. A freeze will cover it if you play today.',
  broken: 'Win or lose, a daily standoff starts a streak.',
};

export default function Home() {
  const { c } = useTheme();
  const settings = useSettings();
  const { stats, activeDaily, match: savedMatch, startMatch, abandonMatch } = useProfile();
  // A finished match the player backed out of shouldn't block a new one.
  const match = savedMatch && !isMatchOver(savedMatch) ? savedMatch : null;
  const today = dayNumber();
  const [countdown, setCountdown] = useState(msUntilNextDay());
  const [rival, setRival] = useState<OpponentId>(match?.opponent ?? 'gunslinger');
  const [bestOf, setBestOf] = useState<BestOf>(match?.bestOf ?? 3);

  useEffect(() => {
    const t = setInterval(() => setCountdown(msUntilNextDay()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!settings.seenHowTo) return <Redirect href="/how-to-play" />;

  const todayRival = getOpponent(dailyOpponent(today));
  const record = stats.daily.history[today];
  const daily = activeDaily?.config.dayNumber === today ? activeDaily : null;
  const streak = streakStatus(stats, today);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.canvas }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <H size="display">WORDOFF</H>
          <P soft>A word standoff. Same word, two boards, one draw.</P>
        </View>

        <Card>
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.big, { color: c.ink }]}>🔥 {streak.streak}</Text>
              <Text style={{ color: c.inkSoft }}>day streak · best {stats.daily.bestPlayStreak}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.big, { color: c.you }]}>❄️ {stats.daily.freezes}</Text>
              <Text style={{ color: c.inkSoft }}>streak freezes</Text>
            </View>
          </View>
          <P soft>{STREAK_COPY[streak.status]}</P>
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <H>Daily Standoff #{today}</H>
            <Pips n={todayRival.difficulty} />
          </View>
          <View style={styles.rival}>
            <Avatar profile={todayRival} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>{todayRival.name}</Text>
              <Text style={{ color: c.inkSoft }}>{todayRival.title}</Text>
            </View>
          </View>
          {record ? (
            <>
              <P>
                {record.result === 'win' ? 'You won' : record.result === 'loss' ? 'You lost' : 'Draw'} ·{' '}
                {record.answer.toUpperCase()}
              </P>
              <P soft>Next standoff in {formatCountdown(countdown)}</P>
              {daily && <Button kind="secondary" label="Share result" onPress={() => Share.share({ message: buildShareText(daily, { colorblind: settings.colorblind }) })} />}
            </>
          ) : (
            <Button
              label={daily ? `Resume (row ${daily.round + 1})` : 'Draw!'}
              onPress={() => router.push({ pathname: '/duel', params: { mode: 'daily' } })}
            />
          )}
        </Card>

        <Card>
          <View style={styles.rowBetween}>
            <H>Level mode</H>
            <Text style={{ color: c.present, fontWeight: '800' }}>
              ★ {totalStars(stats)}/{LEVEL_COUNT * 3}
            </Text>
          </View>
          <P>
            Level {stats.levels.unlocked}: {getLevel(stats.levels.unlocked).title}
          </P>
          <P soft>{levelBlurb(getLevel(stats.levels.unlocked))}</P>
          <Button
            label={`Play level ${stats.levels.unlocked}`}
            onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(stats.levels.unlocked) } })}
          />
          <Button kind="secondary" label="All levels" onPress={() => router.push('/levels')} />
        </Card>

        <Card>
          <H>Quick Duel</H>
          {match ? (
            <>
              <P>
                Best of {match.bestOf} vs {getOpponent(match.opponent).name}: {match.scores.you}–{match.scores.ai}
              </P>
              <Button label="Continue match" onPress={() => router.push({ pathname: '/duel', params: { mode: 'quick' } })} />
              <Button kind="secondary" label="Abandon match" onPress={abandonMatch} />
            </>
          ) : (
            <>
              <Segmented<OpponentId>
                options={OPPONENT_ORDER.map((id) => ({ label: getOpponent(id).name.split(' ').at(-1)!, value: id }))}
                value={rival}
                onChange={setRival}
              />
              <P soft>{getOpponent(rival).blurb}</P>
              <Segmented<4 | 5>
                options={[
                  { label: '4 letters', value: 4 },
                  { label: '5 letters', value: 5 },
                ]}
                value={settings.quickLength}
                onChange={(v) => settings.set('quickLength', v)}
              />
              <Segmented<BestOf>
                options={[
                  { label: 'Single', value: 1 as BestOf },
                  { label: 'Best of 3', value: 3 as BestOf },
                  { label: 'Best of 5', value: 5 as BestOf },
                ]}
                value={bestOf}
                onChange={setBestOf}
              />
              <Button
                kind="rival"
                label="Start duel"
                onPress={() => {
                  startMatch(rival, bestOf);
                  router.push({ pathname: '/duel', params: { mode: 'quick' } });
                }}
              />
            </>
          )}
        </Card>

        <View style={styles.links}>
          {[
            ['Stats', '/stats'],
            ['Achievements', '/achievements'],
            ['History', '/history'],
            ['How to duel', '/how-to-play'],
            ['Settings', '/settings'],
          ].map(([label, href]) => (
            <Pressable key={href} onPress={() => router.push(href as never)} style={[styles.link, { borderColor: c.hairline }]}>
              <Text style={{ color: c.ink, fontWeight: '600' }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.base, gap: space.md },
  header: { gap: 2, marginBottom: space.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rival: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  big: { fontSize: 24, fontWeight: '800' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  link: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
});
