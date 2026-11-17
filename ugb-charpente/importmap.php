<?php

/**
 * Importmap de l'application (AssetMapper, sans étape de build Node).
 *
 * Les bibliothèques JS sont versionnées dans assets/lib/ (et non téléchargées
 * depuis un CDN) : le site ne dépend d'aucun service externe au chargement.
 */
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    'scene-test' => [
        'path' => './assets/scene/page-test.js',
        'entrypoint' => true,
    ],
    'scene-scroll' => [
        'path' => './assets/scene/page-scroll.js',
        'entrypoint' => true,
    ],
    'gsap' => [
        'path' => './assets/lib/gsap/gsap.min.js',
    ],
    'gsap/ScrollTrigger' => [
        'path' => './assets/lib/gsap/ScrollTrigger.min.js',
    ],
    'three' => [
        'path' => './assets/lib/three/three.module.min.js',
    ],
    'three/addons/controls/OrbitControls.js' => [
        'path' => './assets/lib/three/OrbitControls.min.js',
    ],
    'three/addons/utils/BufferGeometryUtils.js' => [
        'path' => './assets/lib/three/BufferGeometryUtils.min.js',
    ],
];
