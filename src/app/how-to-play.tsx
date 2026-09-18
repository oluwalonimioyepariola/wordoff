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
      <P>You and your rival hunt the same secret five-letter word, each on your own board.</P>

      <Card>
        <H>1 · Lock in</H>
        <P>Type a guess and hit FIRE. Your rival aims at the same time. Neither of you sees the other’s guess.</P>
      </Card>

      <Card>
        <H>2 · Draw!</H>
        <P>When both are locked: 3, 2, 1, DRAW! Both rows flip at once.</P>
        <Example word="crate" answer="trace" />
        <P soft>Green: right spot. Yellow: in the word, wrong spot. Gray: not in the word.</P>
        <P soft>You see your rival’s colors, never their letters, and they see only yours.</P>
      </Card>

      <Card>
        <H>3 · Win the standoff</H>
        <P>First to solve wins. Solve on the same row and the faster total aim wins (a photo finish).</P>
        <P>Nobody solves in six? Sudden death: one letter is revealed to both, and each of you gets one last shot.</P>
      </Card>

      <Card>
        <H>Every day</H>
        <P>A new Daily Standoff drops at midnight: same word and same rival for everyone. Play daily to grow your 🔥 streak. Every 7 days earns a ❄️ freeze that saves your streak if you miss a day.</P>
      </Card>

      <Button label="Saddle up" onPress={done} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginVertical: 4 },
});
