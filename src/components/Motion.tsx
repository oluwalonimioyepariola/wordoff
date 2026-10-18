import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Cartridge, MuzzleFlash, Revolver, Tumbleweed } from '../art';
import { fonts, useTheme } from '../theme';

/** Strong ease-out for UI motion; nothing here eases in. */
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * A revolver that kicks and flashes each time `shotKey` changes.
 * Feedback for a shot: recoil and flash both finish inside 150ms.
 */
export function Gunfire({ shotKey, flip = false, width = 56 }: { shotKey: number; flip?: boolean; width?: number }) {
  const { reducedMotion } = useTheme();
  const kick = useSharedValue(0);
  const flash = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    // The first value is whatever the duel resumed at: not a shot.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    flash.set(withSequence(withTiming(1, { duration: 30 }), withTiming(0, { duration: 120, easing: EASE_OUT })));
    if (!reducedMotion) {
      kick.set(withSequence(withTiming(1, { duration: 40 }), withTiming(0, { duration: 110, easing: EASE_OUT })));
    }
  }, [shotKey, reducedMotion, kick, flash]);

  const dir = flip ? -1 : 1;
  const gunStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -6 * dir * kick.get() }, { rotate: `${-14 * dir * kick.get()}deg` }],
  }));
  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.get(),
    transform: [{ scale: 0.7 + 0.5 * flash.get() }],
  }));

  return (
    <View style={{ width: width + 26, height: width / 2 + 6, justifyContent: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ position: 'absolute', [flip ? 'right' : 'left']: 0 }, gunStyle]}>
        <Revolver width={width} flip={flip} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', top: -6, [flip ? 'left' : 'right']: -6 }, flashStyle]}
      >
        <MuzzleFlash size={30} />
      </Animated.View>
    </View>
  );
}

/**
 * Rounds left in the chamber: one cartridge per shot still to fire. A fired
 * round lifts out and fades (150ms); the empties stay as hollow outlines.
 */
export function AmmoBelt({ left, total, size = 24 }: { left: number; total: number; size?: number }) {
  const { reducedMotion } = useTheme();
  const count = Math.max(total, left);
  return (
    <View style={styles.belt} accessibilityLabel={`${left} shot${left === 1 ? '' : 's'} left`}>
      {Array.from({ length: count }, (_, i) =>
        i < left ? (
          <Animated.View key={`live-${i}`} exiting={reducedMotion ? undefined : FadeOutUp.duration(150)}>
            <Cartridge height={size} />
          </Animated.View>
        ) : (
          <View key={`spent-${i}`}>
            <Cartridge height={size} spent />
          </View>
        ),
      )}
    </View>
  );
}

/**
 * A tumbleweed blowing across the felt once: the quiet before sudden death.
 * Rare moment, so it gets a little theatre; skipped under reduced motion.
 */
export function TumbleweedRoll({ trackWidth }: { trackWidth: number }) {
  const { reducedMotion } = useTheme();
  const x = useSharedValue(0);
  const hop = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    x.set(withTiming(1, { duration: 2600, easing: Easing.linear }));
    hop.set(withRepeat(withSequence(withTiming(1, { duration: 220, easing: EASE_OUT }), withTiming(0, { duration: 220 })), 6));
  }, [reducedMotion, x, hop]);

  const style = useAnimatedStyle(() => ({
    opacity: x.get() > 0 && x.get() < 1 ? 1 : 0,
    transform: [
      { translateX: -60 + (trackWidth + 120) * x.get() },
      { translateY: -10 * hop.get() },
      { rotate: `${x.get() * 900}deg` },
    ],
  }));
  if (reducedMotion) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.tumble, style]}>
      <Tumbleweed size={40} />
    </Animated.View>
  );
}

/** A full-table flash for the instant of DRAW!, gone in 200ms. */
export function DrawFlash({ fire }: { fire: number }) {
  const { reducedMotion, c } = useTheme();
  const o = useSharedValue(0);
  useEffect(() => {
    if (fire === 0) return;
    o.set(withSequence(withTiming(reducedMotion ? 0.25 : 0.55, { duration: 20 }), withTiming(0, { duration: 200, easing: EASE_OUT })));
  }, [fire, reducedMotion, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.get() }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.card }, style]} />;
}

/**
 * The verdict stamp on the wanted poster: lands from 1.6x with a slight
 * rotation, 220ms after the poster settles. Plays once per result.
 */
export function Stamp({ text, color }: { text: string; color: string }) {
  const { reducedMotion } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withDelay(260, withTiming(1, { duration: reducedMotion ? 150 : 220, easing: EASE_OUT })));
  }, [reducedMotion, t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ rotate: '-12deg' }, { scale: reducedMotion ? 1 : 1.6 - 0.6 * t.get() }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.stamp, { borderColor: color }, style]}>
      <Text style={[styles.stampText, { color }]}>{text}</Text>
    </Animated.View>
  );
}

/** The poster itself eases in from 96% so the stamp has something to hit. */
export function PosterIn({ children }: { children: React.ReactNode }) {
  const { reducedMotion } = useTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withTiming(1, { duration: 250, easing: EASE_OUT }));
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ translateY: reducedMotion ? 0 : 12 * (1 - t.get()) }, { scale: reducedMotion ? 1 : 0.96 + 0.04 * t.get() }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  belt: { flexDirection: 'row', gap: 3, alignItems: 'flex-end' },
  tumble: { position: 'absolute', bottom: 64, left: 0 },
  stamp: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: 'rgba(246,234,210,0.55)',
  },
  stampText: { fontFamily: fonts.display, fontSize: 30, letterSpacing: 2 },
});
