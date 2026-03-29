export const GAME_FONT = '"Trebuchet MS", Verdana, sans-serif';

export const THEME = {
  panelFill: 0x10243b,
  panelStroke: 0x9cc7d8,
  promptFill: 0x17304b,
  battleFill: 0x07131f,
  accent: 0xf6bd60,
  accentAlt: 0x84dcc6,
  success: 0x95d5b2,
  danger: 0xff6b6b,
  text: "#f8f9fa",
  textMuted: "#d9f0ff",
  textDark: "#08131f",
  shadow: 0x08131f,
};

export const ASSET_STACK = {
  overworld: "Kenney Tiny Town",
  interiors: "Kenney Tiny Dungeon",
  ui: "Kenney UI Pack - Pixel Adventure",
  creatures: "OpenGameArt 50+ Monsters Pack 2D",
  items: "Kettoman RPG Essentials 16x16",
};

export const DIFFICULTY_RULES = {
  casual: {
    label: "CASUAL",
    enemyAttackMultiplier: 0.85,
    encounterRateMultiplier: 0.75,
    bannerColor: 0x95d5b2,
  },
  adventure: {
    label: "ADVENTURE",
    enemyAttackMultiplier: 1,
    encounterRateMultiplier: 1,
    bannerColor: 0xf6bd60,
  },
  heroic: {
    label: "HEROIC",
    enemyAttackMultiplier: 1.2,
    encounterRateMultiplier: 1.2,
    bannerColor: 0xff6b6b,
  },
} as const;

export const PLAYER_AVATARS = {
  blaze: { label: "BLAZE", textureKey: "player_blaze", color: 0xff8f4a },
  mist: { label: "MIST", textureKey: "player_mist", color: 0x58a6ff },
  grove: { label: "GROVE", textureKey: "player_grove", color: 0x6bd66b },
} as const;
