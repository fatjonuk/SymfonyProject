"use client";

import { RoundedBox } from "@react-three/drei";
import type { ReactNode } from "react";
import type * as THREE from "three";
import { H } from "./data";
import { mats } from "./materials";

type V = [number, number, number];

/** Box placed by its bottom-centre. */
function B({ p, s, m, r = 0 }: { p: V; s: V; m: THREE.Material; r?: number }) {
  return (
    <mesh position={[p[0], p[1] + s[1] / 2, p[2]]} rotation={[0, r, 0]} material={m} castShadow receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

/** Rounded box placed by its bottom-centre. */
function R({ p, s, m, rad = 0.04 }: { p: V; s: V; m: THREE.Material; rad?: number }) {
  return (
    <RoundedBox args={s} radius={rad} smoothness={3} position={[p[0], p[1] + s[1] / 2, p[2]]} material={m} castShadow receiveShadow />
  );
}

function Rot({ p, r, children }: { p: V; r: number; children: ReactNode }) {
  return (
    <group position={p} rotation={[0, r, 0]}>
      {children}
    </group>
  );
}

function Rug({ p, s, color }: { p: V; s: [number, number]; color: string }) {
  return (
    <mesh position={[p[0], p[1] + 0.006, p[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={s} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  );
}

function Plant({ p, h = 1.2 }: { p: V; h?: number }) {
  const M = mats();
  const leaves: V[] = [
    [0, h * 0.75, 0],
    [0.14, h * 0.62, 0.05],
    [-0.12, h * 0.68, -0.08],
    [0.05, h * 0.9, -0.1],
    [-0.08, h * 0.55, 0.12],
  ];
  return (
    <group position={p}>
      <mesh material={M.pot} position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.16, 0.44, 24]} />
      </mesh>
      <mesh material={M.bark} position={[0, h * 0.4, 0]}>
        <cylinderGeometry args={[0.012, 0.018, h * 0.7, 6]} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} material={i % 2 ? M.foliage : M.foliageDark} position={l} scale={[1, 0.8, 1]} castShadow>
          <icosahedronGeometry args={[0.2 + (i % 3) * 0.04, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Chair({ p, r }: { p: V; r: number }) {
  const M = mats();
  return (
    <Rot p={p} r={r}>
      <R p={[0, 0.42, 0]} s={[0.46, 0.06, 0.46]} m={M.fabricSand} rad={0.02} />
      <R p={[0, 0.48, -0.21]} s={[0.46, 0.42, 0.05]} m={M.fabricSand} rad={0.02} />
      {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z], i) => (
        <B key={i} p={[x, 0, z]} s={[0.03, 0.42, 0.03]} m={M.metalBlack} />
      ))}
    </Rot>
  );
}

function Stool({ p }: { p: V }) {
  const M = mats();
  return (
    <group position={p}>
      <mesh material={M.oak} position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.05, 24]} />
      </mesh>
      <mesh material={M.metalBlack} position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.68, 8]} />
      </mesh>
      <mesh material={M.metalBlack} position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 24]} />
      </mesh>
    </group>
  );
}

function Bed({ p, w, r = 0 }: { p: V; w: number; r?: number }) {
  const M = mats();
  return (
    <Rot p={p} r={r}>
      <B p={[0, 0, 0]} s={[w + 0.1, 0.25, 2.1]} m={M.walnut} />
      <R p={[0, 0.25, 0.02]} s={[w, 0.24, 2.0]} m={M.linen} rad={0.06} />
      <R p={[0, 0.46, 0.38]} s={[w + 0.04, 0.06, 1.25]} m={M.fabricSand} rad={0.03} />
      <R p={[-w / 4, 0.48, -0.75]} s={[w / 2 - 0.1, 0.14, 0.4]} m={M.linen} rad={0.06} />
      <R p={[w / 4, 0.48, -0.75]} s={[w / 2 - 0.1, 0.14, 0.4]} m={M.linen} rad={0.06} />
      <B p={[0, 0, -1.07]} s={[w + 0.5, 1.05, 0.08]} m={M.fabricLight} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <B p={[side * (w / 2 + 0.38), 0, -0.82]} s={[0.48, 0.45, 0.4]} m={M.oak} />
          <mesh material={M.ceramic} position={[side * (w / 2 + 0.38), 0.62, -0.85]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.28, 20]} />
          </mesh>
        </group>
      ))}
    </Rot>
  );
}

export function GroundFurniture() {
  const M = mats();
  return (
    <group>
      {/* ---------------- Salon ---------------- */}
      <Rug p={[-0.4, 0, -1.6]} s={[3.6, 2.6]} color="#d9d0c1" />
      {/* sofa facing the TV wall */}
      <group position={[-0.5, 0, 0.35]}>
        <R p={[0, 0.08, 0]} s={[3.0, 0.36, 0.98]} m={M.fabricLight} rad={0.06} />
        <R p={[0, 0.08, 0.36]} s={[3.0, 0.78, 0.26]} m={M.fabricLight} rad={0.08} />
        <R p={[-1.42, 0.08, 0]} s={[0.22, 0.6, 0.98]} m={M.fabricLight} rad={0.07} />
        <R p={[1.42, 0.08, 0]} s={[0.22, 0.6, 0.98]} m={M.fabricLight} rad={0.07} />
        {[-0.85, 0, 0.85].map((x) => (
          <R key={x} p={[x, 0.44, -0.05]} s={[0.84, 0.14, 0.72]} m={M.fabricLight} rad={0.06} />
        ))}
        <R p={[-0.9, 0.52, 0.18]} s={[0.5, 0.42, 0.14]} m={M.fabricSand} rad={0.06} />
        <R p={[0.95, 0.52, 0.18]} s={[0.46, 0.4, 0.14]} m={M.fabricDark} rad={0.06} />
        <B p={[0, 0, 0]} s={[2.9, 0.08, 0.9]} m={M.metalBlack} />
      </group>
      {/* coffee table */}
      <group position={[-0.4, 0, -1.3]}>
        <mesh material={M.marble} position={[0, 0.34, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.05, 48]} />
        </mesh>
        <mesh material={M.metalBlack} position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.28, 0.32, 32]} />
        </mesh>
        <B p={[0.15, 0.365, 0.05]} s={[0.26, 0.05, 0.2]} m={M.lacquerDark} />
      </group>
      {/* armchair */}
      <Rot p={[1.9, 0, -1.4]} r={-Math.PI / 2.4}>
        <R p={[0, 0.06, 0]} s={[0.85, 0.36, 0.85]} m={M.leather} rad={0.08} />
        <R p={[0, 0.06, 0.34]} s={[0.85, 0.72, 0.18]} m={M.leather} rad={0.08} />
        <B p={[0, 0, 0]} s={[0.7, 0.06, 0.7]} m={M.oak} />
      </Rot>
      {/* TV wall */}
      <B p={[-0.3, 0, -3.95]} s={[3.6, 0.42, 0.42]} m={M.walnut} />
      <B p={[-0.3, 1.1, -4.12]} s={[2.1, 1.18, 0.05]} m={M.screen} />
      <B p={[-0.3, 0.42, -3.95]} s={[3.6, 0.015, 0.42]} m={M.lacquer} />
      <mesh material={M.ceramic} position={[1.1, 0.6, -3.95]} castShadow>
        <sphereGeometry args={[0.12, 24, 16]} />
      </mesh>
      {/* floor lamp */}
      <group position={[-2.4, 0, 0.55]}>
        <mesh material={M.metalBlack} position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 1.6, 8]} />
        </mesh>
        <mesh material={M.linen} position={[0, 1.65, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.24, 0.3, 32, 1, true]} />
        </mesh>
        <mesh material={M.metalBlack} position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.02, 24]} />
        </mesh>
      </group>
      <Plant p={[2.55, 0, 3.6]} h={1.6} />

      {/* ---------------- Stairs (floating oak treads) ---------------- */}
      {Array.from({ length: 17 }).map((_, i) => {
        const rise = H.upperFloor / 17;
        return <B key={i} p={[-6.15, (i + 1) * rise - 0.05, 0.9 - (i + 0.5) * 0.29]} s={[1.05, 0.05, 0.29]} m={M.oak} />;
      })}
      {/* stringer on the open side */}
      <mesh
        material={M.metalBlack}
        position={[-5.6, H.upperFloor / 2, 0.9 - (17 * 0.29) / 2]}
        rotation={[Math.atan2(H.upperFloor, 17 * 0.29), 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.03, 0.18, Math.hypot(H.upperFloor, 17 * 0.29)]} />
      </mesh>

      {/* ---------------- Entrée ---------------- */}
      <B p={[-4.0, 0, 3.6]} s={[0.4, 0.45, 1.3]} m={M.oak} />
      <R p={[-4.0, 0.45, 3.6]} s={[0.38, 0.06, 1.2]} m={M.fabricSand} rad={0.02} />
      <mesh material={M.brass} position={[-4.0, 1.7, 3.6]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.32, 0.012, 8, 48]} />
      </mesh>
      <Plant p={[-6.3, 0, 3.8]} h={1.1} />

      {/* ---------------- Cuisine ---------------- */}
      {/* base units + worktop on the back wall */}
      <B p={[4.35, 0, -3.88]} s={[2.5, 0.86, 0.62]} m={M.lacquerDark} />
      <B p={[4.35, 0.86, -3.88]} s={[2.52, 0.04, 0.64]} m={M.marble} />
      <B p={[4.35, 0, -3.55]} s={[2.4, 0.1, 0.02]} m={M.metalBlack} />
      {/* tall units with the oven */}
      <B p={[6.15, 0, -3.9]} s={[1.1, 2.5, 0.6]} m={M.lacquerDark} />
      {/* sink */}
      <B p={[3.7, 0.88, -3.88]} s={[0.55, 0.01, 0.42]} m={M.steel} />
      <mesh material={M.steel} position={[3.7, 1.08, -4.05]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 10]} />
      </mesh>
      {/* island */}
      <B p={[4.9, 0, -1.2]} s={[2.4, 0.88, 1.0]} m={M.oak} />
      <B p={[4.9, 0.88, -1.2]} s={[2.5, 0.04, 1.06]} m={M.marble} />
      {[4.2, 4.9, 5.6].map((x) => (
        <Stool key={x} p={[x, 0, -0.35]} />
      ))}
      {/* dining */}
      <B p={[4.9, 0.72, 2.4]} s={[2.1, 0.04, 0.95]} m={M.walnut} />
      {[[-0.95], [0.95]].map(([dx]) => (
        <B key={dx} p={[4.9 + dx, 0, 2.4]} s={[0.06, 0.72, 0.85]} m={M.metalBlack} />
      ))}
      {[-0.65, 0, 0.65].map((dx) => (
        <group key={dx}>
          <Chair p={[4.9 + dx, 0, 1.75]} r={0} />
          <Chair p={[4.9 + dx, 0, 3.05]} r={Math.PI} />
        </group>
      ))}
      <mesh material={M.ceramic} position={[4.9, 0.84, 2.4]} castShadow>
        <cylinderGeometry args={[0.1, 0.07, 0.2, 24]} />
      </mesh>
    </group>
  );
}

export function UpperFurniture() {
  const M = mats();
  const y = H.upperFloor;
  return (
    <group>
      {/* Chambre */}
      <Rug p={[0, y, -2.2]} s={[2.6, 2.4]} color="#cfc6b8" />
      <Bed p={[0, y, -3.05]} w={1.6} />
      <B p={[-1.6, y, 2.6]} s={[1.4, 0.75, 0.6]} m={M.oak} />
      <Chair p={[-1.6, y, 2.05]} r={Math.PI} />
      <B p={[1.9, y, 1.2]} s={[0.6, 2.2, 1.8]} m={M.lacquer} />

      {/* Suite parentale */}
      <Rug p={[5.4, y, -2.2]} s={[3.2, 2.6]} color="#d6cdbf" />
      <Bed p={[5.4, y, -3.0]} w={1.8} />
      <R p={[5.4, y, -1.45]} s={[1.6, 0.45, 0.42]} m={M.fabricDark} rad={0.04} />
      <Rot p={[7.2, y, 2.2]} r={-2.4}>
        <R p={[0, 0.06, 0]} s={[0.8, 0.36, 0.8]} m={M.fabricSand} rad={0.08} />
        <R p={[0, 0.06, 0.32]} s={[0.8, 0.7, 0.16]} m={M.fabricSand} rad={0.08} />
      </Rot>
      <B p={[3.0, y, 1.0]} s={[0.6, 2.3, 2.4]} m={M.walnut} />
      <Plant p={[7.7, y, -0.3]} h={1.3} />

      {/* Salle de bains */}
      <R p={[-5.0, y, 2.55]} s={[1.7, 0.55, 0.8]} m={M.ceramic} rad={0.12} />
      <B p={[-5.0, y + 0.5, 2.55]} s={[1.5, 0.02, 0.6]} m={M.water} />
      <B p={[-3.3, y, 1.5]} s={[1.1, 0.55, 0.45]} m={M.walnut} />
      <B p={[-3.3, y + 0.55, 1.5]} s={[1.12, 0.03, 0.48]} m={M.marble} />
      <B p={[-3.3, y + 0.9, 1.28]} s={[0.9, 0.9, 0.02]} m={M.steel} />

      {/* Palier */}
      <Plant p={[-3.1, y, -3.7]} h={1.2} />
    </group>
  );
}
