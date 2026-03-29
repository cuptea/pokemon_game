import type { GameDifficulty, PlayerAvatar, WorldState } from "./world";

export type SessionProvider = "google" | "guest";

export type SessionUser = {
  id: string;
  displayName: string;
  email?: string;
  photoUrl?: string;
  provider: SessionProvider;
};

export type LeaderboardEntry = {
  id: string;
  playerId: string;
  displayName: string;
  provider: SessionProvider;
  avatar: PlayerAvatar;
  difficulty: GameDifficulty;
  currentMapId: string;
  victories: number;
  discoveries: number;
  ownedCount: number;
  introCompleted: boolean;
  score: number;
  updatedAt: number;
};

export type LeaderboardSnapshot = {
  entry: LeaderboardEntry;
  worldState: WorldState;
};
