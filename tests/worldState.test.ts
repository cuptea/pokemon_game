import { beforeEach, describe, expect, it, vi } from "vitest";

type StorageRecord = Record<string, string>;

function makeWindow(initial: StorageRecord = {}) {
  const storage: StorageRecord = { ...initial };

  return {
    localStorage: {
      getItem(key: string) {
        return storage[key] ?? null;
      },
      setItem(key: string, value: string) {
        storage[key] = value;
      },
      removeItem(key: string) {
        delete storage[key];
      },
    },
  };
}

describe("worldState persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("loads defaults when storage is empty", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/game/worldState");

    expect(module.worldState.currentMapId).toBe("mossgrove_town");
    expect(module.worldState.currentSpawnId).toBe("town_square");
    expect(module.worldState.defeatedBattles).toEqual({});
    expect(module.worldState.collectedInteractives).toEqual({});
    expect(module.worldState.ownedCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.selectedPartyCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.activeCreatureId).toBe("spriglet");
    expect(module.worldState.selectedAvatar).toBe("blaze");
    expect(module.worldState.selectedDifficulty).toBe("adventure");
    expect(module.worldState.introCompleted).toBe(false);
  });

  it("saves and resets persistent progress", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);

    const module = await import("../src/game/worldState");

    module.worldState.currentMapId = "route_01_fields";
    module.worldState.currentSpawnId = "forest_return";
    module.worldState.defeatedBattles.scoutLinaBattle = true;
    module.worldState.collectedInteractives.route_bridge_cache = true;
    module.worldState.ownedCreatureIds = ["spriglet", "mosslet", "puddlepup"];
    module.worldState.selectedPartyCreatureIds = ["mosslet", "puddlepup", "spriglet"];
    module.worldState.activeCreatureId = "mosslet";
    module.worldState.selectedAvatar = "mist";
    module.worldState.selectedDifficulty = "heroic";
    module.worldState.introCompleted = true;
    module.saveWorldState();

    const savedRaw = fakeWindow.localStorage.getItem("pokemon_game_world_state_v1");
    expect(savedRaw).toContain("route_01_fields");
    expect(savedRaw).toContain("scoutLinaBattle");
    expect(savedRaw).toContain("mist");
    expect(savedRaw).toContain("heroic");
    expect(savedRaw).toContain("mosslet");

    module.resetWorldState();

    expect(module.worldState.currentMapId).toBe("mossgrove_town");
    expect(module.worldState.currentSpawnId).toBe("town_square");
    expect(module.worldState.defeatedBattles).toEqual({});
    expect(module.worldState.collectedInteractives).toEqual({});
    expect(module.worldState.ownedCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.selectedPartyCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.activeCreatureId).toBe("spriglet");
    expect(module.worldState.selectedAvatar).toBe("blaze");
    expect(module.worldState.selectedDifficulty).toBe("adventure");
    expect(module.worldState.introCompleted).toBe(false);
  });

  it("can reset the adventure while keeping the chosen hero and difficulty", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);

    const module = await import("../src/game/worldState");

    module.worldState.currentMapId = "lake_edge_01";
    module.worldState.currentSpawnId = "dock_return";
    module.worldState.defeatedBattles.mentorBattle = true;
    module.worldState.collectedInteractives.town_board = true;
    module.worldState.ownedCreatureIds = ["spriglet", "mosslet"];
    module.worldState.selectedPartyCreatureIds = ["mosslet", "spriglet"];
    module.worldState.activeCreatureId = "mosslet";
    module.worldState.selectedAvatar = "grove";
    module.worldState.selectedDifficulty = "heroic";
    module.worldState.introCompleted = true;

    module.resetAdventurePreservingProfile();

    expect(module.worldState.currentMapId).toBe("mossgrove_town");
    expect(module.worldState.currentSpawnId).toBe("town_square");
    expect(module.worldState.defeatedBattles).toEqual({});
    expect(module.worldState.collectedInteractives).toEqual({});
    expect(module.worldState.ownedCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.selectedPartyCreatureIds).toEqual(["spriglet"]);
    expect(module.worldState.activeCreatureId).toBe("spriglet");
    expect(module.worldState.selectedAvatar).toBe("grove");
    expect(module.worldState.selectedDifficulty).toBe("heroic");
    expect(module.worldState.introCompleted).toBe(true);
  });

  it("falls back to defaults when avatar or difficulty values are invalid", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_world_state_v1: JSON.stringify({
          selectedAvatar: "unknown",
          selectedDifficulty: "nightmare",
          ownedCreatureIds: ["mosslet", "unknown", "mosslet", "puddlepup", "gullip"],
          selectedPartyCreatureIds: ["missing", "gullip"],
          activeCreatureId: "missing",
          introCompleted: true,
        }),
      }),
    );

    const module = await import("../src/game/worldState");

    expect(module.worldState.selectedAvatar).toBe("blaze");
    expect(module.worldState.selectedDifficulty).toBe("adventure");
    expect(module.worldState.ownedCreatureIds).toEqual(["mosslet", "puddlepup", "gullip"]);
    expect(module.worldState.selectedPartyCreatureIds).toEqual(["gullip", "mosslet", "puddlepup"]);
    expect(module.worldState.activeCreatureId).toBe("gullip");
    expect(module.worldState.introCompleted).toBe(true);
  });

  it("falls back to defaults when stored save data is malformed JSON", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_world_state_v1: "{bad json",
      }),
    );

    const module = await import("../src/game/worldState");

    expect(module.worldState.currentMapId).toBe("mossgrove_town");
    expect(module.worldState.selectedAvatar).toBe("blaze");
    expect(module.worldState.selectedPartyCreatureIds).toEqual(["spriglet"]);
  });
});
