import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Light status bar text while a dark screen (sundown sky, walnut room) is
 * focused. Mounted only when focused, so leaving the screen hands control
 * back to the root status bar without racing the next screen's focus.
 */
export function LightStatusBar() {
  const focused = useIsFocused();
  return focused ? <StatusBar style="light" /> : null;
}
