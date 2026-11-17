/*
 * Electrical equipment: distribution board, outlets, switches, luminaires and
 * dedicated appliances. Emissive materials are registered in ctx.reg so the
 * tour effects can switch them on, dim them or highlight them.
 */
import * as THREE from 'three';
import { box, boxC, cyl, group, FACING } from './kit.js';
import { H } from './house.js';
import { ledMaterial } from './materials.js';
import { glow } from './textures.js';

export const PANEL_POS = [-5.6, 1.45, 1.33];

/* Luminaires: room drives the on/off and dimming groups of the tour effects */
const LIGHTS = [
    { id: 'l-entree', room: 'entree', style: 'disc', pos: [-5.2, 2.98, 2.8] },
    { id: 'l-spot-1', room: 'salon', style: 'spot', pos: [-2, 2.98, 1.5] },
    { id: 'l-spot-2', room: 'salon', style: 'spot', pos: [-2, 2.98, -2] },
    { id: 'l-spot-3', room: 'salon', style: 'spot', pos: [0, 2.98, -2] },
    { id: 'l-spot-4', room: 'salon', style: 'spot', pos: [0, 2.98, 1.5] },
    { id: 'l-spot-5', room: 'salon', style: 'spot', pos: [2, 2.98, 1.5] },
    { id: 'l-spot-6', room: 'salon', style: 'spot', pos: [2, 2.98, -2] },
    { id: 'l-escalier', room: 'salon', style: 'spot', pos: [-6.15, 2.98, 1.0] },
    { id: 'l-susp-1', room: 'cuisine', style: 'pendant', pos: [4.2, 2.3, 1.2 - 2.4] },
    { id: 'l-table', room: 'cuisine', style: 'linear', pos: [4.9, 1.85, 2.4] },
    { id: 'l-cuisine-1', room: 'cuisine', style: 'spot', pos: [3.6, 2.98, -2.6] },
    { id: 'l-cuisine-2', room: 'cuisine', style: 'spot', pos: [5.2, 2.98, -2.6] },
    { id: 'l-palier', room: 'etage', style: 'disc', pos: [-4.0, 6.18, -0.6], ceiling: true },
    { id: 'l-chambre', room: 'etage', style: 'disc', pos: [0, 6.18, -0.6], ceiling: true },
    { id: 'l-suite', room: 'etage', style: 'disc', pos: [5.4, 6.18, -0.6], ceiling: true },
    { id: 'l-sdb', room: 'sdb', style: 'disc', pos: [-4.6, 6.18, 2.3], ceiling: true },
    { id: 'l-sous-face-1', room: 'exterieur', style: 'spot', pos: [7.75, 2.97, 2.0], level: 'upper' },
    { id: 'l-sous-face-2', room: 'exterieur', style: 'spot', pos: [7.75, 2.97, 0], level: 'upper' },
    { id: 'l-sous-face-3', room: 'exterieur', style: 'spot', pos: [7.75, 2.97, -2.0], level: 'upper' },
];

const OUTLETS = [
    { id: 'o-salon-1', pos: [-2.4, 0.3, -4.19], facing: '+z' },
    { id: 'o-salon-2', pos: [-0.3, 0.3, -4.19], facing: '+z' },
    { id: 'o-salon-3', pos: [1.8, 0.3, -4.19], facing: '+z' },
    { id: 'o-cuisine-1', pos: [3.55, 1.1, -4.19], facing: '+z' },
    { id: 'o-cuisine-2', pos: [3.95, 1.1, -4.19], facing: '+z' },
    { id: 'o-cuisine-3', pos: [5.25, 1.1, -4.19], facing: '+z' },
    { id: 'o-chambre-1', pos: [-1.25, 3.6, -4.19], facing: '+z' },
    { id: 'o-chambre-2', pos: [1.25, 3.6, -4.19], facing: '+z' },
    { id: 'o-suite-1', pos: [4.1, 3.6, -4.19], facing: '+z' },
    { id: 'o-suite-2', pos: [6.7, 3.6, -4.19], facing: '+z' },
];

const SWITCHES = [
    { id: 's-salon', pos: [-3.43, 1.15, 1.95], facing: '+x' },
    { id: 's-cuisine', pos: [2.85, 1.15, -4.19], facing: '+z' },
    { id: 's-chambre', pos: [-2.43, 4.4, -2.6], facing: '+x' },
    { id: 's-suite', pos: [2.57, 4.4, -2.6], facing: '+x' },
    { id: 's-sdb', pos: [-3.7, 4.4, 1.27], facing: '+z' },
];

function haloSprite(color, size) {
    const mat = new THREE.SpriteMaterial({ map: glow(), color: new THREE.Color(color), transparent: true, depthWrite: false, opacity: 0, toneMapped: false });
    const s = new THREE.Sprite(mat);
    s.scale.setScalar(size);
    s.renderOrder = 30;
    return s;
}

/* ---------------------------------------------------------------- */

function panel(parent, ctx) {
    const { M, reg } = ctx;
    const W = 0.6;
    const HGT = 0.95;
    const D = 0.14;
    const MOD = 0.04;
    const g = group('electrical_panel', parent);
    g.position.set(PANEL_POS[0], PANEL_POS[1], PANEL_POS[2]);

    const haloMat = new THREE.MeshBasicMaterial({ map: glow(), color: '#F2B705', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), haloMat);
    halo.position.z = -D / 2 + 0.004;
    halo.renderOrder = 5;
    g.add(halo);

    const accent = new THREE.MeshStandardMaterial({ color: '#F2B705', emissive: '#F2B705', emissiveIntensity: 0, roughness: 0.4 });
    const led = new THREE.MeshStandardMaterial({ color: '#1a1a1a', emissive: '#5dff8f', emissiveIntensity: 1.5 });
    boxC(g, M.lacquer, W, HGT, D, 0, 0, 0);
    boxC(g, M.deviceGrey, W - 0.06, HGT - 0.08, 0.004, 0, 0, D / 2 + 0.002, { cast: false });

    // hinged smoked-glass door, closed at rest
    const door = group('panel_door', g);
    door.position.set(-W / 2, 0, D / 2 + 0.008);
    const doorGlass = new THREE.MeshPhysicalMaterial({ color: '#d7dde2', roughness: 0.1, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide });
    boxC(door, doorGlass, W, HGT, 0.008, W / 2, 0, 0, { cast: false });
    boxC(door, M.lacquer, 0.02, HGT, 0.012, 0.01, 0, 0, { cast: false });
    boxC(door, M.lacquer, 0.02, HGT, 0.012, W - 0.01, 0, 0, { cast: false });
    boxC(door, M.steel, 0.012, 0.1, 0.02, W - 0.05, 0, 0.012, { cast: false });

    const pattern = [
        [['main', 2], ['spd', 2], ['rcd', 2], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['e', 2]],
        [['rcd', 2], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['e', 1], ['e', 1], ['e', 1], ['e', 1]],
        [['rcd', 2], ['b', 1], ['b', 1], ['b', 1], ['b', 1], ['s', 1], ['s', 1], ['s', 1], ['e', 1], ['e', 1], ['e', 1]],
        [['rcd', 2], ['b', 1], ['b', 1], ['s', 1], ['s', 1], ['t', 2], ['t', 2], ['e', 1], ['e', 1], ['e', 1]],
    ];
    const labelColors = [M.deviceWhite, new THREE.MeshStandardMaterial({ color: '#f6e7a8', roughness: 0.6 }), new THREE.MeshStandardMaterial({ color: '#cfe6f7', roughness: 0.6 })];
    pattern.forEach((row, r) => {
        const y = HGT / 2 - 0.17 - r * 0.205;
        const rowG = group('row', g);
        rowG.position.set(0, y, D / 2);
        boxC(rowG, M.deviceWhite, W - 0.08, 0.025, 0.01, 0, 0.07, 0.006, { cast: false });
        let cursor = -6.5 * MOD;
        row.forEach(([type, n], k) => {
            const w = n * MOD;
            const x = cursor + w / 2;
            cursor += w;
            if (type === 'e') {
                boxC(rowG, M.deviceGrey, w - 0.002, 0.09, 0.008, x, 0, 0.005, { cast: false });
                return;
            }
            const toggle = type === 'rcd' ? accent : type === 'main' || type === 's' ? M.lacquerDark : M.metalBlack;
            boxC(rowG, M.deviceWhite, w - 0.003, 0.11, 0.045, x, 0, 0.022);
            boxC(rowG, toggle, Math.min(w * 0.45, 0.026), 0.03, 0.012, x, 0.012, 0.048, { cast: false });
            if (type === 'rcd') cyl(rowG, accent, 0.006, 0.006, 0.006, x + w * 0.3, -0.03, 0.046, 10, { rx: Math.PI / 2, cast: false });
            if (type === 't') boxC(rowG, led, 0.012, 0.006, 0.004, x, -0.03, 0.046, { cast: false });
            // circuit label (repérage)
            boxC(rowG, labelColors[(r + k) % 3], w - 0.008, 0.014, 0.002, x, -0.049, 0.046, { cast: false });
        });
    });
    reg.panel = { group: g, door, haloMat, accent };
    return g;
}

function outlet(parent, M, d) {
    const g = group(d.id, parent);
    g.position.set(d.pos[0], d.pos[1], d.pos[2]);
    g.rotation.y = FACING[d.facing];
    boxC(g, M.deviceWhite, 0.085, 0.085, 0.012, 0, 0, 0.006);
    cyl(g, M.deviceGrey, 0.027, 0.027, 0.004, 0, 0, 0.013, 20, { rx: Math.PI / 2, cast: false });
    for (const dx of [-0.009, 0.009]) cyl(g, M.metalBlack, 0.0035, 0.0035, 0.004, dx, 0, 0.0155, 8, { rx: Math.PI / 2, cast: false });
    return g;
}

function lightSwitch(parent, M, d) {
    const g = group(d.id, parent);
    g.position.set(d.pos[0], d.pos[1], d.pos[2]);
    g.rotation.y = FACING[d.facing];
    boxC(g, M.deviceWhite, 0.085, 0.085, 0.012, 0, 0, 0.006);
    boxC(g, M.deviceGrey, 0.05, 0.05, 0.008, 0, 0, 0.015, { cast: false });
    return g;
}

function luminaire(parent, ctx, d) {
    const { M, reg } = ctx;
    const emissive = ledMaterial('#ffcf87', 0);
    const [x, y, z] = d.pos;
    const g = group(d.id, parent);
    const ceil = y > 4 ? H.upperCeil : H.groundCeil;
    let size = 1.0;
    switch (d.style) {
        case 'spot':
            g.position.set(x, y, z);
            cyl(g, M.lightHousing, 0.075, 0.075, 0.035, 0, 0, 0, 24, { cast: false });
            cyl(g, emissive, 0.05, 0.05, 0.004, 0, -0.019, 0, 24, { cast: false });
            break;
        case 'disc':
            g.position.set(x, y - 0.02, z);
            cyl(g, M.lightHousing, 0.3, 0.3, 0.05, 0, 0, 0, 40);
            cyl(g, emissive, 0.27, 0.27, 0.006, 0, -0.027, 0, 40, { cast: false });
            size = 1.6;
            break;
        case 'pendant': {
            // three pendants over the island
            g.position.set(0, 0, 0);
            for (const px of [4.2, 4.9, 5.6]) {
                const cord = ceil - 2.05 - 0.16;
                cyl(g, M.metalBlack, 0.005, 0.005, cord, px, 2.05 + 0.16 + cord / 2, -1.2, 6, { cast: false });
                cyl(g, M.metalBlack, 0.05, 0.17, 0.22, px, 2.11, -1.2, 32, { open: true });
                cyl(g, M.metalBlack, 0.05, 0.05, 0.01, px, 2.22, -1.2, 24);
                const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 12), emissive);
                bulb.position.set(px, 2.01, -1.2);
                g.add(bulb);
            }
            size = 1.2;
            break;
        }
        case 'linear': {
            g.position.set(x, y, z);
            const cord = ceil - y - 0.03;
            for (const dx of [-0.65, 0.65]) cyl(g, M.metalBlack, 0.004, 0.004, cord, dx, cord / 2 + 0.03, 0, 6, { cast: false });
            boxC(g, M.metalBlack, 1.7, 0.05, 0.07, 0, 0, 0);
            boxC(g, emissive, 1.62, 0.006, 0.04, 0, -0.027, 0, { cast: false });
            size = 1.6;
            break;
        }
    }
    reg.lights.push({ id: d.id, room: d.room, material: emissive, ceiling: !!d.ceiling });
    return g;
}

function bollard(parent, ctx, x, z) {
    const { M, reg } = ctx;
    const emissive = ledMaterial('#ffcf87', 0);
    const g = group('garden_bollard', parent);
    g.position.set(x, -0.15, z);
    cyl(g, M.frame, 0.07, 0.07, 0.7, 0, 0.35, 0, 24);
    cyl(g, emissive, 0.072, 0.072, 0.08, 0, 0.6, 0, 24, { cast: false });
    reg.lights.push({ id: 'bollard', room: 'exterieur', material: emissive });
}

function hob(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('hob', parent);
    g.position.set(5.3, 0.925, -1.2);
    boxC(g, M.screen, 0.6, 0.008, 0.5, 0, 0, 0);
    const ring = new THREE.MeshStandardMaterial({ color: '#2a2a2a', emissive: '#ff6a2b', emissiveIntensity: 0, roughness: 0.4 });
    for (const [dx, dz] of [[-0.15, -0.11], [0.15, -0.11], [-0.15, 0.12], [0.15, 0.12]]) {
        const r = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.078, 32), ring);
        r.rotation.x = -Math.PI / 2;
        r.position.set(dx, 0.005, dz);
        g.add(r);
    }
    reg.kitchen.hobRing = ring;
}

function inverter(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('pv_inverter', parent);
    g.position.set(-6.3, 1.55, 1.27);
    boxC(g, M.deviceWhite, 0.4, 0.52, 0.14, 0, 0, 0.07);
    boxC(g, M.screen, 0.18, 0.08, 0.004, 0, 0.1, 0.142, { cast: false });
    const led = new THREE.MeshStandardMaterial({ color: '#222', emissive: '#5be38a', emissiveIntensity: 0.6 });
    boxC(g, led, 0.1, 0.012, 0.004, 0, -0.04, 0.142, { cast: false });
    cyl(g, M.deviceGrey, 0.03, 0.03, 0.004, 0.12, -0.17, 0.142, 20, { rx: Math.PI / 2, cast: false });
    reg.inverterLed = led;
}

function towelRadiator(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('towel_radiator', parent);
    g.position.set(-6.62, H.upperFloor, 2.35);
    g.rotation.y = Math.PI / 2;
    const bars = new THREE.MeshStandardMaterial({ color: '#e7e9eb', metalness: 1, roughness: 0.14, emissive: '#ff7a3d', emissiveIntensity: 0 });
    for (const dx of [-0.22, 0.22]) cyl(g, bars, 0.018, 0.018, 1.45, dx, 1.05, 0.06, 12);
    const rows = [0.45, 0.53, 0.61, 0.69, 0.92, 1.0, 1.08, 1.16, 1.39, 1.47, 1.55, 1.63];
    for (const y of rows) cyl(g, bars, 0.011, 0.011, 0.6, 0, y, 0.09, 10, { rz: Math.PI / 2 });
    for (const dx of [-0.22, 0.22]) {
        boxC(g, M.chrome, 0.03, 0.03, 0.06, dx, 0.4, 0.03, { cast: false });
        boxC(g, M.chrome, 0.03, 0.03, 0.06, dx, 1.7, 0.03, { cast: false });
    }
    // thermostat box and towels
    boxC(g, M.deviceWhite, 0.07, 0.12, 0.05, 0.3, 0.42, 0.06);
    const t1 = boxC(g, M.towel, 0.4, 0.5, 0.03, -0.02, 1.32, 0.12);
    t1.rotation.x = 0.02;
    boxC(g, M.towelLight, 0.34, 0.36, 0.03, 0.03, 0.82, 0.12);
    // subtle heat shimmer in front of the bars (shader plane)
    const heat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform float uTime; uniform float uAmount; varying vec2 vUv;
            void main(){
                float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
                float rise = smoothstep(0.0, 0.2, vUv.y) * (1.0 - vUv.y);
                float wave = 0.55 + 0.45 * sin(vUv.y * 22.0 - uTime * 2.4 + sin(vUv.x * 9.0 + uTime) * 1.5);
                gl_FragColor = vec4(1.0, 0.55, 0.25, edge * rise * wave * 0.22 * uAmount);
            }`,
    });
    const heatPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.9), heat);
    heatPlane.position.set(0, 1.15, 0.2);
    heatPlane.renderOrder = 6;
    g.add(heatPlane);
    reg.radiator = { bars, heat };
}

function wallCharger(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('ev_charger', parent);
    g.position.set(-7.02, 0, -0.2);
    g.rotation.y = -Math.PI / 2;
    const body = new THREE.MeshPhysicalMaterial({ color: '#202327', roughness: 0.3, clearcoat: 1 });
    const led = new THREE.MeshStandardMaterial({ color: '#111', emissive: '#4cd987', emissiveIntensity: 0.2 });
    boxC(g, body, 0.3, 0.42, 0.13, 0, 1.12, 0.065);
    boxC(g, M.deviceGrey, 0.26, 0.38, 0.004, 0, 1.12, 0.132, { cast: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.05, 32), led);
    ring.position.set(0, 1.22, 0.136);
    g.add(ring);
    // cable holster and coiled cable start
    boxC(g, M.metalBlack, 0.08, 0.1, 0.08, 0, 0.82, 0.07);
    reg.charger = { group: g, led };
}

function heatPump(parent, ctx) {
    const { M } = ctx;
    const g = group('heat_pump', parent);
    g.position.set(2.6, -0.15, -5.9);
    box(g, M.stone, 1.25, 0.1, 0.6, 0, 0, 0);
    box(g, M.deviceGrey, 1.05, 0.78, 0.4, 0, 0.11, 0);
    cyl(g, M.metalBlack, 0.28, 0.28, 0.01, -0.15, 0.5, -0.205, 32, { rx: Math.PI / 2 });
}

/* ---------------------------------------------------------------- */

export function buildDevices(levels, ctx) {
    const { M, reg } = ctx;
    reg.lights = [];
    const ground = levels.ground;
    const sockets = group('sockets', levels.house);
    const lighting = group('lighting', levels.house);
    const lightingRoof = group('lighting_ceiling_first_floor', levels.roof);

    panel(levels.entrance, ctx);
    inverter(levels.entrance, ctx);
    for (const d of OUTLETS) outlet(sockets, M, d);
    for (const d of SWITCHES) lightSwitch(sockets, M, d);
    for (const d of LIGHTS) {
        const parent = d.ceiling ? lightingRoof : d.level === 'upper' ? levels.upper : lighting;
        luminaire(parent, ctx, d);
    }
    for (const z of [6.6, 8.6, 10.6]) bollard(ground, ctx, -3.7, z);
    hob(ground, ctx);
    towelRadiator(levels.upper, ctx);
    wallCharger(ground, ctx);
    heatPump(ground, ctx);

    // highlight sprite reused by the hotspots of the current step
    reg.focusHalo = haloSprite('#F2B705', 0.9);
    levels.house.add(reg.focusHalo);
}
