"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { A } from "@/lib/anim";
import { wallGeometry, type Opening } from "./geometry";
import { mats } from "./materials";

type Anim = {
  key: "facade" | "walls";
  /** Opacity reached when the animation value is 1. */
  min: number;
  /** Outward translation reached when the animation value is 1. */
  dist?: number;
};

type Props = {
  /** Centre line start / end in plan: [x, z] */
  a: [number, number];
  b: [number, number];
  y?: number;
  h: number;
  t?: number;
  openings?: Opening[];
  material?: THREE.Material;
  skin?: THREE.Material;
  skinT?: number;
  anim?: Anim;
};

const FRAME = 0.055;

export function Wall({ a, b, y = 0, h, t = 0.3, openings = [], material, skin, skinT = 0.035, anim }: Props) {
  const M = mats();
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Mesh[]>([]);

  const { L, rot, n } = useMemo(() => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const L = Math.hypot(dx, dz);
    const ux = dx / L;
    const uz = dz / L;
    return { L, rot: Math.atan2(-uz, ux), n: [-uz, ux] as [number, number] };
  }, [a, b]);

  const geos = useMemo(() => {
    const coreZ1 = skin ? t / 2 - skinT : t / 2;
    return {
      core: wallGeometry(L, h, -t / 2, coreZ1, openings),
      skin: skin ? wallGeometry(L, h, coreZ1, t / 2, openings) : null,
    };
  }, [L, h, t, skin, skinT, openings]);

  // Each animated wall owns material clones so it can fade independently.
  const m = useMemo(() => {
    const base = {
      core: material ?? M.plaster,
      skin: skin ?? null,
      frame: M.frame,
      glass: M.glass,
      door: M.walnut,
    };
    if (!anim) return base;
    return {
      core: base.core.clone(),
      skin: base.skin ? base.skin.clone() : null,
      frame: base.frame.clone(),
      glass: base.glass.clone(),
      door: base.door.clone(),
    };
  }, [anim, material, skin, M]);

  const glassBase = M.glass.opacity;
  const last = useRef(-1);

  useFrame(() => {
    if (!anim || !group.current) return;
    const k = A[anim.key];
    if (k === last.current) return;
    last.current = k;
    const off = (anim.dist ?? 0) * k;
    group.current.position.set(a[0] + n[0] * off, y, a[1] + n[1] * off);
    const op = 1 - k * (1 - anim.min);
    const solid = op > 0.999;
    for (const mat of [m.core, m.skin, m.frame, m.door]) {
      if (!mat) continue;
      mat.opacity = op;
      mat.transparent = !solid;
      mat.depthWrite = op > 0.55;
    }
    m.glass.opacity = glassBase * op;
    for (const mesh of meshes.current) if (mesh) mesh.castShadow = op > 0.45;
  });

  let i = 0;
  const reg = (el: THREE.Mesh | null) => {
    if (el) meshes.current[i++] = el;
  };
  meshes.current.length = 0;

  const zf = t / 2 - 0.11; // frames are set back from the outer face

  return (
    <group ref={group} position={[a[0], y, a[1]]} rotation={[0, rot, 0]}>
      <mesh ref={reg} geometry={geos.core} material={m.core} castShadow receiveShadow />
      {geos.skin && m.skin && <mesh ref={reg} geometry={geos.skin} material={m.skin} castShadow receiveShadow />}
      {openings.map((o, k) => {
        const w = o.u1 - o.u0;
        const hh = o.v1 - o.v0;
        const cu = (o.u0 + o.u1) / 2;
        const cv = (o.v0 + o.v1) / 2;
        if (o.type === "void") return null;
        if (o.type === "door") {
          return (
            <group key={k} position={[cu, cv, zf]}>
              <mesh material={m.frame} position={[0, hh / 2 - FRAME / 2, 0]}>
                <boxGeometry args={[w, FRAME, 0.09]} />
              </mesh>
              <mesh material={m.frame} position={[-w / 2 + FRAME / 2, 0, 0]}>
                <boxGeometry args={[FRAME, hh, 0.09]} />
              </mesh>
              <mesh material={m.frame} position={[w / 2 - FRAME / 2, 0, 0]}>
                <boxGeometry args={[FRAME, hh, 0.09]} />
              </mesh>
              <mesh ref={reg} material={m.door} position={[0, -FRAME / 2, 0]} castShadow>
                <boxGeometry args={[w - FRAME * 2, hh - FRAME, 0.05]} />
              </mesh>
              <mesh material={m.frame} position={[w / 2 - 0.16, 0, 0.06]}>
                <boxGeometry args={[0.025, 0.9, 0.03]} />
              </mesh>
            </group>
          );
        }
        const panes = o.panes ?? 1;
        const mullions = [];
        for (let p = 1; p < panes; p++) mullions.push(-w / 2 + (w * p) / panes);
        return (
          <group key={k} position={[cu, cv, zf]}>
            <mesh material={m.frame} position={[0, hh / 2 - FRAME / 2, 0]}>
              <boxGeometry args={[w, FRAME, 0.08]} />
            </mesh>
            <mesh material={m.frame} position={[0, -hh / 2 + FRAME / 2, 0]}>
              <boxGeometry args={[w, FRAME, 0.08]} />
            </mesh>
            <mesh material={m.frame} position={[-w / 2 + FRAME / 2, 0, 0]}>
              <boxGeometry args={[FRAME, hh, 0.08]} />
            </mesh>
            <mesh material={m.frame} position={[w / 2 - FRAME / 2, 0, 0]}>
              <boxGeometry args={[FRAME, hh, 0.08]} />
            </mesh>
            {mullions.map((x, j) => (
              <mesh key={j} material={m.frame} position={[x, 0, 0]}>
                <boxGeometry args={[0.04, hh, 0.07]} />
              </mesh>
            ))}
            <mesh material={m.glass} renderOrder={2}>
              <planeGeometry args={[w - FRAME, hh - FRAME]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
