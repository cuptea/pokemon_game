import { describe, expect, it } from "vitest";

import { maps } from "../src/data/maps";
import { storyProfiles } from "../src/data/stories";
import type { PlayerAvatar } from "../src/types/world";

describe("character story profiles", () => {
  it("defines a complete story arc for every playable avatar", () => {
    const avatars: PlayerAvatar[] = ["blaze", "mist", "grove"];

    for (const avatar of avatars) {
      const story = storyProfiles[avatar];
      expect(story.storyTitle.length).toBeGreaterThan(3);
      expect(story.cardSubtitle.length).toBeGreaterThan(3);
      expect(story.startFlavor.length).toBeGreaterThan(10);
      expect(story.startingObjective.length).toBeGreaterThan(10);
      expect(story.regionalMystery.length).toBeGreaterThan(10);
      expect(story.mentorHook.length).toBeGreaterThan(10);
    }
  });

  it("covers every story-aware NPC and interactive hook in the early maps", () => {
    const storyKeys = new Set<string>();

    for (const map of Object.values(maps)) {
      for (const npc of map.npcs) {
        if (npc.storyKey) {
          storyKeys.add(npc.storyKey);
        }
      }

      for (const interactive of map.interactives) {
        if (interactive.storyKey) {
          storyKeys.add(interactive.storyKey);
        }
      }
    }

    for (const avatar of Object.keys(storyProfiles) as PlayerAvatar[]) {
      for (const storyKey of storyKeys) {
        const override = storyProfiles[avatar].dialogueByKey[storyKey];
        expect(override, `${avatar} is missing ${storyKey}`).toBeDefined();
        expect(
          (override?.lines?.length ?? 0) > 0 ||
            (override?.defeatedLines?.length ?? 0) > 0 ||
            (override?.collectedLines?.length ?? 0) > 0,
          `${avatar}:${storyKey} should provide usable story copy`,
        ).toBe(true);
      }
    }
  });
});
