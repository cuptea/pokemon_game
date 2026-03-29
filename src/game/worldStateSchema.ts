import { creatures } from "../data/creatures";
import { normalizePartySelection } from "./party";
import type { GameDifficulty, PlayerAvatar, WorldState } from "../types/world";

export const STORAGE_KEY = "pokemon_game_world_state_v1";
export const VALID_AVATARS: PlayerAvatar[] = ["blaze", "mist", "grove"];
export const VALID_DIFFICULTIES: GameDifficulty[] = ["casual", "adventure", "heroic"];
export const STARTER_CREATURE_ID = "spriglet";

const VALID_CREATURE_IDS = new Set(Object.keys(creatures));

export function createInitialWorldState(): WorldState {
  return {
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
  };
}

export function sanitizeOwnedCreatureIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [STARTER_CREATURE_ID];
  }

  const owned = value.filter(
    (entry): entry is string => typeof entry === "string" && VALID_CREATURE_IDS.has(entry),
  );

  return owned.length > 0 ? [...new Set(owned)] : [STARTER_CREATURE_ID];
}

export function normalizeWorldState(parsed: Partial<WorldState>): WorldState {
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
    typeof parsed.activeCreatureId === "string" &&
    selectedPartyCreatureIds.includes(parsed.activeCreatureId)
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
    selectedDifficulty: VALID_DIFFICULTIES.includes(parsed.selectedDifficulty as GameDifficulty)
      ? (parsed.selectedDifficulty as GameDifficulty)
      : "adventure",
    introCompleted: parsed.introCompleted ?? false,
  };
}

export function applyWorldState(target: WorldState, source: WorldState): void {
  target.currentMapId = source.currentMapId;
  target.currentSpawnId = source.currentSpawnId;
  target.defeatedBattles = source.defeatedBattles;
  target.collectedInteractives = source.collectedInteractives;
  target.ownedCreatureIds = source.ownedCreatureIds;
  target.selectedPartyCreatureIds = source.selectedPartyCreatureIds;
  target.activeCreatureId = source.activeCreatureId;
  target.selectedAvatar = source.selectedAvatar;
  target.selectedDifficulty = source.selectedDifficulty;
  target.introCompleted = source.introCompleted;
}
