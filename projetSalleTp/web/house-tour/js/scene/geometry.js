/*
 * Geometry helpers with UVs in metres (walls with openings, slabs, floors).
 * Ported from the UGB Next.js scene (components/three/geometry.ts).
 */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
function metricBox(w, h, d, cx, cy, cz, uOffset = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(cx, cy, cz);
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    if (ny > 0.5) uv.setXY(i, x + uOffset, z);
    else if (nx > 0.5) uv.setXY(i, z + uOffset, y);
    else uv.setXY(i, x + uOffset, y);
  }
  uv.needsUpdate = true;
  return g;
}
function wallGeometry(length, height, z0, z1, openings) {
  const parts = [];
  const d = z1 - z0;
  const cz = (z0 + z1) / 2;
  const ops = [...openings].sort((a, b) => a.u0 - b.u0);
  let cursor = 0;
  const pier = (a, b, y0, y1) => {
    if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
    parts.push(metricBox(b - a, y1 - y0, d, (a + b) / 2, (y0 + y1) / 2, cz));
  };
  for (const o of ops) {
    pier(cursor, o.u0, 0, height);
    pier(o.u0, o.u1, 0, o.v0);
    pier(o.u0, o.u1, o.v1, height);
    cursor = o.u1;
  }
  pier(cursor, length, 0, height);
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}
function slabGeometry(rect, y0, y1, hole) {
  const [x0, x1, z0, z1] = rect;
  const t = y1 - y0;
  const cy = (y0 + y1) / 2;
  const parts = [];
  const add = (a, b, c, d) => {
    if (b - a > 1e-3 && d - c > 1e-3) parts.push(metricBox(b - a, t, d - c, (a + b) / 2, cy, (c + d) / 2));
  };
  if (!hole) add(x0, x1, z0, z1);
  else {
    const [hx0, hx1, hz0, hz1] = hole;
    add(x0, hx0, z0, z1);
    add(hx1, x1, z0, z1);
    add(hx0, hx1, z0, hz0);
    add(hx0, hx1, hz1, z1);
  }
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}
function floorGeometry(x0, x1, z0, z1) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
  g.rotateX(-Math.PI / 2);
  g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i), pos.getZ(i));
  uv.needsUpdate = true;
  return g;
}
export {
  floorGeometry,
  metricBox,
  slabGeometry,
  wallGeometry
};
