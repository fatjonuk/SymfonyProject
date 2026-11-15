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

## Expérience 3D

La timeline (`lib/anim.ts`) démarre automatiquement :

| Temps | Phase |
| --- | --- |
| 0 – 3 s | Maison complète, travelling caméra |
| 3 – 7 s | Décomposition : la toiture se soulève, les façades s’écartent, l’étage monte, les cloisons deviennent transparentes |
| 7 – 9 s | Le tableau électrique apparaît, avec un halo jaune et une étiquette |
| 9 – 13 s | Les réseaux se dessinent en temps réel depuis le tableau (éclairage, prises, circuits spécialisés), avec des impulsions lumineuses qui les parcourent |
| 13 – 16 s | Les luminaires s’allument un à un, rotation de la caméra et message final |

Interactions : rotation, zoom et déplacement de la caméra ; « Ouvrir / Refermer la maison » ; « Afficher / Masquer les circuits » ; « Rejouer l’animation » ; clic sur une pièce ou un équipement (tableau, prises, interrupteurs, luminaires, circuits spécialisés), qui ouvre une fiche explicative et recentre la caméra.

Les circuits restent visibles à travers les murs grâce à une seconde passe « rayons X ». Ils sont colorés par type : jaune pour l’éclairage, bleu pour les prises, orange pour les circuits spécialisés.

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
lib/anim.ts       timeline GSAP et actions (ouvrir, circuits, focus caméra)
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
- `prefers-reduced-motion` : l’animation saute directement à l’état final.
- Sur écran tactile, la scène ne capture les gestes qu’en mode « Explorer » : la page reste défilable.

## À compléter avant la mise en ligne

- `lib/site.ts` : téléphone, e-mail, zone d’intervention et horaires (valeurs **fictives** pour l’instant).
- `app/api/devis/route.ts` : brancher l’envoi d’e-mail ou un CRM (la demande est pour l’instant validée puis journalisée).
- Mentions légales et politique de confidentialité.
- `public/renders/*.jpg` : visuels générés à partir de la maquette 3D ; à remplacer par des photos de chantiers réels quand elles seront disponibles.
