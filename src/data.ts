import configuration from '../site.config.json';

export const site = {
  ...configuration,
  url: import.meta.env?.VITE_SITE_URL ||
    globalThis.process?.env.VITE_SITE_URL || configuration.url,
};
export const brand = {
  signature: 'Architecture intérieure · Design · Rénovation',
};
// Ajouter uniquement des destinations officielles confirmées.
export const socialLinks: { label: string; href: string }[] = [];
export const ethanContact = { name: 'Ethan', phone: '06 66 51 30 40', href: 'tel:+33666513040' };
export const contactMode = site.contactEndpoint ? 'endpoint' : site.email ? 'email' : 'draft';
export const contact = {
  mode: contactMode,
  cta: contactMode === 'draft' ? 'Préparer mon projet' : 'Parler de votre projet',
  submit: contactMode === 'draft' ? 'Créer mon récapitulatif' : contactMode === 'email' ? 'Préparer mon email' : 'Présenter mon projet',
};

// Ancres conservées pour les liens des versions précédentes.
export const navigation = [
  ['Catalogue', '/catalogue/'],
  ['Notre approche', 'approche'], ['Rénovation', '/catalogue/#renovation'],
  ['Notre équipe', 'a-propos'],
] as const;

export const expertise = [
  { title: 'Créer des rangements adaptés à votre pièce', text: 'Bibliothèque, meuble TV ou placards intégrés : des rangements pensés pour la pièce et vos habitudes.', examples: 'Bibliothèque, meuble TV, placards', type: 'Bibliothèque / rangement' },
  { title: 'Aménager un espace pour un nouvel usage', text: 'Aménager un bureau, un coin lecture ou un espace cinéma sans compromettre les autres fonctions de la pièce.', examples: 'Bureau, coin lecture, espace cinéma', type: 'Optimisation d’espace' },
  { title: 'Repenser l’aménagement d’une pièce', text: 'Revoir la disposition, les équipements et les matériaux d’une pièce pour l’adapter à vos besoins.', examples: 'Disposition, matériaux, équipements', type: 'Rénovation intérieure' },
];

export type Project = {
  slug: string; number: string; name: string; subtitle: string; category: string;
  location: string; area: string; year: string; image: string; alt: string;
  problem: string; solution: string;
  plan: { image: string; alt: string; caption: string };
  focus: { title: string; image: string; alt: string; caption: string };
  decisions: { title: string; text: string }[];
  gallery: { image: string; alt: string; caption: string }[];
};

// Portfolio d’Aliriza Bay, pages 8–9 et 12–13. Études, sans chantier livré attesté.
// Les commentaires décrivent les documents fournis, pas un brief client inventé.
export const projects: Project[] = [
  {
    slug: 'haven', number: '01', name: 'HAVEN', subtitle: 'Une bibliothèque et un coin lecture dans un intérieur ouvert.',
    category: 'Habitat · Étude de conception', location: 'Paris — lieu d’étude', area: '150 m² — surface étudiée', year: '2026',
    image: 'haven-living', alt: 'Rendu 3D de HAVEN : salon ouvert sur la cuisine, bois clair et touches de bleu.',
    problem: 'Comment faire cohabiter les différents usages d’un intérieur sans cloisonner les espaces de vie ?',
    solution: 'Le plan organise les pièces autour des espaces de vie et de l’escalier. Les rendus 3D permettent de comprendre la place du mobilier, l’intégration des rangements et les choix de matériaux. Le coin lecture illustre trois décisions de conception.',
    plan: { image: 'haven-plan', alt: 'Plan du rez-de-chaussée de HAVEN montrant la disposition des pièces, du mobilier et de l’escalier.', caption: 'Le plan — organisation du rez-de-chaussée' },
    focus: { title: 'Une bibliothèque qui accueille aussi un coin lecture.', image: 'haven-library', alt: 'Rendu 3D de HAVEN : bibliothèque avec placards bas, étagères éclairées et coin lecture avec fauteuil et pouf.', caption: 'Le détail — bibliothèque et coin lecture en 3D' },
    decisions: [
      { title: 'Concentrer les rangements', text: 'En occupant un seul mur, la bibliothèque rassemble les rangements et libère visuellement le reste de la pièce.' },
      { title: 'Alterner rangements ouverts et fermés', text: 'Les placards bas dissimulent ce que l’on souhaite ranger, tandis que les étagères ouvertes exposent livres et objets. Un éclairage intégré complète l’ensemble.' },
      { title: 'Créer un coin lecture', text: 'Devant la bibliothèque, un fauteuil, un pouf et une petite table dessinent un espace dédié à la lecture.' },
    ],
    gallery: [
      { image: 'haven-library', alt: 'Bibliothèque et assises de l’étude HAVEN.', caption: 'Une bibliothèque, des placards bas et un coin lecture.' },
      { image: 'haven-bedroom', alt: 'Rendu 3D de la chambre HAVEN : bureau près de la fenêtre et rangements intégrés.', caption: 'Un autre aménagement étudié : un bureau intégré à la chambre.' },
    ],
  },
  {
    slug: 'nemeto', number: '02', name: 'NEMETO', subtitle: 'Une grange réorganisée autour d’un espace central.',
    category: 'Grange · Étude de rénovation', location: 'Nanterre — lieu d’étude', area: '379 m² — surface étudiée', year: '2026',
    image: 'nemeto-kitchen', alt: 'Rendu 3D de NEMETO : cuisine lumineuse, grande fenêtre et structure en bois.',
    problem: 'Comment transformer une grange en habitat en préservant la distinction entre espaces privés et espaces de vie ?',
    solution: 'Le projet regroupe les chambres dans un noyau central. Autour, l’escalier et les espaces de vie s’organisent dans le volume de la grange. Les plans et rendus montrent également les associations de bois, de pierre et de marbre.',
    plan: { image: 'nemeto-plan', alt: 'Plan de NEMETO montrant l’organisation des pièces autour d’un noyau central.', caption: 'Le plan — organisation de l’habitat' },
    focus: { title: 'Organiser les usages autour de la structure.', image: 'nemeto-stairs', alt: 'Rendu 3D de NEMETO : escalier, structure en bois et circulation entre les espaces.', caption: 'Le détail — escalier et structure en 3D' },
    decisions: [
      { title: 'Rassembler les espaces privés', text: 'Les chambres sont regroupées sur plusieurs niveaux dans un noyau central, tandis que les espaces communs se déploient autour.' },
      { title: 'Relier les niveaux', text: 'L’escalier accompagne le noyau central et assure la liaison entre les niveaux. Son implantation participe à l’organisation des espaces.' },
      { title: 'Faire dialoguer les matières', text: 'Bois, pierre et surfaces lisses créent des contrastes de texture qui distinguent les ambiances sans multiplier les couleurs.' },
    ],
    gallery: [
      { image: 'nemeto-stairs', alt: 'Escalier et menuiseries bois de l’étude NEMETO.', caption: 'L’escalier autour du noyau central.' },
      { image: 'nemeto-living', alt: 'Rendu 3D de NEMETO : salon, cheminée et structure existante de la grange.', caption: 'Les espaces de vie se déploient autour de la structure centrale.' },
    ],
  },
];

export const process = [
  { title: 'Comprendre vos besoins', text: 'Nous échangeons sur vos habitudes, prenons en compte les dimensions et les contraintes du lieu, ainsi que le budget envisagé.', output: 'Un besoin et un périmètre à préciser.' },
  { title: 'Concevoir et chiffrer', text: 'Plans, vues 3D, matériaux et fournitures vous permettent de visualiser la proposition avant de la valider.', output: 'Une proposition et un devis à examiner ensemble.' },
  { title: 'Organiser la réalisation', text: 'Après validation du devis, nous organisons les fournitures, les interventions, le suivi et la réception selon le périmètre convenu.', output: 'Des travaux encadrés par les choix validés.' },
];

export const questions = [
  { question: 'Comment le budget se construit-il ?', answer: 'Les dimensions, les fournitures, l’état de l’existant et les interventions nécessaires permettent de construire le devis. Les exemples de la maquette ne constituent pas des offres chiffrées.' },
  { question: 'Peut-on adapter ces exemples à mon logement ?', answer: 'Les exemples servent de point de départ. Les usages, les dimensions, les éléments à conserver et les contraintes du logement permettent de préciser une proposition adaptée.' },
  { question: 'Que peut comprendre votre projet ?', answer: 'Selon votre besoin, l’accompagnement associe conception, choix des fournitures et travaux. Le devis précise les prestations prévues, les exclusions et les conditions de réalisation.' },
  { question: 'De quoi ai-je besoin pour commencer ?', answer: 'Indiquez la ville, la pièce concernée, quelques dimensions si vous les connaissez et ce que vous souhaitez améliorer. Une première idée du budget est utile, sans être obligatoire.' },
];

// Exemples fournis par Ethan. Auteur et rôle de l’équipe non confirmés :
// ne pas les présenter comme des réalisations de bymood. ou d’Aliriza.
export type RenovationPair = {
  title: string; description: string;
  before: { image: string; alt: string };
  after: { image: string; alt: string };
};
export type Renovation = {
  slug: string; title: string; image: string; alt: string;
  summary: string; changes: { title: string; text: string }[];
  category?: string; pairs?: RenovationPair[];
};

function photoPair(city: string, number: number, title: string, description: string, before: string, after: string): RenovationPair {
  return { title, description, before: { image: `${city}-${number}-avant`, alt: `Avant : ${before}` }, after: { image: `${city}-${number}-apres`, alt: `Après : ${after}` } };
}

export const renovations: Renovation[] = [
  {
    slug: 'projet-paris', title: 'Projet Paris', category: 'Pièces de vie & aménagement', image: 'paris-1-apres',
    alt: 'Après : salon aux tons clairs, cheminée blanche, étagères en bois et canapé d’angle.',
    summary: 'Un salon aux tons clairs, une cuisine recomposée et un bureau intégré : quatre regards sur la transformation d’un intérieur.',
    changes: [
      { title: 'Unifier les ambiances', text: 'Des tons clairs et des touches de bois relient les différentes pièces, du salon à la cuisine.' },
      { title: 'Donner une place à chaque usage', text: 'Un bureau pour deux personnes prend place contre un mur, à proximité de l’escalier.' },
      { title: 'Préciser les finitions', text: 'Mobilier, luminaires et revêtements composent des ensembles distincts pour la cuisine et la salle de bains.' },
    ],
    pairs: [
      photoPair('paris', 1, 'Le salon', 'La cheminée noire et les motifs muraux laissent place à une composition blanche, accompagnée d’étagères en bois et d’assises claires.', 'salon avec cheminée noire, motifs muraux et canapés en cuir sombre.', 'salon aux tons clairs, cheminée blanche, étagères en bois et canapé d’angle.'),
      photoPair('paris', 2, 'La cuisine', 'Les façades sombres sont remplacées par une palette blanche et grise. Des étagères ouvertes et un îlot complètent la composition.', 'cuisine avec meubles en bois sombre et plan de travail beige autour de l’évier.', 'cuisine blanche avec îlot gris, étagères en bois et crédence à motifs hexagonaux.'),
      photoPair('paris', 3, 'Le bureau et l’escalier', 'À la place du canapé, un plan de travail accueille deux assises. Des rangements hauts et bas accompagnent ce nouvel espace de bureau.', 'canapé clair, aquarium et escalier recouvert de moquette.', 'bureau à deux places avec rangements en bois et escalier aux marches en bois.'),
      photoPair('paris', 4, 'La salle de bains', 'La nouvelle vue associe un meuble double vasque en bois, des miroirs encadrés et une grande paroi vitrée dans une palette claire.', 'salle de bains aux murs sombres avec meuble vasque, miroir mural et carrelage clair.', 'salle de bains avec meuble double vasque en bois, miroirs encadrés et paroi vitrée.'),
    ],
  },
  {
    slug: 'projet-grenoble', title: 'Projet Grenoble', category: 'Cuisine & espaces de vie', image: 'grenoble-1-apres',
    alt: 'Après : pièce de vie ouverte avec salon, cheminée claire, cuisine et structure en bois apparente.',
    summary: 'Une pièce de vie ouverte, un îlot bleu et une salle de bains graphique : trois vues pour comprendre les changements d’ambiance et d’organisation.',
    changes: [
      { title: 'Relier les espaces de vie', text: 'Les vues après transformation montrent le salon et la cuisine dans un ensemble ouvert, rythmé par les éléments en bois.' },
      { title: 'Structurer la cuisine', text: 'L’îlot bleu et son plan clair dessinent un point central entre préparation, rangements et espace de vie.' },
      { title: 'Composer avec les contrastes', text: 'Dans la salle de bains, les surfaces blanches s’associent à des équipements noirs et à un sol à grands motifs.' },
    ],
    pairs: [
      photoPair('grenoble', 1, 'La pièce de vie', 'La vue avant montre des espaces séparés. La vue après présente une pièce de vie ouverte, avec la cuisine en arrière-plan et une cheminée claire.', 'vue depuis une cuisine aux meubles en bois, à travers une porte vers une pièce voisine.', 'pièce de vie ouverte avec salon, cheminée claire, cuisine et structure en bois apparente.'),
      photoPair('grenoble', 2, 'La cuisine ouverte', 'À la vue d’une salle à manger succède celle d’un îlot bleu entouré de rangements clairs. Les cadrages diffèrent et se lisent séparément.', 'salle à manger avec table en bois, suspension et grande fenêtre.', 'cuisine ouverte avec îlot bleu, plan clair, suspensions et grandes baies.'),
      photoPair('grenoble', 3, 'La salle de bains', 'Le papier peint fleuri et le sol sombre laissent place à des murs blancs, une robinetterie noire et un sol graphique. Baignoire et douche restent deux usages distincts.', 'salle de bains avec baignoire, douche vitrée, papier peint fleuri et sol sombre.', 'salle de bains blanche avec baignoire, douche vitrée, robinetterie noire et sol à motifs.'),
    ],
  },
  {
    slug: 'projet-toulouse', title: 'Projet Toulouse', category: 'Intérieur & rangements', image: 'toulouse-1-apres',
    alt: 'Après : cuisine blanche et bleu clair, îlot avec assises bleues, banquette et poutres foncées.',
    summary: 'Cuisine, entrée, rangements, salon et escalier : cinq séquences avant / après autour des usages et des matières d’un intérieur.',
    changes: [
      { title: 'Éclaircir les compositions', text: 'Les meubles de cuisine et les rangements adoptent une palette claire, accompagnée de bleu et de bois.' },
      { title: 'Intégrer les rangements', text: 'Un ensemble mural réunit placards, tiroirs, vitrines et étagères entre deux passages.' },
      { title: 'Affirmer les points de vue', text: 'Le salon s’organise autour d’un mur TV et d’une cheminée ; l’escalier associe bois et garde-corps vitré.' },
    ],
    pairs: [
      photoPair('toulouse', 1, 'La cuisine', 'Les meubles foncés sont remplacés par une palette blanche et bleu clair. L’îlot, les assises et la banquette réunissent plusieurs façons de s’installer.', 'cuisine sombre avec comptoir, meubles foncés et poutres apparentes.', 'cuisine blanche et bleu clair, îlot avec assises bleues, banquette et poutres foncées.'),
      photoPair('toulouse', 2, 'L’entrée', 'Le sol clair et le papier peint à motifs redéfinissent l’ambiance de l’entrée. Les ouvertures vitrées maintiennent les vues vers les pièces voisines.', 'entrée avec sol en bois, escalier et portes vitrées donnant sur un bureau.', 'entrée au sol clair, papier peint à motifs et portes vitrées entre les pièces.'),
      photoPair('toulouse', 3, 'Les rangements', 'Un ensemble mural remplace le meuble bas et la niche. Placards, vitrines, étagères et tiroirs composent un même aménagement.', 'mur avec niche, tableau et meuble bas sombre entre deux passages.', 'rangements muraux blancs avec placards, vitrines, tiroirs et étagères sur fond bleu clair.'),
      photoPair('toulouse', 4, 'Le salon', 'La cheminée en pierre et le meuble TV sombre sont remplacés par une composition claire avec écran intégré, étagères latérales et grande assise d’angle.', 'salon avec cheminée en pierre, habillage en bois et meuble TV sombre.', 'salon avec canapé clair, écran au-dessus d’une cheminée allongée et étagères latérales.'),
      photoPair('toulouse', 5, 'L’escalier et la salle à manger', 'Les garde-corps vitrés et les marches en bois renouvellent la lecture de l’escalier. La salle à manger voisine apparaît dans une palette claire.', 'escalier en bois avec garde-corps à motifs métalliques et passage vers les pièces de vie.', 'escalier en bois avec garde-corps vitré, salle à manger claire et rangements muraux.'),
    ],
  },
  {
    slug: 'moderniser-une-douche', title: 'Moderniser une douche', image: 'renovation-1',
    alt: 'Avant : douche étroite avec carrelage jaune et porte opaque. Après : paroi vitrée, revêtement clair veiné et équipements noirs.',
    summary: 'Une douche aux tons jaunes laisse place à un ensemble clair, ouvert sur la pièce par une paroi transparente.',
    changes: [
      { title: 'Éclaircir les revêtements', text: 'Le carrelage jaune est remplacé par un revêtement clair à motifs veinés, visible derrière la paroi.' },
      { title: 'Ouvrir la perspective', text: 'La porte opaque laisse place à une paroi vitrée coulissante avec une structure noire.' },
      { title: 'Accorder les détails', text: 'Robinetterie, barre de maintien et accessoires reprennent une finition noire.' },
    ],
  },
  {
    slug: 'repenser-une-salle-de-bains', title: 'Repenser une salle de bains', image: 'renovation-2',
    alt: 'Avant : salle de bains avec baignoire d’angle et meuble double vasque. Après : grande douche vitrée, revêtements veinés sombres et espace vasques conservé.',
    summary: 'L’espace occupé par une baignoire d’angle est réorganisé autour d’une grande douche vitrée et de matières plus contrastées.',
    changes: [
      { title: 'Passer de la baignoire à la douche', text: 'Une douche vitrée occupe le premier plan de la pièce, à la place de la composition avec baignoire.' },
      { title: 'Affirmer les matières', text: 'Les parois et le sol présentent des motifs veinés sombres, associés à des équipements noirs.' },
      { title: 'Recomposer l’espace', text: 'La douche et l’espace vasques sont distingués par une cloison partiellement vitrée.' },
    ],
  },
  {
    slug: 'transformer-une-baignoire-en-douche', title: 'Transformer une baignoire en douche', image: 'renovation-3',
    alt: 'Avant : baignoire blanche sous une fenêtre en arche. Après : douche vitrée, revêtements beige veiné, robinetterie noire et porte en bois clair.',
    summary: 'Sous la fenêtre en arche, une baignoire est remplacée par une douche dans une palette beige, bois et noir.',
    changes: [
      { title: 'Changer l’usage', text: 'La nouvelle douche prend place dans la zone de l’ancienne baignoire, avec un receveur carrelé et une paroi vitrée.' },
      { title: 'Composer une ambiance chaleureuse', text: 'Les revêtements aux tons beiges et la porte en bois clair accompagnent les équipements noirs.' },
      { title: 'Intégrer les équipements', text: 'Une douche de tête, une douchette, une assise et des barres de maintien sont visibles dans la nouvelle composition.' },
    ],
  },
];
