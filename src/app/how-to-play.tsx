import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Revolver } from '../art';
import { SeatChip } from '../components/SharedBoard';
import { Tile } from '../components/Tile';
import { Icon } from '../components/ui';
import { PaperWear } from '../components/WantedPoster';
import { Mark, scoreGuess } from '../engine';
import { useSettings } from '../store/settings';
import { fonts, space, useTheme } from '../theme';

const PAPER = '#f1e1bf';
const INK = '#24160c';
const INK_SOFT = '#6a4c33';

/** A strip of felt with one row on it, the way it looks at the table. */
function FeltRow({ who, word, answer, faceDown, felt }: { who: 'you' | 'ai'; word: string; answer?: string; faceDown?: boolean; felt: string }) {
  const marks: (Mark | undefined)[] = answer ? scoreGuess(word, answer) : [];
  return (
    <View style={[styles.feltRow, { backgroundColor: felt }]}>
      <SeatChip owner={who} label={who === 'you' ? 'YOU' : 'R'} size={30} active />
      {word.split('').map((l, i) => (
        <Tile key={i} letter={faceDown ? '' : l} faceDown={faceDown} mark={marks[i]} size={34} />
      ))}
    </View>
  );
}

function Ornament() {
  return (
    <View style={styles.ornament}>
      <View style={styles.ornLine} />
      <Icon name="star-four-points" size={12} color={INK_SOFT} />
      <View style={styles.ornLine} />
    </View>
  );
}

function Rule({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.rule}>
      <View style={styles.ruleHead}>
        <Text style={styles.ruleNum}>{n}</Text>
        <Text style={styles.ruleTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/**
 * How to duel, as the saloon's house rules: one aged handbill nailed to the
 * wall, each rule shown with the real pieces from the table.
 */
export default function HouseRules() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const set = useSettings((s) => s.set);
  const [sheetH, setSheetH] = useState(0);
  const sheetW = width - space.base * 2;
  const done = () => {
    set('seenHowTo', true);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.plank }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grabber} />
        <View style={[styles.sheet, { width: sheetW }]} onLayout={(e: LayoutChangeEvent) => setSheetH(e.nativeEvent.layout.height)}>
          {sheetH > 0 && <PaperWear width={sheetW} height={sheetH} />}
          <View style={styles.nail} />

          <Text style={styles.title} accessibilityRole="header">
            HOUSE RULES
          </Text>
          <Text style={styles.subtitle}>of the Wordoff Saloon</Text>
          <Text style={styles.lede}>One secret word. You and your rival take turns at it on the same table. Every card dealt is there for both of you to read.</Text>

          <Ornament />

          <Rule n="I" title="Take your shot">
            <Text style={styles.body}>On your turn, type a word and hit FIRE. Your rows carry your chip; your rival deals hers face down, then turns them over.</Text>
            <View style={{ gap: 6 }}>
              <FeltRow who="you" word="RATE" felt={c.felt} />
              <FeltRow who="ai" word="LAKE" faceDown felt={c.felt} />
            </View>
          </Rule>

          <Ornament />

          <Rule n="II" title="Read the cards">
            <FeltRow who="you" word="CRATE" answer="TRACE" felt={c.felt} />
            <View style={styles.legend}>
              {(
                [
                  ['correct', 'Right letter, right spot'],
                  ['present', 'In the word, wrong spot'],
                  ['absent', 'Not in the word'],
                ] as [Mark, string][]
              ).map(([m, label]) => (
                <View key={m} style={styles.legendItem}>
                  <Tile letter="" mark={m} size={20} />
                  <Text style={styles.legendText}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.body}>Your rival’s cards count too. Read every row on the felt.</Text>
          </Rule>

          <Ornament />

          <Rule n="III" title="Land it first">
            <View style={styles.inline}>
              <Revolver width={70} />
              <Text style={[styles.body, { flex: 1 }]}>Whoever turns over the whole word wins. If the table fills up, sudden death shows one letter and you each get a last shot.</Text>
            </View>
          </Rule>

          <Ornament />

          <Rule n="IV" title="Short of a clue? Scout">
            <View style={styles.inline}>
              <View style={styles.chip}>
                <Icon name="magnify" size={18} color="#2a160d" />
              </View>
              <Text style={[styles.body, { flex: 1 }]}>Spend a brass scout chip to reveal one letter. It costs ten seconds on your clock, which only matters in a dead-even finish.</Text>
            </View>
          </Rule>

          <Ornament />

          <Rule n="V" title="A new poster every day">
            <View style={styles.inline}>
              <View style={styles.medal}>
                <Icon name="fire" size={16} color="#2a160d" />
              </View>
              <Text style={[styles.body, { flex: 1 }]}>
                The Daily Standoff goes up at midnight: same word, same rival game for everyone, by standoff rules. Play daily to grow your streak; every seven days earns a freeze.
              </Text>
            </View>
          </Rule>

          <Text style={styles.footnote}>Rather duel the old way? Settings → Split board.</Text>

          <Pressable onPress={done} accessibilityRole="button" style={({ pressed }) => [styles.seal, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
            <View style={styles.sealInner}>
              <Icon name="pistol" size={20} color="#2a160d" />
              <Text style={styles.sealText}>SADDLE UP</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingTop: space.md, paddingBottom: space.xxl },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(241,225,191,0.4)', marginBottom: space.md },
  sheet: {
    backgroundColor: PAPER,
    borderRadius: 2,
    paddingHorizontal: space.lg,
    paddingTop: 34,
    paddingBottom: space.lg,
    gap: space.md,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  nail: { position: 'absolute', top: 12, alignSelf: 'center', width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#3a2416' },
  title: { fontFamily: fonts.display, fontSize: 40, color: INK, textAlign: 'center', letterSpacing: 3 },
  subtitle: { fontSize: 15, fontStyle: 'italic', color: INK_SOFT, textAlign: 'center', marginTop: -10 },
  lede: { fontSize: 16, lineHeight: 23, color: INK, textAlign: 'center' },
  ornament: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  ornLine: { flex: 1, height: 1, backgroundColor: '#b89a6e' },
  rule: { gap: space.sm },
  ruleHead: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  ruleNum: { fontFamily: fonts.display, fontSize: 22, color: '#9e2b25', minWidth: 30 },
  ruleTitle: { fontFamily: fonts.slab, fontSize: 21, color: INK, flex: 1 },
  body: { fontSize: 15, lineHeight: 22, color: INK },
  feltRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: 8, borderRadius: 10 },
  legend: { gap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendText: { fontSize: 14, color: INK },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c8962e',
    borderWidth: 2,
    borderColor: '#f6ead2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c8962e',
    borderWidth: 2,
    borderColor: '#f0c56a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footnote: { fontSize: 13, color: INK_SOFT, fontStyle: 'italic', textAlign: 'center', marginTop: space.xs },
  seal: { backgroundColor: '#c8962e', borderRadius: 6, padding: 3, marginTop: space.xs },
  sealInner: {
    minHeight: 48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#7a5310',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sealText: { fontFamily: fonts.display, fontSize: 18, color: '#2a160d', letterSpacing: 3 },
});
