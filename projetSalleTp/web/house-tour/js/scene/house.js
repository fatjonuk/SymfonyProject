/*
 * Architecture of the house: walls with real openings, slabs, room floors,
 * hinged front door, stairs, guard rails and the liftable roof.
 *
 * Units are metres. x: left (-) to right (+) looking at the front facade,
 * y: up (0 = ground floor, 3.3 = upper floor), z: back (-) to street (+).
 */
import * as THREE from 'three';
import { floorGeometry, slabGeometry, wallGeometry } from './geometry.js';
import { box, boxC, group } from './kit.js';

export const H = { groundCeil: 3.0, upperFloor: 3.3, upperCeil: 6.2, roofTop: 6.55 };
/** How far the roof lifts when the camera leaves through the top of the house. */
export const ROOF_LIFT = 4.2;

const FRAME = 0.055;

/* Openings: u along the wall from its start point, v from its base (metres) */
const O = {
    gFront: [
        { u0: 1.6, u1: 2.7, v0: 0, v1: 2.4, type: 'door' },
        { u0: 4.2, u1: 13.4, v0: 0, v1: 2.75, type: 'window', panes: 5 },
    ],
    gBack: [
        { u0: 4.4, u1: 5.1, v0: 0.3, v1: 2.7, type: 'window' },
        { u0: 12.6, u1: 13.5, v0: 0.6, v1: 2.8, type: 'window' },
    ],
    gLeft: [{ u0: 6.0, u1: 7.2, v0: 0.8, v1: 2.4, type: 'window' }],
    gRight: [{ u0: 1.4, u1: 5.4, v0: 0, v1: 2.75, type: 'window', panes: 2 }],
    uFront: [
        { u0: 1.6, u1: 2.5, v0: 1.1, v1: 2.2, type: 'window' },
        { u0: 5.4, u1: 8.6, v0: 0, v1: 2.6, type: 'window', panes: 2 },
        { u0: 10.8, u1: 14.8, v0: 0, v1: 2.6, type: 'window', panes: 3 },
    ],
    uBack: [
        { u0: 0.9, u1: 5.3, v0: 1.9, v1: 2.5, type: 'window', panes: 3 },
        { u0: 6.7, u1: 10.3, v0: 1.9, v1: 2.5, type: 'window', panes: 2 },
        { u0: 11.9, u1: 13.7, v0: 0.3, v1: 2.6, type: 'window' },
    ],
    uRight: [{ u0: 1.7, u1: 5.7, v0: 0.5, v1: 2.5, type: 'window', panes: 2 }],
    w1: [{ u0: 2.0, u1: 3.1, v0: 0, v1: 2.2, type: 'void' }],
    w2: [{ u0: 0.94, u1: 2.04, v0: 0, v1: 2.2, type: 'void' }],
    u1: [{ u0: 2.05, u1: 2.85, v0: 0, v1: 2.15, type: 'void' }],
    u2: [{ u0: 0.4, u1: 1.3, v0: 0, v1: 2.15, type: 'void' }],
    u3: [{ u0: 0.4, u1: 1.3, v0: 0, v1: 2.15, type: 'void' }],
};

/**
 * Wall along the centre line a -> b (plan coordinates [x, z]).
 * The outward face is on the local +z side (left of the a -> b direction).
 */
function wall(parent, ctx, { name, a, b, y = 0, h, t = 0.3, openings = [], material, skin, skinT = 0.035 }) {
    const { M, reg } = ctx;
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const L = Math.hypot(dx, dz);
    const g = group(name, parent);
    g.position.set(a[0], y, a[1]);
    g.rotation.y = Math.atan2(-dz / L, dx / L);

    const coreZ1 = skin ? t / 2 - skinT : t / 2;
    const core = new THREE.Mesh(wallGeometry(L, h, -t / 2, coreZ1, openings), material || M.plaster);
    core.castShadow = core.receiveShadow = true;
    g.add(core);
    reg.occluders.push(core);
    if (skin) {
        const s = new THREE.Mesh(wallGeometry(L, h, coreZ1, t / 2, openings), skin);
        s.castShadow = s.receiveShadow = true;
        g.add(s);
        reg.occluders.push(s);
    }

    const zf = t / 2 - 0.11; // frames are set back from the outer face
    for (const o of openings) {
        const w = o.u1 - o.u0;
        const hh = o.v1 - o.v0;
        const cu = (o.u0 + o.u1) / 2;
        const cv = o.v0 + hh / 2;
        if (o.type === 'void') continue;
        const f = group('frame', g);
        f.position.set(cu, cv, zf);
        boxC(f, M.frame, w, FRAME, 0.09, 0, hh / 2 - FRAME / 2, 0);
        boxC(f, M.frame, FRAME, hh, 0.09, -w / 2 + FRAME / 2, 0, 0);
        boxC(f, M.frame, FRAME, hh, 0.09, w / 2 - FRAME / 2, 0, 0);
        if (o.type === 'door') {
            // hinged leaf, pivot on the left jamb, opens towards the inside (-z local)
            const pivot = group('front_door', g);
            pivot.position.set(o.u0 + FRAME, o.v0, zf);
            const leafW = w - FRAME * 2;
            box(pivot, M.walnut, leafW, hh - FRAME, 0.05, leafW / 2, 0, 0, { name: 'door_leaf' });
            boxC(pivot, M.steel, 0.025, 0.9, 0.03, leafW - 0.14, 1.05, 0.05);
            boxC(pivot, M.steel, 0.025, 0.9, 0.03, leafW - 0.14, 1.05, -0.05);
            reg.door = pivot;
            continue;
        }
        boxC(f, M.frame, w, FRAME, 0.08, 0, -hh / 2 + FRAME / 2, 0);
        const panes = o.panes || 1;
        for (let p = 1; p < panes; p++) boxC(f, M.frame, 0.04, hh, 0.07, -w / 2 + (w * p) / panes, 0, 0);
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - FRAME, hh - FRAME), M.glass);
        glass.renderOrder = 2;
        glass.userData.glass = true;
        f.add(glass);
    }
    return g;
}

function slab(parent, ctx, rect, y0, y1, hole, material, name) {
    const m = new THREE.Mesh(slabGeometry(rect, y0, y1, hole), material);
    m.name = name || 'slab';
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    ctx.reg.occluders.push(m);
    return m;
}

function floor(parent, rects, y, material, name) {
    const g = group(name, parent);
    for (const r of rects) {
        const m = new THREE.Mesh(floorGeometry(r[0], r[1], r[2], r[3]), material);
        m.position.y = y + 0.004;
        m.receiveShadow = true;
        g.add(m);
    }
    return g;
}

function glassRail(parent, M, from, to, y, h = 1.0) {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const g = group('guard_rail', parent);
    g.position.set((from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2);
    g.rotation.y = Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
    const glass = boxC(g, M.railGlass, len, h, 0.02, 0, h / 2, 0, { cast: false });
    glass.renderOrder = 3;
    boxC(g, M.frame, len, 0.06, 0.06, 0, 0.03, 0);
    boxC(g, M.steel, len, 0.03, 0.05, 0, h + 0.015, 0, { cast: false });
    return g;
}

/** Floating oak stairs along the left wall, rising towards the front (+z). */
const STAIRS = { x: -6.15, width: 1.0, z0: -4.03, going: 0.29, risers: 17 };

function stairs(parent, ctx) {
    const { M } = ctx;
    const g = group('stairs', parent);
    const rise = H.upperFloor / STAIRS.risers;
    for (let i = 0; i < STAIRS.risers - 1; i++) {
        const z = STAIRS.z0 + (i + 0.5) * STAIRS.going;
        box(g, M.oak, STAIRS.width, 0.05, STAIRS.going, STAIRS.x, (i + 1) * rise - 0.05, z);
    }
    // steel stringer on the open side
    const run = STAIRS.going * STAIRS.risers;
    const angle = Math.atan2(H.upperFloor, run);
    const stringer = boxC(g, M.metalBlack, 0.03, 0.2, Math.hypot(H.upperFloor, run), STAIRS.x + STAIRS.width / 2 + 0.03, H.upperFloor / 2 - 0.12, STAIRS.z0 + run / 2);
    stringer.rotation.x = -angle;
    // handrail along the open side
    const rail = boxC(g, M.steel, 0.04, 0.04, Math.hypot(H.upperFloor, run), STAIRS.x + STAIRS.width / 2 + 0.03, H.upperFloor / 2 + 0.9, STAIRS.z0 + run / 2, { cast: false });
    rail.rotation.x = -angle;
    for (let i = 2; i < STAIRS.risers; i += 4) {
        const z = STAIRS.z0 + (i + 0.5) * STAIRS.going;
        const y = (i + 1) * rise;
        boxC(g, M.steel, 0.02, 0.9, 0.02, STAIRS.x + STAIRS.width / 2 + 0.03, y + 0.45, z, { cast: false });
    }
    return g;
}

const ROOMS = {
    entree: { rects: [[-6.7, -3.56, 1.26, 4.2]], y: 0, mat: 'stone' },
    salon: { rects: [[-6.7, 3.0, -4.2, 1.14], [-3.44, 3.0, 1.14, 4.2]], y: 0, mat: 'oakFloor' },
    cuisine: { rects: [[3.0, 6.7, -4.2, 4.2]], y: 0, mat: 'stone' },
    sdb: { rects: [[-6.7, -2.56, 1.26, 3.3]], y: H.upperFloor, mat: 'tiles' },
    palier: { rects: [[-5.5, -2.56, -4.2, 1.14]], y: H.upperFloor, mat: 'oakFloor' },
    chambre: { rects: [[-2.44, 2.44, -4.2, 3.3]], y: H.upperFloor, mat: 'oakFloor' },
    suite: { rects: [[2.56, 8.2, -4.2, 3.3]], y: H.upperFloor, mat: 'oakFloor' },
};

export function buildHouse(root, ctx) {
    const { M } = ctx;
    const house = group('house', root);

    /* ---------------- ground floor ---------------- */
    const ground = group('ground_floor', house);
    slab(ground, ctx, [-7.1, 7.1, -4.6, 4.6], -0.15, 0, null, M.concrete, 'plinth');
    const entrance = group('entrance', ground);
    wall(entrance, ctx, { name: 'facade_front', a: [-7, 4.35], b: [7, 4.35], h: H.groundCeil, openings: O.gFront });
    wall(ground, ctx, { name: 'facade_back', a: [7, -4.35], b: [-7, -4.35], h: H.groundCeil, openings: O.gBack });
    wall(ground, ctx, { name: 'facade_left', a: [-6.85, -4.2], b: [-6.85, 4.2], h: H.groundCeil, openings: O.gLeft });
    wall(ground, ctx, { name: 'facade_right', a: [6.85, 4.2], b: [6.85, -4.2], h: H.groundCeil, openings: O.gRight });
    wall(entrance, ctx, { name: 'technical_wall', a: [-6.7, 1.2], b: [-3.5, 1.2], h: H.groundCeil, t: 0.12, material: M.plasterInt, openings: O.w1 });
    wall(entrance, ctx, { name: 'hall_wall', a: [-3.5, 1.26], b: [-3.5, 4.2], h: H.groundCeil, t: 0.12, material: M.plasterInt, openings: O.w2 });
    for (const id of ['entree', 'salon', 'cuisine']) {
        const r = ROOMS[id];
        floor(ground, r.rects, r.y, M[r.mat], 'floor_' + id);
    }
    stairs(ground, ctx);

    /* ---------------- first floor ---------------- */
    const upper = group('first_floor', house);
    const y = H.upperFloor;
    const h = H.upperCeil - H.upperFloor;
    // the slab between the levels is the ground floor ceiling
    slab(upper, ctx, [-7, 8.5, -4.5, 4.5], H.groundCeil, H.upperFloor, [-6.7, -5.5, -4.2, 0.9], M.ceiling, 'first_floor_slab');
    wall(upper, ctx, { name: 'facade_front_upper', a: [-7, 3.45], b: [8.5, 3.45], y, h, openings: O.uFront, material: M.plasterInt, skin: M.cladding });
    wall(upper, ctx, { name: 'facade_back_upper', a: [8.5, -4.35], b: [-7, -4.35], y, h, openings: O.uBack, material: M.plasterInt, skin: M.cladding });
    wall(upper, ctx, { name: 'facade_left_upper', a: [-6.85, -4.2], b: [-6.85, 3.3], y, h, material: M.plasterInt, skin: M.cladding });
    wall(upper, ctx, { name: 'facade_right_upper', a: [8.35, 3.3], b: [8.35, -4.2], y, h, openings: O.uRight, material: M.plasterInt, skin: M.cladding });
    wall(upper, ctx, { name: 'bathroom_wall', a: [-6.7, 1.2], b: [-2.5, 1.2], y, h, t: 0.12, material: M.plasterInt, openings: O.u1 });
    wall(upper, ctx, { name: 'bedroom_wall', a: [-2.5, -4.2], b: [-2.5, 3.3], y, h, t: 0.12, material: M.plasterInt, openings: O.u2 });
    wall(upper, ctx, { name: 'suite_wall', a: [2.5, -4.2], b: [2.5, 3.3], y, h, t: 0.12, material: M.plasterInt, openings: O.u3 });
    for (const id of ['sdb', 'palier', 'chambre', 'suite']) {
        const r = ROOMS[id];
        floor(upper, r.rects, r.y, M[r.mat], 'floor_' + id);
    }
    // balcony and stairwell guards (open at the top of the stairs)
    glassRail(upper, M, [-7, 4.44], [8.5, 4.44], y);
    glassRail(upper, M, [8.44, 3.6], [8.44, 4.44], y);
    glassRail(upper, M, [-5.5, -4.2], [-5.5, -0.35], y);

    /* ---------------- roof (liftable) ---------------- */
    const roofPivot = group('roof', house);
    slab(roofPivot, ctx, [-7.25, 8.75, -4.75, 3.85], H.upperCeil, H.roofTop, null, M.ceiling, 'roof_slab');
    const top = H.roofTop;
    for (const [x, z, w, d] of [
        [0.75, -4.67, 16, 0.16],
        [0.75, 3.77, 16, 0.16],
        [-7.17, -0.45, 0.16, 8.6],
        [8.67, -0.45, 0.16, 8.6],
    ]) {
        const p = box(roofPivot, M.slabEdge, w, 0.26, d, x, top, z);
        ctx.reg.occluders.push(p);
    }
    box(roofPivot, M.concrete, 15.6, 0.02, 8.3, 0.75, top, -0.45, { cast: false });

    // photovoltaic array: 2 rows of 8 panels, tilted towards the sun
    const pv = group('solar_panels', roofPivot);
    for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 8; i++) {
            const g = group('pv_module', pv);
            g.position.set(-1.6 + i * 1.12, top + 0.34, -3.05 + row * 1.95);
            g.rotation.x = -0.2;
            boxC(g, M.pv, 1.06, 0.04, 1.74, 0, 0, 0);
            boxC(g, M.steel, 1.09, 0.025, 1.77, 0, -0.03, 0, { cast: false });
            for (let k = 1; k < 3; k++) boxC(g, M.steel, 1.06, 0.002, 0.012, 0, 0.022, -0.87 + (1.74 * k) / 3, { cast: false });
            boxC(g, M.metalBlack, 0.05, 0.3, 0.05, 0, -0.2, -0.75);
            boxC(g, M.metalBlack, 0.05, 0.45, 0.05, 0, -0.27, 0.75);
        }
    }
    ctx.reg.solarPanels = pv;

    return { house, ground, upper, roof: roofPivot, entrance };
}

export { ROOMS, STAIRS };
