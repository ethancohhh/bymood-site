import { item } from './shapes';
import type { Box, Context, Surface } from './types';

// Quartier imaginaire : un damier d'îlots autour de la parcelle de la maison (0..11 × 0..10).
// Chaussées de 8 m dans l'axe x = −18 / 24 et y = −14 / 20, trottoirs de 2,5 m.
const ROAD = 4;
const SIDEWALK = 2.5;
const roadsX = [-60, -18, 24, 66];
const roadsY = [-52, -14, 20, 54];

const blocks: Surface[] = roadsX.slice(0, -1).flatMap((x, i) => roadsY.slice(0, -1).map((y, j): Surface => ({
  kind: 'block', min: [x + ROAD, y + ROAD], max: [roadsX[i + 1] - ROAD, roadsY[j + 1] - ROAD], inset: SIDEWALK,
})));

const lanes: Surface[] = [
  ...roadsY.map((y): Surface => ({ kind: 'lane', min: [-64, y], max: [70, y] })),
  ...roadsX.map((x): Surface => ({ kind: 'lane', min: [x, -56], max: [x, 58] })),
];

// Passages piétons aux carrefours proches de la maison.
const crosswalks: Surface[] = [
  { kind: 'crosswalk', min: [-14 + 0.6, 20 - ROAD], max: [-14 + 3.6, 20 + ROAD] },
  { kind: 'crosswalk', min: [-18 - ROAD, 16 - 3.6], max: [-18 + ROAD, 16 - 0.6] },
  { kind: 'crosswalk', min: [20 - 3.6, 20 - ROAD], max: [20 - 0.6, 20 + ROAD] },
  { kind: 'crosswalk', min: [24 - ROAD, -10 + 0.6], max: [24 + ROAD, -10 + 3.6] },
  { kind: 'crosswalk', min: [-18 - ROAD, -10 + 0.6], max: [-18 + ROAD, -10 + 3.6] },
];

// Jardin de la maison et allée d'entrée vers la rue est.
const garden: Surface[] = [
  { kind: 'lawn', min: [-14 + SIDEWALK, -10 + SIDEWALK], max: [20 - SIDEWALK, 16 - SIDEWALK] },
  { kind: 'paving', min: [5.1, 8.1], max: [20 - SIDEWALK, 9.1] },
];

// Bâtiments voisins : gabarits simples, aucun devant la maison.
const buildings: Box[] = [
  item('building', 'immeuble', -12, -8, -3, 1, 6.5),
  { kind: 'gable', tag: 'maison', min: [-12, -30, 0], max: [-1, -21, 9], eave: 6 },
  item('building', 'immeuble', 1, -32, 12, -22, 12),
  item('building', 'immeuble', -32, -8, -24, 0, 12),
  item('building', 'immeuble', -34, 2.5, -25, 12, 9),
  { kind: 'gable', tag: 'maison', min: [-48, 3, 0], max: [-37, 13, 9], eave: 6.2 },
  item('building', 'immeuble', -36, 27, -25, 35, 7),
  { kind: 'gable', tag: 'maison', min: [-50, 27, 0], max: [-40, 36, 8], eave: 5.4 },
];

// Arbre d'alignement : enveloppe du houppier, rayon et hauteur variables.
const tree = (x: number, y: number, radius = 2.2, height = 7): Box => item('tree', 'arbre', x - radius, y - radius, x + radius, y + radius, height);

const trees: Box[] = [
  tree(18, 3, 2.3, 7.5), tree(-12.8, -6), tree(-12.8, 4, 2, 6.5), tree(-12.8, 12.2, 2.3, 7.2),
  tree(-23.2, -4, 2.1, 6.8), tree(-23.2, 6), tree(-23.2, 14.5, 2.4, 7.4),
  tree(19, 14.8, 2, 6.6), tree(-10.5, 14.8, 2.1, 6.8),
  tree(-30, 25.2), tree(-40, 25.2, 2.3, 7.2), tree(-8, 25.2, 2.2, 7.4), tree(6, 25.2, 2, 6.5),
  tree(-6, -8.8, 2, 6.4), tree(10, -8.8, 2.3, 7.2), tree(-8, -19.2), tree(6, -19.2, 2.1, 6.6),
  tree(18.8, -4, 2, 6.8), tree(28.8, 2, 2.2, 7),
];

// Voiture garée le long du trottoir, orientée selon x ou y.
function car(x: number, y: number, along: 'x' | 'y'): Box[] {
  const [lx, ly] = along === 'x' ? [4.3, 1.8] : [1.8, 4.3];
  const [cx, cy] = along === 'x' ? [2.3, 1.5] : [1.5, 2.3];
  const [ox, oy] = along === 'x' ? [0.5, 0] : [0, 0.5];
  return [
    item('car', 'voiture', x - lx / 2, y - ly / 2, x + lx / 2, y + ly / 2, 0.85, 0.15),
    item('glass', 'habitacle', x - cx / 2 - ox, y - cy / 2 - oy, x + cx / 2 - ox, y + cy / 2 - oy, 1.42, 0.85),
  ];
}

const cars: Box[] = [
  ...car(6.5, 17.2, 'x'), ...car(-19.8, 4.5, 'y'), ...car(-1.5, -15.2, 'x'),
  ...car(-34, 22.8, 'x'), ...car(21.2, -1, 'y'),
];

// Mobilier urbain : bancs, lampadaires, corbeilles.
const bench = (x: number, y: number, along: 'x' | 'y'): Box[] => along === 'x'
  ? [item('furniture', 'banc', x - 0.9, y - 0.25, x + 0.9, y + 0.25, 0.45), item('furniture', 'banc', x - 0.9, y - 0.25, x + 0.9, y - 0.17, 0.85, 0.45)]
  : [item('furniture', 'banc', x - 0.25, y - 0.9, x + 0.25, y + 0.9, 0.45), item('furniture', 'banc', x - 0.25, y - 0.9, x - 0.17, y + 0.9, 0.85, 0.45)];
const lamp = (x: number, y: number): Box[] => [
  item('furniture', 'lampadaire', x - 0.07, y - 0.07, x + 0.07, y + 0.07, 4.6),
  item('furniture', 'lanterne', x - 0.25, y - 0.25, x + 0.25, y + 0.25, 4.95, 4.6),
];
const bin = (x: number, y: number) => item('furniture', 'corbeille', x - 0.22, y - 0.22, x + 0.22, y + 0.22, 0.9);

const streetFurniture: Box[] = [
  ...bench(8, 15.3, 'x'), ...bench(-12.6, 8, 'y'), ...bench(-23.4, 10, 'y'),
  ...lamp(-12.2, 15.6), ...lamp(19.2, 15.6), ...lamp(-23.2, -9.4), ...lamp(-23.2, 23.2), ...lamp(19.4, -9.4),
  bin(11, 15.5), bin(-12.6, 10.4),
];

// Haies autour du jardin, côté rues sud et est.
const hedges: Box[] = [
  item('hedge', 'haie', -11.5, 13.1, 17.5, 13.5, 0.9),
  item('hedge', 'haie', 17.1, -7.5, 17.5, 8, 0.9),
  item('hedge', 'haie', 17.1, 9.2, 17.5, 13.1, 0.9),
];

export const street: Context = {
  surfaces: [...blocks, ...garden, ...lanes, ...crosswalks],
  boxes: [...buildings, ...trees, ...cars, ...streetFurniture, ...hedges],
};
