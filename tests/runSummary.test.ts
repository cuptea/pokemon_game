import { describe, expect, it } from "vitest";

import { buildLeaderboardEntry, calculateLeaderboardScore } from "../src/game/runSummary";
import type { SessionUser } from "../src/types/app";
import type { WorldState } from "../src/types/world";

const user: SessionUser = {
  id: "guest-AAA111",
  displayName: "Guest AAA111",
  provider: "guest",
};

const worldState: WorldState = {
  currentMapId: "route_01_fields",
  currentSpawnId: "west_gate",
  defeatedBattles: { mentorBattle: true, scoutLinaBattle: true },
  collectedInteractives: { town_board: true, route_bridge_cache: true, forest_stash: true },
  ownedCreatureIds: ["spriglet", "mosslet", "puddlepup"],
  selectedPartyCreatureIds: ["spriglet", "mosslet", "puddlepup"],
  activeCreatureId: "spriglet",
  selectedAvatar: "mist",
  selectedDifficulty: "heroic",
  introCompleted: true,
};

describe("run summary leaderboard scoring", () => {
  it("calculates a stable composite score from progress", () => {
    expect(calculateLeaderboardScore(worldState)).toBe(2 * 120 + 3 * 45 + 3 * 60 + 25);
  });

  it("builds leaderboard entries from session + world progress", () => {
    const entry = buildLeaderboardEntry(user, worldState);

    expect(entry.playerId).toBe(user.id);
    expect(entry.displayName).toBe(user.displayName);
    expect(entry.avatar).toBe("mist");
    expect(entry.difficulty).toBe("heroic");
    expect(entry.victories).toBe(2);
    expect(entry.discoveries).toBe(3);
    expect(entry.ownedCount).toBe(3);
    expect(entry.currentMapId).toBe("route_01_fields");
  });
});
