"use client";

import { create } from "zustand";

export type Selection =
  | { kind: "device"; id: string }
  | { kind: "room"; id: string }
  | null;

export type Quality = "high" | "low";

type UIState = {
  /** Index of the intro phase currently playing (0-4), -1 when idle. */
  step: number;
  playing: boolean;
  open: boolean;
  circuits: boolean;
  explore: boolean;
  panelLabel: boolean;
  finalMessage: boolean;
  selected: Selection;
  hovered: string | null;
  quality: Quality;
  ready: boolean;
  set: (patch: Partial<Omit<UIState, "set">>) => void;
};

export const useUI = create<UIState>((set) => ({
  step: -1,
  playing: false,
  open: false,
  circuits: false,
  explore: false,
  panelLabel: false,
  finalMessage: false,
  selected: null,
  hovered: null,
  quality: "high",
  ready: false,
  set: (patch) => set(patch),
}));
