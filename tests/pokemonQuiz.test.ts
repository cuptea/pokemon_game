import { describe, expect, it } from "vitest";

import { pokemonQuizEntries } from "../src/data/pokemonQuiz";
import { buildBattleQuizQuestions } from "../src/data/quiz";

describe("pokemon knowledge quiz pool", () => {
  it("keeps every entry answerable with one correct answer and two wrong answers", () => {
    for (const entry of pokemonQuizEntries) {
      expect(entry.prompt.length).toBeGreaterThan(10);
      expect(entry.correctAnswer.length).toBeGreaterThan(0);
      expect(entry.wrongAnswers).toHaveLength(2);
      expect(new Set([entry.correctAnswer, ...entry.wrongAnswers]).size).toBe(3);
      expect(entry.weight).toBeGreaterThan(0);
    }
  });

  it("uses official sources for species facts and Bulbapedia only for move taxonomy", () => {
    for (const entry of pokemonQuizEntries) {
      expect(entry.references.length).toBeGreaterThan(0);

      const officialRefs = entry.references.filter((reference) => reference.kind === "official");
      const bulbapediaRefs = entry.references.filter((reference) => reference.kind === "bulbapedia");

      if (entry.id.includes("-category")) {
        expect(officialRefs).toHaveLength(0);
        expect(bulbapediaRefs.length).toBeGreaterThan(0);
      } else {
        expect(officialRefs.length).toBeGreaterThan(0);
        expect(bulbapediaRefs).toHaveLength(0);
      }
    }
  });

  it("integrates source-backed Pokemon questions into the battle quiz pool", () => {
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

    const pokemonIds = questions.filter((question) => question.id.startsWith("pk-")).map((question) => question.id);

    expect(pokemonIds.length).toBeGreaterThanOrEqual(10);
    expect(pokemonIds).toContain("pk-bulbasaur-type");
    expect(pokemonIds).toContain("pk-thunderbolt-category");
  });
});
