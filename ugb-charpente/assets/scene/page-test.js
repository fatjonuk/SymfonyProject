import { creerScene, webglDisponible } from './scene.js';

const $ = (id) => document.getElementById(id);
const chargement = $('chargement'), jauge = $('chargement-jauge'), texte = $('chargement-texte');
const repli = $('repli'), canvas = $('scene-canvas'), panneau = $('panneau-test');

function afficherRepli(message) {
    if (message) $('repli-texte').textContent = message;
    canvas.hidden = true;
    repli.hidden = false;
    chargement.classList.add('est-termine');
}

const LIBELLES = {
    structure: 'Murs et menuiseries', charpente: 'Charpente', couverture: 'Couverture',
    zinguerie: 'Zinguerie', bardage: 'Bardage', terrasse: 'Terrasse', abri: 'Abri bois',
};

async function demarrer() {
    const forcerRepli = new URLSearchParams(location.search).has('repli');
    if (forcerRepli || !webglDisponible()) { afficherRepli(); return; }

    let app;
    try {
        app = await creerScene(canvas, (fraction, libelle) => {
            jauge.style.width = `${Math.round(fraction * 100)}%`;
            texte.textContent = libelle === 'Prêt' ? 'Prêt' : `Construction : ${libelle.toLowerCase()}…`;
        });
    } catch (erreur) {
        console.error(erreur);
        afficherRepli();
        return;
    }
    chargement.classList.add('est-termine');
    window.ugbScene = app; // accès console pour le débogage

    // --- Panneau d'outils de test ---
    panneau.hidden = false;
    const maj = () => {
        const s = app.statistiques();
        $('m-qualite').textContent = s.qualite;
        $('m-triangles').textContent = s.triangles.toLocaleString('fr-FR');
        $('m-appels').textContent = s.appels;
        $('m-objets').textContent = s.objets;
    };
    maj();

    const calques = $('calques');
    for (const [nom, g] of Object.entries(app.groupes)) {
        const label = document.createElement('label'), case_ = document.createElement('input');
        case_.type = 'checkbox'; case_.checked = true;
        case_.addEventListener('change', () => { g.visible = case_.checked; app.majOmbres(); maj(); });
        label.append(case_, LIBELLES[nom] || nom);
        calques.append(label);
    }

    const btn = $('btn-fps');
    btn.addEventListener('click', async () => {
        btn.disabled = true; btn.textContent = 'Mesure en cours…';
        $('m-fps').textContent = `${await app.mesurerFps()} img/s`;
        btn.disabled = false; btn.textContent = 'Mesurer les FPS (5 s)';
    });

    const bascule = $('panneau-bascule'), contenu = $('panneau-contenu');
    const replier = (ferme) => { contenu.hidden = ferme; bascule.setAttribute('aria-expanded', String(!ferme)); };
    bascule.addEventListener('click', () => replier(!contenu.hidden));
    if (matchMedia('(max-width: 700px)').matches) replier(true);
}

demarrer();
