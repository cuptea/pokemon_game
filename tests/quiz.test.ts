import { describe, expect, it } from "vitest";

import { buildBattleQuizQuestions, pickBattleQuizQuestion } from "../src/data/quiz";

describe("battle quiz questions", () => {
  it("builds three-choice questions with exactly one correct answer", () => {
    const questions = buildBattleQuizQuestions({
      battleSource: "wild",
      playerMoveName: "Ember",
      enemyCreatureId: "mosslet",
      enemyMoveName: "Vine Snap",
      playerLevel: 5,
      enemyLevel: 4,
      enemyPartySize: 1,
      enemyPartyIndex: 0,
    });

    expect(questions.length).toBeGreaterThan(0);

    for (const question of questions) {
      expect(question.choices).toHaveLength(3);
      expect(question.choices.filter((choice) => choice.isCorrect)).toHaveLength(1);
    }
  });

  it("picks and shuffles a valid question deterministically with injected rng", () => {
    const question = pickBattleQuizQuestion(
      {
        battleSource: "trainer",
        playerMoveName: "Vine Snap",
        enemyCreatureId: "sparkbud",
        enemyMoveName: "Ember",
        playerLevel: 5,
        enemyLevel: 4,
        enemyPartySize: 2,
        enemyPartyIndex: 1,
      },
      () => 0,
    );

    expect(question.prompt.length).toBeGreaterThan(5);
    expect(question.choices).toHaveLength(3);
    expect(question.choices.some((choice) => choice.isCorrect)).toBe(true);
  });

  it("avoids excluded questions when other prompts are available", () => {
    const question = pickBattleQuizQuestion(
      {
        battleSource: "trainer",
        playerMoveName: "Vine Snap",
        enemyCreatureId: "sparkbud",
        enemyMoveName: "Ember",
        playerLevel: 5,
        enemyLevel: 4,
        enemyPartySize: 2,
        enemyPartyIndex: 0,
        excludeIds: ["player-move", "enemy-move", "enemy-name"],
      },
      () => 0,
    );

    expect(["player-move", "enemy-move", "enemy-name"]).not.toContain(question.id);
  });
});
