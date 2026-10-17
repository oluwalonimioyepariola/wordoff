import { Text, View } from 'react-native';
import { Card, Icon, P, Screen } from '../components/ui';
import { ACHIEVEMENTS } from '../engine';
import { useProfile } from '../store/profile';
import { fonts, useTheme } from '../theme';

export default function AchievementsScreen() {
  const { c } = useTheme();
  const unlocked = useProfile((s) => s.stats.achievements);
  const count = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

  return (
    <Screen title="Achievements">
      <P soft>
        {count} of {ACHIEVEMENTS.length} unlocked
      </P>
      {ACHIEVEMENTS.map((a) => {
        const at = unlocked[a.id];
        const hidden = a.secret && !at;
        return (
          <Card key={a.id} style={{ opacity: at ? 1 : 0.6, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name={at ? 'medal' : hidden ? 'help-circle-outline' : 'lock-outline'} size={30} color={at ? c.brass : c.inkSoft} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontFamily: fonts.slab, fontSize: 17 }}>{hidden ? 'Secret' : a.name}</Text>
              <Text style={{ color: c.inkSoft }}>{hidden ? 'Keep dueling to find out.' : a.description}</Text>
              {at && <Text style={{ color: c.inkSoft, fontSize: 12 }}>Unlocked {new Date(at).toLocaleDateString()}</Text>}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
