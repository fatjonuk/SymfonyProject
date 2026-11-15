"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { activateDevice, selectRoom } from "@/lib/anim";
import { useUI } from "@/lib/store";

/**
 * Pointer handlers shared by every clickable element of the house.
 * R3F raycasts the scene for us; these handlers only react once the scroll
 * sequence is complete (exploration mode).
 */
export function interactive(kind: "device" | "room", id: string) {
  const exploring = () => useUI.getState().mode === "explore";
  return {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      if (!exploring()) return;
      e.stopPropagation();
      useUI.getState().set({ hovered: id });
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      if (useUI.getState().hovered === id) useUI.getState().set({ hovered: null });
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!exploring()) return;
      e.stopPropagation();
      if (e.delta > 6) return; // it was a drag, not a click
      if (kind === "device") activateDevice(id);
      else selectRoom(id);
    },
  };
}
