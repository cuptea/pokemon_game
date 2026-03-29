import { describe, expect, it } from "vitest";

import { mossgroveTownMap } from "../src/data/tiled/mossgroveTown";

describe("first Tiled migration pass", () => {
  it("builds mossgrove_town from Tiled-backed data", () => {
    expect(mossgroveTownMap.id).toBe("mossgrove_town");
    expect(mossgroveTownMap.title).toBe("Mossgrove Town");
    expect(mossgroveTownMap.width).toBe(1600);
    expect(mossgroveTownMap.height).toBe(1200);
    expect(mossgroveTownMap.patches.length).toBe(9);
    expect(mossgroveTownMap.walls.length).toBe(7);
    expect(mossgroveTownMap.decorations.length).toBe(14);
  });

  it("keeps story-critical anchors intact", () => {
    expect(mossgroveTownMap.spawnPoints.town_square).toEqual({
      id: "town_square",
      x: 860,
      y: 760,
    });

    const mentor = mossgroveTownMap.npcs.find((entry) => entry.id === "mentor-liora");
    expect(mentor?.x).toBe(980);
    expect(mentor?.y).toBe(510);

    const board = mossgroveTownMap.interactives.find((entry) => entry.id === "town_board");
    expect(board?.x).toBe(520);
    expect(board?.y).toBe(430);
  });
});
