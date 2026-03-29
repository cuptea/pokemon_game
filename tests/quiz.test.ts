import { describe, expect, it } from "vitest";

import { buildBattleQuizQuestions, pickBattleQuizQuestion } from "../src/data/quiz";
import {
  evaluateQuizAnswer,
  getQuizTimeLimitMs,
  getQuizWarningTimeMs,
} from "../src/game/quizBattle";

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

  it("builds a richer question pool with battle-context prompts", () => {
    const trainerQuestions = buildBattleQuizQuestions({
      battleSource: "trainer",
      playerMoveName: "Vine Snap",
      enemyCreatureId: "sparkbud",
      enemyMoveName: "Ember",
      playerLevel: 5,
      enemyLevel: 4,
      enemyPartySize: 3,
      enemyPartyIndex: 1,
    });

    const ids = trainerQuestions.map((question) => question.id);

    expect(ids).toContain("foe-remaining");
    expect(ids).toContain("quiz-reward");
    expect(ids).toContain("timeout-risk");
    expect(ids).toContain("trainer-pressure");
    expect(trainerQuestions.length).toBeGreaterThanOrEqual(14);
  });

  it("grades fast correct answers higher than slow ones and resets streak on failures", () => {
    const timeLimitMs = getQuizTimeLimitMs("trainer", 1);
    expect(timeLimitMs).toBe(30000);
    const warningMs = getQuizWarningTimeMs(timeLimitMs);
    const perfect = evaluateQuizAnswer({
      battleSource: "trainer",
      correct: true,
      elapsedMs: 900,
      timeLimitMs,
      streak: 1,
      enemyPartyIndex: 1,
    });
    const steady = evaluateQuizAnswer({
      battleSource: "trainer",
      correct: true,
      elapsedMs: warningMs + 700,
      timeLimitMs,
      streak: 1,
      enemyPartyIndex: 1,
    });
    const timeout = evaluateQuizAnswer({
      battleSource: "trainer",
      correct: false,
      timedOut: true,
      elapsedMs: timeLimitMs,
      timeLimitMs,
      streak: 3,
      enemyPartyIndex: 1,
    });

    expect(perfect.grade).toBe("perfect");
    expect(perfect.damageMultiplier).toBeGreaterThan(steady.damageMultiplier);
    expect(perfect.nextStreak).toBeGreaterThan(steady.nextStreak - 1);
    expect(timeout.grade).toBe("timeout");
    expect(timeout.enemyPunishBonus).toBeGreaterThan(0);
    expect(timeout.nextStreak).toBe(0);
  });
});
