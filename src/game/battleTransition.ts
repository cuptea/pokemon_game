import type { BattleResult } from "../types/world";

type BattleTransitionHandlers = {
  startGameOver: (result: BattleResult) => void;
  returnToOverworld: (result: BattleResult) => void;
};

export function finalizeBattleTransition(
  result: BattleResult,
  handlers: BattleTransitionHandlers,
): void {
  if (result.outcome === "lose") {
    handlers.startGameOver(result);
    return;
  }

  handlers.returnToOverworld(result);
}
