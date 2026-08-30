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
import { motion, radius, useTheme } from '../theme';

/** "3 · 2 · 1 · DRAW!" over the boards before both rows are revealed. */
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
      scale.value = 0.4;
      scale.value = withSpring(1, { damping: 12, stiffness: 220 });
    } else {
      scale.value = withSequence(withTiming(1.15, { duration: 120 }), withTiming(1, { duration: 200 }));
    }
  }, [beat, reducedMotion, opacity, scale]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ scale: scale.value }] }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.center, style]}>
        {beat !== null && (
          <View
            style={[
              styles.badge,
              beat === 'draw' && { backgroundColor: c.ink, shadowColor: '#141313', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
            ]}
          >
            <Text style={[styles.text, { color: beat === 'draw' ? c.canvas : c.ink }]}>
              {beat === 'draw' ? 'DRAW!' : beat}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/** A speech bubble from the rival that fades in, holds, and fades out. */
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
    y.value = reducedMotion ? 0 : withSequence(withTiming(0, { duration: fade }), withDelay(motion.taunt, withTiming(6, { duration: fade })));
  }, [id, text, reducedMotion, opacity, y]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  if (!text) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[styles.bubble, { backgroundColor: c.rivalSoft, borderColor: c.rival }, style]}
    >
      <Text style={[styles.bubbleText, { color: c.ink }]}>“{text}”</Text>
    </Animated.View>
  );
}

/** Brief error toast (e.g. "Not in word list"). */
export function Toast({ message, id }: { message: string | null; id: number | null }) {
  const { c } = useTheme();
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!message) return;
    opacity.value = withSequence(withTiming(1, { duration: 100 }), withDelay(1400, withTiming(0, { duration: 200 })));
  }, [id, message, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { backgroundColor: c.ink }, style]}>
      <Text style={{ color: c.canvas, fontWeight: '700' }}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: radius.panel },
  text: { fontSize: 56, fontWeight: '800', letterSpacing: -1.2 },
  bubble: { borderWidth: 1, borderRadius: radius.card, paddingHorizontal: 12, paddingVertical: 8, maxWidth: 220 },
  bubbleText: { fontSize: 13, fontStyle: 'italic' },
  toast: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.card,
    zIndex: 10,
  },
});
