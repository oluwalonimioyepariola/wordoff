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
