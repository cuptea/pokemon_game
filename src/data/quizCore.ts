import { getPokemonQuizEntries } from "./pokemonQuiz";

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

export type WeightedBattleQuizQuestion = BattleQuizQuestion & {
  weight: number;
};

export type BattleQuizParams = {
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

export function makeChoices(correct: string, wrong: string[], fallback: string[] = []): QuizChoice[] {
  const uniqueWrong = [...new Set([...wrong, ...fallback])]
    .filter((label) => label !== correct)
    .slice(0, 2);

  return [correct, ...uniqueWrong].map((label, index) => ({
    id: `choice-${index}-${Array.from(label).reduce((sum, char) => sum + char.charCodeAt(0), 0)}`,
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
  return { id, prompt, choices, weight };
}

function buildPokemonKnowledgeQuestions(): WeightedBattleQuizQuestion[] {
  return getPokemonQuizEntries().map((entry) =>
    makeQuestion(
      entry.id,
      entry.prompt,
      makeChoices(entry.correctAnswer, entry.wrongAnswers),
      entry.weight,
    ),
  );
}

export function buildWeightedBattleQuizQuestions(
  params: BattleQuizParams,
): WeightedBattleQuizQuestion[] {
  void params;
  return [...buildPokemonKnowledgeQuestions()];
}

export function selectWeightedBattleQuizQuestion(
  questions: WeightedBattleQuizQuestion[],
  rng: () => number = Math.random,
): WeightedBattleQuizQuestion {
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

  return question;
}

export function shuffleQuizChoices(
  choices: QuizChoice[],
  rng: () => number = Math.random,
): QuizChoice[] {
  return [...choices]
    .map((choice) => ({ choice, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.choice);
}
