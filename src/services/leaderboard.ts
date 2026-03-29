import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { buildLeaderboardEntry } from "../game/runSummary";
import { worldState } from "../game/worldState";
import type { LeaderboardEntry } from "../types/app";
import { getSessionUser } from "./auth";
import { getFirestoreInstance, isFirebaseConfigured } from "./firebase";

const LOCAL_LEADERBOARD_KEY = "pokemon_game_leaderboard_local_v1";
const LEADERBOARD_COLLECTION = "leaderboard";

export async function fetchLeaderboardEntries(maxEntries = 10): Promise<LeaderboardEntry[]> {
  const firestore = getFirestoreInstance();
  if (firestore && isFirebaseConfigured()) {
    try {
      const leaderboardQuery = query(
        collection(firestore, LEADERBOARD_COLLECTION),
        orderBy("score", "desc"),
        limit(maxEntries),
      );
      const snapshot = await getDocs(leaderboardQuery);
      return snapshot.docs
        .map((entry) => entry.data() as LeaderboardEntry)
        .sort(sortLeaderboardEntries)
        .slice(0, maxEntries);
    } catch {
      return loadLocalLeaderboard().slice(0, maxEntries);
    }
  }

  return loadLocalLeaderboard().slice(0, maxEntries);
}

export async function submitLeaderboardFromCurrentWorldState(): Promise<void> {
  const sessionUser = getSessionUser();
  if (!sessionUser) {
    return;
  }

  const entry = buildLeaderboardEntry(sessionUser, worldState);
  const firestore = getFirestoreInstance();

  if (firestore && isFirebaseConfigured()) {
    try {
      await setDoc(doc(firestore, LEADERBOARD_COLLECTION, sessionUser.id), entry, { merge: true });
      return;
    } catch {
      saveLocalLeaderboardEntry(entry);
      return;
    }
  }

  saveLocalLeaderboardEntry(entry);
}

export function loadLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return [...parsed].sort(sortLeaderboardEntries);
  } catch {
    return [];
  }
}

export function saveLocalLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = loadLocalLeaderboard().filter((current) => current.id !== entry.id);
  existing.push(entry);
  const sorted = existing.sort(sortLeaderboardEntries).slice(0, 25);
  window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(sorted));
}

function sortLeaderboardEntries(left: LeaderboardEntry, right: LeaderboardEntry): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.updatedAt - right.updatedAt;
}
