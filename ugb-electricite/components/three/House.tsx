"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { A, EXPLODE, K } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { Circuits, RiserBridge } from "./Circuits";
import { CIRCUIT_COLORS, H, ROOMS, type Room } from "./data";
import { Devices, Halo } from "./Devices";
import { GroundFurniture, UpperFurniture } from "./Furniture";
import { floorGeometry, slabGeometry, type Opening } from "./geometry";
import { interactive } from "./interaction";
import { Landscape } from "./Landscape";
import { mats } from "./materials";
import { Panel } from "./Panel";
import { Wall } from "./Wall";

const FRONT = { key: "facade", min: 0.08, dist: EXPLODE.facade } as const;
const BACK = { key: "facade", min: 0.92, dist: EXPLODE.facade * 0.5 } as const;
const INNER = { key: "walls", min: 0.28 } as const;

/* Openings (u along the wall from its start point, v from its base) */
const O = {
  gFront: [
    { u0: 1.6, u1: 2.7, v0: 0, v1: 2.4, type: "door" },
    { u0: 4.2, u1: 13.4, v0: 0, v1: 2.75, type: "window", panes: 5 },
  ],
  gBack: [
    { u0: 1.6, u1: 3.7, v0: 1.15, v1: 2.5, type: "window", panes: 2 },
    { u0: 4.4, u1: 5.1, v0: 0.3, v1: 2.7, type: "window" },
    { u0: 12.6, u1: 13.5, v0: 0.6, v1: 2.8, type: "window" },
  ],
  gLeft: [{ u0: 6.0, u1: 7.2, v0: 0.8, v1: 2.4, type: "window" }],
  gRight: [{ u0: 1.4, u1: 5.4, v0: 0, v1: 2.75, type: "window", panes: 2 }],
  uFront: [
    { u0: 1.6, u1: 2.5, v0: 1.1, v1: 2.2, type: "window" },
    { u0: 5.4, u1: 8.6, v0: 0, v1: 2.6, type: "window", panes: 2 },
    { u0: 10.8, u1: 14.8, v0: 0, v1: 2.6, type: "window", panes: 3 },
  ],
  uBack: [
    { u0: 0.9, u1: 5.3, v0: 1.9, v1: 2.5, type: "window", panes: 3 },
    { u0: 6.7, u1: 10.3, v0: 1.9, v1: 2.5, type: "window", panes: 2 },
    { u0: 11.9, u1: 13.7, v0: 0.3, v1: 2.6, type: "window" },
  ],
  uRight: [{ u0: 1.7, u1: 5.7, v0: 0.5, v1: 2.5, type: "window", panes: 2 }],
  w1: [{ u0: 2.0, u1: 3.1, v0: 0, v1: 2.2, type: "void" }],
  w2: [{ u0: 0.94, u1: 2.04, v0: 0, v1: 2.2, type: "void" }],
  u1: [{ u0: 2.1, u1: 2.8, v0: 0, v1: 2.15, type: "void" }],
  u2: [{ u0: 0.4, u1: 1.3, v0: 0, v1: 2.15, type: "void" }],
  u3: [{ u0: 0.4, u1: 1.3, v0: 0, v1: 2.15, type: "void" }],
} satisfies Record<string, Opening[]>;

/** Clickable floor of a room, gently highlighted on hover / selection. */
function RoomFloor({ room }: { room: Room }) {
  const M = mats();
  const base = room.id === "cuisine" || room.id === "sdb" || room.id === "entree" ? M.stone : room.id === "exterieur" ? M.deck : M.oakFloor;
  const mat = useMemo(() => {
    const m = base.clone() as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color("#F2B705");
    m.emissiveIntensity = 0;
    return m;
  }, [base]);
  const geos = useMemo(() => room.rects.map((r) => floorGeometry(...r)), [room]);
  const cur = useRef(0);
  useFrame((_, dt) => {
    const ui = useUI.getState();
    const on = ui.hovered === room.id ? 0.12 : ui.selected?.kind === "room" && ui.selected.id === room.id ? 0.18 : 0;
    cur.current += (on - cur.current) * Math.min(1, dt * 8);
    mat.emissiveIntensity = cur.current;
  });
  return (
    <group position={[0, room.y + 0.004, 0]} {...interactive("room", room.id)}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={mat} receiveShadow />
      ))}
    </group>
  );
}

function GlassRail({ from, to, y, h = 1.0 }: { from: [number, number]; to: [number, number]; y: number; h?: number }) {
  const M = mats();
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const rot = Math.atan2(-(to[1] - from[1]), to[0] - from[0]);
  return (
    <group position={[(from[0] + to[0]) / 2, y, (from[1] + to[1]) / 2]} rotation={[0, rot, 0]}>
      <mesh material={M.railGlass} position={[0, h / 2, 0]} renderOrder={3}>
        <boxGeometry args={[len, h, 0.02]} />
      </mesh>
      <mesh material={M.frame} position={[0, 0.03, 0]}>
        <boxGeometry args={[len, 0.06, 0.06]} />
      </mesh>
    </group>
  );
}

function GroundLevel() {
  const M = mats();
  const plinth = useMemo(() => slabGeometry([-7.1, 7.1, -4.6, 4.6], -0.15, 0), []);
  return (
    <group>
      <mesh geometry={plinth} material={M.concrete} receiveShadow castShadow />
      {/* exterior walls */}
      <Wall a={[-7, 4.35]} b={[7, 4.35]} h={H.groundCeil} openings={O.gFront} anim={FRONT} />
      <Wall a={[7, -4.35]} b={[-7, -4.35]} h={H.groundCeil} openings={O.gBack} anim={BACK} />
      <Wall a={[-6.85, -4.2]} b={[-6.85, 4.2]} h={H.groundCeil} openings={O.gLeft} anim={BACK} />
      <Wall a={[6.85, 4.2]} b={[6.85, -4.2]} h={H.groundCeil} openings={O.gRight} anim={FRONT} />
      {/* partitions — the technical wall carrying the panel never fades */}
      <Wall a={[-6.7, 1.2]} b={[-3.5, 1.2]} h={H.groundCeil} t={0.12} material={M.plasterInt} openings={O.w1} />
      <Wall a={[-3.5, 1.26]} b={[-3.5, 4.2]} h={H.groundCeil} t={0.12} material={M.plasterInt} openings={O.w2} anim={INNER} />
      {ROOMS.filter((r) => r.level === "ground").map((r) => (
        <RoomFloor key={r.id} room={r} />
      ))}
      <GroundFurniture />
      <Panel />
      <Devices level="ground" />
      <Circuits level="ground" />
    </group>
  );
}

function UpperLevel() {
  const M = mats();
  const slab = useMemo(() => slabGeometry([-7, 8.5, -4.5, 4.5], H.groundCeil, H.upperFloor, [-6.7, -5.5, -4.2, 0.9]), []);
  const y = H.upperFloor;
  const h = H.upperCeil - H.upperFloor;
  return (
    <group>
      <mesh geometry={slab} material={M.slabEdge} receiveShadow castShadow />
      <Wall a={[-7, 3.45]} b={[8.5, 3.45]} y={y} h={h} openings={O.uFront} material={M.plasterInt} skin={M.cladding} anim={FRONT} />
      <Wall a={[8.5, -4.35]} b={[-7, -4.35]} y={y} h={h} openings={O.uBack} material={M.plasterInt} skin={M.cladding} anim={BACK} />
      <Wall a={[-6.85, -4.2]} b={[-6.85, 3.3]} y={y} h={h} material={M.plasterInt} skin={M.cladding} anim={BACK} />
      <Wall a={[8.35, 3.3]} b={[8.35, -4.2]} y={y} h={h} openings={O.uRight} material={M.plasterInt} skin={M.cladding} anim={FRONT} />
      <Wall a={[-6.7, 1.2]} b={[-2.5, 1.2]} y={y} h={h} t={0.12} material={M.plasterInt} openings={O.u1} anim={INNER} />
      <Wall a={[-2.5, -4.2]} b={[-2.5, 3.3]} y={y} h={h} t={0.12} material={M.plasterInt} openings={O.u2} anim={INNER} />
      <Wall a={[2.5, -4.2]} b={[2.5, 3.3]} y={y} h={h} t={0.12} material={M.plasterInt} openings={O.u3} anim={INNER} />
      {/* balcony + stairwell guards */}
      <GlassRail from={[-7, 4.44]} to={[8.5, 4.44]} y={y} />
      <GlassRail from={[8.44, 3.6]} to={[8.44, 4.44]} y={y} />
      <GlassRail from={[-5.5, -4.2]} to={[-5.5, 0.9]} y={y} />
      <GlassRail from={[-6.7, 0.9]} to={[-5.5, 0.9]} y={y} />
      {ROOMS.filter((r) => r.level === "upper").map((r) => (
        <RoomFloor key={r.id} room={r} />
      ))}
      <UpperFurniture />
      <Devices level="upper" />
      <Circuits level="upper" />
    </group>
  );
}

function Roof() {
  const M = mats();
  const slab = useMemo(() => slabGeometry([-7.25, 8.75, -4.75, 3.85], H.upperCeil, H.roofTop), []);
  const pv = useMemo(() => {
    const list: [number, number][] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) list.push([-0.6 + i * 1.12, -3.0 + j * 1.95]);
    return list;
  }, []);
  const top = H.roofTop;
  return (
    <group>
      <mesh geometry={slab} material={M.slabEdge} castShadow receiveShadow />
      {/* parapet band */}
      {[
        [0.75, -4.67, 16, 0.16],
        [0.75, 3.77, 16, 0.16],
        [-7.17, -0.45, 0.16, 8.6],
        [8.67, -0.45, 0.16, 8.6],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} material={M.slabEdge} position={[x, top + 0.12, z]} castShadow>
          <boxGeometry args={[w, 0.24, d]} />
        </mesh>
      ))}
      <mesh material={M.concrete} position={[0.75, top + 0.01, -0.45]} receiveShadow>
        <boxGeometry args={[15.6, 0.02, 8.3]} />
      </mesh>
      {/* photovoltaic array — clickable as a whole */}
      <group {...interactive("device", "x-pv")}>
        {/* invisible, slightly larger hit area so the thin panels are easy to tap */}
        <mesh position={[2.2, top + 0.35, -2.0]}>
          <boxGeometry args={[7.2, 0.7, 4.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <group position={[2.2, top + 1.0, -2.0]}>
          <Halo id="x-pv" color={CIRCUIT_COLORS.special} size={3.2} strength={() => A.devices * K.special * 0.55} />
        </group>
      {pv.map(([x, z], i) => (
        <group key={i} position={[x, top + 0.32, z]} rotation={[-0.2, 0, 0]}>
          <mesh material={M.pv} castShadow>
            <boxGeometry args={[1.05, 0.04, 1.75]} />
          </mesh>
          <mesh material={M.steel} position={[0, -0.03, 0]}>
            <boxGeometry args={[1.08, 0.02, 1.78]} />
          </mesh>
        </group>
      ))}
      </group>
    </group>
  );
}

export function House() {
  const upper = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  useFrame(() => {
    const fl = A.floor * EXPLODE.floorLift;
    if (upper.current) upper.current.position.y = fl;
    if (roof.current) roof.current.position.y = fl + A.roof * EXPLODE.roofLift;
  });
  return (
    <group>
      <Landscape />
      <GroundLevel />
      <group ref={upper}>
        <UpperLevel />
      </group>
      <group ref={roof}>
        <Roof />
      </group>
      <RiserBridge />
      {ROOMS.filter((r) => r.level === "outside").map((r) => (
        <RoomFloor key={r.id} room={r} />
      ))}
    </group>
  );
}
