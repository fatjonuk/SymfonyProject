# UGB Électricité — site 3D immersif

Site vitrine haut de gamme pour **UGB Électricité**. Son élément central est une maison contemporaine R+1 en 3D temps réel : elle se désassemble (exploded view), puis révèle son installation électrique complète.

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Three.js** + **React Three Fiber** + **Drei** pour la scène 3D
- **@react-three/postprocessing** (occlusion ambiante N8AO, bloom, tone mapping)
- **GSAP** (timeline cinématique, ScrollTrigger)
- **Tailwind CSS v4**

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Expérience 3D pilotée par le scroll

La maison reste épinglée à l’écran et **le défilement de la page pilote toute l’animation** (GSAP ScrollTrigger, `scrub` + `pin`). Rien n’avance tout seul : si le visiteur s’arrête, la scène s’arrête ; s’il remonte, tout se rejoue à l’envers.

Une timeline unique (`lib/anim.ts`), graduée de 0 à 100 % :

| Scroll | Chapitre | Ce qui se passe |
| --- | --- | --- |
| 0 – 15 % | Maison | Maison entièrement construite, léger mouvement de caméra |
| 15 – 40 % | Décomposition | La toiture se soulève, les façades s’écartent, l’étage monte, les cloisons deviennent transparentes |
| 40 – 55 % | Tableau électrique | Halo jaune, la caméra se rapproche du tableau |
| 55 – 80 % | Circuits | Les circuits se tracent depuis le tableau (éclairage, prises, circuits spécialisés) |
| 80 – 100 % | Exploration | Les luminaires s’allument, la caméra se pose sur la vue ouverte |

Après 100 %, un **palier d’exploration** garde la maison épinglée et ouverte :

- glisser pour tourner (sur mobile : glissement horizontal ; le glissement vertical fait toujours défiler la page) ;
- zoom avec les boutons +/−, un pincement, ou Ctrl + molette — la molette seule fait toujours défiler la page ;
- clic sur un équipement : fiche d’information, zoom de caméra, **son circuit est mis en évidence et les autres atténués** ;
- les luminaires s’allument et s’éteignent au clic, les interrupteurs commandent leurs luminaires, l’éclairage de la pièce suit ;
- filtres de circuits (tous / éclairage / prises / spécialisés / masquer), réinitialisation de la caméra, ouverture/fermeture de la maison ;
- Échap ou la croix ferme la fiche sans changer l’état de la scène.

En remontant dans la page, les interactions se coupent et la timeline reprend la scène en douceur depuis la position où le visiteur a laissé la caméra.

Le bouton « Explorer l’installation 3D » et « Rejouer » font simplement défiler la page jusqu’au palier : la séquence se joue alors d’elle-même.

### Structure

```
components/three/
  data.ts         plan de la maison : pièces, équipements, tracés des circuits (en mètres)
  House.tsx       assemblage : rez-de-chaussée, étage, toiture, chacun animé séparément
  Wall.tsx        murs avec ouvertures, menuiseries, vitrages ; écartement et fondu
  Circuits.tsx    tubes des circuits + shader de révélation et d’impulsion
  Devices.tsx     prises, interrupteurs, luminaires, équipements spécialisés
  Panel.tsx       tableau électrique (différentiels, disjoncteurs, parafoudre)
  Furniture.tsx   mobilier intérieur
  Landscape.tsx   jardin, piscine, terrasse, végétation
  Lighting.tsx    soleil + ombres, environnement studio, lumières intérieures
  Experience.tsx  Canvas, caméra cinématique, contrôles, post-traitement
lib/anim.ts       timeline pilotée par le scroll, mode exploration et actions (sélection, filtres, caméra)
lib/store.ts      état de l’interface (mode, chapitre, sélection, filtre, luminaires éteints)
components/site/  navigation, hero, sections, formulaire de devis
```

Chaque élément de la maison est un objet 3D indépendant : murs extérieurs (avec leur bardage), cloisons, dalles, toiture, escalier, mobilier, tableau, appareillage et câbles. Les matériaux sont en PBR, avec des textures procédurales (enduit, béton, chêne, bardage bois) générées au chargement : aucun fichier lourd à télécharger.

### Remplacer la maison par un modèle Blender (GLB)

La maison actuelle est modélisée en code. Pour passer à un modèle architectural réalisé sous Blender :

1. Nommer les objets par groupe : `roof`, `upper_*`, `facade_front_*`, `wall_inner_*`, `device_<id>`…
2. Exporter en glTF binaire (`.glb`) avec compression Draco ou Meshopt, et des textures en KTX2 ou WebP.
3. Charger le fichier avec `useGLTF` (Drei) dans `House.tsx`, puis rattacher chaque groupe aux mêmes valeurs d’animation (`A.roof`, `A.facade`, `A.floor`, `A.walls`).
4. Conserver `data.ts` pour les tracés de circuits et les fiches d’information, en les recalant sur les coordonnées du modèle.

### Performances

- **Deux niveaux de qualité** : `high` (ombres 4096, AO, MSAA) et `low` (mobile ou CPU modeste, sans AO, résolution réduite). `PerformanceMonitor` bascule automatiquement en `low` si le framerate chute. On peut forcer un niveau avec `?q=high` ou `?q=low`.
- Le rendu se met en pause quand le hero n’est plus visible.
- **Sans WebGL**, une image statique (`public/renders/maison-ouverte.jpg`) remplace la scène.
- `prefers-reduced-motion` : pas de séquence au scroll ; la maison est affichée ouverte, directement explorable.
- La séquence est plus courte sur mobile (≈ 390 vh contre ≈ 510 vh sur ordinateur).
- Les petits équipements ont une zone de clic invisible élargie, pour le tactile.

## À compléter avant la mise en ligne

- `lib/site.ts` : téléphone, e-mail, zone d’intervention et horaires (valeurs **fictives** pour l’instant).
- `app/api/devis/route.ts` : brancher l’envoi d’e-mail ou un CRM (la demande est pour l’instant validée puis journalisée).
- Mentions légales et politique de confidentialité.
- `public/renders/*.jpg` : visuels générés à partir de la maquette 3D ; à remplacer par des photos de chantiers réels quand elles seront disponibles.
