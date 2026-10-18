/**
 * Main street at sundown, painted in layers so each can move at its own speed:
 * sky and sun, hazy far mesas, near mesas, and the street with the saloon and
 * the two duelists. All layers share one coordinate space (390 wide, `vh` tall)
 * and anchor to the bottom, so extra height always goes to sky.
 */
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

export const SCENE_W = 390;

interface LayerProps {
  width: number;
  height: number;
}

const view = (width: number, height: number) => {
  const vh = (SCENE_W * height) / width;
  return { vh, horizon: vh - 96, box: `0 0 ${SCENE_W} ${vh}` };
};

/** Dusk sky, the sun's bloom, and a fine grain over everything. */
export function SkyLayer({ width, height }: LayerProps) {
  const { vh, horizon, box } = view(width, height);
  return (
    <Svg width={width} height={height} viewBox={box} preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2a160e" />
          <Stop offset="0.35" stopColor="#6e3418" />
          <Stop offset="0.7" stopColor="#c66a2a" />
          <Stop offset="1" stopColor="#f2c27a" />
        </LinearGradient>
        <RadialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#fff1cf" stopOpacity="0.9" />
          <Stop offset="0.35" stopColor="#f8c977" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#f0a24c" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={SCENE_W} height={vh} fill="url(#sky)" />
      <Circle cx={250} cy={horizon - 6} r={150} fill="url(#bloom)" />
      <Circle cx={250} cy={horizon - 6} r={44} fill="#fde7b6" />
    </Svg>
  );
}

/** Far mesas, washed out by distance and dust. */
export function FarLayer({ width, height }: LayerProps) {
  const { horizon, box } = view(width, height);
  const h = horizon;
  return (
    <Svg width={width} height={height} viewBox={box} preserveAspectRatio="xMidYMax slice">
      <Path
        d={`M0 ${h} L0 ${h - 26} L46 ${h - 26} L58 ${h - 50} L120 ${h - 50} L134 ${h - 24} L200 ${h - 24} L214 ${h - 40} L262 ${h - 40} L276 ${h - 20} L330 ${h - 20} L342 ${h - 46} L390 ${h - 46} L390 ${h} Z`}
        fill="#d48a4a"
        opacity={0.55}
      />
    </Svg>
  );
}

/** Near mesas and the saloon's false front, in shadow against the light. */
export function MidLayer({ width, height }: LayerProps) {
  const { horizon, box } = view(width, height);
  const h = horizon;
  return (
    <Svg width={width} height={height} viewBox={box} preserveAspectRatio="xMidYMax slice">
      <Path d={`M0 ${h} L0 ${h - 12} L80 ${h - 14} L96 ${h - 30} L150 ${h - 30} L164 ${h - 10} L390 ${h - 8} L390 ${h} Z`} fill="#8e4a24" />
      {/* the saloon, far left, windows lit */}
      <G transform={`translate(8 ${h - 74})`}>
        <Path d="M0 18 L0 10 L18 10 L18 4 L70 4 L70 10 L88 10 L88 18 L88 74 L0 74 Z" fill="#2a160d" />
        <Rect x={12} y={14} width={64} height={11} rx={1} fill="#3a2214" />
        <Rect x={16} y={17} width={56} height={5} rx={1} fill="#b8862b" opacity={0.85} />
        <Rect x={10} y={34} width={18} height={20} fill="#f2a94a" />
        <Rect x={60} y={34} width={18} height={20} fill="#f2a94a" />
        <Rect x={18.2} y={34} width={1.6} height={20} fill="#2a160d" />
        <Rect x={68.2} y={34} width={1.6} height={20} fill="#2a160d" />
        <Rect x={-2} y={58} width={92} height={4} fill="#1d0f08" />
        <Rect x={34} y={60} width={20} height={14} fill="#f2a94a" opacity={0.55} />
      </G>
      {/* a saguaro on the right edge */}
      <G transform={`translate(352 ${h - 64})`}>
        <Rect x={10} y={0} width={9} height={64} rx={4.5} fill="#2c2412" />
        <Path d="M10 34 L4 34 C1 34 0 31 0 28 L0 16 C0 13 6 13 6 16 L6 28 L10 28 Z" fill="#2c2412" />
        <Path d="M19 24 L25 24 C28 24 29 22 29 18 L29 9 C29 6 23 6 23 9 L23 18 L19 18 Z" fill="#2c2412" />
      </G>
    </Svg>
  );
}

/** One duelist in silhouette against the sun, feet at (0,0), facing right. */
function Duelist({ x, y, s, scarf, flip }: { x: number; y: number; s: number; scarf: string; flip?: boolean }) {
  const ink = '#140a05';
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* long shadow thrown toward the viewer by the low sun */}
      <Path d="M-8 0 L10 0 L-26 44 L-58 44 Z" fill="#000" opacity={0.28} />
      {/* hat: crown with a pinch, wide brim */}
      <Path d="M-8 -78 Q-7 -88 0 -86 Q7 -88 8 -78 Z" fill={ink} />
      <Path d="M-19 -77 Q0 -82 19 -77 Q0 -73 -19 -77 Z" fill={ink} />
      <Circle cx={0} cy={-68} r={6.5} fill={ink} />
      {/* scarf in the seat colour */}
      <Path d="M-6 -61 L7 -61 L4 -55 L-4 -55 Z" fill={scarf} />
      {/* duster coat flaring at the hem */}
      <Path d="M-9 -58 L9 -58 L12 -30 L16 -12 L-15 -12 L-11 -30 Z" fill={ink} />
      {/* legs and boots */}
      <Path d="M-9 -14 L-3 -14 L-4 -1 L-11 0 Z" fill={ink} />
      <Path d="M3 -14 L9 -14 L11 0 L4 -1 Z" fill={ink} />
      {/* drawing arm and revolver */}
      <Path d="M6 -54 L26 -50 L26 -46 L6 -49 Z" fill={ink} />
      <Path d="M25 -52 L35 -52 L35 -49 L28 -49 L27 -45 L25 -45 Z" fill={ink} />
    </G>
  );
}

/** The street: packed dirt warmed by the sun, the two duelists, and grain. */
export function StreetLayer({ width, height, youColor, rivalColor }: LayerProps & { youColor: string; rivalColor: string }) {
  const { vh, horizon, box } = view(width, height);
  const h = horizon;
  return (
    <Svg width={width} height={height} viewBox={box} preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7a4426" />
          <Stop offset="1" stopColor="#3a2014" />
        </LinearGradient>
        <RadialGradient id="glow" cx="0.64" cy="0" r="0.6">
          <Stop offset="0" stopColor="#f2b062" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#f2b062" stopOpacity="0" />
        </RadialGradient>
        <Pattern id="grain" width={6} height={6} patternUnits="userSpaceOnUse">
          <Circle cx={1} cy={1} r={0.5} fill="#fff" opacity={0.25} />
          <Circle cx={4} cy={3.5} r={0.45} fill="#000" opacity={0.3} />
        </Pattern>
      </Defs>
      <Rect x={0} y={h} width={SCENE_W} height={vh - h} fill="url(#dirt)" />
      <Rect x={0} y={h} width={SCENE_W} height={vh - h} fill="url(#glow)" />
      {/* wheel ruts converging on the sun */}
      <Path d={`M120 ${vh} Q190 ${h + 30} 236 ${h}`} stroke="#2e180d" strokeWidth={2} opacity={0.4} fill="none" />
      <Path d={`M300 ${vh} Q270 ${h + 30} 262 ${h}`} stroke="#2e180d" strokeWidth={2} opacity={0.4} fill="none" />
      <Ellipse cx={250} cy={h + 2} rx={70} ry={3} fill="#f8cf8a" opacity={0.35} />
      <Duelist x={150} y={h + 52} s={0.95} scarf={youColor} />
      <Duelist x={318} y={h + 52} s={0.95} scarf={rivalColor} flip />
      <Rect x={0} y={0} width={SCENE_W} height={vh} fill="url(#grain)" opacity={0.18} />
    </Svg>
  );
}
