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

describe("i18n runtime", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("defaults to English when no language is stored", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/game/i18n");

    expect(module.getCurrentLanguage()).toBe("en");
    expect(module.t("app.leaderboard")).toBe("Leaderboard");
    expect(module.getDifficultyLabel("heroic")).toBe("HEROIC");
  });

  it("persists the chosen language and translates story status", async () => {
    const fakeWindow = makeWindow();
    vi.stubGlobal("window", fakeWindow);

    const module = await import("../src/game/i18n");

    module.setCurrentLanguage("zh");

    expect(fakeWindow.localStorage.getItem("pokemon_game_language_v1")).toBe("zh");
    expect(module.t("app.leaderboard")).toBe("排行榜");
    expect(module.getDifficultyLabel("adventure")).toBe("冒险");

    const status = module.getLocalizedStoryStatus({
      selectedAvatar: "blaze",
      defeatedBattles: {},
      currentMapId: "mossgrove_town",
    });

    expect(status.chapterTitle).toBe("第一幕 - 初燃火种");
    expect(status.routeLabel).toContain("苔谷镇");
  });

  it("falls back to English when storage contains an invalid language", async () => {
    vi.stubGlobal(
      "window",
      makeWindow({
        pokemon_game_language_v1: "invalid-language",
      }),
    );

    const module = await import("../src/game/i18n");

    expect(module.getCurrentLanguage()).toBe("en");
    expect(module.t("battle.run")).toBe("Run");
  });

  it("covers every English translation key in Chinese and German", async () => {
    vi.stubGlobal("window", makeWindow());

    const module = await import("../src/game/i18n");

    const englishKeys = module.getTranslationKeys("en");

    for (const key of englishKeys) {
      expect(module.t(key, {}, "zh")).not.toBe(key);
      expect(module.t(key, {}, "de")).not.toBe(key);
    }
  });
});
