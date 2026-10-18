import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { MainStreetScene, Portrait, PosterPortrait } from '../../art';
import { Button, Icon, Pips, Segmented } from '../../components/ui';
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
  active: 'Today’s standoff is done.',
  pending: 'Play today to keep it alive.',
  'at-risk': 'Missed a day: a freeze covers it if you play.',
  broken: 'A daily standoff starts a streak.',
};

/**
 * Main Street. The scene runs edge to edge under the status bar with the
 * wordmark in the sky; below it a plank wall holds today's wanted poster, the
 * trail sign for Level mode, and the lineup for a Quick Duel.
 */
export default function MainStreet() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
  const level = getLevel(stats.levels.unlocked);
  const sceneH = insets.top + 300;
  const verdict = record ? (record.result === 'win' ? 'CAUGHT' : record.result === 'loss' ? 'SHOT DOWN' : 'ESCAPED') : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl * 2 }} contentInsetAdjustmentBehavior="never">
        {/* Main street at sundown, wordmark in the sky. */}
        <View style={{ height: sceneH }}>
          <MainStreetScene width={width} height={sceneH} youColor={c.you} rivalColor={c.rival} />
          <View style={[styles.sky, { top: insets.top + space.sm }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.wordmark} accessibilityRole="header">
                WORDOFF
              </Text>
              <Text style={styles.tagline}>One word. Two guns. High noon.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="How to duel"
              hitSlop={10}
              onPress={() => router.push('/how-to-play')}
              style={styles.help}
            >
              <Icon name="help-circle-outline" size={26} color="#f6ead2" />
            </Pressable>
          </View>
          <View
            style={[styles.tally, { top: insets.top + 96 }]}
            accessibilityLabel={`${streak.streak} day streak, ${stats.daily.freezes} streak freezes. ${STREAK_COPY[streak.status]}`}
          >
            <Icon name="fire" size={18} color="#f0b858" />
            <Text style={styles.tallyNum}>{streak.streak}</Text>
            <Icon name="snowflake" size={16} color="#c9d4e8" />
            <Text style={styles.tallyNum}>{stats.daily.freezes}</Text>
            <Text style={styles.tallyCopy}>{STREAK_COPY[streak.status]}</Text>
          </View>
        </View>

        {/* The plank wall. */}
        <View style={styles.wall}>
          {Array.from({ length: 16 }, (_, i) => (
            <View key={i} pointerEvents="none" style={[styles.seam, { top: 70 * i + 40, backgroundColor: c.plankSeam }]} />
          ))}

          {/* Today's wanted poster, nailed up. */}
          <View style={styles.posterWrap}>
            <View style={[styles.poster, { backgroundColor: c.card }]}>
              <View style={[styles.nail, { backgroundColor: c.walnut }]} />
              <Text style={[styles.wanted, { color: c.cardInk }]}>WANTED</Text>
              <Text style={[styles.posterSub, { color: c.cardInk }]}>Daily Standoff #{today}</Text>
              <View style={styles.posterBody}>
                <View>
                  <PosterPortrait who={todayRival.id} size={118} />
                  {verdict && (
                    <View style={[styles.stamp, { borderColor: record!.result === 'win' ? c.you : c.rival }]}>
                      <Text style={[styles.stampText, { color: record!.result === 'win' ? c.you : c.rival }]}>{verdict}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.posterName, { color: c.cardInk }]}>{todayRival.name}</Text>
                  <Text style={{ color: c.inkSoft, fontSize: 14 }}>{todayRival.title}</Text>
                  <Pips n={todayRival.difficulty} />
                  <Text style={{ color: c.inkSoft, fontSize: 13, lineHeight: 18 }}>
                    Same word, same rival for everyone today. Separate boards, both fire at once.
                  </Text>
                </View>
              </View>
              {record ? (
                <>
                  <View style={styles.rule} />
                  <View style={styles.rowBetween}>
                    <Text style={[styles.answer, { color: c.cardInk }]}>{record.answer.toUpperCase()}</Text>
                    <Text style={{ color: c.inkSoft, fontSize: 14, fontVariant: ['tabular-nums'] }}>
                      Next in {formatCountdown(countdown)}
                    </Text>
                  </View>
                  {daily && (
                    <Button
                      kind="secondary"
                      icon="share-variant"
                      label="Share your card"
                      onPress={() => Share.share({ message: buildShareText(daily, { colorblind: settings.colorblind }) })}
                    />
                  )}
                </>
              ) : (
                <Button
                  label={daily ? `Resume, row ${daily.round + 1}` : `Draw on ${todayRival.shortName}`}
                  icon="pistol"
                  onPress={() => router.push({ pathname: '/duel', params: { mode: 'daily' } })}
                />
              )}
            </View>
          </View>

          {/* The trail sign: Level mode. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play level ${level.id}, ${level.title}`}
            onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(level.id) } })}
            style={({ pressed }) => [styles.signWrap, { transform: [{ rotate: '1deg' }, { scale: pressed ? 0.98 : 1 }] }]}
          >
            <View style={[styles.rope, { left: 34, backgroundColor: '#c9a46a' }]} />
            <View style={[styles.rope, { right: 70, backgroundColor: '#c9a46a' }]} />
            <View style={styles.signRow}>
              <View style={[styles.sign, { backgroundColor: '#8a5a36', borderColor: c.walnut }]}>
                <View style={styles.rowBetween}>
                  <Text style={styles.signTitle}>THE TRAIL</Text>
                  <View style={styles.rowCenter}>
                    <Icon name="star-four-points" size={15} color="#f0c56a" />
                    <Text style={styles.signStars}>
                      {totalStars(stats)}/{LEVEL_COUNT * 3}
                    </Text>
                  </View>
                </View>
                <Text style={styles.signLevel}>
                  Level {level.id} · {level.title}
                </Text>
                <Text style={styles.signBlurb}>{levelBlurb(level)}</Text>
              </View>
              <Svg width={34} height={96} viewBox="0 0 34 96" style={{ marginLeft: -3 }}>
                <Path d="M0 0 L6 0 L34 48 L6 96 L0 96 Z" fill="#8a5a36" stroke={c.walnut} strokeWidth={3} />
              </Svg>
            </View>
          </Pressable>
          <Pressable onPress={() => router.push('/levels')} hitSlop={8} style={styles.mapLink} accessibilityRole="link">
            <Icon name="map-outline" size={18} color={c.feltInk} />
            <Text style={[styles.mapText, { color: c.feltInk }]}>See the whole trail</Text>
          </Pressable>

          {/* The lineup: Quick Duel. */}
          <View style={[styles.lineup, { backgroundColor: c.walnut }]}>
            <Text style={[styles.lineupTitle, { color: c.walnutInk }]}>Call out a rival</Text>
            {match ? (
              <>
                <Text style={{ color: c.feltInkSoft, fontSize: 15 }}>
                  Best of {match.bestOf} vs {getOpponent(match.opponent).name}: {match.scores.you}–{match.scores.ai}
                </Text>
                <Button label="Continue the match" icon="pistol" onPress={() => router.push({ pathname: '/duel', params: { mode: 'quick' } })} />
                <Button kind="secondary" onFelt label="Abandon match" onPress={abandonMatch} />
              </>
            ) : (
              <>
                <View style={styles.faces}>
                  {OPPONENT_ORDER.map((id) => {
                    const p = getOpponent(id);
                    const on = id === rival;
                    return (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        accessibilityLabel={`${p.name}, difficulty ${p.difficulty} of 3`}
                        onPress={() => setRival(id)}
                        style={[styles.face, { opacity: on ? 1 : 0.55, transform: [{ translateY: on ? -4 : 0 }] }]}
                      >
                        <Portrait who={id} size={72} ring={on ? c.brass : '#5a3a24'} />
                        <Text style={[styles.faceName, { color: on ? c.walnutInk : c.feltInkSoft }]}>{p.shortName.replace('The ', '')}</Text>
                        <Pips n={p.difficulty} onFelt />
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={{ color: c.feltInkSoft, fontSize: 14, textAlign: 'center' }}>{getOpponent(rival).blurb}</Text>
                <Segmented<4 | 5>
                  onFelt
                  options={[
                    { label: '4 letters', value: 4 },
                    { label: '5 letters', value: 5 },
                  ]}
                  value={settings.quickLength}
                  onChange={(v) => settings.set('quickLength', v)}
                />
                <Segmented<BestOf>
                  onFelt
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
                  icon="pistol"
                  label={`Call out ${getOpponent(rival).shortName}`}
                  onPress={() => {
                    startMatch(rival, bestOf);
                    router.push({ pathname: '/duel', params: { mode: 'quick' } });
                  }}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sky: { position: 'absolute', left: space.base, right: space.sm, flexDirection: 'row', alignItems: 'flex-start' },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: '#f6ead2',
    letterSpacing: 1,
    textShadowColor: 'rgba(46,29,19,0.55)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  tagline: { color: '#fbecd0', fontSize: 15, fontWeight: '600', marginTop: -2 },
  help: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  tally: {
    position: 'absolute',
    left: space.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(46,29,19,0.62)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tallyNum: { fontFamily: fonts.slab, fontSize: 16, color: '#f6ead2', marginRight: 4 },
  tallyCopy: { color: '#e9d7b6', fontSize: 13 },
  wall: { paddingHorizontal: space.base, paddingTop: space.lg, gap: space.lg, overflow: 'hidden' },
  seam: { position: 'absolute', left: 0, right: 0, height: 2 },
  posterWrap: { transform: [{ rotate: '-1.2deg' }] },
  poster: {
    borderRadius: 4,
    padding: space.base,
    paddingTop: space.lg,
    gap: space.sm,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  nail: { position: 'absolute', top: 8, alignSelf: 'center', width: 10, height: 10, borderRadius: 5 },
  wanted: { fontFamily: fonts.display, fontSize: 46, textAlign: 'center', letterSpacing: 4 },
  posterSub: { fontFamily: fonts.slab, fontSize: 16, textAlign: 'center', letterSpacing: 2, textTransform: 'uppercase', marginTop: -6 },
  posterBody: { flexDirection: 'row', gap: space.md, alignItems: 'center', marginVertical: space.xs },
  posterName: { fontFamily: fonts.slab, fontSize: 21 },
  stamp: { position: 'absolute', top: 44, left: -8, right: -8, borderWidth: 3, borderRadius: 6, paddingVertical: 2, alignItems: 'center', transform: [{ rotate: '-12deg' }], backgroundColor: 'rgba(246,234,210,0.6)' },
  stampText: { fontFamily: fonts.display, fontSize: 18, letterSpacing: 1 },
  rule: { height: 1, backgroundColor: '#cdb48a' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  answer: { fontFamily: fonts.slab, fontSize: 22, letterSpacing: 4 },
  signWrap: { marginTop: space.sm },
  rope: { position: 'absolute', top: -22, width: 3, height: 26 },
  signRow: { flexDirection: 'row', alignItems: 'center' },
  sign: {
    flex: 1,
    minHeight: 96,
    borderWidth: 3,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
    justifyContent: 'center',
    gap: 2,
  },
  signTitle: { fontFamily: fonts.display, fontSize: 20, color: '#f6ead2', letterSpacing: 2 },
  signStars: { fontFamily: fonts.slab, fontSize: 15, color: '#f6ead2' },
  signLevel: { fontFamily: fonts.slab, fontSize: 18, color: '#f6ead2' },
  signBlurb: { color: '#ecd9b6', fontSize: 13 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: -space.sm, minHeight: 44 },
  mapText: { fontFamily: fonts.slabSemi, fontSize: 15, textDecorationLine: 'underline' },
  lineup: { borderRadius: radius.panel, padding: space.base, gap: space.md, borderWidth: 3, borderColor: '#1a110a' },
  lineupTitle: { fontFamily: fonts.display, fontSize: 24, textAlign: 'center' },
  faces: { flexDirection: 'row', justifyContent: 'space-around' },
  face: { alignItems: 'center', gap: 4, minWidth: 80 },
  faceName: { fontFamily: fonts.slab, fontSize: 15 },
});
