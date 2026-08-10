import * as Haptics from 'expo-haptics';
import { useSettings } from '../store/settings';

export type HapticKind = 'key' | 'lock' | 'error' | 'reveal' | 'win' | 'lose';

/** Fire-and-forget haptics that respect the user's setting. */
export function haptic(kind: HapticKind) {
  if (!useSettings.getState().haptics) return;
  const run = () => {
    switch (kind) {
      case 'key':
        return Haptics.selectionAsync();
      case 'lock':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'reveal':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'error':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      case 'win':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case 'lose':
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  run()?.catch(() => {});
}
