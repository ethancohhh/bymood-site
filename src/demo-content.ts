/** Données de maquette et pistes d’aménagement ; statuts des visuels explicités par entrée. */
export const demoContent = {
  enabled: true,
  notice: 'Maquette de présentation · Informations d’entreprise et coordonnées d’exemple à adapter.',
  area: {
    title: 'Paris et l’ouest parisien',
    detail: 'Paris, Versailles, Saint-Germain-en-Laye et les communes voisines.',
  },
  email: 'contact@bymood.example',
  legal: {
    company: 'bymood. — entreprise fictive de démonstration',
    status: 'Entreprise de rénovation et d’aménagement — exemple de présentation',
    address: 'Adresse d’exemple · Versailles, Yvelines',
    registration: 'Identifiant professionnel à remplacer dans la version définitive',
    publicationDirector: 'Responsable de la maquette bymood.',
    hosting: 'Sites · hébergement privé de la maquette',
    privacyContact: 'contact@bymood.example — adresse fictive, sans réception',
    retention: 'Aucune conservation des réponses par le site dans le mode actuel de récapitulatif local',
  },
};

export const exampleServices = [
  {
    status: 'inspiration' as const, slug: 'coin-tv-rangements', title: 'Coin TV & rangements', type: 'Bibliothèque / rangement',
    summary: 'Organiser le mur du salon pour réunir écran, livres et objets du quotidien dans un ensemble cohérent.',
    need: 'Votre mobilier s’est accumulé au fil du temps et le salon manque de rangement. Vous cherchez une composition qui rassemble les usages sans encombrer la pièce.',
    example: 'Dans un salon d’appartement, une composition associe des caissons bas fermés, des étagères et une place pour l’écran. Les références, les finitions et les dimensions sont choisies pour la pièce.',
    image: 'haven-library', alt: 'Bibliothèque et coin lecture du rendu 3D HAVEN, utilisés comme inspiration d’aménagement.',
    caption: 'Inspiration : étude HAVEN, portfolio d’Aliriza Bay · Rendu 3D.',
    included: ['Échange sur les usages, les dimensions et les équipements à conserver.', 'Proposition d’implantation, sélection du mobilier et des finitions.', 'Organisation de la fourniture et de la pose prévues au devis.'],
    limits: 'La reprise des murs, les modifications électriques et l’intégration d’équipements audiovisuels se définissent séparément selon le logement.',
    budget: 'Dimensions de la composition, mobilier standard ou fabriqué sur mesure, matériaux, éclairage et conditions de pose.',
  },
  {
    status: 'inspiration' as const, slug: 'piece-multifonction', title: 'Pièce multifonction', type: 'Optimisation d’espace',
    summary: 'Faire une place au travail, à la lecture ou aux loisirs dans une pièce qui accueille déjà plusieurs usages.',
    need: 'Vous souhaitez créer un bureau ou un espace personnel sans consacrer une pièce entière à cette fonction.',
    example: 'Dans une chambre, un bureau prend place près de la fenêtre et les rangements se regroupent sur un mur. La proposition compare la place du mobilier et les passages à conserver.',
    image: 'haven-bedroom', alt: 'Bureau près de la fenêtre et rangements de la chambre HAVEN, présentés comme inspiration.',
    caption: 'Inspiration : étude HAVEN, portfolio d’Aliriza Bay · Rendu 3D.',
    included: ['Repérage des habitudes et des fonctions à faire cohabiter.', 'Plan d’aménagement et vues pour comparer les choix.', 'Sélection du mobilier, de l’éclairage et des interventions prévues.'],
    limits: 'Les modifications de cloisons, l’isolation acoustique et les adaptations techniques demandent une étude et un périmètre spécifiques.',
    budget: 'Nombre de fonctions, mobilier réutilisé ou neuf, fabrication sur mesure, éclairage et interventions nécessaires.',
  },
  {
    status: 'completed' as const, slug: 'salle-de-bains', title: 'Salle de bains', type: 'Salle d’eau',
    summary: 'Une baignoire remplacée par une douche vitrée, avec des revêtements beiges et des équipements noirs.',
    need: 'La salle de bains ne correspond plus à vos usages ou à vos goûts. Vous souhaitez préciser ce qui peut être conservé, remplacé ou déplacé.',
    example: 'La baignoire sous la fenêtre en arche est remplacée par une douche vitrée. Les revêtements beiges veinés, la porte en bois clair et les équipements noirs composent la nouvelle ambiance.',
    image: 'renovation-3', alt: 'Prestation réalisée : salle de bains avant et après le remplacement d’une baignoire par une douche.',
    caption: 'Prestation réalisée · Salle de bains avant / après · Photographies fournies par Ethan.',
    included: ['Échange sur les usages, les équipements et les contraintes connues.', 'Proposition d’agencement et sélection des matériaux et équipements.', 'Définition des travaux, des intervenants et des étapes au devis.'],
    limits: 'Les réseaux, l’étanchéité, la ventilation et les contraintes du bâtiment doivent être examinés avant de fixer le périmètre des travaux.',
    budget: 'État de l’existant, déplacement des équipements, préparation des supports, matériaux et accès au chantier.',
  },
];
