import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import type { SessionUser } from "../types/app";
import {
  getFirebaseAuthInstance,
  getGoogleProvider,
  isFirebaseConfigured,
} from "./firebase";

const GUEST_SESSION_KEY = "pokemon_game_guest_session_v1";

let currentUser: SessionUser | null = null;
let initialized = false;
let unsubscribeAuth: (() => void) | null = null;
const listeners = new Set<(user: SessionUser | null) => void>();

export function isGoogleLoginAvailable(): boolean {
  return isFirebaseConfigured();
}

export function getSessionUser(): SessionUser | null {
  if (!initialized) {
    initializeSession();
  }

  return currentUser;
}

export async function initializeSession(): Promise<SessionUser | null> {
  if (initialized) {
    return currentUser;
  }

  initialized = true;

  if (typeof window !== "undefined") {
    currentUser = loadGuestSession();
  }

  const auth = getFirebaseAuthInstance();
  if (!auth) {
    notifyListeners();
    return currentUser;
  }

  await setPersistence(auth, browserLocalPersistence);

  await new Promise<void>((resolve) => {
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      currentUser = user ? mapFirebaseUser(user) : loadGuestSession();
      notifyListeners();
      resolve();
    });
  });

  return currentUser;
}

export function subscribeToSession(
  listener: (user: SessionUser | null) => void,
): () => void {
  listeners.add(listener);
  void initializeSession().then(() => {
    listener(currentUser);
  });

  return () => {
    listeners.delete(listener);
  };
}

export async function signInWithGoogleAccount(): Promise<SessionUser> {
  const auth = getFirebaseAuthInstance();
  const provider = getGoogleProvider();

  if (!auth || !provider) {
    throw new Error("Google sign-in is not configured for this build.");
  }

  const result = await signInWithPopup(auth, provider);
  clearGuestSession();
  currentUser = mapFirebaseUser(result.user);
  notifyListeners();
  return currentUser;
}

export async function continueAsGuest(): Promise<SessionUser> {
  const guest = createGuestSession();
  saveGuestSession(guest);
  currentUser = guest;
  notifyListeners();
  return guest;
}

export async function signOutSession(): Promise<void> {
  const auth = getFirebaseAuthInstance();
  if (auth?.currentUser) {
    await signOut(auth);
  }

  clearGuestSession();
  currentUser = null;
  notifyListeners();
}

export function disposeSessionAuthListener(): void {
  unsubscribeAuth?.();
  unsubscribeAuth = null;
}

function notifyListeners(): void {
  for (const listener of listeners) {
    listener(currentUser);
  }
}

function mapFirebaseUser(user: User): SessionUser {
  return {
    id: user.uid,
    displayName: user.displayName ?? user.email ?? "Trainer",
    email: user.email ?? undefined,
    photoUrl: user.photoURL ?? undefined,
    provider: "google",
  };
}

function createGuestSession(): SessionUser {
  const existing = loadGuestSession();
  if (existing) {
    return existing;
  }

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    id: `guest-${suffix}`,
    displayName: `Guest ${suffix}`,
    provider: "guest",
  };
}

function loadGuestSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(GUEST_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SessionUser;
    return parsed?.id && parsed?.displayName ? parsed : null;
  } catch {
    return null;
  }
}

function saveGuestSession(user: SessionUser): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(user));
}

function clearGuestSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(GUEST_SESSION_KEY);
}
