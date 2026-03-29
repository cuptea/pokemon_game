import { describe, expect, it } from "vitest";

import { shouldRemoveWildRoamerAfterBattle } from "../src/game/wildRoamerState";

describe("wild roamer battle cleanup", () => {
  it("removes a visible wild roamer only after a win", () => {
    expect(shouldRemoveWildRoamerAfterBattle("win")).toBe(true);
    expect(shouldRemoveWildRoamerAfterBattle("lose")).toBe(false);
    expect(shouldRemoveWildRoamerAfterBattle("escape")).toBe(false);
  });
});
