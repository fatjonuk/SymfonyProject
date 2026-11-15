"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { A, EXPLODE, FOCUS, K } from "@/lib/anim";
import { CIRCUIT_COLORS, CIRCUITS, H, RISER, groupIndex, type Circuit, type CircuitKind, type V3 } from "./data";

const RADIUS: Record<CircuitKind, number> = { light: 0.028, outlet: 0.028, special: 0.036 };

/** Polyline → curve path with small fillets at each corner. */
function filletPath(points: V3[], r = 0.09) {
  const v = points.map((p) => new THREE.Vector3(...p));
  const path = new THREE.CurvePath<THREE.Vector3>();
  let cur = v[0].clone();
  for (let i = 1; i < v.length; i++) {
    const p = v[i];
    if (i === v.length - 1) {
      path.add(new THREE.LineCurve3(cur, p.clone()));
      break;
    }
    const next = v[i + 1];
    const dIn = p.clone().sub(v[i - 1]);
    const dOut = next.clone().sub(p);
    const rr = Math.min(r, dIn.length() / 2, dOut.length() / 2);
    const a = p.clone().sub(dIn.normalize().multiplyScalar(rr));
    const b = p.clone().add(dOut.normalize().multiplyScalar(rr));
    if (a.distanceTo(cur) > 1e-4) path.add(new THREE.LineCurve3(cur, a));
    path.add(new THREE.QuadraticBezierCurve3(a, p.clone(), b));
    cur = b;
  }
  return path;
}

function circuitGeometry(c: Circuit) {
  const path = filletPath(c.points);
  const len = path.getLength();
  const segs = Math.max(8, Math.ceil(len * 22));
  const g = new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, segs, RADIUS[c.kind], 6, false);
  const uv = g.attributes.uv;
  const dist = new Float32Array(uv.count);
  for (let i = 0; i < uv.count; i++) dist[i] = c.start + uv.getX(i) * len;
  g.setAttribute("aDist", new THREE.BufferAttribute(dist, 1));
  // circuit group index: lets the shader highlight one circuit and dim the others
  g.setAttribute("aId", new THREE.BufferAttribute(new Float32Array(uv.count).fill(groupIndex(c.group)), 1));
  g.deleteAttribute("uv");
  return g;
}

const vert = /* glsl */ `
  attribute float aDist;
  attribute float aId;
  varying float vDist;
  varying float vId;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vDist = aDist;
    vId = aId;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uReveal;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uBoost;
  uniform float uVis;
  uniform float uFocusA;
  uniform float uFocusB;
  uniform float uFocusAmt;
  varying float vDist;
  varying float vId;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    if (vDist > uReveal) discard;
    // 1 on the highlighted circuit group(s), 0 elsewhere
    float isF = max(1.0 - step(0.5, abs(vId - uFocusA)), 1.0 - step(0.5, abs(vId - uFocusB)));
    float keep = mix(1.0, mix(0.07, 1.0, isF), uFocusAmt);
    float alpha = uOpacity * uVis * keep;
    if (alpha < 0.004) discard;
    float head = smoothstep(uReveal - 0.9, uReveal, vDist);
    float packet = smoothstep(0.82, 1.0, fract((vDist - uTime * 2.4) / 1.8));
    float rim = pow(1.0 - abs(dot(vN, vV)), 1.5);
    float glow = uBoost * (packet * 1.6 + head * 2.6) * keep + isF * uFocusAmt * 0.45;
    vec3 col = uColor * (0.95 + 0.5 * rim + glow);
    gl_FragColor = vec4(col, alpha);
  }
`;

function makeMaterial(color: string, xray: boolean) {
  return new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: xray ? 0.32 : 1 },
      uBoost: { value: xray ? 0.5 : 1 },
      uVis: { value: 1 },
      uFocusA: { value: -1 },
      uFocusB: { value: -1 },
      uFocusAmt: { value: 0 },
    },
    transparent: true,
    depthTest: !xray,
    depthWrite: !xray,
    toneMapped: false,
  });
}

let shared: Record<CircuitKind, { solid: THREE.ShaderMaterial; xray: THREE.ShaderMaterial }> | null = null;
export function circuitMaterials() {
  if (!shared) {
    shared = {
      light: { solid: makeMaterial(CIRCUIT_COLORS.light, false), xray: makeMaterial(CIRCUIT_COLORS.light, true) },
      outlet: { solid: makeMaterial(CIRCUIT_COLORS.outlet, false), xray: makeMaterial(CIRCUIT_COLORS.outlet, true) },
      special: { solid: makeMaterial(CIRCUIT_COLORS.special, false), xray: makeMaterial(CIRCUIT_COLORS.special, true) },
    };
  }
  return shared;
}

/** Updates the shared circuit uniforms once per frame. */
export function CircuitDriver() {
  useFrame((state) => {
    const m = circuitMaterials();
    const t = state.clock.elapsedTime;
    for (const k of Object.keys(m) as CircuitKind[]) {
      for (const mat of [m[k].solid, m[k].xray]) {
        const u = mat.uniforms;
        u.uReveal.value = A.circuits;
        u.uTime.value = t;
        u.uVis.value = K[k];
        u.uFocusA.value = FOCUS.a;
        u.uFocusB.value = FOCUS.b;
        u.uFocusAmt.value = FOCUS.amt;
      }
    }
  });
  return null;
}

export function Circuits({ level }: { level: "ground" | "upper" }) {
  const m = circuitMaterials();
  const geos = useMemo(() => {
    const out: { kind: CircuitKind; geo: THREE.BufferGeometry }[] = [];
    (["light", "outlet", "special"] as CircuitKind[]).forEach((kind) => {
      const list = CIRCUITS.filter((c) => c.kind === kind && (level === "upper" ? c.level === "upper" : c.level !== "upper"));
      if (!list.length) return;
      const parts = list.map(circuitGeometry);
      out.push({ kind, geo: mergeGeometries(parts, false)! });
      parts.forEach((p) => p.dispose());
    });
    return out;
  }, [level]);

  return (
    <group>
      {geos.map(({ kind, geo }) => (
        <group key={kind}>
          <mesh geometry={geo} material={m[kind].solid} renderOrder={19} frustumCulled={false} />
          <mesh geometry={geo} material={m[kind].xray} renderOrder={20} frustumCulled={false} />
        </group>
      ))}
    </group>
  );
}

/**
 * Vertical link between the ground floor riser and the upper floor:
 * it stretches as the upper floor lifts so the network stays continuous.
 */
export function RiserBridge() {
  const m = circuitMaterials();
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 1, 8, 1, true);
    g.translate(0, 0.5, 0);
    const d = new Float32Array(g.attributes.position.count).fill(RISER.to - RISER.from + 0.05);
    g.setAttribute("aDist", new THREE.BufferAttribute(d, 1));
    g.setAttribute("aId", new THREE.BufferAttribute(new Float32Array(d.length).fill(groupIndex("colonne")), 1));
    return g;
  }, []);
  const refs = useMemo(() => ({ group: null as THREE.Group | null }), []);
  useFrame(() => {
    if (!refs.group) return;
    const span = H.upperFloor - H.groundCeil + A.floor * EXPLODE.floorLift;
    refs.group.scale.set(1, span, 1);
  });
  return (
    <group ref={(g) => { refs.group = g; }} position={[RISER.x, H.groundCeil, RISER.z]}>
      <mesh geometry={geo} material={m.light.solid} renderOrder={19} frustumCulled={false} />
      <mesh geometry={geo} material={m.light.xray} renderOrder={20} frustumCulled={false} />
    </group>
  );
}
