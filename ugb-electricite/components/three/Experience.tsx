"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAM, FLY, FRAME, VIEW, clearSelection, rig, stopCameraMove } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { CircuitDriver } from "./Circuits";
import { House } from "./House";
import { Lighting } from "./Lighting";
import { STUDIO } from "./materials";


const applyPose = (cam: THREE.Camera, target: THREE.Vector3, p: { az: number; el: number; dist: number; tx: number; ty: number; tz: number }) => {
  cam.position.set(
    p.tx + p.dist * Math.cos(p.el) * Math.sin(p.az),
    p.ty + p.dist * Math.sin(p.el),
    p.tz + p.dist * Math.cos(p.el) * Math.cos(p.az),
  );
  target.set(p.tx, p.ty, p.tz);
  cam.lookAt(p.tx, p.ty, p.tz);
};

/**
 * Camera rig.
 * - timeline mode: the rendered pose (VIEW) eases towards the pose requested
 *   by the scroll timeline (CAM). The easing also absorbs the hand-over when
 *   the visitor scrolls back after having moved the camera.
 * - explore mode: OrbitControls drive the camera, except during short
 *   programmatic flights (FLY).
 */
function CameraRig({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera, size } = useThree();
  const last = useRef({ w: 0, h: 0, ox: -1, oy: -1 });
  const placed = useRef(false);

  useEffect(() => {
    rig.sync = () => {
      const c = controls.current;
      if (!c) return;
      const t = c.target;
      const off = camera.position.clone().sub(t);
      const dist = off.length();
      Object.assign(VIEW, {
        tx: t.x,
        ty: t.y,
        tz: t.z,
        dist,
        el: Math.asin(off.y / dist),
        az: Math.atan2(off.x, off.z),
      });
    };
  }, [camera, controls]);

  // Wider vertical FOV on portrait screens so the whole house stays framed.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    cam.fov = aspect < 1.35 ? Math.min(44, 30 * Math.pow(1.35 / aspect, 0.6)) : 30;
    cam.updateProjectionMatrix();
  }, [camera, size]);

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    // Framing offset: the house sits to the right of the copy on desktop,
    // and below it on mobile.
    const desktop = size.width >= 1024;
    const ox = desktop ? -FRAME.offset * size.width : 0;
    const oy = desktop ? 0 : -FRAME.offset * 1.05 * size.height;
    const l = last.current;
    if (l.w !== size.width || l.h !== size.height || Math.abs(l.ox - ox) > 0.1 || Math.abs(l.oy - oy) > 0.1) {
      cam.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
      Object.assign(l, { w: size.width, h: size.height, ox, oy });
    }

    const c = controls.current;
    if (!c) return;
    if (!placed.current) {
      // first frame: start from the current pose (matters when no scroll sequence runs)
      placed.current = true;
      applyPose(cam, c.target, VIEW);
    }
    if (useUI.getState().mode === "timeline") {
      const k = 1 - Math.exp(-Math.min(dt, 0.1) * 7);
      // shortest way round for the azimuth
      const daz = Math.atan2(Math.sin(CAM.az - VIEW.az), Math.cos(CAM.az - VIEW.az));
      VIEW.az += daz * k;
      VIEW.el += (CAM.el - VIEW.el) * k;
      VIEW.dist += (CAM.dist - VIEW.dist) * k;
      VIEW.tx += (CAM.tx - VIEW.tx) * k;
      VIEW.ty += (CAM.ty - VIEW.ty) * k;
      VIEW.tz += (CAM.tz - VIEW.tz) * k;
      applyPose(cam, c.target, VIEW);
    } else if (FLY.active) {
      Object.assign(VIEW, { az: FLY.az, el: FLY.el, dist: FLY.dist, tx: FLY.tx, ty: FLY.ty, tz: FLY.tz });
      applyPose(cam, c.target, VIEW);
      if (FLY.done) FLY.active = FLY.done = false;
    }
  });
  return null;
}

function Controls({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const explore = useUI((s) => s.mode === "explore");
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  // OrbitControls sets `touch-action: none` on the outer Canvas container,
  // which would block the page scroll on phones. `pan-y` keeps vertical
  // swipes for the page (the scroll drives the sequence and must never be
  // trapped) while horizontal drags rotate the house in exploration mode.
  // touch-action is intersected along ancestors, hence the three levels.
  useFrame(() => {
    let el: HTMLElement | null = gl.domElement;
    for (let i = 0; i < 3 && el; i++, el = el.parentElement) {
      if (el.style.touchAction !== "pan-y") el.style.touchAction = "pan-y";
    }
  });

  // The mouse wheel always scrolls the page. Zoom uses the +/- buttons, a
  // pinch on touch screens, or ctrl + wheel (trackpad pinch) handled here.
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      const c = controls.current;
      if (!e.ctrlKey || !explore || !c) return;
      e.preventDefault();
      stopCameraMove();
      const off = camera.position.clone().sub(c.target);
      const dist = Math.min(85, Math.max(6, off.length() * Math.exp(e.deltaY * 0.01)));
      camera.position.copy(c.target).add(off.setLength(dist));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [gl, camera, controls, explore]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={explore}
      enableDamping
      dampingFactor={0.08}
      enableZoom={coarse}
      enablePan
      screenSpacePanning
      minDistance={6}
      maxDistance={85}
      maxPolarAngle={Math.PI / 2 - 0.06}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
      onStart={() => stopCameraMove()}
    />
  );
}

function Effects() {
  const quality = useUI((s) => s.quality);
  if (quality === "high") {
    return (
      <EffectComposer multisampling={4} enableNormalPass={false}>
        <N8AO halfRes aoRadius={1.1} distanceFalloff={0.6} intensity={2.4} quality="medium" color="#1b1712" />
        <Bloom mipmapBlur luminanceThreshold={1.55} luminanceSmoothing={0.2} intensity={0.75} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={1.55} luminanceSmoothing={0.2} intensity={0.5} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}

function Starter() {
  const set = useUI((s) => s.set);
  const started = useRef(false);
  const get = useThree((s) => s.get);
  useEffect(() => {
    const w = window as unknown as { __ugb?: Record<string, unknown> };
    if (w.__ugb) w.__ugb.three = get;
  }, [get]);
  // The scene only signals that it is ready: nothing plays on its own,
  // the scroll drives the whole sequence.
  useFrame(() => {
    if (started.current) return;
    started.current = true;
    set({ ready: true });
  });
  return null;
}

export default function Experience({ active = true }: { active?: boolean }) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const quality = useUI((s) => s.quality);
  const set = useUI((s) => s.set);

  useEffect(() => {
    const small = window.matchMedia("(max-width: 767px)").matches;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q === "high" || q === "low") set({ quality: q });
    else if (small || weak) set({ quality: "low" });
  }, [set]);

  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: 30, near: 0.5, far: 400, position: [30, 16, 34] }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onPointerMissed={() => clearSelection()}
    >
      <color attach="background" args={[STUDIO.r, STUDIO.g, STUDIO.b]} />
      <fog attach="fog" args={[STUDIO, 70, 170]} />
      <PerformanceMonitor onDecline={() => set({ quality: "low" })} flipflops={2} />
      <Lighting />
      <House />
      <CircuitDriver />
      <Controls controls={controls} />
      <CameraRig controls={controls} />
      <Effects />
      <Starter />
    </Canvas>
  );
}
