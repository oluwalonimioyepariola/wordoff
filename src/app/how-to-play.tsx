import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Tile } from '../components/Tile';
import { Button, Card, H, P, Screen } from '../components/ui';
import { Mark, scoreGuess } from '../engine';
import { useSettings } from '../store/settings';

function Example({ word, answer }: { word: string; answer: string }) {
  const marks: Mark[] = scoreGuess(word, answer);
  return (
    <View style={styles.row}>
      {word.split('').map((l, i) => (
        <Tile key={i} letter={l} mark={marks[i]} size={40} />
      ))}
    </View>
  );
}

export default function HowToPlay() {
  const set = useSettings((s) => s.set);
  const done = () => {
    set('seenHowTo', true);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <H size="title">This town has one word</H>
      <P>You and your rival hunt the same secret word on one board, taking turns.</P>

      <Card>
        <H>1 · Take your shot</H>
        <P>On your turn, type a word and hit FIRE. Your row is marked “You”, your rival’s rows carry their initial.</P>
      </Card>

      <Card>
        <H>2 · Read the colors</H>
        <Example word="crate" answer="trace" />
        <P soft>Green: right spot. Yellow: in the word, wrong spot. Gray: not in the word.</P>
        <P>Every guess on the board helps you, even your rival’s. Use their colors too.</P>
      </Card>

      <Card>
        <H>3 · Land it first</H>
        <P>Whoever lands the word first wins. If the board fills up, sudden death reveals one letter and you each get one last shot.</P>
        <P soft>Prefer the classic? Settings → Split board: separate boards, both fire at once, 3-2-1 DRAW.</P>
      </Card>

      <Card>
        <H>Stuck? Scout</H>
        <P>Tap the brass Scout chips to reveal one letter of the word. It costs 10 seconds on your clock, which only matters if you both solve on the same row. Levels and Quick Duels give you scouts; the Daily doesn’t.</P>
      </Card>

      <Card>
        <H>Levels</H>
        <P>New to it? Start with Level mode: 30 levels from easy words against a clumsy rookie up to The Sheriff at high noon. Win to unlock the next level.</P>
      </Card>

      <Card>
        <H>Every day</H>
        <P>A new Daily Standoff drops at midnight, played by the classic standoff rules: separate boards, both fire at once, 3-2-1 DRAW. Everyone gets the same word and the same rival game, so your share card means something. Play daily to grow your streak. Every 7 days earns a freeze that saves your streak if you miss a day.</P>
      </Card>

      <Button label="Saddle up" onPress={done} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginVertical: 4 },
});
