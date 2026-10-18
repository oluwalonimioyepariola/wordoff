import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { PAPER_INK, PAPER_INK_SOFT, PAPER_RULE, PaperSheet, PlankScreen } from '../../components/PaperPage';
import { Icon, type IconName } from '../../components/ui';
import type { BoardStyle } from '../../engine';
import { ShotClock, useSettings } from '../../store/settings';
import { fonts, space, useTheme } from '../../theme';

/** A ruled heading on the notice. */
function Heading({ children }: { children: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.headingText}>{children}</Text>
      <View style={styles.doubleRule} />
    </View>
  );
}

/** One preference line: icon, label and note on the left, a native switch on the right. */
function Toggle({ icon, label, note, value, onChange }: { icon: IconName; label: string; note?: string; value: boolean; onChange(v: boolean): void }) {
  const { c } = useTheme();
  return (
    <View style={styles.line}>
      <Icon name={icon} size={20} color={PAPER_INK_SOFT} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {note && <Text style={styles.note}>{note}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: c.brass, false: '#c9b08a' }} />
    </View>
  );
}

/** A row of choices set like brass tokens; the chosen one is struck in ink. */
function Choice<T extends string | number | null>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange(v: T): void }) {
  return (
    <View style={styles.choice}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.token, on ? styles.tokenOn : styles.tokenOff]}
          >
            <Text style={[styles.tokenText, { color: on ? '#f3e3c3' : PAPER_INK }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Settings, posted as the saloon's house preferences. */
export default function SettingsScreen() {
  const s = useSettings();
  return (
    <PlankScreen title="Settings">
      <PaperSheet>
        <Text style={styles.sheetTitle}>Rules of the House</Text>
        <Text style={styles.sheetSub}>Changes take hold from your next standoff.</Text>

        <Heading>How you duel</Heading>
        <View style={styles.block}>
          <Text style={styles.label}>Quick Duel table</Text>
          <Choice<BoardStyle>
            options={[
              { label: 'Shared', value: 'shared' },
              { label: 'Split', value: 'split' },
            ]}
            value={s.boardStyle}
            onChange={(v) => s.set('boardStyle', v)}
          />
          <Text style={styles.note}>
            {s.boardStyle === 'shared'
              ? 'One table: take turns and read every card.'
              : 'Two tables: both fire at once, 3-2-1 DRAW. You see only your rival’s colours.'}
          </Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>Shot clock</Text>
          <Choice<ShotClock>
            options={[
              { label: 'Off', value: null },
              { label: '20s', value: 20 },
              { label: '30s', value: 30 },
              { label: '60s', value: 60 },
            ]}
            value={s.shotClock}
            onChange={(v) => s.set('shotClock', v)}
          />
          <Text style={styles.note}>Run out of time and you fire a blank.</Text>
        </View>
        <Toggle icon="anvil" label="Hard mode" note="Every revealed letter must be used again." value={s.hardMode} onChange={(v) => s.set('hardMode', v)} />

        <Heading>At the table</Heading>
        <Toggle icon="chat-processing-outline" label="Taunts" note="Let your rival talk trash." value={s.taunts} onChange={(v) => s.set('taunts', v)} />
        <Toggle icon="vibrate" label="Haptics" value={s.haptics} onChange={(v) => s.set('haptics', v)} />
        <Toggle icon="motion-pause-outline" label="Reduce motion" note="Swap flips and slams for quick fades." value={s.reducedMotion} onChange={(v) => s.set('reducedMotion', v)} />

        <Heading>Looks</Heading>
        <Toggle icon="eye-outline" label="Colourblind cards" note="Orange and blue instead of green and gold." value={s.colorblind} onChange={(v) => s.set('colorblind', v)} />

        <View style={styles.signoff}>
          <Icon name="star-four-points" size={12} color={PAPER_INK_SOFT} />
          <Text style={styles.signoffText}>By order of the Sheriff</Text>
          <Icon name="star-four-points" size={12} color={PAPER_INK_SOFT} />
        </View>
      </PaperSheet>
    </PlankScreen>
  );
}

const styles = StyleSheet.create({
  sheetTitle: { fontFamily: fonts.display, fontSize: 22, color: PAPER_INK, textAlign: 'center', letterSpacing: 1 },
  sheetSub: { fontSize: 13, color: PAPER_INK_SOFT, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },
  heading: { marginTop: space.lg, marginBottom: 4 },
  headingText: { fontFamily: fonts.slab, fontSize: 18, color: PAPER_INK },
  doubleRule: { height: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: PAPER_INK, marginTop: 3, opacity: 0.7 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, borderBottomWidth: 1, borderBottomColor: PAPER_RULE, paddingVertical: 8 },
  block: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: PAPER_RULE },
  label: { fontFamily: fonts.slab, fontSize: 16, color: PAPER_INK },
  note: { fontSize: 13, color: PAPER_INK_SOFT, lineHeight: 18 },
  choice: { flexDirection: 'row', gap: 8 },
  token: { flex: 1, minHeight: 40, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  tokenOn: { backgroundColor: '#2e1d13', borderColor: '#2e1d13' },
  tokenOff: { backgroundColor: 'transparent', borderColor: '#b89a6e', borderStyle: 'dashed' },
  tokenText: { fontFamily: fonts.slab, fontSize: 15 },
  signoff: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: space.lg },
  signoffText: { fontSize: 13, color: PAPER_INK_SOFT, fontStyle: 'italic' },
});
