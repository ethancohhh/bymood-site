// Scène décrite en mètres, sans notion d'écran : le rendu SVG actuel et un éventuel
// rendu 3D lisent les mêmes données. Axes : x vers l'est, y vers le sud, z vers le haut ;
// l'observateur regarde depuis le sud-est, en surplomb.
export type Vec2 = readonly [number, number];
export type Vec3 = readonly [number, number, number];

// wall/parapet : maçonnerie coupée ; glass : vitrage ; soft : assise, literie ;
// tub : baignoire (cuve creusée) ; plant : pot et feuillage dans leur enveloppe ;
// building : immeuble à toit plat ; gable : maison à deux pans (faîtage selon x) ;
// tree : tronc et houppier dans leur enveloppe ; car : caisse d'une voiture ; hedge : haie.
export type BoxKind = 'wall' | 'parapet' | 'stair' | 'volume' | 'glass' | 'furniture' | 'soft' | 'tub' | 'plant'
  | 'building' | 'gable' | 'tree' | 'car' | 'hedge';

export type Box = {
  kind: BoxKind;
  min: Vec3;
  max: Vec3;
  // Nom de l'objet (canapé, lit…) pour un rendu qui voudrait le modéliser plus finement.
  tag?: string;
  // Hauteur d'égout d'un toit à deux pans ; le faîtage est en max[2].
  eave?: number;
};

// Revêtement posé sur la dalle ou le sol : textures, tapis, îlots urbains (trottoir et
// limite de parcelle), pelouse, allée, passage piéton et marquage de chaussée.
export type SurfaceKind = 'parquet' | 'tile' | 'rug' | 'deck' | 'block' | 'lawn' | 'paving' | 'crosswalk' | 'lane';
// inset : retrait de la limite de parcelle par rapport à la bordure (largeur du trottoir).
export type Surface = { kind: SurfaceKind; min: Vec2; max: Vec2; inset?: number };

// Dalle extrudée vers le bas depuis le niveau du plancher.
export type Slab = {
  outline: Vec2[];
  holes?: Vec2[][];
  thickness: number;
};

export type Level = {
  id: string;
  label: string;
  // Altitude réelle du plancher ; l'écartement de la vue éclatée relève du rendu.
  elevation: number;
  slab: Slab;
  surfaces?: Surface[];
  boxes: Box[];
};

// Quartier autour de la maison, au niveau du sol.
export type Context = { surfaces: Surface[]; boxes: Box[] };

export type Scene = { levels: Level[]; context: Context };
