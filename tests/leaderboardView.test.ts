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

const entries: LeaderboardEntry[] = [
  {
    id: "guest-1",
    playerId: "guest-1",
    displayName: "Ash & <Misty>",
    provider: "guest",
    avatar: "mist",
    difficulty: "heroic",
    currentMapId: "route_01_fields",
    victories: 3,
    discoveries: 2,
    ownedCount: 4,
    introCompleted: true,
    score: 780,
    updatedAt: 1,
  },
  {
    id: "guest-2",
    playerId: "guest-2",
    displayName: "Brock",
    provider: "guest",
    avatar: "blaze",
    difficulty: "adventure",
    currentMapId: "mossgrove_town",
    victories: 2,
    discoveries: 1,
    ownedCount: 3,
    introCompleted: true,
    score: 620,
    updatedAt: 2,
  },
];

describe("leaderboard view helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("builds localized display rows for the app shell", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/app/leaderboardView");

    expect(module.buildLeaderboardDisplayRows(entries)).toEqual([
      {
        rankLabel: "#1",
        displayName: "Ash & <Misty>",
        metaText: "MIST • HEROIC • 3 wins • 2 discoveries • 4 owned",
        scoreLabel: "780",
        featured: true,
      },
      {
        rankLabel: "#2",
        displayName: "Brock",
        metaText: "BLAZE • ADVENTURE • 2 wins • 1 discoveries • 3 owned",
        scoreLabel: "620",
        featured: false,
      },
    ]);
  });

  it("escapes user-controlled values before HTML injection", async () => {
    const module = await import("../src/app/leaderboardView");

    expect(module.escapeHtml(`Ash & <Misty> "Gary"`)).toBe(
      "Ash &amp; &lt;Misty&gt; &quot;Gary&quot;",
    );
  });
});
