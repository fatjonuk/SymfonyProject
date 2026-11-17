/*
 * Renderer, camera, lights and post-processing (HouseScene).
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildSky } from './scene/exterior.js';

const HORIZON = new THREE.Color('#ece7dc');

/** Warm interior lights, one per area; their level is driven by the tour effects. */
const ROOM_LIGHTS = [
    { room: 'entree', p: [-5.1, 2.6, 2.8], i: 3.2, d: 6 },
    { room: 'salon', p: [-0.8, 2.6, -0.8], i: 5.5, d: 9 },
    { room: 'salon', p: [-4.6, 2.6, -1.8], i: 2.5, d: 6 },
    { room: 'cuisine', p: [4.9, 2.2, -1.6], i: 4.5, d: 7 },
    { room: 'cuisine', p: [4.9, 1.7, 2.4], i: 2.5, d: 5 },
    { room: 'etage', p: [-4.0, 5.7, -1.2], i: 2.5, d: 6 },
    { room: 'etage', p: [0.0, 5.7, -0.6], i: 3.0, d: 7 },
    { room: 'sdb', p: [-4.6, 5.7, 2.3], i: 3.4, d: 5 },
    { room: 'exterieur', p: [-9.3, 2.3, -0.6], i: 2.0, d: 6 },
];

export function createStage(canvas, quality) {
    const high = quality === 'high';
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !high, powerPreference: 'high-performance', stencil: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    scene.background = HORIZON.clone();
    scene.fog = new THREE.Fog(HORIZON, 70, 260);
    buildSky(scene);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.42;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 600);
    camera.position.set(-19, 6.4, 22);

    const hemi = new THREE.HemisphereLight('#e2ecf6', '#cbbfa9', 0.55);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight('#fff0db', 2.7);
    sun.position.set(-26, 26, 18);
    sun.target.position.set(-1, 0, 1);
    scene.add(sun, sun.target);
    sun.castShadow = true;
    const map = high ? 2048 : 1024;
    sun.shadow.mapSize.set(map, map);
    Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 90 });
    sun.shadow.camera.updateProjectionMatrix();
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 3;

    const roomLights = ROOM_LIGHTS.map((l) => {
        const light = new THREE.PointLight('#ffc98a', 0, l.d, 1.6);
        light.position.set(l.p[0], l.p[1], l.p[2]);
        light.userData = { room: l.room, max: l.i };
        scene.add(light);
        return light;
    });

    let composer = null;
    let bloom = null;
    if (high) {
        const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
        composer = new EffectComposer(renderer, target);
        composer.addPass(new RenderPass(scene, camera));
        bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.5, 1.4);
        composer.addPass(bloom);
        composer.addPass(new OutputPass());
    }

    const size = { w: 1, h: 1 };
    function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        size.w = w;
        size.h = h;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (composer) {
            composer.setPixelRatio(renderer.getPixelRatio());
            composer.setSize(w, h);
        }
    }

    function render() {
        if (composer) composer.render();
        else renderer.render(scene, camera);
    }

    function setQuality(q) {
        if (q === 'low' && composer) {
            composer = null;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.15));
            sun.shadow.mapSize.set(1024, 1024);
            if (sun.shadow.map) {
                sun.shadow.map.dispose();
                sun.shadow.map = null;
            }
            resize();
        }
    }

    return { renderer, scene, camera, sun, hemi, roomLights, size, resize, render, setQuality, get bloom() { return bloom; } };
}
