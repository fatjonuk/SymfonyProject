# UGB Charpente — site vitrine avec maison 3D

Projet Symfony 7.4 (PHP ≥ 8.2), AssetMapper (aucune étape de build Node), Three.js.
Projet indépendant : il ne modifie ni ne dépend d'aucun autre site.

## Lancer en local

```bash
composer install
```

```bash
php -S 127.0.0.1:8000 -t public public/index.php
```

Puis ouvrir <http://127.0.0.1:8000/test/maison> (page de test de la maison 3D).

Animation au scroll (étape 2) : <http://127.0.0.1:8000/test/scroll>, options `?reduit=1`, `?qualite=…`, `?repli=1`.

Options d'URL de la page de test : `?qualite=haute`, `?qualite=basse`, `?repli=1` (image statique sans WebGL).

## Organisation

- `assets/scene/parametres.js` — dimensions de la maison (emprise, pente, débords, sections de bois…).
- `assets/scene/maison.js` — géométrie procédurale : structure, charpente, couverture, zinguerie, bardage, terrasse, abri.
- `assets/scene/materiaux.js` — matériaux PBR, textures générées par code.
- `assets/scene/scene.js` — rendu, lumières, ombres, niveaux de qualité, cadrage.
- `assets/scene/animation.js` — timeline GSAP ScrollTrigger (phases 1 à 3), version « mouvement réduit ».
- `assets/scene/page-scroll.js` — page épinglée au scroll, textes, indicateur de fluidité.
- `assets/scene/page-test.js` — écran de chargement, repli sans WebGL, outils de test.
- `assets/lib/` — Three.js (MIT) et GSAP + ScrollTrigger (licence standard gratuite GSAP), versionnés dans le dépôt (pas de CDN).
- `assets/fonts/` — Poppins (licence OFL), auto-hébergée.
- `assets/images/logo/` — logo vectorisé à partir du visuel fourni.
