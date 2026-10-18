import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../art/badges';
import { getAchievement } from '../../engine';
import { useProfile } from '../../store/profile';
import { fonts, space, useTheme } from '../../theme';

/** One badge taken down off the wall: large, with what it's for. */
export default function AwardSheet() {
  const { c } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const award = getAchievement(id);
  const at = useProfile((s) => s.stats.achievements[id]);
  if (!award) return null;
  const hidden = award.secret && !at;

  return (
    <View style={[styles.sheet, { backgroundColor: c.canvas }]}>
      <Badge id={award.id} earned={!!at} secret={award.secret} size={150} />
      <Text style={[styles.name, { color: c.ink }]}>{hidden ? 'Secret badge' : award.name}</Text>
      <Text style={[styles.desc, { color: c.inkSoft }]}>{hidden ? 'Keep dueling. This one finds you.' : award.description}</Text>
      <View style={[styles.status, { backgroundColor: at ? c.brass : c.surface, borderColor: at ? c.brassDeep : c.hairline }]}>
        <Text style={[styles.statusText, { color: at ? c.onBrass : c.inkSoft }]}>
          {at ? `Earned ${new Date(at).toLocaleDateString()}` : 'Not earned yet'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, alignItems: 'center', paddingTop: space.xl, paddingHorizontal: space.lg, gap: space.md },
  name: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center' },
  desc: { fontSize: 17, textAlign: 'center', lineHeight: 24 },
  status: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, marginTop: space.xs },
  statusText: { fontFamily: fonts.slab, fontSize: 15 },
});
