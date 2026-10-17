import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Mark } from '../engine';
import { motion, radius, useTheme } from '../theme';

const LABEL: Record<Mark, string> = { correct: 'correct', present: 'in the word', absent: 'not in the word' };

interface Props {
  letter: string;
  /** Undefined while face down. */
  mark?: Mark;
  /** Flip into the mark with this delay instead of appearing instantly. */
  flipDelay?: number | null;
  /** Hop up after a winning reveal. */
  bounceDelay?: number | null;
  size: number;
  hint?: boolean;
}

export function Tile({ letter, mark, flipDelay = null, bounceDelay = null, size, hint }: Props) {
  const { c, markColor, reducedMotion } = useTheme();
  const flip = useSharedValue(mark && flipDelay === null ? 1 : 0);
  const pop = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    if (!mark) {
      flip.value = 0;
      return;
    }
    if (flipDelay === null || reducedMotion) {
      flip.value = withTiming(1, { duration: reducedMotion ? 150 : 0 });
    } else {
      flip.value = 0;
      flip.value = withDelay(flipDelay, withTiming(1, { duration: motion.flipHalf * 2 }));
    }
  }, [mark, flipDelay, reducedMotion, flip]);

  useEffect(() => {
    if (letter && !mark && !reducedMotion) {
      pop.value = withSequence(
        withTiming(1.12, { duration: motion.tilePop / 2 }),
        withTiming(1, { duration: motion.tilePop / 2 }),
      );
    }
  }, [letter, mark, reducedMotion, pop]);

  useEffect(() => {
    if (bounceDelay === null || reducedMotion) return;
    lift.value = withDelay(
      bounceDelay,
      withSequence(withTiming(-18, { duration: 130 }), withTiming(0, { duration: 130 })),
    );
  }, [bounceDelay, reducedMotion, lift]);

  const face = markColor(mark);
  const emptyBorder = letter ? c.inkSoft : c.hairline;
  const front = hint && !mark ? { bg: c.correct, fg: c.onCorrect } : { bg: 'transparent', fg: c.ink };

  const tileStyle = useAnimatedStyle(() => {
    const p = flip.value;
    const shown = p >= 0.5;
    const angle = shown ? (1 - p) * 180 : p * 180;
    return {
      transform: [{ perspective: 600 }, { translateY: lift.value }, { rotateX: `${angle}deg` }, { scale: pop.value }],
      backgroundColor: shown ? face.bg : front.bg,
      borderColor: shown ? face.bg : emptyBorder,
    };
  });
  const textStyle = useAnimatedStyle(() => ({ color: flip.value >= 0.5 ? face.fg : front.fg }));

  return (
    <Animated.View
      accessible
      accessibilityLabel={letter ? `${letter.toUpperCase()}${mark ? `, ${LABEL[mark]}` : ''}` : 'empty'}
      style={[styles.tile, { width: size, height: size }, tileStyle]}
    >
      {/* Full-width box: a tightly measured box clips narrow glyphs like "I" on iOS. */}
      <Animated.Text style={[styles.letter, { fontSize: size * 0.5, width: size }, textStyle]}>{letter.toUpperCase()}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 2,
    borderRadius: radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { fontWeight: '800', textAlign: 'center' },
});
