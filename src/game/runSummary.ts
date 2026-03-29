import type { LeaderboardEntry, SessionUser } from "../types/app";
import type { WorldState } from "../types/world";

export function calculateLeaderboardScore(worldState: WorldState): number {
  const victories = Object.keys(worldState.defeatedBattles).length;
  const discoveries = Object.keys(worldState.collectedInteractives).length;
  const ownedCount = worldState.ownedCreatureIds.length;
  const introBonus = worldState.introCompleted ? 25 : 0;

  return victories * 120 + discoveries * 45 + ownedCount * 60 + introBonus;
}

export function buildLeaderboardEntry(
  user: SessionUser,
  worldState: WorldState,
): LeaderboardEntry {
  return {
    id: user.id,
    playerId: user.id,
    displayName: user.displayName,
    provider: user.provider,
    avatar: worldState.selectedAvatar,
    difficulty: worldState.selectedDifficulty,
    currentMapId: worldState.currentMapId,
    victories: Object.keys(worldState.defeatedBattles).length,
    discoveries: Object.keys(worldState.collectedInteractives).length,
    ownedCount: worldState.ownedCreatureIds.length,
    introCompleted: worldState.introCompleted,
    score: calculateLeaderboardScore(worldState),
    updatedAt: Date.now(),
  };
}
