import { describe, expect, it, vi } from "vitest";

import { finalizeBattleTransition } from "../src/game/battleTransition";
import type { BattleResult } from "../src/types/world";

describe("battle transition handoff", () => {
  it("resumes the overworld before emitting battle-complete on wins", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      battleId: "mentorBattle",
      outcome: "win",
      source: "trainer",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      resumeOverworld: vi.fn(() => calls.push("resume")),
      emitBattleComplete: vi.fn(() => calls.push("emit")),
      stopBattle: vi.fn(() => calls.push("stop")),
    });

    expect(calls).toEqual(["resume", "emit", "stop"]);
  });

  it("uses the same return order for escapes", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      outcome: "escape",
      source: "wild",
      encounteredCreatureId: "mosslet",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      resumeOverworld: vi.fn(() => calls.push("resume")),
      emitBattleComplete: vi.fn(() => calls.push("emit")),
      stopBattle: vi.fn(() => calls.push("stop")),
    });

    expect(calls).toEqual(["resume", "emit", "stop"]);
  });

  it("routes defeats directly to game over without separately resuming or stopping the overworld handoff", () => {
    const calls: string[] = [];
    const result: BattleResult = {
      battleId: "mentorBattle",
      outcome: "lose",
      source: "trainer",
    };

    finalizeBattleTransition(result, {
      startGameOver: vi.fn(() => calls.push("gameover")),
      resumeOverworld: vi.fn(() => calls.push("resume")),
      emitBattleComplete: vi.fn(() => calls.push("emit")),
      stopBattle: vi.fn(() => calls.push("stop")),
    });

    expect(calls).toEqual(["gameover"]);
  });

  it("never emits battle completion for defeats", () => {
    const emitBattleComplete = vi.fn();

    finalizeBattleTransition(
      {
        battleId: "mentorBattle",
        outcome: "lose",
        source: "trainer",
      },
      {
        startGameOver: vi.fn(),
        resumeOverworld: vi.fn(),
        emitBattleComplete,
        stopBattle: vi.fn(),
      },
    );

    expect(emitBattleComplete).not.toHaveBeenCalled();
  });
});
