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
  getOpponent,
  isMatchOver,
  msUntilNextDay,
  OPPONENT_ORDER,
  OpponentId,
  streakStatus,
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
