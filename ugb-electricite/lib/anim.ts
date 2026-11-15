"use client";

import gsap from "gsap";
import { CIRCUIT_MAX, type V3 } from "@/components/three/data";
import { useUI } from "./store";

/** Distances used by the exploded view (metres). */
export const EXPLODE = {
  floorLift: 3.4,
  roofLift: 3.8,
  facade: 2.4,
};

/**
 * Animated values read every frame by the 3D scene.
 * They are mutated by GSAP; nothing here triggers React renders.
 */
export const A = {
  roof: 0,
  facade: 0,
  floor: 0,
  walls: 0,
  panel: 0,
  circuits: 0,
  lights: 0,
  devices: 0,
  sun: 1,
};

/** Spherical camera rig, used during cinematic moves. */
export const CAM = {
  az: 0.8,
  el: 0.3,
  dist: 46,
  tx: 0.7,
  ty: 2.6,
  tz: 0.4,
  /** When true the rig drives the camera; when false OrbitControls do. */
  active: true,
  /** Horizontal framing offset (fraction of viewport width). */
  offset: 0.17,
};

type Rig = { sync: () => void };
export const rig: Rig = { sync: () => {} };

const START = { az: 0.82, el: 0.29, dist: 47, tx: 0.7, ty: 2.6, tz: 0.4 };

let intro: gsap.core.Timeline | null = null;
let camTween: gsap.core.Tween | null = null;
let finalTimer: ReturnType<typeof setTimeout> | undefined;

const ui = () => useUI.getState();

function resetValues() {
  gsap.killTweensOf(A);
  gsap.killTweensOf(CAM);
  Object.assign(A, { roof: 0, facade: 0, floor: 0, walls: 0, panel: 0, circuits: 0, lights: 0, devices: 0, sun: 1 });
  Object.assign(CAM, START, { active: true });
}

export function playIntro() {
  intro?.kill();
  camTween?.kill();
  resetValues();
  ui().set({ playing: true, step: 0, open: false, circuits: false, panelLabel: false, finalMessage: false, selected: null });

  const ease = "power2.inOut";
  const tl = gsap.timeline({
    onComplete: () => {
      CAM.active = false;
      ui().set({ playing: false, step: -1, open: true, circuits: true, finalMessage: true });
      clearTimeout(finalTimer);
      finalTimer = setTimeout(() => ui().set({ finalMessage: false }), 9000);
    },
  });

  // Phase 1 — complete house, slow cinematic travelling
  tl.to(CAM, { az: 0.66, el: 0.33, dist: 43, duration: 3.2, ease: "sine.inOut" }, 0);

  // Phase 2 — architectural decomposition
  tl.call(() => ui().set({ step: 1 }), undefined, 3);
  tl.to(A, { roof: 1, duration: 2.6, ease }, 3.0);
  tl.to(A, { facade: 1, duration: 2.9, ease }, 3.5);
  tl.to(A, { floor: 1, duration: 2.9, ease }, 4.0);
  tl.to(A, { walls: 1, duration: 2.0, ease }, 5.0);
  tl.to(CAM, { dist: 55, el: 0.4, ty: 5.4, duration: 4, ease }, 3.0);

  // Phase 3 — electrical panel
  tl.call(() => ui().set({ step: 2 }), undefined, 7);
  tl.to(A, { panel: 1, duration: 1.4, ease: "power2.out" }, 7);
  tl.call(() => ui().set({ panelLabel: true }), undefined, 7.4);
  tl.to(CAM, { tx: -3.4, ty: 2.6, tz: 1.0, dist: 36, az: 0.56, el: 0.36, duration: 2, ease }, 7);

  // Phase 4 — circuits are drawn from the panel
  tl.call(() => ui().set({ step: 3 }), undefined, 9);
  tl.to(A, { circuits: CIRCUIT_MAX, duration: 4, ease: "power1.inOut" }, 9);
  tl.to(CAM, { tx: 0.8, ty: 5.4, tz: 0.2, dist: 55, az: 0.72, el: 0.4, duration: 4, ease }, 9);
  tl.call(() => ui().set({ panelLabel: false }), undefined, 12.6);

  // Phase 5 — equipment activation
  tl.call(() => ui().set({ step: 4 }), undefined, 13);
  tl.to(A, { lights: 1, duration: 3, ease: "power1.inOut" }, 13);
  tl.to(A, { devices: 1, duration: 1.6, ease: "power2.out" }, 13);
  tl.to(A, { sun: 0.6, duration: 3, ease: "sine.inOut" }, 13);
  tl.to(CAM, { az: 1.02, el: 0.42, dist: 56, duration: 3.5, ease: "sine.inOut" }, 13);

  intro = tl;
}

export function skipIntro() {
  if (intro && intro.isActive()) intro.progress(1);
}

export function isIntroPlaying() {
  return !!intro && intro.isActive();
}

export function setOpen(open: boolean) {
  skipIntro();
  const ease = "power2.inOut";
  const v = open ? 1 : 0;
  gsap.killTweensOf(A, "roof,facade,floor,walls");
  if (open) {
    gsap.to(A, { roof: v, duration: 2.2, ease });
    gsap.to(A, { facade: v, duration: 2.4, delay: 0.3, ease });
    gsap.to(A, { floor: v, duration: 2.4, delay: 0.6, ease });
    gsap.to(A, { walls: v, duration: 1.6, delay: 1.2, ease });
  } else {
    gsap.to(A, { walls: v, duration: 1.2, ease });
    gsap.to(A, { floor: v, duration: 2.2, delay: 0.2, ease });
    gsap.to(A, { facade: v, duration: 2.2, delay: 0.6, ease });
    gsap.to(A, { roof: v, duration: 2.0, delay: 1.0, ease });
  }
  ui().set({ open });
}

export function setCircuits(show: boolean) {
  skipIntro();
  gsap.killTweensOf(A, "circuits,devices,panel");
  if (show) {
    gsap.to(A, { circuits: CIRCUIT_MAX, duration: 3.2, ease: "power1.inOut" });
    gsap.to(A, { devices: 1, panel: 1, duration: 1.2, ease: "power2.out" });
    gsap.to(A, { lights: 1, sun: 0.6, duration: 2.4, delay: 1.2, ease: "power1.inOut" });
  } else {
    gsap.to(A, { circuits: 0, duration: 1.6, ease: "power2.inOut" });
    gsap.to(A, { devices: 0, duration: 0.8, ease: "power2.out" });
  }
  ui().set({ circuits: show });
}

/** Smoothly moves the camera so that it looks at `target` from `dist`. */
export function flyTo(target: V3, dist: number, opts: { az?: number; el?: number; duration?: number } = {}) {
  if (isIntroPlaying()) return;
  rig.sync();
  camTween?.kill();
  CAM.active = true;
  camTween = gsap.to(CAM, {
    tx: target[0],
    ty: target[1],
    tz: target[2],
    dist,
    ...(opts.az !== undefined ? { az: opts.az } : {}),
    ...(opts.el !== undefined ? { el: opts.el } : {}),
    duration: opts.duration ?? 1.6,
    ease: "power3.inOut",
    onComplete: () => {
      CAM.active = false;
    },
  });
}

export function stopCameraMove() {
  if (isIntroPlaying()) return;
  camTween?.kill();
  CAM.active = false;
}

export function setFramingOffset(offset: number) {
  gsap.to(CAM, { offset, duration: 1.2, ease: "power3.inOut" });
}

export function overview() {
  flyTo([0.8, A.floor > 0.5 ? 5.4 : 2.6, 0.2], A.floor > 0.5 ? 55 : 44, { az: 0.72, el: 0.4 });
}

/** Debug helper: jump to a given time (s) of the intro and pause. */
export function seekIntro(t: number) {
  if (!intro) playIntro();
  intro!.pause();
  intro!.seek(t, false);
}

if (typeof window !== "undefined") {
  (window as unknown as { __ugb: unknown }).__ugb = { A, CAM, seekIntro, skipIntro, playIntro, ui: useUI };
}
