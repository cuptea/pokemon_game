import { describe, expect, it } from "vitest";

import { maps } from "../src/data/maps";
import type { PlayerAvatar } from "../src/types/world";

describe("hero map variants", () => {
  it("defines visible per-hero variants for the shared story maps", () => {
    const avatars: PlayerAvatar[] = ["blaze", "mist", "grove"];
    const sharedMaps = [
      "mossgrove_town",
      "route_01_fields",
      "forest_01_glen",
      "lake_edge_01",
      "sidepath_01_hidden_grove",
    ] as const;

    for (const mapId of sharedMaps) {
      const map = maps[mapId];
      expect(map.heroPatches, `${mapId} should define hero patches`).toBeDefined();
      expect(map.heroDecorations, `${mapId} should define hero decorations`).toBeDefined();

      for (const avatar of avatars) {
        expect(map.heroPatches?.[avatar]?.length, `${mapId}:${avatar} should have hero patches`).toBeGreaterThan(0);
        expect(
          map.heroDecorations?.[avatar]?.length,
          `${mapId}:${avatar} should have hero decorations`,
        ).toBeGreaterThan(0);
      }
    }
  });
});
