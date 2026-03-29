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
  enemyMoveName: string;
  playerLevel: number;
  enemyLevel: number;
  enemyPartySize: number;
  enemyPartyIndex: number;
  excludeIds?: string[];
};

function makeChoices(correct: string, wrong: string[], fallback: string[] = []): QuizChoice[] {
  const uniqueWrong = [...new Set([...wrong, ...fallback])]
    .filter((label) => label !== correct)
    .slice(0, 2);

  return [correct, ...uniqueWrong].map((label, index) => ({
    id: `choice-${index}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
    isCorrect: label === correct,
  }));
}

export function buildBattleQuizQuestions(params: BattleQuizParams): BattleQuizQuestion[] {
  const enemyCreature = registry.creatures[params.enemyCreatureId];
  const moveNames = Object.values(registry.moves)
    .map((move) => move.name)
    .filter((name) => ![params.playerMoveName, params.enemyMoveName].includes(name));
  const creatureNames = Object.values(registry.creatures)
    .map((creature) => creature.name)
    .filter((name) => name !== enemyCreature.name);
  const levelWrong = [params.enemyLevel + 1, Math.max(1, params.enemyLevel - 1)].filter(
    (level) => level !== params.enemyLevel,
  );
  const playerLevelWrong = [params.playerLevel + 1, Math.max(1, params.playerLevel - 1)].filter(
    (level) => level !== params.playerLevel,
  );

  const questions: BattleQuizQuestion[] = [
    {
      id: "player-move",
      prompt: "Which move is your ally preparing right now?",
      choices: makeChoices(params.playerMoveName, moveNames.slice(0, 2), ["Gust", "Splash Jab"]),
    },
    {
      id: "enemy-move",
      prompt: "Which move is the foe most likely to answer with?",
      choices: makeChoices(params.enemyMoveName, moveNames.slice(0, 2), ["Gust", "Vine Snap"]),
    },
    {
      id: "enemy-name",
      prompt: "Which creature is standing across from you?",
      choices: makeChoices(enemyCreature.name, creatureNames.slice(0, 2), ["Spriglet", "Mosslet"]),
    },
    {
      id: "enemy-level",
      prompt: "What level is the current foe?",
      choices: makeChoices(
        `Lv ${params.enemyLevel}`,
        levelWrong.slice(0, 2).map((level) => `Lv ${level}`),
        ["Lv 2", "Lv 6"],
      ),
    },
    {
      id: "player-level",
      prompt: "What level is your allied creature?",
      choices: makeChoices(
        `Lv ${params.playerLevel}`,
        playerLevelWrong.slice(0, 2).map((level) => `Lv ${level}`),
        ["Lv 3", "Lv 7"],
      ),
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
      id: "foe-party",
      prompt: "How many creatures are in the opposing party right now?",
      choices: makeChoices(
        `${params.enemyPartySize}`,
        [Math.max(1, params.enemyPartySize - 1), params.enemyPartySize + 1].map(String),
        ["2", "3"],
      ),
    },
    {
      id: "foe-slot",
      prompt: "Which foe number is currently on the field?",
      choices: makeChoices(
        `${params.enemyPartyIndex + 1}`,
        [Math.max(1, params.enemyPartyIndex), params.enemyPartyIndex + 2].map(String),
        ["2", "3"],
      ),
    },
    {
      id: "retreat-action",
      prompt: "Which action lets you step out of battle?",
      choices: makeChoices("Run", ["Guard", "Inventory"]),
    },
  ];

  if (params.battleSource === "wild") {
    questions.push({
      id: "wild-pacing",
      prompt: "Wild battles reward which instinct most?",
      choices: makeChoices("Fast reading", ["Long speeches", "Standing still"]),
    });
  } else {
    questions.push({
      id: "trainer-pacing",
      prompt: "Trainer battles usually demand what from you?",
      choices: makeChoices("Tactical focus", ["Random guessing", "Ignoring the HUD"]),
    });
  }

  return questions;
}

export function pickBattleQuizQuestion(
  params: BattleQuizParams,
  rng: () => number = Math.random,
): BattleQuizQuestion {
  const allQuestions = buildBattleQuizQuestions(params);
  const unseenQuestions = params.excludeIds?.length
    ? allQuestions.filter((question) => !params.excludeIds?.includes(question.id))
    : allQuestions;
  const questions = unseenQuestions.length > 0 ? unseenQuestions : allQuestions;
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
