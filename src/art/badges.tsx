import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export type BadgeFrame = 'star' | 'medal' | 'buckle';
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface BadgeArt {
  frame: BadgeFrame;
  icon: IconName;
}

/**
 * Each award's emblem and frame. Duel skills are lawman's stars, streaks and
 * milestones are ribboned medals, trail progress is a belt buckle.
 */
export const BADGES: Record<string, BadgeArt> = {
  'first-blood': { frame: 'star', icon: 'water' },
  quickdraw: { frame: 'star', icon: 'lightning-bolt' },
  deadeye: { frame: 'star', icon: 'target' },
  'rookie-wrangler': { frame: 'buckle', icon: 'lasso' },
  outdrawn: { frame: 'star', icon: 'pistol' },
  'sheriff-slayer': { frame: 'star', icon: 'skull-crossbones' },
  untouchable: { frame: 'star', icon: 'shield-star' },
  'last-bullet': { frame: 'star', icon: 'ammunition' },
  'photo-finish': { frame: 'medal', icon: 'camera-iris' },
  'hard-boiled': { frame: 'medal', icon: 'egg' },
  'beat-the-clock': { frame: 'medal', icon: 'timer-sand' },
  lightning: { frame: 'medal', icon: 'flash' },
  'week-warrior': { frame: 'medal', icon: 'calendar-week' },
  'iron-streak': { frame: 'medal', icon: 'anvil' },
  'hot-hand': { frame: 'medal', icon: 'fire' },
  'clean-sweep': { frame: 'medal', icon: 'broom' },
  centurion: { frame: 'medal', icon: 'horseshoe' },
  'trail-boss': { frame: 'buckle', icon: 'horse' },
  'gulch-runner': { frame: 'buckle', icon: 'cactus' },
  'high-noon': { frame: 'buckle', icon: 'weather-sunny' },
  sharpshooter: { frame: 'star', icon: 'crosshairs-gps' },
  'no-scouts': { frame: 'buckle', icon: 'account-cowboy-hat' },
};

const METAL = { hi: '#ecc56a', mid: '#c8962e', lo: '#8f6519', edge: '#6e4c12' };
const BLANK = { hi: '#5b4130', mid: '#4a3424', lo: '#3a281b', edge: '#2a1c12' };

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');
}

/** The frame, in polished brass (earned) or dark unpolished blank (locked). Plate centre is (50, 58). */
function Frame({ frame, earned, enamel }: { frame: BadgeFrame; earned: boolean; enamel: string }) {
  const m = earned ? METAL : BLANK;
  const plate = earned ? enamel : BLANK.lo;
  const grad = earned ? 'url(#metal)' : m.mid;
  if (frame === 'star') {
    const tips = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return [50 + Math.cos(a) * 46, 58 + Math.sin(a) * 46];
    });
    return (
      <G>
        <Path d={`M${starPoints(50, 60, 46, 27)} Z`} fill={m.edge} />
        <Path d={`M${starPoints(50, 58, 45, 26)} Z`} fill={grad} />
        {tips.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={5} fill={grad} stroke={m.edge} strokeWidth={1.2} />
        ))}
        <Circle cx={50} cy={58} r={23} fill={m.edge} />
        <Circle cx={50} cy={58} r={21} fill={plate} />
      </G>
    );
  }
  if (frame === 'medal') {
    return (
      <G>
        {/* ribbon: navy and oxblood stripes, the two seats */}
        <Path d="M30 0 L48 0 L44 34 L26 30 Z" fill={earned ? '#24344f' : BLANK.lo} />
        <Path d="M52 0 L70 0 L74 30 L56 34 Z" fill={earned ? '#9e2b25' : BLANK.lo} />
        <Rect x={36} y={0} width={4} height={30} fill={earned ? '#f6ead2' : BLANK.hi} opacity={0.5} />
        <Rect x={60} y={0} width={4} height={30} fill={earned ? '#f6ead2' : BLANK.hi} opacity={0.5} />
        <Circle cx={50} cy={64} r={36} fill={m.edge} />
        <Circle cx={50} cy={62} r={35} fill={grad} />
        <Circle cx={50} cy={62} r={29} fill="none" stroke={m.lo} strokeWidth={1.5} strokeDasharray="2 3" />
        <Circle cx={50} cy={62} r={23} fill={plate} />
      </G>
    );
  }
  return (
    <G>
      {/* belt buckle with a rope border and a tongue */}
      <Rect x={6} y={26} width={88} height={68} rx={18} fill={m.edge} />
      <Rect x={6} y={24} width={88} height={68} rx={18} fill={grad} />
      <Rect x={13} y={31} width={74} height={54} rx={13} fill="none" stroke={m.lo} strokeWidth={2} strokeDasharray="4 3" />
      <Rect x={46} y={14} width={8} height={16} rx={3} fill={grad} stroke={m.edge} strokeWidth={1.2} />
      <Circle cx={50} cy={58} r={20} fill={plate} />
    </G>
  );
}

/**
 * An award badge. Earned: polished brass, enamel plate, emblem. Locked: a
 * dark blank with no emblem (secret awards show a question mark).
 */
export function Badge({ id, earned, secret, size = 84 }: { id: string; earned: boolean; secret?: boolean; size?: number }) {
  const art = BADGES[id] ?? { frame: 'medal', icon: 'medal' };
  const enamel = secret ? '#7d2a22' : '#f6ead2';
  const iconColor = secret ? '#f6ead2' : '#2e1d13';
  const h = size * 1.1;
  // Plate centre in viewBox units (0..100 x 0..110) → points.
  const plateY = (58 / 110) * h;
  const icon = size * 0.3;
  return (
    <View style={{ width: size, height: h }}>
      <Svg width={size} height={h} viewBox="0 0 100 110">
        <Defs>
          <LinearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={METAL.hi} />
            <Stop offset="0.55" stopColor={METAL.mid} />
            <Stop offset="1" stopColor={METAL.lo} />
          </LinearGradient>
        </Defs>
        <Frame frame={art.frame} earned={earned} enamel={enamel} />
      </Svg>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: plateY - icon / 2, alignItems: 'center' }}
      >
        {earned ? (
          <MaterialCommunityIcons name={art.icon} size={icon} color={iconColor} />
        ) : secret ? (
          <MaterialCommunityIcons name="help" size={icon} color={BLANK.hi} />
        ) : (
          <MaterialCommunityIcons name="lock" size={icon * 0.8} color={BLANK.hi} />
        )}
      </View>
    </View>
  );
}
