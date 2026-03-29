import {
  buildWeightedBattleQuizQuestions,
  selectWeightedBattleQuizQuestion,
  shuffleQuizChoices,
  type BattleQuizParams,
  type BattleQuizQuestion,
} from "./quizCore";

export type { BattleQuizParams, BattleQuizQuestion, QuizChoice } from "./quizCore";

export function buildBattleQuizQuestions(params: BattleQuizParams): BattleQuizQuestion[] {
  return buildWeightedBattleQuizQuestions(params).map(({ weight: _weight, ...question }) => question);
}

export function pickBattleQuizQuestion(
  params: BattleQuizParams,
  rng: () => number = Math.random,
): BattleQuizQuestion {
  const allQuestions = buildWeightedBattleQuizQuestions(params);
  const unseenQuestions = params.excludeIds?.length
    ? allQuestions.filter((question) => !params.excludeIds?.includes(question.id))
    : allQuestions;
  const questions = unseenQuestions.length > 0 ? unseenQuestions : allQuestions;
  const question = selectWeightedBattleQuizQuestion(questions, rng);
  const choices = shuffleQuizChoices(question.choices, rng);

  return {
    ...question,
    choices,
  };
}
