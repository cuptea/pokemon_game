import type { TrainerBattleDefinition } from "../types/world";

export const storyTrainerBattles: Record<string, TrainerBattleDefinition> = {
  emberCadetLysaBattle: {
    id: "emberCadetLysaBattle",
    intro: "Ember Cadet Lysa rushes down the ridge path with a flare-ready challenge.",
    reward: "Lysa points uphill and says Captain Brann only respects trainers who keep steady under pressure.",
    party: [
      { creatureId: "sparkbud", level: 6 },
      { creatureId: "cindercub", level: 6 },
    ],
  },
  watchCaptainBrannBattle: {
    id: "watchCaptainBrannBattle",
    intro: "Watch Captain Brann locks the ridge alarms and challenges you to prove you can read the mountain.",
    reward: "Brann yields the ridge key and warns that the quarry is feeding the entire false signal.",
    party: [
      { creatureId: "sparkbud", level: 7 },
      { creatureId: "murkwing", level: 7 },
      { creatureId: "cindercub", level: 8 },
    ],
  },
  furnaceWardenSolBattle: {
    id: "furnaceWardenSolBattle",
    intro: "Furnace Warden Sol turns the quarry lights toward you and dares you to stop them.",
    reward: "The quarry signal dies down, and a Meridian keyplate cools enough to carry onward.",
    party: [
      { creatureId: "cindercub", level: 8 },
      { creatureId: "sparkbud", level: 8 },
      { creatureId: "bramblear", level: 9 },
    ],
  },
  ferryScoutPellaBattle: {
    id: "ferryScoutPellaBattle",
    intro: "Ferry Scout Pella braces on the dock planks and launches a careful, measured challenge.",
    reward: "Pella nods and says Captain Neris may finally trust your route notes.",
    party: [
      { creatureId: "gullip", level: 6 },
      { creatureId: "reedfin", level: 6 },
    ],
  },
  tideCaptainNerisBattle: {
    id: "tideCaptainNerisBattle",
    intro: "Tide Captain Neris battles like the ferry route itself: smooth until the current shifts.",
    reward: "Neris hands over the harbor chart and admits the reflected route points beyond the pier.",
    party: [
      { creatureId: "reedfin", level: 7 },
      { creatureId: "brookeel", level: 7 },
      { creatureId: "gullip", level: 8 },
    ],
  },
  weatherWatcherPellBattle: {
    id: "weatherWatcherPellBattle",
    intro: "Weather Watcher Pell stands amid the island mirrors, testing whether you can map a storm's hidden path.",
    reward: "Pell yields the island beacon readings, and Silvermere's wider route snaps into focus.",
    party: [
      { creatureId: "brookeel", level: 8 },
      { creatureId: "murkwing", level: 8 },
      { creatureId: "reedfin", level: 9 },
    ],
  },
  sanctuaryForagerReedBattle: {
    id: "sanctuaryForagerReedBattle",
    intro: "Forager Reed steps softly from the moss and tests whether you can move with the sanctuary instead of against it.",
    reward: "Reed smiles and says Thalia only opens the old path for trainers who know how to listen.",
    party: [
      { creatureId: "mosslet", level: 6 },
      { creatureId: "thornibee", level: 6 },
    ],
  },
  rootMatronThaliaBattle: {
    id: "rootMatronThaliaBattle",
    intro: "Root Matron Thalia calls on the sanctuary's old guardians to see whether the forest truly accepts you.",
    reward: "Thalia opens the root path and tells you the Old Shrine has been waiting for a steady hand.",
    party: [
      { creatureId: "mosslet", level: 7 },
      { creatureId: "glimmoth", level: 7 },
      { creatureId: "bramblear", level: 8 },
    ],
  },
  keeperYarrowBattle: {
    id: "keeperYarrowBattle",
    intro: "Keeper Yarrow challenges you at the shrine seal, asking for restoration instead of brute force.",
    reward: "The shrine steadies, and the forest's next road stops hiding from you.",
    party: [
      { creatureId: "shadekit", level: 8 },
      { creatureId: "glimmoth", level: 8 },
      { creatureId: "bramblear", level: 9 },
    ],
  },
};
