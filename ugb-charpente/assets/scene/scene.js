import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { creerMateriaux, environnement } from './materiaux.js';
import { ETAPES, DIMENSIONS } from './maison.js';

const FOND = 0xF7F6F2;

/** Choix automatique du niveau de qualité (peut être forcé avec ?qualite=haute|basse). */
export function choisirQualite() {
    const force = new URLSearchParams(location.search).get('qualite');
    const tactile = matchMedia('(pointer: coarse)').matches;
    const modeste = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const basse = force ? force === 'basse' : (tactile || modeste || innerWidth < 800);
    return basse
        ? { nom: 'allégée', tuilesDetaillees: false, tailleTextures: 256, anisotropie: 2, ombres: 1024, antialias: false, dprMax: 1.5 }
        : { nom: 'haute', tuilesDetaillees: true, tailleTextures: 512, anisotropie: 8, ombres: 2048, antialias: true, dprMax: 2 };
}

export function webglDisponible() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
    } catch { return false; }
}

const imageSuivante = () => new Promise((r) => requestAnimationFrame(() => r()));

/**
 * Construit la scène dans `canvas`. `progression(fraction, libellé)` est appelé à chaque étape.
 */
export async function creerScene(canvas, progression = () => {}) {
    const qualite = choisirQualite();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: qualite.antialias, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, qualite.dprMax));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;   // scène statique : les ombres ne sont recalculées que sur demande

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(FOND);
    scene.environment = environnement();
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 200);
    const cible = new THREE.Vector3(2.2, 2.0, 0.5);
    camera.position.set(14.5, 9, 25.5);

    // --- Lumières ---
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 0.75));
    const soleil = new THREE.DirectionalLight(0xfff4e2, 2.6);
    soleil.position.set(-10, 17, 13);
    soleil.castShadow = true;
    soleil.shadow.mapSize.setScalar(qualite.ombres);
    Object.assign(soleil.shadow.camera, { left: -15, right: 15, top: 13, bottom: -13, near: 1, far: 50 });
    soleil.shadow.bias = -0.0004;
    soleil.shadow.normalBias = 0.03;
    scene.add(soleil);

    // --- Sol : ne reçoit que les ombres, pour se fondre dans le fond de page ---
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.22 }));
    sol.rotation.x = -Math.PI / 2;
    sol.receiveShadow = true;
    sol.name = 'sol';
    scene.add(sol);

    // --- Maison ---
    progression(0.05, 'Matériaux');
    await imageSuivante();
    const materiaux = creerMateriaux(qualite);
    const maison = new THREE.Group();
    maison.name = 'maison';
    scene.add(maison);
    const groupes = {};
    for (let i = 0; i < ETAPES.length; i++) {
        const [libelle, construire] = ETAPES[i];
        progression(0.15 + 0.8 * (i / ETAPES.length), libelle);
        await imageSuivante();
        const g = construire(materiaux, qualite);
        groupes[g.name] = g;
        maison.add(g);
    }

    // --- Contrôles (page de test : rotation et zoom libres) ---
    const controles = new OrbitControls(camera, canvas);
    controles.target.copy(cible);
    controles.enableDamping = true;
    controles.dampingFactor = 0.08;
    controles.minDistance = 6;
    controles.maxDistance = 120;
    controles.maxPolarAngle = Math.PI / 2 - 0.03;

    // --- Rendu à la demande ---
    let demande = true, horloge = 0, images = 0, auto = null;
    const rendre = () => { demande = true; };
    const majOmbres = () => {
        // Tant que la couverture est en place, la charpente (cachée dessous) ne projette pas d'ombre : moins d'appels de dessin
        const visible = !groupes.couverture.visible;
        groupes.charpente.traverse((o) => { if (o.isMesh) o.castShadow = visible; });
        renderer.shadowMap.needsUpdate = true;
        rendre();
    };
    controles.addEventListener('change', rendre);

    // Cadrage automatique : la maison entière reste visible quel que soit le format d'écran,
    // tant que le visiteur n'a pas pris la main sur la caméra.
    const direction = camera.position.clone().sub(cible).normalize();
    let aBouge = false;
    controles.addEventListener('start', () => { aBouge = true; });
    function cadrer() {
        const v = THREE.MathUtils.degToRad(camera.fov) / 2, h = Math.atan(Math.tan(v) * camera.aspect);
        const d = Math.max(12.5 / Math.sin(h), 7.5 / Math.sin(v));
        camera.position.copy(cible).addScaledVector(direction, d);
    }
    function redimensionner() {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (!aBouge) cadrer();
        rendre();
    }
    new ResizeObserver(redimensionner).observe(canvas);
    redimensionner();

    function boucle(t) {
        requestAnimationFrame(boucle);
        if (auto) { auto(t); demande = true; }
        if (controles.update() || demande) {
            demande = false;
            renderer.render(scene, camera);
            images++;
        }
        horloge = t;
    }
    majOmbres();
    await renderer.compileAsync(scene, camera);
    requestAnimationFrame(boucle);
    progression(1, 'Prêt');

    /** Fait tourner la caméra pendant `duree` ms en rendant chaque image, et renvoie les FPS moyens. */
    function mesurerFps(duree = 5000) {
        return new Promise((resolve) => {
            const debut = performance.now(), depart = images, az0 = controles.getAzimuthalAngle();
            const rayon = Math.hypot(camera.position.x - cible.x, camera.position.z - cible.z), y = camera.position.y;
            auto = () => {
                const e = performance.now() - debut, a = az0 + (e / duree) * Math.PI * 2;
                camera.position.set(cible.x + Math.sin(a) * rayon, y, cible.z + Math.cos(a) * rayon);
                if (e >= duree) { auto = null; resolve(Math.round(((images - depart) / e) * 1000)); }
            };
        });
    }

    function statistiques() {
        renderer.info.autoReset = true;
        renderer.render(scene, camera);
        let nommes = 0;
        maison.traverse((o) => { if (o.name) nommes++; });
        return { triangles: renderer.info.render.triangles, appels: renderer.info.render.calls, objets: nommes, qualite: qualite.nom };
    }

    return { renderer, scene, camera, controles, maison, groupes, materiaux, qualite, rendre, majOmbres, mesurerFps, statistiques, DIMENSIONS };
}
