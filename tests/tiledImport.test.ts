import { describe, expect, it } from "vitest";

import { importExits, importRects, mergeAnchorsWithData, type TiledMap } from "../src/data/tiled/importTiledMap";
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

  it("parses avatar-locked exits from Tiled properties", () => {
    const tiledMap: TiledMap = {
      type: "map",
      width: 10,
      height: 10,
      tilewidth: 16,
      tileheight: 16,
      layers: [
        {
          id: 1,
          name: "exits",
          type: "objectgroup",
          objects: [
            {
              id: 10,
              name: "grove_gate",
              x: 40,
              y: 80,
              width: 32,
              height: 16,
              properties: [
                { name: "targetMapId", value: "old_shrine" },
                { name: "targetSpawnId", value: "grove_entry" },
                { name: "availableTo", value: "grove, mist" },
              ],
            },
          ],
        },
      ],
    };

    expect(importExits(tiledMap, "exits")[0]).toMatchObject({
      id: "grove_gate",
      targetMapId: "old_shrine",
      targetSpawnId: "grove_entry",
      availableTo: ["grove", "mist"],
    });
  });

  it("fails clearly when required Tiled layers or anchor data are missing", () => {
    const tiledMap: TiledMap = {
      type: "map",
      width: 10,
      height: 10,
      tilewidth: 16,
      tileheight: 16,
      layers: [],
    };

    expect(() => importRects(tiledMap, "walls")).toThrow("Missing Tiled layer: walls");
    expect(() =>
      mergeAnchorsWithData(
        [{ id: "mentor-liora", x: 10, y: 20 }],
        {},
      ),
    ).toThrow("Missing gameplay data for anchored object: mentor-liora");
  });
});
