import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OpponentProfile } from '../engine';
import { radius, space, useTheme } from '../theme';

export function Screen({ title, children, scroll = true }: { title?: string; children: React.ReactNode; scroll?: boolean }) {
  const { c } = useTheme();
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.scroll}>{children}</ScrollView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: c.canvas }}>
      {title !== undefined && <Stack.Screen options={{ title }} />}
      {body}
    </SafeAreaView>
  );
}

export function Card({ children, style, tint }: { children: React.ReactNode; style?: ViewStyle; tint?: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: tint ?? c.surface, borderColor: c.hairline }, style]}>{children}</View>
  );
}

export function H({ children, size = 'heading' }: { children: React.ReactNode; size?: 'display' | 'title' | 'heading' }) {
  const { c } = useTheme();
  return <Text style={[styles[size], { color: c.ink }]}>{children}</Text>;
}
