import { registry } from "./registry";

export type QuizChoice = {
  id: string;
  label: string;
  isCorrect: boolean;
};

export type BattleQuizQuestion = {
  id: string;
  prompt: string;
  choices: QuizChoice[];
};

type BattleQuizParams = {
  battleSource: "trainer" | "wild";
  playerMoveName: string;
  enemyCreatureId: string;
};

function makeChoices(correct: string, wrong: string[]): QuizChoice[] {
  return [correct, ...wrong].map((label, index) => ({
    id: `choice-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
    isCorrect: label === correct,
  }));
}

export function buildBattleQuizQuestions(params: BattleQuizParams): BattleQuizQuestion[] {
  const enemyCreature = registry.creatures[params.enemyCreatureId];
  const moveNames = Object.values(registry.moves)
    .map((move) => move.name)
    .filter((name) => name !== params.playerMoveName);
  const creatureNames = Object.values(registry.creatures)
    .map((creature) => creature.name)
    .filter((name) => name !== enemyCreature.name);

  return [
    {
      id: "player-move",
      prompt: "Which move is your ally preparing right now?",
      choices: makeChoices(params.playerMoveName, moveNames.slice(0, 2)),
    },
    {
      id: "enemy-name",
      prompt: "Which creature is standing across from you?",
      choices: makeChoices(enemyCreature.name, creatureNames.slice(0, 2)),
    },
    {
      id: "battle-type",
      prompt: "What kind of battle are you in?",
      choices: makeChoices(
        params.battleSource === "wild" ? "Wild encounter" : "Trainer battle",
        params.battleSource === "wild"
          ? ["Trainer battle", "Town conversation"]
          : ["Wild encounter", "Map transition"],
      ),
    },
    {
      id: "retreat-action",
      prompt: "Which action lets you step out of battle?",
      choices: makeChoices("Run", ["Guard", "Inventory"]),
    },
  ];
}

export function pickBattleQuizQuestion(
  params: BattleQuizParams,
  rng: () => number = Math.random,
): BattleQuizQuestion {
  const questions = buildBattleQuizQuestions(params);
  const question = questions[Math.floor(rng() * questions.length)];
  const choices = [...question.choices]
    .map((choice) => ({ choice, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.choice);

  return {
    ...question,
    choices,
  };
}
