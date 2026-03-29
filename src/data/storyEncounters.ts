import type { EncounterTable } from "../types/world";

export const storyEncounterTables: Record<string, EncounterTable> = {
  ember_watch: {
    id: "ember_watch",
    biome: "plains",
    slots: [
      { creatureId: "sparkbud", weight: 26, minLevel: 6, maxLevel: 8 },
      { creatureId: "cindercub", weight: 24, minLevel: 6, maxLevel: 8 },
      { creatureId: "gullip", weight: 14, minLevel: 6, maxLevel: 7 },
      { creatureId: "murkwing", weight: 14, minLevel: 6, maxLevel: 8 },
      { creatureId: "thornibee", weight: 12, minLevel: 6, maxLevel: 7 },
      { creatureId: "spriglet", weight: 10, minLevel: 6, maxLevel: 7 },
    ],
  },
  cinder_quarry: {
    id: "cinder_quarry",
    biome: "plains",
    slots: [
      { creatureId: "cindercub", weight: 28, minLevel: 7, maxLevel: 9 },
      { creatureId: "sparkbud", weight: 22, minLevel: 7, maxLevel: 9 },
      { creatureId: "bramblear", weight: 16, minLevel: 7, maxLevel: 9 },
      { creatureId: "murkwing", weight: 14, minLevel: 7, maxLevel: 8 },
      { creatureId: "thornibee", weight: 10, minLevel: 7, maxLevel: 8 },
      { creatureId: "gullip", weight: 10, minLevel: 7, maxLevel: 8 },
    ],
  },
  mist_ferry: {
    id: "mist_ferry",
    biome: "lake",
    slots: [
      { creatureId: "puddlepup", weight: 20, minLevel: 6, maxLevel: 8 },
      { creatureId: "gullip", weight: 18, minLevel: 6, maxLevel: 8 },
      { creatureId: "reedfin", weight: 22, minLevel: 6, maxLevel: 8 },
      { creatureId: "brookeel", weight: 18, minLevel: 6, maxLevel: 8 },
      { creatureId: "shadekit", weight: 12, minLevel: 6, maxLevel: 8 },
      { creatureId: "murkwing", weight: 10, minLevel: 7, maxLevel: 8 },
    ],
  },
  mist_isles: {
    id: "mist_isles",
    biome: "lake",
    slots: [
      { creatureId: "brookeel", weight: 24, minLevel: 7, maxLevel: 9 },
      { creatureId: "reedfin", weight: 20, minLevel: 7, maxLevel: 9 },
      { creatureId: "gullip", weight: 16, minLevel: 7, maxLevel: 8 },
      { creatureId: "murkwing", weight: 16, minLevel: 7, maxLevel: 9 },
      { creatureId: "puddlepup", weight: 12, minLevel: 7, maxLevel: 8 },
      { creatureId: "shadekit", weight: 12, minLevel: 7, maxLevel: 9 },
    ],
  },
  grove_roots: {
    id: "grove_roots",
    biome: "forest",
    slots: [
      { creatureId: "mosslet", weight: 22, minLevel: 6, maxLevel: 8 },
      { creatureId: "thornibee", weight: 16, minLevel: 6, maxLevel: 8 },
      { creatureId: "glimmoth", weight: 18, minLevel: 6, maxLevel: 8 },
      { creatureId: "bramblear", weight: 20, minLevel: 6, maxLevel: 8 },
      { creatureId: "shadekit", weight: 14, minLevel: 6, maxLevel: 8 },
      { creatureId: "murkwing", weight: 10, minLevel: 7, maxLevel: 8 },
    ],
  },
  grove_shrine: {
    id: "grove_shrine",
    biome: "forest",
    slots: [
      { creatureId: "glimmoth", weight: 20, minLevel: 7, maxLevel: 9 },
      { creatureId: "bramblear", weight: 24, minLevel: 7, maxLevel: 9 },
      { creatureId: "shadekit", weight: 18, minLevel: 7, maxLevel: 9 },
      { creatureId: "murkwing", weight: 14, minLevel: 7, maxLevel: 9 },
      { creatureId: "mosslet", weight: 14, minLevel: 7, maxLevel: 8 },
      { creatureId: "thornibee", weight: 10, minLevel: 7, maxLevel: 8 },
    ],
  },
};
