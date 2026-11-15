import * as THREE from "three";
import { cladding, concrete, fabric, oak, plaster, stone } from "./textures";

/**
 * Shared PBR material library. Created once on the client.
 * Geometry UVs are expressed in metres, textures cover 2 m (repeat 0.5).
 */

let lib: ReturnType<typeof build> | null = null;

function rep<T extends THREE.Texture>(t: T, r = 0.5) {
  const c = t.clone();
  c.repeat.set(r, r);
  c.needsUpdate = true;
  return c;
}

function build() {
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  const fab = fabric();
  return {
    plaster: std({ color: "#ffffff", map: rep(plaster()), roughness: 0.93 }),
    plasterInt: std({ color: "#fbf8f3", map: rep(plaster()), roughness: 0.95 }),
    concrete: std({ color: "#ffffff", map: rep(concrete()), roughness: 0.86 }),
    slabEdge: std({ color: "#ebe8e2", map: rep(plaster()), roughness: 0.9 }),
    cladding: std({ color: "#ffffff", map: rep(cladding()), roughness: 0.78 }),
    oakFloor: std({ color: "#ffffff", map: rep(oak()), roughness: 0.5 }),
    oak: std({ color: "#ffffff", map: rep(oak(), 1), roughness: 0.55 }),
    walnut: std({ color: "#6b4a33", map: rep(oak(), 1), roughness: 0.5 }),
    deck: std({ color: "#c9a27e", map: rep(cladding(), 0.6), roughness: 0.8 }),
    stone: std({ color: "#ffffff", map: rep(stone()), roughness: 0.82 }),
    ground: std({ color: "#ebe6dc", roughness: 1 }),
    lawn: std({ color: "#b9bfa4", roughness: 1 }),
    frame: std({ color: "#26292e", metalness: 0.55, roughness: 0.42 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#d9e8ec",
      metalness: 0,
      roughness: 0.03,
      transparent: true,
      opacity: 0.24,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
      depthWrite: false,
      reflectivity: 0.9,
    }),
    railGlass: new THREE.MeshPhysicalMaterial({
      color: "#e6f0f2",
      roughness: 0.05,
      transparent: true,
      opacity: 0.16,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    fabricLight: std({ color: "#ddd6ca", roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
    fabricSand: std({ color: "#c7b8a2", roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
    fabricDark: std({ color: "#55585c", roughnessMap: fab, bumpMap: fab, bumpScale: 0.6, roughness: 1 }),
    linen: std({ color: "#f3f0ea", roughnessMap: fab, roughness: 1 }),
    leather: std({ color: "#8a5634", roughness: 0.55 }),
    marble: std({ color: "#efece7", roughness: 0.18, metalness: 0 }),
    lacquer: std({ color: "#f2f0eb", roughness: 0.32 }),
    lacquerDark: std({ color: "#2f3336", roughness: 0.38 }),
    metalBlack: std({ color: "#1c1d1f", metalness: 0.7, roughness: 0.38 }),
    steel: std({ color: "#b9bcbf", metalness: 1, roughness: 0.28 }),
    brass: std({ color: "#b8925a", metalness: 1, roughness: 0.3 }),
    screen: std({ color: "#0b0c0e", roughness: 0.12, metalness: 0.2 }),
    ceramic: std({ color: "#fbfbf9", roughness: 0.12 }),
    foliage: std({ color: "#6d7b58", roughness: 0.9 }),
    foliageDark: std({ color: "#55623f", roughness: 0.9 }),
    bark: std({ color: "#6a5a4a", roughness: 1 }),
    pot: std({ color: "#c9c2b6", roughness: 0.9 }),
    water: new THREE.MeshPhysicalMaterial({
      color: "#7fb7c4",
      roughness: 0.04,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      envMapIntensity: 1.6,
      clearcoat: 1,
    }),
    pv: std({ color: "#1a2742", roughness: 0.18, metalness: 0.6 }),
    deviceWhite: std({ color: "#f7f7f5", roughness: 0.35 }),
    deviceGrey: std({ color: "#d5d6d8", roughness: 0.45 }),
    lightHousing: std({ color: "#f4f4f2", roughness: 0.4 }),
  };
}

export type Materials = ReturnType<typeof build>;

export function mats(): Materials {
  if (!lib) lib = build();
  return lib;
}
