import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LightStatusBar, StatusScrim } from '../game/statusBar';
import { fonts, space, useTheme } from '../theme';
import { PaperWear } from './WantedPoster';

export const PAPER = '#f1e1bf';
export const PAPER_INK = '#24160c';
export const PAPER_INK_SOFT = '#6a4c33';
export const PAPER_RULE = '#cdb48a';

/**
 * A dark plank-wall screen with a large cream title. `topInset` is false when
 * a native header already sits above (pushed screens).
 */
export function PlankScreen({ title, children, topInset = true }: { title?: string; children: React.ReactNode; topInset?: boolean }) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <LightStatusBar />
      <ScrollView
        contentContainerStyle={{ paddingTop: (topInset ? insets.top : 0) + space.sm, paddingBottom: 140, alignItems: 'center', gap: space.lg }}
        contentInsetAdjustmentBehavior={topInset ? 'never' : 'automatic'}
      >
        {title && (
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
        )}
        {children}
      </ScrollView>
      {topInset && <StatusScrim color={c.plank} height={insets.top} width={width} />}
    </View>
  );
}

/** An aged cream sheet nailed to the wall. */
export function PaperSheet({ children, tilt = 0 }: { children: React.ReactNode; tilt?: number }) {
  const { width } = useWindowDimensions();
  const [h, setH] = useState(0);
  const w = width - space.base * 2;
  return (
    <View
      style={[styles.sheet, { width: w, transform: [{ rotate: `${tilt}deg` }] }]}
      onLayout={(e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height)}
    >
      {h > 0 && <PaperWear width={w} height={h} />}
      <View style={styles.nail} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { alignSelf: 'stretch', paddingHorizontal: space.lg, fontFamily: fonts.slab, fontSize: 34, color: '#f3e3c3' },
  sheet: {
    backgroundColor: PAPER,
    borderRadius: 2,
    paddingHorizontal: space.lg,
    paddingTop: 30,
    paddingBottom: space.lg,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  nail: { position: 'absolute', top: 11, alignSelf: 'center', width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#3a2416' },
});
