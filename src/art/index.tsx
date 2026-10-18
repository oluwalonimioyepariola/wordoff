/**
 * Wordoff's authored vector art: the standoff's props and its cast.
 * Everything is drawn here in react-native-svg so it themes with the palette
 * and stays crisp at any size. No raster assets.
 */
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { OpponentId } from '../engine';

const WOOD = '#7a4a2a';
const WOOD_DARK = '#5a3420';
const STEEL = '#3b3734';
const STEEL_LIGHT = '#6d6660';
const BRASS = '#b8862b';
const BRASS_LIGHT = '#e0b552';
const COPPER = '#9a5a36';
const SKIN = '#e2b48a';
const SKIN_SHADE = '#c9946a';
const CREAM = '#f6ead2';
const INK = '#2e1d13';

/** A single-action revolver in profile, muzzle to the right. */
export function Revolver({ width = 72, flip = false }: { width?: number; flip?: boolean }) {
  return (
    <Svg width={width} height={width / 2} viewBox="0 0 120 60">
      <G transform={flip ? 'translate(120 0) scale(-1 1)' : undefined}>
        {/* barrel and ejector rod */}
        <Rect x={50} y={14} width={62} height={8} rx={2} fill={STEEL} />
        <Rect x={54} y={22} width={44} height={4} rx={2} fill={STEEL_LIGHT} />
        <Rect x={106} y={10} width={4} height={5} rx={1} fill={STEEL} />
        {/* frame */}
        <Path d="M30 12 L54 12 L54 34 L34 34 Z" fill={STEEL} />
        {/* cylinder with flutes */}
        <Rect x={36} y={12} width={20} height={19} rx={5} fill={STEEL_LIGHT} />
        <Line x1={40} y1={15} x2={40} y2={28} stroke={STEEL} strokeWidth={1.6} />
        <Line x1={46} y1={14} x2={46} y2={29} stroke={STEEL} strokeWidth={1.6} />
        <Line x1={52} y1={15} x2={52} y2={28} stroke={STEEL} strokeWidth={1.6} />
        {/* hammer */}
        <Path d="M31 12 L22 4 L26 1 L37 10 Z" fill={STEEL} />
        {/* trigger guard and trigger */}
        <Path d="M38 33 C38 46 56 46 56 33" fill="none" stroke={STEEL} strokeWidth={3} />
        <Path d="M46 33 L43 41" stroke={STEEL} strokeWidth={3} strokeLinecap="round" />
        {/* wooden grip with brass escutcheon */}
        <Path d="M31 30 C27 40 20 50 13 57 L28 59 C35 50 39 41 41 33 Z" fill={WOOD} />
        <Path d="M27 37 C24 44 20 50 16 55" stroke={WOOD_DARK} strokeWidth={1.5} fill="none" />
        <Circle cx={31} cy={44} r={2.2} fill={BRASS} />
      </G>
    </Svg>
  );
}

/** The flash at the muzzle when a shot is fired. */
export function MuzzleFlash({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path
        d="M20 0 L24 13 L38 8 L28 19 L40 22 L27 26 L33 39 L20 29 L9 38 L13 26 L0 22 L12 18 L4 6 L16 13 Z"
        fill={BRASS_LIGHT}
      />
      <Path d="M20 8 L23 16 L31 15 L25 21 L30 28 L21 25 L16 32 L16 24 L8 22 L15 18 L13 11 Z" fill={CREAM} />
    </Svg>
  );
}

/** One revolver cartridge: brass case, copper bullet. Spent rounds are hollow. */
export function Cartridge({ height = 26, spent = false }: { height?: number; spent?: boolean }) {
  return (
    <Svg width={height * 0.42} height={height} viewBox="0 0 12 30">
      {spent ? (
        <>
          <Rect x={1.5} y={11} width={9} height={17} rx={1} fill="none" stroke={BRASS} strokeWidth={1.4} />
          <Rect x={0.5} y={27} width={11} height={2.5} rx={0.8} fill={BRASS} opacity={0.6} />
        </>
      ) : (
        <>
          <Path d="M1.5 11 C1.5 3 10.5 3 10.5 11 Z" fill={COPPER} />
          <Rect x={1.5} y={10.5} width={9} height={17} rx={1} fill={BRASS} />
          <Rect x={3} y={12} width={1.6} height={13} rx={0.8} fill={BRASS_LIGHT} />
          <Rect x={0.5} y={26.5} width={11} height={3} rx={0.8} fill="#8f6519" />
        </>
      )}
    </Svg>
  );
}

/** A six-point lawman's star with ball tips. */
export function SheriffStar({ size = 28, color = BRASS }: { size?: number; color?: string }) {
  const tips = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [20 + Math.cos(a) * 17, 20 + Math.sin(a) * 17];
  });
  const star = Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI / 6) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 16 : 8;
    return `${20 + Math.cos(a) * r},${20 + Math.sin(a) * r}`;
  }).join(' ');
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Path d={`M${star} Z`} fill={color} />
      {tips.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={2.6} fill={color} />
      ))}
      <Circle cx={20} cy={20} r={4.5} fill={BRASS_LIGHT} />
    </Svg>
  );
}

/** A saguaro, for the edges of things. */
export function Cactus({ height = 60, color = '#4f6b2e' }: { height?: number; color?: string }) {
  return (
    <Svg width={height * 0.7} height={height} viewBox="0 0 42 60">
      <Rect x={16} y={4} width={10} height={56} rx={5} fill={color} />
      <Path d="M16 34 L9 34 C5 34 4 31 4 28 L4 16 C4 13 10 13 10 16 L10 27 L16 27 Z" fill={color} />
      <Path d="M26 26 L33 26 C36 26 38 24 38 20 L38 11 C38 8 32 8 32 11 L32 19 L26 19 Z" fill={color} />
    </Svg>
  );
}

/** A tumbleweed: loose rings of dry brush. */
export function Tumbleweed({ size = 44 }: { size?: number }) {
  const c = '#a8814f';
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      <Ellipse cx={22} cy={22} rx={19} ry={17} fill="none" stroke={c} strokeWidth={2} />
      <Ellipse cx={22} cy={22} rx={14} ry={19} fill="none" stroke={c} strokeWidth={1.6} transform="rotate(35 22 22)" />
      <Ellipse cx={22} cy={22} rx={18} ry={11} fill="none" stroke={c} strokeWidth={1.6} transform="rotate(-25 22 22)" />
      <Ellipse cx={22} cy={22} rx={9} ry={15} fill="none" stroke={c} strokeWidth={1.4} transform="rotate(80 22 22)" />
      <Path d="M8 14 L16 20 M30 10 L26 20 M36 28 L27 25 M12 33 L19 26" stroke={c} strokeWidth={1.4} />
    </Svg>
  );
}

/* ---------- The cast ---------- */

type Who = OpponentId | 'you';

const PORTRAIT_BG: Record<Who, string> = {
  rookie: '#9e2b25',
  gunslinger: '#9e2b25',
  sheriff: '#9e2b25',
  you: '#24344f',
};

function Rae() {
  return (
    <G>
      {/* shirt and bandana */}
      <Path d="M12 104 C16 80 32 74 50 74 C68 74 84 80 88 104 Z" fill="#c8b48a" />
      <Path d="M36 70 L64 70 L50 86 Z" fill="#7d2a22" />
      {/* braids */}
      <Path d="M34 46 C29 58 31 68 28 78" stroke="#7a3a1e" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M66 46 C71 58 69 68 72 78" stroke="#7a3a1e" strokeWidth={6} strokeLinecap="round" fill="none" />
      <Rect x={44} y={60} width={12} height={12} fill={SKIN_SHADE} />
      <Ellipse cx={50} cy={50} rx={16} ry={18} fill={SKIN} />
      {/* eyes, freckles, grin */}
      <Circle cx={44} cy={50} r={2.2} fill={INK} />
      <Circle cx={56} cy={50} r={2.2} fill={INK} />
      <Circle cx={41} cy={56} r={0.9} fill={SKIN_SHADE} />
      <Circle cx={44} cy={57} r={0.9} fill={SKIN_SHADE} />
      <Circle cx={56} cy={57} r={0.9} fill={SKIN_SHADE} />
      <Circle cx={59} cy={56} r={0.9} fill={SKIN_SHADE} />
      <Path d="M44 60 Q50 65 56 60" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* straw hat, tipped back */}
      <Ellipse cx={50} cy={36} rx={29} ry={6} fill="#d6b06a" transform="rotate(-6 50 36)" />
      <Path d="M35 36 C35 21 65 19 65 34 Z" fill="#e2c07c" />
      <Rect x={35} y={31} width={30} height={3.5} fill="#7d2a22" transform="rotate(-4 50 33)" />
    </G>
  );
}

function Dusty() {
  return (
    <G>
      {/* duster coat with turned collar and red neckerchief */}
      <Path d="M10 104 C14 80 32 73 50 73 C68 73 86 80 90 104 Z" fill="#6b4a33" />
      <Path d="M36 74 L50 92 L64 74 L58 72 L50 82 L42 72 Z" fill="#9e2b25" />
      <Rect x={44} y={60} width={12} height={13} fill={SKIN_SHADE} />
      <Ellipse cx={50} cy={51} rx={15} ry={18} fill={SKIN} />
      {/* stubble */}
      <Path d="M37 56 C39 68 61 68 63 56 C60 64 40 64 37 56 Z" fill={SKIN_SHADE} opacity={0.7} />
      {/* narrowed eyes under the brim */}
      <Path d="M41 49 L47 48.5" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M53 48.5 L59 49" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
      {/* moustache */}
      <Path d="M41 59 Q50 54 59 59 Q55 62 50 60 Q45 62 41 59 Z" fill="#3b2616" />
      {/* wide-brim hat pulled low */}
      <Path d="M14 40 Q50 31 86 40 Q50 47 14 40 Z" fill="#3b2616" />
      <Path d="M33 40 C33 19 67 19 67 40 Z" fill="#4a3020" />
      <Path d="M44 22 Q50 27 56 22" stroke="#3b2616" strokeWidth={2} fill="none" />
      <Rect x={33} y={34} width={34} height={4} fill={BRASS} />
    </G>
  );
}

function Sheriff() {
  return (
    <G>
      {/* vest over a cream shirt, with the star */}
      <Path d="M10 104 C14 80 32 73 50 73 C68 73 86 80 90 104 Z" fill="#2b2522" />
      <Path d="M43 73 L50 104 L57 73 Z" fill={CREAM} />
      <Rect x={44} y={60} width={12} height={13} fill={SKIN_SHADE} />
      <Ellipse cx={50} cy={51} rx={15} ry={18} fill={SKIN} />
      {/* stern brows and eyes */}
      <Path d="M39 45 L47 46.5" stroke="#cfc6bb" strokeWidth={2.6} strokeLinecap="round" />
      <Path d="M53 46.5 L61 45" stroke="#cfc6bb" strokeWidth={2.6} strokeLinecap="round" />
      <Circle cx={44} cy={50} r={1.8} fill={INK} />
      <Circle cx={56} cy={50} r={1.8} fill={INK} />
      {/* grey handlebar moustache */}
      <Path d="M38 59 Q44 54 50 58 Q56 54 62 59 Q65 63 61 63 Q56 59 50 61 Q44 59 39 63 Q35 63 38 59 Z" fill="#cfc6bb" />
      {/* tall black hat */}
      <Ellipse cx={50} cy={37} rx={30} ry={5.5} fill="#1f1a17" />
      <Path d="M34 37 L36 14 Q50 10 64 14 L66 37 Z" fill="#1f1a17" />
      <Rect x={34.5} y={31} width={31} height={3.5} fill="#5a4636" />
    </G>
  );
}

function Stranger() {
  return (
    <G>
      {/* poncho and a face lost under the hat's shadow */}
      <Path d="M8 104 L26 78 L50 72 L74 78 L92 104 Z" fill="#c8b48a" />
      <Path d="M20 92 L80 92" stroke="#7d2a22" strokeWidth={3} />
      <Path d="M24 98 L76 98" stroke="#24344f" strokeWidth={2} />
      <Rect x={44} y={60} width={12} height={13} fill={SKIN_SHADE} />
      <Ellipse cx={50} cy={52} rx={15} ry={17} fill={SKIN} />
      <Path d="M35 46 C40 52 60 52 65 46 L65 40 L35 40 Z" fill={SKIN_SHADE} />
      <Path d="M43 52 L48 52 M52 52 L57 52" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M45 62 L55 62" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M12 41 Q50 33 88 41 Q50 48 12 41 Z" fill="#1d2a40" />
      <Path d="M34 41 C34 22 66 22 66 41 Z" fill="#24344f" />
    </G>
  );
}

const FACES: Record<Who, () => React.JSX.Element> = { rookie: Rae, gunslinger: Dusty, sheriff: Sheriff, you: Stranger };

/** A duelist's portrait in a round frame, used for seats, posters and avatars. */
export function Portrait({ who, size = 48, ring = BRASS }: { who: Who; size?: number; ring?: string }) {
  const Face = FACES[who];
  const id = `clip-${who}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={id}>
          <Circle cx={50} cy={50} r={46} />
        </ClipPath>
      </Defs>
      <Circle cx={50} cy={50} r={46} fill={PORTRAIT_BG[who]} />
      <G clipPath={`url(#${id})`}>
        <Face />
      </G>
      <Circle cx={50} cy={50} r={47} fill="none" stroke={ring} strokeWidth={5} />
    </Svg>
  );
}

/** A square, unframed version of the portrait for the wanted poster. */
export function PosterPortrait({ who, size = 120 }: { who: Who; size?: number }) {
  const Face = FACES[who];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={0} width={100} height={100} fill="#e8d6b2" />
      <G opacity={0.92}>
        <Face />
      </G>
      <Rect x={1.5} y={1.5} width={97} height={97} fill="none" stroke={INK} strokeWidth={3} />
    </Svg>
  );
}

/* ---------- The scene ---------- */

/** One duelist silhouette, feet at (x, y), facing right, gun drawn. */
function Duelist({ x, y = 128, s = 1, color, flip }: { x: number; y?: number; s?: number; color: string; flip?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <Ellipse cx={-14} cy={1} rx={22} ry={2.5} fill="#000" opacity={0.25} />
      <Path d="M-6 -68 Q0 -76 6 -68 L7 -64 L-7 -64 Z" fill={color} />
      <Ellipse cx={0} cy={-64} rx={13} ry={2.4} fill={color} />
      <Circle cx={0} cy={-57} r={5.5} fill={color} />
      <Path d="M-8 -51 L7 -51 L10 -24 L-10 -24 Z" fill={color} />
      <Path d="M-9 -24 L-3 -24 L-4 0 L-10 0 Z" fill={color} />
      <Path d="M3 -24 L9 -24 L10 0 L4 0 Z" fill={color} />
      <Path d="M5 -48 L23 -44 L23 -41 L5 -43 Z" fill={color} />
      <Rect x={22} y={-46} width={8} height={3} fill={color} />
    </G>
  );
}

/**
 * High noon on the main street: two duelists face off under a big sun, mesas
 * behind them. The rival on the right wears the colour of today's rival seat.
 */
export function StandoffScene({ width = 360, youColor = '#24344f', rivalColor = '#9e2b25' }: { width?: number; youColor?: string; rivalColor?: string }) {
  return (
    <Svg width={width} height={(width * 150) / 360} viewBox="0 0 360 150">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#c8962e" />
          <Stop offset="1" stopColor="#f1d9a8" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={360} height={150} fill="url(#sky)" />
      <Circle cx={180} cy={92} r={42} fill={CREAM} opacity={0.9} />
      <Path d="M0 108 L30 108 L38 92 L78 92 L86 108 L150 108 L156 100 L190 100 L196 108 L250 108 L262 84 L310 84 L320 108 L360 108 L360 120 L0 120 Z" fill="#9a6a44" />
      <Rect x={0} y={118} width={360} height={32} fill="#6b4a33" />
      <Path d="M0 118 L360 118" stroke="#5a3a24" strokeWidth={2} />
      <G transform="translate(18 74)">
        <Cactus height={46} color="#3f5525" />
      </G>
      <G transform="translate(318 82)">
        <Cactus height={38} color="#3f5525" />
      </G>
      <Duelist x={92} color={youColor} />
      <Duelist x={268} color={rivalColor} flip />
      <G transform="translate(170 116)">
        <Tumbleweed size={20} />
      </G>
    </Svg>
  );
}

/**
 * Main street at sundown: the saloon's false front on the left, the sun going
 * down over the mesas, and two duelists squared off in the street. Drawn tall
 * so the wordmark can sit in the sky.
 */
export function MainStreetScene({
  width = 390,
  height,
  youColor = '#24344f',
  rivalColor = '#9e2b25',
}: {
  width?: number;
  height: number;
  youColor?: string;
  rivalColor?: string;
}) {
  // Draw in a 390-wide space; the extra height goes to sky.
  const vh = (390 * height) / width;
  const ground = vh - 70;
  return (
    <Svg width={width} height={height} viewBox={`0 0 390 ${vh}`} preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8f5a1c" />
          <Stop offset="0.55" stopColor="#d49a3a" />
          <Stop offset="1" stopColor="#f2d29a" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={390} height={vh} fill="url(#dusk)" />
      {/* the sun, low */}
      <Circle cx={278} cy={ground - 28} r={54} fill="#f6e2b4" opacity={0.95} />
      <Circle cx={278} cy={ground - 28} r={70} fill="#f6e2b4" opacity={0.18} />
      {/* mesas */}
      <Path
        d={`M0 ${ground - 22} L60 ${ground - 22} L70 ${ground - 44} L118 ${ground - 44} L128 ${ground - 22} L210 ${ground - 22} L222 ${ground - 52} L300 ${ground - 52} L312 ${ground - 22} L390 ${ground - 22} L390 ${ground} L0 ${ground} Z`}
        fill="#9a6a44"
      />
      {/* the saloon: false front, sign board, lit windows, swinging doors, porch */}
      <G transform={`translate(0 ${ground - 120}) scale(0.8)`}>
        <Path d="M0 30 L0 18 L34 18 L34 8 L106 8 L106 18 L140 18 L140 30 L140 150 L0 150 Z" fill="#5a3a24" />
        <Rect x={18} y={24} width={104} height={22} rx={2} fill="#2e1d13" />
        <Rect x={22} y={28} width={96} height={14} rx={1} fill="#b8862b" />
        <Rect x={30} y={33} width={80} height={4} rx={2} fill="#2e1d13" opacity={0.55} />
        <Rect x={14} y={60} width={30} height={34} fill="#2e1d13" />
        <Rect x={17} y={63} width={24} height={28} fill="#f0b858" />
        <Line x1={29} y1={63} x2={29} y2={91} stroke="#2e1d13" strokeWidth={2} />
        <Rect x={96} y={60} width={30} height={34} fill="#2e1d13" />
        <Rect x={99} y={63} width={24} height={28} fill="#f0b858" />
        <Line x1={111} y1={63} x2={111} y2={91} stroke="#2e1d13" strokeWidth={2} />
        <Rect x={-2} y={102} width={146} height={6} fill="#2e1d13" />
        <Rect x={4} y={108} width={4} height={42} fill="#2e1d13" />
        <Rect x={132} y={108} width={4} height={42} fill="#2e1d13" />
        <Rect x={52} y={112} width={36} height={38} fill="#2e1d13" />
        <Rect x={54} y={120} width={15} height={20} fill="#9a6a44" />
        <Rect x={71} y={120} width={15} height={20} fill="#9a6a44" />
      </G>
      {/* the street */}
      <Rect x={0} y={ground} width={390} height={70} fill="#6b4a33" />
      <Path d={`M0 ${ground} L390 ${ground}`} stroke="#4a2f1e" strokeWidth={2} />
      <G transform={`translate(352 ${ground - 46})`}>
        <Cactus height={50} color="#3f5525" />
      </G>
      <Duelist x={182} y={ground + 44} s={0.92} color={youColor} />
      <Duelist x={326} y={ground + 44} s={0.92} color={rivalColor} flip />
      <G transform={`translate(240 ${ground + 30})`}>
        <Tumbleweed size={18} />
      </G>
    </Svg>
  );
}
