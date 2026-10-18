import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portrait } from '../art';
import { OpponentProfile } from '../engine';
import { fonts, radius, space, useTheme } from '../theme';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: string }) {
  const { c } = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? c.ink} />;
}

/**
 * A paper screen: cream card stock with walnut ink. Tab screens (`tab`) have
 * no navigation bar, so they set their own large title at the top.
 */
export function Screen({
  title,
  children,
  scroll = true,
  tab = false,
}: {
  title?: string;
  children: React.ReactNode;
  scroll?: boolean;
  tab?: boolean;
}) {
  const { c } = useTheme();
  const heading = tab && title ? <Text style={[styles.largeTitle, { color: c.ink }]} accessibilityRole="header">{title}</Text> : null;
  const body = scroll ? (
    <ScrollView contentContainerStyle={styles.scroll} contentInsetAdjustmentBehavior="automatic">
      {heading}
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1 }}>
      {heading}
      {children}
    </View>
  );
  return (
    <SafeAreaView edges={tab ? ['top', 'left', 'right'] : ['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: c.canvas }}>
      {!tab && title !== undefined && <Stack.Screen options={{ title }} />}
      {body}
    </SafeAreaView>
  );
}

/** A grouped section on paper (settings-style list surface). */
export function Card({ children, style, tint }: { children: React.ReactNode; style?: ViewStyle; tint?: string }) {
  const { c } = useTheme();
  return <View style={[styles.card, { backgroundColor: tint ?? c.surface, borderColor: c.hairline }, style]}>{children}</View>;
}

/** A felt panel: a piece of the saloon table on a paper screen. */
export function Felt({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { c } = useTheme();
  return <View style={[styles.felt, { backgroundColor: c.felt, borderColor: c.walnut }, style]}>{children}</View>;
}

export function H({
  children,
  size = 'heading',
  color,
}: {
  children: React.ReactNode;
  size?: 'display' | 'title' | 'heading';
  color?: string;
}) {
  const { c } = useTheme();
  return <Text style={[styles[size], { color: color ?? c.ink }]}>{children}</Text>;
}

export function P({ children, soft, center, color }: { children: React.ReactNode; soft?: boolean; center?: boolean; color?: string }) {
  const { c } = useTheme();
  return (
    <Text style={[styles.body, { color: color ?? (soft ? c.inkSoft : c.ink), textAlign: center ? 'center' : 'left' }]}>{children}</Text>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  icon,
  onFelt,
}: {
  label: string;
  onPress(): void;
  kind?: 'primary' | 'secondary' | 'rival';
  disabled?: boolean;
  icon?: IconName;
  /** Secondary buttons sitting on felt use the felt's ink. */
  onFelt?: boolean;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.brass : kind === 'rival' ? c.rival : 'transparent';
  const fg = kind === 'primary' ? c.onBrass : kind === 'rival' ? c.card : onFelt ? c.feltInk : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderWidth: kind === 'secondary' ? 1.5 : 0,
          borderColor: onFelt ? c.feltInkSoft : c.ink,
          opacity: disabled ? 0.4 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
        kind !== 'secondary' && styles.buttonRaised,
      ]}
    >
      {icon && <MaterialCommunityIcons name={icon} size={18} color={fg} />}
      <Text style={[styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number | null>({
  options,
  value,
  onChange,
  onFelt,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange(v: T): void;
  onFelt?: boolean;
}) {
  const { c } = useTheme();
  const ink = onFelt ? c.feltInk : c.ink;
  return (
    <View style={[styles.segmented, { borderColor: onFelt ? c.feltInkSoft : c.hairline }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, on && { backgroundColor: onFelt ? c.card : c.walnut }]}
          >
            <Text style={{ color: on ? (onFelt ? c.cardInk : c.walnutInk) : ink, fontFamily: fonts.slabSemi, fontSize: 15 }}>
              {o.label}
            </Text>
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
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.brass }} />
    </View>
  );
}

/** A tappable list row with a chevron (native grouped-list shape). */
export function LinkRow({ label, icon, onPress, last }: { label: string; icon: IconName; onPress(): void; last?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        { borderBottomColor: c.hairline, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={c.inkSoft} />
      <Text style={[styles.body, { color: c.ink, flex: 1 }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={c.inkSoft} />
    </Pressable>
  );
}

/** A rival's portrait in a brass-rimmed frame. */
export function Avatar({ profile, size = 44 }: { profile: OpponentProfile; size?: number }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel={`${profile.name} portrait`}>
      <Portrait who={profile.id} size={size} ring={c.brass} />
    </View>
  );
}

export function Pips({ n, of = 3, onFelt }: { n: number; of?: number; onFelt?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`Difficulty ${n} of ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <MaterialCommunityIcons key={i} name="star-four-points" size={14} color={i < n ? c.brass : onFelt ? c.feltInkSoft : c.hairline} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: space.base, gap: space.base, paddingBottom: space.xxl },
  card: { borderWidth: 1, borderRadius: radius.card, padding: space.base, gap: space.sm },
  felt: { borderWidth: 3, borderRadius: radius.panel, padding: space.base, gap: space.sm },
  display: { fontFamily: fonts.display, fontSize: 40, letterSpacing: 0.5 },
  largeTitle: { fontFamily: fonts.slab, fontSize: 34, marginTop: space.sm },
  title: { fontFamily: fonts.slab, fontSize: 28 },
  heading: { fontFamily: fonts.slab, fontSize: 21 },
  body: { fontSize: 16, lineHeight: 23 },
  caption: { fontSize: 12, fontWeight: '500' },
  button: { minHeight: 48, paddingHorizontal: 22, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  buttonRaised: { shadowColor: '#1a0f08', shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  buttonLabel: { fontFamily: fonts.slab, fontSize: 17, letterSpacing: 0.3 },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.button, padding: 3, gap: 3 },
  segment: { flex: 1, minHeight: 38, borderRadius: radius.button - 3, alignItems: 'center', justifyContent: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
});
