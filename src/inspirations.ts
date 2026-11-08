import data from './inspirations.json';

// Photos d'inspiration (tableaux Pinterest d'Aliriza) importées du catalogue client par
// `npm run inspirations`. Section non indexée : ce ne sont pas des réalisations bymood.
export type InspirationImage = { id: string; legende: string; ratio: number; largeurSource: number };
export type Universe = { slug: string; titre: string; accroche: string; couverture: InspirationImage | null; variantes: InspirationImage[] };

export const universes: Universe[] = data;

export const pad = (value: number) => String(value).padStart(2, '0');
export const inspirationSource = (universe: Universe, image: InspirationImage, width: 800 | 1600) => `/images/inspirations/${universe.slug}/${image.id}-${width}.webp`;
