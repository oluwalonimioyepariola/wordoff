import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { StandoffScene } from '../../art';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Button, Card, Felt, H, Icon, P, Pips, Segmented } from '../../components/ui';
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
} from '../../engine';
import { useProfile } from '../../store/profile';
import { useSettings } from '../../store/settings';
import { fonts, radius, space, useTheme } from '../../theme';

const STREAK_COPY = {
  active: 'Today’s standoff is done. See you tomorrow.',
  pending: 'Play today to keep it alive.',
  'at-risk': 'You missed a day. A freeze will cover it if you play today.',
  broken: 'Win or lose, a daily standoff starts a streak.',
};

export default function Home() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
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
      <ScrollView contentContainerStyle={styles.scroll} contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <H size="display">WORDOFF</H>
            <P soft>One word, one table, two shooters.</P>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="How to duel"
            hitSlop={10}
            onPress={() => router.push('/how-to-play')}
            style={styles.help}
          >
            <Icon name="help-circle-outline" size={26} color={c.inkSoft} />
          </Pressable>
        </View>
        <View style={styles.tallyRow}>
          <View style={styles.tally} accessibilityLabel={`${streak.streak} day streak, ${stats.daily.freezes} streak freezes`}>
            <View style={styles.tallyItem}>
              <Icon name="fire" size={22} color={c.rival} />
              <Text style={[styles.tallyNum, { color: c.ink }]}>{streak.streak}</Text>
            </View>
            <View style={styles.tallyItem}>
              <Icon name="snowflake" size={20} color={c.you} />
              <Text style={[styles.tallyNum, { color: c.ink }]}>{stats.daily.freezes}</Text>
            </View>
          </View>
          <Text style={{ color: c.inkSoft, flex: 1, fontSize: 15 }}>
            {STREAK_COPY[streak.status]} Best {stats.daily.bestPlayStreak}.
          </Text>
        </View>

        <View style={[styles.scene, { borderColor: c.walnut }]} accessibilityLabel={`Main street at high noon: you facing ${todayRival.name}`}>
          <StandoffScene width={width - space.base * 2 - 6} youColor={c.you} rivalColor={c.rival} />
        </View>

        <Felt>
          <View style={styles.rowBetween}>
            <H size="title" color={c.feltInk}>
              Daily Standoff #{today}
            </H>
            <Pips n={todayRival.difficulty} onFelt />
          </View>
          <View style={styles.rival}>
            <Avatar profile={todayRival} size={50} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.feltInk, fontFamily: fonts.slabSemi, fontSize: 18 }}>vs {todayRival.name}</Text>
              <Text style={{ color: c.feltInkSoft, fontSize: 15 }}>{todayRival.title}</Text>
            </View>
          </View>
          <P color={c.feltInkSoft}>
            Standoff rules: separate boards, both fire at once. Everyone faces the same word and the same rival
            game today.
          </P>
          {record ? (
            <>
              <View style={[styles.verdict, { backgroundColor: c.card }]}>
                <Text style={[styles.verdictText, { color: record.result === 'win' ? c.you : record.result === 'loss' ? c.rival : c.cardInk }]}>
                  {record.result === 'win' ? 'You won' : record.result === 'loss' ? 'You lost' : 'Draw'}
                </Text>
                <Text style={{ color: c.cardInk, fontFamily: fonts.slab, fontSize: 18, letterSpacing: 2 }}>{record.answer.toUpperCase()}</Text>
              </View>
              <P color={c.feltInkSoft}>Next standoff in {formatCountdown(countdown)}</P>
              {daily && (
                <Button
                  kind="secondary"
                  onFelt
                  icon="share-variant"
                  label="Share your card"
                  onPress={() => Share.share({ message: buildShareText(daily, { colorblind: settings.colorblind }) })}
                />
              )}
            </>
          ) : (
            <Button
              label={daily ? `Resume, row ${daily.round + 1}` : 'Draw'}
              icon="pistol"
              onPress={() => router.push({ pathname: '/duel', params: { mode: 'daily' } })}
            />
          )}
        </Felt>

        <Card>
          <View style={styles.rowBetween}>
            <H>Level mode</H>
            <View style={styles.tallyItem}>
              <Icon name="star-four-points" size={18} color={c.brass} />
              <Text style={[styles.starCount, { color: c.ink }]}>
                {totalStars(stats)}/{LEVEL_COUNT * 3}
              </Text>
            </View>
          </View>
          <Text style={[styles.levelTitle, { color: c.ink }]}>
            Level {stats.levels.unlocked} · {getLevel(stats.levels.unlocked).title}
          </Text>
          <P soft>{levelBlurb(getLevel(stats.levels.unlocked))}</P>
          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <Button kind="secondary" label="All levels" onPress={() => router.push('/levels')} />
            </View>
            <View style={{ flex: 1.3 }}>
              <Button
                label={`Play level ${stats.levels.unlocked}`}
                onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(stats.levels.unlocked) } })}
              />
            </View>
          </View>
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
                options={OPPONENT_ORDER.map((id) => ({ label: getOpponent(id).shortName.replace('The ', ''), value: id }))}
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
                label={`Call out ${getOpponent(rival).shortName}`}
                onPress={() => {
                  startMatch(rival, bestOf);
                  router.push({ pathname: '/duel', params: { mode: 'quick' } });
                }}
              />
            </>
          )}
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.base, gap: space.md, paddingBottom: space.xxl },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  tally: { flexDirection: 'row', gap: space.md },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  help: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  scene: { borderWidth: 3, borderRadius: radius.panel, overflow: 'hidden' },
  tallyItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tallyNum: { fontFamily: fonts.slab, fontSize: 22 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rival: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xs },
  verdict: { borderRadius: radius.card, paddingVertical: space.sm, paddingHorizontal: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verdictText: { fontFamily: fonts.slab, fontSize: 18 },
  starCount: { fontFamily: fonts.slab, fontSize: 17 },
  levelTitle: { fontFamily: fonts.slabSemi, fontSize: 18 },
  buttonRow: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
});
