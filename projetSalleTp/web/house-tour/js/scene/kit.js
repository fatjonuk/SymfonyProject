/*
 * Small builders shared by the scene modules (boxes placed by their base,
 * rounded boxes, cylinders, named groups).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function group(name, parent) {
    const g = new THREE.Group();
    g.name = name;
    if (parent) parent.add(g);
    return g;
}

function finish(mesh, parent, opts = {}) {
    mesh.castShadow = opts.cast !== false;
    mesh.receiveShadow = opts.receive !== false;
    if (opts.name) mesh.name = opts.name;
    if (opts.ry) mesh.rotation.y = opts.ry;
    if (opts.rx) mesh.rotation.x = opts.rx;
    if (opts.rz) mesh.rotation.z = opts.rz;
    if (parent) parent.add(mesh);
    return mesh;
}

/** Box placed by the centre of its base. */
export function box(parent, mat, w, h, d, x, y, z, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y + h / 2, z);
    return finish(m, parent, opts);
}

/** Box placed by its centre. */
export function boxC(parent, mat, w, h, d, x, y, z, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    return finish(m, parent, opts);
}

/** Rounded box placed by the centre of its base. */
export function rbox(parent, mat, w, h, d, x, y, z, radius = 0.04, opts) {
    const r = Math.min(radius, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
    m.position.set(x, y + h / 2, z);
    return finish(m, parent, opts);
}

/** Cylinder placed by its centre. */
export function cyl(parent, mat, rTop, rBottom, h, x, y, z, seg = 24, opts) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, opts && opts.open), mat);
    m.position.set(x, y, z);
    return finish(m, parent, opts);
}

export function plane(parent, mat, w, h, x, y, z, opts) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z);
    return finish(m, parent, Object.assign({ cast: false }, opts));
}

/** Horizontal rug / floor patch. */
export function rug(parent, color, w, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: 1 }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.006, z);
    m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
}

export const FACING = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 };
