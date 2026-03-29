import { beforeEach, describe, expect, it, vi } from "vitest";

type StorageRecord = Record<string, string>;

function makeWindow(initial: StorageRecord = {}) {
  const storage: StorageRecord = { ...initial };

  return {
    localStorage: {
      getItem(key: string) {
        return storage[key] ?? null;
      },
      setItem(key: string, value: string) {
        storage[key] = value;
      },
      removeItem(key: string) {
        delete storage[key];
      },
    },
  };
}

describe("auth guest fallback", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.doMock("../src/services/firebase", () => ({
      getFirebaseAuthInstance: () => null,
      getGoogleProvider: () => null,
      isFirebaseConfigured: () => false,
    }));
  });

  it("initializes from an existing guest session when Firebase is unavailable", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_guest_session_v1: JSON.stringify({
          id: "guest-ALPHA1",
          displayName: "Guest ALPHA1",
          provider: "guest",
        }),
      }),
    );

    const module = await import("../src/services/auth");

    expect(await module.initializeSession()).toEqual({
      id: "guest-ALPHA1",
      displayName: "Guest ALPHA1",
      provider: "guest",
    });
    expect(module.getSessionUser()).toEqual({
      id: "guest-ALPHA1",
      displayName: "Guest ALPHA1",
      provider: "guest",
    });
    expect(module.isGoogleLoginAvailable()).toBe(false);
  });

  it("creates and persists a guest session, then clears it on sign out", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);
    vi.spyOn(Math, "random").mockReturnValue(0.123456789);

    const module = await import("../src/services/auth");

    const guest = await module.continueAsGuest();
    expect(guest.provider).toBe("guest");
    expect(guest.id).toMatch(/^guest-/);
    expect(guest.displayName).toMatch(/^Guest /);
    expect(fakeWindow.localStorage.getItem("pokemon_game_guest_session_v1")).toContain(guest.id);

    await module.signOutSession();

    expect(module.getSessionUser()).toBeNull();
    expect(fakeWindow.localStorage.getItem("pokemon_game_guest_session_v1")).toBeNull();
  });

  it("rejects Google sign-in when the build is not configured", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/services/auth");

    await expect(module.signInWithGoogleAccount()).rejects.toThrow(
      "Google sign-in is not configured for this build.",
    );
  });
});
