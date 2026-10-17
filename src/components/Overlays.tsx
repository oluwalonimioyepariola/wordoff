import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { CountBeat } from '../game/useStandoff';
import { fonts, motion, radius, useTheme } from '../theme';

/** "3 · 2 · 1 · DRAW!" stamped over the table. */
export function CountdownOverlay({ beat }: { beat: CountBeat | null }) {
  const { c, reducedMotion } = useTheme();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (beat === null) {
      opacity.value = withTiming(0, { duration: 120 });
      return;
    }
    opacity.value = withTiming(1, { duration: 80 });
    if (reducedMotion) {
      scale.value = 1;
    } else if (beat === 'draw') {
      scale.value = 1.6;
      scale.value = withSpring(1, { damping: 11, stiffness: 240 });
    } else {
      scale.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: 200 }));
    }
  }, [beat, reducedMotion, opacity, scale]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));
  const draw = beat === 'draw';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.center, style]}>
        {beat !== null && (
          <View
            style={[
              styles.badge,
              draw
                ? { backgroundColor: c.walnut, borderColor: c.brass, borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }
                : { backgroundColor: c.card, borderColor: c.cardEdge, borderWidth: 2 },
            ]}
          >
            <Text style={[styles.text, { color: draw ? c.brass : c.cardInk }]}>{draw ? 'DRAW!' : beat}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/** The rival's line, written on a cream slip that fades in, holds, and fades out. */
export function TauntBubble({ text, id }: { text: string | null; id: number | null }) {
  const { c, reducedMotion } = useTheme();
  const opacity = useSharedValue(0);
  const y = useSharedValue(6);

  useEffect(() => {
    if (!text) return;
    const fade = reducedMotion ? 0 : 200;
    opacity.value = withSequence(
      withTiming(1, { duration: fade }),
      withDelay(motion.taunt, withTiming(0, { duration: fade })),
    );
    y.value = reducedMotion
      ? 0
      : withSequence(withTiming(0, { duration: fade }), withDelay(motion.taunt, withTiming(6, { duration: fade })));
  }, [id, text, reducedMotion, opacity, y]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  if (!text) return null;
  return (
    <Animated.View accessibilityLiveRegion="polite" style={[styles.bubble, { backgroundColor: c.card, borderColor: c.rival }, style]}>
      <Text style={[styles.bubbleText, { color: c.cardInk }]}>“{text}”</Text>
    </Animated.View>
  );
}

/** Brief notice over the table (e.g. "Not in word list"). */
export function Toast({ message, id }: { message: string | null; id: number | null }) {
  const { c } = useTheme();
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!message) return;
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withDelay(1500, withTiming(0, { duration: 200 })));
  }, [id, message, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { backgroundColor: c.walnut, borderColor: c.brass }, style]}>
      <Text style={{ color: c.walnutInk, fontFamily: fonts.slabSemi, fontSize: 16 }}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 30, paddingVertical: 10, borderRadius: radius.panel },
  text: { fontFamily: fonts.display, fontSize: 58, letterSpacing: 1 },
  bubble: { borderWidth: 1, borderRadius: radius.card, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start', maxWidth: 230 },
  bubbleText: { fontSize: 13, fontStyle: 'italic' },
  toast: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.card,
    borderWidth: 1,
    zIndex: 10,
  },
});
