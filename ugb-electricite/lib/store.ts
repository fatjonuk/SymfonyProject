"use client";

import { create } from "zustand";

export type Selection =
  | { kind: "device"; id: string }
  | { kind: "room"; id: string }
  | null;

export type Quality = "high" | "low";

/** Which circuits are displayed in exploration mode. */
export type CircuitFilter = "all" | "light" | "outlet" | "special" | "none";

/**
 * - `timeline`: the page scroll drives the whole scene (no 3D interaction)
 * - `explore`: the sequence is complete, the visitor explores the open house
 */
export type Mode = "timeline" | "explore";

type UIState = {
  mode: Mode;
  /** Chapter of the scroll sequence currently on screen (0 – 4). */
  step: number;
  /** House opened / closed by the visitor in exploration mode. */
  open: boolean;
  filter: CircuitFilter;
  /** Luminaires switched off by the visitor (id → true). */
  off: Record<string, boolean>;
  selected: Selection;
  hovered: string | null;
  quality: Quality;
  ready: boolean;
  set: (patch: Partial<Omit<UIState, "set">>) => void;
};

export const useUI = create<UIState>((set) => ({
  mode: "timeline",
  step: 0,
  open: true,
  filter: "all",
  off: {},
  selected: null,
  hovered: null,
  quality: "high",
  ready: false,
  set: (patch) => set(patch),
}));
