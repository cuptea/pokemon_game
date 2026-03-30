import type { BattleResult } from "../types/world";

type BattleTransitionHandlers = {
  startGameOver: () => void;
  resumeOverworld: () => void;
  emitBattleComplete: (result: BattleResult) => void;
  stopBattle: () => void;
};

export function finalizeBattleTransition(
  result: BattleResult,
  handlers: BattleTransitionHandlers,
): void {
  if (result.outcome === "lose") {
    handlers.startGameOver();
    return;
  }

  handlers.resumeOverworld();
  handlers.emitBattleComplete(result);
  handlers.stopBattle();
}
