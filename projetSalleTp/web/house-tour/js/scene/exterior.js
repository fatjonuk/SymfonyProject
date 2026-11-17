/*
 * Garden, pool, terrace, driveway, carport, electric car and sky dome.
 */
import * as THREE from 'three';
import { box, boxC, cyl, group, rbox } from './kit.js';

const G = -0.15; // natural ground level

function tree(parent, M, px, pz, s = 1) {
    const g = group('tree', parent);
    g.position.set(px, G, pz);
    g.scale.setScalar(s);
    let seed = Math.abs(px * 13.1 + pz * 7.7) + 1;
    const r = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    cyl(g, M.bark, 0.05, 0.11, 3.2, 0, 1.6, 0, 10);
    for (let i = 0; i < 4; i++) {
        const a = r() * Math.PI * 2;
        const tilt = 0.35 + r() * 0.3;
        const b = cyl(g, M.bark, 0.02, 0.04, 1.4, Math.cos(a) * 0.35, 2.6 + r() * 1.2, Math.sin(a) * 0.35, 6);
        b.rotation.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
    }
    const geo = new THREE.IcosahedronGeometry(1, 2);
    for (let i = 0; i < 34; i++) {
        const a = r() * Math.PI * 2;
        const h = r();
        const rad = (0.35 + 0.9 * Math.sin(h * Math.PI)) * (0.6 + r() * 0.5);
        const m = new THREE.Mesh(geo, r() > 0.6 ? M.foliageDark : M.foliage);
        const size = 0.32 + r() * 0.26;
        m.scale.set(size, size * 0.85, size);
        m.position.set(Math.cos(a) * rad, 2.6 + h * 2.6, Math.sin(a) * rad);
        m.castShadow = true;
        g.add(m);
    }
}

function hedge(parent, M, x, z, w, h, d) {
    box(parent, M.concrete, w + 0.12, h * 0.5, d + 0.12, x, G, z);
    rbox(parent, M.foliage, w, h, d, x, G + 0.12, z, 0.16);
}

function grass(parent, M, x, z, w, d) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M.lawn);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, G + 0.004, z);
    m.receiveShadow = true;
    parent.add(m);
}

function lounger(parent, M, x, z, ry) {
    const g = group('lounger', parent);
    g.position.set(x, -0.02, z);
    g.rotation.y = ry;
    boxC(g, M.frame, 0.7, 0.05, 1.9, 0, 0.15, 0);
    rbox(g, M.linen, 0.66, 0.08, 1.3, 0, 0.18, 0.28, 0.03);
    const back = rbox(g, M.linen, 0.66, 0.08, 0.65, 0, 0.36, -0.62, 0.03);
    back.rotation.x = 0.75;
}

/** Electric estate car, nose towards the back of the plot. */
function car(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('electric_car', parent);
    g.position.set(-9.4, G, -0.9);
    const W = 1.84;
    // side profile in the (z, y) plane, front towards -z
    const shape = new THREE.Shape();
    shape.moveTo(2.32, 0.3);
    shape.lineTo(2.37, 0.7);
    shape.quadraticCurveTo(2.37, 0.97, 2.12, 1.02);
    shape.quadraticCurveTo(1.82, 1.4, 1.2, 1.46);
    shape.lineTo(-0.3, 1.47);
    shape.quadraticCurveTo(-0.72, 1.46, -1.15, 1.06);
    shape.quadraticCurveTo(-1.9, 0.97, -2.24, 0.84);
    shape.quadraticCurveTo(-2.4, 0.72, -2.36, 0.5);
    shape.lineTo(-2.3, 0.3);
    shape.closePath();
    const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: W - 0.2, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 6, curveSegments: 12 });
    bodyGeo.translate(0, 0, -(W - 0.2) / 2);
    const body = new THREE.Mesh(bodyGeo, M.carPaint);
    // ExtrudeGeometry: shape (x, y) extruded along z; rotate so shape x runs along world z
    body.rotation.y = -Math.PI / 2;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    // glasshouse: windscreen, side windows and rear window in one piece
    const glassShape = new THREE.Shape();
    glassShape.moveTo(2.02, 1.03);
    glassShape.quadraticCurveTo(1.76, 1.38, 1.18, 1.425);
    glassShape.lineTo(-0.28, 1.435);
    glassShape.quadraticCurveTo(-0.68, 1.425, -1.06, 1.07);
    glassShape.closePath();
    const glassGeo = new THREE.ExtrudeGeometry(glassShape, { depth: W - 0.02, bevelEnabled: false, curveSegments: 12 });
    glassGeo.translate(0, 0, -(W - 0.02) / 2);
    const glass = new THREE.Mesh(glassGeo, M.carGlass);
    glass.rotation.y = -Math.PI / 2;
    g.add(glass);
    // black lower cladding and pillar
    for (const side of [-1, 1]) boxC(g, M.rubber, 0.02, 0.12, 3.9, side * (W / 2 + 0.005), 0.38, 0.0, { cast: false });
    boxC(g, M.carGlass, W - 0.01, 0.34, 0.08, 0, 1.2, 0.35, { cast: false });
    // wheels
    for (const wz of [-1.42, 1.38]) {
        for (const side of [-1, 1]) {
            const wheel = group('wheel', g);
            wheel.position.set(side * (W / 2 - 0.12), 0.34, wz);
            cyl(wheel, M.rubber, 0.34, 0.34, 0.24, 0, 0, 0, 32, { rz: Math.PI / 2 });
            cyl(wheel, M.rim, 0.22, 0.22, 0.25, 0, 0, 0, 24, { rz: Math.PI / 2, cast: false });
        }
    }
    // lights
    boxC(g, M.headLight, 1.4, 0.04, 0.03, 0, 0.8, -2.43, { cast: false });
    boxC(g, M.tailLight, 1.62, 0.05, 0.03, 0, 0.9, 2.47, { cast: false });
    boxC(g, M.rubber, 1.7, 0.16, 0.04, 0, 0.42, 2.45, { cast: false });
    boxC(g, M.deviceWhite, 0.52, 0.11, 0.01, 0, 0.62, 2.465, { cast: false });
    // charging port (right rear fender) and cable to the wall charger
    const port = new THREE.MeshStandardMaterial({ color: '#111', emissive: '#4cd987', emissiveIntensity: 0.2 });
    boxC(g, port, 0.02, 0.07, 0.1, W / 2 + 0.01, 0.86, 1.75, { cast: false });
    const portWorld = new THREE.Vector3(-9.4 + W / 2 + 0.02, G + 0.86, -0.9 + 1.75);
    const holster = new THREE.Vector3(-7.1, 0.82, -0.2);
    const curve = new THREE.CatmullRomCurve3([
        holster,
        new THREE.Vector3(-7.35, 0.25, -0.05),
        new THREE.Vector3(-7.9, 0.05, 0.3),
        new THREE.Vector3(-8.35, 0.35, 0.7),
        portWorld,
    ]);
    const cableMat = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.6, emissive: '#4cd987', emissiveIntensity: 0 });
    const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.016, 8), cableMat);
    cable.castShadow = true;
    cable.name = 'charging_cable';
    parent.add(cable);
    reg.car = { port, cableMat, curve };
    return g;
}

function carport(parent, ctx) {
    const { M, reg } = ctx;
    const g = group('garage', parent);
    const roof = box(g, M.plaster, 4.65, 0.14, 6.9, -9.32, 2.62, -0.6);
    reg.occluders.push(roof);
    box(g, M.frame, 4.67, 0.03, 6.92, -9.32, 2.6, -0.6, { cast: false });
    for (const z of [-3.95, 2.75]) box(g, M.frame, 0.1, 2.62, 0.1, -11.55, 0, z);
    const down = new THREE.MeshStandardMaterial({ color: '#fff8ec', emissive: '#ffcf87', emissiveIntensity: 0 });
    for (const z of [-2.2, 1.0]) cyl(g, down, 0.07, 0.07, 0.01, -9.3, 2.6, z, 24, { cast: false });
    reg.lights.push({ id: 'carport', room: 'exterieur', material: down });
    return g;
}

export function buildExterior(root, ctx) {
    const { M } = ctx;
    const ext = group('exterior', root);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(260, 64), M.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = G;
    ground.receiveShadow = true;
    ext.add(ground);

    const garden = group('garden', ext);
    grass(garden, M, 1.5, 8.6, 19, 8.4);
    grass(garden, M, 1.5, -7.4, 19, 5);
    grass(garden, M, -13.2, 2.5, 3.0, 22);

    // driveway (parking) and entrance path
    const drive = box(garden, M.stone, 4.2, 0.02, 17.5, -9.5, G, 4.0, { cast: false });
    drive.receiveShadow = true;
    for (let i = 0; i < 9; i++) box(garden, M.stone, 1.1, 0.04, 0.55, -4.85, G, 5.1 + i * 0.85);
    box(garden, M.asphalt, 60, 0.01, 6, 0, G, 15.8, { cast: false });

    // terrace and pool
    box(garden, M.concrete, 4.5, 0.12, 8.2, 9.25, G, 0.5);
    box(garden, M.deck, 4.5, 0.02, 8.2, 9.25, G + 0.12, 0.5, { cast: false });
    const pool = group('pool', garden);
    pool.position.set(5.5, G, 8.4);
    box(pool, M.water, 8.6, 0.02, 3.2, 0, 0.01, 0, { cast: false });
    for (const [x, z, w, d] of [[0, 1.8, 9.4, 0.4], [0, -1.8, 9.4, 0.4], [4.5, 0, 0.4, 3.2], [-4.5, 0, 0.4, 3.2]]) box(pool, M.stone, w, 0.1, d, x, 0, z);
    lounger(garden, M, 8.1, 3.0, Math.PI);
    lounger(garden, M, 9.3, 3.0, Math.PI);

    hedge(garden, M, 11.9, 0.5, 0.6, 0.9, 7.6);
    hedge(garden, M, -1.0, -5.7, 5.5, 0.8, 0.6);
    hedge(garden, M, -12.3, -5.5, 0.6, 0.9, 6.0);
    hedge(garden, M, -6.0, 13.2, 6.0, 0.7, 0.6);
    tree(garden, M, -10.8, -7.2, 1.05);
    tree(garden, M, 13.5, 9.5, 0.95);
    tree(garden, M, 12.8, -5.5, 1.15);
    tree(garden, M, -17.5, -2.5, 0.9);

    carport(ext, ctx);
    car(ext, ctx);
    return ext;
}

/** Gradient sky dome (does not receive fog). */
export function buildSky(scene) {
    const mat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
            uTop: { value: new THREE.Color('#9fbfdd') },
            uHorizon: { value: new THREE.Color('#f3efe6') },
            uSun: { value: new THREE.Vector3(-0.6, 0.55, 0.45).normalize() },
        },
        vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSun; varying vec3 vDir;
            void main(){
                float h = clamp(vDir.y, 0.0, 1.0);
                vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
                float sun = pow(max(dot(normalize(vDir), uSun), 0.0), 220.0);
                float haze = pow(max(dot(normalize(vDir), uSun), 0.0), 6.0) * 0.18;
                col += vec3(1.0, 0.92, 0.78) * (sun * 1.6 + haze);
                gl_FragColor = vec4(col, 1.0);
            }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), mat);
    sky.name = 'sky';
    sky.renderOrder = -1;
    scene.add(sky);
    return sky;
}
