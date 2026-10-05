import { StyleSheet, Text, View } from 'react-native';
import { Card, P, Screen } from '../components/ui';
import { dateForDayNumber, dayNumber, getOpponent } from '../engine';
import { useProfile } from '../store/profile';
import { useTheme } from '../theme';

const DAYS_SHOWN = 35;
