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

export function ToggleRow({ label, detail, value, onChange }: { label: string; detail?: string; value: boolean; onChange(v: boolean): void }) {
  const { c } = useTheme();
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.body, { color: c.ink, fontWeight: '600' }]}>{label}</Text>
        {detail && <Text style={[styles.caption, { color: c.inkSoft }]}>{detail}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.you }} />
    </View>
  );
}

/** Placeholder duelist portrait until real character art exists (see DESIGN.md). */
export function Avatar({ profile, size = 44 }: { profile: OpponentProfile; size?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.rival, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.42 }}>{profile.name[0]}</Text>
    </View>
  );
}

export function Pips({ n, of = 3 }: { n: number; of?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`Difficulty ${n} of ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < n ? c.rival : c.hairline }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.base, gap: space.base, paddingBottom: space.xxl },
  card: { borderWidth: 1, borderRadius: radius.card, padding: space.base, gap: space.sm },
  display: { fontSize: 40, fontWeight: '800', letterSpacing: -1.2 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6 },
  heading: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: '500' },
  button: { height: 48, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  buttonLabel: { fontSize: 14, fontWeight: '700' },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.pill, padding: 3, gap: 3 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
});
