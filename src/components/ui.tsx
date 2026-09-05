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

export function P({ children, soft, center }: { children: React.ReactNode; soft?: boolean; center?: boolean }) {
  const { c } = useTheme();
  return (
    <Text style={[styles.body, { color: soft ? c.inkSoft : c.ink, textAlign: center ? 'center' : 'left' }]}>{children}</Text>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
}: {
  label: string;
  onPress(): void;
  kind?: 'primary' | 'secondary' | 'rival';
  disabled?: boolean;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.you : kind === 'rival' ? c.rival : c.surface;
  const fg = kind === 'secondary' ? c.ink : '#ffffff';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderRadius: kind === 'secondary' ? radius.pill : radius.button,
          borderWidth: kind === 'secondary' ? 1 : 0,
          borderColor: c.ink,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number | null>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange(v: T): void;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.segmented, { borderColor: c.hairline }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: c.ink }]}
          >
            <Text style={{ color: on ? c.canvas : c.ink, fontWeight: '700', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
