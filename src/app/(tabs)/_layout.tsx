import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../theme';

/**
 * The saloon's five rooms, on the platform's own tab bar (Liquid Glass on
 * iOS 26, Material on Android). Tab switches never animate.
 */
export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <NativeTabs
      tintColor={c.brass}
      iconColor={{ default: c.inkSoft, selected: c.brass }}
      backgroundColor={c.surface}
      labelStyle={{ default: { color: c.inkSoft }, selected: { color: c.ink, fontWeight: '700' } }}
      indicatorColor={c.hairline}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'suit.spade', selected: 'suit.spade.fill' }} md="style" />
        <NativeTabs.Trigger.Label>Saloon</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="levels">
        <NativeTabs.Trigger.Icon sf={{ default: 'map', selected: 'map.fill' }} md="map" />
        <NativeTabs.Trigger.Label>Levels</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="achievements">
        <NativeTabs.Trigger.Icon sf={{ default: 'rosette', selected: 'rosette' }} md="military_tech" />
        <NativeTabs.Trigger.Label>Awards</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
