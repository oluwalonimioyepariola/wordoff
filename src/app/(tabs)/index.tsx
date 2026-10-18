import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Portrait } from '../../art';
import { MainStreetHero } from '../../components/MainStreetHero';
import { Button, Icon, Pips, Segmented } from '../../components/ui';
import { WantedPoster } from '../../components/WantedPoster';
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

const WOOD = '#8a5532';
const WOOD_EDGE = '#2a160d';
const CREAM = '#f6ead2';

/** A hanging trail sign: planked wood, brass nail heads, an arrow end. */
function TrailSign({ width, children }: { width: number; children: React.ReactNode }) {
  const h = 104;
  const body = width - 36;
  return (
    <View style={{ width, height: h }}>
      <Svg width={width} height={h} style={StyleSheet.absoluteFill}>
        <Path d={`M2 6 Q2 2 6 2 L${body} 2 L${width - 2} ${h / 2} L${body} ${h - 2} L6 ${h - 2} Q2 ${h - 2} 2 ${h - 6} Z`} fill={WOOD} stroke={WOOD_EDGE} strokeWidth={3} />
        {/* grain kept to the edges, clear of the lettering */}
        <Path d={`M24 9 Q${body / 2} 6 ${body - 24} 10`} stroke="#6e3f22" strokeWidth={1.2} fill="none" opacity={0.7} />
        <Path d={`M24 ${h - 9} Q${body / 2} ${h - 5} ${body - 24} ${h - 10}`} stroke="#6e3f22" strokeWidth={1.2} fill="none" opacity={0.7} />
        {[14, body - 12].map((x) =>
          [16, h - 16].map((y) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill="#d2a54a" stroke={WOOD_EDGE} strokeWidth={1} />),
        )}
      </Svg>
      <View style={{ position: 'absolute', left: 28, right: 52, top: 0, bottom: 0, justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

/**
 * Main Street. Sundown scene under the status bar with the wordmark in the
 * sky; a plank wall below holds today's wanted poster, the trail sign for
 * Level mode, and the lineup for a Quick Duel.
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
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });

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
  const inner = width - space.base * 2;

  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 }} contentInsetAdjustmentBehavior="never">
        <MainStreetHero
          width={width}
          height={sceneH}
          topInset={insets.top}
          scrollY={scrollY}
          streak={streak.streak}
          freezes={stats.daily.freezes}
          onHelp={() => router.push('/how-to-play')}
        />

        <View style={styles.wall}>
          {/* plank seams and grain */}
          {Array.from({ length: 18 }, (_, i) => (
            <View key={i} pointerEvents="none" style={[styles.seam, { top: 64 * i, backgroundColor: c.plankSeam }]} />
          ))}

          <View style={styles.posterWrap}>
            <WantedPoster
              width={inner - 12}
              rival={todayRival}
              day={today}
              resumeRow={!record && daily ? daily.round + 1 : null}
              verdict={
                record
                  ? {
                      text: record.result === 'win' ? 'CAUGHT' : record.result === 'loss' ? 'SHOT DOWN' : 'ESCAPED',
                      won: record.result === 'win',
                      answer: record.answer.toUpperCase(),
                      next: formatCountdown(countdown),
                    }
                  : null
              }
              onDraw={() => router.push({ pathname: '/duel', params: { mode: 'daily' } })}
              onShare={daily ? () => Share.share({ message: buildShareText(daily, { colorblind: settings.colorblind }) }) : undefined}
            />
          </View>

          {/* The trail: Level mode. */}
          <View style={styles.signBlock}>
            <View style={[styles.rope, { left: 40 }]} />
            <View style={[styles.rope, { right: 80 }]} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Play level ${level.id}, ${level.title}`}
              onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(level.id) } })}
              style={({ pressed }) => ({ transform: [{ rotate: '0.8deg' }, { scale: pressed ? 0.98 : 1 }] })}
            >
              <TrailSign width={inner}>
                <Text style={styles.signLevel} numberOfLines={1}>
                  Level {level.id} · {level.title}
                </Text>
                <Text style={styles.signBlurb} numberOfLines={1}>
                  {levelBlurb(level)}
                </Text>
                <View style={[styles.rowCenter, { marginTop: 4 }]}>
                  <Icon name="star-four-points" size={13} color="#f0c56a" />
                  <Text style={styles.signStars}>
                    {totalStars(stats)} of {LEVEL_COUNT * 3} stars on the trail
                  </Text>
                </View>
              </TrailSign>
            </Pressable>
            <Pressable onPress={() => router.push('/levels')} hitSlop={8} style={styles.mapLink} accessibilityRole="link">
              <Icon name="map-outline" size={16} color="#e9cf9f" />
              <Text style={styles.mapText}>See the whole trail</Text>
            </Pressable>
          </View>

          {/* The lineup: Quick Duel. */}
          <View style={[styles.lineup, { backgroundColor: '#1e120a' }]}>
            <Text style={styles.lineupLabel}>CALL OUT A RIVAL</Text>
            {match ? (
              <>
                <View style={styles.scoreboard}>
                  <View style={styles.scoreSide}>
                    <Portrait who="you" size={58} ring={c.you} />
                    <Text style={styles.scoreName}>You</Text>
                  </View>
                  <View style={styles.scoreMid}>
                    <Text style={styles.score}>
                      {match.scores.you}
                      <Text style={styles.scoreDash}> – </Text>
                      {match.scores.ai}
                    </Text>
                    <Text style={styles.scoreMeta}>BEST OF {match.bestOf}</Text>
                  </View>
                  <View style={styles.scoreSide}>
                    <Portrait who={match.opponent} size={58} ring={c.rival} />
                    <Text style={styles.scoreName}>{getOpponent(match.opponent).shortName.replace('The ', '')}</Text>
                  </View>
                </View>
                <Button label="Continue the match" icon="pistol" onPress={() => router.push({ pathname: '/duel', params: { mode: 'quick' } })} />
                <Pressable onPress={abandonMatch} accessibilityRole="button" hitSlop={8} style={styles.abandon}>
                  <Text style={styles.abandonText}>Walk away from this match</Text>
                </Pressable>
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
                        style={[styles.face, { opacity: on ? 1 : 0.5, transform: [{ translateY: on ? -4 : 0 }] }]}
                      >
                        <Portrait who={id} size={74} ring={on ? '#e0b552' : '#4a3020'} />
                        <Text style={[styles.faceName, { color: on ? CREAM : '#c9b18c' }]}>{p.shortName.replace('The ', '')}</Text>
                        <Pips n={p.difficulty} onFelt />
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.lineupCopy}>{getOpponent(rival).blurb}</Text>
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
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wall: { paddingHorizontal: space.base, paddingTop: space.xl, gap: space.xl, overflow: 'hidden' },
  seam: { position: 'absolute', left: 0, right: 0, height: 2 },
  posterWrap: { alignItems: 'center', transform: [{ rotate: '-1.4deg' }] },
  signBlock: { marginTop: space.sm, gap: space.xs },
  rope: { position: 'absolute', top: -26, width: 3, height: 30, backgroundColor: '#c9a46a', borderRadius: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  signStars: { fontFamily: fonts.slabSemi, fontSize: 13, color: '#f0d9ae' },
  signLevel: { fontFamily: fonts.slab, fontSize: 20, color: CREAM },
  signBlurb: { color: '#ecd4a8', fontSize: 12 },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 44 },
  mapText: { fontFamily: fonts.slabSemi, fontSize: 14, color: '#e9cf9f', textDecorationLine: 'underline' },
  lineup: { borderRadius: radius.panel, padding: space.lg, gap: space.md, borderWidth: 1.5, borderColor: '#6e4a24' },
  lineupLabel: { fontFamily: fonts.slab, fontSize: 13, letterSpacing: 3, color: '#e0b552', textAlign: 'center' },
  lineupCopy: { color: '#c9b18c', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  faces: { flexDirection: 'row', justifyContent: 'space-around', marginTop: space.xs },
  scoreboard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.sm },
  scoreSide: { alignItems: 'center', gap: 4, width: 76 },
  scoreName: { fontFamily: fonts.slab, fontSize: 15, color: CREAM },
  scoreMid: { alignItems: 'center' },
  score: { fontFamily: fonts.display, fontSize: 40, color: CREAM, fontVariant: ['tabular-nums'] },
  scoreDash: { color: '#8a6a44' },
  scoreMeta: { fontFamily: fonts.slab, fontSize: 11, letterSpacing: 2.5, color: '#c9a46a' },
  abandon: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  abandonText: { color: '#c9b18c', fontSize: 14, textDecorationLine: 'underline' },
  face: { alignItems: 'center', gap: 4, minWidth: 80 },
  faceName: { fontFamily: fonts.slab, fontSize: 15 },
});
