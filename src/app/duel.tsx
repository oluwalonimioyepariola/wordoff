import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { CountdownOverlay, TauntBubble, Toast } from '../components/Overlays';
import { RivalBoard } from '../components/RivalBoard';
import { Avatar, Button, H, P } from '../components/ui';
import {
  buildShareText,
  createDuel,
  dailyAnswer,
  dailyOpponent,
  dailySeed,
  dayNumber,
  DuelState,
  getAchievement,
  getOpponent,
  outcomeHeadline,
  pickQuickAnswer,
  randomSeed,
  winsNeeded,
} from '../engine';
import { useStandoff } from '../game/useStandoff';
import { useProfile } from '../store/profile';
import { useSettings } from '../store/settings';
import { radius, space, useTheme } from '../theme';

/** Picks or resumes the right duel for the mode, then hands it to the standoff view. */
export default function DuelScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'daily' | 'quick' }>();
  const { activeDaily, activeQuick, match, stats } = useProfile();
  const settings = useSettings();
  // Bumped to start the next duel of a match.
  const [duelIndex, setDuelIndex] = useState(0);

  const initial = useMemo<DuelState | null>(() => {
    const shotClockMs = settings.shotClock ? settings.shotClock * 1000 : null;
    if (mode === 'daily') {
      const day = dayNumber();
      if (activeDaily?.config.dayNumber === day) return activeDaily;
      return createDuel({
        answer: dailyAnswer(day),
        opponent: dailyOpponent(day),
        mode: 'daily',
        hardMode: settings.hardMode,
        shotClockMs,
        seed: dailySeed(day),
        dayNumber: day,
      });
    }
    if (!match) return null;
    if (activeQuick && !activeQuick.outcome) return activeQuick;
    const seed = randomSeed();
    return createDuel({
      answer: pickQuickAnswer(seed, stats.recentAnswers),
      opponent: match.opponent,
      mode: 'quick',
      hardMode: settings.hardMode,
      shotClockMs,
      seed,
    });
    // Only pick a duel on entry and when moving to the next duel of a match.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, duelIndex]);

  if (!initial) return <Redirect href="/" />;
  return <StandoffView key={initial.config.seed + duelIndex} initial={initial} onNext={() => setDuelIndex((i) => i + 1)} />;
}

function StandoffView({ initial, onNext }: { initial: DuelState; onNext(): void }) {
  const { c } = useTheme();
  const { width, height } = useWindowDimensions();
  const { saveDaily, saveQuick, finishDuel, match } = useProfile();
  const colorblind = useSettings((s) => s.colorblind);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [matchOver, setMatchOver] = useState(false);
  const isDaily = initial.config.mode === 'daily';

  const onChange = useCallback((s: DuelState) => (isDaily ? saveDaily(s) : saveQuick(s)), [isDaily, saveDaily, saveQuick]);
  const onFinish = useCallback(
    (s: DuelState) => {
      const r = finishDuel(s);
      setUnlocked(r.unlocked);
      setMatchOver(r.matchOver);
    },
    [finishDuel],
  );

  const g = useStandoff({ initial, onChange, onFinish });
  const { state } = g;
  const tile = Math.floor(Math.min(58, (width - 2 * space.base - 4 * 6) / 5, (height - 470) / 7));

  const walkAway = () => {
    if (state.outcome) return router.back();
    Alert.alert('Walk away?', 'Leaving now counts as a loss.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Walk away', style: 'destructive', onPress: g.forfeit },
    ]);
  };

  const clock = g.clockLeftMs !== null && state.config.shotClockMs !== null && !state.outcome ? Math.ceil(g.clockLeftMs / 1000) : null;
  const title = isDaily ? `Daily #${state.config.dayNumber}` : match ? `Best of ${match.bestOf} · ${match.scores.you}–${match.scores.ai}` : 'Quick Duel';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: state.suddenDeath && !state.outcome ? mix(c.canvas, c.dusk) : c.canvas }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </Pressable>
        <Text style={{ color: c.ink, fontWeight: '700' }}>{title}</Text>
        {clock !== null ? (
          <Text style={{ color: clock <= 5 ? c.danger : c.inkSoft, fontWeight: '800', fontVariant: ['tabular-nums'] }}>⏱ {clock}s</Text>
        ) : !state.outcome ? (
          <Pressable onPress={walkAway} hitSlop={12}>
            <Text style={{ color: c.inkSoft }}>Walk away</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={[styles.rivalCard, { backgroundColor: c.surface, borderColor: c.hairline }]}>
        <Avatar profile={g.profile} size={40} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: c.ink, fontWeight: '700' }}>{g.profile.name}</Text>
            {g.rivalLocked && !state.outcome && (
              <View style={[styles.badge, { backgroundColor: c.rival }]}>
                <Text style={styles.badgeText}>LOCKED</Text>
              </View>
            )}
          </View>
          <TauntBubble text={g.taunt?.text ?? null} id={g.taunt?.id ?? null} />
        </View>
        <RivalBoard rows={g.rivalRows} totalRows={state.maxRows} />
      </View>

      {state.suddenDeath && !state.outcome && (
        <Text style={[styles.suddenDeath, { color: c.danger }]}>SUDDEN DEATH · one shot each</Text>
      )}

      <View style={styles.boardArea}>
        <Toast message={g.error?.message ?? null} id={g.error?.id ?? null} />
        <Board
          rows={g.yourRows}
          totalRows={state.maxRows}
          current={g.pendingGuess ?? (state.outcome ? null : g.input)}
          currentLocked={g.youLocked}
          revealingRow={g.revealingRow}
          shakeKey={g.error?.id ?? null}
          hint={state.hint}
          celebrate={g.phase === 'result' && state.outcome?.winner === 'you'}
          tileSize={tile}
        />
        {g.youLocked && !g.rivalLocked && g.phase === 'aiming' && (
          <P soft center>Locked in. {g.profile.name} is aiming…</P>
        )}
        <CountdownOverlay beat={g.beat} />
      </View>

      {g.phase === 'result' && state.outcome ? (
        <View style={[styles.result, { backgroundColor: c.surface, borderColor: c.hairline }]}>
          <H size="title">{outcomeHeadline(state.outcome)}</H>
          <P>
            The word was <Text style={{ fontWeight: '800' }}>{state.config.answer.toUpperCase()}</Text>
            {state.outcome.reason === 'photo-finish' &&
              ` · you ${secs(state.boards.you.totalMs)} vs ${secs(state.boards.ai.totalMs)}`}
          </P>
          {unlocked.map((id) => (
            <P key={id}>🏅 {getAchievement(id)?.name}: {getAchievement(id)?.description}</P>
          ))}
          {match && !isDaily && (
            <P soft>
              {matchOver
                ? match.winner === 'you'
                  ? `You took the match ${match.scores.you}–${match.scores.ai}!`
                  : match.winner === 'ai'
                    ? `${getOpponent(match.opponent).name} took the match ${match.scores.ai}–${match.scores.you}.`
                    : 'The match ends level.'
                : `Match: ${match.scores.you}–${match.scores.ai} (first to ${winsNeeded(match.bestOf)})`}
            </P>
          )}
          <View style={styles.resultButtons}>
            <View style={{ flex: 1 }}>
              <Button kind="secondary" label="Share" onPress={() => Share.share({ message: buildShareText(state, { colorblind }) })} />
            </View>
            <View style={{ flex: 1 }}>
              {!isDaily && match && !matchOver ? (
                <Button label="Next duel" onPress={onNext} />
              ) : (
                <Button
                  label="Done"
                  onPress={() => {
                    if (!isDaily) useProfile.getState().abandonMatch();
                    router.back();
                  }}
                />
              )}
            </View>
          </View>
        </View>
      ) : (
        <Keyboard keys={g.keys} disabled={!g.canType} onLetter={g.typeLetter} onBack={g.backspace} onFire={g.submit} />
      )}
    </SafeAreaView>
  );
}
