import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { CountdownOverlay, TauntBubble, Toast } from '../components/Overlays';
import { RivalBoard } from '../components/RivalBoard';
import { SharedBoard } from '../components/SharedBoard';
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
  getLevel,
  getOpponent,
  LEVEL_COUNT,
  levelAnswer,
  levelSeed,
  outcomeHeadline,
  pickQuickAnswer,
  randomSeed,
  rowOwners,
  sharedRows,
  starsFor,
  wordLengthOf,
  winsNeeded,
} from '../engine';
import { useStandoff } from '../game/useStandoff';
import { useProfile } from '../store/profile';
import { useSettings } from '../store/settings';
import { radius, space, useTheme } from '../theme';

/** Scouts allowed in a Quick Duel. The Daily has none, so results stay comparable. */
const QUICK_SCOUTS = 1;

/** Picks or resumes the right duel for the mode, then hands it to the standoff view. */
export default function DuelScreen() {
  const params = useLocalSearchParams<{ mode: 'daily' | 'quick' | 'level'; id?: string }>();
  const { mode } = params;
  const levelId = Number(params.id ?? 0);
  const { activeDaily, activeQuick, activeLevel, match, stats } = useProfile();
  const settings = useSettings();
  // Bumped to start the next duel of a match, or a retry / next level.
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
        board: 'shared',
        wordLength: 5,
        maxRows: 6,
      });
    }
    if (mode === 'level') {
      if (!levelId || levelId > stats.levels.unlocked) return null;
      const level = getLevel(levelId);
      // Resume an unfinished attempt, unless it was saved under older level rules.
      const resumable =
        activeLevel?.config.levelId === levelId &&
        !activeLevel.outcome &&
        activeLevel.config.board === level.board &&
        activeLevel.config.wordLength === level.wordLength;
      if (resumable) return activeLevel;
      const attempt = stats.levels.attempts[levelId] ?? 0;
      return createDuel({
        answer: levelAnswer(levelId, attempt),
        opponent: level.opponent,
        mode: 'level',
        hardMode: level.hardMode,
        shotClockMs: level.shotClockMs,
        seed: levelSeed(levelId, attempt),
        levelId,
        scouts: level.scouts,
        tuning: level.tuning,
        board: level.board,
        wordLength: level.wordLength,
        maxRows: level.maxRows,
        firstShooter: level.firstShooter,
      });
    }
    if (!match) return null;
    if (activeQuick && !activeQuick.outcome) return activeQuick;
    const seed = randomSeed();
    return createDuel({
      answer: pickQuickAnswer(seed, stats.recentAnswers, settings.quickLength),
      opponent: match.opponent,
      mode: 'quick',
      hardMode: settings.hardMode,
      shotClockMs,
      seed,
      scouts: QUICK_SCOUTS,
      board: settings.boardStyle,
      wordLength: settings.quickLength,
      maxRows: 6,
      // Take turns going first across a match.
      firstShooter: match.results.length % 2 === 0 ? 'you' : 'ai',
    });
    // Only pick a duel on entry and when moving to the next duel / level.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, levelId, duelIndex]);

  if (!initial) return <Redirect href={mode === 'level' ? '/levels' : '/'} />;
  return (
    <StandoffView
      key={initial.config.seed + duelIndex}
      initial={initial}
      onNext={() => setDuelIndex((i) => i + 1)}
      onLevel={(id) => {
        router.setParams({ id: String(id) });
        setDuelIndex((i) => i + 1);
      }}
    />
  );
}

interface ViewProps {
  initial: DuelState;
  onNext(): void;
  onLevel(id: number): void;
}

function StandoffView({ initial, onNext, onLevel }: ViewProps) {
  const { c } = useTheme();
  const { width, height } = useWindowDimensions();
  const { saveDaily, saveQuick, saveLevel, finishDuel, match } = useProfile();
  const colorblind = useSettings((s) => s.colorblind);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [matchOver, setMatchOver] = useState(false);
  const { mode } = initial.config;
  const level = initial.config.levelId ? getLevel(initial.config.levelId) : null;

  const onChange = useCallback(
    (s: DuelState) => (mode === 'daily' ? saveDaily(s) : mode === 'level' ? saveLevel(s) : saveQuick(s)),
    [mode, saveDaily, saveLevel, saveQuick],
  );
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
  const rivalName = g.profile.shortName;
  const over = g.phase === 'result' && !!state.outcome;
  const marker = 26;
  const tile = g.shared
    ? Math.floor(Math.min(60, (width - 2 * space.base - 2 * marker - (g.length + 1) * 6) / g.length, (height - 440) / state.maxRows))
    : Math.floor(Math.min(58, (width - 2 * space.base - (g.length - 1) * 6) / g.length, (height - 500) / state.maxRows));

  const walkAway = () => {
    if (state.outcome) return router.back();
    Alert.alert('Walk away?', 'Leaving now counts as a loss.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Walk away', style: 'destructive', onPress: g.forfeit },
    ]);
  };

  const clock =
    g.clockLeftMs !== null && state.config.shotClockMs !== null && !state.outcome ? Math.ceil(g.clockLeftMs / 1000) : null;
  const title =
    mode === 'daily'
      ? `Daily #${state.config.dayNumber}`
      : level
        ? `Level ${level.id} · ${level.title}`
        : match
          ? `Best of ${match.bestOf} · ${match.scores.you}–${match.scores.ai}`
          : 'Quick Duel';

  // Who is waiting on whom, in plain words.
  let status: { text: string; color: string } | null = null;
  if (g.shared) {
    if (g.phase === 'aiming' && g.yourTurn) status = { text: 'Your shot! Type a word and fire.', color: c.you };
    else if (g.phase === 'aiming' && g.rivalsTurn) status = { text: `${rivalName} is aiming…`, color: c.rival };
  } else if (g.phase === 'aiming' && !state.outcome) {
    if (g.youLocked && !g.rivalLocked) status = { text: `Locked in. Waiting for ${rivalName}…`, color: c.inkSoft };
    else if (g.rivalLocked && !g.youLocked) status = { text: `${rivalName} has locked in. Your move!`, color: c.rival };
    else if (!g.rivalLocked) status = { text: `${rivalName} is picking a word…`, color: c.inkSoft };
  } else if (g.phase === 'reveal') {
    status = { text: 'Both rows revealed', color: c.inkSoft };
  }

  const stars = level && state.outcome ? starsFor(level, state.outcome.winner === 'you', state.boards.you.solvedRow) : 0;
  const hasNextLevel = level && stars > 0 && level.id < LEVEL_COUNT;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: state.suddenDeath && !state.outcome ? mix(c.canvas, c.dusk) : c.canvas }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ color: c.ink, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </Pressable>
        <Text style={{ color: c.ink, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
          {title}
        </Text>
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

      {!over && (
        <View
          style={[
            styles.rivalCard,
            g.shared && styles.rivalCardShared,
            { backgroundColor: c.surface, borderColor: g.rivalLocked || g.rivalsTurn ? c.rival : c.hairline },
          ]}
        >
          <Avatar profile={g.profile} size={40} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>{g.profile.name}</Text>
              {g.shared ? (
                g.rivalsTurn ? (
                  <View style={[styles.badge, { backgroundColor: c.rival }]}>
                    <Text style={styles.badgeText}>AIMING</Text>
                  </View>
                ) : g.yourTurn ? (
                  <View style={[styles.badge, { backgroundColor: c.you }]}>
                    <Text style={styles.badgeText}>YOUR SHOT</Text>
                  </View>
                ) : null
              ) : g.rivalLocked && !state.outcome ? (
                <View style={[styles.badge, { backgroundColor: c.rival }]}>
                  <Text style={styles.badgeText}>LOCKED</Text>
                </View>
              ) : !state.outcome ? (
                <Text style={{ color: c.inkSoft, fontSize: 12 }}>aiming…</Text>
              ) : null}
            </View>
            <TauntBubble text={g.taunt?.text ?? null} id={g.taunt?.id ?? null} />
          </View>
          {!g.shared && (
            <RivalBoard
              rows={g.rivalRows}
              totalRows={state.maxRows}
              length={g.length}
              typing={g.phase === 'aiming' && !g.rivalLocked ? g.rivalTyped : g.rivalLocked && g.phase !== 'reveal' ? g.length : null}
            />
          )}
        </View>
      )}

      {state.suddenDeath && !state.outcome && (
        <Text style={[styles.suddenDeath, { color: c.danger }]}>SUDDEN DEATH · one shot each</Text>
      )}

      {over ? (
        <ScrollView contentContainerStyle={styles.resultScroll}>
          <ResultPanel
            state={state}
            rivalName={rivalName}
            unlocked={unlocked}
            stars={level ? stars : null}
            matchLine={
              match && mode === 'quick'
                ? matchOver
                  ? match.winner === 'you'
                    ? `You took the match ${match.scores.you}–${match.scores.ai}!`
                    : match.winner === 'ai'
                      ? `${getOpponent(match.opponent).name} took the match ${match.scores.ai}–${match.scores.you}.`
                      : 'The match ends level.'
                  : `Match: ${match.scores.you}–${match.scores.ai} (first to ${winsNeeded(match.bestOf)})`
                : null
            }
          />
          <View style={styles.resultButtons}>
            <View style={{ flex: 1 }}>
              <Button kind="secondary" label="Share" onPress={() => Share.share({ message: buildShareText(state, { colorblind }) })} />
            </View>
            <View style={{ flex: 1 }}>
              {level ? (
                hasNextLevel ? (
                  <Button label={`Level ${level.id + 1}`} onPress={() => onLevel(level.id + 1)} />
                ) : (
                  <Button label="Retry" onPress={onNext} />
                )
              ) : mode === 'quick' && match && !matchOver ? (
                <Button label="Next duel" onPress={onNext} />
              ) : (
                <Button
                  label="Done"
                  onPress={() => {
                    if (mode === 'quick') useProfile.getState().abandonMatch();
                    router.back();
                  }}
                />
              )}
            </View>
          </View>
          {level && (
            <View style={styles.resultButtons}>
              {hasNextLevel && (
                <View style={{ flex: 1 }}>
                  <Button kind="secondary" label="Replay" onPress={onNext} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Button kind="secondary" label="All levels" onPress={() => router.replace('/levels')} />
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
          <View style={styles.boardArea}>
            <Toast message={g.error?.message ?? null} id={g.error?.id ?? null} />
            {g.shared ? (
              <SharedBoard
                shots={g.shots}
                totalRows={state.maxRows}
                length={g.length}
                owners={rowOwners(state)}
                input={g.yourTurn ? g.input : null}
                rivalTyping={g.rivalTyping}
                revealingRow={g.revealingRow}
                hints={g.revealed}
                rivalInitial={g.profile.name.replace('The ', '')[0]}
                tileSize={tile}
              />
            ) : (
              <Board
                rows={g.yourRows}
                totalRows={state.maxRows}
                current={g.pendingGuess ?? (state.outcome ? null : g.input)}
                currentLocked={g.youLocked}
                revealingRow={g.revealingRow}
                shakeKey={g.error?.id ?? null}
                hints={g.revealed}
                celebrate={false}
                tileSize={tile}
                length={g.length}
              />
            )}
            <CountdownOverlay beat={g.beat} />
          </View>
          <View style={styles.actionRow}>
            <Text style={{ color: status?.color ?? c.inkSoft, fontWeight: '600', flex: 1 }} numberOfLines={1}>
              {status?.text ?? ' '}
            </Text>
            {(state.config.scouts ?? 0) > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Scout a letter, ${g.scoutsLeft} left`}
                disabled={!g.canScout}
                onPress={g.scout}
                style={[styles.scout, { borderColor: c.you, opacity: g.canScout ? 1 : 0.4 }]}
              >
                <Text style={{ color: c.you, fontWeight: '700' }}>🔍 Scout · {g.scoutsLeft}</Text>
              </Pressable>
            )}
          </View>
          <Keyboard keys={g.keys} disabled={!g.canType} onLetter={g.typeLetter} onBack={g.backspace} onFire={g.submit} />
        </>
      )}
    </SafeAreaView>
  );
}

interface ResultProps {
  state: DuelState;
  rivalName: string;
  unlocked: string[];
  stars: number | null;
  matchLine: string | null;
}

/** End of a duel: who won, the word, both boards with the rival's letters finally shown. */
function ResultPanel({ state, rivalName, unlocked, stars, matchLine }: ResultProps) {
  const { c } = useTheme();
  const outcome = state.outcome!;
  const youTile = 24;
  return (
    <View style={[styles.result, { backgroundColor: c.surface, borderColor: c.hairline }]}>
      <H size="title">{outcomeHeadline(outcome)}</H>
      {stars !== null && (
        <Text style={{ fontSize: 30, color: stars ? c.present : c.hairline }} accessibilityLabel={`${stars} of 3 stars`}>
          {'★'.repeat(stars)}
          <Text style={{ color: c.hairline }}>{'★'.repeat(3 - stars)}</Text>
        </Text>
      )}
      <P>
        The word was <Text style={{ fontWeight: '800' }}>{state.config.answer.toUpperCase()}</Text>
        {outcome.reason === 'photo-finish' &&
          ` · you ${secs(state.boards.you.totalMs)} vs ${secs(state.boards.ai.totalMs)}`}
      </P>

      {state.config.board === 'shared' ? (
        <View style={{ alignItems: 'center', marginVertical: space.sm }}>
          <SharedBoard
            shots={sharedRows(state)}
            totalRows={state.order?.length ?? 0}
            length={wordLengthOf(state)}
            owners={state.order ?? []}
            input={null}
            rivalTyping={null}
            revealingRow={null}
            hints={[]}
            rivalInitial={rivalName.replace('The ', '')[0]}
            tileSize={30}
            celebrate={outcome.winner === 'you'}
          />
        </View>
      ) : (
      <View style={styles.boards}>
        <View style={styles.boardCol}>
          <Text style={[styles.boardLabel, { color: c.you }]}>You · {rowsText(state.boards.you.solvedRow)}</Text>
          <RivalBoard rows={state.boards.you.rows} totalRows={state.boards.you.rows.length} cell={youTile} showLetters length={wordLengthOf(state)} />
        </View>
        <View style={styles.boardCol}>
          <Text style={[styles.boardLabel, { color: c.rival }]}>
            {rivalName} · {rowsText(state.boards.ai.solvedRow)}
          </Text>
          <RivalBoard rows={state.boards.ai.rows} totalRows={state.boards.ai.rows.length} cell={youTile} showLetters length={wordLengthOf(state)} />
        </View>
      </View>
      )}
      {(state.scouted?.length ?? 0) > 0 && <P soft>You scouted {state.scouted.length} letter{state.scouted.length > 1 ? 's' : ''}.</P>}

      {unlocked.map((id) => (
        <P key={id}>
          🏅 {getAchievement(id)?.name}: {getAchievement(id)?.description}
        </P>
      ))}
      {matchLine && <P soft>{matchLine}</P>}
    </View>
  );
}

const rowsText = (row: number | null) => (row === null ? 'missed' : row > 6 ? 'sudden death' : `${row}/6`);
const secs = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

/** Tints the canvas slightly toward another color (sudden death dusk). */
function mix(a: string, b: string, t = 0.12): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  rivalCard: {
    marginHorizontal: space.base,
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 110,
  },
  rivalCardShared: { minHeight: 0, paddingVertical: space.sm },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  suddenDeath: { textAlign: 'center', fontWeight: '800', marginTop: space.sm, letterSpacing: 1 },
  boardArea: { flex: 1, justifyContent: 'center', gap: space.sm, paddingVertical: space.sm },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.base,
    paddingBottom: space.sm,
    minHeight: 40,
  },
  scout: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  resultScroll: { padding: space.base, gap: space.sm },
  result: { borderWidth: 1, borderRadius: radius.panel, padding: space.base, gap: space.sm },
  resultButtons: { flexDirection: 'row', gap: space.sm },
  boards: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: space.sm },
  boardCol: { alignItems: 'center', gap: 6 },
  boardLabel: { fontWeight: '800', fontSize: 13 },
});
