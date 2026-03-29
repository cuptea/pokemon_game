import type { TrainerBattleDefinition } from "../types/world";
import { storyTrainerBattles } from "./storyBattles";

export const trainerBattles: Record<string, TrainerBattleDefinition> = {
  mentorBattle: {
    id: "mentorBattle",
    intro: "Mentor Liora wants to see if your Spriglet is ready.",
    reward: "Spriglet handled the first test with confidence.",
    party: [
      { creatureId: "puddlepup", level: 2 },
      { creatureId: "mosslet", level: 3 },
    ],
  },
  scoutLinaBattle: {
    id: "scoutLinaBattle",
    intro: "Scout Lina steps out from the tall grass.",
    reward: "Lina grins and points you toward the forest.",
    party: [
      { creatureId: "spriglet", level: 3 },
      { creatureId: "gullip", level: 3 },
    ],
  },
  picnickerJuneBattle: {
    id: "picnickerJuneBattle",
    intro: "Picnicker June stands up from the roadside blanket with a cheerful challenge.",
    reward: "June shares a tip about watching the tower and the lake for the same weather signs.",
    party: [
      { creatureId: "puddlepup", level: 4 },
      { creatureId: "mosslet", level: 4 },
    ],
  },
  courierPaulBattle: {
    id: "courierPaulBattle",
    intro: "Courier Paul challenges you on the bridge path.",
    reward: "The route ahead feels much bigger now.",
    party: [
      { creatureId: "sparkbud", level: 4 },
      { creatureId: "cindercub", level: 4 },
    ],
  },
  twinsTessBattle: {
    id: "twinsTessBattle",
    intro: "Twins Tess and Tavi call you into a quick double-route test.",
    reward: "The twins laugh and tell you the hidden grove is worth the detour.",
    party: [
      { creatureId: "spriglet", level: 4 },
      { creatureId: "mosslet", level: 4 },
    ],
  },
  camperAshBattle: {
    id: "camperAshBattle",
    intro: "Camper Ash hops down from the high grass ready for a tougher route test.",
    reward: "Ash points toward the grove and says the detour is worth the scratches.",
    party: [
      { creatureId: "sparkbud", level: 5 },
      { creatureId: "cindercub", level: 5 },
    ],
  },
  bugCatcherIvyBattle: {
    id: "bugCatcherIvyBattle",
    intro: "Bug Catcher Ivy sweeps in from the undergrowth.",
    reward: "The forest starts to feel less intimidating.",
    party: [
      { creatureId: "thornibee", level: 3 },
      { creatureId: "glimmoth", level: 4 },
    ],
  },
  foragerLynnBattle: {
    id: "foragerLynnBattle",
    intro: "Forager Lynn steps out of the brush with a full satchel and a ready party.",
    reward: "Lynn smiles and points out a denser patch of wild tracks deeper in the glen.",
    party: [
      { creatureId: "shadekit", level: 4 },
      { creatureId: "murkwing", level: 5 },
    ],
  },
  hikerOrdoBattle: {
    id: "hikerOrdoBattle",
    intro: "Hiker Ordo wants a sturdy match.",
    reward: "Ordo nods and clears the path ahead.",
    party: [
      { creatureId: "mosslet", level: 4 },
      { creatureId: "bramblear", level: 5 },
    ],
  },
  swimmerMiraBattle: {
    id: "swimmerMiraBattle",
    intro: "Swimmer Mira splashes into a fast-paced battle.",
    reward: "Mira points out the locked ferry route offshore.",
    party: [
      { creatureId: "puddlepup", level: 4 },
      { creatureId: "brookeel", level: 4 },
    ],
  },
  ferryCadetNoxBattle: {
    id: "ferryCadetNoxBattle",
    intro: "Ferry Cadet Nox wants to see if you can handle the shore watch.",
    reward: "Nox says the ferry crew is watching for a trainer strong enough to reopen the route.",
    party: [
      { creatureId: "gullip", level: 4 },
      { creatureId: "reedfin", level: 5 },
    ],
  },
  anglerRenBattle: {
    id: "anglerRenBattle",
    intro: "Angler Ren casts a line, then a challenge.",
    reward: "Ren tells you the deeper lake route will need a stronger team.",
    party: [
      { creatureId: "reedfin", level: 5 },
      { creatureId: "gullip", level: 5 },
    ],
  },
  foragerPipBattle: {
    id: "foragerPipBattle",
    intro: "Forager Pip has been waiting in the quiet brush for someone curious enough to find this place.",
    reward: "Pip points you toward the oldest stone in the grove.",
    party: [
      { creatureId: "mosslet", level: 4 },
      { creatureId: "glimmoth", level: 5 },
    ],
  },
  rangerSableBattle: {
    id: "rangerSableBattle",
    intro: "Ranger Sable tests whether you found the hidden grove for a reason.",
    reward: "Sable leaves the grove open as your reward.",
    party: [
      { creatureId: "thornibee", level: 5 },
      { creatureId: "shadekit", level: 5 },
      { creatureId: "bramblear", level: 5 },
    ],
  },
  ...storyTrainerBattles,
};
