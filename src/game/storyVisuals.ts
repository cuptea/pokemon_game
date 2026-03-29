import type { PlayerAvatar } from "../types/world";

export type StoryAtmosphereKind = "embers" | "mist" | "leaves";
export type StorySilhouetteKind = "ridge" | "water" | "roots";

export type StoryVisualTheme = {
  skyTop: number;
  skyBottom: number;
  haze: number;
  horizon: number;
  accent: number;
  accentSoft: number;
  overlayTexture: "ui_panel_warm" | "ui_panel_cool";
  atmosphere: StoryAtmosphereKind;
  silhouette: StorySilhouetteKind;
};

const AVATAR_VISUALS: Record<PlayerAvatar, StoryVisualTheme> = {
  blaze: {
    skyTop: 0x29131d,
    skyBottom: 0x6f3b25,
    haze: 0xf4a261,
    horizon: 0x3f1d13,
    accent: 0xffb703,
    accentSoft: 0xffd166,
    overlayTexture: "ui_panel_warm",
    atmosphere: "embers",
    silhouette: "ridge",
  },
  mist: {
    skyTop: 0x18304b,
    skyBottom: 0x4d7ea8,
    haze: 0xd9f0ff,
    horizon: 0x274766,
    accent: 0x89d2dc,
    accentSoft: 0xbde0fe,
    overlayTexture: "ui_panel_cool",
    atmosphere: "mist",
    silhouette: "water",
  },
  grove: {
    skyTop: 0x12281a,
    skyBottom: 0x355f39,
    haze: 0xb7e4c7,
    horizon: 0x1f3a24,
    accent: 0x95d5b2,
    accentSoft: 0xcaffbf,
    overlayTexture: "ui_panel_cool",
    atmosphere: "leaves",
    silhouette: "roots",
  },
};

export function getStoryVisualTheme(
  avatar: PlayerAvatar,
  mapId: string,
): StoryVisualTheme {
  const base = { ...AVATAR_VISUALS[avatar] };

  if (mapId.includes("lake") || mapId.includes("mist_") || mapId.includes("ferry")) {
    return {
      ...base,
      skyBottom: 0x5b93bc,
      haze: 0xd9f0ff,
      silhouette: "water",
      atmosphere: "mist",
      accentSoft: 0xd9f0ff,
    };
  }

  if (mapId.includes("grove") || mapId.includes("forest") || mapId.includes("shrine")) {
    return {
      ...base,
      skyBottom: avatar === "grove" ? 0x3f6c3f : base.skyBottom,
      silhouette: "roots",
      atmosphere: avatar === "blaze" ? "embers" : "leaves",
    };
  }

  if (mapId.includes("blaze_") || mapId.includes("quarry") || mapId.includes("ember")) {
    return {
      ...base,
      skyBottom: 0x7a3f25,
      haze: 0xffb703,
      silhouette: "ridge",
      atmosphere: "embers",
    };
  }

  return base;
}

export function toHexColor(value: number): string {
  return `#${value.toString(16).padStart(6, "0")}`;
}
