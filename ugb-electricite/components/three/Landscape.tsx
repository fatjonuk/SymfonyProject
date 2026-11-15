"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { mats } from "./materials";

const G = -0.15; // natural ground level

function Tree({ p, s = 1 }: { p: [number, number]; s?: number }) {
  const M = mats();
  const { blobs, branches } = useMemo(() => {
    let seed = Math.abs(p[0] * 13.1 + p[1] * 7.7) + 1;
    const r = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const blobs: [number, number, number, number, number][] = [];
    for (let i = 0; i < 34; i++) {
      const a = r() * Math.PI * 2;
      const h = r();
      const rad = (0.35 + 0.9 * Math.sin(h * Math.PI)) * (0.6 + r() * 0.5);
      blobs.push([Math.cos(a) * rad, 2.6 + h * 2.6, Math.sin(a) * rad, 0.32 + r() * 0.26, r()]);
    }
    const branches: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) branches.push([r() * Math.PI * 2, 0.35 + r() * 0.3, 2.2 + r() * 1.2]);
    return { blobs, branches };
  }, [p]);
  return (
    <group position={[p[0], G, p[1]]} scale={s}>
      <mesh material={M.bark} position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.11, 3.2, 10]} />
      </mesh>
      {branches.map(([a, tilt, y], i) => (
        <mesh key={i} material={M.bark} position={[Math.cos(a) * 0.35, y + 0.4, Math.sin(a) * 0.35]} rotation={[Math.sin(a) * tilt, 0, -Math.cos(a) * tilt]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 1.4, 6]} />
        </mesh>
      ))}
      {blobs.map(([x, y, z, r, c], i) => (
        <mesh key={i} material={c > 0.6 ? M.foliageDark : M.foliage} position={[x, y, z]} scale={[1, 0.85, 1]} castShadow>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Hedge({ p, s }: { p: [number, number, number]; s: [number, number, number] }) {
  const M = mats();
  return (
    <group position={p}>
      <mesh material={M.concrete} position={[0, s[1] * 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[s[0] + 0.12, s[1] * 0.5, s[2] + 0.12]} />
      </mesh>
      <RoundedBox args={s} radius={0.16} smoothness={3} position={[0, s[1] * 0.5 + 0.12, 0]} material={M.foliage} castShadow receiveShadow />
    </group>
  );
}

function Lounger({ p, r }: { p: [number, number, number]; r: number }) {
  const M = mats();
  return (
    <group position={p} rotation={[0, r, 0]}>
      <mesh material={M.frame} position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.7, 0.05, 1.9]} />
      </mesh>
      <RoundedBox args={[0.66, 0.08, 1.3]} radius={0.03} position={[0, 0.22, 0.28]} material={M.linen} castShadow />
      <RoundedBox
        args={[0.66, 0.08, 0.65]}
        radius={0.03}
        position={[0, 0.42, -0.62]}
        rotation={[0.75, 0, 0]}
        material={M.linen}
        castShadow
      />
    </group>
  );
}

export function Landscape() {
  const M = mats();
  return (
    <group>
      {/* infinite studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, G, 0]} material={M.ground} receiveShadow>
        <planeGeometry args={[400, 400]} />
      </mesh>
      {/* lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, G + 0.004, 8.4]} material={M.lawn} receiveShadow>
        <planeGeometry args={[19, 8]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.5, G + 0.004, -7.4]} material={M.lawn} receiveShadow>
        <planeGeometry args={[19, 5]} />
      </mesh>

      {/* driveway & entrance path */}
      <mesh position={[-9.4, G + 0.01, 5]} material={M.stone} receiveShadow>
        <boxGeometry args={[3.8, 0.02, 19]} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-4.85, G + 0.02, 5.1 + i * 0.85]} material={M.stone} receiveShadow castShadow>
          <boxGeometry args={[1.1, 0.04, 0.55]} />
        </mesh>
      ))}

      {/* terrace deck structure (its surface is the clickable "Extérieurs" floor) */}
      <mesh position={[9.25, G + 0.06, 0.5]} material={M.concrete} receiveShadow castShadow>
        <boxGeometry args={[4.5, 0.12, 8.2]} />
      </mesh>

      {/* pool */}
      <group position={[5.5, G, 8.4]}>
        <mesh material={M.water} position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[8.6, 0.02, 3.2]} />
        </mesh>
        {[
          [0, 1.8, 9.4, 0.4],
          [0, -1.8, 9.4, 0.4],
          [4.5, 0, 0.4, 3.2],
          [-4.5, 0, 0.4, 3.2],
        ].map(([x, z, w, d], i) => (
          <mesh key={i} material={M.stone} position={[x, 0.05, z]} receiveShadow castShadow>
            <boxGeometry args={[w, 0.1, d]} />
          </mesh>
        ))}
      </group>
      <Lounger p={[8.1, -0.02, 3.0]} r={Math.PI} />
      <Lounger p={[9.3, -0.02, 3.0]} r={Math.PI} />

      {/* planting */}
      <Hedge p={[11.9, G, 0.5]} s={[0.6, 0.9, 7.6]} />
      <Hedge p={[-1.0, G, -5.7]} s={[5.5, 0.8, 0.6]} />
      <Hedge p={[-7.6, G, -1.5]} s={[0.5, 0.7, 5.0]} />
      <Tree p={[-10.5, -6.5]} s={1.05} />
      <Tree p={[13.5, 9.5]} s={0.95} />
      <Tree p={[12.8, -5.5]} s={1.15} />
    </group>
  );
}
