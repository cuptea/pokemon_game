import { describe, expect, it } from "vitest";

import { applyWildVictoryCapture } from "../src/game/wildCapture";
import type { WorldState } from "../src/types/world";

function makeState(overrides: Partial<WorldState> = {}): WorldState {
  return {
    currentMapId: "mossgrove_town",
    currentSpawnId: "town_square",
    defeatedBattles: {},
    collectedInteractives: {},
    ownedCreatureIds: ["spriglet"],
    selectedPartyCreatureIds: ["spriglet"],
    activeCreatureId: "spriglet",
    selectedAvatar: "blaze",
    selectedDifficulty: "adventure",
    introCompleted: false,
    ...overrides,
  };
}

describe("wild capture rewards", () => {
  it("adds a newly defeated wild creature to owned creatures and party when there is room", () => {
    const state = makeState({
      ownedCreatureIds: ["spriglet", "mosslet"],
      selectedPartyCreatureIds: ["spriglet", "mosslet"],
      activeCreatureId: "spriglet",
    });

    expect(applyWildVictoryCapture(state, "gullip")).toEqual({
      outcome: "captured",
      addedToParty: true,
      creatureId: "gullip",
    });
    expect(state.ownedCreatureIds).toEqual(["spriglet", "mosslet", "gullip"]);
    expect(state.selectedPartyCreatureIds).toEqual(["spriglet", "mosslet", "gullip"]);
    expect(state.activeCreatureId).toBe("spriglet");
  });

  it("still grants ownership when the party is already full", () => {
    const state = makeState({
      ownedCreatureIds: ["spriglet", "mosslet", "puddlepup"],
      selectedPartyCreatureIds: ["spriglet", "mosslet", "puddlepup"],
      activeCreatureId: "spriglet",
    });

    expect(applyWildVictoryCapture(state, "gullip")).toEqual({
      outcome: "captured",
      addedToParty: false,
      creatureId: "gullip",
    });
    expect(state.ownedCreatureIds).toEqual(["spriglet", "mosslet", "puddlepup", "gullip"]);
    expect(state.selectedPartyCreatureIds).toEqual(["spriglet", "mosslet", "puddlepup"]);
    expect(state.activeCreatureId).toBe("spriglet");
  });

  it("does not duplicate creatures that are already owned", () => {
    const state = makeState({
      ownedCreatureIds: ["spriglet", "gullip"],
      selectedPartyCreatureIds: ["spriglet"],
      activeCreatureId: "spriglet",
    });

    expect(applyWildVictoryCapture(state, "gullip")).toEqual({
      outcome: "already-owned",
      addedToParty: false,
      creatureId: "gullip",
    });
    expect(state.ownedCreatureIds).toEqual(["spriglet", "gullip"]);
    expect(state.selectedPartyCreatureIds).toEqual(["spriglet"]);
  });

  it("ignores missing encounter ids without corrupting party state", () => {
    const state = makeState();

    expect(applyWildVictoryCapture(state, undefined)).toEqual({
      outcome: "missing-creature",
      addedToParty: false,
    });
    expect(state.ownedCreatureIds).toEqual(["spriglet"]);
    expect(state.selectedPartyCreatureIds).toEqual(["spriglet"]);
    expect(state.activeCreatureId).toBe("spriglet");
  });
});
