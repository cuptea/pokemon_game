import tiledMap from "./mossgrove_town.tiled.json";
import {
  importAnchors,
  importDecorations,
  importExits,
  importMapBase,
  importPatches,
  importRects,
  importSpawnPoints,
  mergeAnchorsWithData,
  type TiledMap,
} from "./importTiledMap";
import type {
  InteractablePlacement,
  MapModule,
  NpcPlacement,
  TrainerPlacement,
} from "../../types/world";

const mossgroveTownTiled = tiledMap as TiledMap;

const mossgroveNpcData: Record<string, Omit<NpcPlacement, "id" | "x" | "y">> = {
  "mentor-liora": {
    name: "Mentor Liora",
    color: 0xffd166,
    storyKey: "mentor_path",
    lines: [
      "Welcome to Mossgrove.",
      "Routes, forest, and the lake all branch from here.",
      "Press E and I will test your first battle.",
    ],
    defeatedLines: [
      "Now go east and start mapping the region for yourself.",
      "The signboard near the square tracks small town requests.",
    ],
    battleId: "mentorBattle",
  },
  "town-healer": {
    name: "Healer Mira",
    color: 0xffcad4,
    storyKey: "healer_hint",
    lines: [
      "Your team looks fresh.",
      "A proper heal-and-rest loop is next on the town upgrade list.",
    ],
  },
  "storyteller-elm": {
    name: "Storyteller Elm",
    color: 0xb7b7a4,
    storyKey: "storyteller_watchtower",
    lines: [
      "That old watchtower marks the road to bigger routes.",
      "Every early map should teach you where to go at a glance.",
    ],
  },
  "dockhand-piers": {
    name: "Dockhand Piers",
    color: 0xbde0fe,
    lines: [
      "The ferry crew keeps staring east like the route will answer them back.",
      "If you make the road safer, Silvermere will feel connected again.",
    ],
  },
  "apprentice-fen": {
    name: "Apprentice Fen",
    color: 0xa0c4ff,
    lines: [
      "Mentor Liora says strong trainers learn by reading the route as much as battling on it.",
      "The bridge, reeds, and hidden grove all point toward bigger places beyond this slice.",
    ],
  },
};

const mossgroveInteractiveData: Record<
  string,
  Omit<InteractablePlacement, "id" | "x" | "y">
> = {
  town_board: {
    kind: "quest",
    name: "Town Notice Board",
    textureKey: "quest",
    markerLabel: "QUEST",
    prompt: "Press E to read the Mossgrove notice board",
    storyKey: "town_board_story",
    lines: [
      "Notice Board: Help the lake ferry reopen by proving the eastern routes are safe.",
    ],
    collectedLines: [
      "Notice Board: Ferry route request accepted. The lake path will matter more soon.",
    ],
    once: true,
  },
  town_supply_crate: {
    kind: "loot",
    name: "Supply Crate",
    textureKey: "loot",
    markerLabel: "LOOT",
    prompt: "Press E to inspect the supply crate",
    lines: [
      "You found a trail ration. It is not usable yet, but it makes the town feel stocked for travel.",
    ],
    collectedLines: ["The supply crate is empty now."],
    once: true,
  },
  town_tower_plaque: {
    kind: "sign",
    name: "Watchtower Plaque",
    textureKey: "sign",
    markerLabel: "READ",
    prompt: "Press E to inspect the watchtower plaque",
    lines: [
      "Plaque: Mossgrove Watch once marked the road toward the mountain gate, the ferry dock, and the old castle route beyond the early fields.",
    ],
  },
};

export const mossgroveTownMap: MapModule = createMossgroveTownMap();

function createMossgroveTownMap(): MapModule {
  const base = importMapBase(mossgroveTownTiled);

  return {
    id: base.id,
    title: base.title,
    width: base.width,
    height: base.height,
    backgroundColor: base.backgroundColor,
    patches: importPatches(mossgroveTownTiled, "terrain"),
    walls: importRects(mossgroveTownTiled, "collisions"),
    decorations: importDecorations(mossgroveTownTiled, "decorations"),
    encounterZones: [],
    npcs: mergeAnchorsWithData(importAnchors(mossgroveTownTiled, "npcs"), mossgroveNpcData),
    trainers: [] as TrainerPlacement[],
    interactives: mergeAnchorsWithData(
      importAnchors(mossgroveTownTiled, "interactives"),
      mossgroveInteractiveData,
    ),
    exits: importExits(mossgroveTownTiled, "exits"),
    spawnPoints: importSpawnPoints(mossgroveTownTiled, "spawns"),
  };
}
