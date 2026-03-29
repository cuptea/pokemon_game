import {
  STORAGE_KEY,
  applyWorldState,
  createInitialWorldState,
  normalizeWorldState,
} from "./worldStateSchema";
import type { WorldState } from "../types/world";

export const worldState: WorldState = loadWorldState();

export function loadWorldState(): WorldState {
  if (typeof window === "undefined") {
    return createInitialWorldState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createInitialWorldState();
    }

    return normalizeWorldState(JSON.parse(raw) as Partial<WorldState>);
  } catch {
    return createInitialWorldState();
  }
}

export function saveWorldState(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(worldState));
}

export function resetWorldState(): void {
  applyWorldState(worldState, createInitialWorldState());
  saveWorldState();
}
