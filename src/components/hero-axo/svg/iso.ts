import type { Box, Slab, Surface, Vec2, Vec3 } from '../scene/types';

// Projection isométrique vraie (axes à 30°), en unités SVG.
export const SCALE = 20;
const COS = Math.cos(Math.PI / 6);
const round = (n: number) => Math.round(n * 100) / 100;

export function project(x: number, y: number, z = 0): Vec2 {
  return [round((x - y) * COS * SCALE), round(((x + y) / 2 - z) * SCALE)];
}

export const toPoints = (vertices: readonly Vec3[]) => vertices.map(v => project(...v).join(',')).join(' ');

// Seules trois faces d'une boîte sont visibles depuis le sud-est : dessus, est (+x), sud (+y).
export type FaceSide = 'top' | 'x' | 'y';
export type Face = { side: FaceSide; points: string };

export function boxFaces({ min: [x0, y0, z0], max: [x1, y1, z1] }: Box): Face[] {
  return [
    { side: 'y', points: toPoints([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]) },
    { side: 'x', points: toPoints([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]) },
    { side: 'top', points: toPoints([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]) },
  ];
}

// Deux boîtes ne se recouvrent à l'écran que si leurs intervalles se chevauchent sur les
// trois normales de l'hexagone projeté : x − y, x − z et y − z.
const EPS = 1e-6;
function overlapOnScreen(a: Box, b: Box) {
  const ranges = (box: Box): [number, number][] => [
    [box.min[0] - box.max[1], box.max[0] - box.min[1]],
    [box.min[0] - box.max[2], box.max[0] - box.min[2]],
    [box.min[1] - box.max[2], box.max[1] - box.min[2]],
  ];
  const ra = ranges(a), rb = ranges(b);
  return ra.every(([lo, hi], i) => lo < rb[i][1] - EPS && rb[i][0] < hi - EPS);
}

// Un plan séparant deux boîtes indique laquelle est traversée en premier par le regard.
function drawnBefore(a: Box, b: Box): boolean | undefined {
  for (let axis = 0; axis < 3; axis++) {
    if (a.max[axis] <= b.min[axis] + EPS) return true;
    if (b.max[axis] <= a.min[axis] + EPS) return false;
  }
  return undefined;
}

const depth = (b: Box) => b.min[0] + b.max[0] + b.min[1] + b.max[1] + b.min[2] + b.max[2];

// Algorithme du peintre : tri topologique des boîtes qui se recouvrent, profondeur en arbitrage.
export function sortBoxes(boxes: readonly Box[]): Box[] {
  const after = boxes.map(() => [] as number[]);
  const pending = boxes.map(() => 0);
  boxes.forEach((a, i) => {
    for (let j = i + 1; j < boxes.length; j++) {
      const b = boxes[j];
      if (!overlapOnScreen(a, b)) continue;
      const order = drawnBefore(a, b) ?? depth(a) <= depth(b);
      const [first, second] = order ? [i, j] : [j, i];
      after[first].push(second);
      pending[second]++;
    }
  });
  const sorted: Box[] = [];
  const remaining = new Set(boxes.keys());
  while (remaining.size) {
    let next = -1;
    for (const i of remaining) {
      if (pending[i] === 0 && (next < 0 || depth(boxes[i]) < depth(boxes[next]))) next = i;
    }
    // Cycle improbable avec des boîtes alignées : on reprend la plus lointaine.
    if (next < 0) next = [...remaining].reduce((p, q) => depth(boxes[p]) <= depth(boxes[q]) ? p : q);
    remaining.delete(next);
    sorted.push(boxes[next]);
    for (const k of after[next]) pending[k]--;
  }
  return sorted;
}

// Dalle : chants visibles (sud, est, et bords nord/ouest des trémies), puis dessus percé.
function inside(polygon: readonly Vec2[], [px, py]: Vec2) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function visibleEdges(polygon: readonly Vec2[], facesOutward: (probe: Vec2) => boolean, z0: number, z1: number) {
  return polygon.flatMap((p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    const mid: Vec2 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    // Normale +x pour une arête nord-sud, +y pour une arête est-ouest.
    const probe: Vec2 = p[0] === q[0] ? [mid[0] + 0.01, mid[1]] : [mid[0], mid[1] + 0.01];
    if (!facesOutward(probe)) return [];
    return [toPoints([[p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1]])];
  });
}

export function slabShapes({ outline, holes = [], thickness }: Slab) {
  const ring = (polygon: readonly Vec2[]) => 'M' + polygon.map(([x, y]) => project(x, y, 0).join(',')).join('L') + 'Z';
  return {
    holeSides: holes.flatMap(hole => visibleEdges(hole, probe => inside(hole, probe), -thickness, 0)),
    sides: visibleEdges(outline, probe => !inside(outline, probe), -thickness, 0),
    top: ring(outline) + holes.map(ring).join(''),
  };
}

// Revêtements : lames de parquet (selon x), carrelage, platelage (selon y), bordure de tapis.
const segment = (a: Vec3, b: Vec3) => `M${project(...a).join(',')}L${project(...b).join(',')}`;
const steps = (from: number, to: number, step: number) => Array.from({ length: Math.max(0, Math.ceil((to - from) / step) - 1) }, (_, i) => from + (i + 1) * step);

export function surfaceShapes({ kind, min: [x0, y0], max: [x1, y1], inset = 0 }: Surface) {
  const rect = (a: number, b: number, c: number, d: number) => toPoints([[a, b, 0], [c, b, 0], [c, d, 0], [a, d, 0]]);
  const ring = (a: number, b: number, c: number, d: number) => `M${rect(a, b, c, d).replaceAll(' ', 'L')}Z`;
  const alongX = (step: number) => steps(y0, y1, step).map(y => segment([x0, y, 0], [x1, y, 0]));
  const alongY = (step: number) => steps(x0, x1, step).map(x => segment([x, y0, 0], [x, y1, 0]));
  // Bandes de passage piéton parallèles à la chaussée, réparties sur le plus grand côté.
  const bars = () => {
    const acrossY = y1 - y0 > x1 - x0;
    return steps(acrossY ? y0 : x0, acrossY ? y1 : x1, 0.5).filter((_, i) => i % 2 === 0)
      .map(t => acrossY ? ring(x0, t, x1, t + 0.5) : ring(t, y0, t + 0.5, y1)).join('');
  };
  const outline = kind === 'lane' || kind === 'crosswalk' ? undefined : rect(x0, y0, x1, y1);
  const lines = {
    parquet: alongX(0.22),
    tile: [...alongX(0.5), ...alongY(0.5)],
    deck: alongY(0.16),
    rug: [ring(x0 + 0.12, y0 + 0.12, x1 - 0.12, y1 - 0.12)],
    block: [ring(x0 + inset, y0 + inset, x1 - inset, y1 - inset)],
    lawn: [],
    paving: alongY(0.6),
    crosswalk: [],
    lane: [segment([x0, y0, 0], [x1, y1, 0])],
  }[kind];
  return { outline, lines: lines.join(''), fills: kind === 'crosswalk' ? bars() : undefined };
}

// Maison à deux pans : faîtage selon x à mi-profondeur, pignon visible à l'est.
export function gableFaces({ min: [x0, y0, z0], max: [x1, y1, ridge], eave = ridge }: Box) {
  const ym = (y0 + y1) / 2;
  return {
    north: toPoints([[x0, y0, eave], [x1, y0, eave], [x1, ym, ridge], [x0, ym, ridge]]),
    south: toPoints([[x0, y1, z0], [x1, y1, z0], [x1, y1, eave], [x0, y1, eave]]),
    east: toPoints([[x1, y0, z0], [x1, y1, z0], [x1, y1, eave], [x1, ym, ridge], [x1, y0, eave]]),
    roof: toPoints([[x0, ym, ridge], [x1, ym, ridge], [x1, y1, eave], [x0, y1, eave]]),
  };
}

// Fenêtres en façade sud et est : un rang par étage de 3 m, sous l'égout ou l'acrotère.
export function facadeWindows({ min: [x0, y0, z0], max: [x1, y1, z1], eave }: Box) {
  const top = (eave ?? z1) - 0.8;
  const floors = steps(z0 - 2, top - 1.4, 3);
  const bays = (from: number, to: number) => steps(from, to, 3.2).filter(t => t - 0.6 > from + 0.4 && t + 0.6 < to - 0.4);
  const quad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3) => `M${toPoints([a, b, c, d]).replaceAll(' ', 'L')}Z`;
  return floors.flatMap(z => [
    ...bays(x0, x1).map(x => quad([x - 0.6, y1, z], [x + 0.6, y1, z], [x + 0.6, y1, z + 1.4], [x - 0.6, y1, z + 1.4])),
    ...bays(y0, y1).map(y => quad([x1, y - 0.6, z], [x1, y + 0.6, z], [x1, y + 0.6, z + 1.4], [x1, y - 0.6, z + 1.4])),
  ]).join('');
}

// Arbre : ombre portée, tronc effilé et ramure, houppier au contour irrégulier et
// touffes de feuillage esquissées à l'intérieur. Le dessin varie avec la position.
export function treeShapes({ min, max }: Box) {
  const [cx, cy] = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2];
  const radius = (max[0] - min[0]) / 2;
  const seed = Math.abs(Math.sin(cx * 12.9898 + cy * 78.233)) * 6.28;
  const r = radius * SCALE;
  const [sx, sy] = project(cx, cy, min[2]);
  const [kx, ky] = project(cx, cy, max[2] - radius);
  const n = (a: number) => 1 + 0.1 * Math.sin(3 * a + seed) + 0.07 * Math.sin(7 * a + 2 * seed) + 0.05 * Math.sin(13 * a + 3 * seed);
  const rim = Array.from({ length: 36 }, (_, i) => {
    const a = i / 36 * Math.PI * 2;
    return [kx + Math.cos(a) * r * n(a), ky + Math.sin(a) * r * 0.92 * n(a)];
  });
  // Contour lissé : courbes passant par les milieux des points du pourtour.
  const mid = (i: number) => rim[i % rim.length].map((v, k) => (v + rim[(i + 1) % rim.length][k]) / 2).map(round);
  const crown = `M${mid(0).join(',')}` + rim.map((_, i) => `Q${rim[(i + 1) % rim.length].map(round).join(',')} ${mid(i + 1).join(',')}`).join('') + 'Z';
  const tufts = Array.from({ length: 9 }, (_, i) => {
    const a = seed + i * 2.4, d = 0.25 + 0.45 * ((i * 0.618) % 1);
    const [tx, ty] = [kx + Math.cos(a) * r * d, ky + Math.sin(a) * r * d * 0.9];
    const t = r * (0.16 + 0.06 * (i % 3));
    return `M${round(tx - t)},${round(ty)}a${round(t)},${round(t * 0.8)} 0 0 1 ${round(2 * t)},0`;
  }).join('');
  const w = Math.max(1.2, radius * 0.9);
  const trunk = `M${round(sx - w)},${sy}L${round(kx - w * 0.45)},${round(ky + r * 0.2)}L${round(kx + w * 0.45)},${round(ky + r * 0.2)}L${round(sx + w)},${sy}Z`;
  const branches = `M${kx},${round(ky + r * 0.45)}l${round(-r * 0.32)},${round(-r * 0.38)}M${kx},${round(ky + r * 0.3)}l${round(r * 0.3)},${round(-r * 0.42)}`;
  return { shadow: { cx: sx, cy: sy, rx: round(r * 0.95), ry: round(r * 0.55) }, trunk, branches, crown, tufts };
}

// Plante : pot cubique et feuilles en éventail dessinées dans le plan de l'écran.
const leaves = [[-90, 1], [-62, 0.9], [-118, 0.9], [-38, 0.68], [-142, 0.68], [-76, 0.98], [-104, 0.98]] as const;

export function plantShapes({ min, max }: Box) {
  const [cx, cy] = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2];
  const radius = (max[0] - min[0]) / 2, height = max[2] - min[2];
  const potRadius = radius * 0.5, potHeight = Math.min(0.4, height * 0.35);
  const pot: Box = { kind: 'furniture', min: [cx - potRadius, cy - potRadius, min[2]], max: [cx + potRadius, cy + potRadius, min[2] + potHeight] };
  const [bx, by] = project(cx, cy, min[2] + potHeight);
  const reachX = radius * SCALE * 1.5, reachY = (height - potHeight) * SCALE;
  const leafPaths = leaves.map(([angle, length]) => {
    const a = angle * Math.PI / 180;
    const [tx, ty] = [bx + Math.cos(a) * reachX * length, by + Math.sin(a) * reachY * length];
    const [mx, my, px, py] = [(bx + tx) / 2, (by + ty) / 2, -(ty - by) * 0.3, (tx - bx) * 0.3];
    const r = (n: number) => round(n);
    return {
      blade: `M${bx},${by}Q${r(mx + px)},${r(my + py)} ${r(tx)},${r(ty)}Q${r(mx - px)},${r(my - py)} ${bx},${by}Z`,
      rib: `M${bx},${by}L${r(bx + (tx - bx) * 0.8)},${r(by + (ty - by) * 0.8)}`,
    };
  });
  return { pot, leafPaths };
}

// Cuve de baignoire : rectangle intérieur sur le dessus.
export const tubBasin = ({ min, max }: Box) =>
  toPoints([[min[0] + 0.08, min[1] + 0.08, max[2]], [max[0] - 0.08, min[1] + 0.08, max[2]], [max[0] - 0.08, max[1] - 0.08, max[2]], [min[0] + 0.08, max[1] - 0.08, max[2]]]);
