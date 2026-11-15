/**
 * Plan of the house and its electrical installation.
 * All units are metres. Y is up, the front facade faces +Z.
 *
 * Levels:
 *  - ground floor: finished floor at y = 0, ceiling at y = 3.0
 *  - upper slab:   y = 3.0 → 3.3 (moves with the upper floor)
 *  - upper floor:  y = 3.3 → 6.2
 *  - roof slab:    y = 6.2 → 6.55
 */

export type V3 = [number, number, number];
export type Level = "ground" | "upper" | "outside" | "roof";
export type CircuitKind = "light" | "outlet" | "special";

export const H = {
  groundCeil: 3.0,
  upperFloor: 3.3,
  upperCeil: 6.2,
  roofTop: 6.55,
};

/* ------------------------------------------------------------------ */
/* Rooms                                                               */
/* ------------------------------------------------------------------ */

export type Room = {
  id: string;
  name: string;
  level: Level;
  /** Floor rectangles: [x0, x1, z0, z1] */
  rects: [number, number, number, number][];
  y: number;
  text: string;
  focus: { target: V3; dist: number };
};

export const ROOMS: Room[] = [
  {
    id: "entree",
    name: "Entrée & local technique",
    level: "ground",
    rects: [[-6.7, -3.56, 1.26, 4.2]],
    y: 0,
    text: "Le tableau électrique est installé dans l’entrée, accessible et protégé. Point de départ de tous les circuits de la maison.",
    focus: { target: [-5.2, 1.4, 2.4], dist: 15 },
  },
  {
    id: "salon",
    name: "Salon",
    level: "ground",
    rects: [
      [-6.7, 3.0, -4.2, 1.14],
      [-3.44, 3.0, 1.14, 4.2],
    ],
    y: 0,
    text: "Éclairage encastré sur variateur, prises multimédia et circuits répartis pour un confort d’usage au quotidien.",
    focus: { target: [-0.5, 1.2, -0.5], dist: 18 },
  },
  {
    id: "cuisine",
    name: "Cuisine & séjour",
    level: "ground",
    rects: [[3.0, 6.7, -4.2, 4.2]],
    y: 0,
    text: "Découvrez les circuits spécialisés, les prises et les équipements électriques de cette pièce.",
    focus: { target: [4.9, 1.2, -0.6], dist: 15 },
  },
  {
    id: "sdb",
    name: "Salle de bains",
    level: "upper",
    rects: [[-6.7, -2.56, 1.26, 3.3]],
    y: H.upperFloor,
    text: "Volumes de sécurité respectés, liaison équipotentielle et circuit dédié au sèche-serviettes.",
    focus: { target: [-4.6, 4.4, 2.2], dist: 14 },
  },
  {
    id: "palier",
    name: "Palier",
    level: "upper",
    rects: [[-5.5, -2.56, -4.2, 1.14]],
    y: H.upperFloor,
    text: "Éclairage en va-et-vient entre le rez-de-chaussée et l’étage, arrivée de la colonne montante.",
    focus: { target: [-4.0, 4.4, -1.6], dist: 14 },
  },
  {
    id: "chambre",
    name: "Chambre",
    level: "upper",
    rects: [[-2.44, 2.44, -4.2, 3.3]],
    y: H.upperFloor,
    text: "Prises de chevet, point lumineux central et commande à l’entrée de la pièce.",
    focus: { target: [0, 4.4, -0.6], dist: 15 },
  },
  {
    id: "suite",
    name: "Suite parentale",
    level: "upper",
    rects: [[2.56, 8.2, -4.2, 3.3]],
    y: H.upperFloor,
    text: "Éclairage d’ambiance, prises de chevet et commandes intuitives pour une suite confortable.",
    focus: { target: [5.4, 4.4, -0.6], dist: 16 },
  },
  {
    id: "exterieur",
    name: "Extérieurs",
    level: "outside",
    rects: [[7.0, 11.5, -3.6, 4.6]],
    y: -0.02,
    text: "Éclairage de terrasse et de jardin, borne de recharge pour véhicule électrique et pompe à chaleur.",
    focus: { target: [4, 1, 3], dist: 30 },
  },
];

/* ------------------------------------------------------------------ */
/* Devices                                                             */
/* ------------------------------------------------------------------ */

export type DeviceType = "panel" | "outlet" | "switch" | "light" | "special";

export type Device = {
  id: string;
  type: DeviceType;
  room: string;
  level: Level;
  title: string;
  text: string;
  specs?: string[];
  pos: V3;
  /** Facing direction for wall mounted devices. */
  facing?: "+x" | "-x" | "+z" | "-z" | "down";
  /** Luminaire style. */
  style?: "spot" | "pendant" | "linear" | "disc" | "bollard" | "soffit";
  /** Order in which a luminaire turns on (0 → 1). */
  order?: number;
};

const OUTLET_SPECS = ["Circuit prises 16 A / 20 A", "Section 1,5 à 2,5 mm²", "Protection différentielle 30 mA"];
const LIGHT_SPECS = ["Circuit éclairage 16 A", "Section 1,5 mm²", "8 points lumineux max. par circuit"];
const SWITCH_SPECS = ["Commande à 0,90–1,30 m du sol", "Repérage et accessibilité", "Va-et-vient / variateur possible"];

export const PANEL_POS: V3 = [-5.6, 1.45, 1.33];

export const DEVICES: Device[] = [
  {
    id: "panel",
    type: "panel",
    room: "entree",
    level: "ground",
    title: "Tableau électrique",
    text: "Le cœur de votre installation. Il protège les personnes et les biens et distribue l’énergie vers chaque circuit de la maison.",
    specs: [
      "Interrupteurs différentiels 30 mA type AC / A",
      "Disjoncteurs divisionnaires repérés",
      "Parafoudre et gaine technique logement",
      "Conforme NF C 15-100",
    ],
    pos: PANEL_POS,
    facing: "+z",
  },

  // ---- Ground floor outlets
  { id: "o-salon-1", type: "outlet", room: "salon", level: "ground", title: "Prise de courant — Salon", text: "Prise 2P+T avec obturateurs, positionnée pour le mobilier et les usages multimédia.", specs: OUTLET_SPECS, pos: [-2.4, 0.3, -4.19], facing: "+z" },
  { id: "o-salon-2", type: "outlet", room: "salon", level: "ground", title: "Prises multimédia — Salon", text: "Bloc prises derrière le meuble TV : énergie, RJ45 et TV regroupés proprement.", specs: OUTLET_SPECS, pos: [-0.3, 0.3, -4.19], facing: "+z" },
  { id: "o-salon-3", type: "outlet", room: "salon", level: "ground", title: "Prise de courant — Salon", text: "Prise pour lampadaire et appareils d’appoint, sur circuit dédié aux prises du séjour.", specs: OUTLET_SPECS, pos: [1.8, 0.3, -4.19], facing: "+z" },
  { id: "o-cuisine-1", type: "outlet", room: "cuisine", level: "ground", title: "Prise plan de travail — Cuisine", text: "Prises au-dessus du plan de travail, hors zone d’évier, pour le petit électroménager.", specs: ["6 prises minimum en cuisine", "dont 4 au-dessus du plan de travail", "Circuit 20 A — 2,5 mm²"], pos: [3.6, 1.1, -4.19], facing: "+z" },
  { id: "o-cuisine-2", type: "outlet", room: "cuisine", level: "ground", title: "Prise plan de travail — Cuisine", text: "Double prise pour robots et cafetière, accessible et protégée.", specs: ["6 prises minimum en cuisine", "dont 4 au-dessus du plan de travail", "Circuit 20 A — 2,5 mm²"], pos: [4.5, 1.1, -4.19], facing: "+z" },
  { id: "o-cuisine-3", type: "outlet", room: "cuisine", level: "ground", title: "Prise plan de travail — Cuisine", text: "Prise de plan de travail côté colonne, idéale pour les appareils encastrés.", specs: ["6 prises minimum en cuisine", "dont 4 au-dessus du plan de travail", "Circuit 20 A — 2,5 mm²"], pos: [5.3, 1.1, -4.19], facing: "+z" },

  // ---- Ground floor switches
  { id: "s-salon", type: "switch", room: "salon", level: "ground", title: "Interrupteur — Salon", text: "Commande des spots encastrés du salon, avec variation d’intensité.", specs: SWITCH_SPECS, pos: [-3.43, 1.15, 1.95], facing: "+x" },

  { id: "s-cuisine", type: "switch", room: "cuisine", level: "ground", title: "Interrupteur — Cuisine", text: "Commande des suspensions de l’îlot, à portée de main depuis le plan de travail.", specs: SWITCH_SPECS, pos: [3.2, 1.35, -4.19], facing: "+z" },

  // ---- Ground floor lights
  { id: "l-entree", type: "light", room: "entree", level: "ground", style: "disc", order: 0.0, title: "Plafonnier — Entrée", text: "Plafonnier LED commandé par détecteur de présence à l’entrée.", specs: LIGHT_SPECS, pos: [-5.2, 2.98, 2.8], facing: "down" },
  { id: "l-spot-1", type: "light", room: "salon", level: "ground", style: "spot", order: 0.08, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [-2, 2.98, 1.5], facing: "down" },
  { id: "l-spot-2", type: "light", room: "salon", level: "ground", style: "spot", order: 0.11, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [-2, 2.98, -2], facing: "down" },
  { id: "l-spot-3", type: "light", room: "salon", level: "ground", style: "spot", order: 0.14, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [0, 2.98, -2], facing: "down" },
  { id: "l-spot-4", type: "light", room: "salon", level: "ground", style: "spot", order: 0.17, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [0, 2.98, 1.5], facing: "down" },
  { id: "l-spot-5", type: "light", room: "salon", level: "ground", style: "spot", order: 0.2, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [2, 2.98, 1.5], facing: "down" },
  { id: "l-spot-6", type: "light", room: "salon", level: "ground", style: "spot", order: 0.23, title: "Spot encastré — Salon", text: "Spots LED basse consommation encastrés, répartis pour un éclairage homogène.", specs: LIGHT_SPECS, pos: [2, 2.98, -2], facing: "down" },
  { id: "l-susp-1", type: "light", room: "cuisine", level: "ground", style: "pendant", order: 0.28, title: "Suspension — Îlot de cuisine", text: "Trois suspensions alignées sur l’îlot, sur un circuit d’éclairage dédié.", specs: LIGHT_SPECS, pos: [4.2, 2.05, -1.2] },
  { id: "l-susp-2", type: "light", room: "cuisine", level: "ground", style: "pendant", order: 0.31, title: "Suspension — Îlot de cuisine", text: "Trois suspensions alignées sur l’îlot, sur un circuit d’éclairage dédié.", specs: LIGHT_SPECS, pos: [4.9, 2.05, -1.2] },
  { id: "l-susp-3", type: "light", room: "cuisine", level: "ground", style: "pendant", order: 0.34, title: "Suspension — Îlot de cuisine", text: "Trois suspensions alignées sur l’îlot, sur un circuit d’éclairage dédié.", specs: LIGHT_SPECS, pos: [5.6, 2.05, -1.2] },
  { id: "l-table", type: "light", room: "cuisine", level: "ground", style: "linear", order: 0.38, title: "Suspension linéaire — Salle à manger", text: "Luminaire linéaire au-dessus de la table, lumière chaude et sans éblouissement.", specs: LIGHT_SPECS, pos: [4.9, 1.85, 2.4] },

  // ---- Specialised circuits (ground + outside)
  { id: "x-plaque", type: "special", room: "cuisine", level: "ground", title: "Plaque de cuisson — Circuit spécialisé", text: "Ligne dédiée en 6 mm² protégée par un disjoncteur 32 A : la puissance nécessaire, en toute sécurité.", specs: ["Circuit spécialisé 32 A", "Section 6 mm²", "Sortie de câble dédiée"], pos: [5.3, 0.93, -1.2] },
  { id: "x-four", type: "special", room: "cuisine", level: "ground", title: "Four encastré — Circuit spécialisé", text: "Le four dispose de son propre circuit, indépendant des prises du plan de travail.", specs: ["Circuit spécialisé 20 A", "Section 2,5 mm²", "Prise dédiée"], pos: [6.15, 1.1, -3.62], facing: "+z" },
  { id: "x-borne", type: "special", room: "exterieur", level: "outside", title: "Borne de recharge — Véhicule électrique", text: "Installation IRVE avec protection dédiée et pilotage de la charge pour ne jamais dépasser votre abonnement.", specs: ["Circuit dédié 7,4 kW", "Différentiel 30 mA type A / F", "Installateur qualifié IRVE"], pos: [-9.0, 0.9, 3.5], facing: "+x" },
  { id: "x-pv", type: "special", room: "exterieur", level: "roof", title: "Panneaux photovoltaïques — Toiture", text: "Les panneaux solaires produisent une partie de l’électricité de la maison. Leur courant est converti par l’onduleur, puis injecté dans le tableau électrique.", specs: ["Raccordement via onduleur et protections dédiées", "Coupure d’urgence côté continu et alternatif", "Autoconsommation, avec ou sans revente du surplus"], pos: [2.2, 6.9, -2.0] },
  { id: "x-onduleur", type: "special", room: "entree", level: "ground", title: "Onduleur photovoltaïque", text: "Il convertit le courant continu produit par les panneaux solaires en courant alternatif, puis l’injecte dans le tableau électrique.", specs: ["Circuit dédié protégé au tableau", "Interrupteur-sectionneur de proximité", "Suivi de la production en temps réel"], pos: [-6.3, 1.55, 1.27], facing: "+z" },
  { id: "x-pac", type: "special", room: "exterieur", level: "outside", title: "Pompe à chaleur — Circuit spécialisé", text: "Alimentation dimensionnée selon la puissance de l’unité extérieure, avec coupure de proximité.", specs: ["Circuit dédié", "Section selon puissance", "Coupure de proximité"], pos: [2.6, 0.3, -5.9] },

  // ---- Outside lights
  { id: "l-borne-1", type: "light", room: "exterieur", level: "outside", style: "bollard", order: 0.78, title: "Borne lumineuse — Allée", text: "Bornes d’éclairage IP65 pilotées par horloge astronomique et détection.", specs: ["Circuit extérieur dédié", "Câble U-1000 R2V enterré sous fourreau", "Indice IP65"], pos: [-3.7, 0, 6.6] },
  { id: "l-borne-2", type: "light", room: "exterieur", level: "outside", style: "bollard", order: 0.82, title: "Borne lumineuse — Allée", text: "Bornes d’éclairage IP65 pilotées par horloge astronomique et détection.", specs: ["Circuit extérieur dédié", "Câble U-1000 R2V enterré sous fourreau", "Indice IP65"], pos: [-3.7, 0, 8.6] },
  { id: "l-borne-3", type: "light", room: "exterieur", level: "outside", style: "bollard", order: 0.86, title: "Borne lumineuse — Allée", text: "Bornes d’éclairage IP65 pilotées par horloge astronomique et détection.", specs: ["Circuit extérieur dédié", "Câble U-1000 R2V enterré sous fourreau", "Indice IP65"], pos: [-3.7, 0, 10.6] },

  // ---- Upper floor
  { id: "o-chambre-1", type: "outlet", room: "chambre", level: "upper", title: "Prise de chevet — Chambre", text: "Prises de chevet de part et d’autre du lit, avec chargeur USB intégré.", specs: OUTLET_SPECS, pos: [-1.25, 3.6, -4.19], facing: "+z" },
  { id: "o-chambre-2", type: "outlet", room: "chambre", level: "upper", title: "Prise de chevet — Chambre", text: "Prises de chevet de part et d’autre du lit, avec chargeur USB intégré.", specs: OUTLET_SPECS, pos: [1.25, 3.6, -4.19], facing: "+z" },
  { id: "o-suite-1", type: "outlet", room: "suite", level: "upper", title: "Prise de chevet — Suite", text: "Prise de chevet et commande d’éclairage à portée de main.", specs: OUTLET_SPECS, pos: [4.1, 3.6, -4.19], facing: "+z" },
  { id: "o-suite-2", type: "outlet", room: "suite", level: "upper", title: "Prise de chevet — Suite", text: "Prise de chevet et commande d’éclairage à portée de main.", specs: OUTLET_SPECS, pos: [6.7, 3.6, -4.19], facing: "+z" },
  { id: "s-chambre", type: "switch", room: "chambre", level: "upper", title: "Interrupteur — Chambre", text: "Commande du point lumineux central, placée à l’ouverture de la porte.", specs: SWITCH_SPECS, pos: [-2.43, 4.4, -2.6], facing: "+x" },
  { id: "s-suite", type: "switch", room: "suite", level: "upper", title: "Interrupteur — Suite", text: "Commande principale de la suite, compatible variateur et scénarios.", specs: SWITCH_SPECS, pos: [2.57, 4.4, -2.6], facing: "+x" },
  { id: "x-seche", type: "special", room: "sdb", level: "upper", title: "Sèche-serviettes — Salle de bains", text: "Radiateur sèche-serviettes sur circuit dédié, installé hors volumes 1 et 2.", specs: ["Circuit chauffage dédié", "Liaison équipotentielle", "Protection 30 mA"], pos: [-6.66, 4.2, 2.4], facing: "+x" },
  { id: "l-palier", type: "light", room: "palier", level: "upper", style: "disc", order: 0.45, title: "Plafonnier — Palier", text: "Éclairage du palier commandé en va-et-vient depuis le rez-de-chaussée.", specs: LIGHT_SPECS, pos: [-4.0, 6.18, -0.6], facing: "down" },
  { id: "l-chambre", type: "light", room: "chambre", level: "upper", style: "disc", order: 0.5, title: "Plafonnier — Chambre", text: "Point lumineux central à LED, lumière chaude et homogène.", specs: LIGHT_SPECS, pos: [0, 6.18, -0.6], facing: "down" },
  { id: "l-suite", type: "light", room: "suite", level: "upper", style: "disc", order: 0.55, title: "Plafonnier — Suite parentale", text: "Plafonnier d’ambiance sur variateur pour la suite.", specs: LIGHT_SPECS, pos: [5.4, 6.18, -0.6], facing: "down" },
  { id: "l-sdb", type: "light", room: "sdb", level: "upper", style: "disc", order: 0.6, title: "Plafonnier — Salle de bains", text: "Luminaire étanche adapté aux pièces humides.", specs: ["Circuit éclairage 16 A", "Indice de protection IP44 min.", "Classe II en volume 2"], pos: [-4.4, 6.18, 2.25], facing: "down" },
  { id: "l-sous-face-1", type: "light", room: "exterieur", level: "upper", style: "soffit", order: 0.66, title: "Spot de sous-face — Terrasse", text: "Spots encastrés dans le porte-à-faux pour mettre en valeur la terrasse.", specs: ["Circuit éclairage extérieur", "Indice IP65", "Commande par détection"], pos: [7.75, 2.97, 2.0], facing: "down" },
  { id: "l-sous-face-2", type: "light", room: "exterieur", level: "upper", style: "soffit", order: 0.7, title: "Spot de sous-face — Terrasse", text: "Spots encastrés dans le porte-à-faux pour mettre en valeur la terrasse.", specs: ["Circuit éclairage extérieur", "Indice IP65", "Commande par détection"], pos: [7.75, 2.97, 0], facing: "down" },
  { id: "l-sous-face-3", type: "light", room: "exterieur", level: "upper", style: "soffit", order: 0.74, title: "Spot de sous-face — Terrasse", text: "Spots encastrés dans le porte-à-faux pour mettre en valeur la terrasse.", specs: ["Circuit éclairage extérieur", "Indice IP65", "Commande par détection"], pos: [7.75, 2.97, -2.0], facing: "down" },
];

/** Circuit group feeding each device. */
export const DEVICE_CIRCUIT: Record<string, string> = {
  "o-salon-1": "prises-salon",
  "o-salon-2": "prises-salon",
  "o-salon-3": "prises-salon",
  "o-cuisine-1": "prises-cuisine",
  "o-cuisine-2": "prises-cuisine",
  "o-cuisine-3": "prises-cuisine",
  "o-chambre-1": "prises-etage",
  "o-chambre-2": "prises-etage",
  "o-suite-1": "prises-etage",
  "o-suite-2": "prises-etage",
  "s-salon": "salon-eclairage",
  "s-cuisine": "cuisine-eclairage",
  "s-chambre": "chambres-eclairage",
  "s-suite": "chambres-eclairage",
  "l-entree": "entree-eclairage",
  "l-spot-1": "salon-eclairage",
  "l-spot-2": "salon-eclairage",
  "l-spot-3": "salon-eclairage",
  "l-spot-4": "salon-eclairage",
  "l-spot-5": "salon-eclairage",
  "l-spot-6": "salon-eclairage",
  "l-susp-1": "cuisine-eclairage",
  "l-susp-2": "cuisine-eclairage",
  "l-susp-3": "cuisine-eclairage",
  "l-table": "table-eclairage",
  "l-borne-1": "allee",
  "l-borne-2": "allee",
  "l-borne-3": "allee",
  "l-palier": "chambres-eclairage",
  "l-chambre": "chambres-eclairage",
  "l-suite": "chambres-eclairage",
  "l-sdb": "sdb-eclairage",
  "l-sous-face-1": "sous-face",
  "l-sous-face-2": "sous-face",
  "l-sous-face-3": "sous-face",
  "x-plaque": "plaque",
  "x-four": "four",
  "x-borne": "borne",
  "x-pac": "pac",
  "x-pv": "pv",
  "x-onduleur": "pv",
  "x-seche": "seche",
};

/** Luminaires commanded by each switch. */
export const SWITCH_LIGHTS: Record<string, string[]> = {
  "s-salon": ["l-spot-1", "l-spot-2", "l-spot-3", "l-spot-4", "l-spot-5", "l-spot-6"],
  "s-cuisine": ["l-susp-1", "l-susp-2", "l-susp-3"],
  "s-chambre": ["l-chambre"],
  "s-suite": ["l-suite"],
};

export const deviceById = (id: string) => DEVICES.find((d) => d.id === id);
export const roomById = (id: string) => ROOMS.find((r) => r.id === id);

/* ------------------------------------------------------------------ */
/* Circuits                                                            */
/* ------------------------------------------------------------------ */

export type Circuit = {
  id: string;
  kind: CircuitKind;
  level: Level; // "upper" circuits move with the upper floor
  /** Distance already travelled by the current when this path starts (m). */
  start: number;
  /** Circuit group (a breaker in the panel): branches of one group light up together. */
  group: string;
  points: V3[];
};

export type CircuitGroup = { id: string; label: string; kind: CircuitKind; upper?: boolean };

/** One entry per protected circuit leaving the distribution board. */
export const GROUPS: CircuitGroup[] = [
  { id: "colonne", label: "Colonne montante vers l’étage", kind: "light" },
  { id: "salon-eclairage", label: "Éclairage — Salon", kind: "light" },
  { id: "entree-eclairage", label: "Éclairage — Entrée", kind: "light" },
  { id: "cuisine-eclairage", label: "Éclairage — Îlot de cuisine", kind: "light" },
  { id: "table-eclairage", label: "Éclairage — Salle à manger", kind: "light" },
  { id: "allee", label: "Éclairage extérieur — Allée", kind: "light" },
  { id: "chambres-eclairage", label: "Éclairage — Chambres & palier", kind: "light", upper: true },
  { id: "sdb-eclairage", label: "Éclairage — Salle de bains", kind: "light", upper: true },
  { id: "sous-face", label: "Éclairage extérieur — Terrasse", kind: "light", upper: true },
  { id: "prises-salon", label: "Prises — Salon", kind: "outlet" },
  { id: "prises-cuisine", label: "Prises — Plan de travail", kind: "outlet" },
  { id: "prises-etage", label: "Prises — Chambres", kind: "outlet", upper: true },
  { id: "plaque", label: "Circuit spécialisé — Plaque de cuisson", kind: "special" },
  { id: "four", label: "Circuit spécialisé — Four", kind: "special" },
  { id: "borne", label: "Circuit spécialisé — Borne de recharge", kind: "special" },
  { id: "pv", label: "Circuit spécialisé — Photovoltaïque", kind: "special" },
  { id: "pac", label: "Circuit spécialisé — Pompe à chaleur", kind: "special" },
  { id: "seche", label: "Circuit spécialisé — Sèche-serviettes", kind: "special", upper: true },
];

export const groupIndex = (id: string) => GROUPS.findIndex((g) => g.id === id);
export const groupById = (id: string) => GROUPS.find((g) => g.id === id);

const C = H.groundCeil - 0.12; // ceiling run, ground floor
const UC = H.upperCeil - 0.12; // ceiling run, upper floor

export const RISER = { x: -5.5, z: 1.33, from: 1.9, to: H.groundCeil };
const UP_START = RISER.to - RISER.from + 0.3;

export const CIRCUITS: Circuit[] = [
  // ---------- Ground floor — lighting
  {
    id: "c-salon-spots",
    group: "salon-eclairage",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[-5.8, 1.9, 1.33], [-5.8, C, 1.33], [-5.8, C, 1.5], [-2, C, 1.5], [-2, C, -2], [0, C, -2], [0, C, 1.5], [2, C, 1.5], [2, C, -2]],
  },
  {
    id: "c-entree",
    group: "entree-eclairage",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[-5.62, 1.9, 1.33], [-5.62, C, 1.33], [-5.62, C, 2.8], [-5.2, C, 2.8]],
  },
  {
    // branch of the living-room lighting circuit going down to its switch
    id: "c-salon-inter",
    group: "salon-eclairage",
    kind: "light",
    level: "ground",
    start: 3.45,
    points: [[-3.5, C, 1.5], [-3.5, C, 1.95], [-3.5, 1.15, 1.95]],
  },
  {
    // branch of the kitchen lighting circuit going down to its switch
    id: "c-cuisine-inter",
    group: "cuisine-eclairage",
    kind: "light",
    level: "ground",
    start: 10.0,
    points: [[3.2, C, 0.9], [3.2, C, -4.12], [3.2, 1.35, -4.12]],
  },
  {
    id: "c-cuisine-susp",
    group: "cuisine-eclairage",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[-5.4, 1.9, 1.33], [-5.4, C, 1.33], [-5.4, C, 0.9], [4.2, C, 0.9], [4.2, C, -1.2], [5.6, C, -1.2]],
  },
  {
    id: "c-table",
    group: "table-eclairage",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[-5.2, 1.9, 1.33], [-5.2, C, 1.33], [-5.2, C, 1.08], [4.9, C, 1.08], [4.9, C, 2.4]],
  },
  {
    id: "c-allee",
    group: "allee",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[-5.0, 0.98, 1.33], [-5.0, -0.06, 1.33], [-5.0, -0.06, 4.4], [-5.0, -0.4, 4.4], [-5.0, -0.4, 5.6], [-3.7, -0.4, 5.6], [-3.7, -0.4, 10.6], [-3.7, 0.1, 10.6]],
  },
  // ---------- Riser feeding the upper floor (ground part)
  {
    id: "c-colonne",
    group: "colonne",
    kind: "light",
    level: "ground",
    start: 0,
    points: [[RISER.x, RISER.from, RISER.z], [RISER.x, RISER.to, RISER.z]],
  },
  // ---------- Ground floor — outlets
  {
    id: "c-prises-salon",
    group: "prises-salon",
    kind: "outlet",
    level: "ground",
    start: 0,
    points: [[-5.25, 0.98, 1.33], [-5.25, -0.05, 1.33], [-5.25, -0.05, 1.0], [-2.4, -0.05, 1.0], [-2.4, -0.05, -4.12], [-2.4, 0.3, -4.12], [1.8, 0.3, -4.12]],
  },
  {
    id: "c-prises-cuisine",
    group: "prises-cuisine",
    kind: "outlet",
    level: "ground",
    start: 0,
    points: [[-4.8, 0.98, 1.33], [-4.8, -0.05, 1.33], [-4.8, -0.05, 0.75], [3.4, -0.05, 0.75], [3.4, -0.05, -4.12], [3.4, 1.1, -4.12], [5.3, 1.1, -4.12]],
  },
  // ---------- Ground floor — specialised
  {
    id: "c-plaque",
    group: "plaque",
    kind: "special",
    level: "ground",
    start: 0,
    points: [[-5.45, 0.98, 1.33], [-5.45, -0.09, 1.33], [-5.45, -0.09, 0.55], [5.3, -0.09, 0.55], [5.3, -0.09, -1.2], [5.3, 0.86, -1.2]],
  },
  {
    id: "c-four",
    group: "four",
    kind: "special",
    level: "ground",
    start: 0,
    points: [[-5.65, 0.98, 1.33], [-5.65, -0.09, 1.33], [-5.65, -0.09, 0.35], [6.15, -0.09, 0.35], [6.15, -0.09, -3.9], [6.15, 1.0, -3.9]],
  },
  {
    id: "c-borne",
    group: "borne",
    kind: "special",
    level: "ground",
    start: 0,
    points: [[-5.85, 0.98, 1.33], [-5.85, -0.09, 1.33], [-6.9, -0.09, 1.33], [-6.9, -0.4, 1.33], [-9.0, -0.4, 1.33], [-9.0, -0.4, 3.5], [-9.0, 0.7, 3.5]],
  },
  {
    id: "c-onduleur",
    group: "pv",
    kind: "special",
    level: "ground",
    start: 0,
    points: [[-5.9, 1.45, 1.33], [-6.06, 1.45, 1.33]],
  },
  {
    id: "c-pv-descente",
    group: "pv",
    kind: "special",
    level: "ground",
    start: 0.2,
    points: [[-6.3, 1.82, 1.33], [-6.3, H.groundCeil, 1.33]],
  },
  {
    id: "c-pac",
    group: "pac",
    kind: "special",
    level: "ground",
    start: 0,
    points: [[-5.05, 0.98, 1.33], [-5.05, -0.11, 1.33], [-5.05, -0.11, -3.7], [2.6, -0.11, -3.7], [2.6, -0.11, -4.5], [2.6, -0.4, -4.5], [2.6, -0.4, -5.7], [2.6, 0.1, -5.7]],
  },
  // ---------- Upper floor (moves with the floor)
  {
    id: "c-chambres",
    group: "chambres-eclairage",
    kind: "light",
    level: "upper",
    start: UP_START,
    points: [[-5.5, 3.3, 1.33], [-5.5, UC, 1.33], [-4.0, UC, 1.33], [-4.0, UC, -0.6], [5.4, UC, -0.6]],
  },
  {
    id: "c-sdb",
    group: "sdb-eclairage",
    kind: "light",
    level: "upper",
    start: UP_START,
    points: [[-5.3, 3.3, 1.33], [-5.3, UC, 1.33], [-5.3, UC, 2.25], [-4.4, UC, 2.25]],
  },
  {
    id: "c-inter-chambre",
    group: "chambres-eclairage",
    kind: "light",
    level: "upper",
    start: UP_START,
    points: [[-5.1, 3.3, 1.33], [-5.1, UC - 0.18, 1.33], [-2.5, UC - 0.18, 1.33], [-2.5, UC - 0.18, -2.6], [-2.5, 4.4, -2.6]],
  },
  {
    id: "c-inter-suite",
    group: "chambres-eclairage",
    kind: "light",
    level: "upper",
    start: UP_START,
    points: [[-4.9, 3.3, 1.33], [-4.9, UC - 0.3, 1.33], [2.5, UC - 0.3, 1.33], [2.5, UC - 0.3, -2.6], [2.5, 4.4, -2.6]],
  },
  {
    id: "c-sous-face",
    group: "sous-face",
    kind: "light",
    level: "upper",
    start: UP_START,
    points: [[-5.7, 3.15, 1.33], [-5.7, 3.15, 2.8], [7.75, 3.15, 2.8], [7.75, 3.15, -2.0]],
  },
  {
    id: "c-prises-etage",
    group: "prises-etage",
    kind: "outlet",
    level: "upper",
    start: UP_START,
    points: [[-4.7, 3.3, 1.25], [-4.7, 3.6, 1.25], [-2.5, 3.6, 1.25], [-2.5, 3.6, -4.12], [6.7, 3.6, -4.12]],
  },
  {
    id: "c-seche",
    group: "seche",
    kind: "special",
    level: "upper",
    start: UP_START,
    points: [[-6.0, 3.3, 1.33], [-6.0, 3.5, 1.33], [-6.0, 3.5, 2.4], [-6.6, 3.5, 2.4], [-6.6, 4.0, 2.4]],
  },
];

export const CIRCUIT_COLORS: Record<CircuitKind, string> = {
  light: "#F2B705",
  outlet: "#3FA9F5",
  special: "#FF6A2B",
};

export const CIRCUIT_LABELS: Record<CircuitKind, string> = {
  light: "Éclairage",
  outlet: "Prises",
  special: "Circuits spécialisés",
};

function pathLength(points: V3[]) {
  let l = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    l += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  }
  return l;
}

/** Furthest distance reached by the current (used to drive the reveal). */
export const CIRCUIT_MAX = Math.max(...CIRCUITS.map((c) => c.start + pathLength(c.points))) + 0.5;
