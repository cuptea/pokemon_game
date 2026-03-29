import type { EncounterTable } from "../types/world";
import { storyEncounterTables } from "./storyEncounters";

export const encounterTables: Record<string, EncounterTable> = {
  plains_start: {
    id: "plains_start",
    biome: "plains",
    slots: [
      { creatureId: "spriglet", weight: 28, minLevel: 2, maxLevel: 4 },
      { creatureId: "mosslet", weight: 26, minLevel: 2, maxLevel: 4 },
      { creatureId: "puddlepup", weight: 18, minLevel: 2, maxLevel: 3 },
      { creatureId: "gullip", weight: 12, minLevel: 2, maxLevel: 4 },
      { creatureId: "sparkbud", weight: 8, minLevel: 3, maxLevel: 4 },
      { creatureId: "cindercub", weight: 8, minLevel: 3, maxLevel: 4 },
    ],
  },
  plains_watch: {
    id: "plains_watch",
    biome: "plains",
    slots: [
      { creatureId: "sparkbud", weight: 22, minLevel: 3, maxLevel: 5 },
      { creatureId: "cindercub", weight: 20, minLevel: 3, maxLevel: 5 },
      { creatureId: "gullip", weight: 18, minLevel: 3, maxLevel: 5 },
      { creatureId: "mosslet", weight: 18, minLevel: 3, maxLevel: 5 },
      { creatureId: "spriglet", weight: 12, minLevel: 3, maxLevel: 4 },
      { creatureId: "puddlepup", weight: 10, minLevel: 3, maxLevel: 4 },
    ],
  },
  forest_edge: {
    id: "forest_edge",
    biome: "forest",
    slots: [
      { creatureId: "mosslet", weight: 24, minLevel: 3, maxLevel: 5 },
      { creatureId: "thornibee", weight: 22, minLevel: 3, maxLevel: 5 },
      { creatureId: "puddlepup", weight: 15, minLevel: 3, maxLevel: 5 },
      { creatureId: "shadekit", weight: 15, minLevel: 4, maxLevel: 5 },
      { creatureId: "glimmoth", weight: 14, minLevel: 4, maxLevel: 5 },
      { creatureId: "bramblear", weight: 10, minLevel: 4, maxLevel: 5 },
    ],
  },
  forest_deep: {
    id: "forest_deep",
    biome: "forest",
    slots: [
      { creatureId: "thornibee", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "shadekit", weight: 20, minLevel: 4, maxLevel: 6 },
      { creatureId: "glimmoth", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "bramblear", weight: 20, minLevel: 4, maxLevel: 6 },
      { creatureId: "murkwing", weight: 14, minLevel: 4, maxLevel: 6 },
      { creatureId: "sparkbud", weight: 10, minLevel: 4, maxLevel: 5 },
    ],
  },
  lake_shore: {
    id: "lake_shore",
    biome: "lake",
    slots: [
      { creatureId: "puddlepup", weight: 26, minLevel: 3, maxLevel: 5 },
      { creatureId: "gullip", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "reedfin", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "brookeel", weight: 16, minLevel: 4, maxLevel: 6 },
      { creatureId: "spriglet", weight: 12, minLevel: 3, maxLevel: 5 },
      { creatureId: "shadekit", weight: 10, minLevel: 4, maxLevel: 6 },
    ],
  },
  lake_deep: {
    id: "lake_deep",
    biome: "lake",
    slots: [
      { creatureId: "reedfin", weight: 24, minLevel: 4, maxLevel: 6 },
      { creatureId: "brookeel", weight: 22, minLevel: 4, maxLevel: 6 },
      { creatureId: "gullip", weight: 16, minLevel: 4, maxLevel: 6 },
      { creatureId: "puddlepup", weight: 14, minLevel: 4, maxLevel: 5 },
      { creatureId: "murkwing", weight: 12, minLevel: 4, maxLevel: 6 },
      { creatureId: "shadekit", weight: 12, minLevel: 4, maxLevel: 6 },
    ],
  },
  grove_rare: {
    id: "grove_rare",
    biome: "forest",
    slots: [
      { creatureId: "shadekit", weight: 20, minLevel: 4, maxLevel: 6 },
      { creatureId: "glimmoth", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "bramblear", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "murkwing", weight: 16, minLevel: 4, maxLevel: 6 },
      { creatureId: "sparkbud", weight: 18, minLevel: 4, maxLevel: 6 },
      { creatureId: "cindercub", weight: 10, minLevel: 5, maxLevel: 6 },
    ],
  },
  ...storyEncounterTables,
};
