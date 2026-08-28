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
