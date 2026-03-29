import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPokemonQuizEntries, pokemonQuizEntries } from "../src/data/pokemonQuiz";
import { buildBattleQuizQuestions } from "../src/data/quiz";

describe("pokemon knowledge quiz pool", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("keeps every entry answerable with one correct answer and two wrong answers", () => {
    for (const entry of pokemonQuizEntries) {
      expect(entry.prompt.length).toBeGreaterThan(10);
      expect(entry.correctAnswer.length).toBeGreaterThan(0);
      expect(entry.wrongAnswers).toHaveLength(2);
      expect(new Set([entry.correctAnswer, ...entry.wrongAnswers]).size).toBe(3);
      expect(entry.weight).toBeGreaterThan(0);
    }
  });

  it("uses official sources for species facts and Bulbapedia only for move facts", () => {
    for (const entry of pokemonQuizEntries) {
      expect(entry.references.length).toBeGreaterThan(0);

      const officialRefs = entry.references.filter((reference) => reference.kind === "official");
      const bulbapediaRefs = entry.references.filter((reference) => reference.kind === "bulbapedia");

      if (entry.id.includes("thunderbolt") || entry.id.includes("flamethrower") || entry.id.includes("quick-attack") || entry.id.includes("growl")) {
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

  it("can localize the Pokemon quiz pool into Chinese and German", () => {
    const zhEntries = getPokemonQuizEntries("zh");
    const deEntries = getPokemonQuizEntries("de");

    expect(zhEntries.find((entry) => entry.id === "pk-bulbasaur-type")?.prompt).toContain("属性");
    expect(deEntries.find((entry) => entry.id === "pk-charmander-type")?.prompt).toContain(
      "Welchen Typ",
    );
    expect(zhEntries.find((entry) => entry.id === "pk-thunderbolt-category")?.correctAnswer).toBe(
      "特殊",
    );
    expect(deEntries.find((entry) => entry.id === "pk-growl-category")?.correctAnswer).toBe(
      "Status",
    );
  });
});
