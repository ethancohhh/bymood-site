import { projects, renovations, site } from './data';
import { universes } from './inspirations';

export type SitePage = { path: string; title: string; description: string; redirect?: string };

export const pages: SitePage[] = [
  { path: '/realisations/', title: `Réalisations — Prestations & conception 3D | ${site.name}`, description: 'Découvrez les réalisations bymood. : prestations réalisées avant / après, aménagements et études de conception 3D.' },
  // Ancienne adresse de Réalisations, conservée pour les liens déjà partagés.
  { path: '/catalogue/', redirect: '/realisations/', title: `Réalisations | ${site.name}`, description: 'Le catalogue bymood. s’appelle désormais Réalisations.' },
  { path: '/inspirations/', title: `Inspirations — Idées par pièce | ${site.name}`, description: 'Des idées de style par pièce : cuisine, salle de bain, mur TV, cheminée et escalier.' },
  ...universes.map(universe => ({ path: `/inspirations/${universe.slug}/`, title: `${universe.titre} — Inspirations | ${site.name}`, description: universe.accroche })),
  { path: '/prestations/', title: `Aménagement — Études 3D & prestation réalisée | ${site.name}`, description: 'Deux aménagements imaginés en 3D — bibliothèque et coin lecture, pièce multifonction — et une prestation réalisée de salle de bains pour comprendre les possibilités d’aménagement.' },
  { path: '/', title: `Architecture intérieure & rénovation à Paris et en Île-de-France — ${site.name}`, description: 'bymood. vous accompagne dans vos projets d’aménagement et de rénovation intérieure à Paris et en Île-de-France : conception 3D, choix des fournitures et organisation des travaux.' },
  { path: '/mentions-legales/', title: `Mentions légales — ${site.name}`, description: 'Informations légales relatives à l’éditeur et à l’hébergeur du site bymood.' },
  { path: '/confidentialite/', title: `Confidentialité — ${site.name}`, description: 'Données utilisées sur le site bymood. : aucun formulaire, aucun cookie publicitaire, contact par téléphone.' },
  ...projects.map(project => ({ path: `/projets/${project.slug}/`, title: `${project.name} — Étude de conception | ${site.name}`, description: project.slug === 'haven' ? 'Découvrez HAVEN, une étude de conception d’Aliriza Bay : bibliothèque intégrée, rangements et coin lecture, à travers plans et rendus 3D.' : 'Découvrez NEMETO, une étude de conception d’Aliriza Bay : une grange organisée autour d’un noyau central, à travers plans et rendus 3D.' })),
  ...renovations.map(project => ({ path: `/renovation/${project.slug}/`, title: `${project.title} — Prestation réalisée | ${site.name}`, description: `Prestation réalisée · Avant / après. ${project.summary}` })),
  { path: '/404.html', title: `Page introuvable — ${site.name}`, description: 'Cette page n’existe pas, ou a changé d’adresse.' },
];

/** Resolve only published pages, with an optional trailing slash or explicit index file. */
export function resolvePage(path: string) {
  const normalized = path.endsWith('/index.html') ? path.slice(0, -10) : path;
  return pages.find(page => page.path === normalized || (page.path.endsWith('/') && page.path.slice(0, -1) === normalized)) ?? pages[pages.length - 1];
}
