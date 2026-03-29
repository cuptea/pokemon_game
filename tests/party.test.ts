import { describe, expect, it } from "vitest";

import {
  getRequiredPartySize,
  movePartyCreatureToLead,
  normalizePartySelection,
  togglePartyCreature,
} from "../src/game/party";

describe("party helpers", () => {
  it("normalizes party selection to up to three owned creatures", () => {
    expect(normalizePartySelection(["spriglet", "mosslet", "puddlepup"], ["mosslet"])).toEqual([
      "mosslet",
      "spriglet",
      "puddlepup",
    ]);
  });

  it("moves a selected creature to the lead slot", () => {
    expect(movePartyCreatureToLead(["spriglet", "mosslet", "puddlepup"], "puddlepup")).toEqual([
      "puddlepup",
      "spriglet",
      "mosslet",
    ]);
  });

  it("toggles party membership while respecting the three-buddy cap", () => {
    expect(togglePartyCreature(["spriglet", "mosslet", "puddlepup"], ["spriglet"], "mosslet")).toEqual([
      "spriglet",
      "mosslet",
    ]);
    expect(
      togglePartyCreature(
        ["spriglet", "mosslet", "puddlepup", "gullip"],
        ["spriglet", "mosslet", "puddlepup"],
        "gullip",
      ),
    ).toEqual(["spriglet", "mosslet", "puddlepup"]);
  });

  it("computes the required party size from owned creatures", () => {
    expect(getRequiredPartySize(["spriglet"])).toBe(1);
    expect(getRequiredPartySize(["spriglet", "mosslet", "puddlepup", "gullip"])).toBe(3);
  });
});
