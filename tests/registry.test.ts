import { describe, expect, it } from "vitest";
import { trainerBattles } from "../src/data/battles";
import { creatures } from "../src/data/creatures";
import { encounterTables } from "../src/data/encounters";
import { maps } from "../src/data/maps";

describe("world registry integrity", () => {
  it("keeps all map exits pointing to valid maps and spawn points", () => {
    for (const map of Object.values(maps)) {
      for (const exit of map.exits) {
        const targetMap = maps[exit.targetMapId];
        expect(targetMap, `${map.id}:${exit.id} missing target map`).toBeDefined();
        expect(
          targetMap.spawnPoints[exit.targetSpawnId],
          `${map.id}:${exit.id} missing target spawn ${exit.targetSpawnId}`,
        ).toBeDefined();
      }
    }
  });

  it("keeps encounter zones pointing to valid encounter tables and creatures", () => {
    for (const map of Object.values(maps)) {
      for (const zone of map.encounterZones) {
        const table = encounterTables[zone.tableId];
        expect(table, `${map.id}:${zone.id} missing encounter table`).toBeDefined();
        for (const slot of table.slots) {
          expect(
            creatures[slot.creatureId],
            `${zone.id} missing creature ${slot.creatureId}`,
          ).toBeDefined();
          expect(slot.minLevel).toBeLessThanOrEqual(slot.maxLevel);
        }
      }
    }
  });

  it("keeps every trainer placement wired to a non-empty trainer battle party", () => {
    for (const map of Object.values(maps)) {
      for (const trainer of map.trainers) {
        const battle = trainerBattles[trainer.battleId];
        expect(
          battle,
          `${map.id}:${trainer.id} missing trainer battle ${trainer.battleId}`,
        ).toBeDefined();
        expect(
          battle.party.length,
          `${trainer.id} should have at least one party member`,
        ).toBeGreaterThan(0);
        for (const member of battle.party) {
          expect(
            creatures[member.creatureId],
            `${trainer.id} has unknown creature ${member.creatureId}`,
          ).toBeDefined();
          expect(member.level).toBeGreaterThan(0);
        }
      }
    }
  });

  it("keeps one-time interactives supplied with follow-up text", () => {
    for (const map of Object.values(maps)) {
      for (const interactive of map.interactives) {
        if (interactive.once) {
          expect(
            interactive.collectedLines?.length,
            `${map.id}:${interactive.id} should have collected text`,
          ).toBeTruthy();
        }
      }
    }
  });
});
