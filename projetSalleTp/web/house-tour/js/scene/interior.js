/*
 * Furniture and room fittings. Appliances that the tour presents keep a
 * handle in ctx.reg so the scene effects can light them up.
 */
import * as THREE from 'three';
import { box, boxC, cyl, group, rbox, rug } from './kit.js';
import { H } from './house.js';
import { ledMaterial } from './materials.js';

function plant(parent, M, x, y, z, h = 1.2) {
    const g = group('plant', parent);
    g.position.set(x, y, z);
    cyl(g, M.pot, 0.2, 0.16, 0.44, 0, 0.22, 0);
    cyl(g, M.bark, 0.012, 0.018, h * 0.7, 0, h * 0.4, 0, 6);
    const leaves = [
        [0, h * 0.75, 0],
        [0.14, h * 0.62, 0.05],
        [-0.12, h * 0.68, -0.08],
        [0.05, h * 0.9, -0.1],
        [-0.08, h * 0.55, 0.12],
    ];
    leaves.forEach((p, i) => {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 + (i % 3) * 0.04, 1), i % 2 ? M.foliage : M.foliageDark);
        m.position.set(p[0], p[1], p[2]);
        m.scale.set(1, 0.8, 1);
        m.castShadow = true;
        g.add(m);
    });
    return g;
}

function chair(parent, M, x, y, z, ry) {
    const g = group('chair', parent);
    g.position.set(x, y, z);
    g.rotation.y = ry;
    rbox(g, M.fabricSand, 0.46, 0.06, 0.46, 0, 0.42, 0, 0.02);
    rbox(g, M.fabricSand, 0.46, 0.42, 0.05, 0, 0.48, -0.21, 0.02);
    for (const [a, b] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) box(g, M.metalBlack, 0.03, 0.42, 0.03, a, 0, b);
}

function stool(parent, M, x, y, z) {
    cyl(parent, M.oak, 0.19, 0.19, 0.05, x, y + 0.7, z);
    cyl(parent, M.metalBlack, 0.02, 0.02, 0.68, x, y + 0.34, z, 8);
    cyl(parent, M.metalBlack, 0.18, 0.18, 0.02, x, y + 0.01, z);
}

function bed(parent, M, x, y, z, w) {
    const g = group('bed', parent);
    g.position.set(x, y, z);
    box(g, M.walnut, w + 0.1, 0.25, 2.1, 0, 0, 0);
    rbox(g, M.linen, w, 0.24, 2.0, 0, 0.25, 0.02, 0.06);
    rbox(g, M.fabricSand, w + 0.04, 0.06, 1.25, 0, 0.46, 0.38, 0.03);
    rbox(g, M.linen, w / 2 - 0.1, 0.14, 0.4, -w / 4, 0.48, -0.75, 0.06);
    rbox(g, M.linen, w / 2 - 0.1, 0.14, 0.4, w / 4, 0.48, -0.75, 0.06);
    box(g, M.fabricLight, w + 0.5, 1.05, 0.08, 0, 0, -1.07);
    for (const side of [-1, 1]) {
        box(g, M.oak, 0.48, 0.45, 0.4, side * (w / 2 + 0.38), 0, -0.82);
        cyl(g, M.ceramic, 0.07, 0.1, 0.28, side * (w / 2 + 0.38), 0.62, -0.85, 20);
    }
}

/* ---------------------------------------------------------------- */

function livingRoom(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('living_room', parent);
    rug(g, '#d9d0c1', 3.6, 2.6, -0.4, 0, -1.6);
    // sofa facing the TV wall
    const sofa = group('sofa', g);
    sofa.position.set(-0.5, 0, 0.35);
    rbox(sofa, M.fabricLight, 3.0, 0.36, 0.98, 0, 0.08, 0, 0.06);
    rbox(sofa, M.fabricLight, 3.0, 0.78, 0.26, 0, 0.08, 0.36, 0.08);
    rbox(sofa, M.fabricLight, 0.22, 0.6, 0.98, -1.42, 0.08, 0, 0.07);
    rbox(sofa, M.fabricLight, 0.22, 0.6, 0.98, 1.42, 0.08, 0, 0.07);
    for (const x of [-0.85, 0, 0.85]) rbox(sofa, M.fabricLight, 0.84, 0.14, 0.72, x, 0.44, -0.05, 0.06);
    rbox(sofa, M.fabricSand, 0.5, 0.42, 0.14, -0.9, 0.52, 0.18, 0.06);
    rbox(sofa, M.fabricDark, 0.46, 0.4, 0.14, 0.95, 0.52, 0.18, 0.06);
    box(sofa, M.metalBlack, 2.9, 0.08, 0.9, 0, 0, 0);
    reg.occluders.push(...sofa.children);
    // coffee table
    cyl(g, M.marble, 0.55, 0.55, 0.05, -0.4, 0.365, -1.3, 48);
    cyl(g, M.metalBlack, 0.2, 0.28, 0.32, -0.4, 0.16, -1.3, 32);
    box(g, M.lacquerDark, 0.26, 0.05, 0.2, -0.25, 0.39, -1.25);
    // armchair
    const arm = group('armchair', g);
    arm.position.set(1.9, 0, -1.4);
    arm.rotation.y = -Math.PI / 2.4;
    rbox(arm, M.leather, 0.85, 0.36, 0.85, 0, 0.06, 0, 0.08);
    rbox(arm, M.leather, 0.85, 0.72, 0.18, 0, 0.06, 0.34, 0.08);
    box(arm, M.oak, 0.7, 0.06, 0.7, 0, 0, 0);
    // TV wall: console, screen and indirect LED strip behind it
    box(g, M.walnut, 3.6, 0.42, 0.42, -0.3, 0, -3.95);
    box(g, M.lacquer, 3.6, 0.015, 0.42, -0.3, 0.42, -3.95);
    const tvScreen = new THREE.MeshStandardMaterial({ color: '#0b0c0e', emissive: '#9bb7d6', emissiveIntensity: 0, roughness: 0.12, metalness: 0.2 });
    box(g, M.metalBlack, 2.12, 1.2, 0.04, -0.3, 1.09, -4.13);
    boxC(g, tvScreen, 2.06, 1.14, 0.01, -0.3, 1.69, -4.105, { name: 'tv_screen' });
    const ledStrip = ledMaterial('#ffcf87', 0);
    boxC(g, ledStrip, 2.0, 0.02, 0.02, -0.3, 2.31, -4.16, { cast: false, name: 'led_indirect' });
    boxC(g, ledStrip, 3.4, 0.015, 0.02, -0.3, 0.41, -3.74, { cast: false });
    cyl(g, M.ceramic, 0.12, 0.12, 0.24, 1.1, 0.55, -3.95, 24);
    // floor lamp
    const lampShade = ledMaterial('#ffdca8', 0);
    cyl(g, M.metalBlack, 0.012, 0.012, 1.6, -2.4, 0.8, 0.55, 8);
    cyl(g, M.linen, 0.18, 0.24, 0.3, -2.4, 1.65, 0.55, 32, { open: true });
    cyl(g, lampShade, 0.17, 0.17, 0.01, -2.4, 1.52, 0.55, 24, { cast: false });
    cyl(g, M.metalBlack, 0.16, 0.16, 0.02, -2.4, 0.01, 0.55);
    plant(g, M, 2.55, 0, 3.6, 1.6);
    // table lamp on the console, plugged into the outlet below (lights up on step 2)
    const tableLamp = ledMaterial('#ffd59a', 0);
    cyl(g, M.ceramic, 0.07, 0.1, 0.22, -1.82, 0.54, -3.98, 24);
    tableLamp.side = THREE.DoubleSide;
    cyl(g, tableLamp, 0.13, 0.17, 0.2, -1.82, 0.75, -3.98, 32, { open: true });
    boxC(g, M.deviceWhite, 0.045, 0.055, 0.035, -2.4, 0.3, -4.155);
    const cord = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.4, 0.28, -4.14),
        new THREE.Vector3(-2.33, 0.02, -4.1),
        new THREE.Vector3(-2.14, 0.012, -4.12),
        new THREE.Vector3(-2.06, 0.2, -4.15),
        new THREE.Vector3(-1.9, 0.45, -4.12),
        new THREE.Vector3(-1.84, 0.46, -4.02),
    ]);
    const cordMesh = new THREE.Mesh(new THREE.TubeGeometry(cord, 40, 0.005, 6), M.deviceWhite);
    g.add(cordMesh);
    reg.living = { tvScreen, ledStrip, lampShade, tableLamp };
    return g;
}

function hall(parent, ctx) {
    const { M } = ctx;
    const g = group('hall', parent);
    box(g, M.oak, 0.4, 0.45, 1.3, -4.0, 0, 3.6);
    rbox(g, M.fabricSand, 0.38, 0.06, 1.2, -4.0, 0.45, 3.6, 0.02);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.012, 8, 48), M.brass);
    ring.position.set(-3.58, 1.7, 3.6);
    ring.rotation.y = Math.PI / 2;
    g.add(ring);
    const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.31, 48), M.mirror);
    mirror.position.set(-3.575, 1.7, 3.6);
    mirror.rotation.y = Math.PI / 2;
    g.add(mirror);
    plant(g, M, -6.3, 0, 3.8, 1.1);
    rug(g, '#cfc5b4', 1.2, 1.8, -4.85, 0, 3.0);
    return g;
}

function kitchen(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('kitchen', parent);
    // base units, worktop and integrated dishwasher (back wall)
    box(g, M.taupe, 2.35, 0.86, 0.6, 4.275, 0, -3.9);
    box(g, M.quartz, 2.37, 0.04, 0.64, 4.275, 0.86, -3.9);
    box(g, M.metalBlack, 2.3, 0.08, 0.02, 4.275, 0, -3.59, { cast: false });
    for (const x of [3.45, 5.1]) box(g, M.steel, 0.4, 0.015, 0.02, x, 0.78, -3.585, { cast: false });
    // dishwasher door with its status light
    const dwLed = ledMaterial('#7dd3a3', 0.6);
    box(g, M.taupe, 0.6, 0.78, 0.02, 4.55, 0.08, -3.585, { name: 'dishwasher' });
    box(g, M.steel, 0.42, 0.015, 0.02, 4.55, 0.8, -3.57, { cast: false });
    boxC(g, dwLed, 0.05, 0.008, 0.004, 4.55, 0.1, -3.574, { cast: false });
    // sink and tap
    box(g, M.steel, 0.55, 0.01, 0.42, 3.65, 0.89, -3.88);
    cyl(g, M.brass, 0.015, 0.015, 0.36, 3.65, 1.08, -4.08, 10);
    const spout = boxC(g, M.brass, 0.02, 0.02, 0.2, 3.65, 1.25, -3.99);
    spout.rotation.x = 0.2;
    // wall cabinets with the under-cabinet LED strip
    box(g, M.oak, 2.35, 0.9, 0.35, 4.275, 1.45, -4.02);
    for (let i = 0; i < 4; i++) box(g, M.walnut, 0.005, 0.86, 0.01, 3.1 + 0.5875 * (i + 1) - 0.01, 1.47, -3.84, { cast: false });
    const counterLed = ledMaterial('#ffd9a0', 0);
    boxC(g, counterLed, 2.25, 0.012, 0.03, 4.275, 1.44, -3.9, { cast: false, name: 'under_cabinet_led' });
    // tall column: built-in oven
    box(g, M.taupe, 0.6, 2.35, 0.6, 5.75, 0, -3.9);
    box(g, M.screen, 0.56, 0.58, 0.02, 5.75, 0.85, -3.59, { name: 'oven' });
    boxC(g, M.steel, 0.46, 0.022, 0.03, 5.75, 1.36, -3.565, { cast: false });
    const ovenLed = ledMaterial('#ffb35c', 0.4);
    boxC(g, ovenLed, 0.14, 0.03, 0.004, 5.75, 1.47, -3.578, { cast: false });
    box(g, M.screen, 0.56, 0.38, 0.02, 5.75, 1.55, -3.59);
    // tall column: fridge-freezer
    box(g, M.taupe, 0.62, 2.35, 0.6, 6.38, 0, -3.9, { name: 'fridge' });
    box(g, M.taupe, 0.003, 2.2, 0.01, 6.38, 0.1, -3.595, { cast: false });
    boxC(g, M.lacquerDark, 0.6, 0.006, 0.01, 6.38, 0.82, -3.595, { cast: false });
    boxC(g, M.steel, 0.02, 0.6, 0.03, 6.13, 1.3, -3.57, { cast: false });
    boxC(g, M.steel, 0.02, 0.32, 0.03, 6.13, 0.55, -3.57, { cast: false });
    // island with the hob, and the suspended hood above it
    box(g, M.taupe, 2.4, 0.88, 1.0, 4.9, 0, -1.2);
    box(g, M.quartz, 2.5, 0.04, 1.06, 4.9, 0.88, -1.2);
    rbox(g, M.metalBlack, 0.95, 0.12, 0.55, 5.3, 2.12, -1.2, 0.02, { name: 'hood' });
    const hoodLed = ledMaterial('#ffe2b0', 0);
    boxC(g, hoodLed, 0.8, 0.008, 0.36, 5.3, 2.115, -1.2, { cast: false });
    for (const dz of [-0.2, 0.2]) cyl(g, M.metalBlack, 0.006, 0.006, 0.76, 5.3, 2.62, -1.2 + dz, 6);
    for (const x of [4.2, 4.9, 5.6]) stool(g, M, x, 0, -0.35);
    // dining
    box(g, M.walnut, 2.1, 0.04, 0.95, 4.9, 0.72, 2.4);
    for (const dx of [-0.95, 0.95]) box(g, M.metalBlack, 0.06, 0.72, 0.85, 4.9 + dx, 0, 2.4);
    for (const dx of [-0.65, 0, 0.65]) {
        chair(g, M, 4.9 + dx, 0, 1.75, 0);
        chair(g, M, 4.9 + dx, 0, 3.05, Math.PI);
    }
    cyl(g, M.ceramic, 0.1, 0.07, 0.2, 4.9, 0.86, 2.4, 24);
    // fruit bowl and bottle on the island
    cyl(g, M.oak, 0.16, 0.09, 0.07, 4.2, 0.955, -1.25, 24);
    cyl(g, M.foliageDark, 0.035, 0.035, 0.28, 3.95, 1.06, -1.0, 12);
    reg.kitchen = { counterLed, hoodLed, ovenLed, dwLed };
    return g;
}

function bedrooms(parent, ctx) {
    const { M } = ctx;
    const y = H.upperFloor;
    const g = group('bedrooms', parent);
    rug(g, '#cfc6b8', 2.6, 2.4, 0, y, -2.2);
    bed(g, M, 0, y, -3.05, 1.6);
    box(g, M.oak, 1.4, 0.75, 0.6, -1.6, y, 2.6);
    chair(g, M, -1.6, y, 2.05, Math.PI);
    box(g, M.lacquer, 0.6, 2.2, 1.8, 1.9, y, 1.2);
    rug(g, '#d6cdbf', 3.2, 2.6, 5.4, y, -2.2);
    bed(g, M, 5.4, y, -3.0, 1.8);
    rbox(g, M.fabricDark, 1.6, 0.45, 0.42, 5.4, y, -1.45, 0.04);
    box(g, M.walnut, 0.6, 2.3, 2.4, 3.0, y, 1.0);
    plant(g, M, 7.7, y, -0.3, 1.3);
    plant(g, M, -3.1, y, -3.7, 1.2);
    return g;
}

function bathroom(parent, ctx) {
    const { M, reg } = ctx;
    const y = H.upperFloor;
    const g = group('bathroom', parent);
    const tileH = 2.45;
    // tiled walls (left wall, front wall around the window, door wall)
    box(g, M.tiles, 0.012, tileH, 2.04, -6.692, y, 2.28, { cast: false });
    box(g, M.tiles, 1.3, tileH, 0.012, -6.05, y, 3.294, { cast: false });
    box(g, M.tiles, 0.9, 1.1, 0.012, -4.95, y, 3.294, { cast: false });
    box(g, M.tiles, 2.0, tileH, 0.012, -3.5, y, 3.294, { cast: false });
    box(g, M.tiles, 2.0, tileH, 0.012, -5.7, y, 1.266, { cast: false });
    box(g, M.tiles, 1.3, tileH, 0.012, -3.2, y, 1.266, { cast: false });
    box(g, M.tiles, 0.012, tileH, 2.04, -2.568, y, 2.28, { cast: false });
    // walk-in shower: tray, glass screen, rain head
    box(g, M.ceramic, 1.25, 0.04, 0.9, -3.2, y, 2.82);
    const screen = box(g, M.showerGlass, 0.012, 2.0, 0.9, -3.83, y + 0.04, 2.82, { cast: false });
    screen.renderOrder = 3;
    box(g, M.chrome, 0.02, 2.0, 0.02, -3.83, y + 0.04, 2.37, { cast: false });
    cyl(g, M.chrome, 0.012, 0.012, 0.5, -3.2, y + 2.25, 3.05, 8, { rx: Math.PI / 2 });
    cyl(g, M.chrome, 0.12, 0.12, 0.015, -3.2, y + 2.2, 2.82, 32);
    cyl(g, M.chrome, 0.012, 0.012, 1.1, -2.62, y + 1.4, 3.05, 8);
    // floating vanity with vessel basin, tap and round backlit mirror
    box(g, M.walnut, 1.1, 0.4, 0.45, -3.3, y + 0.45, 1.5);
    box(g, M.oak, 1.12, 0.03, 0.47, -3.3, y + 0.85, 1.5);
    const basin = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.ceramic);
    basin.scale.set(1, 0.55, 0.8);
    basin.rotation.x = Math.PI;
    basin.position.set(-3.3, y + 0.99, 1.52);
    basin.castShadow = true;
    g.add(basin);
    cyl(g, M.chrome, 0.012, 0.012, 0.28, -3.3, y + 1.02, 1.31, 10);
    boxC(g, M.chrome, 0.02, 0.02, 0.14, -3.3, y + 1.15, 1.37);
    const mirrorLed = ledMaterial('#ffe0b8', 0.6);
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.43, 64), mirrorLed);
    halo.position.set(-3.3, y + 1.55, 1.272);
    g.add(halo);
    const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.38, 64), M.mirror);
    mirror.position.set(-3.3, y + 1.55, 1.282);
    g.add(mirror);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.012, 8, 64), M.metalBlack);
    frame.position.copy(mirror.position);
    g.add(frame);
    // bottles and towels
    cyl(g, M.brass, 0.03, 0.03, 0.16, -3.7, y + 0.95, 1.4, 12);
    rbox(g, M.towelLight, 0.3, 0.05, 0.22, -2.95, y + 0.88, 1.55, 0.02);
    rug(g, '#b9b2a6', 0.9, 0.55, -4.4, y, 2.2);
    reg.bathroom = { mirrorLed };
    return g;
}

export function buildInterior(levels, ctx) {
    livingRoom(levels.ground, ctx);
    hall(levels.entrance, ctx);
    kitchen(levels.ground, ctx);
    bedrooms(levels.upper, ctx);
    bathroom(levels.upper, ctx);
}
