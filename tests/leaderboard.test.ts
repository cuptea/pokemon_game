import { beforeEach, describe, expect, it, vi } from "vitest";

import type { WorldState } from "../src/types/world";

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

const sampleWorldState: WorldState = {
  currentMapId: "route_01_fields",
  currentSpawnId: "west_gate",
  defeatedBattles: { mentorBattle: true, scoutLinaBattle: true },
  collectedInteractives: { town_board: true, route_bridge_cache: true },
  ownedCreatureIds: ["spriglet", "mosslet", "puddlepup"],
  selectedPartyCreatureIds: ["spriglet", "mosslet", "puddlepup"],
  activeCreatureId: "spriglet",
  selectedAvatar: "mist",
  selectedDifficulty: "heroic",
  introCompleted: true,
};

describe("leaderboard persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("saves local entries in score order, dedupes by player id, and caps the list", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);

    const module = await import("../src/services/leaderboard");

    for (let index = 0; index < 30; index += 1) {
      module.saveLocalLeaderboardEntry({
        id: `player-${index}`,
        playerId: `player-${index}`,
        displayName: `Player ${index}`,
        provider: "guest",
        avatar: "blaze",
        difficulty: "adventure",
        currentMapId: "mossgrove_town",
        victories: index,
        discoveries: 0,
        ownedCount: 1,
        introCompleted: false,
        score: 100 - index,
        updatedAt: 1_000 + index,
      });
    }

    module.saveLocalLeaderboardEntry({
      id: "player-5",
      playerId: "player-5",
      displayName: "Player 5",
      provider: "guest",
      avatar: "grove",
      difficulty: "heroic",
      currentMapId: "hidden_grove",
      victories: 9,
      discoveries: 4,
      ownedCount: 3,
      introCompleted: true,
      score: 999,
      updatedAt: 99,
    });

    const entries = module.loadLocalLeaderboard();

    expect(entries).toHaveLength(25);
    expect(entries[0]?.id).toBe("player-5");
    expect(entries[0]?.score).toBe(999);
    expect(entries.filter((entry) => entry.id === "player-5")).toHaveLength(1);
    expect(entries.at(-1)?.score).toBe(76);
  });

  it("falls back to local entries when Firebase is unavailable", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_leaderboard_local_v1: JSON.stringify([
          {
            id: "guest-AAA111",
            playerId: "guest-AAA111",
            displayName: "Guest AAA111",
            provider: "guest",
            avatar: "mist",
            difficulty: "heroic",
            currentMapId: "route_01_fields",
            victories: 2,
            discoveries: 2,
            ownedCount: 3,
            introCompleted: true,
            score: 445,
            updatedAt: 100,
          },
        ]),
      }),
    );

    vi.doMock("../src/services/firebase", () => ({
      getFirestoreInstance: () => null,
      isFirebaseConfigured: () => false,
    }));

    const module = await import("../src/services/leaderboard");

    await expect(module.fetchLeaderboardEntries()).resolves.toEqual([
      expect.objectContaining({
        id: "guest-AAA111",
        score: 445,
      }),
    ]);
  });

  it("submits locally when no remote backend is configured", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);

    vi.doMock("../src/services/firebase", () => ({
      getFirestoreInstance: () => null,
      isFirebaseConfigured: () => false,
    }));
    vi.doMock("../src/services/auth", () => ({
      getSessionUser: () => ({
        id: "guest-AAA111",
        displayName: "Guest AAA111",
        provider: "guest",
      }),
    }));
    vi.doMock("../src/game/worldState", () => ({
      worldState: sampleWorldState,
    }));

    const module = await import("../src/services/leaderboard");

    await module.submitLeaderboardFromCurrentWorldState();

    const saved = JSON.parse(
      fakeWindow.localStorage.getItem("pokemon_game_leaderboard_local_v1") ?? "[]",
    ) as Array<{ id: string; score: number; currentMapId: string }>;

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      id: "guest-AAA111",
      currentMapId: "route_01_fields",
      score: 535,
    });
  });
});
