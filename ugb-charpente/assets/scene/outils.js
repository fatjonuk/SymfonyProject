import * as THREE from 'three';

/** Générateur pseudo-aléatoire déterministe (la scène est identique à chaque chargement). */
export function alea(graine) {
    let a = graine;
    return () => {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const hasard = alea(7);

/**
 * Pièce de bois parallélépipédique. Les UV sont exprimés en mètres et le fil
 * du bois suit l'axe `fil` ('x', 'y' ou 'z').
 */
export function geoPoutre(lx, ly, lz, fil = 'x') {
    const g = new THREE.BoxGeometry(lx, ly, lz);
    const uv = g.attributes.uv;
    const dim = { x: lx, y: ly, z: lz };
    const faces = [['z', 'y'], ['z', 'y'], ['x', 'z'], ['x', 'z'], ['x', 'y'], ['x', 'y']];
    const ou = hasard() * 3, ov = hasard() * 3;
    for (let f = 0; f < 6; f++) {
        const [a, b] = faces[f];
        for (let i = 0; i < 4; i++) {
            const k = f * 4 + i;
            let u = uv.getX(k) * dim[a], v = uv.getY(k) * dim[b];
            if (b === fil) [u, v] = [v, u];
            uv.setXY(k, u + ou, v + ov);
        }
    }
    return g;
}

/** Crée un Mesh nommé, avec ombres et catégorie (utilisée plus tard pour le clic). */
export function piece(nom, geometrie, materiau, categorie, ombres = true) {
    const m = new THREE.Mesh(geometrie, materiau);
    m.name = nom;
    m.castShadow = ombres;
    m.receiveShadow = true;
    if (categorie) m.userData.categorie = categorie;
    return m;
}

export function groupe(nom, categorie) {
    const g = new THREE.Group();
    g.name = nom;
    if (categorie) g.userData.categorie = categorie;
    return g;
}

/**
 * Prisme défini par un polygone dans le plan vertical (z, y), extrudé le long de X
 * (épaisseur centrée). `angleFil` oriente le fil du bois dans ce plan.
 */
export function geoPrismeZY(points, epaisseur, angleFil = 0) {
    const forme = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
    const g = new THREE.ExtrudeGeometry(forme, { depth: epaisseur, bevelEnabled: false });
    const uv = g.attributes.uv, c = Math.cos(angleFil), s = Math.sin(angleFil);
    const ou = hasard() * 3, ov = hasard() * 3;
    for (let i = 0; i < uv.count; i++) {
        const u = uv.getX(i), v = uv.getY(i);
        uv.setXY(i, u * c + v * s + ou, -u * s + v * c + ov);
    }
    g.rotateY(-Math.PI / 2);
    g.translate(epaisseur / 2, 0, 0);
    return g;
}

/** Bande droite entre deux points du plan (z, y) : contrefiche, lien… */
export function bandeZY(z1, y1, z2, y2, largeur, depassement = 0) {
    const dz = z2 - z1, dy = y2 - y1, l = Math.hypot(dz, dy);
    const tz = dz / l, ty = dy / l, nz = -ty * largeur / 2, ny = tz * largeur / 2;
    const a = [z1 - tz * depassement, y1 - ty * depassement], b = [z2 + tz * depassement, y2 + ty * depassement];
    return {
        points: [[a[0] + nz, a[1] + ny], [b[0] + nz, b[1] + ny], [b[0] - nz, b[1] - ny], [a[0] - nz, a[1] - ny]],
        angle: Math.atan2(dy, dz),
    };
}

/** Demi-tube le long de X (gouttière si `haut` est faux, tuile faîtière si vrai). */
export function geoDemiTube(rayon, longueur, segments = 12, haut = false, bouchons = false) {
    const pos = [], nor = [], uv = [], idx = [];
    const depart = haut ? 0 : Math.PI;
    for (let i = 0; i <= segments; i++) {
        const a = depart + (i / segments) * Math.PI, s = Math.sin(a), c = Math.cos(a);
        for (const x of [-longueur / 2, longueur / 2]) {
            pos.push(x, rayon * s, rayon * c); nor.push(0, s, c); uv.push(x, i / segments);
        }
    }
    for (let i = 0; i < segments; i++) {
        const k = i * 2;
        idx.push(k, k + 1, k + 3, k, k + 3, k + 2);
    }
    if (bouchons) {
        for (const sx of [-1, 1]) {
            const base = pos.length / 3, x = sx * longueur / 2;
            pos.push(x, 0, 0); nor.push(sx, 0, 0); uv.push(0, 0);
            for (let i = 0; i <= segments; i++) {
                const a = depart + (i / segments) * Math.PI;
                pos.push(x, rayon * Math.sin(a), rayon * Math.cos(a)); nor.push(sx, 0, 0); uv.push(0, 0);
            }
            for (let i = 0; i < segments; i++) idx.push(base, base + 1 + i, base + 2 + i);
        }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
}

/** Tuile à emboîtement faiblement galbée (version détaillée) ou simple plaque (version allégée). */
export function geoTuile(largeur, longueur, detaillee) {
    if (!detaillee) {
        const g = new THREE.BoxGeometry(largeur, 0.02, longueur);
        g.translate(0, 0.01, longueur / 2);
        return g;
    }
    const fx = [0, 0.06, 0.62, 0.76, 0.88, 1], hy = [0.012, 0, 0, 0.02, 0.028, 0.012], ep = 0.014;
    const p = [], uv = [];
    const tri = (...v) => { for (const [x, y, z] of v) { p.push(x, y, z); uv.push(x / largeur + 0.5, z / longueur); } };
    for (let i = 0; i < fx.length - 1; i++) {
        const x0 = fx[i] * largeur - largeur / 2, x1 = fx[i + 1] * largeur - largeur / 2, y0 = hy[i], y1 = hy[i + 1];
        const A = [x0, y0, 0], B = [x1, y1, 0], C = [x1, y1, longueur], D = [x0, y0, longueur];
        tri(A, D, C); tri(A, C, B);                                   // dessus
        const P2 = [x0, y0 - ep, longueur], Q2 = [x1, y1 - ep, longueur];
        tri(P2, Q2, C); tri(P2, C, D);                                // nez de tuile
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    return g;
}

/** Remplit un InstancedMesh à partir d'une liste de { position, rotationX, echelleX, teinte }. */
export function instances(nom, geometrie, materiau, liste, categorie, ombres = true) {
    const m = new THREE.InstancedMesh(geometrie, materiau, liste.length);
    m.name = nom;
    const mat = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), c = new THREE.Color();
    liste.forEach((it, i) => {
        e.set(it.rx || 0, it.ry || 0, it.rz || 0);
        q.setFromEuler(e);
        s.set(it.sx || 1, 1, 1);
        mat.compose(it.p, q, s);
        m.setMatrixAt(i, mat);
        if (it.teinte !== undefined) m.setColorAt(i, c.setScalar(it.teinte));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
    m.computeBoundingBox();
    m.castShadow = ombres;
    m.receiveShadow = true;
    if (categorie) m.userData.categorie = categorie;
    return m;
}
