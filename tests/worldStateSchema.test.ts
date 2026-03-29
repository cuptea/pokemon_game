import { describe, expect, it } from "vitest";

import {
  STARTER_CREATURE_ID,
  applyWorldState,
  createInitialWorldState,
  normalizeWorldState,
  sanitizeOwnedCreatureIds,
} from "../src/game/worldStateSchema";

describe("world state schema helpers", () => {
  it("sanitizes owned creatures to known unique ids and guarantees a starter", () => {
    expect(sanitizeOwnedCreatureIds(undefined)).toEqual([STARTER_CREATURE_ID]);
    expect(
      sanitizeOwnedCreatureIds(["mosslet", "missing", "mosslet", "puddlepup", 7] as never),
    ).toEqual(["mosslet", "puddlepup"]);
  });

  it("normalizes partial legacy save data into a safe party state", () => {
    const normalized = normalizeWorldState({
      ownedCreatureIds: ["mosslet", "gullip", "spriglet", "unknown"],
      selectedPartyCreatureIds: ["missing", "spriglet"],
      activeCreatureId: "gullip",
      introCompleted: true,
    });

    expect(normalized.ownedCreatureIds).toEqual(["mosslet", "gullip", "spriglet"]);
    expect(normalized.selectedPartyCreatureIds).toEqual(["spriglet", "mosslet", "gullip"]);
    expect(normalized.activeCreatureId).toBe("gullip");
    expect(normalized.currentMapId).toBe("mossgrove_town");
    expect(normalized.currentSpawnId).toBe("town_square");
    expect(normalized.introCompleted).toBe(true);
  });

  it("applies a normalized source state onto an existing target object", () => {
    const target = createInitialWorldState();
    const source = normalizeWorldState({
      currentMapId: "hidden_grove",
      currentSpawnId: "glen_return",
      defeatedBattles: { ridgeCaptainBattle: true },
      collectedInteractives: { forest_stash: true },
      ownedCreatureIds: ["mosslet", "spriglet"],
      selectedPartyCreatureIds: ["mosslet", "spriglet"],
      activeCreatureId: "mosslet",
      selectedAvatar: "grove",
      selectedDifficulty: "heroic",
      introCompleted: true,
    });

    applyWorldState(target, source);

    expect(target).toEqual(source);
  });
});
