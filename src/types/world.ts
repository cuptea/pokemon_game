export type Facing = "up" | "down" | "left" | "right";
export type PlayerAvatar = "blaze" | "mist" | "grove";
export type GameDifficulty = "casual" | "adventure" | "heroic";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MoveDefinition = {
  id: string;
  name: string;
  power: number;
};

export type CreatureDefinition = {
  id: string;
  name: string;
  maxHp: number;
  attack: number;
  defense: number;
  moveId: string;
  color: number;
};

export type TrainerPartyMember = {
  creatureId: string;
  level: number;
};

export type WildEncounterDefinition = {
  creatureId: string;
  level: number;
  zoneLabel: string;
};

export type TrainerBattleDefinition = {
  id: string;
  intro: string;
  reward: string;
  party: TrainerPartyMember[];
};

export type WorldPatch = Rect & {
  color: number;
  strokeColor?: number;
  alpha?: number;
};

export type DecorationPlacement = {
  id: string;
  textureKey: string;
  x: number;
  y: number;
  tint?: number;
  scale?: number;
  alpha?: number;
};

export type NpcPlacement = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: number;
  storyKey?: string;
  lines: string[];
  defeatedLines?: string[];
  battleId?: string;
};

export type TrainerPlacement = {
  id: string;
  name: string;
  trainerClass: string;
  x: number;
  y: number;
  color: number;
  lines: string[];
  battleId: string;
  defeatedLines: string[];
};

export type InteractablePlacement = {
  id: string;
  kind: "sign" | "loot" | "quest";
  name: string;
  x: number;
  y: number;
  textureKey: string;
  tint?: number;
  prompt: string;
  storyKey?: string;
  lines: string[];
  collectedLines?: string[];
  once?: boolean;
};

export type ExitDefinition = Rect & {
  id: string;
  prompt: string;
  targetMapId: string;
  targetSpawnId: string;
};

export type EncounterSlot = {
  creatureId: string;
  weight: number;
  minLevel: number;
  maxLevel: number;
};

export type EncounterTable = {
  id: string;
  biome: "plains" | "forest" | "lake";
  slots: EncounterSlot[];
};

export type EncounterZone = Rect & {
  id: string;
  tableId: string;
  label: string;
};

export type SpawnPoint = {
  id: string;
  x: number;
  y: number;
};

export type MapModule = {
  id: string;
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  patches: WorldPatch[];
  walls: Rect[];
  decorations: DecorationPlacement[];
  encounterZones: EncounterZone[];
  npcs: NpcPlacement[];
  trainers: TrainerPlacement[];
  interactives: InteractablePlacement[];
  exits: ExitDefinition[];
  spawnPoints: Record<string, SpawnPoint>;
};

export type BattleResult = {
  battleId?: string;
  outcome: "win" | "lose" | "escape";
  source: "trainer" | "wild";
  encounteredCreatureId?: string;
};

export type WorldState = {
  currentMapId: string;
  currentSpawnId: string;
  defeatedBattles: Record<string, boolean>;
  collectedInteractives: Record<string, boolean>;
  selectedAvatar: PlayerAvatar;
  selectedDifficulty: GameDifficulty;
  introCompleted: boolean;
};
