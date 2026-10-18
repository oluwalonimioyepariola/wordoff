import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * Light status bar text while a dark screen (sundown sky, walnut room) is
 * focused. Mounted only when focused, so leaving the screen hands control
 * back to the root status bar without racing the next screen's focus.
 */
export function LightStatusBar() {
  const focused = useIsFocused();
  return focused ? <StatusBar style="light" /> : null;
}

/** A fade from the screen's dark ground under the status bar, so the light clock never sits on paper. */
export function StatusScrim({ color, height, width }: { color: string; height: number; width: number }) {
  return (
    <Svg pointerEvents="none" width={width} height={height + 18} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id="statusScrim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="0.7" stopColor={color} stopOpacity="0.9" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height + 18} fill="url(#statusScrim)" />
    </Svg>
  );
}
