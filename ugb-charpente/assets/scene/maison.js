import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { PARAMS as P } from './parametres.js';
import { alea, geoPoutre, piece, groupe, geoPrismeZY, bandeZY, geoDemiTube, geoTuile, instances } from './outils.js';

/*
 * Maison de plain-pied — géométrie procédurale.
 * Repère : X le long du faîtage, Z perpendiculaire (façade sud = +Z), Y vers le haut.
 */

// ---------- Grandeurs dérivées ----------
const th = THREE.MathUtils.degToRad(P.pente), tan = Math.tan(th), cos = Math.cos(th), sin = Math.sin(th);
const L = P.longueur, W = P.largeur, hm = P.hauteurMurs, em = P.epaisseurMur;
const Lr = L + 2 * P.debordRive;                          // longueur de toit
const zSab = W / 2 - 0.15;                                // axe des sablières
const Yr = hm + P.sectionSabliere[1] + zSab * tan;        // faîtage théorique (sous-face des chevrons)
const Ls = zSab / cos;                                    // rampant faîtage → sablière
const Le = (W / 2 + P.debordEgout) / cos;                 // rampant faîtage → égout
const [chL, chH] = P.sectionChevron, [paL, paH] = P.sectionPanne;
const z0Chevron = chH * tan;
/** Hauteur du plan de toiture à l'abscisse z, décalé de `off` (perpendiculairement) vers le bas. */
const yPlan = (z, off = 0) => Yr - Math.abs(z) * tan - off / cos;
/** Point du plan (z, y) à la distance `s` du faîtage le long du rampant, `off` sous le plan. */
const ptRampant = (s, off) => [s * cos - off * sin, Yr - s * sin - off * cos];

const COTES = [['sud', 1], ['nord', -1]];
const num = (i) => String(i + 1).padStart(2, '0');

/** Repère local d'un pan : x le long du faîtage, z en descendant le rampant, y normal au toit. */
function cadrePan(nom, cote, categorie) {
    const g = groupe(nom, categorie);
    g.position.set(0, Yr, 0);
    g.rotation.order = 'YXZ';
    g.rotation.set(th, cote > 0 ? 0 : Math.PI, 0);
    return g;
}

// Abscisses des chevrons (identiques sur les deux pans)
const nbChevrons = Math.round((Lr - chL) / P.entraxeChevrons) + 1;
const xChevrons = Array.from({ length: nbChevrons }, (_, i) => -Lr / 2 + chL / 2 + i * (Lr - chL) / (nbChevrons - 1));

// Rangs de tuiles : arête haute de chaque rang, de l'égout (0) au faîtage
const T = P.tuile;
const pureau = (Le - (T.longueur - 0.04) - 0.06) / (T.rangs - 1);
const zHautRang = (i) => Le + 0.04 - T.longueur - i * pureau;
const inclinaisonTuile = Math.asin(0.024 / pureau);
const yLiteau = chH + 0.004 + 0.025;          // dessus de l'écran + contre-liteau
const yTuile = yLiteau + 0.032;

// Fenêtre intégrée au bardage : calée sur le calepinage des lames
const B = P.bardage, pasLame = B.largeurLame + B.jeu;
const fenBardage = { x0: B.debut + 10 * pasLame - B.jeu / 2, x1: B.debut + 22 * pasLame - B.jeu / 2, y0: 0.9, y1: 2.2 };
const finBardage = B.debut + B.nombreLames * pasLame - B.jeu;

const SEUIL = 0.18; // niveau du sol fini (dessus de dalle, terrasse)

// =====================================================================
// 1. Structure : murs, menuiseries, dalle
// =====================================================================
function fenetre(nom, w, h, vantaux, M) {
    const g = groupe(nom, 'structure');
    const c = 0.06, p = 0.07, cadre = [];
    const barre = (bw, bh, x, y) => { const b = new THREE.BoxGeometry(bw, bh, p); b.translate(x, y, 0); cadre.push(b); };
    barre(w, c, 0, h / 2 - c / 2); barre(w, c, 0, -h / 2 + c / 2);
    barre(c, h, -w / 2 + c / 2, 0); barre(c, h, w / 2 - c / 2, 0);
    for (let i = 1; i < vantaux; i++) barre(c, h, -w / 2 + (w / vantaux) * i, 0);
    g.add(piece(`${nom}_cadre`, mergeGeometries(cadre), M.alu, 'structure'));
    const v = piece(`${nom}_vitrage`, new THREE.BoxGeometry(w - c, h - c, 0.012), M.verre, 'structure', false);
    g.add(v);
    return g;
}

function mur(nom, contour, ouvertures, M) {
    const forme = new THREE.Shape(contour.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const o of ouvertures) {
        const t = new THREE.Path();
        t.moveTo(o.x0, o.y0); t.lineTo(o.x0, o.y1); t.lineTo(o.x1, o.y1); t.lineTo(o.x1, o.y0); t.closePath();
        forme.holes.push(t);
    }
    const g = groupe(nom, 'structure');
    g.add(piece(`${nom}_maconnerie`, new THREE.ExtrudeGeometry(forme, { depth: em, bevelEnabled: false }), M.enduit, 'structure'));
    ouvertures.forEach((o, i) => {
        const w = o.x1 - o.x0, h = o.y1 - o.y0;
        let m;
        if (o.porte) {
            m = groupe(`${nom}_porte`, 'structure');
            m.add(piece(`${nom}_porte_panneau`, new THREE.BoxGeometry(w, h, 0.06), M.alu, 'structure'));
        } else {
            m = fenetre(`${nom}_${o.nom || 'fenetre_' + (i + 1)}`, w, h, o.vantaux || 1, M);
        }
        m.position.set((o.x0 + o.x1) / 2, (o.y0 + o.y1) / 2, em - 0.1);
        g.add(m);
    });
    return g;
}

function construireStructure(M) {
    const g = groupe('structure', 'structure');
    const murs = groupe('murs', 'structure');
    const xl = L / 2 - em, rect = [[-xl, 0], [xl, 0], [xl, hm], [-xl, hm]];
    const yCoin = yPlan(W / 2) - 0.03;
    const pignon = [[-W / 2, 0], [W / 2, 0], [W / 2, yCoin], [0, Yr - 0.03], [-W / 2, yCoin]];

    const sud = mur('mur_sud', rect, [
        { nom: 'baie_vitree', x0: 0.6, x1: 4.2, y0: SEUIL, y1: 2.3, vantaux: 2 },
        { nom: 'fenetre_bardage', ...fenBardage, vantaux: 2 },
    ], M);
    sud.position.z = W / 2 - em;

    const nord = mur('mur_nord', rect, [
        { x0: -4.2, x1: -2.6, y0: 0.9, y1: 2.2, vantaux: 2 },
        { x0: -0.5, x1: 0.5, y0: 1.3, y1: 2.2 },
        { x0: 3.0, x1: 4.2, y0: 1.0, y1: 2.2 },
    ], M);
    nord.position.z = -(W / 2 - em); nord.rotation.y = Math.PI;

    const ouest = mur('pignon_ouest', pignon, [{ x0: -0.9, x1: 0.9, y0: 0.5, y1: 2.2, vantaux: 2 }], M);
    ouest.position.x = -(L / 2 - em); ouest.rotation.y = -Math.PI / 2;

    const est = mur('pignon_est', pignon, [{ x0: -0.9, x1: 0.1, y0: SEUIL, y1: 2.25, porte: true }], M);
    est.position.x = L / 2 - em; est.rotation.y = Math.PI / 2;

    murs.add(sud, nord, ouest, est);
    g.add(murs);

    const dalle = piece('dalle', new THREE.BoxGeometry(L + 0.04, SEUIL, W + 0.04), M.beton, 'structure');
    dalle.position.y = SEUIL / 2;
    const plafond = piece('plafond', new THREE.BoxGeometry(L - 2 * em, 0.05, W - 2 * em), M.plafond, 'structure', false);
    plafond.position.y = hm - 0.025;
    g.add(dalle, plafond);
    return g;
}

// =====================================================================
// 2. Charpente traditionnelle : fermes, pannes, chevrons, renforts
// =====================================================================
function construireCharpente(M) {
    const g = groupe('charpente', 'charpente');
    const bois = M.boisCharpente, cat = 'charpente';
    const [arL, arH] = P.sectionArbaletrier, [enL, enH] = P.sectionEntrait, po = P.sectionPoincon;
    const yFaitiereHaut = Yr - (paL / 2) * tan, yFaitiereBas = yFaitiereHaut - paH;
    const sPannes = Array.from({ length: P.pannesIntermediairesParPan }, (_, k) => Ls * (k + 1) / (P.pannesIntermediairesParPan + 1));

    // --- Fermes ---
    const fermes = groupe('fermes', cat);
    const zEntrait = zSab - P.sectionSabliere[0] / 2 - 0.01;
    const oH = paH, oB = paH + arH, yPied = hm + enH / 2;
    const zPiedH = (Yr - oH / cos - yPied) / tan, zPiedB = (Yr - oB / cos - yPied) / tan;
    const plaques = (dims, pos, rx = 0) => {
        const gs = [-1, 1].map((s) => {
            const b = new THREE.BoxGeometry(0.006, dims[0], dims[1]);
            b.rotateX(rx); b.translate(s * (arL / 2 + 0.003), pos[1], pos[0]);
            return b;
        });
        return mergeGeometries(gs);
    };

    for (let i = 0; i < P.nombreFermes; i++) {
        const f = groupe(`ferme_${num(i)}`, cat);
        f.position.x = -L / 2 + (L / (P.nombreFermes + 1)) * (i + 1);

        const entrait = piece('entrait', geoPoutre(enL, enH, 2 * zEntrait, 'z'), bois, cat);
        entrait.position.y = hm + enH / 2;
        const yP0 = hm + enH - 0.04;
        const poincon = piece('poincon', geoPoutre(po, yFaitiereBas - yP0, po, 'y'), bois, cat);
        poincon.position.y = (yP0 + yFaitiereBas) / 2;
        f.add(entrait, poincon);

        for (const [nom, c] of COTES) {
            const zc = po / 2;
            f.add(piece(`arbaletrier_${nom}`, geoPrismeZY([
                [c * zc, yPlan(zc, oH)], [c * zPiedH, yPied], [c * zPiedB, yPied], [c * zc, yPlan(zc, oB)],
            ], arL, c * -th), bois, cat));

            const zAppui = zPiedB * 0.52;
            const cf = bandeZY(c * zc, hm + enH + 0.35, c * zAppui, yPlan(zAppui, oB), 0.09, 0.05);
            f.add(piece(`contrefiche_${nom}`, geoPrismeZY(cf.points, 0.08, cf.angle), bois, cat));

            sPannes.forEach((s, k) => {
                const pts = [ptRampant(s + paL / 2, 0.10), ptRampant(s + paL / 2, oH), ptRampant(s + paL / 2 + 0.3, oH), ptRampant(s + paL / 2 + 0.2, 0.10)]
                    .map(([z, y]) => [c * z, y]);
                f.add(piece(`echantignolle_${nom}_${k + 1}`, geoPrismeZY(pts, 0.08, c * -th), bois, cat));
            });

            f.add(piece(`assemblage_pied_${nom}`, plaques([0.2, 0.42], [c * ((zPiedH + zPiedB) / 2 - 0.08), yPied + 0.07], c * th), M.acier, cat));
        }
        f.add(piece('assemblage_poincon_entrait', plaques([0.36, 0.09], [0, hm + enH + 0.02]), M.acier, cat));
        f.add(piece('assemblage_tete_poincon', plaques([0.2, 0.46], [0, yPlan(po / 2, oH) - 0.16]), M.acier, cat));
        fermes.add(f);
    }

    // --- Pannes ---
    const pannes = groupe('pannes', cat);
    const faitiere = piece('panne_faitiere', geoPoutre(Lr, paH, paL, 'x'), bois, cat);
    faitiere.position.y = yFaitiereHaut - paH / 2;
    pannes.add(faitiere);
    const [saL, saH] = P.sectionSabliere;
    for (const [nom, c] of COTES) {
        const sab = piece(`panne_sabliere_${nom}`, geoPoutre(Lr, saH, saL, 'x'), bois, cat);
        sab.position.set(0, hm + saH / 2, c * zSab);
        pannes.add(sab);
        const cadre = cadrePan(`pannes_intermediaires_${nom}`, c, cat);
        sPannes.forEach((s, k) => {
            const p = piece(`panne_intermediaire_${nom}_${k + 1}`, geoPoutre(Lr, paH, paL, 'x'), bois, cat);
            p.position.set(0, -paH / 2, s);
            cadre.add(p);
        });
        pannes.add(cadre);
    }

    // --- Chevrons + habillage de rive et d'égout ---
    const chevrons = groupe('chevrons', cat);
    const lgChevron = Le - z0Chevron, geoChevron = geoPoutre(chL, chH, lgChevron, 'z');
    const habillage = groupe('habillage_bois', cat);
    for (const [nom, c] of COTES) {
        const cadre = cadrePan(`chevrons_${nom}`, c, cat);
        xChevrons.forEach((x, i) => {
            const ch = piece(`chevron_${nom}_${num(i)}`, geoChevron, bois, cat);
            ch.position.set(x, chH / 2, z0Chevron + lgChevron / 2);
            cadre.add(ch);
        });
        chevrons.add(cadre);

        const cadreH = cadrePan(`habillage_${nom}`, c, cat);
        const bandeau = piece(`bandeau_egout_${nom}`, geoPoutre(Lr + 0.05, 0.17, 0.022, 'x'), bois, cat);
        bandeau.position.set(0, 0.035, Le + 0.011);
        cadreH.add(bandeau);
        [-1, 1].forEach((s, k) => {
            const pr = piece(`planche_rive_${nom}_${k + 1}`, geoPoutre(0.025, 0.19, lgChevron + 0.022, 'z'), bois, cat);
            pr.position.set(s * (Lr / 2 + 0.0125), 0.025, z0Chevron + (lgChevron + 0.022) / 2);
            cadreH.add(pr);
        });
        habillage.add(cadreH);
    }

    // --- Renforts : liens de faîtage (contreventement longitudinal) ---
    const renforts = groupe('renforts', cat);
    const dx = 0.78, dy = 0.78, lg = Math.hypot(dx, dy) + 0.1, geoLien = geoPoutre(lg, 0.08, 0.08, 'x');
    for (let i = 0; i < P.nombreFermes; i++) {
        const x0 = -L / 2 + (L / (P.nombreFermes + 1)) * (i + 1);
        [-1, 1].forEach((s, k) => {
            const lien = piece(`lien_faitage_${num(i)}_${k + 1}`, geoLien, bois, cat);
            lien.position.set(x0 + s * (po / 2 + dx / 2), yFaitiereBas - dy / 2, 0);
            lien.rotation.z = s > 0 ? Math.atan2(dy, dx) : Math.PI - Math.atan2(dy, dx);
            renforts.add(lien);
        });
    }

    g.add(fermes, pannes, chevrons, renforts, habillage);
    return g;
}

// =====================================================================
// 3. Couverture : écran, contre-liteaux, liteaux, tuiles, faîtage, rives
// =====================================================================
function decoupe(total, parts) {
    // Répartit `total` éléments en `parts` lots contigus : renvoie [debut, fin[
    const lots = [];
    for (let k = 0; k < parts; k++) lots.push([Math.round(total * k / parts), Math.round(total * (k + 1) / parts)]);
    return lots;
}

function construireCouverture(M, qualite) {
    const g = groupe('couverture', 'couverture');
    const cat = 'couverture', r = alea(99);
    const colonnes = Math.round(Lr / T.largeur), lgT = Lr / colonnes;
    const geoT = geoTuile(lgT, T.longueur, qualite.tuilesDetaillees);
    const lotsC = decoupe(colonnes, P.lotsTuiles.colonnes), lotsR = decoupe(T.rangs, P.lotsTuiles.rangs);
    const lgContre = Le - z0Chevron, geoContre = new THREE.BoxGeometry(0.045, 0.025, lgContre);
    const geoRive = mergeGeometries([
        new THREE.BoxGeometry(0.135, 0.014, T.longueur).translate(-0.0225, 0.042, T.longueur / 2),
        new THREE.BoxGeometry(0.014, 0.135, T.longueur).translate(0.038, -0.0325, T.longueur / 2),
    ]);

    for (const [nom, c] of COTES) {
        const pan = cadrePan(`couverture_${nom}`, c, cat);

        const ecran = piece(`ecran_sous_toiture_${nom}`, new THREE.BoxGeometry(Lr, 0.004, Le - 0.03), M.ecran, cat, false);
        ecran.position.set(0, chH + 0.002, (Le - 0.03) / 2);
        pan.add(ecran);

        pan.add(instances(`contre_liteaux_${nom}`, geoContre, M.boisLiteau,
            xChevrons.map((x) => ({ p: new THREE.Vector3(x, chH + 0.004 + 0.0125, z0Chevron + lgContre / 2) })), cat, false));

        lotsR.forEach(([r0, r1], R) => {
            // Liteaux : un lot par zone de rangs, découpés en tronçons alignés sur les lots de tuiles
            const liste = [];
            for (let i = r0; i < r1; i++) {
                for (const [c0, c1] of lotsC) {
                    const lgSeg = (c1 - c0) * lgT;
                    liste.push({ p: new THREE.Vector3(-Lr / 2 + c0 * lgT + lgSeg / 2, yLiteau + 0.016, zHautRang(i) + 0.03), sx: lgSeg });
                }
            }
            pan.add(instances(`liteaux_${nom}_lot_${R + 1}`, new THREE.BoxGeometry(1, 0.032, 0.04), M.boisLiteau, liste, cat, false));

            // Tuiles : un InstancedMesh par lot (zone de rangs × zone de colonnes)
            lotsC.forEach(([c0, c1], C) => {
                const tuiles = [];
                for (let i = r0; i < r1; i++) {
                    for (let j = c0; j < c1; j++) {
                        tuiles.push({ p: new THREE.Vector3(-Lr / 2 + (j + 0.5) * lgT, yTuile, zHautRang(i)), rx: -inclinaisonTuile, teinte: 0.8 + 0.2 * r() });
                    }
                }
                const lot = instances(`tuiles_${nom}_lot_r${R + 1}_c${C + 1}`, geoT, M.tuile, tuiles, cat);
                lot.userData.lot = { rang: R, colonne: C, pan: nom };
                pan.add(lot);
            });
        });

        const rives = [];
        for (let i = 0; i < T.rangs; i++) {
            for (const s of [-1, 1]) rives.push({ p: new THREE.Vector3(s * Lr / 2, yTuile, zHautRang(i)), rx: -inclinaisonTuile, sx: s, teinte: 0.85 });
        }
        pan.add(instances(`rives_${nom}`, geoRive, M.tuile, rives, cat));
        g.add(pan);
    }

    // Faîtage
    const nF = Math.round(Lr / 0.4), pasF = Lr / nF;
    const faitage = instances('faitage', geoDemiTube(0.18, pasF + 0.03, qualite.tuilesDetaillees ? 10 : 6, true, true), M.tuile,
        Array.from({ length: nF }, (_, i) => ({ p: new THREE.Vector3(-Lr / 2 + (i + 0.5) * pasF, Yr + 0.07, 0), teinte: 0.8 + 0.2 * r() })), cat);
    g.add(faitage);
    return g;
}

// =====================================================================
// 4. Zinguerie : gouttières et descentes d'eaux pluviales
// =====================================================================
function construireZinguerie(M, qualite) {
    const g = groupe('zinguerie', 'zinguerie');
    const cat = 'zinguerie', rayon = 0.08;
    const sBas = Le + 0.04, yBasTuile = yTuile + T.longueur * Math.sin(inclinaisonTuile);
    const zNez = sBas * cos + yBasTuile * sin, yNez = Yr - sBas * sin + yBasTuile * cos;
    const zG = zNez + 0.035, yG = yNez - 0.045, zMur = W / 2;

    COTES.forEach(([nom, c], k) => {
        const gout = piece(`gouttiere_${nom}`, geoDemiTube(rayon, Lr + 0.04, qualite.tuilesDetaillees ? 14 : 8, false, true), M.zinc, cat);
        gout.position.set(0, yG, c * zG);
        g.add(gout);

        const x = (k === 0 ? 1 : -1) * (L / 2 - 0.35), yN = yG - rayon;
        const trace = [
            [yN + 0.02, zG], [yN - 0.1, zG], [yN - 0.26, zG - 0.1], [yN - 0.5, zMur + 0.16],
            [yN - 0.66, zMur + 0.065], [yN - 0.85, zMur + 0.055], [1.4, zMur + 0.055], [0.8, zMur + 0.055], [SEUIL, zMur + 0.055],
        ].map(([y, z]) => new THREE.Vector3(x, y, c * z));
        const courbe = new THREE.CatmullRomCurve3(trace, false, 'centripetal');
        const d = groupe(`descente_${nom}`, cat);
        d.add(piece(`descente_${nom}_tuyau`, new THREE.TubeGeometry(courbe, qualite.tuilesDetaillees ? 48 : 28, 0.04, qualite.tuilesDetaillees ? 10 : 6), M.zinc, cat));
        const colliers = [1.25, 0.4].map((y) => new THREE.CylinderGeometry(0.047, 0.047, 0.03, 10).translate(x, y, c * (zMur + 0.055)));
        colliers.push(new THREE.CylinderGeometry(0.05, 0.062, 0.1, 10).translate(x, yN - 0.03, c * zG));
        d.add(piece(`descente_${nom}_colliers`, mergeGeometries(colliers), M.zinc, cat));
        d.userData.trace = trace;                 // réutilisé plus tard pour le parcours de l'eau
        g.add(d);
    });
    return g;
}

// =====================================================================
// 5. Bardage bois sur ossature secondaire (façade sud, partie gauche)
// =====================================================================
function construireBardage(M) {
    const g = groupe('bardage', 'bardage');
    const cat = 'bardage', z = W / 2, F = fenBardage;
    const eT = 0.022, zV = z + 0.003 + eT / 2, zH = zV + eT, zL = zH + eT / 2 + 0.0105;

    const forme = new THREE.Shape();
    forme.moveTo(B.debut, B.bas); forme.lineTo(finBardage, B.bas); forme.lineTo(finBardage, B.haut); forme.lineTo(B.debut, B.haut); forme.closePath();
    const trou = new THREE.Path();
    trou.moveTo(F.x0, F.y0); trou.lineTo(F.x0, F.y1); trou.lineTo(F.x1, F.y1); trou.lineTo(F.x1, F.y0); trou.closePath();
    forme.holes.push(trou);
    const pp = piece('pare_pluie', new THREE.ShapeGeometry(forme), M.parePluie, cat, false);
    pp.position.z = z + 0.002;
    g.add(pp);

    // Ossature secondaire : contre-lattes verticales + tasseaux horizontaux (double lattage ventilé)
    const oss = groupe('ossature_secondaire', cat);
    const dansFenX = (x) => x > F.x0 - 0.03 && x < F.x1 + 0.03, dansFenY = (y) => y > F.y0 - 0.03 && y < F.y1 + 0.03;
    const tasseau = (nom, lx, ly, x, y, zz) => {
        const t = piece(nom, geoPoutre(lx, ly, eT, lx > ly ? 'x' : 'y'), M.boisLiteau, cat, false);
        t.position.set(x, y, zz); oss.add(t);
    };
    const nV = Math.round((finBardage - B.debut - 0.1) / 0.6);
    for (let i = 0; i <= nV; i++) {
        const x = B.debut + 0.05 + i * (finBardage - B.debut - 0.1) / nV, nom = `contre_latte_${num(i)}`;
        if (dansFenX(x)) {
            tasseau(`${nom}_bas`, 0.045, F.y0 - 0.04 - B.bas, x, (B.bas + F.y0 - 0.04) / 2, zV);
            tasseau(`${nom}_haut`, 0.045, B.haut - F.y1 - 0.04, x, (B.haut + F.y1 + 0.04) / 2, zV);
        } else tasseau(nom, 0.045, B.haut - B.bas, x, (B.bas + B.haut) / 2, zV);
    }
    [0.2, 0.78, 1.36, 1.94, 2.54].forEach((y, i) => {
        const nom = `tasseau_${num(i)}`;
        if (dansFenY(y)) {
            tasseau(`${nom}_gauche`, F.x0 - 0.04 - B.debut, 0.045, (B.debut + F.x0 - 0.04) / 2, y, zH);
            tasseau(`${nom}_droite`, finBardage - F.x1 - 0.04, 0.045, (finBardage + F.x1 + 0.04) / 2, y, zH);
        } else tasseau(nom, finBardage - B.debut, 0.045, (B.debut + finBardage) / 2, y, zH);
    });
    g.add(oss);

    // Lames verticales (objets séparés)
    const lames = groupe('lames', cat);
    const lame = (nom, x, y0, y1) => {
        const l = piece(nom, geoPoutre(B.largeurLame, y1 - y0, 0.021, 'y'), M.boisBardage, cat);
        l.position.set(x, (y0 + y1) / 2, zL); lames.add(l);
    };
    for (let i = 0; i < B.nombreLames; i++) {
        const x = B.debut + i * pasLame + B.largeurLame / 2, nom = `lame_${num(i)}`;
        if (x > F.x0 && x < F.x1) { lame(`${nom}_bas`, x, B.bas, F.y0 - 0.03); lame(`${nom}_haut`, x, F.y1 + 0.03, B.haut); }
        else lame(nom, x, B.bas, B.haut);
    }
    g.add(lames);

    // Habillages métalliques : cadre de fenêtre et profils d'angle
    const p = 0.075, e = 0.03, hab = [];
    const boite = (lx, ly, x, y) => hab.push(new THREE.BoxGeometry(lx, ly, p).translate(x, y, z + p / 2));
    boite(F.x1 - F.x0 + 2 * e, e, (F.x0 + F.x1) / 2, F.y0 - e / 2); boite(F.x1 - F.x0 + 2 * e, e, (F.x0 + F.x1) / 2, F.y1 + e / 2);
    boite(e, F.y1 - F.y0, F.x0 - e / 2, (F.y0 + F.y1) / 2); boite(e, F.y1 - F.y0, F.x1 + e / 2, (F.y0 + F.y1) / 2);
    boite(e, B.haut - B.bas, B.debut - e / 2, (B.bas + B.haut) / 2); boite(e, B.haut - B.bas, finBardage + e / 2, (B.bas + B.haut) / 2);
    g.add(piece('habillages_metalliques', mergeGeometries(hab), M.alu, cat));
    return g;
}

// =====================================================================
// 6. Terrasse bois
// =====================================================================
function construireTerrasse(M) {
    const g = groupe('terrasse', 'terrasse');
    const x0 = -0.4, lx = 6, z0 = W / 2 + 0.02, prof = 3.2, pas = 0.152, n = Math.floor(prof / pas), r = alea(5);
    const lames = instances('terrasse_lames', geoPoutre(lx, 0.028, 0.14, 'x'), M.boisTerrasse,
        Array.from({ length: n }, (_, i) => ({ p: new THREE.Vector3(x0 + lx / 2, SEUIL - 0.014, z0 + 0.07 + i * pas), teinte: 0.82 + 0.18 * r() })), 'terrasse');
    const lamb = [];
    for (let i = 0; i <= 6; i++) lamb.push(new THREE.BoxGeometry(0.06, SEUIL - 0.03, n * pas).translate(x0 + 0.05 + i * (lx - 0.1) / 6, (SEUIL - 0.03) / 2, z0 + n * pas / 2));
    g.add(lames, piece('terrasse_lambourdes', mergeGeometries(lamb), M.boisLiteau, 'terrasse'));
    return g;
}

// =====================================================================
// 7. Abri bois / carport
// =====================================================================
function construireAbri(M) {
    const g = groupe('abri', 'abri');
    const cat = 'abri', bois = M.boisCharpente;
    const xA = L / 2 + 1.0, xB = xA + 3.4, zs = [-2.9, -0.2, 2.5], hA = 2.45, hB = 2.15, sol = 0.06;
    const dalle = piece('abri_dalle', new THREE.BoxGeometry(xB - xA + 0.5, sol, 6.0), M.beton, cat);
    dalle.position.set((xA + xB) / 2, sol / 2, -0.2);
    g.add(dalle);

    let n = 0;
    [[xA, hA], [xB, hB]].forEach(([x, h], k) => {
        zs.forEach((zp, j) => {
            const po = piece(`abri_poteau_${num(n++)}`, geoPoutre(0.14, h - sol, 0.14, 'y'), bois, cat);
            po.position.set(x, sol + (h - sol) / 2, zp);
            g.add(po);
            // Jambes de force vers les poteaux voisins
            for (const s of [-1, 1]) {
                if ((j === 0 && s < 0) || (j === zs.length - 1 && s > 0)) continue;
                const b = bandeZY(zp + s * 0.07, h - 0.55, zp + s * 0.55, h + 0.02, 0.07, 0.04);
                const jf = piece(`abri_jambe_de_force_${k + 1}_${j + 1}_${s > 0 ? 'b' : 'a'}`, geoPrismeZY(b.points, 0.07, b.angle), bois, cat);
                jf.position.x = x;
                g.add(jf);
            }
        });
        const poutre = piece(`abri_poutre_${k + 1}`, geoPoutre(0.09, 0.2, 5.9, 'z'), bois, cat);
        poutre.position.set(x, h + 0.1, -0.2);
        g.add(poutre);
    });

    const beta = Math.atan2(hA - hB, xB - xA);
    const toit = groupe('abri_toiture', cat);
    toit.position.set((xA + xB) / 2, (hA + hB) / 2 + 0.2, -0.2);
    toit.rotation.z = -beta;
    const geoCh = geoPoutre(xB - xA + 0.8, 0.14, 0.06, 'x');
    for (let i = 0; i < 11; i++) {
        const ch = piece(`abri_chevron_${num(i)}`, geoCh, bois, cat);
        ch.position.set(0, 0.07, -2.85 + i * 0.57);
        toit.add(ch);
    }
    const couv = piece('abri_couverture', new THREE.BoxGeometry(xB - xA + 0.9, 0.035, 6.3), M.bacAcier, cat);
    couv.position.y = 0.14 + 0.0175;
    toit.add(couv);
    g.add(toit);
    return g;
}

// =====================================================================
export const ETAPES = [
    ['Murs et menuiseries', construireStructure],
    ['Charpente traditionnelle', construireCharpente],
    ['Couverture', construireCouverture],
    ['Zinguerie', construireZinguerie],
    ['Bardage bois', construireBardage],
    ['Terrasse', construireTerrasse],
    ['Abri bois', construireAbri],
];

export const DIMENSIONS = { L, W, Lr, Yr, hm, hauteurFaitage: Yr + 0.25 };
