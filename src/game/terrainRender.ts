import type { WorldPatch } from "../types/world";

export const WATER_TONES = new Set([
  0x89d2dc,
  0x5fa8d3,
  0x7ec8e3,
  0x95d5e8,
  0xa9def9,
  0x4f83aa,
  0x5688b8,
  0x90caf9,
  0x90e0ef,
  0xb3e5fc,
  0xbde0fe,
  0xd9f0ff,
]);

const GRASS_TONES = new Set([
  0x29543a,
  0x314d33,
  0x355f39,
  0x386641,
  0x3e7b47,
  0x3f8f54,
  0x427e54,
  0x4d7c3f,
  0x557a46,
  0x5f8f4d,
  0x63a45d,
  0x6a994e,
  0x7ec850,
  0x7fb069,
  0x80ed99,
  0x84a98c,
  0x95d86e,
  0x96f2a8,
  0xb7e4c7,
  0xcaffbf,
]);

const PATH_TONES = new Set([
  0x4a2819,
  0x4a3127,
  0x5b3a29,
  0x5c4033,
  0x6b3f2a,
  0x6d4c41,
  0x7b5e3b,
  0x7f5539,
  0x8b5a2b,
  0x8d6e63,
  0x9c5c2b,
  0xa1887f,
  0xa44a3f,
  0xb08d57,
  0xb08968,
  0xb86b35,
  0xbc6c25,
  0xc48a52,
  0xc8a66b,
  0xc8b27a,
  0xc97d60,
  0xd3b17d,
  0xd4a373,
  0xe5c992,
  0xe76f51,
  0xe9c46a,
  0xf4a261,
  0xff7b54,
  0xffb703,
  0xffc300,
  0xffd166,
  0xffd6a5,
  0xffddd2,
  0xffe066,
]);

const STONE_TONES = new Set([
  0x5c7c99,
  0x84a59d,
  0x8d6e63,
  0xa1887f,
  0xb7b7a4,
  0xbee3db,
  0xcce3de,
  0xd7ccc8,
  0xede0d4,
  0xfefae0,
]);

const BLOSSOM_TONES = new Set([0x80ed99, 0x96f2a8, 0x95d86e, 0xb7e4c7, 0xcaffbf]);

export type TerrainTextureKey =
  | "tt_grass_base"
  | "tt_grass_alt"
  | "tt_grass_blossom"
  | "tt_path_fill"
  | "tt_stone_block";

type TerrainStyle = {
  textureKey: TerrainTextureKey | null;
  overlayAlpha: number;
};

export function isWaterTone(color: number): boolean {
  return WATER_TONES.has(color);
}

export function getTerrainStyle(mapId: string, patch: WorldPatch): TerrainStyle {
  if (isWaterTone(patch.color)) {
    return { textureKey: null, overlayAlpha: 0 };
  }

  if (mapId.includes("interior")) {
    return { textureKey: "tt_stone_block", overlayAlpha: getOverlayAlpha(patch) };
  }

  if (STONE_TONES.has(patch.color)) {
    return { textureKey: "tt_stone_block", overlayAlpha: getOverlayAlpha(patch) };
  }

  if (PATH_TONES.has(patch.color) || patch.color === 0xede0d4) {
    return { textureKey: "tt_path_fill", overlayAlpha: getOverlayAlpha(patch) };
  }

  if (GRASS_TONES.has(patch.color) || inferAsGrass(patch.color)) {
    return { textureKey: getGrassTextureKey(patch), overlayAlpha: getOverlayAlpha(patch) };
  }

  return { textureKey: "tt_path_fill", overlayAlpha: getOverlayAlpha(patch) };
}

function getGrassTextureKey(patch: WorldPatch): TerrainTextureKey {
  if (BLOSSOM_TONES.has(patch.color)) {
    return "tt_grass_blossom";
  }

  const patternSeed =
    Math.floor(patch.x / 48) + Math.floor(patch.y / 48) + Math.floor(patch.width / 64);

  return patternSeed % 2 === 0 ? "tt_grass_base" : "tt_grass_alt";
}

function getOverlayAlpha(patch: WorldPatch): number {
  if (patch.alpha === undefined) {
    return 0;
  }

  return Math.min(0.24, Math.max(0.08, patch.alpha * 0.55));
}

function inferAsGrass(color: number): boolean {
  const red = (color >> 16) & 0xff;
  const green = (color >> 8) & 0xff;
  const blue = color & 0xff;

  return green >= red && green >= blue;
}
