/** Arêtes de cubes en projection orthographique, décor de la section « Étude conceptuelle 3D ». */
type Cube = { left: string; top: string; size: number; angles: [number, number, number]; className?: string };

const cubes: Cube[] = [
  { left: '78%', top: '1%', size: 300, angles: [28, 38, 0] },
  { left: '-5%', top: '24%', size: 220, angles: [-18, 62, 14], className: 'is-secondary' },
  { left: '44%', top: '41%', size: 130, angles: [52, 44, 6], className: 'is-secondary' },
  { left: '74%', top: '58%', size: 340, angles: [38, -24, 12] },
  { left: '4%', top: '80%', size: 190, angles: [12, 18, 32] },
  { left: '30%', top: '6%', size: 110, angles: [-30, 20, 40], className: 'is-secondary' },
  { left: '58%', top: '18%', size: 170, angles: [64, 12, -18] },
  { left: '22%', top: '50%', size: 260, angles: [8, -48, 22] },
  { left: '90%', top: '36%', size: 150, angles: [-44, 30, -8], className: 'is-secondary' },
  { left: '50%', top: '72%', size: 210, angles: [20, 70, -26], className: 'is-secondary' },
  { left: '36%', top: '90%', size: 120, angles: [48, -12, 58] },
  { left: '-3%', top: '62%', size: 140, angles: [-10, 34, -40], className: 'is-secondary' },
];

const vertices = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [-1, 1].map(z => [x, y, z])));
// Deux sommets forment une arête quand ils ne diffèrent que d'une coordonnée.
const edges = vertices.flatMap((a, i) => vertices.slice(i + 1).map((_, j) => [i, i + 1 + j] as const)
  .filter(([, k]) => a.filter((value, axis) => value !== vertices[k][axis]).length === 1));

function project([ax, ay, az]: [number, number, number]) {
  const [rx, ry, rz] = [ax, ay, az].map(angle => angle * Math.PI / 180);
  const points = vertices.map(([x, y, z]) => {
    [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
    [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
    [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
    return [50 + x * 27, 50 + y * 27, z];
  });
  // Le sommet le plus éloigné porte les arêtes cachées, tracées en pointillé.
  const back = points.reduce((far, point, index) => point[2] < points[far][2] ? index : far, 0);
  const path = (list: (readonly [number, number])[]) => list.map(([a, b]) => `M${points[a][0].toFixed(2)} ${points[a][1].toFixed(2)}L${points[b][0].toFixed(2)} ${points[b][1].toFixed(2)}`).join('');
  return { visible: path(edges.filter(edge => !edge.includes(back))), hidden: path(edges.filter(edge => edge.includes(back))) };
}

export function ConceptCubes() {
  return <div className="concept-cubes" aria-hidden="true">{cubes.map(cube => {
    const { visible, hidden } = project(cube.angles);
    return <svg key={cube.left + cube.top} className={cube.className} viewBox="0 0 100 100" fill="none" focusable="false" style={{ left: cube.left, top: cube.top, width: cube.size }}>
      <path d={visible} /><path className="concept-cube-hidden" d={hidden} />
    </svg>;
  })}</div>;
}
