export const BATTLE_RESUME_LOCK_MS = 180;

export type BattleLaunchState = {
  awaitingBattleResume: true;
  transitionLocked: true;
};

export type BattleResumeState = {
  awaitingBattleResume: false;
  transitionLocked: false;
  interactionLockedUntil: number;
  shouldFadeIn: true;
};

export function createBattleLaunchState(): BattleLaunchState {
  return {
    awaitingBattleResume: true,
    transitionLocked: true,
  };
}

export function createBattleResumeState(now: number): BattleResumeState {
  return {
    awaitingBattleResume: false,
    transitionLocked: false,
    interactionLockedUntil: now + BATTLE_RESUME_LOCK_MS,
    shouldFadeIn: true,
  };
}

export function resolveBattleResumeState(
  awaitingBattleResume: boolean,
  now: number,
): BattleResumeState | null {
  if (!awaitingBattleResume) {
    return null;
  }

  return createBattleResumeState(now);
}
