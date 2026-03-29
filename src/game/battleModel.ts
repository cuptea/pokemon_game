import { DIFFICULTY_RULES } from "./theme";
import type {
  CreatureDefinition,
  GameDifficulty,
  MoveDefinition,
  TrainerPartyMember,
  WildEncounterDefinition,
} from "../types/world";

export type RuntimeCreature = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  moveName: string;
  movePower: number;
  color: number;
  level: number;
};

type CreatureRegistry = {
  creatures: Record<string, CreatureDefinition>;
  moves: Record<string, MoveDefinition>;
};

export function buildRuntimeCreature(
  creatureId: string,
  creatureRegistry: CreatureRegistry,
  level = 5,
): RuntimeCreature {
  const creature = creatureRegistry.creatures[creatureId];
  const move = creatureRegistry.moves[creature.moveId];

  return {
    id: creature.id,
    name: creature.name,
    hp: creature.maxHp,
    maxHp: creature.maxHp,
    attack: creature.attack,
    defense: creature.defense,
    moveName: move.name,
    movePower: move.power,
    color: creature.color,
    level,
  };
}

export function buildTrainerRuntimeCreature(
  member: TrainerPartyMember,
  creatureRegistry: CreatureRegistry,
): RuntimeCreature {
  return buildRuntimeCreature(member.creatureId, creatureRegistry, member.level);
}

export function buildWildRuntimeCreature(
  member: WildEncounterDefinition,
  creatureRegistry: CreatureRegistry,
): RuntimeCreature {
  return buildRuntimeCreature(member.creatureId, creatureRegistry, member.level);
}

export function calculateBattleDamage(
  attacker: RuntimeCreature,
  defender: RuntimeCreature,
  difficulty: GameDifficulty,
  attackerSide: "player" | "enemy",
): number {
  const difficultyMultiplier =
    attackerSide === "enemy" ? DIFFICULTY_RULES[difficulty].enemyAttackMultiplier : 1;

  return Math.max(
    2,
    Math.round((attacker.attack + attacker.movePower - defender.defense) * difficultyMultiplier),
  );
}
