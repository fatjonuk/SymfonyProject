// Paramètres de la maison (mètres, degrés). Tout est modifiable ici.
export const PARAMS = {
    longueur: 12,          // emprise le long du faîtage (axe X)
    largeur: 9,            // emprise perpendiculaire au faîtage (axe Z)
    hauteurMurs: 2.7,
    epaisseurMur: 0.3,
    pente: 35,             // degrés
    debordEgout: 0.5,      // débord de toit côté gouttières
    debordRive: 0.4,       // débord de toit côté pignons

    // Charpente traditionnelle
    nombreFermes: 3,
    pannesIntermediairesParPan: 2,
    entraxeChevrons: 0.5,
    sectionChevron: [0.07, 0.09],        // largeur, hauteur
    sectionPanne: [0.10, 0.22],
    sectionSabliere: [0.12, 0.12],
    sectionArbaletrier: [0.10, 0.22],
    sectionEntrait: [0.10, 0.24],
    sectionPoincon: 0.12,

    // Couverture
    tuile: { largeur: 0.30, longueur: 0.45, rangs: 16 },
    lotsTuiles: { colonnes: 4, rangs: 4 }, // découpage de chaque pan en lots animables

    // Bardage (façade sud, partie gauche)
    bardage: { debut: -6.0, largeurLame: 0.144, jeu: 0.008, nombreLames: 31, bas: 0.12, haut: 2.62 },
};
