/*
 * Shared PBR material library.
 * Geometry UVs are expressed in metres, tiled textures cover 2 m (repeat 0.5).
 */
import * as THREE from 'three';
import { cladding, concrete, fabric, oak, plaster, stone, tiles, brushed } from './textures.js';

function rep(texture, r = 0.5) {
    const t = texture.clone();
    t.repeat.set(r, r);
    t.needsUpdate = true;
    return t;
}

export function createMaterials() {
    const std = (p) => new THREE.MeshStandardMaterial(p);
    const fab = fabric();
    const brush = brushed();

    return {
        plaster: std({ color: '#ffffff', map: rep(plaster()), roughness: 0.93 }),
        plasterInt: std({ color: '#fbf8f3', map: rep(plaster()), roughness: 0.95 }),
        concrete: std({ color: '#ffffff', map: rep(concrete()), roughness: 0.86 }),
        slabEdge: std({ color: '#ebe8e2', map: rep(plaster()), roughness: 0.9 }),
        ceiling: std({ color: '#f6f4ef', map: rep(plaster()), roughness: 0.96 }),
        cladding: std({ color: '#ffffff', map: rep(cladding()), roughness: 0.78 }),
        oakFloor: std({ color: '#ffffff', map: rep(oak()), roughness: 0.5 }),
        oak: std({ color: '#ffffff', map: rep(oak(), 1), roughness: 0.55 }),
        walnut: std({ color: '#6b4a33', map: rep(oak(), 1), roughness: 0.5 }),
        deck: std({ color: '#c9a27e', map: rep(cladding(), 0.6), roughness: 0.8 }),
        stone: std({ color: '#ffffff', map: rep(stone()), roughness: 0.82 }),
        tiles: std({ color: '#ffffff', map: rep(tiles()), roughness: 0.32 }),
        ground: std({ color: '#e4dfd2', roughness: 1 }),
        lawn: std({ color: '#a9b48f', roughness: 1 }),
        asphalt: std({ color: '#55565a', roughness: 0.95 }),
        frame: std({ color: '#26292e', metalness: 0.55, roughness: 0.42 }),
        glass: new THREE.MeshPhysicalMaterial({
            color: '#d9e8ec',
            metalness: 0,
            roughness: 0.03,
            transparent: true,
            opacity: 0.22,
            envMapIntensity: 1.8,
            side: THREE.DoubleSide,
            depthWrite: false,
        }),
        railGlass: new THREE.MeshPhysicalMaterial({
            color: '#e6f0f2',
            roughness: 0.05,
            transparent: true,
            opacity: 0.14,
            envMapIntensity: 1.4,
            side: THREE.DoubleSide,
            depthWrite: false,
        }),
        showerGlass: new THREE.MeshPhysicalMaterial({
            color: '#eef4f4',
            roughness: 0.04,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
            depthWrite: false,
        }),
        mirror: std({ color: '#c9ced3', metalness: 1, roughness: 0.04, envMapIntensity: 1.6 }),
        fabricLight: std({ color: '#ddd6ca', roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
        fabricSand: std({ color: '#c7b8a2', roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
        fabricDark: std({ color: '#55585c', roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
        linen: std({ color: '#f3f0ea', roughnessMap: fab, roughness: 1 }),
        towel: std({ color: '#6b6e72', roughnessMap: fab, bumpMap: fab, bumpScale: 0.8, roughness: 1 }),
        towelLight: std({ color: '#d8d0c3', roughnessMap: fab, bumpMap: fab, bumpScale: 0.8, roughness: 1 }),
        leather: std({ color: '#8a5634', roughness: 0.55 }),
        marble: std({ color: '#efece7', roughness: 0.18 }),
        quartz: std({ color: '#e7dfd2', roughness: 0.28 }),
        lacquer: std({ color: '#f2f0eb', roughness: 0.32 }),
        taupe: std({ color: '#b9b0a2', roughness: 0.45 }),
        lacquerDark: std({ color: '#2f3336', roughness: 0.38 }),
        metalBlack: std({ color: '#1c1d1f', metalness: 0.7, roughness: 0.38 }),
        steel: std({ color: '#c3c6c9', metalness: 1, roughness: 0.25, roughnessMap: brush }),
        chrome: std({ color: '#e7e9eb', metalness: 1, roughness: 0.12 }),
        brass: std({ color: '#b8925a', metalness: 1, roughness: 0.3 }),
        screen: std({ color: '#0b0c0e', roughness: 0.12, metalness: 0.2 }),
        ceramic: std({ color: '#fbfbf9', roughness: 0.12 }),
        foliage: std({ color: '#6d7b58', roughness: 0.9 }),
        foliageDark: std({ color: '#55623f', roughness: 0.9 }),
        bark: std({ color: '#6a5a4a', roughness: 1 }),
        pot: std({ color: '#c9c2b6', roughness: 0.9 }),
        water: new THREE.MeshPhysicalMaterial({
            color: '#7fb7c4',
            roughness: 0.04,
            metalness: 0.05,
            transparent: true,
            opacity: 0.9,
            envMapIntensity: 1.4,
            clearcoat: 1,
        }),
        pv: new THREE.MeshPhysicalMaterial({ color: '#16213a', roughness: 0.16, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.05 }),
        deviceWhite: std({ color: '#f7f7f5', roughness: 0.35 }),
        deviceGrey: std({ color: '#d5d6d8', roughness: 0.45 }),
        lightHousing: std({ color: '#f4f4f2', roughness: 0.4 }),
        carPaint: new THREE.MeshPhysicalMaterial({ color: '#6c7076', metalness: 0.65, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }),
        carGlass: new THREE.MeshPhysicalMaterial({ color: '#1b2229', metalness: 0.2, roughness: 0.05, clearcoat: 1 }),
        rubber: std({ color: '#1a1a1b', roughness: 0.9 }),
        rim: std({ color: '#9da2a8', metalness: 1, roughness: 0.3 }),
        tailLight: std({ color: '#5a0d10', emissive: '#c4141c', emissiveIntensity: 0.6, roughness: 0.3 }),
        headLight: std({ color: '#e9eef2', emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.2 }),
    };
}

/** Warm LED emissive material, intensity animated by the scene effects. */
export function ledMaterial(color = '#ffcf87', intensity = 0) {
    return new THREE.MeshStandardMaterial({ color: '#fff8ec', emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}
