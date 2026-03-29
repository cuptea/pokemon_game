import type { LeaderboardEntry } from "../types/app";
import { getAvatarLabel, getDifficultyLabel, t } from "./i18n";

export const GAME_OVER_LEADERBOARD_LIMIT = 5;

export function formatGameOverLeaderboard(entries: LeaderboardEntry[]): string {
  if (entries.length === 0) {
    return t("gameover.leaderboard_empty");
  }

  return entries
    .slice(0, GAME_OVER_LEADERBOARD_LIMIT)
    .map(
      (entry, index) =>
        `${index + 1}. ${entry.displayName} - ${entry.score} - ${getAvatarLabel(entry.avatar)} / ${getDifficultyLabel(entry.difficulty)}`,
    )
    .join("\n");
}
