"use client";

import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { flyTo } from "@/lib/anim";
import { useUI } from "@/lib/store";

const v = new THREE.Vector3();

/** Pointer handlers shared by every clickable element of the house. */
export function interactive(kind: "device" | "room", id: string, focusDist = 9, focusTarget?: () => THREE.Vector3) {
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      useUI.getState().set({ hovered: id });
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      if (useUI.getState().hovered === id) useUI.getState().set({ hovered: null });
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.delta > 6) return; // it was a drag, not a click
      const ui = useUI.getState();
      if (ui.playing) return;
      // On touch screens, taps on the scene only select in explore mode,
      // so a tap while scrolling the page never moves the camera.
      if (!ui.explore && window.matchMedia("(pointer: coarse)").matches) return;
      ui.set({ selected: { kind, id } });
      const target = focusTarget ? focusTarget() : e.object.getWorldPosition(v);
      flyTo([target.x, target.y, target.z], focusDist);
    },
  };
}
