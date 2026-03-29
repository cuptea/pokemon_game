import { describe, expect, it } from "vitest";

import { getStoryStatus } from "../src/data/stories";

describe("story progression", () => {
  it("advances Blaze after the ridge captain falls", () => {
    const status = getStoryStatus({
      selectedAvatar: "blaze",
      defeatedBattles: {
        mentorBattle: true,
        watchCaptainBrannBattle: true,
      },
      currentMapId: "blaze_cinder_quarry",
    });

    expect(status.chapterTitle).toContain("Act III");
    expect(status.currentObjective).toContain("Cinder Quarry");
    expect(status.nextLandmark).toBe("Cinder Quarry");
  });

  it("advances Mist to the island route after the ferry captain fight", () => {
    const status = getStoryStatus({
      selectedAvatar: "mist",
      defeatedBattles: {
        mentorBattle: true,
        tideCaptainNerisBattle: true,
      },
      currentMapId: "mist_mirror_isles",
    });

    expect(status.chapterTitle).toContain("Act III");
    expect(status.currentObjective).toContain("Mirror Isles");
  });

  it("advances Grove to the shrine restoration chapter after the sanctuary trial", () => {
    const status = getStoryStatus({
      selectedAvatar: "grove",
      defeatedBattles: {
        mentorBattle: true,
        rootMatronThaliaBattle: true,
      },
      currentMapId: "grove_old_shrine",
    });

    expect(status.chapterTitle).toContain("Act III");
    expect(status.currentObjective).toContain("Old Shrine");
  });
});
