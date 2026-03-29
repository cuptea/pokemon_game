import { describe, expect, it } from "vitest";

import {
  createCenteredRoamBounds,
  createZoneRoamBounds,
  pickRoamTarget,
} from "../src/game/wander";

describe("wander helpers", () => {
  it("creates bounded centered roam areas inside the map", () => {
    const bounds = createCenteredRoamBounds(80, 90, 60, 400, 300);

    expect(bounds.minX).toBeGreaterThanOrEqual(56);
    expect(bounds.maxX).toBeLessThanOrEqual(344);
    expect(bounds.minY).toBeGreaterThanOrEqual(56);
    expect(bounds.maxY).toBeLessThanOrEqual(244);
  });

  it("creates inset roam bounds from encounter zones", () => {
    const bounds = createZoneRoamBounds({ x: 200, y: 300, width: 180, height: 120 }, 24);

    expect(bounds).toEqual({
      minX: 224,
      maxX: 356,
      minY: 324,
      maxY: 396,
    });
  });

  it("picks a target inside roam bounds", () => {
    const target = pickRoamTarget(
      { minX: 10, maxX: 30, minY: 40, maxY: 60 },
      () => 0.5,
    );

    expect(target).toEqual({ x: 20, y: 50 });
  });
});
