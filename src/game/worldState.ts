import type { GameDifficulty, PlayerAvatar, WorldState } from "../types/world";

const STORAGE_KEY = "pokemon_game_world_state_v1";
const VALID_AVATARS: PlayerAvatar[] = ["blaze", "mist", "grove"];
const VALID_DIFFICULTIES: GameDifficulty[] = ["casual", "adventure", "heroic"];

const initialState = (): WorldState => ({
  currentMapId: "mossgrove_town",
  currentSpawnId: "town_square",
  defeatedBattles: {},
  collectedInteractives: {},
  selectedAvatar: "blaze",
  selectedDifficulty: "adventure",
  introCompleted: false,
});

export const worldState: WorldState = loadWorldState();

export function loadWorldState(): WorldState {
  if (typeof window === "undefined") {
    return initialState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState();
    }

    const parsed = JSON.parse(raw) as Partial<WorldState>;
    return {
      currentMapId: parsed.currentMapId ?? "mossgrove_town",
      currentSpawnId: parsed.currentSpawnId ?? "town_square",
      defeatedBattles: parsed.defeatedBattles ?? {},
      collectedInteractives: parsed.collectedInteractives ?? {},
      selectedAvatar: VALID_AVATARS.includes(parsed.selectedAvatar as PlayerAvatar)
        ? (parsed.selectedAvatar as PlayerAvatar)
        : "blaze",
      selectedDifficulty: VALID_DIFFICULTIES.includes(
        parsed.selectedDifficulty as GameDifficulty,
      )
        ? (parsed.selectedDifficulty as GameDifficulty)
        : "adventure",
      introCompleted: parsed.introCompleted ?? false,
    };
  } catch {
    return initialState();
  }
}

export function saveWorldState(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(worldState));
}

export function resetWorldState(): void {
  const fresh = initialState();
  worldState.currentMapId = fresh.currentMapId;
  worldState.currentSpawnId = fresh.currentSpawnId;
  worldState.defeatedBattles = fresh.defeatedBattles;
  worldState.collectedInteractives = fresh.collectedInteractives;
  worldState.selectedAvatar = fresh.selectedAvatar;
  worldState.selectedDifficulty = fresh.selectedDifficulty;
  worldState.introCompleted = fresh.introCompleted;
  saveWorldState();
}
