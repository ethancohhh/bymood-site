import { projects, renovations, site } from './data';

export const pages = [
  { path: '/catalogue/', title: `Catalogue — Prestations & conception 3D | ${site.name}`, description: 'Explorez le catalogue bymood. : exemples de prestations, études de conception 3D et inspirations de rénovation avant / après.' },
  { path: '/prestations/', title: `Prestations — Exemples d’aménagement | ${site.name}`, description: 'Explorez trois exemples de prestations pour la maquette bymood. : coin TV et rangements, pièce multifonction et salle de bains.' },
  { path: '/', title: `Architecture intérieure · Design · Rénovation — ${site.name}`, description: 'bymood. vous accompagne dans vos projets d’aménagement et de rénovation intérieure : conception, choix des fournitures et organisation des travaux selon le périmètre convenu.' },
  { path: '/mentions-legales/', title: `Mentions légales — ${site.name}`, description: 'Informations légales relatives à l’éditeur du site bymood. et aux visuels de conception présentés.' },
  { path: '/confidentialite/', title: `Confidentialité — ${site.name}`, description: 'Découvrez comment fonctionne le formulaire bymood. et quelles données sont utilisées dans cette version du site.' },
  ...projects.map(project => ({ path: `/projets/${project.slug}/`, title: `${project.name} — Étude de conception | ${site.name}`, description: project.slug === 'haven' ? 'Découvrez HAVEN, une étude de conception d’Aliriza Bay : bibliothèque intégrée, rangements et coin lecture, à travers plans et rendus 3D.' : 'Découvrez NEMETO, une étude de conception d’Aliriza Bay : une grange organisée autour d’un noyau central, à travers plans et rendus 3D.' })),
  ...renovations.map(project => ({ path: `/renovation/${project.slug}/`, title: `${project.title} — ${project.pairs ? 'Projet d’exemple' : 'Inspiration rénovation'} | ${site.name}`, description: `${project.pairs ? 'Projet d’exemple pour la maquette' : 'Exemple d’inspiration'}, non présenté comme un chantier réalisé par bymood. ${project.summary}` })),
  { path: '/404.html', title: `Page introuvable — ${site.name}`, description: 'Cette page n’existe pas, ou a changé d’adresse.' },
];

/** Resolve only published pages, with an optional trailing slash or explicit index file. */
export function resolvePage(path: string) {
  const normalized = path.endsWith('/index.html') ? path.slice(0, -10) : path;
  return pages.find(page => page.path === normalized || (page.path.endsWith('/') && page.path.slice(0, -1) === normalized)) ?? pages[pages.length - 1];
}
