import * as THREE from 'three';
import { alea } from './outils.js';

/*
 * Matériaux PBR. Les textures sont générées par code au chargement (aucun
 * fichier à télécharger, 0 octet dans le budget de la scène).
 */

function toile(taille) {
    const c = document.createElement('canvas');
    c.width = c.height = taille;
    return c;
}

function hex(h) { return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; }

function texture(canvas, repX, repY, couleur, anisotropie) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX, repY);
    t.anisotropy = anisotropie;
    if (couleur) t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

/** Bois : cernes de croissance + fibres, fil le long de U. Renvoie couleur + relief. */
function texturesBois(taille, clair, fonce, cernes, graine, opts) {
    const r = alea(graine), c1 = toile(taille), c2 = toile(taille);
    const x1 = c1.getContext('2d'), x2 = c2.getContext('2d');
    const d1 = x1.createImageData(taille, taille), d2 = x2.createImageData(taille, taille);
    const A = hex(clair), B = hex(fonce), T = 2 * Math.PI;
    const ph = [r() * T, r() * T, r() * T, r() * T, r() * T, r() * T];
    const ligne = new Float32Array(taille);
    for (let y = 0; y < taille; y++) {
        const v = y / taille;
        ligne[y] = 0.5 + 0.22 * Math.sin(T * 7 * v + ph[3]) + 0.16 * Math.sin(T * 23 * v + ph[4]) + 0.12 * Math.sin(T * 61 * v + ph[5]);
    }
    for (let y = 0; y < taille; y++) {
        for (let x = 0; x < taille; x++) {
            const u = x / taille, v = y / taille;
            const onde = 0.10 * Math.sin(T * u + ph[0]) + 0.05 * Math.sin(T * 2 * u + ph[1]) + 0.05 * Math.sin(T * 3 * v + ph[2]);
            let t = v * cernes + onde; t -= Math.floor(t);
            const k = Math.min(1, Math.max(0, Math.pow(t, 2.5) * 0.55 + ligne[y] * 0.28 + (r() - 0.5) * 0.1));
            const i = (y * taille + x) * 4;
            d1.data[i] = A[0] + (B[0] - A[0]) * k; d1.data[i + 1] = A[1] + (B[1] - A[1]) * k; d1.data[i + 2] = A[2] + (B[2] - A[2]) * k; d1.data[i + 3] = 255;
            const g = 255 * (1 - k);
            d2.data[i] = d2.data[i + 1] = d2.data[i + 2] = g; d2.data[i + 3] = 255;
        }
    }
    x1.putImageData(d1, 0, 0); x2.putImageData(d2, 0, 0);
    return {
        map: texture(c1, 1 / opts.long, 1 / opts.large, true, opts.aniso),
        bumpMap: texture(c2, 1 / opts.long, 1 / opts.large, false, opts.aniso),
    };
}

/** Grain fin (enduit, tuile, membrane). */
function texturesGrain(taille, base, amplitude, graine, rep, aniso) {
    const r = alea(graine), c1 = toile(taille), c2 = toile(taille);
    const x1 = c1.getContext('2d'), x2 = c2.getContext('2d');
    const d1 = x1.createImageData(taille, taille), d2 = x2.createImageData(taille, taille);
    const A = hex(base);
    for (let i = 0; i < taille * taille * 4; i += 4) {
        const n = (r() - 0.5) * 2, n2 = (r() - 0.5) * 2;
        d1.data[i] = A[0] + n * amplitude; d1.data[i + 1] = A[1] + n * amplitude; d1.data[i + 2] = A[2] + n * amplitude; d1.data[i + 3] = 255;
        const g = 128 + n2 * 110;
        d2.data[i] = d2.data[i + 1] = d2.data[i + 2] = g; d2.data[i + 3] = 255;
    }
    x1.putImageData(d1, 0, 0); x2.putImageData(d2, 0, 0);
    return { map: texture(c1, rep, rep, true, aniso), bumpMap: texture(c2, rep, rep, false, aniso) };
}

/** Ciel dégradé pour les reflets (zinc, verre). */
export function environnement() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#cfdcec'); g.addColorStop(0.45, '#f4f4f1'); g.addColorStop(0.55, '#e9e5dc'); g.addColorStop(1, '#b9b2a4');
    x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

export function creerMateriaux(qualite) {
    const taille = qualite.tailleTextures, aniso = qualite.anisotropie;
    const std = (o) => new THREE.MeshStandardMaterial(o);
    const bois = (clair, fonce, cernes, graine, long, large, extra = {}) =>
        std({ ...texturesBois(taille, clair, fonce, cernes, graine, { long, large, aniso }), bumpScale: 0.6, roughness: 0.78, metalness: 0, ...extra });

    return {
        boisCharpente: bois(0xE3C493, 0xB08450, 9, 11, 1.4, 0.32),
        boisBardage: bois(0xD3A066, 0xA9733F, 5, 23, 2.4, 0.36, { roughness: 0.7 }),
        boisTerrasse: bois(0xB08B63, 0x735439, 8, 37, 1.5, 0.28, { roughness: 0.82 }),
        boisLiteau: bois(0xD9C39E, 0xB2905F, 6, 51, 1.0, 0.2),
        enduit: std({ ...texturesGrain(taille, 0xF3F0E9, 5, 61, 0.8, aniso), bumpScale: 0.35, roughness: 0.95 }),
        tuile: std({ ...texturesGrain(taille, 0x4A505A, 9, 71, 3, aniso), bumpScale: 0.3, roughness: 0.72, metalness: 0.05, side: THREE.DoubleSide }),
        ecran: std({ ...texturesGrain(taille, 0xC7D0D6, 6, 81, 2, aniso), bumpScale: 0.15, roughness: 0.9, side: THREE.DoubleSide }),
        zinc: std({ color: 0xAEB5BA, roughness: 0.36, metalness: 0.9, side: THREE.DoubleSide }),
        acier: std({ color: 0x5C636B, roughness: 0.5, metalness: 0.75 }),
        alu: std({ color: 0x23272E, roughness: 0.5, metalness: 0.55 }),
        bacAcier: std({ color: 0x2B3038, roughness: 0.45, metalness: 0.6 }),
        verre: std({ color: 0x1A2B4F, roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.42, envMapIntensity: 1.6 }),
        parePluie: std({ color: 0x1B1E23, roughness: 0.85 }),
        plafond: std({ color: 0xE9E3D7, roughness: 0.95 }),
        sol: std({ color: 0xBFB6A6, roughness: 0.9 }),
        beton: std({ color: 0xCFCBC2, roughness: 0.95 }),
    };
}
