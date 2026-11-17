/*
 * Illustrative electrical circuits: thin tubes drawn progressively from the
 * distribution board, with light pulses running along them. A second pass
 * (x-ray) keeps them faintly visible through walls and floors.
 *
 * This is a teaching aid, not a wiring diagram.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { H } from './house.js';

export const COLORS = { light: '#F2B705', outlet: '#3FA9F5', special: '#FF6A2B' };

/** One entry per protected circuit leaving the board. */
export const GROUPS = [
    'colonne', 'salon-eclairage', 'entree-eclairage', 'cuisine-eclairage', 'table-eclairage', 'allee',
    'chambres-eclairage', 'sdb-eclairage', 'sous-face', 'prises-salon', 'prises-cuisine', 'prises-etage',
    'plaque', 'four', 'lave-vaisselle', 'borne', 'pv', 'pac', 'seche',
];
const gi = (id) => GROUPS.indexOf(id);

const C = H.groundCeil - 0.12;
const UC = H.upperCeil - 0.12;
const RISER = { x: -5.5, z: 1.33, from: 1.9, to: H.groundCeil };
const UP = RISER.to - RISER.from + 0.3;

const CIRCUITS = [
    { group: 'salon-eclairage', kind: 'light', start: 0, points: [[-5.8, 1.9, 1.33], [-5.8, C, 1.33], [-5.8, C, 1.5], [-2, C, 1.5], [-2, C, -2], [0, C, -2], [0, C, 1.5], [2, C, 1.5], [2, C, -2]] },
    { group: 'salon-eclairage', kind: 'light', start: 3.45, points: [[-3.5, C, 1.5], [-3.5, C, 1.95], [-3.5, 1.15, 1.95]] },
    { group: 'entree-eclairage', kind: 'light', start: 0, points: [[-5.62, 1.9, 1.33], [-5.62, C, 1.33], [-5.62, C, 2.8], [-5.2, C, 2.8]] },
    { group: 'cuisine-eclairage', kind: 'light', start: 0, points: [[-5.4, 1.9, 1.33], [-5.4, C, 1.33], [-5.4, C, 0.9], [4.2, C, 0.9], [4.2, C, -1.2], [5.6, C, -1.2]] },
    { group: 'cuisine-eclairage', kind: 'light', start: 9.66, points: [[2.85, C, 0.9], [2.85, C, -4.12], [2.85, 1.15, -4.12]] },
    { group: 'table-eclairage', kind: 'light', start: 0, points: [[-5.2, 1.9, 1.33], [-5.2, C, 1.33], [-5.2, C, 1.08], [4.9, C, 1.08], [4.9, C, 2.4]] },
    { group: 'allee', kind: 'light', start: 0, points: [[-5.0, 0.98, 1.33], [-5.0, -0.06, 1.33], [-5.0, -0.06, 4.4], [-5.0, -0.4, 4.4], [-5.0, -0.4, 5.6], [-3.7, -0.4, 5.6], [-3.7, -0.4, 10.6], [-3.7, 0.1, 10.6]] },
    { group: 'colonne', kind: 'light', start: 0, points: [[RISER.x, RISER.from, RISER.z], [RISER.x, RISER.to + 0.3, RISER.z]] },
    { group: 'prises-salon', kind: 'outlet', start: 0, points: [[-5.25, 0.98, 1.33], [-5.25, -0.05, 1.33], [-5.25, -0.05, 1.0], [-2.4, -0.05, 1.0], [-2.4, -0.05, -4.12], [-2.4, 0.3, -4.12], [1.8, 0.3, -4.12]] },
    { group: 'prises-cuisine', kind: 'outlet', start: 0, points: [[-4.8, 0.98, 1.33], [-4.8, -0.05, 1.33], [-4.8, -0.05, 0.75], [3.35, -0.05, 0.75], [3.35, -0.05, -4.12], [3.35, 1.1, -4.12], [5.25, 1.1, -4.12]] },
    { group: 'plaque', kind: 'special', start: 0, points: [[-5.45, 0.98, 1.33], [-5.45, -0.09, 1.33], [-5.45, -0.09, 0.55], [5.3, -0.09, 0.55], [5.3, -0.09, -1.2], [5.3, 0.86, -1.2]] },
    { group: 'four', kind: 'special', start: 0, points: [[-5.65, 0.98, 1.33], [-5.65, -0.09, 1.33], [-5.65, -0.09, 0.35], [5.75, -0.09, 0.35], [5.75, -0.09, -3.95], [5.75, 0.8, -3.95]] },
    { group: 'lave-vaisselle', kind: 'special', start: 0, points: [[-5.55, 0.98, 1.33], [-5.55, -0.09, 1.33], [-5.55, -0.09, 0.15], [4.55, -0.09, 0.15], [4.55, -0.09, -3.95], [4.55, 0.25, -3.95]] },
    { group: 'borne', kind: 'special', start: 0, points: [[-5.85, 0.98, 1.33], [-5.85, -0.09, 1.33], [-6.85, -0.09, 1.33], [-6.85, -0.09, -0.2], [-6.85, 0.95, -0.2], [-7.04, 0.95, -0.2]] },
    { group: 'pv', kind: 'special', start: 0, points: [[-5.9, 1.45, 1.33], [-6.06, 1.45, 1.33]] },
    { group: 'pv', kind: 'special', start: 0.2, points: [[-6.3, 1.82, 1.33], [-6.3, H.groundCeil + 0.3, 1.33]] },
    { group: 'pac', kind: 'special', start: 0, points: [[-5.05, 0.98, 1.33], [-5.05, -0.11, 1.33], [-5.05, -0.11, -3.7], [2.6, -0.11, -3.7], [2.6, -0.11, -4.5], [2.6, -0.4, -4.5], [2.6, -0.4, -5.7], [2.6, 0.1, -5.7]] },
    { group: 'chambres-eclairage', kind: 'light', start: UP, points: [[-5.5, 3.3, 1.33], [-5.5, UC, 1.33], [-4.0, UC, 1.33], [-4.0, UC, -0.6], [5.4, UC, -0.6]] },
    { group: 'sdb-eclairage', kind: 'light', start: UP, points: [[-5.3, 3.3, 1.33], [-5.3, UC, 1.33], [-5.3, UC, 2.3], [-4.6, UC, 2.3]] },
    { group: 'sous-face', kind: 'light', start: UP, points: [[-5.7, 3.15, 1.33], [-5.7, 3.15, 2.8], [7.75, 3.15, 2.8], [7.75, 3.15, -2.0]] },
    { group: 'prises-etage', kind: 'outlet', start: UP, points: [[-4.7, 3.3, 1.25], [-4.7, 3.6, 1.25], [-2.5, 3.6, 1.25], [-2.5, 3.6, -4.12], [6.7, 3.6, -4.12]] },
    { group: 'seche', kind: 'special', start: UP, points: [[-6.0, 3.3, 1.33], [-6.0, 3.5, 1.33], [-6.0, 3.5, 2.35], [-6.6, 3.5, 2.35], [-6.6, 3.65, 2.35]] },
];

function pathLength(points) {
    let l = 0;
    for (let i = 1; i < points.length; i++) {
        const [a, b] = [points[i - 1], points[i]];
        l += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    }
    return l;
}
export const CIRCUIT_MAX = Math.max(...CIRCUITS.map((c) => c.start + pathLength(c.points))) + 0.5;

/** Polyline -> curve path with small fillets at each corner. */
function filletPath(points, r = 0.08) {
    const v = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const path = new THREE.CurvePath();
    let cur = v[0].clone();
    for (let i = 1; i < v.length; i++) {
        const p = v[i];
        if (i === v.length - 1) {
            path.add(new THREE.LineCurve3(cur, p.clone()));
            break;
        }
        const dIn = p.clone().sub(v[i - 1]);
        const dOut = v[i + 1].clone().sub(p);
        const rr = Math.min(r, dIn.length() / 2, dOut.length() / 2);
        const a = p.clone().sub(dIn.normalize().multiplyScalar(rr));
        const b = p.clone().add(dOut.normalize().multiplyScalar(rr));
        if (a.distanceTo(cur) > 1e-4) path.add(new THREE.LineCurve3(cur, a));
        path.add(new THREE.QuadraticBezierCurve3(a, p.clone(), b));
        cur = b;
    }
    return path;
}

function circuitGeometry(c, radius) {
    const path = filletPath(c.points);
    const len = path.getLength();
    const g = new THREE.TubeGeometry(path, Math.max(8, Math.ceil(len * 22)), radius, 6, false);
    const uv = g.attributes.uv;
    const dist = new Float32Array(uv.count);
    for (let i = 0; i < uv.count; i++) dist[i] = c.start + uv.getX(i) * len;
    g.setAttribute('aDist', new THREE.BufferAttribute(dist, 1));
    g.setAttribute('aId', new THREE.BufferAttribute(new Float32Array(uv.count).fill(gi(c.group)), 1));
    g.deleteAttribute('uv');
    return g;
}

const vert = /* glsl */ `
    attribute float aDist;
    attribute float aId;
    varying float vDist;
    varying float vId;
    varying vec3 vN;
    varying vec3 vV;
    void main() {
        vDist = aDist;
        vId = aId;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
    }
`;

const frag = /* glsl */ `
    uniform vec3 uColor;
    uniform float uReveal;
    uniform float uTime;
    uniform float uOpacity;
    uniform float uBoost;
    uniform float uVis;
    uniform float uFocusA;
    uniform float uFocusB;
    uniform float uFocusAmt;
    uniform float uPackets;
    varying float vDist;
    varying float vId;
    varying vec3 vN;
    varying vec3 vV;
    void main() {
        if (vDist > uReveal) discard;
        float isF = max(1.0 - step(0.5, abs(vId - uFocusA)), 1.0 - step(0.5, abs(vId - uFocusB)));
        float keep = mix(1.0, mix(0.06, 1.0, isF), uFocusAmt);
        float alpha = uOpacity * uVis * keep;
        if (alpha < 0.004) discard;
        float head = smoothstep(uReveal - 0.9, uReveal, vDist);
        float packet = uPackets * smoothstep(0.82, 1.0, fract((vDist - uTime * 2.2) / 1.8));
        float rim = pow(1.0 - abs(dot(vN, vV)), 1.5);
        float glow = uBoost * (packet * 1.4 + head * 2.2) * keep + isF * uFocusAmt * 0.5;
        gl_FragColor = vec4(uColor * (0.95 + 0.4 * rim + glow), alpha);
    }
`;

function makeMaterial(color, xray) {
    return new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uReveal: { value: 0 },
            uTime: { value: 0 },
            uOpacity: { value: xray ? 0.22 : 0.95 },
            uBoost: { value: xray ? 0.4 : 1 },
            uVis: { value: 1 },
            uFocusA: { value: -1 },
            uFocusB: { value: -1 },
            uFocusAmt: { value: 0 },
            uPackets: { value: 1 },
        },
        transparent: true,
        depthTest: !xray,
        depthWrite: false,
        toneMapped: false,
    });
}

/**
 * Builds the circuit meshes. Upper-floor circuits are parented to the first
 * floor group, the others to the ground floor.
 * Returns a controller used by the tour effects.
 */
export function buildCircuits(levels, radius = 0.012) {
    const materials = {};
    for (const kind of Object.keys(COLORS)) materials[kind] = { solid: makeMaterial(COLORS[kind], false), xray: makeMaterial(COLORS[kind], true) };

    const root = new THREE.Group();
    root.name = 'circuits_illustration';
    levels.house.add(root);
    for (const kind of Object.keys(COLORS)) {
        const list = CIRCUITS.filter((c) => c.kind === kind);
        const parts = list.map((c) => circuitGeometry(c, radius));
        const geo = mergeGeometries(parts, false);
        parts.forEach((p) => p.dispose());
        const solid = new THREE.Mesh(geo, materials[kind].solid);
        const xray = new THREE.Mesh(geo, materials[kind].xray);
        solid.renderOrder = 19;
        xray.renderOrder = 20;
        solid.frustumCulled = xray.frustumCulled = false;
        root.add(solid, xray);
    }

    const state = { reveal: 0, vis: { light: 1, outlet: 1, special: 1 }, focus: { a: -1, b: -1, amt: 0 }, packets: 1, opacity: 1 };
    return {
        root,
        state,
        groupIndex: gi,
        update(time) {
            root.visible = state.reveal > 0.01 && state.opacity > 0.01;
            for (const kind of Object.keys(materials)) {
                for (const which of ['solid', 'xray']) {
                    const u = materials[kind][which].uniforms;
                    u.uReveal.value = state.reveal;
                    u.uTime.value = time;
                    u.uVis.value = state.vis[kind] * state.opacity;
                    u.uFocusA.value = state.focus.a;
                    u.uFocusB.value = state.focus.b;
                    u.uFocusAmt.value = state.focus.amt;
                    u.uPackets.value = state.packets;
                }
            }
        },
    };
}
