import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { CountdownOverlay, TauntBubble, Toast } from '../components/Overlays';
import { RivalBoard } from '../components/RivalBoard';
import { SharedBoard } from '../components/SharedBoard';
import { Avatar, Button } from '../components/ui';
import {
  buildShareText,
  createDuel,
  dailyConfig,
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
import { fonts, radius, space, useTheme } from '../theme';

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
      return createDuel(dailyConfig(day, { hardMode: settings.hardMode, shotClockMs }));
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
  const rivalInitial = g.profile.name.replace('The ', '')[0];
  const over = g.phase === 'result' && !!state.outcome;
  const chip = 28;
  const tile = g.shared
    ? Math.floor(Math.min(60, (width - 2 * space.base - 2 * chip - (g.length + 1) * 7) / g.length, (height - 540) / state.maxRows))
    : Math.floor(Math.min(58, (width - 2 * space.base - (g.length - 1) * 7) / g.length, (height - 520) / state.maxRows));

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

  // Whose seat is live, in plain words.
  let status = ' ';
  let statusColor = c.feltInkSoft;
  let rivalBadge: { label: string; color: string } | null = null;
  if (!state.outcome) {
    if (g.shared) {
      if (g.rivalsTurn) {
        status = `${rivalName} is dealing a guess…`;
        rivalBadge = { label: 'AIMING', color: c.rival };
      } else if (g.yourTurn && g.phase === 'aiming') {
        status = 'Your shot. Fire a word.';
        statusColor = c.feltInk;
      }
    } else if (g.phase === 'aiming') {
      if (g.rivalLocked) rivalBadge = { label: 'LOCKED', color: c.rival };
      else rivalBadge = { label: 'AIMING', color: c.inkSoft };
      if (g.youLocked && !g.rivalLocked) status = `Locked in. Waiting for ${rivalName}…`;
      else if (g.rivalLocked && !g.youLocked) {
        status = `${rivalName} has locked in. Your move.`;
        statusColor = c.feltInk;
      } else status = `${rivalName} is picking a word…`;
    }
  }

  const stars = level && state.outcome ? starsFor(level, state.outcome.winner === 'you', state.boards.you.solvedRow) : 0;
  const hasNextLevel = level && stars > 0 && level.id < LEVEL_COUNT;
  const tableColor = state.suddenDeath && !state.outcome ? mix(c.felt, c.dusk, 0.35) : c.felt;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: c.walnut }}>
      {/* The duel sits on the walnut rail, so the status bar text goes light. */}
      <StatusBar style="light" />
      {/* Walnut rail: navigation and the rival's seat. */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <MaterialCommunityIcons name="chevron-left" size={26} color={c.walnutInk} />
        </Pressable>
        <Text style={[styles.title, { color: c.walnutInk }]} numberOfLines={1}>
          {title}
        </Text>
        {clock !== null ? (
          <View style={[styles.clock, { borderColor: clock <= 5 ? c.danger : c.brass }]}>
            <MaterialCommunityIcons name="timer-sand" size={14} color={clock <= 5 ? c.danger : c.brass} />
            <Text style={{ color: clock <= 5 ? c.danger : c.brass, fontFamily: fonts.slab, fontVariant: ['tabular-nums'] }}>{clock}s</Text>
          </View>
        ) : !state.outcome ? (
          <Pressable onPress={walkAway} hitSlop={12} accessibilityRole="button">
            <Text style={{ color: c.feltInkSoft, fontSize: 15 }}>Walk away</Text>
          </Pressable>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {!over && (
        <View style={styles.seat}>
          <Avatar profile={g.profile} size={46} />
          <View style={{ flex: 1, gap: 4 }}>
            <View style={styles.seatName}>
              <Text style={[styles.rivalName, { color: c.walnutInk }]}>{g.profile.name}</Text>
              {rivalBadge && (
                <View style={[styles.badge, { backgroundColor: rivalBadge.color }]}>
                  <Text style={[styles.badgeText, { color: c.card }]}>{rivalBadge.label}</Text>
                </View>
              )}
            </View>
            <TauntBubble text={g.taunt?.text ?? null} id={g.taunt?.id ?? null} />
          </View>
          {!g.shared && (
            <RivalBoard
              rows={g.rivalRows}
              totalRows={state.maxRows}
              length={g.length}
              cell={12}
              typing={g.phase === 'aiming' && !g.rivalLocked ? g.rivalTyped : g.rivalLocked && g.phase !== 'reveal' ? g.length : null}
            />
          )}
        </View>
      )}

      {/* The felt. */}
      <View style={[styles.table, { backgroundColor: tableColor, borderColor: c.feltDeep }]}>
        {state.suddenDeath && !state.outcome && (
          <View style={[styles.suddenDeath, { backgroundColor: c.danger }]}>
            <Text style={[styles.suddenDeathText, { color: c.card }]}>SUDDEN DEATH · ONE SHOT EACH</Text>
          </View>
        )}

        {over ? (
          <ScrollView contentContainerStyle={styles.resultScroll}>
            <ResultPanel
              state={state}
              rivalName={rivalName}
              rivalInitial={rivalInitial}
              unlocked={unlocked}
              stars={level ? stars : null}
              matchLine={
                match && mode === 'quick'
                  ? matchOver
                    ? match.winner === 'you'
                      ? `You took the match ${match.scores.you}–${match.scores.ai}.`
                      : match.winner === 'ai'
                        ? `${getOpponent(match.opponent).name} took the match ${match.scores.ai}–${match.scores.you}.`
                        : 'The match ends level.'
                    : `Match ${match.scores.you}–${match.scores.ai}, first to ${winsNeeded(match.bestOf)}.`
                  : null
              }
            />
            <View style={styles.resultButtons}>
              <View style={{ flex: 1 }}>
                <Button
                  kind="secondary"
                  onFelt
                  icon="share-variant"
                  label="Share"
                  onPress={() => Share.share({ message: buildShareText(state, { colorblind }) })}
                />
              </View>
              <View style={{ flex: 1 }}>
                {level ? (
                  hasNextLevel ? (
                    <Button label={`Level ${level.id + 1}`} icon="arrow-right" onPress={() => onLevel(level.id + 1)} />
                  ) : (
                    <Button label="Deal again" icon="refresh" onPress={onNext} />
                  )
                ) : mode === 'quick' && match && !matchOver ? (
                  <Button label="Next duel" icon="arrow-right" onPress={onNext} />
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
                    <Button kind="secondary" onFelt label="Replay" onPress={onNext} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Button kind="secondary" onFelt label="All levels" onPress={() => router.replace('/levels')} />
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
                  rivalDealt={g.rivalTyping !== null ? g.rivalTyping.length : null}
                  revealingRow={g.revealingRow}
                  hints={g.revealed}
                  rivalInitial={rivalInitial}
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

            {/* Your seat: what's happening, and your scout chips. */}
            <View style={styles.yourSeat}>
              <View style={[styles.youDot, { backgroundColor: c.you, borderColor: c.feltInk }]} />
              <Text style={[styles.status, { color: statusColor }]} numberOfLines={2}>
                {status}
              </Text>
              {(state.config.scouts ?? 0) > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Scout a letter, ${g.scoutsLeft} left`}
                  disabled={!g.canScout}
                  onPress={g.scout}
                  style={({ pressed }) => [styles.scout, { opacity: g.canScout ? (pressed ? 0.7 : 1) : 0.4 }]}
                >
                  <View style={styles.chipStack}>
                    {Array.from({ length: Math.max(1, g.scoutsLeft) }, (_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.scoutChip,
                          { backgroundColor: g.scoutsLeft ? c.brass : 'transparent', borderColor: c.card, marginLeft: i ? -14 : 0 },
                        ]}
                      >
                        {i === Math.max(1, g.scoutsLeft) - 1 && <MaterialCommunityIcons name="magnify" size={16} color={g.scoutsLeft ? c.onBrass : c.feltInkSoft} />}
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.scoutLabel, { color: c.feltInk }]}>Scout</Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      {!over && (
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.walnut }}>
          <Keyboard keys={g.keys} disabled={!g.canType} onLetter={g.typeLetter} onBack={g.backspace} onFire={g.submit} />
        </SafeAreaView>
      )}
      {over && <SafeAreaView edges={['bottom']} style={{ backgroundColor: tableColor }} />}
    </SafeAreaView>
  );
}

interface ResultProps {
  state: DuelState;
  rivalName: string;
  rivalInitial: string;
  unlocked: string[];
  stars: number | null;
  matchLine: string | null;
}

/** End of a duel, written on a cream card laid on the felt. */
function ResultPanel({ state, rivalName, rivalInitial, unlocked, stars, matchLine }: ResultProps) {
  const { c } = useTheme();
  const outcome = state.outcome!;
  const won = outcome.winner === 'you';
  return (
    <View style={[styles.result, { backgroundColor: c.card, borderColor: c.cardEdge }]}>
      <Text style={[styles.headline, { color: won ? c.you : outcome.winner === 'ai' ? c.rival : c.cardInk }]}>
        {outcomeHeadline(outcome)}
      </Text>
      {stars !== null && (
        <View style={styles.stars} accessibilityLabel={`${stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <MaterialCommunityIcons key={i} name="star-four-points" size={30} color={i < stars ? c.brass : c.cardEdge} />
          ))}
        </View>
      )}
      <Text style={[styles.word, { color: c.cardInk }]}>
        The word was <Text style={{ fontFamily: fonts.slab }}>{state.config.answer.toUpperCase()}</Text>
        {outcome.reason === 'photo-finish' && ` · you ${secs(state.boards.you.totalMs)}, ${rivalName} ${secs(state.boards.ai.totalMs)}`}
      </Text>

      <View style={[styles.miniTable, { backgroundColor: c.felt }]}>
        {state.config.board === 'shared' ? (
          <SharedBoard
            shots={sharedRows(state)}
            totalRows={state.order?.length ?? 0}
            length={wordLengthOf(state)}
            owners={state.order ?? []}
            input={null}
            rivalDealt={null}
            revealingRow={null}
            hints={[]}
            rivalInitial={rivalInitial}
            tileSize={30}
            celebrate={won}
          />
        ) : (
          <View style={styles.boards}>
            <View style={styles.boardCol}>
              <Text style={[styles.boardLabel, { color: c.feltInk }]}>You · {rowsText(state.boards.you.solvedRow)}</Text>
              <RivalBoard rows={state.boards.you.rows} totalRows={state.boards.you.rows.length} cell={22} showLetters length={wordLengthOf(state)} />
            </View>
            <View style={styles.boardCol}>
              <Text style={[styles.boardLabel, { color: c.feltInk }]}>
                {rivalName} · {rowsText(state.boards.ai.solvedRow)}
              </Text>
              <RivalBoard rows={state.boards.ai.rows} totalRows={state.boards.ai.rows.length} cell={22} showLetters length={wordLengthOf(state)} />
            </View>
          </View>
        )}
      </View>

      {(state.scouted?.length ?? 0) > 0 && (
        <Text style={[styles.note, { color: c.inkSoft }]}>
          You scouted {state.scouted.length} letter{state.scouted.length > 1 ? 's' : ''}.
        </Text>
      )}
      {unlocked.map((id) => (
        <View key={id} style={styles.award}>
          <MaterialCommunityIcons name="medal" size={22} color={c.brass} />
          <Text style={[styles.note, { color: c.cardInk, flex: 1 }]}>
            <Text style={{ fontFamily: fonts.slab }}>{getAchievement(id)?.name}</Text> · {getAchievement(id)?.description}
          </Text>
        </View>
      ))}
      {matchLine && <Text style={[styles.note, { color: c.inkSoft }]}>{matchLine}</Text>}
    </View>
  );
}

const rowsText = (row: number | null) => (row === null ? 'missed' : row > 6 ? 'sudden death' : `${row}/6`);
const secs = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

/** Tints a colour toward another (sudden death dusk over the felt). */
function mix(a: string, b: string, t = 0.12): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm, paddingVertical: space.xs },
  back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.slab, fontSize: 18, textAlign: 'center' },
  clock: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  seat: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.base, paddingBottom: space.md, minHeight: 72 },
  seatName: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rivalName: { fontFamily: fonts.slab, fontSize: 19 },
  badge: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.slab, fontSize: 11, letterSpacing: 1 },
  table: { flex: 1, borderTopLeftRadius: radius.panel, borderTopRightRadius: radius.panel, borderWidth: 3, borderBottomWidth: 0, overflow: 'hidden' },
  suddenDeath: { alignSelf: 'center', marginTop: space.sm, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 4 },
  suddenDeathText: { fontFamily: fonts.slab, fontSize: 13, letterSpacing: 1.5 },
  boardArea: { flex: 1, justifyContent: 'center', paddingVertical: space.md },
  yourSeat: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.base, paddingBottom: space.sm, minHeight: 52 },
  youDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  status: { flex: 1, fontSize: 15, fontWeight: '600' },
  scout: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingLeft: 8 },
  chipStack: { flexDirection: 'row' },
  scoutChip: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scoutLabel: { fontFamily: fonts.slab, fontSize: 16 },
  resultScroll: { padding: space.base, gap: space.sm },
  result: { borderWidth: 1.5, borderRadius: radius.panel, padding: space.base, gap: space.sm, alignItems: 'center' },
  headline: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center' },
  stars: { flexDirection: 'row', gap: 6 },
  word: { fontSize: 17, textAlign: 'center' },
  miniTable: { alignSelf: 'stretch', borderRadius: radius.card, padding: space.md, alignItems: 'center', marginVertical: space.xs },
  boards: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch' },
  boardCol: { alignItems: 'center', gap: 6 },
  boardLabel: { fontFamily: fonts.slab, fontSize: 14 },
  note: { fontSize: 15, textAlign: 'center' },
  award: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'stretch' },
  resultButtons: { flexDirection: 'row', gap: space.sm },
});
