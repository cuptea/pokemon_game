import { describe, expect, it } from "vitest";

import { battleCreatureArt, battleCreatureTextureEntries } from "../src/data/battleCreatureArt";
import { creatures } from "../src/data/creatures";

describe("battle creature art manifest", () => {
  it("covers every registered creature with front and back battle art metadata", () => {
    for (const creatureId of Object.keys(creatures)) {
      const art = battleCreatureArt[creatureId];
      expect(art, `${creatureId} is missing battle art metadata`).toBeDefined();
      expect(art.frontKey, `${creatureId} is missing a front key`).toMatch(/^monster_/);
      expect(art.backKey, `${creatureId} is missing a back key`).toMatch(/^monster_/);
      expect(art.frontPath.endsWith(".png")).toBe(true);
      expect(art.backPath.endsWith(".png")).toBe(true);
    }
  });

  it("keeps battle art preload entries unique", () => {
    const keys = battleCreatureTextureEntries.map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
