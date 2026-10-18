import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { FarLayer, MidLayer, SkyLayer, StreetLayer } from '../art/sundown';
import { fonts, useTheme } from '../theme';
import { Icon } from './ui';

interface Props {
  width: number;
  height: number;
  topInset: number;
  scrollY: SharedValue<number>;
  streak: number;
  freezes: number;
  onHelp(): void;
}

/** How far each layer trails the scroll: distant things move least. */
const DEPTH = { sky: 0.55, far: 0.42, mid: 0.28, street: 0.12 };

function Parallax({ scrollY, depth, children }: { scrollY: SharedValue<number>; depth: number; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: scrollY.get() * depth }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

/** Specks of dust drifting through the low sun, very slowly. */
const MOTES = [
  { x: 0.18, y: 0.42, r: 1.6, speed: 1 },
  { x: 0.36, y: 0.55, r: 1.1, speed: 0.7 },
  { x: 0.52, y: 0.38, r: 2, speed: 0.85 },
  { x: 0.64, y: 0.6, r: 1.3, speed: 1.2 },
  { x: 0.78, y: 0.46, r: 1.8, speed: 0.6 },
  { x: 0.9, y: 0.66, r: 1.2, speed: 0.95 },
  { x: 0.27, y: 0.7, r: 1.4, speed: 1.1 },
];

function Mote({ t, width, height, x, y, r, speed }: { t: SharedValue<number>; width: number; height: number } & (typeof MOTES)[number]) {
  const style = useAnimatedStyle(() => {
    const p = (t.get() * speed + x) % 1;
    return {
      opacity: 0.55 * Math.sin(p * Math.PI),
      transform: [{ translateX: p * width }, { translateY: y * height + Math.sin((t.get() * speed + x) * Math.PI * 4) * 6 }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.mote, { width: r * 2, height: r * 2, borderRadius: r }, style]} />;
}

/**
 * Main street at sundown, edge to edge: the wordmark in clear sky, the
 * streak as a brass medallion, four painted layers sliding at their own
 * depths as the page scrolls, and dust drifting in the light.
 */
export function MainStreetHero({ width, height, topInset, scrollY, streak, freezes, onHelp }: Props) {
  const { c, reducedMotion } = useTheme();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    t.set(withRepeat(withTiming(1, { duration: 22000, easing: Easing.linear }), -1, false));
  }, [reducedMotion, t]);

  const still = useSharedValue(0);
  const scroll = reducedMotion ? still : scrollY;

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: '#2a160e' }}>
      <Parallax scrollY={scroll} depth={DEPTH.sky}>
        <SkyLayer width={width} height={height} />
      </Parallax>
      {!reducedMotion && MOTES.map((m, i) => <Mote key={i} t={t} width={width} height={height} {...m} />)}
      <Parallax scrollY={scroll} depth={DEPTH.far}>
        <FarLayer width={width} height={height} />
      </Parallax>
      <Parallax scrollY={scroll} depth={DEPTH.mid}>
        <MidLayer width={width} height={height} />
      </Parallax>
      <Parallax scrollY={scroll} depth={DEPTH.street}>
        <StreetLayer width={width} height={height} youColor={c.you} rivalColor={c.rival} />
      </Parallax>

      <View style={[styles.titleBand, { top: topInset + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.wordmark} accessibilityRole="header">
            WORDOFF
          </Text>
          <Text style={styles.tagline}>ONE WORD · TWO GUNS · HIGH NOON</Text>
        </View>
        <View style={styles.right}>
          <View style={styles.medallion} accessibilityLabel={`${streak} day streak, ${freezes} freezes`}>
            <Icon name="fire" size={16} color="#3a2109" />
            <Text style={styles.medalNum}>{streak}</Text>
            {freezes > 0 && (
              <View style={styles.freeze}>
                <Icon name="snowflake" size={10} color="#f6ead2" />
                <Text style={styles.freezeNum}>{freezes}</Text>
              </View>
            )}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="How to duel" hitSlop={10} onPress={onHelp} style={styles.help}>
            <Icon name="help-circle-outline" size={24} color="#f3dfbd" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mote: { position: 'absolute', left: 0, top: 0, backgroundColor: '#ffe6b0' },
  titleBand: { position: 'absolute', left: 18, right: 10, flexDirection: 'row', alignItems: 'flex-start' },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: '#f8e8c8',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: { fontFamily: fonts.slabSemi, color: '#e9c48c', fontSize: 11, letterSpacing: 2.5, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  medallion: {
    minWidth: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#c8962e',
    borderWidth: 2,
    borderColor: '#f0c56a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 1,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  medalNum: { fontFamily: fonts.slab, fontSize: 17, color: '#2a160d' },
  freeze: {
    position: 'absolute',
    right: -6,
    bottom: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: '#24344f',
    borderRadius: 9,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#f0c56a',
  },
  freezeNum: { fontFamily: fonts.slab, fontSize: 10, color: '#f6ead2' },
  help: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
