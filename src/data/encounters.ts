import type { EncounterTable } from "../types/world";

export const encounterTables: Record<string, EncounterTable> = {
  plains_start: {
    id: "plains_start",
    biome: "plains",
    slots: [
      { creatureId: "spriglet", weight: 40, minLevel: 2, maxLevel: 4 },
      { creatureId: "mosslet", weight: 35, minLevel: 2, maxLevel: 4 },
      { creatureId: "puddlepup", weight: 20, minLevel: 2, maxLevel: 3 },
      { creatureId: "sparkbud", weight: 5, minLevel: 3, maxLevel: 4 },
    ],
  },
  forest_edge: {
    id: "forest_edge",
    biome: "forest",
    slots: [
      { creatureId: "mosslet", weight: 35, minLevel: 3, maxLevel: 5 },
      { creatureId: "thornibee", weight: 30, minLevel: 3, maxLevel: 5 },
      { creatureId: "puddlepup", weight: 20, minLevel: 3, maxLevel: 5 },
      { creatureId: "shadekit", weight: 15, minLevel: 4, maxLevel: 5 },
    ],
  },
  lake_shore: {
    id: "lake_shore",
    biome: "lake",
    slots: [
      { creatureId: "puddlepup", weight: 40, minLevel: 3, maxLevel: 5 },
      { creatureId: "spriglet", weight: 20, minLevel: 3, maxLevel: 5 },
      { creatureId: "gullip", weight: 25, minLevel: 4, maxLevel: 6 },
      { creatureId: "reedfin", weight: 15, minLevel: 4, maxLevel: 6 },
    ],
  },
};
