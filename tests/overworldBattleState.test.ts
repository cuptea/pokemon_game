import { describe, expect, it } from "vitest";

import {
  createBattleLaunchState,
  BATTLE_RESUME_LOCK_MS,
  createBattleResumeState,
} from "../src/game/overworldBattleState";

describe("overworld battle resume state", () => {
  it("arms the overworld to expect a battle resume when launching a battle", () => {
    expect(createBattleLaunchState()).toEqual({
      awaitingBattleResume: true,
      transitionLocked: true,
    });
  });

  it("clears the battle lock and creates a short post-battle input guard", () => {
    expect(createBattleResumeState(1200)).toEqual({
      awaitingBattleResume: false,
      transitionLocked: false,
      interactionLockedUntil: 1200 + BATTLE_RESUME_LOCK_MS,
      shouldFadeIn: true,
    });
  });
});
