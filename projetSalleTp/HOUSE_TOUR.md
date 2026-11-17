# Visite 3D « L’électricité au cœur de votre maison »

Page d’accueil du site Symfony : une visite en temps réel (Three.js) d’une maison connectée.
Le défilement de la page pilote la caméra, étape par étape :

| # | Étape | Interaction |
|---|-------|-------------|
| 0 | Vue extérieure, la porte s’ouvre | titre d’accueil |
| 1 | Tableau électrique | porte du tableau, circuits qui partent du tableau, fiche « Découvrir les protections » |
| 2 | Prises | points interactifs, circuit des prises |
| 3 | Luminaires | bouton Allumer / Éteindre et curseur d’intensité qui agissent sur les lumières 3D |
| 4 | Cuisine | travelling, points interactifs four, plaque, lave-vaisselle, réfrigérateur, prises du plan de travail |
| 5 | Sèche-serviettes (étage, par l’escalier) | fiche « Voir son fonctionnement » |
| 6 | Panneaux photovoltaïques (sortie par le toit) | animation Soleil → Panneaux → Onduleur → Maison, fiche « Comprendre l’énergie solaire » |
| 7 | Borne de recharge | indicateur de recharge purement illustratif |
| — | Vue finale | Recommencer la visite / Découvrir nos services / Nous contacter |

L’application « Salle TP » d’origine est conservée et accessible sur `/salle-tp`.

---

## 1. Démarrer le projet

Prérequis : **PHP 8.1 ou plus** (testé ici avec PHP 8.3) et [Composer](https://getcomposer.org/).
Le `composer.lock` a été résolu sous PHP 8.3 ; avec une autre version de PHP, lancer
`composer update` pour obtenir des dépendances compatibles (non testé ici).
Aucun Node.js, aucun bundler : le JavaScript est chargé en modules ES natifs.

```bash
cd projetSalleTp
composer install            # répondre Entrée aux questions de parameters.yml
php bin/console server:run  # http://127.0.0.1:8000
```

Sous Windows (PowerShell ou cmd), les commandes sont les mêmes. Si `php` n’est pas reconnu,
ajouter le dossier de PHP au `PATH`, ou lancer `C:\chemin\vers\php.exe bin\console server:run`.

Sans `server:run`, le serveur intégré de PHP suffit :

```bash
php -S 127.0.0.1:8000 -t web web/app_dev.php   # environnement dev
php -S 127.0.0.1:8001 -t web web/app.php       # environnement prod
```

### Installer ou mettre à jour les dépendances

- PHP : `composer install` (ou `composer update` pour suivre les contraintes de `composer.json`).
- JavaScript : **rien à installer**. Les bibliothèques sont copiées dans le dépôt :
  - `web/house-tour/vendor/three/` : three.js r187 (+ quelques addons : post-traitement, RoomEnvironment, RoundedBoxGeometry)
  - `web/house-tour/vendor/gsap/` : GSAP 3.15 avec ScrollTrigger et ScrollToPlugin
- Les polices (Manrope, Instrument Serif) sont dans `web/house-tour/fonts/`.

### Compiler les assets

Il n’y a pas d’étape de compilation. Les fichiers de `web/house-tour/` sont servis tels quels ;
le `<script type="importmap">` de `house/tour.html.twig` associe `three` et `three/addons/`
aux fichiers copiés. La seule commande d’assets Symfony reste celle de l’application Salle TP :

```bash
php bin/console assets:install web --symlink --relative
```

### Production

```bash
php bin/console cache:clear --env=prod --no-debug
```

puis servir `web/` avec `web/app.php` comme contrôleur frontal.

---

## 2. Routes

| Route | Nom | Rôle |
|-------|-----|------|
| `/` | `homepage` | visite 3D (page d’accueil) |
| `/visite-maison` | `house_tour` | même visite, adresse explicite |
| `/services` | `site_services` | les sept domaines, chacun renvoie vers son étape (`/visite-maison#etape-cuisine`) |
| `/contact` | `site_contact` | formulaire de contact (GET/POST, CSRF, validation) |
| `/salle-tp` | `salle_tp_homepage` | ancienne page d’accueil de l’application Salle TP (auparavant sur `/`) |

Les autres routes de l’application Salle TP n’ont pas changé.

---

## 3. Organisation des fichiers

```
app/config/house_tour.yml               ← textes, ordre des étapes, caméras, hotspots (fichier central)
app/config/services.yml                 ← déclaration du service TourConfig
app/Resources/views/site/layout.html.twig       en-tête, navigation, pied de page
app/Resources/views/house/tour.html.twig        page de la visite
app/Resources/views/house/_panel.html.twig      panneau d’une étape (HTML lisible sans WebGL)
app/Resources/views/house/_solar_diagram.html.twig  schéma Soleil → Panneaux → Onduleur → Maison
app/Resources/views/site/services.html.twig
app/Resources/views/site/contact.html.twig
src/AppBundle/Controller/HouseTourController.php
src/AppBundle/HouseTour/TourConfig.php  ← lit house_tour.yml
src/AppBundle/Form/ContactType.php

web/house-tour/
  css/site.css            styles généraux du site
  css/house-tour.css      styles de la visite (panneaux, rail, hotspots, fiche, mobile, version statique)
  js/main.js              démarrage : chargement réel, construction de la scène, boucle de rendu
  js/stage.js             moteur de rendu, caméra, lumières, post-traitement
  js/director.js          trajectoire de la caméra (Catmull-Rom) à partir de house_tour.yml
  js/scroll-tour.js       défilement → position dans la visite (GSAP ScrollTrigger)
  js/effects.js           animations liées à la position : porte, toit, lumières, circuits, soleil, borne
  js/hotspots.js          points interactifs projetés sur la 3D, masqués quand un objet les cache
  js/ui.js                panneaux, rail, compteur, fiche d’information, actions
  js/performance.js       niveau de qualité, pause hors écran, baisse automatique
  js/site.js              menu mobile, en-tête
  js/scene/house.js       structure : murs, dalles, escalier, toit, porte
  js/scene/interior.js    mobilier : salon, entrée, cuisine, chambres, salle de bain
  js/scene/devices.js     équipements électriques : tableau, prises, luminaires, sèche-serviettes, onduleur, borne…
  js/scene/exterior.js    terrain, allée, carport, voiture, végétation, ciel
  js/scene/circuits.js    tracés pédagogiques des circuits
  js/scene/materials.js, textures.js, geometry.js, kit.js   matériaux et briques de construction
  img/steps/*.jpg         vues de chaque étape (version sans WebGL)
  vendor/                 three.js, GSAP
```

---

## 4. Modifier un texte

Tous les textes de la visite sont dans `app/config/house_tour.yml` :

```yaml
steps:
    -   id: tableau
        nav: 'Tableau'                       # libellé court du rail
        category: 'Distribution et protection'
        title: 'Le tableau électrique'
        subtitle: 'Le centre de contrôle de votre installation.'
        description: '…'
        details: [ '…', '…' ]                # points clés
        button: 'Découvrir les protections'  # bouton du panneau
        more:                                # contenu de la fiche ouverte par le bouton
            title: 'Les protections du tableau'
            paragraphs: [ '…' ]
```

Le titre d’accueil est dans `intro`, la conclusion dans `final`. Le fichier est relu à chaque
requête : il suffit de recharger la page. Après une modification, vérifier la syntaxe :

```bash
php bin/console lint:yaml app/config/house_tour.yml
```

Les textes des pages Services et Contact sont dans leurs gabarits Twig.

---

## 5. Ajuster une position de caméra

Repère de la maison (en mètres) : **x** de gauche à droite face à la façade, **y** la hauteur
(0 = sol du rez-de-chaussée, 3,3 = sol de l’étage), **z** de l’arrière vers la rue.

```yaml
        camera:
            duration: 3.2              # longueur de la transition (en « pages » de défilement)
            via:                       # points de passage, dans l’ordre
                - { position: [-9.0, 3.2, 14.0], target: [-4.85, 1.9, 4.3] }
            position: [-5.4, 1.55, 2.62]   # caméra à l’arrêt sur l’étape
            target: [-5.62, 1.45, 1.33]    # point regardé
            fov: 50                        # angle de vue vertical en degrés
            travel:                        # facultatif : lent déplacement pendant l’étape
                position: [5.25, 1.62, 0.55]
                target: [5.35, 1.0, -3.2]
```

La caméra suit une courbe Catmull-Rom qui passe par l’arrêt précédent, les points `via`, puis
l’arrêt de l’étape. Pour éviter de traverser un mur ou un meuble, ajouter un point `via` devant
la porte ou l’ouverture à franchir. Pour un virage plus doux, ajouter un point intermédiaire dont
la cible est entre l’ancienne et la nouvelle direction.

Outils de réglage (dans l’URL) :

- `?snap=0` désactive l’aimantation sur les étapes ;
- `?clean=1` masque l’interface (vues propres, captures) ;
- `?q=high` ou `?q=low` force le niveau de qualité.

Dans la console du navigateur :

```js
__tour.stage.camera.position          // position actuelle
__tour.tour.p                         // position dans la visite (0 = accueil, 1 = arrivée sur l’étape 1…)
scrollTo(0, __tour.scrollFor(4.5))    // aller à un endroit précis de la visite
```

Sur mobile en portrait, l’angle de vue est élargi automatiquement (maximum 76°) pour garder le
même cadrage horizontal.

---

## 6. Ajouter ou modifier un point interactif (hotspot)

Dans l’étape concernée :

```yaml
        hotspots:
            - { id: hs-four, label: 'Four', circuit: four, position: [5.75, 1.15, -3.56], text: 'Le four dispose de son propre circuit…' }
```

- `position` : point de la scène où s’ancre le bouton ;
- `circuit` (facultatif) : circuit mis en évidence à l’ouverture de la fiche. Les noms possibles
  sont dans `GROUPS`, en haut de `web/house-tour/js/scene/circuits.js` ;
- le bouton est masqué automatiquement s’il est caché par un mur ou un meuble, hors de l’écran,
  ou sous le panneau de texte.

---

## 7. Ajouter un équipement 3D

1. Choisir le fichier selon la nature de l’objet : `devices.js` (électrique), `interior.js`
   (mobilier), `exterior.js` (extérieur).
2. Le construire avec les briques de `kit.js` et les matériaux de `materials.js`, par exemple :

   ```js
   import { box, cyl } from './kit.js';
   // boîtier de 40 × 60 × 15 cm posé à 1,2 m du sol, contre le mur du fond de la cuisine
   const M = ctx.M; // bibliothèque de matériaux
   box(levels.ground, M.deviceWhite, 0.4, 0.6, 0.15, 3.0, 1.2, -4.12, { name: 'mon_equipement' });
   ```

   `levels.ground` (rez-de-chaussée), `levels.upper` (étage) et `levels.roof` (toit, qui se
   soulève à l’étape solaire) sont les groupes parents.
3. Si l’objet est grand et doit masquer les hotspots situés derrière lui, l’ajouter à
   `ctx.reg.occluders`.
4. Pour le relier au tableau, ajouter un tracé dans `CIRCUITS` (`circuits.js`) : une liste de
   points en mètres, un `group` et un `kind` (`light`, `outlet` ou `special`, qui fixe la couleur).
5. Ajouter si besoin un hotspot dans `house_tour.yml` (§ 6).

---

## 8. Ajouter une étape

1. Ajouter une entrée dans `steps` de `house_tour.yml`, à la place voulue (l’ordre du fichier est
   l’ordre de la visite) : `id` unique, textes, `camera`, `hotspots`. Le panneau, le rail, le
   compteur (« 03 / 08 »), la version sans WebGL et la page Services s’adaptent seuls.
2. Ajouter une image `web/house-tour/img/steps/<id>.jpg` (1200 × 800) pour la version sans WebGL :
   ouvrir `/?clean=1&q=high`, aller à l’étape et faire une capture.
3. Les animations propres à une étape (porte, toit, lumières, flux solaire, borne) sont dans
   `web/house-tour/js/effects.js` et utilisent l’`id` des étapes : si un `id` est renommé,
   le mettre à jour aussi dans ce fichier.
4. Vérifier qu’aucune trajectoire ne traverse un mur (§ 5).

---

## 9. Remplacer la maison procédurale par un vrai modèle

La maison actuelle est un **prototype procédural** : elle est construite en code, sans fichier 3D.
Pour passer à un modèle réalisé dans Blender ou un autre logiciel :

1. Exporter en **glTF binaire (`.glb`)**, en mètres, avec les mêmes axes (y vers le haut, la rue
   vers +z), compressé si possible (Draco ou meshopt) et des textures KTX2 ou WebP.
2. Garder une hiérarchie nommée, utilisée par les animations :
   `house`, `ground_floor`, `first_floor`, `roof`, `stairs`, `solar_panels`, `entrance`,
   et des pivots pour les parties mobiles : `front_door` (porte d’entrée), `panel_door` (porte du tableau).
3. Copier `GLTFLoader.js` (et `DRACOLoader.js` si besoin) depuis les addons de three.js r187 dans
   `web/house-tour/vendor/three/addons/loaders/`.
4. Dans `main.js`, remplacer les tâches `buildHouse` / `buildInterior` par le chargement du `.glb`
   (le chargeur fournit une progression réelle pour la barre de chargement), puis renseigner
   `ctx.reg` avec les objets trouvés par nom (`gltf.scene.getObjectByName('front_door')`…) :
   porte, toit, panneaux, lumières, occultants.
5. Les équipements de `devices.js` peuvent être remplacés un par un de la même façon.
6. Garder les positions des caméras, hotspots et circuits, ou les recaler dans `house_tour.yml`.

### Modèles 3D à produire pour un rendu photoréaliste

Les éléments suivants sont aujourd’hui modélisés simplement en code ; des modèles dédiés
amélioreraient nettement le réalisme :

- la maison complète (façades, menuiseries, toiture avec acrotère) et ses textures (enduit, bardage bois, sols) ;
- le tableau électrique avec ses modules (disjoncteurs, différentiels, repérage) ;
- les prises et interrupteurs (gamme réelle si une marque est choisie) ;
- les luminaires (spots, suspensions, réglettes, lampadaire, lampe à poser) ;
- l’électroménager : four, plaque de cuisson, lave-vaisselle, réfrigérateur, hotte ;
- le sèche-serviettes ;
- les panneaux photovoltaïques, leurs fixations et l’onduleur ;
- la borne de recharge et le câble ;
- la voiture électrique ;
- le mobilier (canapé, table, chaises, lits, salle de bain) et la végétation.

Aucun modèle n’est fourni : les objets actuels sont des volumes simples, et non des reproductions
de produits ou de marques.

---

## 10. Accessibilité, mobile et version sans WebGL

- Les textes des étapes sont du **HTML** généré par Twig : lisibles par les lecteurs d’écran, par
  les moteurs de recherche, et sans JavaScript.
- Navigation au clavier : rail des étapes, boutons, hotspots (`Tab`, `Entrée`), fiche fermée par
  `Échap` avec retour du focus. Les changements d’étape sont annoncés (`aria-live`).
- `prefers-reduced-motion` : la caméra passe d’une vue fixe à l’autre par un fondu, sans travelling.
- Mobile : panneaux en bas d’écran, rail horizontal sous l’en-tête (masqué sur la vue d’accueil),
  bouton « Lire la suite » pour le texte complet, cibles tactiles de 44 px, pas de défilement horizontal.
- Sans WebGL (ou en cas d’erreur pendant la construction de la scène) : version illustrée avec
  les mêmes textes et une image par étape. Sans JavaScript : même version illustrée.

## 11. Performance

- Résolution limitée (`devicePixelRatio` plafonné à 1,75, ou 1,25 en qualité basse).
- Deux niveaux de qualité : la qualité basse retire le post-traitement (bloom) et réduit les ombres.
  Choix automatique (petit écran tactile, peu de cœurs ou de mémoire), forçable avec `?q=`.
- Passage automatique en qualité basse si l’image met trop longtemps à se calculer.
- Rendu en pause quand la visite n’est plus visible ou que l’onglet est masqué.
- Chargement : la barre de progression suit les vraies étapes de construction de la scène.

---

## 12. Vérifications

### Commandes

```bash
# syntaxe
php bin/console lint:yaml app/config/house_tour.yml
php bin/console lint:twig app/Resources/views
php -l src/AppBundle/Controller/HouseTourController.php

# routes déclarées
php bin/console debug:router | grep -E "homepage|house_tour|site_services|site_contact|salle_tp"
#   (Windows : remplacer grep -E "…" par findstr "homepage house_tour site_services site_contact salle_tp")

# serveur puis réponses HTTP
php bin/console server:run
curl -I http://127.0.0.1:8000/
curl -I http://127.0.0.1:8000/services
curl -I http://127.0.0.1:8000/contact
curl -I http://127.0.0.1:8000/salle-tp
```

### Dans le navigateur

1. `/` : la barre de chargement progresse, puis la vue extérieure et le titre apparaissent.
2. Faire défiler : la porte s’ouvre, la caméra entre et s’arrête sur le tableau (« 01 / 07 »).
3. Remonter : la visite repart en arrière sans saut.
4. Cliquer une étape du rail : la caméra s’y rend.
5. Étape 3 : « Éteindre » éteint réellement les lumières du salon ; le curseur fait varier l’intensité.
6. Étape 4 : cliquer « Plaque de cuisson » ouvre la fiche et met son circuit en évidence ; `Échap` la ferme.
7. Étape 6 : « Comprendre l’énergie solaire » affiche le schéma.
8. Étape 7 : « Découvrir la recharge » affiche l’indicateur illustratif.
9. Fin : « Recommencer la visite » ramène au début ; les deux autres boutons ouvrent Services et Contact.
10. Redimensionner la fenêtre, tester sur téléphone, activer « Réduire les animations » dans le système.
11. Désactiver WebGL (ou JavaScript) : les sept étapes restent lisibles.

---

## 13. Limites connues

- **Prototype procédural** : la maison et les équipements sont construits en code. Le rendu est
  soigné mais pas photoréaliste (voir § 9).
- **Contenu pédagogique** : les circuits affichés illustrent un principe ; ce ne sont pas des
  schémas de câblage. La visite ne vaut ni étude, ni diagnostic, ni attestation de conformité.
  Aucune puissance, aucun prix et aucune caractéristique de produit n’est indiqué.
- **Formulaire de contact** : il valide les données et enregistre la demande dans le journal
  (`var/logs/`), mais **n’envoie pas d’e-mail** : aucun service d’envoi n’est configuré.
  Les coordonnées de l’entreprise (téléphone, adresse, e-mail) et les mentions légales ne sont
  pas renseignées : elles doivent être fournies par l’entreprise.
- **PHP 8** : Symfony a été mis à jour en 3.4.49 et `app/php8_compat.php` corrige l’environnement
  de développement. En revanche Doctrine (ORM 2.5 / DBAL 2.5) n’est pas compatible PHP 8 : les
  pages de l’application Salle TP qui interrogent la base (`/recherche`, `/stats/…`, `/info2/…`…)
  renvoient une erreur 500 sur PHP 8, comme avant ces modifications. Elles nécessitent PHP 7.x
  (avec `composer update` sous cette version, non testé ici) et une base MySQL configurée dans
  `app/config/parameters.yml`. Deux d’entre elles ont aussi des erreurs dans leur propre code,
  indépendantes de PHP : `/recherche` (méthode Doctrine `buildFrom` inexistante) et `/info-`
  (la route pointe vers `FirstController::infoAction`, méthode qui n’existe pas dans ce contrôleur). `server_version: '5.7'` a été ajouté
  à la configuration Doctrine pour que le vidage du cache de production fonctionne sans base ;
  l’adapter à la version réelle du serveur MySQL/MariaDB.
- **Encodage** : le noyau de l’application déclare ISO-8859-1 (choix d’origine, conservé pour les
  pages Salle TP) ; les nouvelles pages répondent en UTF-8.
- **Performance** : les tests automatisés ont été faits dans un navigateur sans carte graphique
  (rendu logiciel). La fluidité réelle doit être mesurée sur les appareils cibles.
