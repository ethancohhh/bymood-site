import { useId } from 'react';

type Point = readonly [number, number];
type Wall = readonly [number, number, number, number, number?];
// Intérieur imaginaire : une entrée dessert les pièces privées et le séjour ouvert.
// Les unités servent au dessin ; elles ne constituent pas des cotes de chantier.
const footprint: Point[] = [[30, 30], [550, 30], [550, 360], [330, 360], [330, 415], [30, 415]];
const walls: Wall[] = [
  [30, 30, 70, 30], [195, 30, 395, 30], [490, 30, 550, 30],
  [30, 30, 30, 90], [30, 170, 30, 275], [30, 370, 30, 415],
  [550, 30, 550, 95], [550, 205, 550, 255], [550, 330, 550, 360],
  [330, 360, 390, 360], [495, 360, 550, 360], [330, 360, 330, 415],
  [30, 415, 65, 415], [145, 415, 280, 415],
  [230, 30, 230, 155, 23], [230, 205, 230, 230, 23], [30, 230, 230, 230, 23],
  [330, 30, 330, 155, 23], [330, 225, 330, 360, 23],
  [180, 230, 180, 270, 23], [180, 320, 180, 415, 23],
  [180, 320, 215, 320, 23], [265, 320, 280, 320, 23], [280, 320, 280, 415, 23],
];
const project = ([x, y]: Point, z = 0): Point => [340 + x * .92 - y * .64, 105 + x * .38 + y * .60 - z];
const pointList = (vertices: readonly Point[], z = 0) => vertices.map(p => project(p, z).join(',')).join(' ');
const segment = (a: Point, b: Point, z = 0) => `M${project(a, z).join(',')}L${project(b, z).join(',')}`;
const floorPath = 'M30 30H550V360H330V415H30Z';
const wallTrace = (w: Wall) => {
  const dx = Math.sign(w[2] - w[0]) * 8;
  const dy = Math.sign(w[3] - w[1]) * 8;
  return segment([w[0] - dx, w[1] - dy], [w[2] + dx, w[3] + dy], 14);
};

function WallVolume({ wall }: { wall: Wall }) {
  const [x1, y1, x2, y2, height = 32] = wall;
  const corners: Point[] = y1 === y2
    ? [[x1, y1 - 4], [x2, y2 - 4], [x2, y2 + 4], [x1, y1 + 4]]
    : [[x1 - 4, y1], [x1 + 4, y1], [x2 + 4, y2], [x2 - 4, y2]];
  const top = corners.map(p => project(p, height));
  const bottom = corners.map(p => project(p));
  const face = (a: number, b: number) => [bottom[a], bottom[b], top[b], top[a]].map(p => p.join(',')).join(' ');
  return <g className="plan-wall">
    <polygon className="plan-wall-side" points={face(1, 2)} />
    <polygon className="plan-wall-front" points={face(2, 3)} />
    <polygon className="plan-wall-top" points={top.map(p => p.join(',')).join(' ')} />
  </g>;
}

export function HeroArchitecturalPlan() {
  const id = useId().replaceAll(':', '');
  const mask = `${id}-construction`;
  const tiles = `${id}-tiles`;
  return <svg className="hero-architectural-plan" viewBox="0 0 900 700" role="img" aria-labelledby={`${id}-title ${id}-description`} focusable="false">
    <title id={`${id}-title`}>Un intérieur dessiné en perspective</title>
    <desc id={`${id}-description`}>Étude graphique imaginaire : une entrée et une circulation centrale relient un bureau, une chambre, une salle d’eau et un séjour avec cuisine ouverte. Les murs en relief, les ouvertures et le mobilier sont dessinés au trait.</desc>
    <defs>
      <pattern id={tiles} width="15" height="15" patternUnits="userSpaceOnUse"><path className="plan-tile" d="M15 0H0V15" fill="none" /></pattern>
      <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="700">
        {walls.map((w, i) => <path key={i} className="plan-wall-trace" d={wallTrace(w)} stroke="white" strokeWidth="80" strokeLinecap="butt" fill="none" pathLength="1" />)}
      </mask>
    </defs>
    <g className="plan-underlay" transform="translate(-110 -72)"><g transform="matrix(.92 .38 -.64 .60 340 105)" fill="none">
      <path d={floorPath} /><path d="M230 30v200H30m300-200v330M180 230v185m0-95h100v95" />
      <path d="M55 60h100v30H55Zm300-15h175v30H355Zm70 205h80v83h-80Z" />
    </g></g>
    <g className="plan-construction" fill="none">
      {[-10, 280, 580].map(x => <path key={`x${x}`} d={segment([x, -15], [x, 460])} />)}
      {[-5, 230, 450].map(y => <path key={`y${y}`} d={segment([-5, y], [585, y])} />)}
      <path className="plan-centre-axis" d={segment([280, -10], [280, 465])} />
      {[[-10, -5], [580, -5], [-10, 450], [580, 450]].map(([x, y], i) => {
        const [px, py] = project([x, y]); return <g key={i}><circle cx={px} cy={py} r="5" /><path d={`M${px - 9} ${py}h18M${px} ${py - 9}v18`} /></g>;
      })}
      <path d={segment([30, -8], [550, -8])} />
      {[30, 550].map(x => <path key={x} d={segment([x, -17], [x, 1])} />)}
    </g>
    <g className="plan-floor"><polygon points={pointList(footprint)} /></g>
    <g transform="matrix(.92 .38 -.64 .60 340 105)">
      <g className="plan-room-tones"><path d="M335 35H545V355H335Z" /><path d="M35 235H175V410H35Z" /></g>
      <g className="plan-furniture" fill="none">
        <g className="plan-office">
          <rect x="55" y="65" width="112" height="35" rx="2" /><path d="M82 68h44v8H82Zm5 8v8h34v-8m-10 8v5" />
          <circle cx="111" cy="125" r="13" /><path d="M101 120h20m-10 18v9m-9 0h18" />
          <path d="M48 200h112v18H48Zm28 0v18m28-18v18m28-18v18" />
          <rect className="plan-upholstery" x="67" y="158" width="40" height="30" rx="5" /><path d="M72 161v20h30v-20" />
        </g>
        <g className="plan-bedroom">
          <rect className="plan-bed" x="65" y="282" width="78" height="108" rx="2" /><path d="M65 314h78m-78 9h78m-67 58h56" />
          <rect x="71" y="288" width="27" height="19" rx="3" /><rect x="109" y="288" width="27" height="19" rx="3" />
          <rect x="47" y="286" width="13" height="21" /><rect x="148" y="286" width="13" height="21" />
          <path d="M48 241h104v24H48Zm26 0v24m26-24v24m26-24v24" />
        </g>
        <g className="plan-bathroom">
          <rect x="185" y="325" width="90" height="85" fill={`url(#${tiles})`} stroke="none" />
          <rect x="185" y="365" width="42" height="43" /><path d="m185 365 42 43m0-43-42 43" /><circle cx="206" cy="387" r="3" />
          <rect x="186" y="330" width="28" height="20" rx="2" /><ellipse cx="200" cy="340" rx="9" ry="6" />
          <path d="M250 371h18v12h-18Z" /><ellipse cx="259" cy="390" rx="9" ry="13" />
        </g>
        <g className="plan-kitchen">
          <path d="M347 43h188v80h-29V74H347Z" /><path d="M390 43v31m57-31v31m59-31v31m0 27h29" />
          <rect x="407" y="49" width="31" height="19" rx="3" /><path d="M422 49v19" />
          {[362, 380].flatMap(x => [51, 65].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />))}
        </g>
        <g className="plan-dining">
          <ellipse cx="429" cy="173" rx="39" ry="25" />
          <rect x="418" y="136" width="22" height="15" rx="4" /><rect x="418" y="195" width="22" height="15" rx="4" />
          <rect x="380" y="165" width="16" height="19" rx="4" /><rect x="463" y="165" width="16" height="19" rx="4" />
          <circle cx="429" cy="173" r="5" />
        </g>
        <g className="plan-living">
          <rect className="plan-rug" x="383" y="239" width="145" height="105" rx="2" />
          <rect className="plan-upholstery" x="480" y="245" width="43" height="89" rx="5" /><rect className="plan-upholstery" x="431" y="304" width="50" height="30" rx="4" />
          <path d="M487 251h29v74h-76v-15m47-35h29m-29 25h29" />
          <rect x="405" y="267" width="45" height="34" rx="6" /><path d="M411 292h33" />
          <rect x="338" y="255" width="8" height="76" /><path d="M342 270v45" />
        </g>
        <g className="plan-hall"><path d="M244 49h66v23h-66Zm22 0v23m22-23v23" /></g>
      </g>
      <g className="plan-openings" fill="none">
        <path d="M70 27h125m-125 6h125m200-6h95m-95 6h95M27 90v80m6-80v80m-6 105v95m6-95v95M547 95v110m6-110v110m-6 50v75m6-75v75M65 412h80m-80 6h80m245-61h105m-105 6h105" />
        <path d="M230 205h-50a50 50 0 0 1 50-50M180 270h-50a50 50 0 0 0 50 50M215 320v-50a50 50 0 0 1 50 50M280 415v-50a50 50 0 0 1 50 50" />
      </g>
    </g>
    <g className="plan-walls" mask={`url(#${mask})`}>
      {[...walls].sort((a, b) => project([(a[0] + a[2]) / 2, (a[1] + a[3]) / 2])[1] - project([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2])[1]).map((wall, i) => <WallVolume key={i} wall={wall} />)}
    </g>
  </svg>;
}
