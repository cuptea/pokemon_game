import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LeaderboardEntry } from "../src/types/app";

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

function makeEntry(index: number): LeaderboardEntry {
  return {
    id: `player-${index}`,
    playerId: `player-${index}`,
    displayName: `Player ${index}`,
    provider: "guest",
    avatar: index % 2 === 0 ? "blaze" : "mist",
    difficulty: index % 2 === 0 ? "heroic" : "adventure",
    currentMapId: "mossgrove_town",
    victories: index,
    discoveries: index,
    ownedCount: 3,
    introCompleted: true,
    score: 600 - index * 10,
    updatedAt: index,
  };
}

describe("game over leaderboard formatting", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("shows a localized empty-state message when no scores exist", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_language_v1: "zh",
      }),
    );

    const module = await import("../src/game/gameOverLeaderboard");

    expect(module.formatGameOverLeaderboard([])).toBe(
      "还没有排行榜记录。开始新冒险，拿下第一分吧。",
    );
  });

  it("formats up to five leaderboard rows for the game-over screen", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/game/gameOverLeaderboard");

    const output = module.formatGameOverLeaderboard([
      makeEntry(1),
      makeEntry(2),
      makeEntry(3),
      makeEntry(4),
      makeEntry(5),
      makeEntry(6),
    ]);

    const lines = output.split("\n");

    expect(lines).toHaveLength(5);
    expect(lines[0]).toContain("1. Player 1 - 590 - MIST / ADVENTURE");
    expect(lines[4]).toContain("5. Player 5 - 550 - MIST / ADVENTURE");
    expect(output).not.toContain("Player 6");
  });
});
