import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, H, Icon, P, Screen } from '../../components/ui';
import { getOpponent, LEVEL_COUNT, levelBlurb, LEVELS, totalStars } from '../../engine';
import { useProfile } from '../../store/profile';
import { fonts, radius, useTheme } from '../../theme';

export default function LevelsScreen() {
  const { c } = useTheme();
  const stats = useProfile((s) => s.stats);
  const { unlocked, stars } = stats.levels;
  const chapters = [1, 2, 3].map((n) => LEVELS.filter((l) => l.chapter === n));
  const next = LEVELS.find((l) => l.id === unlocked)!;

  return (
    <Screen title="Levels" tab>
      <Card>
        <View style={styles.rowBetween}>
          <H>
            Level {Math.min(unlocked, LEVEL_COUNT)} of {LEVEL_COUNT}
          </H>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star-four-points" size={18} color={c.brass} />
            <Text style={{ color: c.ink, fontFamily: fonts.slab, fontSize: 18 }}>
              {totalStars(stats)}/{LEVEL_COUNT * 3}
            </Text>
          </View>
        </View>
        <P soft>
          Up next: {next.title}. {levelBlurb(next)}.
        </P>
      </Card>

      {chapters.map((levels) => {
        const first = levels[0];
        const rival = getOpponent(first.opponent);
        const open = first.id <= unlocked;
        return (
          <Card key={first.chapter} style={{ opacity: open ? 1 : 0.6 }}>
            <View style={styles.chapterHead}>
              <Avatar profile={rival} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.ink, fontFamily: fonts.slab, fontSize: 18 }}>
                  Chapter {first.chapter}: {first.chapterName}
                </Text>
                <Text style={{ color: c.inkSoft }}>
                  vs {rival.name} · {first.tier} words
                </Text>
              </View>
            </View>
            <View style={styles.grid}>
              {levels.map((l) => {
                const locked = l.id > unlocked;
                const got = stars[l.id] ?? 0;
                const current = l.id === unlocked;
                return (
                  <Pressable
                    key={l.id}
                    disabled={locked}
                    accessibilityRole="button"
                    accessibilityLabel={`Level ${l.id}, ${l.title}${locked ? ', locked' : `, ${got} stars`}`}
                    onPress={() => router.push({ pathname: '/duel', params: { mode: 'level', id: String(l.id) } })}
                    style={({ pressed }) => [
                      styles.level,
                      {
                        backgroundColor: current ? c.brass : locked ? c.canvas : c.card,
                        borderColor: current ? c.brassDeep : l.boss ? c.rival : c.cardEdge,
                        borderWidth: l.boss ? 2 : 1,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    {locked ? (
                      <Icon name="lock-outline" size={20} color={c.inkSoft} />
                    ) : (
                      <Text style={{ color: current ? c.onBrass : c.cardInk, fontFamily: fonts.slab, fontSize: 19 }}>{l.id}</Text>
                    )}
                    {!locked && (
                      <View style={{ flexDirection: 'row' }}>
                        {[0, 1, 2].map((i) => (
                          <Icon key={i} name="star-four-points" size={10} color={i < got ? (current ? c.onBrass : c.brass) : current ? c.brassDeep : c.cardEdge} />
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        );
      })}
      <P soft center>
        Early levels deal easy 4-letter words and brass scout chips. Land the word on your first or second shot for three stars.
      </P>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chapterHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  level: { width: 56, height: 56, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center' },
});
