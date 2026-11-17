import { creerScene, webglDisponible } from './scene.js';
import { creerAnimation, phaseDe } from './animation.js';

const $ = (id) => document.getElementById(id);
const experience = $('experience'), canvas = $('scene-canvas'), chargement = $('chargement');

function afficherRepli() {
    // Sans WebGL : image statique, et les textes des phases s'affichent simplement à la suite
    experience.classList.add('sans-3d');
    canvas.hidden = true;
    $('repli').hidden = false;
    chargement.classList.add('est-termine');
}

async function demarrer() {
    const params = new URLSearchParams(location.search);
    if (params.has('repli') || !webglDisponible()) { afficherRepli(); return; }

    let app;
    try {
        app = await creerScene(canvas, (fraction, libelle) => {
            $('chargement-jauge').style.width = `${Math.round(fraction * 100)}%`;
            $('chargement-texte').textContent = libelle === 'Prêt' ? 'Prêt' : `Construction : ${libelle.toLowerCase()}…`;
        }, { controles: false });
    } catch (erreur) {
        console.error(erreur);
        afficherRepli();
        return;
    }

    // Décale l'image pour laisser la place au texte (à gauche sur grand écran, en bas sur mobile)
    const decaler = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        if (w > h) app.camera.setViewOffset(w, h, -w * 0.13, 0, w, h);
        else app.camera.setViewOffset(w, h, 0, h * 0.1, w, h);
    };
    new ResizeObserver(() => { decaler(); app.rendre(); }).observe(canvas);
    decaler();

    const reduit = params.has('reduit') ? params.get('reduit') !== '0' : matchMedia('(prefers-reduced-motion: reduce)').matches;
    const points = [...document.querySelectorAll('.etapes li')], invite = $('invite');
    const mesure = $('mesure');
    let phaseCourante = 0;

    const animation = creerAnimation(app, {
        declencheur: experience,
        textes: [...document.querySelectorAll('.phase')],
        reduit,
        surProgression: (p) => {
            const phase = phaseDe(p);
            if (phase !== phaseCourante) {
                phaseCourante = phase;
                points.forEach((li, i) => li.classList.toggle('est-active', i + 1 === phase));
            }
            invite.classList.toggle('est-masque', p > 3);
            $('m-progression').textContent = `${Math.round(p)} %`;
            $('m-phase').textContent = phase;
        },
    });
    points[0].classList.add('est-active');
    chargement.classList.add('est-termine');
    window.ugbScene = app;
    window.ugbAnimation = animation;

    // --- Mesure des images par seconde pendant le défilement (outil de test) ---
    mesure.hidden = false;
    $('m-qualite').textContent = app.qualite.nom + (reduit ? ' · mouvement réduit' : '');
    let images = app.imagesRendues(), t0 = performance.now(), mini = Infinity;
    setInterval(() => {
        const n = app.imagesRendues(), t = performance.now(), fps = ((n - images) / (t - t0)) * 1000;
        if (n - images >= 5) {
            mini = Math.min(mini, fps);
            $('m-fps').textContent = `${Math.round(fps)} img/s (mini ${Math.round(mini)})`;
        }
        images = n; t0 = t;
    }, 500);
    $('m-fps').addEventListener('click', () => { mini = Infinity; });
}

demarrer();
