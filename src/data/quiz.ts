import { registry } from "./registry";
import { pokemonQuizEntries } from "./pokemonQuiz";

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

type WeightedBattleQuizQuestion = BattleQuizQuestion & {
  weight: number;
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

function makeQuestion(
  id: string,
  prompt: string,
  choices: QuizChoice[],
  weight = 1,
): WeightedBattleQuizQuestion {
  return {
    id,
    prompt,
    choices,
    weight,
  };
}

export function buildBattleQuizQuestions(params: BattleQuizParams): BattleQuizQuestion[] {
  return buildBattleQuizQuestionsWithWeight(params).map(({ weight: _weight, ...question }) => question);
}

export function pickBattleQuizQuestion(
  params: BattleQuizParams,
  rng: () => number = Math.random,
): BattleQuizQuestion {
  const allQuestions = buildBattleQuizQuestionsWithWeight(params);
  const unseenQuestions = params.excludeIds?.length
    ? allQuestions.filter((question) => !params.excludeIds?.includes(question.id))
    : allQuestions;
  const questions = unseenQuestions.length > 0 ? unseenQuestions : allQuestions;
  const totalWeight = questions.reduce((sum, question) => sum + question.weight, 0);
  let roll = rng() * totalWeight;
  let question = questions[questions.length - 1];
  for (const candidate of questions) {
    roll -= candidate.weight;
    if (roll <= 0) {
      question = candidate;
      break;
    }
  }
  const choices = [...question.choices]
    .map((choice) => ({ choice, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.choice);

  return {
    ...question,
    choices,
  };
}

function buildBattleQuizQuestionsWithWeight(params: BattleQuizParams): WeightedBattleQuizQuestion[] {
  const enemyCreature = registry.creatures[params.enemyCreatureId];
  const moveNames = Object.values(registry.moves)
    .map((move) => move.name)
    .filter((name) => ![params.playerMoveName, params.enemyMoveName].includes(name));
  const creatureNames = Object.values(registry.creatures)
    .map((creature) => creature.name)
    .filter((name) => name !== enemyCreature.name);
  const remainingFoes = Math.max(0, params.enemyPartySize - params.enemyPartyIndex - 1);
  const levelWrong = [params.enemyLevel + 1, Math.max(1, params.enemyLevel - 1)].filter(
    (level) => level !== params.enemyLevel,
  );
  const playerLevelWrong = [params.playerLevel + 1, Math.max(1, params.playerLevel - 1)].filter(
    (level) => level !== params.playerLevel,
  );
  const levelAdvantage =
    params.playerLevel === params.enemyLevel
      ? "Neither side"
      : params.playerLevel > params.enemyLevel
        ? "Your ally"
        : "The foe";
  const levelGap = Math.abs(params.playerLevel - params.enemyLevel);

  const questions: WeightedBattleQuizQuestion[] = [
    makeQuestion(
      "player-move",
      "Which move is your ally preparing right now?",
      makeChoices(params.playerMoveName, moveNames.slice(0, 2), ["Gust", "Splash Jab"]),
      1.1,
    ),
    makeQuestion(
      "enemy-move",
      "Which move is the foe most likely to answer with?",
      makeChoices(params.enemyMoveName, moveNames.slice(0, 2), ["Gust", "Vine Snap"]),
      1.1,
    ),
    makeQuestion(
      "enemy-name",
      "Which creature is standing across from you?",
      makeChoices(enemyCreature.name, creatureNames.slice(0, 2), ["Spriglet", "Mosslet"]),
      1.15,
    ),
    makeQuestion(
      "enemy-level",
      "What level is the current foe?",
      makeChoices(
        `Lv ${params.enemyLevel}`,
        levelWrong.slice(0, 2).map((level) => `Lv ${level}`),
        ["Lv 2", "Lv 6"],
      ),
      1.05,
    ),
    makeQuestion(
      "player-level",
      "What level is your allied creature?",
      makeChoices(
        `Lv ${params.playerLevel}`,
        playerLevelWrong.slice(0, 2).map((level) => `Lv ${level}`),
        ["Lv 3", "Lv 7"],
      ),
      1.05,
    ),
    makeQuestion(
      "battle-type",
      "What kind of battle are you in?",
      makeChoices(
        params.battleSource === "wild" ? "Wild encounter" : "Trainer battle",
        params.battleSource === "wild"
          ? ["Trainer battle", "Town conversation"]
          : ["Wild encounter", "Map transition"],
      ),
      0.95,
    ),
    makeQuestion(
      "foe-party",
      "How many creatures are in the opposing party right now?",
      makeChoices(
        `${params.enemyPartySize}`,
        [Math.max(1, params.enemyPartySize - 1), params.enemyPartySize + 1].map(String),
        ["2", "3"],
      ),
      params.enemyPartySize > 1 ? 1.25 : 0.65,
    ),
    makeQuestion(
      "foe-slot",
      "Which foe number is currently on the field?",
      makeChoices(
        `${params.enemyPartyIndex + 1}`,
        [Math.max(1, params.enemyPartyIndex), params.enemyPartyIndex + 2].map(String),
        ["2", "3"],
      ),
      params.enemyPartySize > 1 ? 1.35 : 0.6,
    ),
    makeQuestion(
      "retreat-action",
      "Which action lets you step out of battle?",
      makeChoices("Run", ["Guard", "Inventory"]),
      0.85,
    ),
    makeQuestion(
      "quiz-reward",
      "What earns the strongest quiz strike?",
      makeChoices("A correct answer given quickly", [
        "Waiting for the timer to empty",
        "Random button mashing",
      ]),
      1.2,
    ),
    makeQuestion(
      "timeout-risk",
      "What happens if the quiz timer empties?",
      makeChoices("The foe counters immediately", [
        "You heal for free",
        "The map changes",
      ]),
      1.15,
    ),
    makeQuestion(
      "level-advantage",
      "Who has the level edge in this matchup?",
      makeChoices(levelAdvantage, ["Your ally", "The foe"], ["Neither side"]),
      1.1,
    ),
    makeQuestion(
      "level-gap",
      "What is the level gap between you and the foe?",
      makeChoices(`${levelGap}`, [`${levelGap + 1}`, `${Math.max(0, levelGap - 1)}`], ["2", "3"]),
      1,
    ),
    makeQuestion(
      "foe-remaining",
      "After this foe, how many opposing creatures can still come out?",
      makeChoices(
        `${remainingFoes}`,
        [Math.max(0, remainingFoes - 1), remainingFoes + 1].map(String),
        ["0", "2"],
      ),
      params.enemyPartySize > 1 ? 1.4 : 0.5,
    ),
  ];

  if (params.battleSource === "wild") {
    questions.push(
      makeQuestion(
        "wild-pacing",
        "Wild battles reward which instinct most?",
        makeChoices("Fast reading", ["Long speeches", "Standing still"]),
        1.35,
      ),
    );
    questions.push(
      makeQuestion(
        "wild-pressure",
        "In a wild encounter, what does a miss usually cost you?",
        makeChoices("Tempo and safety", ["A free heal", "A new map"]),
        1.2,
      ),
    );
  } else {
    questions.push(
      makeQuestion(
        "trainer-pacing",
        "Trainer battles usually demand what from you?",
        makeChoices("Tactical focus", ["Random guessing", "Ignoring the HUD"]),
        1.35,
      ),
    );
    questions.push(
      makeQuestion(
        "trainer-pressure",
        "Why do trainer quizzes feel tighter than wild ones?",
        makeChoices("They punish slow reads more", [
          "They pause the timer",
          "They skip counterattacks",
        ]),
        1.2,
      ),
    );
  }

  questions.push(
    ...pokemonQuizEntries.map((entry) =>
      makeQuestion(
        entry.id,
        entry.prompt,
        makeChoices(entry.correctAnswer, entry.wrongAnswers),
        entry.weight,
      ),
    ),
  );

  return questions;
}
