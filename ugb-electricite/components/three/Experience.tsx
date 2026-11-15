"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CAM, playIntro, rig, stopCameraMove } from "@/lib/anim";
import { useUI } from "@/lib/store";
import { CircuitDriver } from "./Circuits";
import { House } from "./House";
import { Lighting } from "./Lighting";

const BG = "#F3EFE8";

/** Drives the camera from the spherical rig during cinematic moves. */
function CameraRig({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera, size } = useThree();
  const last = useRef({ w: 0, h: 0, ox: -1, oy: -1 });

  useEffect(() => {
    rig.sync = () => {
      const c = controls.current;
      if (!c) return;
      const t = c.target;
      const off = camera.position.clone().sub(t);
      const dist = off.length();
      Object.assign(CAM, {
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

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    // Framing offset: the house sits to the right of the hero copy on desktop,
    // and below it on mobile.
    const desktop = size.width >= 1024;
    const ox = desktop ? -CAM.offset * size.width : 0;
    const oy = desktop ? 0 : -CAM.offset * 1.05 * size.height;
    const l = last.current;
    if (l.w !== size.width || l.h !== size.height || Math.abs(l.ox - ox) > 0.1 || Math.abs(l.oy - oy) > 0.1) {
      cam.setViewOffset(size.width, size.height, ox, oy, size.width, size.height);
      Object.assign(l, { w: size.width, h: size.height, ox, oy });
    }

    if (!CAM.active || !controls.current) return;
    const { az, el, dist, tx, ty, tz } = CAM;
    cam.position.set(tx + dist * Math.cos(el) * Math.sin(az), ty + dist * Math.sin(el), tz + dist * Math.cos(el) * Math.cos(az));
    controls.current.target.set(tx, ty, tz);
    cam.lookAt(tx, ty, tz);
  });
  return null;
}

function Controls({ controls }: { controls: React.RefObject<OrbitControlsImpl | null> }) {
  const playing = useUI((s) => s.playing);
  const explore = useUI((s) => s.explore);
  const gl = useThree((s) => s.gl);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  // On touch screens the canvas only captures gestures in explore mode,
  // otherwise the page must remain scrollable.
  const enabled = !playing && (!coarse || explore);
  useEffect(() => {
    gl.domElement.style.touchAction = enabled ? "none" : "pan-y";
  }, [enabled, gl]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={enabled}
      enableDamping
      dampingFactor={0.08}
      enableZoom={explore}
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
        <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.75} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette offset={0.32} darkness={0.28} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.5} radius={0.7} />
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
  useFrame(() => {
    if (started.current) return;
    started.current = true;
    set({ ready: true });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      playIntro();
      if (reduce) {
        // jump straight to the final, fully revealed state
        import("@/lib/anim").then((m) => m.skipIntro());
      }
    }, 350);
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
      onPointerMissed={() => set({ selected: null })}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 70, 170]} />
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
