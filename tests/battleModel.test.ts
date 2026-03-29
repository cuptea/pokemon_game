import { describe, expect, it } from "vitest";

import { creatures, moves } from "../src/data/creatures";
import {
  buildRuntimeCreature,
  buildTrainerRuntimeCreature,
  buildWildRuntimeCreature,
  calculateBattleDamage,
} from "../src/game/battleModel";

const creatureRegistry = { creatures, moves };

describe("battle model helpers", () => {
  it("builds a base runtime creature from registry data", () => {
    expect(buildRuntimeCreature("spriglet", creatureRegistry)).toEqual({
      id: "spriglet",
      name: "Spriglet",
      hp: 32,
      maxHp: 32,
      attack: 9,
      defense: 4,
      moveName: "Ember",
      movePower: 8,
      color: 0x6bd66b,
      level: 5,
    });
  });

  it("builds leveled trainer and wild runtime creatures", () => {
    expect(
      buildTrainerRuntimeCreature({ creatureId: "mosslet", level: 9 }, creatureRegistry).level,
    ).toBe(9);
    expect(
      buildWildRuntimeCreature(
        { creatureId: "gullip", level: 7, zoneLabel: "Lake Edge" },
        creatureRegistry,
      ).level,
    ).toBe(7);
  });

  it("applies difficulty only to enemy attacks and keeps a minimum damage floor", () => {
    const player = buildRuntimeCreature("spriglet", creatureRegistry);
    const enemy = buildRuntimeCreature("puddlepup", creatureRegistry);

    expect(calculateBattleDamage(player, enemy, "heroic", "player")).toBe(14);
    expect(calculateBattleDamage(enemy, player, "heroic", "enemy")).toBe(11);
    expect(
      calculateBattleDamage(
        { ...player, attack: 1, movePower: 1 },
        { ...enemy, defense: 99 },
        "casual",
        "player",
      ),
    ).toBe(2);
  });
});
