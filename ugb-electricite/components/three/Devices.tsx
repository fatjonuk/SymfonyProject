"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { A } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { CIRCUIT_COLORS, DEVICES, H, type Device } from "./data";
import { interactive } from "./interaction";
import { mats } from "./materials";
import { glow } from "./textures";

const INSIDE = new Set(DEVICES.filter((d) => d.level !== "outside" && d.room !== "exterieur").map((d) => d.id));

const FACING: Record<string, number> = { "+z": 0, "-z": Math.PI, "+x": Math.PI / 2, "-x": -Math.PI / 2 };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Billboard glow that makes small devices readable from far away. */
function Halo({ color, size, strength, id }: { color: string; size: number; strength: () => number; id: string }) {
  // Indoor halos are seen through walls only once the house is open.
  const inside = INSIDE.has(id);
  const ref = useRef<THREE.Sprite>(null);
  const mat = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: glow(),
        color: new THREE.Color(color),
        transparent: true,
        depthWrite: false,
        depthTest: false,
        opacity: 0,
        toneMapped: false,
      }),
    [color],
  );
  useFrame((s) => {
    if (!ref.current) return;
    const ui = useUI.getState();
    const focus = ui.hovered === id || (ui.selected?.kind === "device" && ui.selected.id === id);
    const pulse = 0.85 + 0.15 * Math.sin(s.clock.elapsedTime * 3 + size * 10);
    const k = Math.max(strength(), focus ? 1 : 0);
    mat.opacity = k * pulse * (focus ? 1 : 0.75);
    const sc = size * (focus ? 1.5 : 1) * (0.6 + 0.4 * k);
    ref.current.scale.set(sc, sc, sc);
    ref.current.visible = mat.opacity > 0.01;
    mat.depthTest = !(inside && A.facade > 0.5);
  });
  return <sprite ref={ref} material={mat} renderOrder={30} />;
}

function Outlet({ d }: { d: Device }) {
  const M = mats();
  return (
    <group position={d.pos} rotation={[0, FACING[d.facing ?? "+z"], 0]} {...interactive("device", d.id, 7)}>
      <mesh material={M.deviceWhite} position={[0, 0, 0.006]} castShadow>
        <boxGeometry args={[0.085, 0.085, 0.012]} />
      </mesh>
      <mesh material={M.deviceGrey} position={[0, 0, 0.013]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.027, 0.027, 0.004, 20]} />
      </mesh>
      <Halo id={d.id} color={CIRCUIT_COLORS.outlet} size={0.75} strength={() => A.devices} />
    </group>
  );
}

function Switch({ d }: { d: Device }) {
  const M = mats();
  return (
    <group position={d.pos} rotation={[0, FACING[d.facing ?? "+z"], 0]} {...interactive("device", d.id, 7)}>
      <mesh material={M.deviceWhite} position={[0, 0, 0.006]} castShadow>
        <boxGeometry args={[0.085, 0.085, 0.012]} />
      </mesh>
      <mesh material={M.deviceGrey} position={[0, 0, 0.014]}>
        <boxGeometry args={[0.05, 0.05, 0.006]} />
      </mesh>
      <Halo id={d.id} color={CIRCUIT_COLORS.light} size={0.75} strength={() => A.devices} />
    </group>
  );
}

function Luminaire({ d }: { d: Device }) {
  const M = mats();
  const emissive = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#fff8ec", emissive: "#ffcf87", emissiveIntensity: 0, roughness: 0.4 }),
    [],
  );
  const order = d.order ?? 0;
  const level = () => smooth(order, order + 0.14, A.lights);
  useFrame(() => {
    emissive.emissiveIntensity = level() * 7;
  });

  const [x, y, z] = d.pos;
  const ceil = d.level === "upper" ? H.upperCeil : H.groundCeil;
  const h = interactive("device", d.id, 8);

  switch (d.style) {
    case "spot":
    case "soffit":
      return (
        <group position={[x, y, z]} {...h}>
          <mesh material={M.lightHousing}>
            <cylinderGeometry args={[0.075, 0.075, 0.035, 24]} />
          </mesh>
          <mesh material={emissive} position={[0, -0.019, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.004, 24]} />
          </mesh>
          <Halo id={d.id} color="#FFD27A" size={1.1} strength={level} />
        </group>
      );
    case "disc":
      return (
        <group position={[x, y - 0.02, z]} {...h}>
          <mesh material={M.lightHousing} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 40]} />
          </mesh>
          <mesh material={emissive} position={[0, -0.027, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.006, 40]} />
          </mesh>
          <Halo id={d.id} color="#FFD27A" size={1.8} strength={level} />
        </group>
      );
    case "pendant": {
      const cord = ceil - y - 0.16;
      return (
        <group position={[x, y, z]} {...h}>
          <mesh material={M.metalBlack} position={[0, 0.16 + cord / 2, 0]}>
            <cylinderGeometry args={[0.005, 0.005, cord, 6]} />
          </mesh>
          <mesh material={M.metalBlack} position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.17, 0.22, 32, 1, true]} />
          </mesh>
          <mesh material={M.metalBlack} position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 24]} />
          </mesh>
          <mesh material={emissive} position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.06, 20, 12]} />
          </mesh>
          <Halo id={d.id} color="#FFD27A" size={1.2} strength={level} />
        </group>
      );
    }
    case "linear": {
      const cord = ceil - y - 0.03;
      return (
        <group position={[x, y, z]} {...h}>
          {[-0.65, 0.65].map((dx) => (
            <mesh key={dx} material={M.metalBlack} position={[dx, cord / 2 + 0.03, 0]}>
              <cylinderGeometry args={[0.004, 0.004, cord, 6]} />
            </mesh>
          ))}
          <mesh material={M.metalBlack} castShadow>
            <boxGeometry args={[1.7, 0.05, 0.07]} />
          </mesh>
          <mesh material={emissive} position={[0, -0.027, 0]}>
            <boxGeometry args={[1.62, 0.006, 0.04]} />
          </mesh>
          <Halo id={d.id} color="#FFD27A" size={1.6} strength={level} />
        </group>
      );
    }
    case "bollard":
      return (
        <group position={[x, -0.15, z]} {...h}>
          <mesh material={M.frame} position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.7, 24]} />
          </mesh>
          <mesh material={emissive} position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.072, 0.072, 0.08, 24]} />
          </mesh>
          <Halo id={d.id} color="#FFD27A" size={1.3} strength={level} />
        </group>
      );
    default:
      return null;
  }
}

function Special({ d }: { d: Device }) {
  const M = mats();
  const h = interactive("device", d.id, d.level === "outside" ? 10 : 7);
  const halo = <Halo id={d.id} color={CIRCUIT_COLORS.special} size={1.1} strength={() => A.devices} />;
  const led = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#222", emissive: CIRCUIT_COLORS.special, emissiveIntensity: 0 }),
    [],
  );
  useFrame(() => {
    led.emissiveIntensity = A.devices * 4;
  });

  switch (d.id) {
    case "x-plaque":
      return (
        <group position={d.pos} {...h}>
          <mesh material={M.screen}>
            <boxGeometry args={[0.6, 0.008, 0.5]} />
          </mesh>
          {[[-0.15, -0.11], [0.15, -0.11], [-0.15, 0.12], [0.15, 0.12]].map(([dx, dz], i) => (
            <mesh key={i} position={[dx, 0.005, dz]} rotation={[-Math.PI / 2, 0, 0]} material={led}>
              <ringGeometry args={[0.07, 0.078, 32]} />
            </mesh>
          ))}
          {halo}
        </group>
      );
    case "x-four":
      return (
        <group position={d.pos} {...h}>
          <mesh material={M.screen} position={[0, 0, 0.005]}>
            <boxGeometry args={[0.56, 0.56, 0.02]} />
          </mesh>
          <mesh material={M.steel} position={[0, 0.22, 0.04]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.012, 0.012, 0.45, 12]} />
          </mesh>
          <mesh material={led} position={[0, 0.25, 0.017]}>
            <boxGeometry args={[0.12, 0.025, 0.004]} />
          </mesh>
          {halo}
        </group>
      );
    case "x-borne":
      return (
        <group position={[d.pos[0], 0, d.pos[2]]} {...h}>
          <mesh material={M.frame} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.16, 1.3, 0.12]} />
          </mesh>
          <mesh material={M.deviceWhite} position={[0.1, 0.95, 0]} castShadow>
            <boxGeometry args={[0.07, 0.38, 0.26]} />
          </mesh>
          <mesh material={led} position={[0.136, 1.05, 0]}>
            <boxGeometry args={[0.004, 0.12, 0.03]} />
          </mesh>
          <mesh material={M.metalBlack} position={[0.16, 0.7, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.12, 0.015, 8, 24]} />
          </mesh>
          <group position={[0, 0.9, 0]}>{halo}</group>
        </group>
      );
    case "x-pac":
      return (
        <group position={[d.pos[0], -0.15, d.pos[2]]} {...h}>
          <mesh material={M.stone} position={[0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[1.25, 0.1, 0.6]} />
          </mesh>
          <mesh material={M.deviceGrey} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1.05, 0.78, 0.4]} />
          </mesh>
          <mesh material={M.metalBlack} position={[-0.15, 0.5, -0.205]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.01, 32]} />
          </mesh>
          <mesh material={M.deviceGrey} position={[-0.15, 0.5, -0.215]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.012, 6, 32]} />
          </mesh>
          <mesh material={led} position={[0.38, 0.75, -0.205]}>
            <boxGeometry args={[0.06, 0.02, 0.004]} />
          </mesh>
          <group position={[0, 0.6, 0]}>{halo}</group>
        </group>
      );
    case "x-seche":
      return (
        <group position={d.pos} rotation={[0, FACING[d.facing ?? "+x"], 0]} {...h}>
          {[-0.25, 0.25].map((dx) => (
            <mesh key={dx} material={M.lacquerDark} position={[dx, 0, 0.04]}>
              <cylinderGeometry args={[0.018, 0.018, 1.1, 10]} />
            </mesh>
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} material={M.lacquerDark} position={[0, -0.5 + i * 0.125, 0.04]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.011, 0.011, 0.5, 8]} />
            </mesh>
          ))}
          {halo}
        </group>
      );
    default:
      return null;
  }
}

export function Devices({ level }: { level: "ground" | "upper" }) {
  const list = DEVICES.filter((d) => d.type !== "panel" && (level === "upper" ? d.level === "upper" : d.level !== "upper"));
  return (
    <group>
      {list.map((d) => {
        if (d.type === "outlet") return <Outlet key={d.id} d={d} />;
        if (d.type === "switch") return <Switch key={d.id} d={d} />;
        if (d.type === "light") return <Luminaire key={d.id} d={d} />;
        return <Special key={d.id} d={d} />;
      })}
    </group>
  );
}
