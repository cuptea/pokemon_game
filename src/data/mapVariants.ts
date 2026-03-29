import type {
  DecorationPlacement,
  ExitDefinition,
  HeroMapOverride,
  InteractablePlacement,
  MapModule,
  PlayerAvatar,
  WorldPatch,
} from "../types/world";

type HeroMapVariant = {
  heroBackgroundColor?: Partial<Record<PlayerAvatar, string>>;
  heroPatches: Partial<Record<PlayerAvatar, WorldPatch[]>>;
  heroDecorations: Partial<Record<PlayerAvatar, DecorationPlacement[]>>;
  heroInteractives?: Partial<Record<PlayerAvatar, HeroMapOverride<InteractablePlacement>>>;
  heroExits?: Partial<Record<PlayerAvatar, HeroMapOverride<ExitDefinition>>>;
};

export const heroMapVariants: Record<string, HeroMapVariant> = {
  mossgrove_town: {
    heroBackgroundColor: {
      blaze: "#6f4a35",
      mist: "#5a8aa7",
      grove: "#496b46",
    },
    heroPatches: {
      blaze: [
        { x: 1180, y: 320, width: 160, height: 620, color: 0xb86b35, strokeColor: 0xffb703, alpha: 0.5 },
        { x: 1340, y: 460, width: 120, height: 220, color: 0xa44a3f, strokeColor: 0xff7b54, alpha: 0.45 },
      ],
      mist: [
        { x: 1320, y: 420, width: 150, height: 290, color: 0x5fa8d3, strokeColor: 0xd9f0ff, alpha: 0.4 },
        { x: 920, y: 720, width: 250, height: 90, color: 0x95d5e8, strokeColor: 0xbde0fe, alpha: 0.34 },
      ],
      grove: [
        { x: 860, y: 820, width: 420, height: 170, color: 0x5f8f4d, strokeColor: 0xcaffbf, alpha: 0.42 },
        { x: 180, y: 690, width: 360, height: 180, color: 0x6a994e, strokeColor: 0xb7e4c7, alpha: 0.34 },
      ],
    },
    heroDecorations: {
      blaze: [
        { id: "blaze_town_signal", textureKey: "tower", x: 1360, y: 790, tint: 0xffb703, alpha: 0.55, scale: 0.8 },
        { id: "blaze_town_flare_sign", textureKey: "sign", x: 1160, y: 610, tint: 0xffd166 },
      ],
      mist: [
        { id: "mist_town_reed_post", textureKey: "dock", x: 1340, y: 660, tint: 0xd9f0ff, alpha: 0.88 },
        { id: "mist_town_ferry_sign", textureKey: "sign", x: 1250, y: 600, tint: 0xbde0fe },
      ],
      grove: [
        { id: "grove_town_shrine_marker", textureKey: "sign", x: 980, y: 840, tint: 0xcaffbf },
        { id: "grove_town_root_tree", textureKey: "tree", x: 890, y: 980, tint: 0x84a98c, scale: 1.12 },
      ],
    },
    heroInteractives: {
      blaze: [
        { id: "town_board", markerLabel: "EMBER LEAD", markerTint: 0xffb703, markerFill: 0x4a2819 },
      ],
      mist: [
        { id: "town_board", markerLabel: "FERRY CLUE", markerTint: 0xbde0fe, markerFill: 0x18304b },
      ],
      grove: [
        { id: "town_board", markerLabel: "FOREST LEAD", markerTint: 0xcaffbf, markerFill: 0x1f3a24 },
      ],
    },
    heroExits: {
      blaze: [
        { id: "town_to_route", markerLabel: "EMBER ROAD", markerTint: 0xffb703, markerFill: 0x4a2819 },
      ],
      mist: [
        { id: "town_to_route", markerLabel: "SILVER ROAD", markerTint: 0xbde0fe, markerFill: 0x18304b },
      ],
      grove: [
        { id: "town_to_route", markerLabel: "ROOT ROAD", markerTint: 0xcaffbf, markerFill: 0x1f3a24 },
      ],
    },
  },
  route_01_fields: {
    heroBackgroundColor: {
      blaze: "#7e5a34",
      mist: "#6693a6",
      grove: "#51784b",
    },
    heroPatches: {
      blaze: [
        { x: 1600, y: 220, width: 390, height: 210, color: 0x9c5c2b, strokeColor: 0xffb703, alpha: 0.34 },
        { x: 1210, y: 120, width: 120, height: 320, color: 0xc48a52, strokeColor: 0xffd166, alpha: 0.3 },
      ],
      mist: [
        { x: 1280, y: 140, width: 300, height: 320, color: 0x5fa8d3, strokeColor: 0xd9f0ff, alpha: 0.32 },
        { x: 760, y: 220, width: 500, height: 120, color: 0x95d5e8, strokeColor: 0xbde0fe, alpha: 0.22 },
      ],
      grove: [
        { x: 1450, y: 700, width: 390, height: 280, color: 0x557a46, strokeColor: 0xcaffbf, alpha: 0.34 },
        { x: 190, y: 280, width: 450, height: 260, color: 0x6a994e, strokeColor: 0xb7e4c7, alpha: 0.24 },
      ],
    },
    heroDecorations: {
      blaze: [
        { id: "blaze_route_beacon", textureKey: "tower", x: 1760, y: 470, tint: 0xffb703, alpha: 0.7, scale: 0.8 },
        { id: "blaze_route_warning", textureKey: "sign", x: 1320, y: 460, tint: 0xffd166 },
      ],
      mist: [
        { id: "mist_route_dock_post", textureKey: "dock", x: 1310, y: 470, tint: 0xd9f0ff },
        { id: "mist_route_water_sign", textureKey: "sign", x: 1420, y: 370, tint: 0xbde0fe },
      ],
      grove: [
        { id: "grove_route_root_marker", textureKey: "sign", x: 1710, y: 1010, tint: 0xcaffbf },
        { id: "grove_route_tree_extra", textureKey: "tree", x: 1540, y: 1010, tint: 0x84a98c, scale: 1.06 },
      ],
    },
    heroInteractives: {
      blaze: [
        { id: "route_signpost", markerLabel: "EMBER TRACE", markerTint: 0xffd166, markerFill: 0x4a2819 },
      ],
      mist: [
        { id: "route_signpost", markerLabel: "CURRENT SIGN", markerTint: 0xbde0fe, markerFill: 0x18304b },
      ],
      grove: [
        { id: "route_signpost", markerLabel: "OLD PATH", markerTint: 0xcaffbf, markerFill: 0x1f3a24 },
      ],
    },
    heroExits: {
      blaze: [
        { id: "route_to_forest", markerLabel: "EMBER PATH", markerTint: 0xffb703, markerFill: 0x4a2819 },
      ],
      mist: [
        { id: "route_to_lake", markerLabel: "FERRY WAY", markerTint: 0xbde0fe, markerFill: 0x18304b },
      ],
      grove: [
        { id: "route_to_grove", markerLabel: "ROOT TRAIL", markerTint: 0xcaffbf, markerFill: 0x1f3a24 },
      ],
    },
  },
  forest_01_glen: {
    heroBackgroundColor: {
      blaze: "#5b4733",
      mist: "#3f6a73",
      grove: "#31533a",
    },
    heroPatches: {
      blaze: [
        { x: 1540, y: 760, width: 350, height: 220, color: 0x7b5e3b, strokeColor: 0xffb703, alpha: 0.3 },
        { x: 980, y: 200, width: 500, height: 120, color: 0x9c5c2b, strokeColor: 0xffd166, alpha: 0.24 },
      ],
      mist: [
        { x: 1040, y: 180, width: 450, height: 310, color: 0x5fa8d3, strokeColor: 0xd9f0ff, alpha: 0.18 },
        { x: 700, y: 470, width: 320, height: 150, color: 0x95d5e8, strokeColor: 0xbde0fe, alpha: 0.2 },
      ],
      grove: [
        { x: 420, y: 900, width: 360, height: 170, color: 0x4d7c3f, strokeColor: 0xcaffbf, alpha: 0.3 },
        { x: 180, y: 220, width: 520, height: 310, color: 0x6a994e, strokeColor: 0xb7e4c7, alpha: 0.2 },
      ],
    },
    heroDecorations: {
      blaze: [
        { id: "blaze_forest_watch_sign", textureKey: "sign", x: 1540, y: 690, tint: 0xffd166 },
        { id: "blaze_forest_beacon", textureKey: "tower", x: 1760, y: 860, tint: 0xffb703, alpha: 0.46, scale: 0.76 },
      ],
      mist: [
        { id: "mist_forest_pool_sign", textureKey: "sign", x: 1300, y: 520, tint: 0xbde0fe },
        { id: "mist_forest_dock_hint", textureKey: "dock", x: 1470, y: 570, tint: 0xd9f0ff, alpha: 0.75 },
      ],
      grove: [
        { id: "grove_forest_shrine_sign", textureKey: "sign", x: 1740, y: 1090, tint: 0xcaffbf },
        { id: "grove_forest_tree_extra", textureKey: "tree", x: 700, y: 1110, tint: 0x84a98c, scale: 1.08 },
      ],
    },
  },
  lake_edge_01: {
    heroBackgroundColor: {
      blaze: "#8f7754",
      mist: "#6aa6ca",
      grove: "#648c67",
    },
    heroPatches: {
      blaze: [
        { x: 740, y: 0, width: 140, height: 1100, color: 0xa44a3f, strokeColor: 0xffb703, alpha: 0.18 },
        { x: 250, y: 290, width: 270, height: 200, color: 0xb86b35, strokeColor: 0xffd166, alpha: 0.18 },
      ],
      mist: [
        { x: 780, y: 0, width: 120, height: 1100, color: 0xd9f0ff, strokeColor: 0xbde0fe, alpha: 0.2 },
        { x: 420, y: 620, width: 260, height: 190, color: 0x95d5e8, strokeColor: 0xd9f0ff, alpha: 0.24 },
      ],
      grove: [
        { x: 210, y: 280, width: 320, height: 220, color: 0x6a994e, strokeColor: 0xb7e4c7, alpha: 0.16 },
        { x: 410, y: 620, width: 250, height: 190, color: 0x557a46, strokeColor: 0xcaffbf, alpha: 0.18 },
      ],
    },
    heroDecorations: {
      blaze: [
        { id: "blaze_lake_warning_sign", textureKey: "sign", x: 350, y: 470, tint: 0xffd166 },
      ],
      mist: [
        { id: "mist_lake_buoy", textureKey: "dock", x: 660, y: 470, tint: 0xd9f0ff, alpha: 0.78 },
        { id: "mist_lake_signal", textureKey: "sign", x: 580, y: 910, tint: 0xbde0fe },
      ],
      grove: [
        { id: "grove_lake_root_marker", textureKey: "sign", x: 300, y: 900, tint: 0xcaffbf },
        { id: "grove_lake_tree_extra", textureKey: "tree", x: 520, y: 910, tint: 0x84a98c, scale: 1.02 },
      ],
    },
  },
  sidepath_01_hidden_grove: {
    heroBackgroundColor: {
      blaze: "#5f4a39",
      mist: "#466778",
      grove: "#2f5a3a",
    },
    heroPatches: {
      blaze: [
        { x: 330, y: 210, width: 360, height: 220, color: 0x7b5e3b, strokeColor: 0xffb703, alpha: 0.24 },
      ],
      mist: [
        { x: 760, y: 500, width: 250, height: 190, color: 0x95d5e8, strokeColor: 0xd9f0ff, alpha: 0.22 },
      ],
      grove: [
        { x: 160, y: 400, width: 780, height: 120, color: 0x557a46, strokeColor: 0xcaffbf, alpha: 0.26 },
        { x: 340, y: 220, width: 350, height: 220, color: 0x6a994e, strokeColor: 0xb7e4c7, alpha: 0.18 },
      ],
    },
    heroDecorations: {
      blaze: [
        { id: "blaze_grove_ember_sign", textureKey: "sign", x: 620, y: 300, tint: 0xffd166 },
      ],
      mist: [
        { id: "mist_grove_pool_marker", textureKey: "sign", x: 900, y: 420, tint: 0xbde0fe },
      ],
      grove: [
        { id: "grove_hidden_shrine_sign", textureKey: "sign", x: 300, y: 620, tint: 0xcaffbf },
        { id: "grove_hidden_tree_extra", textureKey: "tree", x: 560, y: 720, tint: 0x84a98c, scale: 1.08 },
      ],
    },
  },
};

export function applyHeroMapVariants(maps: Record<string, MapModule>): Record<string, MapModule> {
  for (const [mapId, variants] of Object.entries(heroMapVariants)) {
    const map = maps[mapId];
    if (!map) {
      continue;
    }

    map.heroBackgroundColor = variants.heroBackgroundColor;
    map.heroPatches = variants.heroPatches;
    map.heroDecorations = variants.heroDecorations;
    map.heroInteractives = variants.heroInteractives;
    map.heroExits = variants.heroExits;
  }

  return maps;
}
