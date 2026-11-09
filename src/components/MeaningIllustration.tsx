import type { CSSProperties, ReactNode } from 'react';
import './illustration.css';

/** Original, modern memory illustrations. These scenes do not assert character etymology. */
export interface MeaningIllustrationProps {
  kind: string;
  size?: number | string;
  className?: string;
  label?: string;
}

const C = {
  ink: '#655044', paper: '#FFF8E9', sand: '#F1DEBC', gold: '#EDBB57',
  orange: '#E79958', red: '#DC7565', blush: '#F5B8A1', skin: '#EBC19C',
  green: '#8DAA80', darkGreen: '#557E68', mint: '#C7D9B6', blue: '#80B8C5',
  water: '#A8D4DB', paleBlue: '#DCEBE7', navy: '#527B89', plum: '#A38BA1',
  white: '#FFFCF3', brown: '#B78C68', dark: '#454A48',
};

function Spark({ x, y, color = C.gold, size = 12 }: { x: number; y: number; color?: string; size?: number }) {
  return <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="4" className="illustration-spark">
    <path d={`M ${-size} 0 H ${size} M 0 ${-size} V ${size}`} fill="none" />
  </g>;
}

function Drop({ x, y, size = 1, color = C.blue }: { x: number; y: number; size?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M 0 -31 C -6 -19 -22 -4 -22 10 A 22 22 0 0 0 22 10 C 22 -4 6 -19 0 -31 Z" fill={color} />
    <path d="M -12 8 Q -13 20 -4 23" stroke={C.white} strokeWidth="4" fill="none" />
  </g>;
}

function Waves({ x = 70, y = 245, width = 340, rows = 2 }: { x?: number; y?: number; width?: number; rows?: number }) {
  return <g stroke={C.navy} strokeWidth="3.5" fill="none">
    {Array.from({ length: rows }, (_, row) => <path key={row} d={`M ${x + (row % 2) * 18} ${y + row * 23} q 20 -12 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} transform={`translate(${x} 0) scale(${width / 320} 1) translate(${-x} 0)`} />)}
  </g>;
}

function Face({ x = 0, y = 0, scale = 1, mood = 'smile', hair = true }: { x?: number; y?: number; scale?: number; mood?: string; hair?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="0" cy="0" rx="33" ry="37" fill={C.skin} />
    {hair && <path d="M -32 -4 C -44 -40 -8 -52 15 -39 C 34 -42 41 -15 30 -3 L 22 -20 Q 4 -6 -12 -20 L -25 -8 Z" fill={C.dark} stroke={C.dark} />}
    <circle cx="-13" cy="2" r="2.8" fill={C.ink} stroke="none" />
    <circle cx="13" cy="2" r="2.8" fill={C.ink} stroke="none" />
    <path d="M 0 7 l -3 7 h 6" fill="none" strokeWidth="2" />
    <ellipse cx="-21" cy="14" rx="6" ry="3" fill={C.blush} stroke="none" />
    <ellipse cx="21" cy="14" rx="6" ry="3" fill={C.blush} stroke="none" />
    {mood === 'smile' && <path d="M -10 21 Q 0 31 10 21" fill="none" strokeWidth="3" />}
    {mood === 'happy' && <path d="M -13 19 Q 0 43 13 19 Z" fill={C.red} strokeWidth="2" />}
    {mood === 'sad' && <path d="M -10 26 Q 0 16 10 26" fill="none" strokeWidth="3" />}
    {mood === 'think' && <path d="M -8 24 H 8 M -21 -9 l 12 -3 M 10 -12 l 10 4" fill="none" strokeWidth="3" />}
    {mood === 'angry' && <path d="M -24 -9 l 15 6 M 9 -3 l 15 -6 M -10 26 Q 0 15 10 26" fill="none" strokeWidth="3.5" />}
    {mood === 'open' && <ellipse cx="0" cy="24" rx="7" ry="9" fill={C.red} strokeWidth="2" />}
    {mood === 'sleep' && <path d="M -20 3 q 7 7 14 0 M 6 3 q 7 7 14 0 M -7 24 h 14" fill="none" strokeWidth="3" />}
  </g>;
}

function Leaf({ x, y, scale = 1, angle = 0, color = C.green }: { x: number; y: number; scale?: number; angle?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M 0 0 Q -30 -5 -28 -33 Q -1 -36 0 0 Z" fill={color} />
    <path d="M 0 0 L -18 -23" fill="none" strokeWidth="2" />
  </g>;
}

function Tree({ x = 240, y = 265, scale = 1, fruit = false }: { x?: number; y?: number; scale?: number; fruit?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -17 0 L -13 -114 H 13 L 19 0 Z" fill={C.brown} />
    <path d="M -2 -47 L -36 -84 M 5 -66 L 38 -102" fill="none" strokeWidth="6" />
    <path d="M -62 -92 C -94 -115 -72 -154 -48 -154 C -50 -192 -1 -210 22 -177 C 62 -186 84 -150 65 -123 C 92 -91 52 -63 24 -75 C -2 -50 -40 -62 -62 -92 Z" fill={C.green} />
    <path d="M -46 -128 q 14 -25 36 -12 M 11 -155 q 21 -8 30 10 M 5 -94 q 17 -13 32 -7" stroke={C.darkGreen} fill="none" strokeWidth="3" />
    {fruit && <g fill={C.orange}><circle cx="-42" cy="-110" r="9" /><circle cx="18" cy="-139" r="9" /><circle cx="35" cy="-90" r="9" /></g>}
    <path d="M -32 0 H 34" fill="none" />
  </g>;
}

function Flower({ x = 240, y = 270, scale = 1, color = C.red }: { x?: number; y?: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M 0 0 Q 9 -65 0 -121" stroke={C.darkGreen} fill="none" strokeWidth="6" />
    <Leaf x={3} y={-40} scale={1.05} angle={-30} />
    <Leaf x={5} y={-65} scale={1.05} angle={95} />
    <g transform="translate(0 -137)" fill={color}>
      <ellipse cy="-20" rx="19" ry="27" /><ellipse cx="22" cy="-3" rx="27" ry="19" transform="rotate(20 22 -3)" />
      <ellipse cx="14" cy="23" rx="19" ry="26" transform="rotate(-30 14 23)" /><ellipse cx="-15" cy="23" rx="19" ry="26" transform="rotate(30 -15 23)" />
      <ellipse cx="-25" cy="-3" rx="27" ry="19" transform="rotate(-20 -25 -3)" /><circle r="17" fill={C.gold} />
    </g>
  </g>;
}

function Cup({ x = 240, y = 195, scale = 1, transparent = false }: { x?: number; y?: number; scale?: number; transparent?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {!transparent && <path d="M 42 -21 H 58 C 86 -21 85 24 49 24" fill={C.white} />}
    <path d="M -47 -53 L -39 55 Q 0 72 39 55 L 47 -53 Z" fill={transparent ? C.paleBlue : C.white} fillOpacity={transparent ? '.62' : '1'} />
    <path d="M -43 -11 Q 0 4 43 -11 L 38 51 Q 0 65 -38 51 Z" fill={C.water} fillOpacity=".75" stroke="none" />
    <ellipse cy="-53" rx="47" ry="12" fill={transparent ? C.white : C.paper} />
    <path d="M -28 -31 L -22 35" stroke={C.white} strokeWidth="8" opacity=".9" />
    {transparent && <g fill={C.brown} strokeWidth="2.5"><ellipse cx="-15" cy="43" rx="12" ry="7" /><ellipse cx="13" cy="48" rx="15" ry="7" /><ellipse cx="18" cy="30" rx="9" ry="6" /></g>}
  </g>;
}

function Bowl({ x = 240, y = 245, scale = 1, food = true }: { x?: number; y?: number; scale?: number; food?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cy="-18" rx="84" ry="25" fill={food ? C.white : C.water} />
    {food && <g fill={C.paper} strokeWidth="2"><circle cx="-38" cy="-25" r="22" /><circle cx="-10" cy="-35" r="26" /><circle cx="23" cy="-28" r="26" /><circle cx="49" cy="-18" r="20" /></g>}
    <path d="M -84 -17 Q -76 47 -36 52 H 36 Q 76 47 84 -17 Q 0 13 -84 -17 Z" fill={C.blue} />
    <path d="M -27 53 V 61 H 27 V 53" fill={C.white} />
    <path d="M -60 10 Q -50 30 -35 34" stroke={C.paleBlue} fill="none" strokeWidth="5" />
  </g>;
}

function House({ x = 240, y = 264, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -102 -104 V 0 H 103 V -104 L 0 -181 Z" fill={C.paper} />
    <path d="M -123 -99 L 0 -195 L 123 -99 L 112 -82 L 0 -165 L -112 -82 Z" fill={C.red} />
    <path d="M 56 -147 V -191 H 82 V -127" fill={C.orange} />
    <path d="M -26 0 V -77 Q 0 -100 26 -77 V 0" fill={C.brown} />
    <circle cx="13" cy="-34" r="3" fill={C.gold} />
    <rect x="-78" y="-87" width="35" height="38" rx="3" fill={C.water} /><path d="M -60 -87 V -49 M -78 -68 H -43" fill="none" strokeWidth="3" />
    <rect x="46" y="-87" width="35" height="38" rx="3" fill={C.water} /><path d="M 64 -87 V -49 M 46 -68 H 81" fill="none" strokeWidth="3" />
    <path d="M -110 0 H 112" fill="none" />
  </g>;
}

function Flame({ x = 240, y = 224, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M 0 -125 C 31 -80 3 -72 35 -43 L 51 -83 C 109 -15 59 53 0 52 C -61 55 -101 0 -55 -58 L -33 -26 C -35 -71 -8 -91 0 -125 Z" fill={C.orange} />
    <path d="M 4 -45 C 25 -7 44 -6 33 25 C 24 53 -21 57 -34 28 C -45 4 -23 -10 -18 -30 L -6 -9 Z" fill={C.gold} strokeWidth="3" />
  </g>;
}

function Book({ x = 240, y = 230, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -116 -58 Q -62 -76 0 -45 Q 62 -76 116 -58 V 45 Q 62 30 0 58 Q -62 30 -116 45 Z" fill={C.green} />
    <path d="M -105 -68 Q -48 -81 0 -51 Q 48 -81 105 -68 V 32 Q 48 20 0 49 Q -48 20 -105 32 Z" fill={C.white} />
    <path d="M 0 -51 V 49 M -86 -43 Q -55 -46 -21 -28 M -86 -21 Q -55 -23 -21 -7 M -86 2 Q -55 0 -21 16 M 21 -28 Q 55 -46 86 -43 M 21 -7 Q 55 -23 86 -21 M 21 16 Q 55 0 86 2" fill="none" strokeWidth="3" />
    <path d="M 46 -71 V -28 L 57 -36 L 68 -28 V -73" fill={C.red} strokeWidth="2.5" />
  </g>;
}

function Heart({ x = 240, y = 180, scale = 1, color = C.red }: { x?: number; y?: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M 0 65 C -130 -10 -73 -98 0 -37 C 73 -98 130 -10 0 65 Z" fill={color} />
    <path d="M -43 -37 Q -68 -34 -62 -9" stroke={C.white} strokeWidth="8" fill="none" />
  </g>;
}

function Grass({ x = 240, y = 278, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill={C.green}>
    <path d="M -58 0 Q -84 -42 -73 -75 Q -44 -54 -35 -14 Q -45 -64 -18 -98 Q -5 -57 -9 -13 Q 10 -83 39 -86 Q 43 -43 20 -11 Q 54 -60 76 -48 Q 75 -15 58 0 Z" />
    <path d="M -36 0 L -48 -41 M -9 0 L -17 -58 M 12 0 L 30 -50 M 36 0 L 57 -28" fill="none" stroke={C.darkGreen} strokeWidth="3" />
  </g>;
}

function Hand({ x = 240, y = 220, scale = 1, angle = 0 }: { x?: number; y?: number; scale?: number; angle?: number }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M -36 59 L -42 17 L -65 -13 Q -78 -36 -62 -41 Q -50 -44 -33 -22 L -33 -83 Q -31 -99 -19 -96 Q -9 -94 -11 -79 L -10 -40 L -7 -107 Q -5 -122 7 -119 Q 17 -117 15 -102 L 14 -41 L 22 -94 Q 24 -111 35 -107 Q 44 -105 42 -89 L 34 -34 L 46 -69 Q 51 -82 61 -77 Q 69 -72 62 -58 L 46 3 Q 46 35 24 57 L 24 77 H -36 Z" fill={C.skin} />
    <path d="M -31 8 Q -4 -2 10 14 M -15 31 Q 5 38 24 22" fill="none" strokeWidth="3" />
    <path d="M -43 65 H 30 V 89 H -43 Z" fill={C.blue} />
  </g>;
}

function Sun({ x = 240, y = 160, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g stroke={C.orange} strokeWidth="6">{Array.from({ length: 12 }, (_, i) => <path key={i} d="M 0 -83 V -103" transform={`rotate(${i * 30})`} />)}</g>
    <circle r="61" fill={C.gold} /><path d="M -33 -30 Q -18 -47 7 -43" stroke={C.white} strokeWidth="7" fill="none" />
  </g>;
}

function Moon({ x = 240, y = 170, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M 35 -85 C -82 -107 -118 54 -17 88 C 24 103 65 85 86 53 C -16 77 -57 -18 35 -85 Z" fill={C.gold} />
    <path d="M -57 -25 Q -76 11 -58 41" stroke={C.white} strokeWidth="6" fill="none" />
    <circle cx="-30" cy="61" r="9" fill={C.orange} stroke="none" opacity=".4" />
  </g>;
}

function Eye({ x = 240, y = 180, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -112 0 Q 0 -110 112 0 Q 0 110 -112 0 Z" fill={C.white} />
    <circle r="42" fill={C.green} /><circle r="21" fill={C.ink} /><circle cx="-11" cy="-14" r="9" fill={C.white} stroke="none" />
    <path d="M -78 -37 l -14 -18 M 0 -56 V -78 M 78 -37 l 14 -18" fill="none" />
  </g>;
}

function Ear({ x = 240, y = 180, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -45 -53 C -29 -116 74 -106 78 -30 C 80 17 47 25 31 61 C 14 103 -35 87 -39 61 C -45 25 -69 -15 -45 -53 Z" fill={C.skin} />
    <path d="M -14 -40 C -1 -79 46 -66 45 -26 Q 41 -1 16 3 Q -9 7 2 31 Q 13 53 -3 62 M 16 -28 Q -14 -38 -24 -7" fill="none" strokeWidth="5" />
  </g>;
}

function Bird({ x = 240, y = 196, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -54 33 L -103 -17 L -99 36 L -60 61 Z" fill={C.blue} />
    <path d="M -58 32 C -85 -20 -31 -66 15 -45 C 19 -100 88 -105 99 -57 C 108 -12 73 30 48 54 Q -8 90 -58 32 Z" fill={C.blue} />
    <path d="M -42 -8 Q -11 -36 38 -11 Q 19 51 -29 36 Z" fill={C.paleBlue} />
    <path d="M 98 -52 L 126 -40 L 96 -30 Z" fill={C.gold} /><circle cx="73" cy="-60" r="5" fill={C.ink} stroke="none" />
    <path d="M -6 67 L -10 94 M 22 62 L 25 94 M -23 95 H 0 M 13 95 H 39" fill="none" />
  </g>;
}

function Mountain({ x = 240, y = 270, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -142 0 L -37 -167 L 65 0 Z" fill={C.green} />
    <path d="M -61 -129 L -37 -167 L -12 -126 L -29 -134 L -42 -118 Z" fill={C.paper} />
    <path d="M -30 0 L 66 -126 L 156 0 Z" fill={C.blue} />
    <path d="M 41 -93 L 66 -126 L 92 -89 L 70 -96 L 59 -84 Z" fill={C.white} />
    <path d="M -37 -164 L -12 -45 M 66 -122 L 56 -37" fill="none" strokeWidth="2.5" opacity=".4" />
  </g>;
}

function SpeechBubble({ x = 270, y = 98, scale = 1, children }: { x?: number; y?: number; scale?: number; children?: ReactNode }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -66 -42 H 65 Q 83 -42 83 -23 V 20 Q 83 40 64 40 H -24 L -50 61 L -46 40 H -66 Q -83 40 -83 22 V -24 Q -83 -42 -66 -42 Z" fill={C.white} />
    {children || <g fill={C.green} stroke="none"><circle cx="-30" r="7" /><circle r="7" /><circle cx="30" r="7" /></g>}
  </g>;
}

function Yarn({ x = 240, y = 215, scale = 1, color = C.red }: { x?: number; y?: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse rx="68" ry="63" fill={color} />
    <g fill="none" stroke={C.paper} strokeWidth="3.5" opacity=".7">
      <path d="M -56 -31 Q 6 -33 53 39 M -44 -48 Q 17 -44 64 17 M -20 -59 Q 29 -50 67 -5 M -67 -7 Q -12 -12 31 55 M -64 16 Q -25 17 9 62 M -52 37 Q -27 36 -17 61" />
      <path d="M -43 47 Q -24 -7 47 -42 M -22 59 Q -7 2 61 -24 M 1 63 Q 16 15 66 -3 M -59 25 Q -44 -19 25 -58" />
    </g>
    <path d="M -10 -61 Q -45 -16 -63 10 M 13 -60 Q -27 -13 -42 42" stroke={C.ink} opacity=".35" strokeWidth="2" fill="none" />
  </g>;
}

function Clock({ x = 240, y = 176, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><circle r="80" fill={C.blue} /><circle r="68" fill={C.white} /><path d="M 0 -52 V -44 M 0 44 V 52 M -52 0 H -44 M 44 0 H 52" fill="none" strokeWidth="3" /><path d="M 0 -33 V 0 L 30 18" fill="none" strokeWidth="6" /><circle r="5" fill={C.gold} /></g>;
}

function Calendar({ x = 240, y = 195, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><rect x="-88" y="-91" width="176" height="177" rx="11" fill={C.white} /><path d="M -88 -52 V -80 Q -88 -91 -77 -91 H 77 Q 88 -91 88 -80 V -52 Z" fill={C.red} /><path d="M -48 -111 V -76 M 48 -111 V -76" stroke={C.ink} strokeWidth="9" fill="none" />{Array.from({length:12},(_,i)=><rect key={i} x={-59+(i%4)*34} y={-24+Math.floor(i/4)*33} width="14" height="14" rx="3" fill={i===6?C.red:C.sand} stroke="none" />)}<circle cx="16" cy="16" r="18" stroke={C.red} strokeWidth="3" fill="none" /></g>;
}

function Envelope({ x = 240, y = 196, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><rect x="-107" y="-66" width="214" height="142" rx="8" fill={C.gold} /><path d="M -105 -62 L 0 17 L 105 -62 M -104 73 L -32 0 M 104 73 L 32 0" fill="none" /><Heart x={0} y={12} scale={.32} /></g>;
}

function SmallPerson({ x, y, color = C.green, scale = 1 }: { x: number; y: number; color?: string; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M -43 89 Q -43 26 0 25 Q 43 26 43 89 Z" fill={color} /><Face y={-9} scale={.85} /><path d="M -19 90 L -24 133 M 19 90 L 24 133" stroke={C.navy} strokeWidth="16" fill="none" /><path d="M -36 43 L -52 83 M 36 43 L 52 83" stroke={C.skin} strokeWidth="13" fill="none" /></g>;
}

function TextileScene({ kind }: { kind: string }): ReactNode {
  switch (kind) {
    case 'red': case 'red-thread': case 'green': case 'green-thread': case 'purple-thread': case 'thread': return <>
      <Yarn x={221} y={208} scale={1.24} color={kind.includes('green') ? C.darkGreen : kind.includes('purple') ? C.plum : C.red} />
      <path d="M 269 263 Q 294 290 349 273 Q 395 257 366 230 Q 345 213 325 234" stroke={kind.includes('green') ? C.darkGreen : kind.includes('purple') ? C.plum : C.red} strokeWidth="6" fill="none" /><path d="M 313 157 L 374 89" stroke={C.navy} strokeWidth="6" fill="none" /><ellipse cx="365" cy="99" rx="3.5" ry="10" transform="rotate(40 365 99)" fill={C.paper} strokeWidth="2" /><Spark x={114} y={120} />
    </>;
    case 'knot': case 'continue': return <>
      <path d="M 83 224 C 129 177 196 253 261 192 C 328 130 272 94 242 136 C 211 180 281 253 324 224 C 377 189 328 149 285 183 C 215 238 159 209 151 167 C 143 112 213 113 218 163 C 222 213 183 246 399 254" stroke={C.ink} strokeWidth="17" fill="none" />
      <path d="M 83 224 C 129 177 196 253 261 192 C 328 130 272 94 242 136 C 211 180 281 253 324 224 C 377 189 328 149 285 183 C 215 238 159 209 151 167 C 143 112 213 113 218 163 C 222 213 183 246 399 254" stroke={C.red} strokeWidth="10" fill="none" /><Spark x={343} y={111} />
      {kind==='continue' && <path d="M 165 288 H 312 l -17 -11 M 312 288 l -17 11" stroke={C.orange} fill="none" />}
    </>;
    case 'cut-thread': return <>
      <Yarn x={132} y={236} scale={.67} /><path d="M 173 257 Q 226 272 242 234 M 281 240 Q 330 271 390 251" stroke={C.red} strokeWidth="7" fill="none" />
      <g transform="translate(258 165) rotate(-12)"><path d="M -12 17 L -59 -66 Q -69 -81 -74 -77 L -30 29 Z M 14 16 L 62 -65 Q 73 -83 77 -76 L 30 30 Z" fill={C.blue} /><circle cy="22" r="10" fill={C.gold} /><ellipse cx="-28" cy="61" rx="24" ry="32" fill={C.orange} /><ellipse cx="28" cy="61" rx="24" ry="32" fill={C.orange} /><ellipse cx="-28" cy="61" rx="11" ry="17" fill={C.paper} strokeWidth="3" /><ellipse cx="28" cy="61" rx="11" ry="17" fill={C.paper} strokeWidth="3" /></g><path d="M 250 257 l -4 13 M 270 258 l 6 13" stroke={C.orange} strokeWidth="3" fill="none" />
    </>;
    case 'weave': return <>
      <rect x="120" y="83" width="242" height="214" rx="8" fill={C.brown} /><rect x="140" y="101" width="201" height="174" fill={C.paper} />
      {Array.from({length:12},(_,i)=><path key={i} d={`M ${149+i*16} 94 V 286`} stroke={i%2?C.gold:C.plum} strokeWidth="5" />)}
      {Array.from({length:8},(_,i)=><path key={i} d={`M 139 ${169+i*13} Q 241 ${179+i*13} 343 ${169+i*13}`} stroke={i%2?C.red:C.blue} strokeWidth="7" fill="none" />)}
      <path d="M 160 143 L 319 118 L 325 136 L 167 161 Z" fill={C.orange} /><path d="M 200 146 L 286 131" stroke={C.paper} strokeWidth="3" /><Yarn x={377} y={276} scale={.41} /><path d="M 350 272 Q 325 280 311 260" stroke={C.red} strokeWidth="4" fill="none" />
    </>;
    case 'practice': return <>
      <path d="M 103 286 L 148 218 L 161 142 Q 170 122 183 138 L 191 186 L 217 160 Q 239 156 231 176 L 202 225 L 175 251 L 155 293" fill={C.skin} /><path d="M 377 286 L 332 218 L 319 142 Q 310 122 297 138 L 289 186 L 263 160 Q 241 156 249 176 L 278 225 L 305 251 L 325 293" fill={C.skin} />
      <path d="M 181 151 Q 200 92 240 115 Q 286 148 249 171 Q 207 198 252 226 Q 291 249 237 285" stroke={C.red} strokeWidth="8" fill="none" /><path d="M 303 150 Q 275 106 244 141 Q 210 177 251 197 Q 289 221 234 250" stroke={C.blue} strokeWidth="8" fill="none" /><Spark x={240} y={77} size={8} />
    </>;
    case 'connect': case 'partner': case 'firewood': case 'appointment': return <>
      <SmallPerson x={138} y={152} scale={.9} color={C.blue} /><SmallPerson x={342} y={152} scale={.9} color={C.plum} /><path d="M 183 232 Q 240 267 297 232" stroke={C.red} strokeWidth="6" fill="none" /><Heart x={240} y={162} scale={.45} />{kind==='appointment' && <Clock x={241} y={91} scale={.35} />}
    </>;
    case 'group': case 'people': case 'community': return <>
      <SmallPerson x={139} y={153} scale={.84} color={C.plum} /><SmallPerson x={340} y={153} scale={.84} color={C.blue} /><SmallPerson x={240} y={140} scale={1.1} color={C.green} /><path d="M 111 292 Q 241 327 368 292" stroke={C.red} strokeWidth="5" fill="none" />
    </>;
    case 'pass-through': case 'needle': return <>
      <Yarn x={131} y={241} scale={.63} /><path d="M 175 257 C 271 302 191 146 288 137 C 369 130 403 169 382 188 C 360 206 318 188 313 155" stroke={C.red} strokeWidth="5" fill="none" /><path d="M 225 287 L 340 85 Q 352 67 357 79 Q 361 86 354 103 Z" fill={C.paleBlue} /><ellipse cx="343" cy="99" rx="4" ry="14" transform="rotate(30 343 99)" fill={C.paper} strokeWidth="2.5" /><path d="M 317 134 L 341 103" stroke={C.red} strokeWidth="5" fill="none" /><Spark x={378} y={99} size={8} />
    </>;
    case 'thin': case 'coarse': return <>
      <Yarn x={132} y={170} scale={.65} color={C.plum} /><path d="M 170 208 Q 244 249 398 180" stroke={C.plum} strokeWidth={kind==='coarse'?17:3} fill="none" /><path d="M 85 279 Q 245 305 399 260" stroke={C.brown} strokeWidth={kind==='coarse'?3:17} fill="none" /><path d="M 141 275 l 10 14 M 183 280 l 10 14 M 226 282 l 10 14 M 268 280 l 10 14 M 310 273 l 10 14 M 352 264 l 10 14" stroke={C.paper} strokeWidth="3" fill="none" />
    </>;
    case 'give': case 'borrow': return <>
      <path d="M 81 224 L 144 215 L 196 235 L 233 228 Q 253 230 239 245 L 194 266 L 139 254 L 85 266" fill={C.skin} /><path d="M 400 203 L 338 218 L 303 200 L 258 210 Q 245 203 258 192 L 300 175 L 344 189 L 395 171" fill={C.skin} /><Yarn x={244} y={172} scale={.62} /><path d={kind==='give'?'M 200 107 H 289 l -15 -11 M 289 107 l -15 11':'M 289 107 H 200 l 15 -11 M 200 107 l 15 11'} stroke={C.orange} strokeWidth="4" fill="none" />
    </>;
    default: return null;
  }
}

const SCENE_ALIASES: Record<string, string> = {
  ocean: 'sea', listen: 'hear', eyes: 'eye', read: 'book', poem: 'book',
  sunny: 'sun', evening: 'moon', meal: 'food', rice: 'food',
  'stir-fry': 'cook', burn: 'fire', iron: 'metal', silver: 'metal',
  language: 'speak', speech: 'speak', 'ask-politely': 'ask', question: 'ask',
  suggestion: 'speak', feeling: 'heart', fast: 'run', live: 'home', body: 'person',
  he: 'person', you: 'person', she: 'person', mother: 'person', sister: 'person',
  'younger-sister': 'person', 'family-name': 'people', lesson: 'study', work: 'study',
  explain: 'study', chinese: 'study', energy: 'happy', personality: 'happy',
  understand: 'happy', good: 'happy', blessing: 'heart', spirit: 'heart', ritual: 'heart',
  'sun-dry': 'clothes', clean: 'wash', school: 'study', restaurant: 'food',
  ingredients: 'food', organize: 'study', recognize: 'look', appear: 'look',
  'turning-point': 'road', begin: 'road', first: 'road',
};

function ExtraScene({ kind }: { kind: string }): ReactNode {
  switch (kind) {
    case 'letter': return <><Envelope x={240} y={196} scale={1.15} /><Spark x={362} y={93} /></>;
    case 'calendar': case 'yesterday': return <><Calendar x={240} y={199} scale={1.05} />{kind==='yesterday' && <path d="M 293 261 H 187 l 20 -15 M 187 261 l 20 15" fill="none" stroke={C.blue} strokeWidth="7" />}</>;
    case 'time': return <><Clock x={240} y={183} scale={1.18} /><Spark x={365} y={104} /><Spark x={120} y={245} size={8} /></>;
    case 'cup': return <><Cup x={240} y={196} scale={1.64} /><path d="M 211 89 Q 195 74 210 59 M 254 89 Q 240 73 254 57" fill="none" stroke={C.brown} strokeWidth="3" /></>;
    case 'paper': case 'write': case 'wrong': case 'code': return <>
      <path d="M 139 96 H 309 L 351 137 V 293 H 139 Z" fill={C.sand} /><path d="M 124 79 H 294 L 336 120 V 279 H 124 Z" fill={C.white} /><path d="M 294 79 V 120 H 336" fill={C.sand} />
      {kind!=='paper' && <path d="M 154 133 H 259 M 154 162 H 301 M 154 191 H 277 M 154 220 H 243" stroke={C.blue} strokeWidth="5" fill="none" />}
      {kind==='write' && <g transform="translate(300 176) rotate(35)"><path d="M -10 -68 H 10 V 61 L 0 82 L -10 61 Z" fill={C.gold} /><path d="M -10 -51 H 10 M -10 61 H 10" fill="none" /><path d="M -4 74 L 0 82 L 4 74" fill={C.ink} /></g>}
      {kind==='wrong' && <path d="M 230 202 L 279 253 M 279 202 L 230 253" stroke={C.red} strokeWidth="11" fill="none" />}
      {kind==='code' && <g stroke={C.ink} strokeWidth="5"><path d="M 162 244 v 17 M 176 234 v 27 M 188 244 v 17 M 205 232 v 29 M 223 239 v 22 M 235 231 v 30 M 248 244 v 17 M 262 234 v 27 M 278 238 v 23" /></g>}
      <Spark x={365} y={164} size={9} />
    </>;
    case 'sand': return <>
      <path d="M 59 265 Q 127 175 222 226 Q 298 165 421 265 V 294 H 59 Z" fill={C.gold} /><path d="M 69 280 Q 171 217 292 264" stroke={C.orange} fill="none" strokeWidth="3" /><g fill={C.brown} stroke="none">{[110,145,180,286,322,366,394].map((x,i)=><circle key={x} cx={x} cy={264+(i%3)*9} r="3" />)}</g><path d="M 174 229 L 185 291 H 242 L 253 229 Z" fill={C.red} /><ellipse cx="213" cy="229" rx="40" ry="10" fill={C.orange} /><path d="M 182 231 Q 177 175 214 174 Q 249 175 245 231" fill="none" strokeWidth="4" /><path d="M 323 276 L 350 212 M 337 225 L 364 236 L 368 211 L 349 202 Z" fill={C.blue} /><Sun x={344} y={112} scale={.37} />
    </>;
    case 'wine': return <>
      <path d="M 148 275 V 152 Q 148 135 170 123 V 77 H 202 V 123 Q 224 135 224 152 V 275 Q 188 291 148 275 Z" fill={C.darkGreen} /><rect x="166" y="63" width="40" height="21" rx="4" fill={C.brown} /><rect x="160" y="174" width="52" height="67" rx="4" fill={C.paper} /><g fill={C.plum} strokeWidth="2"><circle cx="178" cy="197" r="9" /><circle cx="193" cy="196" r="9" /><circle cx="187" cy="210" r="9" /></g><path d="M 285 130 H 359 Q 373 216 322 218 Q 272 216 285 130 Z" fill={C.white} /><path d="M 284 166 H 360 Q 355 215 322 214 Q 290 214 284 166 Z" fill={C.plum} stroke="none" /><path d="M 322 218 V 281 M 293 283 H 350" fill="none" /><Leaf x={188} y={188} scale={.45} angle={60} />
    </>;
    case 'steam': case 'smoke': return <>
      {kind==='steam' ? <><path d="M 158 211 Q 145 291 245 288 Q 339 287 319 211 Z" fill={C.blue} /><path d="M 170 213 Q 157 168 190 157 H 291 Q 319 169 307 213" fill={C.blue} /><path d="M 159 228 L 111 194 L 104 166 L 134 170 L 177 198 M 312 204 Q 372 175 369 232 Q 364 259 321 259" fill="none" strokeWidth="13" /><path d="M 202 159 Q 240 117 279 159" fill="none" strokeWidth="8" /></> : <><path d="M 161 280 L 290 291 M 165 296 L 292 276" fill="none" stroke={C.brown} strokeWidth="14" /><Flame x={236} y={265} scale={.35} /></>}
      <path d="M 201 134 Q 166 110 200 86 Q 221 67 202 48 M 249 139 Q 287 113 253 92 Q 235 74 258 57 M 296 134 Q 317 116 301 99" stroke={kind==='steam'?C.blue:C.plum} fill="none" strokeWidth={kind==='steam'?5:15} opacity=".7" />
    </>;
    case 'lake': return <>
      <Mountain x={246} y={181} scale={.61} /><ellipse cx="240" cy="242" rx="166" ry="54" fill={C.water} /><path d="M 118 236 q 23 -9 46 0 M 220 267 q 29 -9 58 0 M 299 223 q 20 -8 40 0" stroke={C.navy} fill="none" strokeWidth="3" /><Grass x={95} y={282} scale={.52} /><Grass x={375} y={272} scale={.6} /><path d="M 156 257 Q 179 240 193 257 Q 179 273 156 257 Z" fill={C.green} /><Flower x={185} y={254} scale={.25} color={C.plum} />
    </>;
    case 'wave': return <>
      <path d="M 66 286 C 142 267 140 115 262 97 C 340 86 382 156 336 193 C 313 212 282 205 270 181 C 325 188 324 133 287 141 C 225 155 268 265 412 286 Z" fill={C.blue} /><path d="M 196 163 C 231 110 315 87 346 147 C 358 171 338 198 314 193 C 342 149 300 122 271 146 C 239 173 257 215 288 236" fill={C.white} strokeWidth="3" /><path d="M 94 291 Q 237 269 404 292" stroke={C.navy} fill="none" /><Drop x={178} y={121} size={.43} /><Drop x={350} y={96} size={.35} />
    </>;
    case 'face': return <><Face x={240} y={177} scale={2.45} /><Spark x={365} y={132} size={9} /></>;
    case 'plump': case 'belly': case 'hungry': case 'full': return <>
      <Face x={240} y={111} scale={1.05} mood={kind==='hungry'?'sad':'smile'} /><path d={kind==='plump'?'M 198 154 Q 127 196 160 284 H 319 Q 354 193 282 154 Z':'M 202 151 Q 159 182 173 284 H 307 Q 322 184 278 151 Z'} fill={C.orange} /><ellipse cx="240" cy="230" rx="44" ry="40" fill={C.gold} stroke="none" /><path d="M 180 182 L 162 225 L 211 241 M 301 185 L 320 229 L 272 243" stroke={C.skin} strokeWidth="19" fill="none" />
      {kind==='hungry' ? <path d="M 219 219 q 11 -10 22 0 t 22 0 M 219 238 q 11 -10 22 0 t 22 0" stroke={C.red} fill="none" strokeWidth="3" /> : <path d="M 225 243 Q 240 254 255 243" fill="none" strokeWidth="3" />}
      {kind==='hungry' && <SpeechBubble x={364} y={107} scale={.44}><Bowl x={0} y={1} scale={.6} /></SpeechBubble>}
    </>;
    case 'busy': case 'afraid': case 'strange': case 'surprised': case 'guess': return <>
      <path d="M 148 294 Q 148 222 240 218 Q 332 223 334 294" fill={kind==='afraid'?C.plum:C.blue} /><Face x={240} y={163} scale={1.58} mood={kind==='busy'?'think':kind==='afraid'?'sad':'open'} />
      {kind==='busy' && <><Clock x={355} y={97} scale={.42} /><path d="M 99 182 L 153 163 L 164 212 L 112 226 Z M 320 228 L 366 211 L 382 261 L 337 278 Z" fill={C.white} /><path d="M 113 188 l 28 -9 M 119 202 l 26 -9" fill="none" stroke={C.blue} strokeWidth="3" /></>}
      {kind==='afraid' && <><path d="M 99 112 Q 79 78 112 68 Q 138 37 162 70 Q 194 76 174 112 Z" fill={C.plum} /><path d="M 132 113 L 120 138 H 138 L 127 158" fill={C.gold} /><path d="M 154 204 l -13 10 l 13 10 M 327 201 l 13 10 l -13 10" fill="none" stroke={C.plum} strokeWidth="3" /></>}
      {['strange','surprised','guess'].includes(kind) && <><path d="M 134 133 l -21 -14 M 129 170 H 103 M 346 132 l 21 -14 M 352 168 H 379" stroke={C.orange} fill="none" strokeWidth="5" />{kind==='guess' && <SpeechBubble x={348} y={90} scale={.5}><path d="M -17 -12 Q -16 -37 10 -28 Q 34 -15 8 4 V 18" fill="none" stroke={C.plum} strokeWidth="7" /><circle cx="8" cy="30" r="4" fill={C.plum} /></SpeechBubble>}</>}
    </>;
    case 'sleep': case 'quilt': return <>
      <rect x="88" y="185" width="302" height="95" rx="14" fill={C.brown} /><rect x="87" y="173" width="305" height="92" rx="18" fill={C.white} /><rect x="102" y="185" width="97" height="62" rx="15" fill={C.sand} /><Face x={154} y={209} scale={.77} mood="sleep" /><path d="M 203 170 H 366 Q 391 170 391 198 V 266 H 203 Z" fill={C.plum} />{[0,1,2,3].map(i=><path key={i} d={`M ${220+i*47} 177 V 260`} stroke={C.blush} strokeWidth="3" fill="none" />)}<path d="M 207 210 H 389 M 207 244 H 389" stroke={C.blush} strokeWidth="3" fill="none" /><path d="M 98 277 V 295 M 378 277 V 295" stroke={C.brown} strokeWidth="12" /><Moon x={326} y={98} scale={.37} /><Spark x={115} y={92} size={8} color={C.plum} />
    </>;
    case 'leg': return <>
      <path d="M 166 70 H 296 L 280 182 L 264 281 H 218 L 225 171 L 200 281 H 150 L 165 174 Z" fill={C.blue} /><path d="M 231 91 L 225 171 M 164 248 H 207 M 220 248 H 271" fill="none" stroke={C.navy} strokeWidth="3" /><path d="M 149 277 H 201 L 212 292 H 133 Q 129 282 149 277 Z M 219 277 H 265 L 298 289 Q 307 299 286 300 H 218 Z" fill={C.red} /><path d="M 310 194 L 340 194 L 330 185 M 340 194 l -10 9" fill="none" stroke={C.orange} />
    </>;
    case 'dirty': return <>
      <Scene kind="clothes" /><g fill={C.brown} stroke="none"><path d="M 213 201 q -21 -13 -16 -28 q 13 -10 27 9 q 24 -3 29 14 q -10 20 -40 5" /><circle cx="279" cy="239" r="9" /><circle cx="188" cy="142" r="7" /><circle cx="253" cy="258" r="5" /></g>
    </>;
    case 'broken': return <><Cup x={240} y={201} scale={1.6} /><path d="M 245 122 L 228 158 L 246 178 L 224 214 L 242 241 L 231 288" stroke={C.ink} strokeWidth="5" fill="none" /><path d="M 352 265 l 17 -11 l 7 28 Z M 136 281 l -18 -3 l 9 -17 Z" fill={C.white} /></>;
    case 'city': return <>
      <rect x="87" y="151" width="80" height="141" fill={C.blue} /><rect x="184" y="88" width="107" height="204" fill={C.brown} /><rect x="307" y="127" width="87" height="165" fill={C.plum} />{[0,1,2,3].map(row=><g key={row} fill={C.paper} strokeWidth="2">{[0,1].map(col=><g key={col}><rect x={101+col*33} y={169+row*28} width="14" height="15" /><rect x={203+col*49} y={110+row*38} width="19" height="22" /><rect x={321+col*35} y={147+row*32} width="15" height="18" /></g>)}</g>)}<path d="M 71 294 H 410" fill="none" strokeWidth="6" /><Sun x={352} y={78} scale={.25} />
    </>;
    case 'block': case 'board': return <>
      {kind==='block' ? <><path d="M 123 211 L 203 164 L 280 208 L 201 256 Z" fill={C.gold} /><path d="M 123 211 V 270 L 201 309 V 256 Z" fill={C.orange} /><path d="M 201 256 L 280 208 V 264 L 201 309 Z" fill={C.brown} /><path d="M 238 149 L 307 109 L 376 149 L 307 190 Z" fill={C.mint} /><path d="M 238 149 V 207 L 307 246 V 190 Z" fill={C.green} /><path d="M 307 190 L 376 149 V 204 L 307 246 Z" fill={C.darkGreen} /></> : <>{[0,1,2].map(i=><g key={i} transform={`translate(${124+i*19} ${143+i*48}) rotate(-7)`}><rect width="239" height="41" rx="6" fill={i%2?C.orange:C.brown} /><path d="M 18 13 Q 85 7 117 17 T 217 14 M 36 28 Q 106 20 184 29" fill="none" stroke={C.ink} strokeWidth="2" opacity=".4" /><ellipse cx="165" cy="20" rx="18" ry="6" fill="none" strokeWidth="2" /></g>)}</>}
    </>;
    case 'pine': return <>
      <path d="M 225 286 V 126 H 255 V 286" fill={C.brown} /><path d="M 239 62 L 174 147 H 199 L 150 210 H 182 L 123 269 H 358 L 298 210 H 329 L 280 147 H 306 Z" fill={C.darkGreen} /><path d="M 198 144 H 276 M 183 207 H 292" stroke={C.green} fill="none" strokeWidth="4" /><path d="M 112 292 H 370" stroke={C.sand} fill="none" /><Spark x={344} y={111} />
    </>;
    case 'bridge': return <>
      <path d="M 60 246 Q 241 222 420 246 V 298 H 60 Z" fill={C.water} stroke="none" /><path d="M 78 224 Q 237 111 401 224 V 270 H 333 Q 237 169 143 270 H 78 Z" fill={C.brown} /><path d="M 78 221 Q 238 103 401 221" stroke={C.orange} strokeWidth="13" fill="none" /><path d="M 103 200 V 164 M 161 165 V 128 M 240 147 V 111 M 318 166 V 129 M 377 202 V 165 M 103 164 Q 238 58 377 165" stroke={C.ink} strokeWidth="6" fill="none" /><Waves x={100} y={281} width={275} rows={1} />
    </>;
    case 'sample': case 'alike': return <>
      {[0,1,2].slice(0,kind==='alike'?2:3).map((i)=><g key={i} transform={`translate(${kind==='alike'?155+i*170:118+i*122} 179) rotate(${i%2?8:-8})`}><rect x="-46" y="-67" width="92" height="134" rx="8" fill={C.white} /><rect x="-36" y="-57" width="72" height="87" rx="3" fill={kind==='alike'?C.green:[C.plum,C.blue,C.red][i]} /><Leaf x={12} y={8} angle={20} scale={.9} color={C.paper} /><circle cy="49" r="5" fill={C.sand} stroke="none" /></g>)}{kind==='alike'&&<path d="M 225 173 H 257 M 225 192 H 257" fill="none" stroke={C.orange} strokeWidth="5" />}
    </>;
    case 'machine': case 'wheel': case 'turn': return <>
      {kind==='machine' && <rect x="92" y="101" width="298" height="190" rx="17" fill={C.blue} />}
      <g transform={`translate(${kind==='machine'?205:240} 192)`}>{Array.from({length:10},(_,i)=><rect key={i} x="-13" y="-95" width="26" height="35" rx="3" fill={C.brown} transform={`rotate(${i*36})`} />)}<circle r="73" fill={C.gold} /><circle r="41" fill={C.paper} /><circle r="13" fill={C.brown} />{Array.from({length:6},(_,i)=><path key={i} d="M 0 -15 V -65" transform={`rotate(${i*60})`} stroke={C.brown} strokeWidth="9" />)}</g>
      {kind==='machine'&&<><circle cx="341" cy="135" r="11" fill={C.red} /><circle cx="341" cy="177" r="11" fill={C.green} /><path d="M 326 237 H 356 M 326 253 H 356" fill="none" /></>}
      {kind==='turn'&&<path d="M 153 94 Q 253 34 345 118 l -5 -30 M 345 118 l -31 -2" stroke={C.blue} strokeWidth="6" fill="none" />}
    </>;
    case 'level': return <>
      <path d="M 85 288 V 238 H 182 V 180 H 281 V 120 H 380 V 288 Z" fill={C.blue} /><path d="M 91 238 H 182 M 190 180 H 281 M 288 120 H 380" stroke={C.paleBlue} strokeWidth="7" fill="none" /><Yarn x={132} y={207} scale={.36} color={C.green} /><Yarn x={231} y={147} scale={.36} color={C.gold} /><Yarn x={332} y={86} scale={.36} /><path d="M 105 128 L 159 85 L 215 55 l -22 1 M 215 55 l -8 20" stroke={C.orange} strokeWidth="4" fill="none" />
    </>;
    case 'mirror': return <>
      <path d="M 225 223 V 294 H 257 V 223" fill={C.orange} /><ellipse cx="240" cy="155" rx="93" ry="108" fill={C.gold} /><ellipse cx="240" cy="155" rx="78" ry="92" fill={C.paleBlue} /><Face x={240} y={156} scale={1.2} /><path d="M 177 172 L 245 79 M 186 205 L 265 97" stroke={C.white} strokeWidth="8" opacity=".65" fill="none" /><Spark x={356} y={136} />
    </>;
    case 'pancake': case 'dumpling': case 'sugar': return <>
      <ellipse cx="240" cy="268" rx="146" ry="32" fill={C.blue} /><ellipse cx="240" cy="258" rx="127" ry="22" fill={C.white} />
      {kind==='pancake' ? <><ellipse cx="240" cy="227" rx="99" ry="31" fill={C.orange} /><ellipse cx="240" cy="213" rx="99" ry="31" fill={C.gold} /><path d="M 171 202 Q 239 178 309 209 M 171 221 Q 244 197 309 227" fill="none" stroke={C.orange} strokeWidth="4" /><g fill={C.brown} stroke="none"><circle cx="208" cy="198" r="4" /><circle cx="254" cy="212" r="5" /><circle cx="287" cy="199" r="3" /></g></> : kind==='dumpling' ? <>{[0,1,2].map(i=><g key={i} transform={`translate(${171+i*69} ${225-(i%2)*29}) rotate(${i*9-9})`}><path d="M -49 7 Q 0 -79 49 7 Q 0 45 -49 7 Z" fill={C.paper} /><path d="M -34 -7 L -25 9 M -17 -26 L -9 2 M 3 -31 L 7 1 M 23 -23 L 24 3 M 37 -7 L 34 10" fill="none" strokeWidth="2.5" /></g>)}</> : <>{[0,1,2].map(i=><g key={i} transform={`translate(${169+i*70} ${231-i%2*27})`}><path d="M -30 -13 L 0 -31 L 30 -13 L 0 6 Z" fill={C.white} /><path d="M -30 -13 V 22 L 0 40 V 6 Z" fill={C.sand} /><path d="M 0 6 L 30 -13 V 22 L 0 40 Z" fill={C.paper} /></g>)}<path d="M 163 119 L 198 133 L 211 111 L 246 125 L 231 159 L 197 146 L 182 168 L 148 154 Z" fill={C.red} /><Spark x={324} y={133} /></>}
    </>;
    case 'cat': case 'pig': return <>
      <path d="M 147 228 Q 97 224 110 178 Q 123 146 139 169 Q 150 187 134 194" fill="none" stroke={kind==='cat'?C.orange:C.blush} strokeWidth="14" /><ellipse cx="235" cy="217" rx="103" ry="62" fill={kind==='cat'?C.orange:C.blush} /><path d="M 166 250 V 284 H 189 V 254 M 275 251 V 284 H 299 V 247" fill={kind==='cat'?C.orange:C.blush} /><path d="M 260 160 L 257 102 L 291 128 L 326 104 L 341 164" fill={kind==='cat'?C.orange:C.blush} /><circle cx="300" cy="169" r="55" fill={kind==='cat'?C.orange:C.blush} /><circle cx="282" cy="158" r="4" fill={C.ink} /><circle cx="320" cy="158" r="4" fill={C.ink} />
      {kind==='cat'?<><path d="M 293 174 H 307 L 300 182 Z" fill={C.red} /><path d="M 300 182 q -12 18 -22 4 M 300 182 q 12 18 22 4 M 270 175 l -29 -7 M 271 189 h -30 M 329 175 l 29 -7 M 329 189 h 30" fill="none" strokeWidth="2.5" /><path d="M 160 194 L 178 211 M 183 181 L 198 201 M 212 170 L 223 190" stroke={C.brown} strokeWidth="8" /></> : <><ellipse cx="302" cy="183" rx="29" ry="20" fill={C.red} /><circle cx="291" cy="183" r="4" fill={C.ink} /><circle cx="312" cy="183" r="4" fill={C.ink} /></>}
    </>;
    case 'ice': case 'frozen': return <>
      {[0,1,2].map(i=><g key={i} transform={`translate(${154+i*82} ${201-(i%2)*64})`}><path d="M -49 -13 L 0 -43 L 51 -13 L 0 18 Z" fill={C.paleBlue} /><path d="M -49 -13 V 54 L 0 83 V 18 Z" fill={C.water} /><path d="M 0 18 L 51 -13 V 54 L 0 83 Z" fill={C.blue} /><path d="M -36 6 V 42 M -25 12 V 47" stroke={C.white} strokeWidth="5" fill="none" opacity=".8" /></g>)}<Spark x={361} y={105} color={C.blue} /><path d="M 103 291 Q 238 309 377 291" fill="none" stroke={C.water} />
    </>;
    case 'cold': case 'cool': return <>
      <SmallPerson x={235} y={150} scale={1.05} color={C.blue} /><path d="M 196 173 Q 236 190 276 173 L 272 196 Q 236 211 199 193 Z M 259 193 L 277 243 L 299 234 L 278 186" fill={C.plum} />
      {kind==='cold'?<><g transform="translate(346 122)" stroke={C.blue} fill="none" strokeWidth="4"><path d="M -30 0 H 30 M -15 -26 L 15 26 M -15 26 L 15 -26 M -22 -8 L -14 0 L -22 8 M 22 -8 L 14 0 L 22 8 M -3 -24 L -7 -14 L -19 -16 M 3 24 L 7 14 L 19 16" /></g><path d="M 153 188 l -10 10 l 10 10 M 316 204 l 10 10 l -10 10" fill="none" stroke={C.blue} /></> : <><path d="M 88 117 Q 150 101 182 123 M 73 143 Q 137 130 173 150 M 87 169 Q 128 158 156 173" stroke={C.blue} strokeWidth="4" fill="none" /><Leaf x={356} y={162} angle={100} scale={.8} /></>}
    </>;
    case 'lamp': return <>
      <path d="M 236 162 V 279 M 193 285 H 284" stroke={C.brown} strokeWidth="12" fill="none" /><path d="M 187 89 H 288 L 327 182 H 148 Z" fill={C.gold} /><ellipse cx="238" cy="182" rx="89" ry="14" fill={C.orange} /><path d="M 170 194 L 124 274 H 352 L 306 194" fill={C.gold} fillOpacity=".15" stroke="none" /><path d="M 305 192 V 221" strokeWidth="3" fill="none" /><circle cx="305" cy="226" r="5" fill={C.brown} /><Spark x={110} y={123} />
    </>;
    case 'roast': return <>
      <path d="M 116 225 H 366 L 340 265 H 143 Z" fill={C.dark} /><path d="M 157 264 L 145 294 M 324 264 L 337 294" fill="none" strokeWidth="9" /><Flame x={241} y={242} scale={.4} /><path d="M 107 208 H 373 M 124 187 H 358 M 143 166 H 343" fill="none" stroke={C.ink} strokeWidth="5" />{[0,1,2].map(i=><g key={i} transform={`translate(${176+i*64} ${162+i%2*22}) rotate(-14)`}><path d="M 0 -63 V 57" stroke={C.brown} strokeWidth="5" /><rect x="-19" y="-35" width="38" height="40" rx="8" fill={i===1?C.green:C.orange} /><rect x="-18" y="10" width="36" height="34" rx="7" fill={C.red} /><path d="M -12 -21 L 9 -29 M -11 29 L 10 20" stroke={C.brown} strokeWidth="3" /></g>)}
    </>;
    case 'skirt': return <><path d="M 183 102 H 294 L 335 284 Q 241 312 142 284 Z" fill={C.plum} /><path d="M 183 121 H 294 M 203 127 L 181 284 M 226 128 L 219 294 M 253 128 L 262 294 M 276 127 L 300 284" stroke={C.blush} strokeWidth="4" fill="none" /><path d="M 142 284 Q 241 312 335 284" stroke={C.ink} strokeWidth="5" fill="none" /><Spark x={363} y={151} /></>;
    case 'trousers': return <><path d="M 167 81 H 313 L 323 290 H 260 L 240 177 L 220 290 H 157 Z" fill={C.blue} /><path d="M 168 107 H 313 M 240 108 V 177 M 169 122 Q 198 123 198 151 M 310 122 Q 282 123 282 151 M 158 271 H 221 M 258 271 H 322" stroke={C.navy} fill="none" strokeWidth="4" /><circle cx="239" cy="95" r="4" fill={C.gold} stroke="none" /></>;
    case 'ball': case 'kick': case 'jump': case 'play': return <>
      {kind==='ball'?<><circle cx="240" cy="187" r="98" fill={C.white} /><path d="M 218 148 L 258 139 L 284 173 L 267 211 L 225 212 L 204 178 Z M 182 111 L 169 152 L 145 160 M 312 126 L 309 161 L 336 183 M 321 240 L 281 240 L 263 280 M 186 269 L 192 228 L 156 214" fill={C.darkGreen} /><path d="M 169 152 L 204 178 M 258 139 L 273 98 M 284 173 L 309 161 M 267 211 L 281 240 M 225 212 L 192 228" fill="none" /></> : <>
      <Face x={216} y={87} scale={.85} /><path d="M 210 125 L 228 183" stroke={C.green} strokeWidth="35" fill="none" /><path d="M 211 141 L 165 151 L 148 130 M 233 141 L 266 118 L 288 129" fill="none" stroke={C.skin} strokeWidth="16" /><path d={kind==='jump'?'M 223 201 L 183 233 L 155 211 M 238 201 L 276 233 L 301 215':'M 220 199 L 201 277 H 179 M 239 201 L 290 237 L 332 215'} stroke={C.navy} strokeWidth="21" fill="none" />
      {kind==='jump'?<><path d="M 152 292 H 315" fill="none" stroke={C.sand} /><path d="M 339 240 V 184 l -11 13 M 339 184 l 11 13" stroke={C.orange} fill="none" /></>:<><circle cx="355" cy="250" r="37" fill={C.gold} /><path d="M 323 231 Q 354 246 387 239 M 350 214 Q 335 250 365 285" stroke={C.orange} fill="none" strokeWidth="3" /><path d="M 89 294 H 398" stroke={C.sand} fill="none" /></>}
      </>}
    </>;
    case 'slow': case 'snake': return <>
      {kind==='slow'?<><path d="M 112 266 Q 135 229 188 239 H 299 Q 312 195 342 199 Q 373 205 357 243 Q 377 275 330 284 H 112 Z" fill={C.mint} /><circle cx="226" cy="205" r="66" fill={C.orange} /><path d="M 243 225 C 188 241 172 184 208 165 C 249 144 284 208 246 218 C 219 226 211 194 231 190" fill="none" stroke={C.brown} strokeWidth="6" /><path d="M 328 209 L 316 171 M 346 207 L 357 170" fill="none" strokeWidth="4" /><circle cx="315" cy="169" r="6" fill={C.white} /><circle cx="358" cy="169" r="6" fill={C.white} /><path d="M 334 251 q 10 9 20 -1" fill="none" strokeWidth="3" /></> : <><path d="M 112 266 C 89 192 206 175 218 232 C 228 278 316 274 319 218 L 318 161" stroke={C.ink} strokeWidth="47" fill="none" /><path d="M 112 266 C 89 192 206 175 218 232 C 228 278 316 274 319 218 L 318 161" stroke={C.green} strokeWidth="39" fill="none" /><ellipse cx="321" cy="143" rx="42" ry="33" fill={C.green} /><circle cx="341" cy="135" r="4" fill={C.ink} /><path d="M 354 154 L 385 160 l 11 -7 M 385 160 l 9 10" fill="none" stroke={C.red} strokeWidth="3" /><path d="M 125 220 l 9 17 M 173 205 l -3 18 M 227 249 l -11 13 M 280 250 l 11 13" stroke={C.mint} strokeWidth="6" fill="none" /></>}
    </>;
    case 'butterfly': case 'insect': case 'ant': case 'mosquito': return <>
      {kind==='butterfly'||kind==='insect'?<><path d="M 235 169 C 176 78 101 87 126 178 C 73 225 149 287 235 210 Z" fill={C.plum} /><path d="M 245 169 C 304 78 379 87 354 178 C 407 225 331 287 245 210 Z" fill={C.orange} /><path d="M 168 133 Q 139 127 148 162 Q 190 187 220 184 M 312 133 Q 341 127 332 162 Q 290 187 260 184" fill={C.gold} strokeWidth="3" /><circle cx="160" cy="224" r="16" fill={C.blush} /><circle cx="320" cy="224" r="16" fill={C.gold} /><ellipse cx="240" cy="190" rx="12" ry="64" fill={C.brown} /><path d="M 233 132 Q 206 105 212 87 M 246 132 Q 273 105 267 87" fill="none" /></> : <g transform="translate(240 194)"><path d="M -9 -20 L -65 -59 L -93 -49 M -14 6 L -77 6 L -95 31 M -13 30 L -63 59 L -60 86 M 9 -20 L 65 -59 L 93 -49 M 14 6 L 77 6 L 95 31 M 13 30 L 63 59 L 60 86" fill="none" strokeWidth="5" />{kind==='mosquito'&&<><ellipse cx="-35" cy="-30" rx="22" ry="58" fill={C.paleBlue} transform="rotate(-40 -35 -30)" /><ellipse cx="35" cy="-30" rx="22" ry="58" fill={C.paleBlue} transform="rotate(40 35 -30)" /><path d="M 0 -70 V -112" fill="none" /></>}<ellipse cy="35" rx="27" ry="40" fill={C.brown} /><ellipse rx="20" ry="29" fill={C.orange} /><circle cy="-43" r="25" fill={C.brown} /><path d="M -12 -64 L -28 -92 M 12 -64 L 28 -92" fill="none" /><circle cx="-9" cy="-48" r="3" fill={C.ink} /><circle cx="9" cy="-48" r="3" fill={C.ink} /></g>}
    </>;
    case 'vehicle': return <>
      <path d="M 94 219 L 126 153 Q 134 138 154 138 H 293 Q 312 139 322 153 L 357 203 L 394 216 V 267 H 85 V 238 Q 85 224 94 219 Z" fill={C.red} /><path d="M 148 154 H 219 V 206 H 122 Z M 237 154 H 290 L 325 206 H 237 Z" fill={C.water} /><path d="M 96 232 H 119 M 365 231 H 386" stroke={C.gold} strokeWidth="9" fill="none" /><circle cx="155" cy="263" r="32" fill={C.ink} /><circle cx="155" cy="263" r="15" fill={C.sand} /><circle cx="326" cy="263" r="32" fill={C.ink} /><circle cx="326" cy="263" r="15" fill={C.sand} /><path d="M 267 221 H 282" fill="none" strokeWidth="3" /><path d="M 79 298 H 410" stroke={C.sand} fill="none" />
    </>;
    case 'stone': case 'hard': case 'mineral': case 'broken-stone': case 'jade': return <>
      <path d="M 117 271 L 104 212 L 144 143 L 232 115 L 315 146 L 373 228 L 350 285 Z" fill={kind==='jade'?C.green:kind==='mineral'?C.plum:C.blue} /><path d="M 144 143 L 175 219 L 117 271 M 175 219 L 265 230 L 315 146 M 265 230 L 350 285 M 232 115 L 265 230" fill="none" stroke={kind==='jade'?C.darkGreen:C.navy} strokeWidth="3" />
      {kind==='mineral' && <path d="M 166 203 L 197 153 L 245 166 L 290 211 L 264 261 L 203 250 Z" fill={C.paper} />}
      {kind==='mineral' && <g fill={C.plum} strokeWidth="2"><path d="M 191 217 L 208 178 L 224 212 L 216 244 Z M 226 223 L 243 180 L 263 221 L 249 247 Z" /></g>}
      {kind==='broken-stone'&&<path d="M 223 117 L 209 158 L 229 187 L 212 218 L 234 249 L 222 281" stroke={C.paper} strokeWidth="9" fill="none" />}
      {['hard','mineral','jade'].includes(kind)&&<Spark x={342} y={115} color={kind==='jade'?C.darkGreen:C.plum} />}
    </>;
    case 'soft': return <>
      <path d="M 118 130 Q 175 150 240 125 Q 308 151 366 129 Q 343 200 368 276 Q 299 253 240 279 Q 177 253 112 276 Q 138 201 118 130 Z" fill={C.plum} /><path d="M 139 150 Q 177 164 211 153 M 137 254 Q 177 243 216 259 M 263 257 Q 301 244 343 256" fill="none" stroke={C.blush} strokeWidth="4" /><Hand x={263} y={184} scale={.55} angle={180} /><path d="M 206 180 Q 230 199 258 180 M 199 195 Q 229 217 262 197" stroke={C.ink} fill="none" strokeWidth="3" />
    </>;
    case 'place': return <>
      <path d="M 99 271 L 151 141 L 260 169 L 342 132 L 389 268 L 279 294 L 184 272 Z" fill={C.mint} /><path d="M 152 145 L 185 270 M 259 172 L 278 291" stroke={C.paper} strokeWidth="6" fill="none" /><path d="M 244 218 C 115 91 248 40 291 98 C 330 150 244 218 244 218 Z" fill={C.red} /><circle cx="242" cy="124" r="24" fill={C.paper} /><ellipse cx="244" cy="245" rx="34" ry="9" fill={C.green} stroke="none" />
    </>;
    case 'find': return <>
      <Envelope x={195} y={238} scale={.69} /><path d="M 245 202 L 331 291" stroke={C.brown} strokeWidth="25" fill="none" /><circle cx="227" cy="169" r="75" fill={C.water} fillOpacity=".45" strokeWidth="12" /><path d="M 181 136 Q 192 116 218 117" stroke={C.white} strokeWidth="7" fill="none" /><path d="M 202 178 l 39 -24 M 222 166 l 10 15 M 235 159 l 11 13" stroke={C.gold} strokeWidth="9" fill="none" /><circle cx="191" cy="184" r="14" fill="none" stroke={C.gold} strokeWidth="9" /><Spark x={362} y={132} />
    </>;
    case 'clap': return <><Hand x={189} y={209} scale={.95} angle={30} /><Hand x={285} y={209} scale={.95} angle={-30} /><path d="M 220 93 L 213 73 M 245 88 V 63 M 269 94 L 279 75" stroke={C.orange} strokeWidth="5" fill="none" /><Spark x={358} y={179} /></>;
    case 'hug': return <>
      <SmallPerson x={238} y={143} scale={1.15} color={C.blue} /><SmallPerson x={241} y={205} scale={.58} color={C.gold} /><path d="M 197 195 Q 160 244 232 245 M 283 196 Q 316 243 249 246" stroke={C.skin} strokeWidth="19" fill="none" /><Heart x={348} y={123} scale={.42} />
    </>;
    case 'lift': return <>
      <SmallPerson x={210} y={139} scale={1.05} /><path d="M 247 177 L 288 145 L 309 165" stroke={C.skin} strokeWidth="15" fill="none" /><rect x="286" y="178" width="78" height="89" rx="10" fill={C.gold} /><path d="M 303 180 V 167 Q 325 143 346 167 V 180" fill="none" strokeWidth="6" /><path d="M 389 238 V 170 l -11 13 M 389 170 l 11 13" stroke={C.orange} fill="none" strokeWidth="4" />
    </>;
    case 'hit': return <>
      <path d="M 104 284 H 384 V 307 H 104 Z" fill={C.brown} /><path d="M 258 285 V 239 M 244 238 H 273" stroke={C.navy} strokeWidth="8" fill="none" /><g transform="translate(259 179) rotate(36)"><rect x="-9" y="-8" width="18" height="113" rx="6" fill={C.brown} /><path d="M -59 -43 H 36 L 59 -21 V 6 H 13 V -12 H -59 Z" fill={C.blue} /><path d="M -46 -31 H -12" stroke={C.white} strokeWidth="5" fill="none" /></g><path d="M 258 207 V 220 M 229 213 L 238 223 M 287 212 L 278 223" stroke={C.orange} strokeWidth="4" fill="none" /><Hand x={176} y={218} scale={.45} angle={35} />
    </>;
    case 'sing': case 'call': return <>
      <Scene kind="speak" />{kind==='sing'&&<g fill={C.plum} strokeWidth="3"><path d="M 295 77 V 122 Q 274 141 267 126 Q 262 111 287 109 V 81 L 327 69 V 111 Q 307 129 300 116 Q 294 101 319 98 V 62 Z" /></g>}{kind==='call'&&<path d="M 125 199 L 111 176 L 105 157 M 119 183 L 132 160" stroke={C.skin} strokeWidth="11" fill="none" />}
    </>;
    default: return null;
  }
}

function Scene({ kind }: { kind: string }) {
  const textile = TextileScene({ kind });
  if (textile) return textile;
  const extra = ExtraScene({ kind });
  if (extra) return extra;
  if (SCENE_ALIASES[kind]) return <Scene kind={SCENE_ALIASES[kind]} />;
  switch (kind) {
    case 'water': return <>
      <path d="M 124 271 Q 240 303 356 271" fill="none" stroke={C.blue} /><ellipse cx="240" cy="275" rx="81" ry="15" fill={C.paleBlue} stroke="none" />
      <Drop x={240} y={169} size={2.55} /><Drop x={120} y={202} size={.55} /><Drop x={361} y={123} size={.5} /><Spark x={350} y={205} />
    </>;
    case 'oil': return <>
      <path d="M 159 231 Q 246 279 335 231 L 316 273 Q 244 302 176 273 Z" fill={C.dark} />
      <ellipse cx="247" cy="230" rx="88" ry="28" fill="#7D7B65" /><ellipse cx="245" cy="232" rx="48" ry="13" fill={C.gold} strokeWidth="2" />
      <path d="M 334 236 L 408 214 Q 420 213 419 226 L 350 252" fill={C.brown} />
      <g transform="translate(172 127) rotate(-38)"><rect x="-35" y="-49" width="70" height="111" rx="14" fill={C.gold} /><rect x="-15" y="-76" width="30" height="29" rx="4" fill={C.green} /><rect x="-23" y="-25" width="46" height="49" rx="5" fill={C.paper} /><Leaf x={3} y={15} scale={.7} angle={22} color={C.darkGreen} /><path d="M -22 -40 V -29" stroke={C.white} strokeWidth="6" /></g>
      <path d="M 211 149 Q 232 167 239 194" stroke={C.gold} strokeWidth="9" fill="none" /><Drop x={244} y={209} size={.48} color={C.gold} />
    </>;
    case 'swim': return <>
      <path d="M 64 221 Q 240 190 416 223 V 294 H 64 Z" fill={C.water} stroke="none" />
      <path d="M 145 225 Q 188 188 247 219 L 286 234" stroke={C.green} strokeWidth="35" fill="none" />
      <Face x={291} y={188} scale={.87} /><path d="M 196 214 L 148 178 L 103 196 M 245 224 L 317 240 L 360 224" fill="none" stroke={C.skin} strokeWidth="19" />
      <path d="M 276 174 H 311 M 277 177 Q 291 191 306 177" fill="none" stroke={C.navy} strokeWidth="5" /><Waves y={249} /><Drop x={113} y={155} size={.35} /><Drop x={361} y={198} size={.4} />
    </>;
    case 'river': return <>
      <Mountain x={254} y={180} scale={.6} /><path d="M 67 286 Q 153 239 126 205 Q 95 171 210 153 L 253 153 Q 161 184 204 211 Q 295 262 403 287 Z" fill={C.water} />
      <path d="M 218 170 Q 154 190 182 210 M 184 238 Q 227 261 288 272" fill="none" stroke={C.white} strokeWidth="5" />
      <Tree x={94} y={248} scale={.48} /><Tree x={360} y={255} scale={.6} /><Grass x={322} y={290} scale={.4} />
    </>;
    case 'sea': return <>
      <Sun x={330} y={114} scale={.42} /><path d="M 62 191 Q 240 172 418 191 V 292 H 62 Z" fill={C.water} stroke="none" />
      <path d="M 150 210 H 303 L 280 242 H 179 Z" fill={C.red} /><path d="M 225 199 V 95 L 287 186 H 225" fill={C.white} /><path d="M 217 118 L 171 186 H 217 Z" fill={C.gold} /><Waves x={70} y={259} rows={2} />
      <path d="M 88 126 q 11 -12 22 0 q 11 -12 22 0 M 302 158 q 8 -8 16 0 q 8 -8 16 0" fill="none" strokeWidth="3" />
    </>;
    case 'wash': return <>
      <path d="M 93 160 V 126 Q 93 99 122 99 H 173 V 124 H 126 V 162" fill={C.blue} /><path d="M 83 163 H 137" fill="none" strokeWidth="7" />
      <Drop x={111} y={187} size={.4} /><Drop x={116} y={216} size={.32} />
      <path d="M 75 248 H 395 Q 381 301 237 300 Q 88 300 75 248 Z" fill={C.white} /><ellipse cx="235" cy="248" rx="160" ry="24" fill={C.paleBlue} />
      <g transform="translate(270 197) rotate(-16)"><path d="M 104 -35 L 37 -19 L -27 -38 Q -42 -42 -44 -31 L 6 -9 L -61 -18 Q -77 -17 -74 -7 L -5 8 L -64 6 Q -81 11 -68 20 L -1 27 L -47 31 Q -61 40 -44 45 L 35 34 L 114 15" fill={C.skin} /><path d="M 36 -19 Q 24 2 35 34" fill="none" strokeWidth="3" /></g>
      <g fill={C.white} stroke={C.blue} strokeWidth="2"><circle cx="174" cy="197" r="14" /><circle cx="210" cy="203" r="9" /><circle cx="162" cy="170" r="8" /><circle cx="250" cy="243" r="8" /></g><Spark x={345} y={111} />
    </>;
    case 'clear': return <>
      <Cup x={240} y={204} scale={1.6} transparent /><path d="M 143 277 H 338" fill="none" stroke={C.sand} /><Spark x={337} y={128} color={C.blue} /><Spark x={145} y={180} size={8} color={C.blue} />
      <path d="M 318 232 l 34 -20 l -5 20 l 5 -20 l -21 -1" fill="none" stroke={C.navy} strokeWidth="3" />
    </>;
    case 'tear': return <>
      <path d="M 155 289 Q 156 226 240 222 Q 327 229 328 289" fill={C.plum} /><Face x={240} y={159} scale={1.65} mood="sad" />
      <Drop x={209} y={204} size={.65} /><Drop x={277} y={222} size={.46} /><path d="M 307 245 L 347 258 L 327 284 L 293 270 Z" fill={C.white} strokeWidth="3" />
    </>;
    case 'drink': return <>
      <path d="M 134 293 Q 143 219 202 215 Q 271 222 281 293" fill={C.green} /><Face x={202} y={158} scale={1.35} /><Cup x={309} y={199} scale={.82} />
      <path d="M 263 268 L 297 236 L 313 218" stroke={C.skin} strokeWidth="22" fill="none" /><path d="M 306 157 L 288 112 L 247 122" fill="none" stroke={C.blue} strokeWidth="6" /><path d="M 245 121 L 233 129" stroke={C.blue} strokeWidth="6" /><Drop x={369} y={131} size={.43} />
    </>;
    case 'eat': return <>
      <path d="M 125 291 Q 129 216 196 212 Q 258 216 270 291" fill={C.orange} /><Face x={195} y={151} scale={1.25} mood="open" /><Bowl x={321} y={257} scale={.73} />
      <path d="M 261 254 L 287 201 L 236 175" stroke={C.skin} strokeWidth="19" fill="none" /><path d="M 288 201 L 236 163 M 290 211 L 237 173" stroke={C.brown} strokeWidth="5" fill="none" /><circle cx="234" cy="168" r="11" fill={C.mint} />
    </>;
    case 'speak': return <>
      <path d="M 105 291 Q 105 225 177 221 Q 240 227 243 291" fill={C.blue} /><Face x={176} y={162} scale={1.35} mood="open" /><SpeechBubble x={318} y={128} scale={.95} />
      <path d="M 224 170 l 18 -8 M 230 189 h 23 M 226 208 l 20 9" stroke={C.orange} fill="none" strokeWidth="4" />
    </>;
    case 'ask': return <>
      <path d="M 104 293 Q 109 221 179 222 Q 249 224 252 293" fill={C.plum} /><Face x={178} y={165} scale={1.34} mood="think" /><SpeechBubble x={319} y={131} scale={.93}>
        <path d="M -19 -13 C -19 -44 31 -43 32 -15 C 32 4 5 4 5 22" stroke={C.orange} strokeWidth="9" fill="none" /><circle cx="5" cy="35" r="5" fill={C.orange} stroke="none" />
      </SpeechBubble><path d="M 232 265 L 257 220 L 238 207" stroke={C.skin} strokeWidth="17" fill="none" />
    </>;
    case 'heart': return <>
      <Heart x={240} y={172} scale={1.4} /><path d="M 161 188 H 200 L 221 155 L 242 222 L 264 179 L 278 188 H 316" stroke={C.white} strokeWidth="6" fill="none" /><Spark x={356} y={108} /><Spark x={124} y={219} size={8} />
    </>;
    case 'happy': return <>
      <path d="M 149 294 Q 152 222 240 218 Q 327 223 332 294" fill={C.gold} /><Face x={240} y={153} scale={1.6} mood="happy" /><Heart x={350} y={117} scale={.4} /><Spark x={118} y={150} /><path d="M 140 229 L 99 181 L 108 153 M 339 232 L 378 186 L 371 160" stroke={C.skin} strokeWidth="18" fill="none" />
    </>;
    case 'think': return <>
      <path d="M 145 294 Q 152 226 229 221 Q 302 229 310 294" fill={C.green} /><Face x={226} y={166} scale={1.5} mood="think" /><path d="M 298 282 L 318 225 L 263 206" fill="none" stroke={C.skin} strokeWidth="20" />
      <g fill={C.white} strokeWidth="3"><circle cx="300" cy="151" r="7" /><circle cx="320" cy="128" r="11" /><path d="M 315 85 C 291 58 318 29 342 43 C 359 18 393 37 390 59 C 421 71 400 105 378 100 C 357 117 328 110 315 85 Z" /></g><path d="M 350 61 Q 366 42 378 62 Q 386 79 367 85 V 94" stroke={C.gold} strokeWidth="5" fill="none" />
    </>;
    case 'angry': return <>
      <path d="M 145 294 Q 148 224 240 221 Q 331 224 335 294" fill={C.red} /><Face x={240} y={158} scale={1.65} mood="angry" /><path d="M 128 153 Q 101 135 113 117 M 357 155 Q 384 137 373 119" fill="none" stroke={C.orange} strokeWidth="6" /><path d="M 317 93 v 15 h 15 M 305 82 h -15 v 15" stroke={C.red} strokeWidth="5" fill="none" />
      <path d="M 145 265 L 119 235 L 98 245 M 333 266 L 360 234 L 381 247" stroke={C.skin} strokeWidth="19" fill="none" />
    </>;
    case 'hand': return <><Hand x={240} y={199} scale={1.5} /><Spark x={355} y={138} /><path d="M 130 196 l -22 -7 M 131 225 h -25" stroke={C.orange} fill="none" /></>;
    case 'push': return <>
      <rect x="281" y="150" width="114" height="134" rx="6" fill={C.gold} /><path d="M 281 180 H 395 M 325 150 V 179" fill="none" strokeWidth="3" /><Face x={172} y={119} scale={.9} />
      <path d="M 173 154 L 192 215" stroke={C.green} strokeWidth="37" fill="none" /><path d="M 190 175 L 230 199 L 279 187 M 188 193 L 226 216 L 278 208" stroke={C.skin} strokeWidth="14" fill="none" /><path d="M 193 228 L 158 279 L 124 279 M 198 226 L 222 276 L 247 276" fill="none" stroke={C.navy} strokeWidth="18" /><path d="M 346 119 H 395 l -15 -12 M 395 119 l -15 12" stroke={C.orange} fill="none" strokeWidth="4" />
    </>;
    case 'pull': return <>
      <rect x="290" y="178" width="104" height="103" rx="6" fill={C.gold} /><path d="M 290 200 H 394 M 331 179 V 199" fill="none" strokeWidth="3" /><Face x={171} y={117} scale={.9} />
      <path d="M 176 152 L 151 215" stroke={C.plum} strokeWidth="37" fill="none" /><path d="M 170 170 L 213 199 L 236 199" stroke={C.skin} strokeWidth="16" fill="none" /><path d="M 235 198 L 291 218" stroke={C.brown} strokeWidth="5" fill="none" /><path d="M 149 229 L 120 280 H 92 M 160 231 L 187 279 H 217" stroke={C.navy} strokeWidth="18" fill="none" /><path d="M 130 82 H 85 l 15 -12 M 85 82 l 15 12" stroke={C.orange} fill="none" strokeWidth="4" />
    </>;
    case 'hold': return <>
      <path d="M 147 293 Q 155 217 241 216 Q 324 224 332 293" fill={C.blue} /><Face x={240} y={132} scale={1.14} /><rect x="186" y="192" width="108" height="83" rx="7" fill={C.gold} /><path d="M 186 215 H 294 M 240 193 V 215" fill="none" strokeWidth="3" />
      <path d="M 162 232 Q 157 278 200 263 M 320 232 Q 325 278 280 263" stroke={C.skin} strokeWidth="22" fill="none" /><path d="M 207 252 L 213 266 M 273 253 L 267 267" fill="none" strokeWidth="2.5" />
    </>;
    case 'person': return <>
      <Face x={240} y={101} scale={1.1} /><path d="M 211 145 Q 241 134 269 145 L 283 222 H 197 Z" fill={C.green} /><path d="M 206 158 L 175 211 L 154 224 M 274 159 L 299 208 L 326 218" stroke={C.skin} strokeWidth="18" fill="none" /><path d="M 219 224 L 208 287 H 181 M 260 224 L 272 287 H 299" stroke={C.navy} strokeWidth="23" fill="none" /><Flower x={369} y={289} scale={.36} />
    </>;
    case 'rest': return <>
      <Tree x={322} y={286} scale={1.03} /><Face x={220} y={171} scale={.94} mood="sleep" /><path d="M 221 209 L 253 244" stroke={C.blue} strokeWidth="39" fill="none" /><path d="M 246 255 L 190 272 L 143 270 M 258 263 L 209 292 L 156 290" stroke={C.navy} strokeWidth="18" fill="none" /><path d="M 215 218 Q 197 241 176 230" stroke={C.skin} strokeWidth="15" fill="none" /><Grass x={366} y={293} scale={.39} />
    </>;
    case 'tree': return <><Tree x={240} y={288} scale={1.15} fruit /><Grass x={137} y={292} scale={.35} /><Grass x={349} y={291} scale={.31} /><Leaf x={365} y={150} angle={83} scale={.65} /></>;
    case 'forest': return <>
      <Tree x={174} y={232} scale={.84} /><Tree x={312} y={231} scale={.79} /><Tree x={99} y={286} scale={.78} /><Tree x={237} y={292} scale={1.08} /><Tree x={382} y={288} scale={.81} /><path d="M 187 302 Q 236 283 288 302" fill="none" stroke={C.brown} strokeWidth="9" />
    </>;
    case 'sun': return <><Sun x={240} y={164} scale={1.05} /><path d="M 88 291 Q 152 253 240 278 Q 332 244 397 291" fill={C.mint} stroke="none" /><Flower x={139} y={295} scale={.32} /></>;
    case 'moon': return <><path d="M 90 281 Q 179 254 242 281 Q 309 261 393 281" fill="none" stroke={C.plum} /><Moon x={232} y={168} scale={1.03} /><Spark x={352} y={105} color={C.plum} /><Spark x={120} y={147} color={C.plum} size={9} /><Spark x={348} y={235} size={7} /></>;
    case 'bright': return <>
      <Sun x={165} y={154} scale={.72} /><Moon x={320} y={167} scale={.73} /><path d="M 139 272 H 341 M 168 290 H 311" stroke={C.gold} strokeWidth="5" fill="none" /><Spark x={239} y={82} /><Spark x={367} y={260} size={8} /><Spark x={104} y={255} size={8} />
    </>;
    case 'fire': return <>
      <path d="M 158 274 L 319 291 M 167 294 L 318 270" stroke={C.brown} strokeWidth="17" fill="none" /><Flame x={240} y={221} scale={1.1} /><path d="M 157 138 l -10 -17 M 325 119 l 6 -20" stroke={C.orange} fill="none" strokeWidth="5" />
    </>;
    case 'cook': return <>
      <rect x="98" y="265" width="285" height="30" rx="8" fill={C.blue} /><Flame x={241} y={257} scale={.43} /><path d="M 133 171 H 348 L 328 243 Q 240 278 154 243 Z" fill={C.red} /><ellipse cx="240" cy="172" rx="108" ry="22" fill={C.paper} /><path d="M 143 190 L 111 176 Q 85 174 88 193 Q 89 207 145 215 M 341 190 L 373 176 Q 399 174 396 193 Q 395 207 339 215" fill="none" strokeWidth="7" />
      <g fill={C.mint} strokeWidth="2"><ellipse cx="196" cy="170" rx="21" ry="10" /><ellipse cx="263" cy="172" rx="24" ry="10" /></g><path d="M 183 129 Q 167 115 184 101 Q 198 86 185 72 M 239 125 Q 224 109 240 95 Q 255 81 242 63 M 296 129 Q 280 113 295 99" stroke={C.brown} fill="none" strokeWidth="3" /><path d="M 301 167 L 348 91" stroke={C.brown} strokeWidth="9" />
    </>;
    case 'grass': return <><path d="M 87 294 H 391" stroke={C.brown} fill="none" /><Grass x={150} y={286} scale={.84} /><Grass x={292} y={286} scale={1.1} /><Drop x={115} y={207} size={.3} /><Drop x={332} y={211} size={.3} /><Leaf x={385} y={156} scale={.7} angle={70} /></>;
    case 'flower': return <><Flower x={235} y={292} scale={1.14} /><Flower x={353} y={292} scale={.59} color={C.gold} /><Grass x={125} y={294} scale={.45} /><path d="M 112 117 q 10 -18 19 0 q 11 -18 21 0 q -20 28 -40 0" fill={C.plum} strokeWidth="2" /></>;
    case 'home': return <><House x={243} y={278} scale={1.03} /><path d="M 218 281 L 197 307 H 287 L 267 281" fill={C.sand} stroke="none" /><Flower x={92} y={287} scale={.4} /><Tree x={381} y={281} scale={.51} /><Heart x={242} y={155} scale={.22} /></>;
    case 'safe': return <>
      <House x={239} y={283} scale={1.04} /><path d="M 240 110 L 307 132 V 183 Q 300 220 240 247 Q 180 220 173 183 V 132 Z" fill={C.darkGreen} /><path d="M 206 174 L 230 197 L 275 151" stroke={C.white} strokeWidth="10" fill="none" /><Spark x={116} y={150} /><Spark x={362} y={183} size={9} />
    </>;
    case 'money': return <>
      <rect x="105" y="131" width="226" height="117" rx="9" fill={C.green} transform="rotate(-10 218 189)" /><rect x="132" y="147" width="226" height="117" rx="9" fill={C.mint} /><path d="M 151 165 H 338 V 245 H 151 Z" fill="none" stroke={C.darkGreen} strokeWidth="2" /><circle cx="245" cy="205" r="33" fill={C.green} /><path d="M 236 190 Q 259 181 260 196 Q 259 207 237 207 Q 226 221 253 222 M 246 184 V 230" stroke={C.paper} strokeWidth="4" fill="none" />
      {[0, 1, 2].map(n => <g key={n} transform={`translate(${328 + n * 6} ${277 - n * 12})`}><ellipse rx="39" ry="13" fill={C.orange} /><path d="M -39 -9 V 0 Q 0 19 39 0 V -9" fill={C.gold} /><ellipse cy="-9" rx="39" ry="13" fill={C.gold} /></g>)}<Spark x={366} y={115} />
    </>;
    case 'metal': return <>
      <path d="M 119 275 L 144 208 H 290 L 321 275 Z" fill={C.blue} /><path d="M 144 208 L 174 185 H 309 L 290 208 Z" fill={C.paleBlue} /><path d="M 290 208 L 309 185 L 344 250 L 321 275 Z" fill={C.navy} /><path d="M 149 235 H 266 M 141 253 H 258" stroke={C.paleBlue} strokeWidth="4" fill="none" />
      <g transform="translate(255 129) rotate(33)"><path d="M -9 10 H 9 V 114 H -9 Z" fill={C.brown} /><path d="M -54 -16 H 35 L 52 -1 L 52 20 H 13 V 3 H -54 Z" fill={C.blue} /><path d="M -43 -7 H -10" stroke={C.white} strokeWidth="5" /></g><Spark x={117} y={168} color={C.navy} />
    </>;
    case 'thread': return <>
      <path d="M 186 127 H 281 V 259 H 186 Z" fill={C.red} /><ellipse cx="233" cy="127" rx="60" ry="18" fill={C.brown} /><ellipse cx="233" cy="259" rx="60" ry="18" fill={C.brown} /><ellipse cx="233" cy="127" rx="18" ry="6" fill={C.ink} />
      {[151, 165, 179, 193, 207, 221, 235].map(y => <path key={y} d={`M 188 ${y} Q 233 ${y + 14} 279 ${y}`} fill="none" stroke={C.blush} strokeWidth="5" />)}
      <path d="M 280 237 Q 334 259 361 228 Q 401 175 370 154 Q 340 136 314 185" fill="none" stroke={C.red} strokeWidth="5" /><path d="M 337 160 L 390 82" stroke={C.navy} strokeWidth="6" fill="none" /><ellipse cx="382" cy="94" rx="4" ry="9" transform="rotate(34 382 94)" fill={C.paper} strokeWidth="2" /><Spark x={123} y={156} />
    </>;
    case 'clothes': return <>
      <path d="M 165 111 L 205 95 Q 240 128 275 95 L 315 111 L 366 179 L 320 209 L 294 178 V 288 H 186 V 178 L 160 209 L 114 179 Z" fill={C.blue} /><path d="M 205 95 Q 209 145 240 145 Q 271 145 275 95 M 186 266 H 294" fill="none" stroke={C.navy} strokeWidth="4" /><path d="M 257 174 H 282 V 207 Q 269 217 257 207 Z" fill={C.water} /><path d="M 186 178 L 177 145 M 294 178 L 303 145" fill="none" strokeWidth="3" /><Spark x={363} y={109} /><Spark x={108} y={262} size={8} />
    </>;
    case 'foot': return <>
      <path d="M 218 77 H 276 L 270 170 Q 280 186 299 207 Q 321 231 306 252 Q 292 270 270 254 Q 248 241 234 250 L 175 271 Q 137 281 128 256 Q 119 234 148 224 L 204 198 Z" fill={C.skin} />
      <path d="M 140 240 Q 131 253 145 263 M 158 230 Q 149 246 163 256 M 178 223 Q 169 239 183 249 M 199 215 Q 191 233 203 242 M 234 201 Q 252 209 253 224" fill="none" strokeWidth="3" /><path d="M 218 105 H 275" stroke={C.white} strokeWidth="7" /><path d="M 111 286 Q 208 311 319 282" fill="none" stroke={C.sand} />
    </>;
    case 'run': return <>
      <Face x={255} y={107} scale={.9} /><path d="M 242 145 L 214 202" stroke={C.orange} strokeWidth="39" fill="none" /><path d="M 228 163 L 180 157 L 161 127 M 247 159 L 292 181 L 319 155" stroke={C.skin} strokeWidth="17" fill="none" /><path d="M 213 218 L 269 244 L 313 225 M 202 216 L 163 272 L 122 272" stroke={C.navy} strokeWidth="22" fill="none" /><path d="M 303 224 L 329 218 M 121 273 H 99" stroke={C.red} strokeWidth="15" fill="none" /><path d="M 102 185 H 151 M 84 208 H 132 M 95 232 H 126" stroke={C.brown} strokeWidth="4" fill="none" /><path d="M 113 295 H 348" stroke={C.sand} fill="none" />
    </>;
    case 'road': return <>
      <path d="M 76 293 L 197 89 H 269 L 405 293 Z" fill={C.navy} /><path d="M 89 292 L 204 91 M 390 292 L 263 91" stroke={C.paper} strokeWidth="5" fill="none" /><path d="M 230 110 L 230 140 M 230 163 L 231 203 M 232 233 L 234 285" stroke={C.gold} strokeWidth="7" fill="none" /><Tree x={104} y={202} scale={.52} /><Tree x={357} y={214} scale={.62} /><Grass x={375} y={294} scale={.43} />
    </>;
    case 'eye': return <><Eye x={240} y={183} scale={1.3} /><Spark x={107} y={99} /><Spark x={370} y={260} size={9} /></>;
    case 'look': return <>
      <Face x={168} y={170} scale={1.35} /><path d="M 101 290 Q 101 227 167 224 Q 231 230 237 290" fill={C.blue} /><path d="M 209 180 L 317 157 M 210 187 L 318 197" stroke={C.orange} strokeDasharray="6 9" fill="none" strokeWidth="3" /><Flower x={354} y={282} scale={.87} /><path d="M 145 172 q 14 -10 25 0" fill="none" strokeWidth="3" />
    </>;
    case 'ear': return <><Ear x={223} y={178} scale={1.22} /><path d="M 341 124 Q 382 177 341 230 M 321 147 Q 345 177 321 207" stroke={C.blue} fill="none" strokeWidth="5" /></>;
    case 'hear': return <>
      <Ear x={284} y={181} scale={1.05} /><g fill={C.plum}><path d="M 121 128 L 174 114 V 190 Q 153 215 137 197 Q 125 179 155 174 V 140 L 121 149 Z" /><ellipse cx="108" cy="210" rx="16" ry="12" transform="rotate(-25 108 210)" /><path d="M 121 128 V 207" fill="none" /></g><path d="M 201 142 Q 232 180 201 218 M 218 123 Q 263 180 218 237" stroke={C.blue} fill="none" strokeWidth="4" /><Spark x={368} y={109} />
    </>;
    case 'mouth': return <>
      <path d="M 109 183 Q 171 153 207 127 Q 237 110 240 134 Q 243 110 273 127 Q 309 153 371 183 Q 240 306 109 183 Z" fill={C.red} /><path d="M 109 183 Q 176 175 240 182 Q 304 175 371 183 Q 240 247 109 183 Z" fill={C.ink} /><path d="M 157 184 Q 240 202 323 184 Q 312 217 240 218 Q 168 217 157 184 Z" fill={C.white} /><path d="M 193 250 Q 240 267 286 248" stroke={C.blush} strokeWidth="6" fill="none" /><Spark x={348} y={110} size={9} />
    </>;
    case 'rain': return <>
      <path d="M 128 148 C 84 139 99 81 139 86 C 159 37 226 51 237 86 C 280 49 326 71 329 106 C 382 93 405 150 367 170 H 132 Q 110 166 128 148 Z" fill={C.blue} /><path d="M 144 104 Q 165 77 190 93" stroke={C.paleBlue} strokeWidth="5" fill="none" />
      {[{x:137,y:217},{x:200,y:250},{x:263,y:211},{x:325,y:253}].map((p,i) => <Drop key={i} {...p} size={.64} />)}<path d="M 93 294 Q 240 308 390 294" stroke={C.water} fill="none" /><Grass x={374} y={291} scale={.38} />
    </>;
    case 'mountain': return <><Sun x={335} y={107} scale={.38} /><Mountain x={238} y={282} scale={1.12} /><path d="M 88 291 H 412" fill="none" stroke={C.brown} /><Tree x={120} y={284} scale={.36} /></>;
    case 'field': return <>
      <path d="M 74 174 L 246 105 L 414 175 L 246 292 Z" fill={C.green} /><path d="M 74 174 L 246 292 M 246 105 V 292 M 414 175 H 74 M 162 138 L 330 235 M 331 140 L 160 234" stroke={C.paper} strokeWidth="9" fill="none" />
      <g stroke={C.darkGreen} strokeWidth="3" fill="none">{[{x:159,y:178},{x:247,y:147},{x:332,y:180},{x:247,y:240}].map((p,i) => <path key={i} d={`M ${p.x} ${p.y} v -20 m 0 11 q -15 -4 -13 -15 m 13 13 q 15 -5 13 -16`} />)}</g><Sun x={368} y={83} scale={.26} />
    </>;
    case 'animal':
    case 'dog': return <>
      <path d="M 139 217 Q 103 221 100 184 Q 77 193 92 224 Q 110 247 145 240" fill={C.brown} /><path d="M 140 199 Q 199 160 283 191 L 301 240 H 138 Z" fill={C.brown} /><path d="M 153 235 V 285 H 180 L 187 239 M 254 238 L 267 285 H 294 L 288 227" fill={C.brown} /><path d="M 249 184 L 256 118 Q 282 87 325 116 L 343 146 L 374 154 Q 383 182 353 194 L 305 202 L 291 229" fill={C.brown} /><path d="M 270 117 Q 228 114 238 167 Q 261 185 275 149 Z" fill={C.ink} /><ellipse cx="369" cy="159" rx="10" ry="8" fill={C.dark} /><circle cx="317" cy="137" r="5" fill={C.dark} /><path d="M 346 182 Q 331 200 321 182" fill="none" strokeWidth="3" /><path d="M 282 202 L 310 192" stroke={C.red} strokeWidth="10" /><circle cx="300" cy="205" r="8" fill={C.gold} /><path d="M 116 292 H 334" stroke={C.sand} fill="none" />
    </>;
    case 'horse': return <>
      <path d="M 140 192 Q 200 158 267 188 L 296 230 H 145 Z" fill={C.brown} /><path d="M 153 230 L 141 287 H 164 L 183 233 M 243 231 L 260 287 H 284 L 273 222" fill={C.brown} /><path d="M 253 185 L 267 115 L 285 83 L 302 99 L 318 90 L 329 125 L 365 163 Q 371 185 346 192 L 310 166 L 294 224" fill={C.brown} /><path d="M 271 112 Q 248 127 249 174 L 233 198 L 257 207 L 280 140" fill={C.ink} /><path d="M 144 194 Q 112 166 103 190 Q 90 225 116 261 Q 102 210 144 214" fill={C.ink} /><circle cx="319" cy="134" r="4" fill={C.ink} /><path d="M 340 171 l 5 3 M 273 100 L 278 119" fill="none" strokeWidth="3" /><path d="M 138 286 H 167 M 258 287 H 287" stroke={C.ink} strokeWidth="10" /><Grass x={349} y={290} scale={.44} />
    </>;
    case 'bird': return <><path d="M 88 295 L 384 276" stroke={C.brown} strokeWidth="12" fill="none" /><Bird x={242} y={182} scale={1.01} /><Leaf x={342} y={281} angle={90} scale={.75} /><Leaf x={113} y={289} angle={-20} scale={.65} /></>;
    case 'book': return <><Book x={240} y={222} scale={1.3} /><Spark x={361} y={100} /><Leaf x={124} y={121} scale={.7} angle={-30} /></>;
    case 'study': return <>
      <path d="M 165 261 Q 167 168 241 172 Q 315 169 317 261" fill={C.green} /><Face x={240} y={126} scale={1.11} /><path d="M 181 233 L 164 265 M 300 230 L 324 256" stroke={C.skin} strokeWidth="18" fill="none" /><rect x="83" y="273" width="315" height="16" rx="5" fill={C.brown} /><Book x={236} y={249} scale={.8} /><path d="M 326 257 L 344 221" stroke={C.orange} strokeWidth="7" fill="none" /><path d="M 94 270 V 177 L 123 135 H 174 L 186 154 H 130 L 110 185" fill={C.gold} /><path d="M 126 157 L 167 242" stroke={C.gold} strokeWidth="2" fill="none" opacity=".4" />
    </>;
    case 'bamboo': return <>
      <g fill={C.green}><path d="M 178 293 L 188 65 H 213 L 204 293 Z" /><path d="M 249 293 L 235 96 H 260 L 276 293 Z" /><path d="M 313 293 L 327 121 H 348 L 335 293 Z" /></g><g fill="none" stroke={C.darkGreen} strokeWidth="5"><path d="M 186 116 H 211 M 183 173 H 209 M 181 232 H 206 M 238 151 H 264 M 242 213 H 270 M 322 181 H 345 M 318 238 H 340" /></g>
      <Leaf x={197} y={120} angle={-25} scale={1.28} /><Leaf x={203} y={168} angle={88} scale={1.4} /><Leaf x={253} y={150} angle={-12} scale={1.2} /><Leaf x={266} y={209} angle={95} scale={1.25} /><Leaf x={334} y={181} angle={105} scale={1.05} /><Leaf x={328} y={236} angle={-20} scale={1.0} /><path d="M 149 295 H 365" stroke={C.brown} fill="none" />
    </>;
    case 'food': return <>
      <Bowl x={216} y={235} scale={1.05} /><path d="M 162 142 L 179 115 M 190 135 L 205 106" stroke={C.brown} strokeWidth="7" fill="none" /><g transform="translate(334 219)"><path d="M -29 -14 Q -49 -46 -24 -57 Q -7 -64 0 -48 Q 13 -64 33 -56 Q 60 -43 37 -14 L 18 36 H -9 Z" fill={C.orange} /><path d="M 4 -48 L 4 26" stroke={C.gold} fill="none" strokeWidth="3" /><Leaf x={3} y={-47} scale={.7} angle={30} /></g><Spark x={354} y={116} />
    </>;
    case 'sick': return <>
      <path d="M 136 293 Q 144 219 240 219 Q 334 223 344 293" fill={C.plum} /><Face x={240} y={157} scale={1.5} mood="sad" /><path d="M 194 112 Q 240 94 284 112 L 282 132 Q 239 116 196 132 Z" fill={C.white} /><rect x="285" y="192" width="10" height="60" rx="5" fill={C.white} transform="rotate(35 290 222)" /><path d="M 284 237 L 298 215" stroke={C.red} strokeWidth="4" /><path d="M 209 186 Q 231 202 254 186" stroke={C.red} strokeWidth="3" opacity=".5" fill="none" /><g fill={C.white} strokeWidth="2"><path d="M 345 109 h 48 v 43 h -48 Z" /><path d="M 369 118 v 25 M 357 131 h 25" stroke={C.red} strokeWidth="6" /></g>
    </>;
    case 'door': return <>
      <path d="M 137 294 V 78 H 341 V 294" fill={C.brown} /><path d="M 158 294 V 98 H 320 V 294" fill={C.navy} /><path d="M 158 98 L 277 124 V 285 L 158 294 Z" fill={C.orange} /><path d="M 177 127 L 256 143 V 206 L 177 199 Z M 177 219 L 256 225 V 265 L 177 271 Z" fill={C.brown} strokeWidth="3" /><circle cx="260" cy="214" r="7" fill={C.gold} /><path d="M 118 295 H 361" stroke={C.brown} strokeWidth="6" /><path d="M 321 189 L 364 163 M 329 216 H 381" stroke={C.gold} fill="none" strokeWidth="3" />
    </>;
    case 'earth': return <>
      <path d="M 93 232 Q 239 199 387 232 V 288 H 93 Z" fill={C.brown} /><path d="M 93 232 Q 239 199 387 232" stroke={C.green} strokeWidth="12" fill="none" /><path d="M 240 216 V 160 M 240 187 Q 196 188 189 151 Q 233 137 240 177 M 240 168 Q 281 173 294 135 Q 249 121 240 159" fill={C.green} stroke={C.darkGreen} strokeWidth="4" /><g fill={C.sand} stroke="none"><ellipse cx="133" cy="259" rx="9" ry="5" /><ellipse cx="193" cy="273" rx="13" ry="5" /><ellipse cx="276" cy="249" rx="10" ry="6" /><ellipse cx="344" cy="269" rx="13" ry="6" /></g><Drop x={165} y={123} size={.5} /><Sun x={345} y={101} scale={.29} />
    </>;
    default: return <><Book x={240} y={222} scale={1.25} /><Spark x={343} y={114} /><Spark x={121} y={167} size={8} /></>;
  }
}

export default function MeaningIllustration({ kind, size, className = '', label }: MeaningIllustrationProps) {
  const style: CSSProperties = { width: size ?? '100%' };
  return <svg className={`meaning-illustration ${className}`.trim()} viewBox="0 0 480 360" style={style} role="img" aria-label={label || `${kind} illustration`} xmlns="http://www.w3.org/2000/svg">
    <title>{label || `${kind} illustration`}</title>
    <rect x="9" y="9" width="462" height="342" rx="35" fill={C.paper} />
    <path d="M 44 232 C 24 131 97 55 189 68 C 274 9 432 72 435 173 C 465 270 371 322 283 308 C 171 341 64 314 44 232 Z" fill="#F5EAD4" opacity=".72" />
    <circle cx="396" cy="68" r="5" fill={C.sand} /><circle cx="72" cy="118" r="4" fill={C.sand} /><circle cx="409" cy="293" r="4" fill={C.sand} />
    <ellipse cx="240" cy="299" rx="156" ry="12" fill="#DCC6A5" opacity=".2" />
    <g className="illustration-object" stroke={C.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <Scene kind={kind} />
    </g>
  </svg>;
}
