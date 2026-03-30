import { describe, expect, it, vi } from "vitest";

import { finalizeBattleTransition } from "../src/game/battleTransition";
import type { BattleResult } from "../src/types/world";

describe("battle transition handoff", () => {
  it("routes wins through the overworld return handoff", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      battleId: "mentorBattle",
      outcome: "win",
      source: "trainer",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      returnToOverworld: vi.fn(() => calls.push("return")),
    });

    expect(calls).toEqual(["return"]);
  });

  it("uses the same return handoff for escapes", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      outcome: "escape",
      source: "wild",
      encounteredCreatureId: "mosslet",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      returnToOverworld: vi.fn(() => calls.push("return")),
    });

    expect(calls).toEqual(["return"]);
  });

  it("routes defeats directly to game over", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      battleId: "mentorBattle",
      outcome: "lose",
      source: "trainer",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      returnToOverworld: vi.fn(() => calls.push("return")),
    });

    expect(calls).toEqual(["gameover"]);
  });

  it("never routes defeats back through the overworld return handoff", () => {
    const returnToOverworld = vi.fn();

    finalizeBattleTransition(
      {
        battleId: "mentorBattle",
        outcome: "lose",
        source: "trainer",
      },
      {
        startGameOver: vi.fn(),
        returnToOverworld,
      },
    );

    expect(returnToOverworld).not.toHaveBeenCalled();
  });
});
