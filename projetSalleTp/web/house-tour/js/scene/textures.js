/*
 * Procedural textures generated on a canvas at load time (plaster, concrete,
 * oak, timber cladding, fabric, stone, tiles). They give materials the subtle
 * irregularities of real surfaces without downloading image files.
 * Ported from the UGB Next.js scene (components/three/textures.ts).
 */
import * as THREE from "three";
const cache = /* @__PURE__ */ new Map();
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = s * 1664525 + 1013904223 >>> 0;
    return s / 4294967296;
  };
}
function make(key, size, draw, srgb = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  draw(ctx, size, rng(key.length * 9973 + size));
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}
function speckle(ctx, s, r, n, alpha, light = false) {
  for (let i = 0; i < n; i++) {
    const v = light ? 255 : Math.floor(r() * 60);
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha * r()})`;
    const w = 1 + r() * 2.5;
    ctx.fillRect(r() * s, r() * s, w, w);
  }
}
function plaster() {
  return make("plaster", 512, (ctx, s, r) => {
    ctx.fillStyle = "#f4f2ee";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 60; i++) {
      const g = ctx.createRadialGradient(r() * s, r() * s, 0, r() * s, r() * s, 40 + r() * 120);
      g.addColorStop(0, `rgba(200,192,180,${0.05 * r()})`);
      g.addColorStop(1, "rgba(200,192,180,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    }
    speckle(ctx, s, r, 9e3, 0.06);
    speckle(ctx, s, r, 3e3, 0.25, true);
  });
}
function concrete() {
  return make("concrete", 512, (ctx, s, r) => {
    ctx.fillStyle = "#c3beb5";
    ctx.fillRect(0, 0, s, s);
    for (let i = 0; i < 90; i++) {
      const x = r() * s;
      const y = r() * s;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 20 + r() * 90);
      const d = r() > 0.5 ? "255,255,250" : "120,112,100";
      g.addColorStop(0, `rgba(${d},${0.08 * r()})`);
      g.addColorStop(1, `rgba(${d},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
    }
    speckle(ctx, s, r, 14e3, 0.12);
    ctx.fillStyle = "rgba(90,85,78,0.35)";
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc((i + 0.5) * (s / 4), (j + 0.5) * (s / 4), 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(110,104,96,0.25)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
  });
}
function oak() {
  return make("oak", 1024, (ctx, s, r) => {
    const plankW = s / 10;
    for (let i = 0; i < 10; i++) {
      let y = -r() * s;
      while (y < s) {
        const len = s * (0.45 + r() * 0.6);
        const l = 72 + r() * 10;
        ctx.fillStyle = `hsl(33, ${30 + r() * 10}%, ${l}%)`;
        ctx.fillRect(i * plankW, y, plankW, len);
        for (let g = 0; g < 26; g++) {
          ctx.strokeStyle = `rgba(120,80,40,${0.03 + r() * 0.06})`;
          ctx.lineWidth = 0.6 + r() * 1.4;
          ctx.beginPath();
          const gx = i * plankW + r() * plankW;
          ctx.moveTo(gx, y);
          for (let k = 0; k <= 10; k++) {
            ctx.lineTo(gx + Math.sin(k * 0.7 + g) * 2.5 * r(), y + len * k / 10);
          }
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(90,60,30,0.35)";
        ctx.fillRect(i * plankW, y, plankW, 1.5);
        y += len;
      }
      ctx.fillStyle = "rgba(80,55,30,0.3)";
      ctx.fillRect(i * plankW, 0, 1.5, s);
    }
  });
}
function cladding() {
  return make("cladding", 1024, (ctx, s, r) => {
    const n = 16;
    const w = s / n;
    for (let i = 0; i < n; i++) {
      const l = 36 + r() * 9;
      ctx.fillStyle = `hsl(28, ${32 + r() * 10}%, ${l}%)`;
      ctx.fillRect(i * w, 0, w, s);
      for (let g = 0; g < 30; g++) {
        ctx.strokeStyle = `rgba(40,22,10,${0.05 + r() * 0.09})`;
        ctx.lineWidth = 0.5 + r() * 1.6;
        ctx.beginPath();
        const gx = i * w + r() * w;
        ctx.moveTo(gx, 0);
        for (let k = 0; k <= 16; k++) ctx.lineTo(gx + Math.sin(k * 0.5 + g * 1.3) * 3 * r(), s * k / 16);
        ctx.stroke();
      }
      const grad = ctx.createLinearGradient(i * w, 0, i * w + 6, 0);
      grad.addColorStop(0, "rgba(20,10,5,0.75)");
      grad.addColorStop(1, "rgba(20,10,5,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(i * w, 0, 6, s);
    }
  });
}
function fabric() {
  return make("fabric", 256, (ctx, s, r) => {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.05})`;
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 2) {
      ctx.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`;
      ctx.fillRect(x, 0, 1, s);
    }
    speckle(ctx, s, r, 2e3, 0.08);
  }, false);
}
function stone() {
  return make("stone", 512, (ctx, s, r) => {
    ctx.fillStyle = "#dcd6cc";
    ctx.fillRect(0, 0, s, s);
    const tile = s / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      ctx.fillStyle = `hsl(36, 14%, ${82 + r() * 5}%)`;
      ctx.fillRect(i * tile + 2, j * tile + 2, tile - 4, tile - 4);
    }
    speckle(ctx, s, r, 8e3, 0.08);
  });
}
function glow() {
  return make("glow", 256, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(0.6, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }, false);
}
function scaled(tex, rx, ry) {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}
export {
  cladding,
  concrete,
  fabric,
  glow,
  oak,
  plaster,
  scaled,
  stone
};

/** Large-format stone-look tiles for the bathroom walls and floor, covers 2 m. */
export function tiles() {
  return make("tiles", 1024, (ctx, s, r) => {
    ctx.fillStyle = "#d9d2c6";
    ctx.fillRect(0, 0, s, s);
    const n = 3; // 66 x 66 cm tiles
    const t = s / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 84 + r() * 4;
      ctx.fillStyle = `hsl(38, 14%, ${l}%)`;
      ctx.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
      // soft veins
      for (let v = 0; v < 5; v++) {
        ctx.strokeStyle = `rgba(150,138,120,${0.08 + r() * 0.1})`;
        ctx.lineWidth = 0.8 + r() * 2.2;
        ctx.beginPath();
        let x = i * t + r() * t;
        let y = j * t;
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.35) * t * 0.22;
          y += t / 8;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    speckle(ctx, s, r, 5000, 0.05);
  });
}

/** Fine brushed texture for appliances and handles. */
export function brushed() {
  return make("brushed", 256, (ctx, s, r) => {
    ctx.fillStyle = "#9a9a9a";
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y++) {
      ctx.fillStyle = `rgba(255,255,255,${r() * 0.12})`;
      ctx.fillRect(0, y, s, 1);
    }
  }, false);
}
