import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * The card table's felt, lit from above: a warm pool of lamplight in the
 * middle falling off to darker edges, a fine nap in the cloth, and a thin
 * brass inlay just inside the rail.
 */
export function FeltLight({ color, tint }: { color: string; tint?: string }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
  };
  const { w, h } = size;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {w > 0 && (
        <Svg width={w} height={h}>
          <Defs>
            <RadialGradient id="lamp" cx="0.5" cy="0.38" rx="0.75" ry="0.55">
              <Stop offset="0" stopColor="#c7894f" stopOpacity="0.42" />
              <Stop offset="0.55" stopColor="#a3683a" stopOpacity="0.12" />
              <Stop offset="1" stopColor="#a3683a" stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="edge" cx="0.5" cy="0.45" rx="0.7" ry="0.65">
              <Stop offset="0.6" stopColor="#000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000" stopOpacity="0.42" />
            </RadialGradient>
            <Pattern id="nap" width={4} height={4} patternUnits="userSpaceOnUse">
              <Circle cx={1} cy={1} r={0.45} fill="#000" opacity={0.18} />
              <Circle cx={3} cy={3} r={0.4} fill="#ffe2b0" opacity={0.06} />
            </Pattern>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill={color} />
          {tint && <Rect x={0} y={0} width={w} height={h} fill={tint} opacity={0.35} />}
          <Rect x={0} y={0} width={w} height={h} fill="url(#nap)" />
          <Rect x={0} y={0} width={w} height={h} fill="url(#lamp)" />
          <Rect x={0} y={0} width={w} height={h} fill="url(#edge)" />
          {/* brass inlay inside the rail */}
          <Rect x={7} y={7} width={w - 14} height={h + 20} rx={14} fill="none" stroke="#c8962e" strokeWidth={1.2} opacity={0.45} />
        </Svg>
      )}
    </View>
  );
}

/** Thin grain lines for walnut rails, drawn once over a solid wood ground. */
export function WoodGrain({ lines = 5, color = '#3d2817', style }: { lines?: number; color?: string; style?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {Array.from({ length: lines }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: `${((i + 0.5) / lines) * 100}%`,
            left: `${(i * 37) % 40}%`,
            width: `${55 + ((i * 23) % 35)}%`,
            height: 1,
            backgroundColor: color,
            opacity: 0.55,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}
