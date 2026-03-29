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
    module.worldState.selectedAvatar = "mist";
    module.worldState.selectedDifficulty = "heroic";
    module.worldState.introCompleted = true;
    module.saveWorldState();

    const savedRaw = fakeWindow.localStorage.getItem("pokemon_game_world_state_v1");
    expect(savedRaw).toContain("route_01_fields");
    expect(savedRaw).toContain("scoutLinaBattle");
    expect(savedRaw).toContain("mist");
    expect(savedRaw).toContain("heroic");

    module.resetWorldState();

    expect(module.worldState.currentMapId).toBe("mossgrove_town");
    expect(module.worldState.currentSpawnId).toBe("town_square");
    expect(module.worldState.defeatedBattles).toEqual({});
    expect(module.worldState.collectedInteractives).toEqual({});
    expect(module.worldState.selectedAvatar).toBe("blaze");
    expect(module.worldState.selectedDifficulty).toBe("adventure");
    expect(module.worldState.introCompleted).toBe(false);
  });
});
