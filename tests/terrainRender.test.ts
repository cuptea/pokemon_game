import { describe, expect, it } from "vitest";

import { getTerrainStyle, isWaterTone } from "../src/game/terrainRender";

describe("terrain renderer classification", () => {
  it("keeps water patches on the procedural fill path", () => {
    expect(isWaterTone(0x89d2dc)).toBe(true);
    expect(
      getTerrainStyle("lake_edge_01", {
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        color: 0x89d2dc,
      }).textureKey,
    ).toBeNull();
  });

  it("maps outdoor route tones to Tiny Town terrain textures", () => {
    expect(
      getTerrainStyle("route_01_fields", {
        x: 120,
        y: 180,
        width: 240,
        height: 120,
        color: 0xc8b27a,
      }).textureKey,
    ).toBe("tt_path_fill");

    expect(
      getTerrainStyle("mossgrove_town", {
        x: 0,
        y: 0,
        width: 480,
        height: 360,
        color: 0x3f8f54,
      }).textureKey,
    ).toMatch(/^tt_grass_/);
  });

  it("uses stone blocks inside interiors", () => {
    expect(
      getTerrainStyle("interior_player_house", {
        x: 80,
        y: 80,
        width: 240,
        height: 160,
        color: 0xd7ccc8,
      }).textureKey,
    ).toBe("tt_stone_block");
  });
});
