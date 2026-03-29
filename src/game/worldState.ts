import { creatures } from "../data/creatures";
import { normalizePartySelection } from "./party";
import type { GameDifficulty, PlayerAvatar, WorldState } from "../types/world";

const STORAGE_KEY = "pokemon_game_world_state_v1";
const VALID_AVATARS: PlayerAvatar[] = ["blaze", "mist", "grove"];
const VALID_DIFFICULTIES: GameDifficulty[] = ["casual", "adventure", "heroic"];
const STARTER_CREATURE_ID = "spriglet";
const VALID_CREATURE_IDS = new Set(Object.keys(creatures));

const initialState = (): WorldState => ({
  currentMapId: "mossgrove_town",
  currentSpawnId: "town_square",
  defeatedBattles: {},
  collectedInteractives: {},
  ownedCreatureIds: [STARTER_CREATURE_ID],
  selectedPartyCreatureIds: [STARTER_CREATURE_ID],
  activeCreatureId: STARTER_CREATURE_ID,
  selectedAvatar: "blaze",
  selectedDifficulty: "adventure",
  introCompleted: false,
});

export const worldState: WorldState = loadWorldState();

function sanitizeOwnedCreatureIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [STARTER_CREATURE_ID];
  }

  const owned = value.filter(
    (entry): entry is string => typeof entry === "string" && VALID_CREATURE_IDS.has(entry),
  );

  return owned.length > 0 ? [...new Set(owned)] : [STARTER_CREATURE_ID];
}

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
    const ownedCreatureIds = sanitizeOwnedCreatureIds(parsed.ownedCreatureIds);
    const legacyLead =
      typeof parsed.activeCreatureId === "string" && ownedCreatureIds.includes(parsed.activeCreatureId)
        ? [parsed.activeCreatureId]
        : undefined;
    const selectedPartyCreatureIds = normalizePartySelection(
      ownedCreatureIds,
      parsed.selectedPartyCreatureIds ?? legacyLead,
    );
    const activeCreatureId =
      typeof parsed.activeCreatureId === "string" && selectedPartyCreatureIds.includes(parsed.activeCreatureId)
        ? parsed.activeCreatureId
        : selectedPartyCreatureIds[0] ?? ownedCreatureIds[0];
    return {
      currentMapId: parsed.currentMapId ?? "mossgrove_town",
      currentSpawnId: parsed.currentSpawnId ?? "town_square",
      defeatedBattles: parsed.defeatedBattles ?? {},
      collectedInteractives: parsed.collectedInteractives ?? {},
      ownedCreatureIds,
      selectedPartyCreatureIds,
      activeCreatureId,
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
  worldState.ownedCreatureIds = fresh.ownedCreatureIds;
  worldState.selectedPartyCreatureIds = fresh.selectedPartyCreatureIds;
  worldState.activeCreatureId = fresh.activeCreatureId;
  worldState.selectedAvatar = fresh.selectedAvatar;
  worldState.selectedDifficulty = fresh.selectedDifficulty;
  worldState.introCompleted = fresh.introCompleted;
  saveWorldState();
}
