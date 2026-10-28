import { item } from './shapes';
import type { Box, BoxKind, Level, Vec2 } from './types';

// Maison imaginaire en L sur deux niveaux et un toit-terrasse. Les cotes servent au
// dessin : elles ne décrivent aucun projet réel.
// Hauteurs de coupe : murs du fond entiers, cloisons et façades avant coupées bas
// pour laisser voir l'aménagement.
const BACK = 2.6;
const PARTITION = 1.25;
const FRONT = 0.9;
const T = 0.2;
const h = T / 2;

type Opening = { from: number; to: number; sill?: number; head?: number; glazed?: boolean };

// Mur rectiligne parallèle à un axe, de a à b (axe du mur), découpé autour des ouvertures.
function wall(a: Vec2, b: Vec2, height: number, openings: Opening[] = [], kind: BoxKind = 'wall', thickness = T): Box[] {
  const alongX = a[1] === b[1];
  const [start, end] = alongX ? [a[0], b[0]] : [a[1], b[1]];
  const axis = alongX ? a[1] : a[0];
  const box = (s: number, e: number, z0: number, z1: number, k = kind, half = thickness / 2): Box => alongX
    ? { kind: k, min: [s, axis - half, z0], max: [e, axis + half, z1] }
    : { kind: k, min: [axis - half, s, z0], max: [axis + half, e, z1] };
  const boxes: Box[] = [];
  let cursor = start;
  for (const { from, to, sill = 0, head = Infinity, glazed } of [...openings].sort((p, q) => p.from - q.from)) {
    if (from > cursor) boxes.push(box(cursor, from, 0, height));
    if (sill > 0) boxes.push(box(from, to, 0, Math.min(sill, height)));
    if (glazed && sill < height) boxes.push(box(from, to, sill, Math.min(head, height), 'glass', 0.02));
    if (head < height) boxes.push(box(from, to, head, height));
    cursor = to;
  }
  if (cursor < end) boxes.push(box(cursor, end, 0, height));
  return boxes;
}

const win = (from: number, to: number): Opening => ({ from, to, sill: 0.9, head: 2.15, glazed: true });
const door = (from: number, to: number, glazed = false): Opening => ({ from, to, head: 2.1, glazed });


function table(tag: string, x0: number, y0: number, x1: number, y1: number, height = 0.75): Box[] {
  const leg = 0.06;
  return [
    ...[[x0, y0], [x1 - leg, y0], [x0, y1 - leg], [x1 - leg, y1 - leg]].map(([x, y]) => item('furniture', tag, x, y, x + leg, y + leg, height - 0.04)),
    item('furniture', tag, x0, y0, x1, y1, height, height - 0.04),
  ];
}

// Chaise : assise et dossier du côté indiqué.
function chair(x: number, y: number, back: 'n' | 's' | 'e' | 'w'): Box[] {
  const s = 0.21;
  const [bx0, by0, bx1, by1] = {
    n: [x - s, y - s, x + s, y - s + 0.06], s: [x - s, y + s - 0.06, x + s, y + s],
    w: [x - s, y - s, x - s + 0.06, y + s], e: [x + s - 0.06, y - s, x + s, y + s],
  }[back];
  return [item('furniture', 'chaise', x - s, y - s, x + s, y + s, 0.46), item('furniture', 'chaise', bx0, by0, bx1, by1, 0.88, 0.46)];
}

// Lit : sommier, matelas, tête de lit et oreillers, tête contre le côté indiqué.
function bed(x0: number, y0: number, x1: number, y1: number, head: 'n' | 'e'): Box[] {
  const pillows = head === 'n'
    ? [item('soft', 'oreiller', x0 + 0.12, y0 + 0.12, (x0 + x1) / 2 - 0.06, y0 + 0.5, 0.62, 0.5), item('soft', 'oreiller', (x0 + x1) / 2 + 0.06, y0 + 0.12, x1 - 0.12, y0 + 0.5, 0.62, 0.5)]
    : [item('soft', 'oreiller', x1 - 0.5, y0 + 0.12, x1 - 0.12, (y0 + y1) / 2 - 0.06, 0.62, 0.5), item('soft', 'oreiller', x1 - 0.5, (y0 + y1) / 2 + 0.06, x1 - 0.12, y1 - 0.12, 0.62, 0.5)];
  return [
    head === 'n' ? item('furniture', 'tête de lit', x0, y0 - 0.08, x1, y0, 1.05) : item('furniture', 'tête de lit', x1, y0, x1 + 0.08, y1, 1.05),
    item('furniture', 'sommier', x0, y0, x1, y1, 0.28),
    item('soft', 'matelas', x0 + 0.03, y0 + 0.03, x1 - 0.03, y1 - 0.03, 0.5, 0.28),
    ...pillows,
  ];
}

const plant = (x: number, y: number, radius = 0.32, height = 1.1, base = 0): Box => item('plant', 'plante', x - radius, y - radius, x + radius, y + radius, base + height, base);

// Contour extérieur des murs (axe des murs décalé d'une demi-épaisseur).
const lShape: Vec2[] = [[-h, -h], [11 + h, -h], [11 + h, 7 + h], [5 + h, 7 + h], [5 + h, 10 + h], [-h, 10 + h]];
const mainBlock: Vec2[] = [[-h, -h], [11 + h, -h], [11 + h, 7 + h], [-h, 7 + h]];
const stairWell: Vec2[] = [[h, 0.6], [1.2, 0.6], [1.2, 4.6], [h, 4.6]];

// Escalier droit à marches suspendues, scellé dans le mur ouest et montant vers le nord.
const stair: Box[] = Array.from({ length: 14 }, (_, i) => {
  const top = (14 - i) * 3 / 15;
  return { kind: 'stair', tag: 'marche', min: [h, 0.6 + i * 4 / 14, top - 0.06], max: [1.15, 0.6 + (i + 1) * 4 / 14, top] };
});

const ground: Level = {
  id: 'rdc',
  label: 'Rez-de-chaussée',
  elevation: 0,
  slab: { outline: lShape, thickness: 0.45 },
  surfaces: [
    { kind: 'parquet', min: [5 + h, h], max: [11 - h, 7 - h] },
    { kind: 'parquet', min: [h, h], max: [5 - h, 7 - h] },
    { kind: 'tile', min: [3.2 + h, h], max: [5 - h, 2 - h] },
    { kind: 'parquet', min: [h, 7 + h], max: [3 - h, 10 - h] },
    { kind: 'tile', min: [3 + h, 7 + h], max: [5 - h, 10 - h] },
    { kind: 'rug', min: [6.6, 4.3], max: [9.6, 6.2] },
  ],
  boxes: [
    // Façades du fond (nord et ouest), entières.
    ...wall([-h, 0], [11 + h, 0], BACK, [win(1.8, 2.8), win(8, 9.6)]),
    ...wall([0, h], [0, 10 - h], BACK, [win(5.1, 6.1), win(8, 9.2)]),
    // Façades avant, coupées bas : baies du séjour et entrée de l'aile.
    ...wall([11, h], [11, 7 - h], FRONT, [door(2, 5, true)]),
    ...wall([5 - h, 7], [11 + h, 7], FRONT, [door(6.5, 9.5, true)]),
    ...wall([5, 7 + h], [5, 10 - h], FRONT, [door(8.1, 9.1)]),
    ...wall([-h, 10], [5 + h, 10], FRONT),
    // Cloisons : WC, séparation entrée / séjour, aile (vestibule et bureau).
    ...wall([3.2, h], [3.2, 2 - h], PARTITION),
    ...wall([3.2 - h, 2], [5 - h, 2], PARTITION, [door(3.5, 4.3)]),
    ...wall([5, h], [5, 3.6], PARTITION),
    ...wall([h, 7], [5 - h, 7], PARTITION, [door(3.7, 5 - h)]),
    ...wall([3, 7 + h], [3, 10 - h], PARTITION, [door(8.4, 9.3)]),
    ...stair,
    // Cuisine : linéaire sous la fenêtre et îlot.
    item('furniture', 'cuisine', 6.4, h, 10.9, 0.72, 0.9),
    item('furniture', 'îlot', 7.6, 2, 10, 2.9, 0.92),
    ...chair(8.2, 3.25, 's'), ...chair(9.3, 3.25, 's'),
    // Salle à manger.
    ...table('table', 5.7, 1.2, 6.7, 2.9),
    ...chair(5.42, 1.65, 'w'), ...chair(5.42, 2.45, 'w'), ...chair(6.98, 1.65, 'e'), ...chair(6.98, 2.45, 'e'),
    // Salon.
    item('soft', 'canapé', 6.8, 5.9, 9.4, 6.5, 0.42),
    item('soft', 'canapé', 6.8, 6.5, 9.4, 6.78, 0.82),
    item('soft', 'fauteuil', 9.9, 4.5, 10.45, 5.25, 0.42),
    item('soft', 'fauteuil', 10.45, 4.5, 10.65, 5.25, 0.8),
    item('furniture', 'table basse', 7.5, 4.85, 8.7, 5.45, 0.36),
    plant(10.4, 6.4, 0.3, 1.3),
    // Entrée, WC, bureau et vestibule.
    item('furniture', 'console', 1.8, h, 2.9, 0.48, 0.8),
    plant(4.4, 5.9, 0.28, 1.15),
    item('furniture', 'wc', 4.35, h, 4.8, 0.72, 0.42),
    item('furniture', 'lave-mains', 3.35, h, 3.8, 0.38, 0.88, 0.76),
    item('furniture', 'bureau', h, 7.7, 0.8, 9.3, 0.75),
    ...chair(1.15, 8.5, 'e'),
    item('furniture', 'bibliothèque', 0.4, 7 + h, 2.6, 7.45, 1.05),
    item('furniture', 'banc', 3.15, 8.5, 3.55, 9.7, 0.45),
    plant(4.55, 9.55, 0.24, 0.95),
  ],
};

const upper: Level = {
  id: 'etage',
  label: 'Étage',
  elevation: 3,
  slab: { outline: lShape, holes: [stairWell], thickness: 0.3 },
  surfaces: [
    { kind: 'parquet', min: [7 + h, h], max: [11 - h, 3.5 - h] },
    { kind: 'tile', min: [4.6 + h, h], max: [7 - h, 3.5 - h] },
    { kind: 'parquet', min: [6 + h, 3.5 + h], max: [11 - h, 7 - h] },
    { kind: 'deck', min: [h, 7 + h], max: [5 - h, 10 - h] },
    { kind: 'rug', min: [8.1, 2.4], max: [10.1, 3.25] },
  ],
  boxes: [
    ...wall([-h, 0], [11 + h, 0], BACK, [win(5.2, 6.2), win(8.5, 10)]),
    ...wall([0, h], [0, 7 - h], BACK, [win(5.2, 6.2)]),
    ...wall([11, h], [11, 7 - h], FRONT, [win(4.2, 6)]),
    // Façade sud du bloc principal, ouverte sur la terrasse de l'aile.
    ...wall([-h, 7], [11 + h, 7], FRONT, [door(1.6, 3, true), win(7.5, 9.5)]),
    // Garde-corps de la terrasse.
    ...wall([0, 7 + h], [0, 10 - h], 1, [], 'parapet', 0.16),
    ...wall([-h, 10], [5 + h, 10], 1, [], 'parapet', 0.16),
    ...wall([5, 7 + h], [5, 10 - h], 1, [], 'parapet', 0.16),
    // Salle de bains, chambre nord, chambre sud.
    ...wall([4.6, h], [4.6, 3.5 - h], PARTITION),
    ...wall([7, h], [7, 3.5 - h], PARTITION),
    ...wall([4.6 - h, 3.5], [11 - h, 3.5], PARTITION, [door(5.3, 6.1), door(7.4, 8.3)]),
    ...wall([6, 3.5 + h], [6, 7 - h], PARTITION, [door(4, 4.9)]),
    // Chambre nord.
    ...bed(8.2, 0.2, 10, 2.25, 'n'),
    item('furniture', 'chevet', 7.6, h, 8.05, 0.5, 0.5),
    item('furniture', 'chevet', 10.15, h, 10.6, 0.5, 0.5),
    // Salle de bains.
    item('tub', 'baignoire', 4.6 + h, h, 5.55, 1.85, 0.56),
    item('furniture', 'vasque', 6.1, h, 6.9, 0.58, 0.86),
    plant(6.55, 3.05, 0.2, 0.75),
    // Chambre sud.
    ...bed(9, 4.6, 10.82, 6.2, 'e'),
    item('furniture', 'armoire', 7.6, 3.5 + h, 9.6, 4.2, 1.4),
    item('furniture', 'bureau', 6 + h, 5.3, 6.65, 6.7, 0.75),
    ...chair(6.95, 6, 'e'),
    // Palier.
    item('furniture', 'banc', 2.2, 2.8, 2.6, 4.2, 0.45),
    plant(3.9, 6.3, 0.3, 1.2),
    // Terrasse : table, chaises et jardinières.
    ...table('table de jardin', 2, 8.1, 3, 8.9, 0.72),
    ...chair(1.7, 8.5, 'w'), ...chair(3.3, 8.5, 'e'),
    item('furniture', 'jardinière', 0.2, 9.45, 4.8, 9.88, 0.45),
    plant(0.7, 9.66, 0.2, 0.7, 0.45), plant(1.9, 9.66, 0.18, 0.6, 0.45), plant(3.3, 9.66, 0.2, 0.75, 0.45), plant(4.4, 9.66, 0.18, 0.55, 0.45),
  ],
};

const roof: Level = {
  id: 'toit',
  label: 'Toit-terrasse',
  elevation: 6,
  slab: { outline: mainBlock, thickness: 0.35 },
  surfaces: [{ kind: 'deck', min: [3.5, 1.6], max: [7.5, 5.5] }],
  boxes: [
    ...wall([-h, 0], [11 + h, 0], 0.6, [], 'parapet'),
    ...wall([0, h], [0, 7 - h], 0.6, [], 'parapet'),
    ...wall([11, h], [11, 7 - h], 0.6, [], 'parapet'),
    ...wall([-h, 7], [11 + h, 7], 0.6, [], 'parapet'),
    // Lanterneau au-dessus de l'escalier et local technique.
    { kind: 'glass', tag: 'lanterneau', min: [0.7, 1, 0], max: [2.3, 4.2, 0.45] },
    { kind: 'volume', tag: 'local technique', min: [8, 4.4, 0], max: [9.4, 5.6, 0.8] },
    item('furniture', 'jardinière', 3.5, 1.1, 7.5, 1.45, 0.45),
    plant(4.2, 1.28, 0.17, 0.6, 0.45), plant(5.5, 1.28, 0.16, 0.5, 0.45), plant(6.8, 1.28, 0.17, 0.65, 0.45),
  ],
};

export const house: Level[] = [ground, upper, roof];
