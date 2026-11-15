"use client";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CIRCUIT_MAX,
  DEVICE_CIRCUIT,
  SWITCH_LIGHTS,
  deviceById,
  groupById,
  groupIndex,
  roomById,
  type CircuitKind,
  type V3,
} from "@/components/three/data";
import { useUI, type CircuitFilter, type Mode } from "./store";

/** Distances used by the exploded view (metres). */
export const EXPLODE = {
  floorLift: 3.4,
  roofLift: 3.8,
  facade: 2.4,
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const S0 = { roof: 0, facade: 0, floor: 0, walls: 0, panel: 0, circuits: 0, lights: 0, devices: 0, sun: 1 };

/** Scroll-driven values: written only by the scroll timeline. */
export const S = { ...S0 };

/** Visitor overrides in exploration mode (1 = house open). */
export const O = { open: 1 };

/** Visibility of each circuit family (0 – 1), driven by the circuit filter. */
export const K: Record<CircuitKind, number> = { light: 1, outlet: 1, special: 1 };

/** Highlighted circuit group(s): the others are dimmed by `amt`. */
export const FOCUS = { a: -1, b: -1, amt: 0 };

/**
 * Values read every frame by the 3D scene (scroll state × visitor overrides).
 * Nothing here triggers React renders.
 */
export const A = { ...S0 };

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function updateState() {
  const o = O.open;
  // Closing goes walls → floor → façades → roof, opening plays it backwards.
  A.roof = S.roof * ss(0, 0.55, o);
  A.facade = S.facade * ss(0.15, 0.7, o);
  A.floor = S.floor * ss(0.3, 0.85, o);
  A.walls = S.walls * ss(0.55, 1, o);
  A.panel = S.panel;
  A.circuits = S.circuits;
  A.lights = S.lights;
  A.devices = S.devices;
  A.sun = S.sun;
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

type Pose = { az: number; el: number; dist: number; tx: number; ty: number; tz: number };

const START: Pose = { az: 0.82, el: 0.29, dist: 47, tx: 0.7, ty: 2.6, tz: 0.4 };
const END: Pose = { az: 1.02, el: 0.42, dist: 56, tx: 0.8, ty: 5.4, tz: 0.2 };

/** Camera pose requested by the scroll timeline. */
export const CAM: Pose = { ...START };
/** Camera flights in exploration mode (focus on a device, zoom, reset…). */
export const FLY: Pose & { active: boolean; done: boolean } = { ...START, active: false, done: false };
/** Pose actually rendered by the rig. */
export const VIEW: Pose = { ...START };
/** Framing offset of the house (fraction of the viewport). */
export const FRAME = { offset: 0.17 };
/** Scroll progress of the sequence (0 – 1), for the progress rail. */
export const SCROLL = { p: 0 };

type Rig = { sync: () => void };
/** `sync` copies the real camera (moved by OrbitControls) into VIEW. */
export const rig: Rig = { sync: () => {} };

const ui = () => useUI.getState();
let flyTween: gsap.core.Tween | null = null;
let mode: Mode = "timeline";
/** True when the scroll sequence is disabled (reduced motion): the hero copy stays on screen. */
let isStatic = false;

/**
 * Framing of the house in the viewport:
 * - scroll sequence: house to the right of the copy (desktop) / below it (mobile)
 * - exploration: house almost centred
 * - mobile with an info panel open: house pushed up, above the bottom sheet
 */
function applyFrame() {
  const desktop = window.innerWidth >= 1024;
  let offset = 0.17;
  if (mode === "explore") {
    if (!desktop && ui().selected) offset = -0.2;
    else if (!isStatic) offset = desktop ? 0.08 : 0.1;
  }
  gsap.to(FRAME, { offset, duration: 1.1, ease: "power2.inOut", overwrite: true });
}

/** Smoothly moves the camera so that it looks at `target` from `dist` (exploration mode only). */
export function flyTo(target: V3, dist: number, opts: { az?: number; el?: number; duration?: number } = {}) {
  if (ui().mode !== "explore") return;
  rig.sync();
  flyTween?.kill();
  Object.assign(FLY, VIEW, { active: true, done: false });
  flyTween = gsap.to(FLY, {
    tx: target[0],
    ty: target[1],
    tz: target[2],
    dist,
    ...(opts.az !== undefined ? { az: opts.az } : {}),
    ...(opts.el !== undefined ? { el: opts.el } : {}),
    duration: reduced() ? 0.01 : (opts.duration ?? 1.5),
    ease: "power3.inOut",
    // The rig applies the final pose on its next frame, then releases the camera.
    onComplete: () => {
      FLY.done = true;
    },
  });
}

export function stopCameraMove() {
  flyTween?.kill();
  FLY.active = false;
  FLY.done = false;
}

export function zoomBy(factor: number) {
  rig.sync();
  flyTo([VIEW.tx, VIEW.ty, VIEW.tz], Math.min(85, Math.max(6, VIEW.dist * factor)), { duration: 0.6 });
}

export function rotateBy(angle: number) {
  rig.sync();
  flyTo([VIEW.tx, VIEW.ty, VIEW.tz], VIEW.dist, { az: VIEW.az + angle, duration: 0.9 });
}

export function resetCamera() {
  const open = O.open > 0.5;
  flyTo([END.tx, open ? END.ty : 2.6, END.tz], open ? END.dist : 44, { az: END.az, el: END.el });
}

/* ------------------------------------------------------------------ */
/* Exploration mode actions                                            */
/* ------------------------------------------------------------------ */

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Opens / closes the house (exploration mode). */
export function setOpen(open: boolean) {
  gsap.to(O, { open: open ? 1 : 0, duration: reduced() ? 0.01 : 2.6, ease: "power2.inOut", overwrite: true });
  ui().set({ open });
}

const FILTERS: Record<CircuitFilter, Record<CircuitKind, number>> = {
  all: { light: 1, outlet: 1, special: 1 },
  light: { light: 1, outlet: 0, special: 0 },
  outlet: { light: 0, outlet: 1, special: 0 },
  special: { light: 0, outlet: 0, special: 1 },
  none: { light: 0, outlet: 0, special: 0 },
};

/** Shows every circuit, a single family, or none. */
export function setFilter(filter: CircuitFilter, keepFocus = false) {
  gsap.to(K, { ...FILTERS[filter], duration: 0.6, ease: "power2.out", overwrite: true });
  if (!keepFocus) focusGroup(null);
  ui().set({ filter });
}

/** Highlights one circuit group and dims every other circuit. */
function focusGroup(id: string | null) {
  const g = id ? groupById(id) : undefined;
  if (!g) {
    gsap.to(FOCUS, { amt: 0, duration: 0.5, ease: "power2.out", overwrite: true });
    return;
  }
  FOCUS.a = groupIndex(g.id);
  // Upper-floor circuits are fed through the riser: keep it lit too.
  FOCUS.b = g.upper ? groupIndex("colonne") : -1;
  gsap.to(FOCUS, { amt: 1, duration: 0.6, ease: "power2.out", overwrite: true });
}

function liftOf(level: string) {
  if (level === "upper") return A.floor * EXPLODE.floorLift;
  if (level === "roof") return A.floor * EXPLODE.floorLift + A.roof * EXPLODE.roofLift;
  return 0;
}

/** Selects a device: info panel, camera focus and highlight of its circuit. */
export function selectDevice(id: string) {
  const d = deviceById(id);
  if (!d || ui().mode !== "explore") return;
  ui().set({ selected: { kind: "device", id } });
  const group = groupById(DEVICE_CIRCUIT[id] ?? "");
  if (group) {
    const f = ui().filter;
    if (f !== "all" && f !== group.kind) setFilter("all", true);
    focusGroup(group.id);
  } else {
    focusGroup(null);
  }
  const dist = d.type === "panel" ? 6 : d.level === "roof" ? 16 : d.level === "outside" ? 11 : 8;
  // Wall-mounted devices are approached almost face-on so they are easy to read.
  const facing: Record<string, number> = { "+z": 0.38, "+x": 1.18, "-x": -1.18, "-z": Math.PI - 0.38 };
  const az = d.facing ? facing[d.facing] : undefined;
  flyTo([d.pos[0], d.pos[1] + liftOf(d.level), d.pos[2]], dist, az !== undefined ? { az, el: 0.24 } : {});
  applyFrame();
}

/** A click in the 3D scene: selects the device and actuates it when it can be. */
export function activateDevice(id: string) {
  const d = deviceById(id);
  if (!d || ui().mode !== "explore") return;
  if (d.type === "light") toggleLight(id);
  if (d.type === "switch") toggleSwitch(id);
  selectDevice(id);
}

export function selectRoom(id: string) {
  const r = roomById(id);
  if (!r || ui().mode !== "explore") return;
  ui().set({ selected: { kind: "room", id } });
  focusGroup(null);
  flyTo([r.focus.target[0], r.focus.target[1] + liftOf(r.level), r.focus.target[2]], r.focus.dist);
  applyFrame();
}

/** Closes the info panel without touching the rest of the scene state. */
export function clearSelection() {
  if (!ui().selected) return;
  ui().set({ selected: null });
  focusGroup(null);
  applyFrame();
}

export function toggleLight(id: string, on?: boolean) {
  const off = { ...ui().off };
  const next = on ?? !!off[id];
  if (next) delete off[id];
  else off[id] = true;
  ui().set({ off });
}

/** Simulates a switch: turns its luminaires off if any is on, on otherwise. */
export function toggleSwitch(id: string) {
  const lights = SWITCH_LIGHTS[id];
  if (!lights) return;
  const off = { ...ui().off };
  const anyOn = lights.some((l) => !off[l]);
  for (const l of lights) {
    if (anyOn) off[l] = true;
    else delete off[l];
  }
  ui().set({ off });
}

export const switchIsOn = (id: string, off: Record<string, boolean>) => (SWITCH_LIGHTS[id] ?? []).some((l) => !off[l]);

/* ------------------------------------------------------------------ */
/* Scroll-driven sequence                                              */
/* ------------------------------------------------------------------ */

/** Timeline length in "percent" units, plus a plateau where the open house can be explored. */
const SEQUENCE = 100;
const PLATEAU = 20;
/** Scroll distance of the whole pinned section, in viewport heights. */
const scrollLength = () => (window.innerWidth < 768 ? 3.9 : 5.1);

let st: ScrollTrigger | null = null;

function setMode(next: Mode) {
  if (next === mode) return;
  mode = next;
  if (next === "timeline") {
    // The scroll takes the scene back: start from wherever the visitor left the camera.
    rig.sync();
    stopCameraMove();
    gsap.to(O, { open: 1, duration: 0.8, ease: "power2.inOut", overwrite: true });
    gsap.to(K, { ...FILTERS.all, duration: 0.5, overwrite: true });
    gsap.to(FOCUS, { amt: 0, duration: 0.4, overwrite: true });
    document.body.style.cursor = "";
    ui().set({ mode: next, selected: null, hovered: null, open: true, filter: "all", off: {} });
  } else {
    ui().set({ mode: next });
    // Settle on the open architectural view before handing over to the visitor.
    flyTo([END.tx, END.ty, END.tz], END.dist, { az: END.az, el: END.el, duration: 0.9 });
  }
  applyFrame();
}

function buildTimeline() {
  Object.assign(S, S0);
  Object.assign(CAM, START);
  const e = "power2.inOut";
  const tl = gsap.timeline({ paused: true });

  // 0 – 15 % — complete house, slow cinematic move
  tl.to(CAM, { az: 0.68, el: 0.33, dist: 43, duration: 15, ease: "sine.inOut" }, 0);

  // 15 – 40 % — exploded view
  tl.to(S, { roof: 1, duration: 16, ease: e }, 15);
  tl.to(S, { facade: 1, duration: 18, ease: e }, 18);
  tl.to(S, { floor: 1, duration: 19, ease: e }, 21);
  tl.to(S, { walls: 1, duration: 12, ease: e }, 28);
  tl.to(CAM, { dist: 55, el: 0.4, ty: 5.4, duration: 25, ease: e }, 15);

  // 40 – 55 % — the electrical panel becomes the point of attention
  tl.to(S, { panel: 1, duration: 7, ease: "power2.out" }, 40);
  tl.to(CAM, { tx: -3.4, ty: 2.6, tz: 1.0, dist: 36, az: 0.56, el: 0.36, duration: 12, ease: e }, 40);

  // 55 – 80 % — circuits are drawn from the panel
  tl.to(S, { circuits: CIRCUIT_MAX, duration: 25, ease: "power1.inOut" }, 55);
  tl.to(CAM, { tx: END.tx, ty: END.ty, tz: END.tz, dist: 55, az: 0.72, el: 0.4, duration: 21, ease: e }, 55);

  // 80 – 100 % — lights and devices come alive, camera settles on the open view
  tl.to(S, { devices: 1, duration: 8, ease: "power2.out" }, 80);
  tl.to(S, { lights: 1, duration: 17, ease: "power1.inOut" }, 80);
  tl.to(S, { sun: 0.6, duration: 15, ease: "sine.inOut" }, 80);
  tl.to(CAM, { az: END.az, el: END.el, dist: END.dist, duration: 18, ease: "sine.inOut" }, 80);

  // plateau: the house stays pinned and open, exploration mode is active
  tl.to({}, { duration: PLATEAU }, SEQUENCE);

  tl.eventCallback("onUpdate", () => {
    const t = tl.time();
    SCROLL.p = Math.min(1, t / SEQUENCE);
    const step = t < 15 ? 0 : t < 40 ? 1 : t < 55 ? 2 : t < 80 ? 3 : 4;
    if (step !== ui().step) ui().set({ step });
    setMode(t >= SEQUENCE - 0.4 ? "explore" : "timeline");
  });
  return tl;
}

/**
 * Pins the stage and binds the whole 3D sequence to the page scroll.
 * Returns a cleanup function.
 */
export function initScroll(trigger: HTMLElement, pin: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  mode = "timeline";
  isStatic = false;
  ui().set({ mode: "timeline", step: 0 });
  const tl = buildTimeline();
  st = ScrollTrigger.create({
    trigger,
    pin,
    start: "top top",
    end: () => `+=${Math.round(window.innerHeight * scrollLength())}`,
    scrub: 0.6,
    animation: tl,
    anticipatePin: 1,
    refreshPriority: 10,
    invalidateOnRefresh: false,
  });
  gsap.ticker.add(updateState);
  return () => {
    gsap.ticker.remove(updateState);
    st?.kill(true);
    st = null;
    tl.kill();
  };
}

/**
 * Static variant (reduced motion): no scroll sequence, the house is shown
 * open with its circuits and can be explored straight away.
 */
export function initStatic() {
  Object.assign(S, { roof: 1, facade: 1, floor: 1, walls: 1, panel: 1, circuits: CIRCUIT_MAX, lights: 1, devices: 1, sun: 0.6 });
  Object.assign(CAM, END);
  Object.assign(VIEW, END);
  SCROLL.p = 1;
  mode = "explore";
  isStatic = true;
  ui().set({ mode: "explore", step: 0 });
  FRAME.offset = 0.17;
  gsap.ticker.add(updateState);
  return () => gsap.ticker.remove(updateState);
}

/** Scroll position (px) of a given sequence time (0 – 120). */
function scrollOf(time: number) {
  if (!st) return 0;
  return st.start + ((st.end - st.start) * time) / (SEQUENCE + PLATEAU);
}

/** Plays the sequence by scrolling the page up to the exploration plateau. */
export function goToExplore() {
  if (!st) return;
  gsap.registerPlugin(ScrollToPlugin);
  const y = scrollOf(SEQUENCE + PLATEAU * 0.3);
  const remaining = Math.abs(y - window.scrollY) / Math.max(1, st.end - st.start);
  gsap.to(window, {
    scrollTo: { y, autoKill: true },
    duration: Math.max(1.2, 11 * remaining),
    ease: "power1.inOut",
    overwrite: true,
  });
}

/** Rewinds to the closed house, then plays the sequence again. */
export function replay() {
  if (!st) return;
  gsap.registerPlugin(ScrollToPlugin);
  gsap.to(window, {
    scrollTo: { y: st.start, autoKill: true },
    duration: 1.6,
    ease: "power2.inOut",
    overwrite: true,
    onComplete: goToExplore,
  });
}

if (typeof window !== "undefined") {
  // Debug helpers (used by automated checks).
  (window as unknown as { __ugb: unknown }).__ugb = {
    A,
    S,
    O,
    K,
    FOCUS,
    CAM,
    VIEW,
    FLY,
    ui: useUI,
    gsap,
    /** Jumps to a sequence time (0 – 120). */
    seek: (time: number) => window.scrollTo(0, scrollOf(time)),
    scrollOf,
  };
}
