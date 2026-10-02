import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, H, P, Screen } from '../components/ui';
import { dayNumber, getOpponent, OPPONENT_ORDER, streakStatus, totalRecord, winRate } from '../engine';
import { useProfile } from '../store/profile';
import { useTheme } from '../theme';
