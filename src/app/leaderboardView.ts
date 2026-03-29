import { getAvatarLabel, getDifficultyLabel, t } from "../game/i18n";
import type { LeaderboardEntry } from "../types/app";

export type LeaderboardDisplayRow = {
  rankLabel: string;
  displayName: string;
  metaText: string;
  scoreLabel: string;
  featured: boolean;
};

export function buildLeaderboardDisplayRows(
  entries: LeaderboardEntry[],
): LeaderboardDisplayRow[] {
  return entries.map((entry, index) => ({
    rankLabel: `#${index + 1}`,
    displayName: entry.displayName,
    metaText: t("app.row_meta", {
      avatar: getAvatarLabel(entry.avatar),
      difficulty: getDifficultyLabel(entry.difficulty),
      victories: entry.victories,
      discoveries: entry.discoveries,
      owned: entry.ownedCount,
    }),
    scoreLabel: `${entry.score}`,
    featured: index === 0,
  }));
}

export function escapeHtml(value: string): string {
  return value
    .split("&")
    .join("&amp;")
    .split("<")
    .join("&lt;")
    .split(">")
    .join("&gt;")
    .split('"')
    .join("&quot;")
    .split("'")
    .join("&#39;");
}
