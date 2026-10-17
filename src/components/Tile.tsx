import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Mark } from '../engine';
import { fonts, motion, radius, useTheme } from '../theme';

const LABEL: Record<Mark, string> = { correct: 'correct', present: 'in the word', absent: 'not in the word' };

interface Props {
  letter: string;
  /** Undefined until the card is turned over and scored. */
  mark?: Mark;
  /** Turn over into the mark with this delay instead of appearing instantly. */
  flipDelay?: number | null;
  /** Hop up after a winning reveal. */
  bounceDelay?: number | null;
  size: number;
  /** A revealed hint letter (scout or sudden death), shown as a green card. */
  hint?: boolean;
  /** Dealt but not shown: the card's back faces up (the rival mid-aim, or a blank shot). */
  faceDown?: boolean;
}

/**
 * A playing card on the felt. Empty slots are a faint outline in the felt;
 * typed letters sit on cream card stock; on reveal the card turns over
 * (around its vertical axis) to its scored face.
 */
export function Tile({ letter, mark, flipDelay = null, bounceDelay = null, size, hint, faceDown }: Props) {
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
    if ((letter || faceDown) && !mark && !reducedMotion) {
      pop.value = withSequence(
        withTiming(1.1, { duration: motion.tilePop / 2 }),
        withTiming(1, { duration: motion.tilePop / 2 }),
      );
    }
  }, [letter, faceDown, mark, reducedMotion, pop]);

  useEffect(() => {
    if (bounceDelay === null || reducedMotion) return;
    lift.value = withDelay(
      bounceDelay,
      withSequence(withTiming(-16, { duration: 130 }), withTiming(0, { duration: 130 })),
    );
  }, [bounceDelay, reducedMotion, lift]);

  const scored = markColor(mark);
  const dealt = !!letter || !!faceDown || !!hint;
  // What the card shows before it is turned over.
  const front = faceDown
    ? { bg: c.cardBack, fg: 'transparent', edge: c.cardBack }
    : hint
      ? { bg: c.correct, fg: c.onCorrect, edge: c.correct }
      : dealt
        ? { bg: c.card, fg: c.cardInk, edge: c.cardEdge }
        : { bg: 'transparent', fg: c.cardInk, edge: c.feltInkSoft };

  const cardStyle = useAnimatedStyle(() => {
    const p = flip.value;
    const shown = p >= 0.5;
    const angle = shown ? (1 - p) * 180 : p * 180;
    return {
      transform: [{ perspective: 700 }, { translateY: lift.value }, { rotateY: `${angle}deg` }, { scale: pop.value }],
      backgroundColor: shown ? scored.bg : front.bg,
      borderColor: shown ? scored.bg : front.edge,
    };
  });
  const textStyle = useAnimatedStyle(() => ({ color: flip.value >= 0.5 ? scored.fg : front.fg }));
  const backStyle = useAnimatedStyle(() => ({ opacity: faceDown && flip.value < 0.5 ? 1 : 0 }));

  return (
    <Animated.View
      accessible
      accessibilityLabel={
        faceDown ? 'face-down card' : letter ? `${letter.toUpperCase()}${mark ? `, ${LABEL[mark]}` : ''}` : 'empty'
      }
      style={[
        styles.card,
        { width: size, height: size, borderStyle: dealt || mark ? 'solid' : 'dashed' },
        dealt || mark ? styles.raised : null,
        cardStyle,
      ]}
    >
      {/* The card back: an oxblood field with a brass diamond inside a cream printed border. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backWrap, backStyle]}>
        <View style={[styles.backBorder, { borderColor: c.card }]}>
          <View style={[styles.diamond, { width: size * 0.26, height: size * 0.26, backgroundColor: c.brass }]} />
        </View>
      </Animated.View>
      {/* Full-width box: a tightly measured box clips narrow glyphs like "I" on iOS. */}
      <Animated.Text style={[styles.letter, { fontSize: size * 0.54, width: size }, textStyle]}>
        {faceDown ? '' : letter.toUpperCase()}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: radius.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raised: {
    shadowColor: '#1a0f08',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  letter: { fontFamily: fonts.slab, textAlign: 'center' },
  backWrap: { padding: 3 },
  backBorder: { flex: 1, borderWidth: 1, borderRadius: radius.tile - 2, alignItems: 'center', justifyContent: 'center' },
  diamond: { transform: [{ rotate: '45deg' }] },
});
