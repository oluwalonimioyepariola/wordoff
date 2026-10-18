import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Badge } from '../../art/badges';
import { WoodGrain } from '../../components/FeltTable';
import { getAchievement } from '../../engine';
import { useProfile } from '../../store/profile';
import { fonts, space } from '../../theme';

/** One badge taken down off the shelf and held under the lamp. */
export default function AwardSheet() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const award = getAchievement(id);
  const at = useProfile((s) => s.stats.achievements[id]);
  if (!award) return null;
  const hidden = award.secret && !at;

  return (
    <View style={styles.sheet}>
      <WoodGrain lines={14} color="#1a0f08" />
      <Svg pointerEvents="none" width={width} height={360} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="spot" cx="0.5" cy="0.32" rx="0.55" ry="0.5">
            <Stop offset="0" stopColor={at ? '#f2b660' : '#8a6a4a'} stopOpacity={at ? 0.5 : 0.25} />
            <Stop offset="1" stopColor="#f2b660" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={360} fill="url(#spot)" />
      </Svg>
      <View style={{ marginTop: space.xl }}>
        <Badge id={award.id} earned={!!at} secret={award.secret} size={150} />
      </View>
      <Text style={styles.name}>{hidden ? 'Secret badge' : award.name}</Text>
      <Text style={styles.desc}>{hidden ? 'Keep dueling. This one finds you.' : award.description}</Text>
      <View style={[styles.plate, at ? styles.plateOn : styles.plateOff]}>
        <View style={[styles.screw, { left: 4 }]} />
        <Text style={[styles.plateText, { color: at ? '#3a2109' : '#8a7458' }]}>
          {at ? `EARNED ${new Date(at).toLocaleDateString()}` : 'NOT YET EARNED'}
        </Text>
        <View style={[styles.screw, { right: 4 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, alignItems: 'center', paddingHorizontal: space.lg, gap: space.md, backgroundColor: '#24160d' },
  name: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', color: '#f3e3c3' },
  desc: { fontSize: 17, textAlign: 'center', lineHeight: 24, color: '#bfa47e' },
  plate: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 22, paddingVertical: 6, marginTop: space.xs },
  plateOn: { backgroundColor: '#c8962e', borderColor: '#f0c56a' },
  plateOff: { backgroundColor: '#2e1d12', borderColor: '#4a3020' },
  plateText: { fontFamily: fonts.slab, fontSize: 13, letterSpacing: 1.5 },
  screw: { position: 'absolute', top: '50%', width: 5, height: 5, marginTop: -2.5, borderRadius: 2.5, backgroundColor: '#6e4a12' },
});
