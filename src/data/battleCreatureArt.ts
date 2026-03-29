export type BattleCreatureArt = {
  frontKey: string;
  frontPath: string;
  backKey: string;
  backPath: string;
  enemyScale: number;
  playerScale: number;
  enemyOffsetX?: number;
  enemyOffsetY?: number;
  playerOffsetX?: number;
  playerOffsetY?: number;
};

type BattleCreatureTextureEntry = {
  key: string;
  path: string;
};

function monsterArt(
  monsterId: number,
  overrides: Partial<BattleCreatureArt> = {},
): BattleCreatureArt {
  return {
    frontKey: `monster_${monsterId}_front`,
    frontPath: `/assets/monsters/monster_${monsterId}_front.png`,
    backKey: `monster_${monsterId}_back`,
    backPath: `/assets/monsters/monster_${monsterId}_back.png`,
    enemyScale: 2.55,
    playerScale: 2.45,
    playerOffsetY: 8,
    ...overrides,
  };
}

export const battleCreatureArt: Record<string, BattleCreatureArt> = {
  spriglet: monsterArt(18, {
    enemyScale: 2.95,
    playerScale: 2.85,
    enemyOffsetY: -2,
    playerOffsetY: 8,
  }),
  puddlepup: monsterArt(30, {
    enemyScale: 2.45,
    playerScale: 2.35,
    enemyOffsetY: 6,
    playerOffsetY: 14,
  }),
  mosslet: monsterArt(55, {
    enemyScale: 2.8,
    playerScale: 2.7,
    enemyOffsetY: -8,
    playerOffsetY: 4,
  }),
  thornibee: monsterArt(6, {
    enemyScale: 2.9,
    playerScale: 2.8,
    enemyOffsetY: -10,
    playerOffsetY: -2,
  }),
  gullip: monsterArt(49, {
    enemyScale: 2.8,
    playerScale: 2.7,
    enemyOffsetY: -6,
    playerOffsetY: 4,
  }),
  reedfin: monsterArt(40, {
    enemyScale: 2.75,
    playerScale: 2.65,
    enemyOffsetY: -4,
    playerOffsetY: 2,
  }),
  sparkbud: monsterArt(36, {
    enemyScale: 2.7,
    playerScale: 2.6,
    enemyOffsetY: 2,
    playerOffsetY: 12,
  }),
  shadekit: monsterArt(39, {
    enemyScale: 2.8,
    playerScale: 2.7,
    enemyOffsetY: -6,
    playerOffsetY: 4,
  }),
  cindercub: monsterArt(18, {
    enemyScale: 2.85,
    playerScale: 2.75,
    enemyOffsetY: 0,
    playerOffsetY: 10,
  }),
  brookeel: monsterArt(47, {
    enemyScale: 2.95,
    playerScale: 2.85,
    enemyOffsetY: -6,
    playerOffsetY: 2,
  }),
  glimmoth: monsterArt(15, {
    enemyScale: 2.6,
    playerScale: 2.5,
    enemyOffsetY: -8,
    playerOffsetY: -2,
  }),
  bramblear: monsterArt(43, {
    enemyScale: 2.65,
    playerScale: 2.55,
    enemyOffsetY: 2,
    playerOffsetY: 10,
  }),
  murkwing: monsterArt(24, {
    enemyScale: 2.55,
    playerScale: 2.45,
    enemyOffsetY: 4,
    playerOffsetY: 12,
  }),
};

export function getBattleCreatureArt(creatureId: string): BattleCreatureArt | undefined {
  return battleCreatureArt[creatureId];
}

export const battleCreatureTextureEntries: BattleCreatureTextureEntry[] = Array.from(
  new Map(
    Object.values(battleCreatureArt).flatMap((art) => [
      [art.frontKey, { key: art.frontKey, path: art.frontPath }],
      [art.backKey, { key: art.backKey, path: art.backPath }],
    ]),
  ).values(),
);
