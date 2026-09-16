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
