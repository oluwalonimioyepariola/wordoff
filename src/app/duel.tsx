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
