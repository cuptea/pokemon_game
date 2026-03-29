import { describe, expect, it } from "vitest";

import { getStoryVisualTheme, toHexColor } from "../src/game/storyVisuals";

describe("story visual themes", () => {
  it("adapts Blaze maps toward ember tones", () => {
    const theme = getStoryVisualTheme("blaze", "blaze_ember_watch_peak");

    expect(theme.atmosphere).toBe("embers");
    expect(theme.silhouette).toBe("ridge");
  });

  it("adapts Mist maps toward water presentation", () => {
    const theme = getStoryVisualTheme("mist", "mist_mirror_isles");

    expect(theme.atmosphere).toBe("mist");
    expect(theme.silhouette).toBe("water");
  });

  it("creates stable hex colors for Phaser text styles", () => {
    expect(toHexColor(0xffb703)).toBe("#ffb703");
  });
});
