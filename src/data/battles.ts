import type { TrainerBattleDefinition } from "../types/world";

export const trainerBattles: Record<string, TrainerBattleDefinition> = {
  mentorBattle: {
    id: "mentorBattle",
    intro: "Mentor Liora wants to see if your Spriglet is ready.",
    reward: "Spriglet handled the first test with confidence.",
    party: [{ creatureId: "puddlepup", level: 3 }],
  },
  scoutLinaBattle: {
    id: "scoutLinaBattle",
    intro: "Scout Lina steps out from the tall grass.",
    reward: "Lina grins and points you toward the forest.",
    party: [{ creatureId: "spriglet", level: 3 }],
  },
  courierPaulBattle: {
    id: "courierPaulBattle",
    intro: "Courier Paul challenges you on the bridge path.",
    reward: "The route ahead feels much bigger now.",
    party: [{ creatureId: "sparkbud", level: 5 }],
  },
  twinsTessBattle: {
    id: "twinsTessBattle",
    intro: "Twins Tess and Tavi call you into a quick double-route test.",
    reward: "The twins laugh and tell you the hidden grove is worth the detour.",
    party: [
      { creatureId: "spriglet", level: 5 },
      { creatureId: "mosslet", level: 5 },
    ],
  },
  bugCatcherIvyBattle: {
    id: "bugCatcherIvyBattle",
    intro: "Bug Catcher Ivy sweeps in from the undergrowth.",
    reward: "The forest starts to feel less intimidating.",
    party: [
      { creatureId: "thornibee", level: 3 },
      { creatureId: "mosslet", level: 4 },
    ],
  },
  hikerOrdoBattle: {
    id: "hikerOrdoBattle",
    intro: "Hiker Ordo wants a sturdy match.",
    reward: "Ordo nods and clears the path ahead.",
    party: [
      { creatureId: "mosslet", level: 4 },
      { creatureId: "sparkbud", level: 4 },
    ],
  },
  swimmerMiraBattle: {
    id: "swimmerMiraBattle",
    intro: "Swimmer Mira splashes into a fast-paced battle.",
    reward: "Mira points out the locked ferry route offshore.",
    party: [
      { creatureId: "puddlepup", level: 4 },
      { creatureId: "gullip", level: 5 },
    ],
  },
  anglerRenBattle: {
    id: "anglerRenBattle",
    intro: "Angler Ren casts a line, then a challenge.",
    reward: "Ren tells you the deeper lake route will need a stronger team.",
    party: [
      { creatureId: "puddlepup", level: 5 },
      { creatureId: "reedfin", level: 5 },
      { creatureId: "gullip", level: 6 },
    ],
  },
  rangerSableBattle: {
    id: "rangerSableBattle",
    intro: "Ranger Sable tests whether you found the hidden grove for a reason.",
    reward: "Sable leaves the grove open as your reward.",
    party: [
      { creatureId: "thornibee", level: 5 },
      { creatureId: "shadekit", level: 5 },
      { creatureId: "mosslet", level: 6 },
    ],
  },
};
