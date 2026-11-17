import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/*
 * Timeline pilotée uniquement par le scroll (scrub), entièrement réversible.
 * L'unité de temps de la timeline est le « pourcentage de progression » du cahier des charges :
 * phase 1 = 0–20, phase 2 = 20–40, phase 3 = 40–65 (les phases 4 et 5 iront jusqu'à 100).
 */
export const PHASES = [
    { id: 1, debut: 0, fin: 20 },
    { id: 2, debut: 20, fin: 40 },
    { id: 3, debut: 40, fin: 65 },
];
export const FIN = 65;
const JAUNE = 0xF2B705;

/** Numéro de phase correspondant à une progression (en %). */
export const phaseDe = (p) => (PHASES.find((f) => p < f.fin) || PHASES[PHASES.length - 1]).id;

/** Donne à un groupe ses propres matériaux (clones) pour pouvoir le mettre en surbrillance seul. */
function materiauxSurbrillance(groupe) {
    const clones = new Map();
    groupe.traverse((o) => {
        if (!o.isMesh) return;
        if (!clones.has(o.material)) {
            const m = o.material.clone();
            m.emissive = new THREE.Color(JAUNE);
            m.emissiveIntensity = 0;
            clones.set(o.material, m);
        }
        o.material = clones.get(o.material);
    });
    return [...clones.values()];
}

export function creerAnimation(app, { declencheur, textes, reduit = false, surProgression = () => {} }) {
    const { camera, groupes } = app;
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    tl.to({}, { duration: FIN }, 0); // fixe la durée totale

    // ------------------------------------------------------------------
    // Caméra : orbite autour d'une cible (azimut, élévation, distance relative au cadrage)
    // ------------------------------------------------------------------
    const cam = { az: 26, el: 14, k: 1, tx: 2.2, ty: 2.0, tz: 0.5 };
    function appliquerCamera() {
        const d = app.distanceCadrage() * cam.k, az = THREE.MathUtils.degToRad(cam.az), el = THREE.MathUtils.degToRad(cam.el);
        camera.position.set(cam.tx + d * Math.cos(el) * Math.sin(az), cam.ty + d * Math.sin(el), cam.tz + d * Math.cos(el) * Math.cos(az));
        camera.lookAt(cam.tx, cam.ty, cam.tz);
    }

    // ------------------------------------------------------------------
    // Inventaire des pièces animées
    // ------------------------------------------------------------------
    const couverture = groupes.couverture, pans = couverture.children.filter((c) => c.name.startsWith('couverture_'));
    const faitage = couverture.getObjectByName('faitage');
    const parPrefixe = (parent, prefixe) => parent.children.filter((c) => c.name.startsWith(prefixe));
    const zinguerie = groupes.zinguerie.children.map((o) => ({ o, cote: o.name.endsWith('_sud') ? 1 : -1, z0: o.position.z, y0: o.position.y }));
    const surbrillances = ['fermes', 'pannes', 'chevrons', 'renforts'].map((nom) => materiauxSurbrillance(groupes.charpente.getObjectByName(nom)));

    if (!reduit) {
        // ---------------- Phase 1 (0–20) : léger mouvement de caméra ----------------
        tl.to(cam, { az: 18, el: 15, k: 0.93, duration: 20, ease: 'none' }, 0);

        // ---------------- Phase 2 (20–40) : décomposition de la couverture ----------------
        tl.to(cam, { az: 34, el: 27, k: 1.12, ty: 3.0, duration: 20, ease: 'sine.inOut' }, 20);
        const yF = faitage.position.y;
        tl.to(faitage.position, { y: yF + 2.2, duration: 10 }, 20.5);
        tl.to(faitage.position, { y: yF + 6.8, duration: 13 }, 40.5);

        for (const pan of pans) {
            for (const lot of parPrefixe(pan, 'tuiles_')) {
                const { rang: R, colonne: C } = lot.userData.lot;
                tl.to(lot.position, { y: 1.35, x: (C - 1.5) * 0.45, z: (1.5 - R) * 0.32, duration: 9 }, 22 + (3 - R) * 1.5 + Math.abs(C - 1.5) * 0.5);
            }
            for (const rive of parPrefixe(pan, 'rives_')) {
                const s = rive.userData.cote;
                tl.to(rive.position, { y: 1.35, x: s * 0.95, duration: 9 }, 23);
            }
            parPrefixe(pan, 'liteaux_').forEach((lot, R) => {
                tl.to(lot.position, { y: 0.85, z: (1.5 - R) * 0.1, duration: 8 }, 27 + (3 - R) * 0.8);
            });
            const contre = parPrefixe(pan, 'contre_liteaux_')[0], ecran = parPrefixe(pan, 'ecran_')[0], yE = ecran.position.y;
            tl.to(contre.position, { y: 0.5, duration: 8 }, 29);
            tl.to(ecran.position, { y: yE + 0.25, duration: 8 }, 30);
            // Phase 3 : tout le pan (déjà décomposé en couches) s'élève à la verticale, au-dessus de la charpente
            tl.to(pan.position, { y: pan.position.y + 4.4, duration: 13 }, 40.5);
        }
        for (const { o, cote, z0, y0 } of zinguerie) {
            tl.to(o.position, { z: z0 + cote * 0.4, y: y0 - 0.12, duration: 8 }, 30);
            tl.to(o.position, { z: z0 + cote * 0.65, duration: 10 }, 42);
        }

        // ---------------- Phase 3 (40–65) : la charpente en évidence ----------------
        tl.to(cam, { az: 42, el: 15, k: 0.72, tx: 0.8, ty: 4.6, tz: 0, duration: 16, ease: 'sine.inOut' }, 40);
        tl.to(cam, { az: 35, duration: 9, ease: 'sine.inOut' }, 56);
        // La couverture soulevée cesse de faire de l'ombre à la charpente : fondu des ombres autour de la bascule
        tl.to(app.soleil.shadow, { intensity: 0, duration: 1.5, ease: 'none' }, 40);
        tl.to(app.soleil.shadow, { intensity: 1, duration: 1.5, ease: 'none' }, 41.5);
        surbrillances.forEach((mats, i) => {
            const t = 45 + i * 4;
            tl.to(mats, { emissiveIntensity: 0.38, duration: 4, ease: 'sine.inOut' }, t);
            tl.to(mats, { emissiveIntensity: 0.08, duration: 4, ease: 'sine.inOut' }, t + 4);
        });
    }

    // ---------------- Textes (fondus, communs aux deux modes) ----------------
    const [t1, t2, t3] = textes, decal = reduit ? 0 : 24;
    gsap.set([t2, t3], { autoAlpha: 0, y: decal });
    tl.to(t1, { autoAlpha: 0, y: -decal, duration: 3 }, 16);
    tl.to(t2, { autoAlpha: 1, y: 0, duration: 3 }, 21);
    tl.to(t2, { autoAlpha: 0, y: -decal, duration: 3 }, 36);
    tl.to(t3, { autoAlpha: 1, y: 0, duration: 3 }, 42);

    // ------------------------------------------------------------------
    // Version « mouvement réduit » : pas de pièces qui volent ni de travelling,
    // les couches disparaissent simplement l'une après l'autre.
    // ------------------------------------------------------------------
    function appliquerReduit(p) {
        for (const pan of pans) {
            for (const o of pan.children) {
                const n = o.name;
                o.visible = n.startsWith('tuiles_') || n.startsWith('rives_') ? p < 22 : n.startsWith('ecran_') ? p < 40 : p < 31;
            }
        }
        faitage.visible = p < 22;
        surbrillances.flat().forEach((m) => { m.emissiveIntensity = p >= 44 ? 0.12 : 0; });
    }

    let derniere = -1, couvertureOmbre = true, compteur = 0, finDefilement = 0;
    const ombresEspacees = app.qualite.nom !== 'haute'; // qualité allégée : ombres recalculées 1 image sur 3 pendant le défilement
    function maj() {
        const p = tl.time();
        if (reduit) appliquerReduit(p);
        appliquerCamera();
        app.forcerOmbresCharpente(p > (reduit ? 22 : 20.5));
        const ombre = reduit || p < 41.5;
        if (ombre !== couvertureOmbre) {
            couvertureOmbre = ombre;
            couverture.traverse((o) => { if (o.name.startsWith('tuiles_') || o.name.startsWith('rives_') || o.name === 'faitage') o.castShadow = ombre; });
        }
        app.rendre(!ombresEspacees || compteur++ % 3 === 0);
        if (ombresEspacees) { clearTimeout(finDefilement); finDefilement = setTimeout(() => app.rendre(true), 120); }
        if (Math.abs(p - derniere) > 0.05) { derniere = p; surProgression(p); }
    }
    tl.eventCallback('onUpdate', maj);
    app.surRedimension(appliquerCamera);

    const declencheurScroll = ScrollTrigger.create({
        trigger: declencheur,
        start: 'top top',
        end: () => `+=${Math.round(innerHeight * 4.2)}`,
        pin: true,
        anticipatePin: 1,
        scrub: reduit ? true : 0.5,
        animation: tl,
    });
    maj();

    return { timeline: tl, declencheur: declencheurScroll };
}
