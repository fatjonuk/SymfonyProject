"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { A } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { PANEL_POS } from "./data";
import { interactive } from "./interaction";
import { mats } from "./materials";
import { glow } from "./textures";

const W = 0.6;
const HGT = 0.95;
const D = 0.14;
const MOD = 0.04; // module width (scaled for legibility)

/** Residential distribution board: enclosure, DIN rails, RCDs and breakers. */
export function Panel() {
  const M = mats();
  const label = useUI((s) => s.panelLabel);
  const halo = useRef<THREE.Mesh>(null);
  const haloMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glow(),
        color: "#F2B705",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  const accent = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#F2B705", emissive: "#F2B705", emissiveIntensity: 0, roughness: 0.4 }),
    [],
  );
  const led = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1a1a", emissive: "#5dff8f", emissiveIntensity: 0 }), []);

  useFrame((s) => {
    const ui = useUI.getState();
    const focus = ui.hovered === "panel" || (ui.selected?.kind === "device" && ui.selected.id === "panel");
    const k = Math.max(A.panel, focus ? 1 : 0);
    const pulse = 0.82 + 0.18 * Math.sin(s.clock.elapsedTime * 2.2);
    haloMat.opacity = k * 0.85 * pulse;
    accent.emissiveIntensity = k * 1.4;
    led.emissiveIntensity = 2 + A.circuits * 0.2;
    if (halo.current) halo.current.scale.setScalar(0.9 + 0.1 * pulse + (focus ? 0.15 : 0));
  });

  const rows = useMemo(() => {
    // 4 rows of 13 modules: [type, width in modules]
    const pattern: [string, number][][] = [
      [["main", 2], ["spd", 2], ["rcd", 2], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["e", 2]],
      [["rcd", 2], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["e", 1], ["e", 1], ["e", 1], ["e", 1]],
      [["rcd", 2], ["b", 1], ["b", 1], ["b", 1], ["b", 1], ["s", 1], ["s", 1], ["s", 1], ["e", 1], ["e", 1], ["e", 1]],
      [["rcd", 2], ["b", 1], ["b", 1], ["s", 1], ["s", 1], ["t", 2], ["t", 2], ["e", 1], ["e", 1], ["e", 1]],
    ];
    return pattern;
  }, []);

  return (
    <group position={PANEL_POS}>
      {/* yellow halo on the wall */}
      <mesh ref={halo} position={[0, 0, -D / 2 + 0.005]} material={haloMat} renderOrder={5}>
        <planeGeometry args={[2.2, 2.2]} />
      </mesh>

      <group {...interactive("device", "panel", 6)}>
        {/* enclosure */}
        <mesh material={M.lacquer} castShadow receiveShadow>
          <boxGeometry args={[W, HGT, D]} />
        </mesh>
        <mesh material={M.deviceGrey} position={[0, 0, D / 2 + 0.002]}>
          <boxGeometry args={[W - 0.06, HGT - 0.08, 0.004]} />
        </mesh>
        {/* opened smoked door, hinged on the left */}
        <group position={[-W / 2, 0, D / 2]} rotation={[0, -1.9, 0]}>
          <mesh position={[W / 2, 0, 0]} material={M.glass}>
            <boxGeometry args={[W, HGT, 0.01]} />
          </mesh>
        </group>
        {rows.map((row, r) => {
          const y = HGT / 2 - 0.17 - r * 0.205;
          let cursor = -6.5 * MOD;
          return (
            <group key={r} position={[0, y, D / 2]}>
              {/* DIN rail cover strip */}
              <mesh material={M.deviceWhite} position={[0, 0.07, 0.006]}>
                <boxGeometry args={[W - 0.08, 0.025, 0.01]} />
              </mesh>
              {row.map(([type, n], k) => {
                const w = n * MOD;
                const x = cursor + w / 2;
                cursor += w;
                if (type === "e") {
                  return (
                    <mesh key={k} material={M.deviceGrey} position={[x, 0, 0.005]}>
                      <boxGeometry args={[w - 0.002, 0.09, 0.008]} />
                    </mesh>
                  );
                }
                const toggle =
                  type === "main" ? M.lacquerDark : type === "rcd" ? accent : type === "s" ? M.lacquerDark : M.metalBlack;
                return (
                  <group key={k} position={[x, 0, 0]}>
                    <mesh material={M.deviceWhite} position={[0, 0, 0.022]} castShadow>
                      <boxGeometry args={[w - 0.003, 0.11, 0.045]} />
                    </mesh>
                    <mesh material={toggle} position={[0, 0.012, 0.048]}>
                      <boxGeometry args={[Math.min(w * 0.45, 0.026), 0.03, 0.012]} />
                    </mesh>
                    {type === "rcd" && (
                      <mesh material={accent} position={[w * 0.3, -0.03, 0.046]}>
                        <cylinderGeometry args={[0.006, 0.006, 0.006, 10]} />
                      </mesh>
                    )}
                    {type === "t" && (
                      <mesh material={led} position={[0, -0.03, 0.046]}>
                        <boxGeometry args={[0.012, 0.006, 0.004]} />
                      </mesh>
                    )}
                    <mesh material={M.deviceGrey} position={[0, -0.042, 0.046]}>
                      <boxGeometry args={[w - 0.01, 0.012, 0.002]} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>

      {label && (
        <Html position={[0.45, 0.62, 0.1]} zIndexRange={[20, 0]} className="pointer-events-none">
          <div className="panel-label">
            <span className="panel-label__dot" />
            <div>
              <p className="panel-label__title">Tableau électrique</p>
              <p className="panel-label__sub">Le cœur de votre installation</p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
