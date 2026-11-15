"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { A, EXPLODE } from "@/lib/anim";
import { useUI } from "@/lib/store";

type PL = { p: [number, number, number]; upper?: boolean; at: number; i: number; d: number; ids: string[] };

/**
 * Warm interior lights that come on at the end of the sequence (no shadows: cheap).
 * Each one follows the luminaires of its room: switching them off dims the room.
 */
const POINTS: PL[] = [
  { p: [-5.2, 2.5, 2.8], at: 0.0, i: 5, d: 7, ids: ["l-entree"] },
  { p: [0, 2.6, -0.2], at: 0.15, i: 9, d: 10, ids: ["l-spot-1", "l-spot-2", "l-spot-3", "l-spot-4", "l-spot-5", "l-spot-6"] },
  { p: [4.9, 1.8, -1.2], at: 0.3, i: 7, d: 8, ids: ["l-susp-1", "l-susp-2", "l-susp-3"] },
  { p: [4.9, 1.6, 2.4], at: 0.38, i: 5, d: 6, ids: ["l-table"] },
  { p: [0, 5.7, -0.6], upper: true, at: 0.5, i: 6, d: 8, ids: ["l-chambre"] },
  { p: [5.4, 5.7, -0.6], upper: true, at: 0.55, i: 7, d: 9, ids: ["l-suite"] },
  { p: [-4.4, 5.7, 2.25], upper: true, at: 0.6, i: 4, d: 6, ids: ["l-sdb"] },
  { p: [7.75, 2.5, 0], upper: true, at: 0.68, i: 6, d: 8, ids: ["l-sous-face-1", "l-sous-face-2", "l-sous-face-3"] },
];

function InteriorLights() {
  const refs = useRef<(THREE.PointLight | null)[]>([]);
  const on = useRef(POINTS.map(() => 1));
  useFrame((_, dt) => {
    const off = useUI.getState().off;
    POINTS.forEach((l, k) => {
      const el = refs.current[k];
      if (!el) return;
      const share = l.ids.filter((id) => !off[id]).length / l.ids.length;
      on.current[k] += (share - on.current[k]) * Math.min(1, dt * 8);
      const t = Math.min(1, Math.max(0, (A.lights - l.at) / 0.18));
      el.intensity = t * t * (3 - 2 * t) * l.i * on.current[k];
      el.position.y = l.p[1] + (l.upper ? A.floor * EXPLODE.floorLift : 0);
      el.visible = el.intensity > 0.01;
    });
  });
  return (
    <>
      {POINTS.map((l, k) => (
        <pointLight
          key={k}
          ref={(el) => {
            refs.current[k] = el;
          }}
          position={l.p}
          color="#ffc98a"
          intensity={0}
          distance={l.d}
          decay={1.6}
        />
      ))}
    </>
  );
}

export function Lighting() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const quality = useUI((s) => s.quality);

  useEffect(() => {
    if (!sun.current) return;
    sun.current.target.position.set(0.5, 0, 0);
    sun.current.target.updateMatrixWorld();
  }, []);

  useFrame(() => {
    if (sun.current) sun.current.intensity = 3.0 * A.sun;
    if (hemi.current) hemi.current.intensity = 0.3 + 0.25 * A.sun;
  });

  const map = quality === "high" ? 4096 : 1024;

  return (
    <>
      <hemisphereLight ref={hemi} args={["#fffaf1", "#d9cfbe", 1]} />
      <directionalLight
        ref={sun}
        position={[-24, 25, 9]}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[map, map]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.035}
        shadow-radius={4}
      >
        <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30, 1, 90]} />
      </directionalLight>
      <InteriorLights />
      {/* Studio environment for glass and metal reflections (no network needed) */}
      <Environment resolution={256} frames={1} environmentIntensity={0.42}>
        <color attach="background" args={["#eeece6"]} />
        <Lightformer form="rect" intensity={1.0} position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-14, 4, 10]} rotation-y={Math.PI / 3} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={0.5} position={[16, 3, -6]} rotation-y={-Math.PI / 2.5} scale={[16, 5, 1]} />
        <Lightformer form="rect" color="#cfdbe4" intensity={0.4} position={[0, 4, -18]} scale={[30, 8, 1]} />
        <Lightformer form="ring" color="#fff1d6" intensity={1.6} position={[10, 9, 14]} scale={4} />
      </Environment>
    </>
  );
}
