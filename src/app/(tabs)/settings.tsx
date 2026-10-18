import { Card, H, P, Screen, Segmented, ToggleRow } from '../../components/ui';
import type { BoardStyle } from '../../engine';
import { ShotClock, ThemePref, useSettings } from '../../store/settings';

export default function SettingsScreen() {
  const s = useSettings();
  return (
    <Screen title="Settings" tab>
      <Card>
        <H>Rules</H>
        <P soft>Quick Duel board</P>
        <Segmented<BoardStyle>
          options={[
            { label: 'Shared (take turns)', value: 'shared' },
            { label: 'Split (standoff)', value: 'split' },
          ]}
          value={s.boardStyle}
          onChange={(v) => s.set('boardStyle', v)}
        />
        <P soft>
          {s.boardStyle === 'shared'
            ? 'One board: you and your rival take turns and see every guess.'
            : 'Two boards: both lock in at once, then 3-2-1 DRAW. You only see your rival’s colors.'}
        </P>
        <ToggleRow
          label="Hard mode"
          detail="Every revealed hint must be used in later guesses."
          value={s.hardMode}
          onChange={(v) => s.set('hardMode', v)}
        />
        <P soft>Shot clock (seconds per guess; at zero you fire a blank)</P>
        <Segmented<ShotClock>
          options={[
            { label: 'Off', value: null },
            { label: '20s', value: 20 },
            { label: '30s', value: 30 },
            { label: '60s', value: 60 },
          ]}
          value={s.shotClock}
          onChange={(v) => s.set('shotClock', v)}
        />
        <P soft>Rule changes apply from your next standoff.</P>
      </Card>

      <Card>
        <H>Feel</H>
        <ToggleRow label="Taunts" detail="Let your rival talk trash." value={s.taunts} onChange={(v) => s.set('taunts', v)} />
        <ToggleRow label="Haptics" value={s.haptics} onChange={(v) => s.set('haptics', v)} />
        <ToggleRow
          label="Reduce motion"
          detail="Swap flips and slams for quick fades."
          value={s.reducedMotion}
          onChange={(v) => s.set('reducedMotion', v)}
        />
      </Card>

      <Card>
        <H>Look</H>
        <ToggleRow
          label="Colorblind tiles"
          detail="Orange and blue instead of green and yellow."
          value={s.colorblind}
          onChange={(v) => s.set('colorblind', v)}
        />
        <Segmented<ThemePref>
          options={[
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
          value={s.theme}
          onChange={(v) => s.set('theme', v)}
        />
      </Card>
    </Screen>
  );
}
