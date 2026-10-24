import { useId } from 'react';

type Point = readonly [number, number];
type Wall = readonly [number, number, number, number, number?];
// Composition imaginaire : les unités de dessin ne sont pas des cotes de chantier.
const walls: Wall[] = [
  [35, 45, 80, 45], [245, 45, 535, 45],
  [35, 45, 35, 95], [35, 240, 35, 305], [35, 355, 35, 435],
  [535, 45, 535, 80], [535, 150, 535, 270], [535, 355, 535, 405],
  [35, 435, 90, 435], [185, 435, 375, 435], [375, 435, 375, 405], [375, 405, 535, 405],
  [390, 215, 535, 215, 16], [390, 215, 390, 280, 16], [390, 325, 390, 405, 16],
  [230, 335, 265, 335, 16], [300, 335, 335, 335, 16], [230, 335, 230, 435, 16], [335, 335, 335, 435, 16],
  [35, 315, 140, 315, 16], [190, 315, 230, 315, 16], [230, 315, 230, 335, 16],
];
const footprint: Point[] = [[35, 45], [535, 45], [535, 405], [375, 405], [375, 435], [35, 435]];
const project = ([x, y]: Point, z = 0): Point => [40 + x * .98 + y * .42, 220 - x * .34 + y * .73 - z];
const points = (vertices: readonly Point[], z = 0) => vertices.map(p => project(p, z).join(',')).join(' ');
const segment = (a: Point, b: Point, z = 0) => `M${project(a, z).join(',')}L${project(b, z).join(',')}`;
function wallCorners([x1, y1, x2, y2]: Wall): Point[] {
  const horizontal = y1 === y2;
  const half = 4;
  return horizontal ? [[x1, y1 - half], [x2, y2 - half], [x2, y2 + half], [x1, y1 + half]]
    : [[x1 - half, y1], [x1 + half, y1], [x2 + half, y2], [x2 - half, y2]];
}
function WallVolume({ wall }: { wall: Wall }) {
  const vertices = wallCorners(wall);
  const height = wall[4] ?? 23;
  const top = vertices.map(p => project(p, height));
  const base = vertices.map(p => project(p));
  const face = (a: number, b: number) => [base[a], base[b], top[b], top[a]].map(p => p.join(',')).join(' ');
  return <g className="plan-wall">
    <polygon className="plan-wall-front" points={face(2, 3)} />
    <polygon className="plan-wall-side" points={face(3, 0)} />
    <polygon className="plan-wall-top" points={top.map(p => p.join(',')).join(' ')} />
    <path d={`M${base[2].join(',')}L${top[2].join(',')}`} />
  </g>;
}

export function HeroArchitecturalPlan() {
  const id = useId().replaceAll(':', '');
  const mask = `${id}-walls`;
  const tile = `${id}-tile`;
  return <svg className="hero-architectural-plan" viewBox="0 0 800 640" role="img" aria-labelledby={`${id}-title ${id}-description`} focusable="false">
    <title id={`${id}-title`}>Un intérieur dessiné en perspective</title>
    <desc id={`${id}-description`}>Étude graphique imaginaire : séjour, cuisine ouverte, escalier, chambre et salle d’eau. Les murs en relief, le mobilier et les axes de construction illustrent le travail sur les volumes.</desc>
    <defs>
      <pattern id={tile} width="14" height="14" patternUnits="userSpaceOnUse"><path d="M14 0H0V14" className="plan-tile" fill="none" /></pattern>
      <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="640">
        {walls.map((w, i) => <path key={i} className="plan-wall-trace" d={segment([w[0], w[1]], [w[2], w[3]], 10)} stroke="white" strokeWidth="60" strokeLinecap="square" pathLength="1" />)}
      </mask>
    </defs>
    <g className="plan-construction" fill="none">
      {[-5, 285, 575].map(x => <path key={`x${x}`} d={segment([x, -15], [x, 485])} />)}
      {[10, 295, 470].map(y => <path key={`y${y}`} d={segment([-10, y], [575, y])} />)}
      <path className="plan-centre-axis" d={segment([35, 245], [565, 245])} />
      {[[-5, 10], [575, 10], [-5, 470], [575, 470]].map(([x, y], i) => {
        const [px, py] = project([x, y]);
        return <path key={i} d={`M${px - 5} ${py}h10M${px} ${py - 5}v10`} />;
      })}
      <path d={segment([35, 8], [535, 8])} />
      {[35, 535].map(x => <path key={x} d={segment([x, 0], [x, 17])} />)}
    </g>
    <g className="plan-floor"><polygon points={points(footprint)} /></g>
    <g transform="matrix(.98 -.34 .42 .73 40 220)" className="plan-interior">
      <g className="plan-room-tones" stroke="none"><path d="M40 50H305V310H40Z" /><path d="M395 220H530V400H395Z" /><path d="M235 340H330V430H235Z" /></g>
      <g className="plan-furniture" fill="none">
        <g className="plan-living">
          <rect x="70" y="68" width="142" height="13" /><path d="M91 74h99" />
          <rect className="plan-upholstery" x="73" y="138" width="135" height="57" rx="7" />
          <rect className="plan-upholstery" x="73" y="183" width="49" height="54" rx="6" />
          <path d="M84 145v38h112v-38M139 146v37M84 196h27v29" />
          <rect x="159" y="213" width="56" height="42" rx="8" /><path d="M166 246h41" />
          <rect x="242" y="223" width="34" height="42" rx="6" /><path d="M247 226v30h23v-30" />
          <ellipse cx="234" cy="111" rx="43" ry="29" />
          {[[-52, -10], [32, -10], [-10, -45], [-10, 29]].map(([dx, dy], i) => <rect key={i} x={234 + dx} y={111 + dy} width="20" height="16" rx="4" />)}
          <circle cx="234" cy="111" r="7" />
        </g>
        <g className="plan-kitchen">
          <path d="M342 53h185v119h-31V85H342Z" /><path d="M389 53v32m54-32v32m53-32v32m0 41h31" />
          <rect x="351" y="59" width="29" height="19" rx="3" /><path d="M365 59v19" />
          {[460, 479].flatMap(x => [62, 76].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />))}
          <rect x="360" y="127" width="94" height="31" rx="2" />
          {[376, 409, 442].map(x => <circle key={x} cx={x} cy="173" r="8" />)}
        </g>
        <g className="plan-stair">
          <rect x="312" y="198" width="62" height="103" />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M312 ${205 + i * 10}h62`} />)}
          <path d="M343 290v-74m-6 8 6-8 6 8" />
        </g>
        <g className="plan-bedroom">
          <rect x="428" y="284" width="75" height="105" rx="2" /><path d="M428 316h75m-75 10h75" />
          <rect x="434" y="290" width="26" height="18" rx="3" /><rect x="470" y="290" width="26" height="18" rx="3" />
          <rect x="411" y="285" width="13" height="19" /><rect x="508" y="285" width="13" height="19" />
          <path d="M400 230h120v26H400Zm30 0v26m30-26v26m30-26v26" />
        </g>
        <g className="plan-bathroom">
          <rect x="238" y="343" width="89" height="84" fill={`url(#${tile})`} stroke="none" />
          <rect x="284" y="344" width="41" height="42" /><circle cx="305" cy="364" r="3" />
          <rect x="240" y="346" width="30" height="18" rx="2" /><ellipse cx="255" cy="355" rx="9" ry="5" />
          <path d="M246 394h18v13h-18Z" /><ellipse cx="255" cy="410" rx="9" ry="13" />
        </g>
        <g className="plan-entrance"><path d="M50 331h76v18H50Zm19 0v18m19-18v18m19-18v18" /><circle cx="92" cy="391" r="20" /><path d="M72 391h40" /></g>
      </g>
      <g className="plan-openings" fill="none">
        <path d="M80 42h165m-165 7h165M31 95v145m8-145v145M531 80v70m8-70v70M531 270v85m8-85v85M90 431h95m-95 8h95" />
        <path d="M35 355h50a50 50 0 0 0-50-50M140 315v50a50 50 0 0 0 50-50M265 335v35a35 35 0 0 0 35-35M390 280h45a45 45 0 0 1-45 45" />
      </g>
    </g>
    <g className="plan-walls" mask={`url(#${mask})`}>
      {[...walls].sort((a, b) => project([(a[0] + a[2]) / 2, (a[1] + a[3]) / 2])[1] - project([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2])[1]).map((wall, i) => <WallVolume wall={wall} key={i} />)}
    </g>
    <g className="plan-detail-lines" fill="none"><path d={segment([280, 290], [280, 470])} /><circle cx={project([280, 470])[0]} cy={project([280, 470])[1]} r="4" /></g>
  </svg>;
}
