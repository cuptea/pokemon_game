import type { PlayerAvatar, WorldState } from "../types/world";

type StoryDialogueOverride = {
  lines?: string[];
  defeatedLines?: string[];
  collectedLines?: string[];
};

type StoryChapter = {
  id: string;
  title: string;
  objective: string;
  objectiveShort: string;
  nextLandmark: string;
  summary: string;
};

export type StoryStatus = {
  actLabel: string;
  chapterTitle: string;
  currentObjective: string;
  objectiveShort: string;
  nextLandmark: string;
  chapterSummary: string;
  routeLabel: string;
};

export type StoryProfile = {
  avatar: PlayerAvatar;
  storyTitle: string;
  cardSubtitle: string;
  startFlavor: string;
  openingMessage: string;
  startingObjective: string;
  objectiveShort: string;
  regionalMystery: string;
  mentorHook: string;
  longArc: string;
  routeMapIds: string[];
  routeLabel: string;
  chapters: StoryChapter[];
  dialogueByKey: Record<string, StoryDialogueOverride>;
};

export const storyProfiles: Record<PlayerAvatar, StoryProfile> = {
  blaze: {
    avatar: "blaze",
    storyTitle: "The Ember Trail",
    cardSubtitle: "Ember Chaser",
    startFlavor: "A tower flare in Verdantveil dares Blaze to chase its source.",
    openingMessage:
      "Mentor Liora wants you to prove yourself, then trace the ember signs glowing beyond Mossgrove and into Verdantveil Glen.",
    startingObjective:
      "Defeat Mentor Liora, then follow the ember signs from Route 01 into Verdantveil Glen.",
    objectiveShort: "Trace the ember signs.",
    regionalMystery:
      "An old watchtower keeps flashing with an orange glow, and wild creatures are being pushed out of the hidden paths below it.",
    mentorHook:
      "Liora believes Blaze has rare courage, but she keeps warning that impatience will burn the clues away before the truth appears.",
    longArc:
      "Blaze starts by chasing a stray flare from Mossgrove's watchtower, then discovers that the ember signs are part of a false signal lattice running through the watch peaks and quarry roads toward Astera Citadel.",
    routeMapIds: [
      "mossgrove_town",
      "route_01_fields",
      "forest_01_glen",
      "blaze_ember_watch_peak",
      "blaze_cinder_quarry",
    ],
    routeLabel: "Mossgrove -> Verdantveil -> Ember Watch -> Cinder Quarry",
    chapters: [
      {
        id: "blaze-opening",
        title: "Act I - First Spark",
        objective: "Defeat Mentor Liora, then follow the ember signs from Route 01 into Verdantveil Glen.",
        objectiveShort: "Defeat Liora and reach Verdantveil.",
        nextLandmark: "Verdantveil Glen",
        summary:
          "Blaze leaves Mossgrove as a hot-blooded scout, convinced the watchtower flare is a direct trail worth chasing.",
      },
      {
        id: "blaze-watch",
        title: "Act II - Alarm on the Ridge",
        objective:
          "Climb from Verdantveil to Ember Watch Peak, defeat Watch Captain Brann, and read the alarm logs before the trail goes cold.",
        objectiveShort: "Reach Ember Watch Peak.",
        nextLandmark: "Ember Watch Peak",
        summary:
          "The ember signs narrow into a watch-ridge alarm network, and Blaze has to read the signal instead of blindly outrunning it.",
      },
      {
        id: "blaze-quarry",
        title: "Act III - Furnace Truth",
        objective:
          "Cross Cinder Quarry, defeat Furnace Warden Sol, and shut down the false signal feeding Astera's lost forge road.",
        objectiveShort: "Shut down the quarry signal.",
        nextLandmark: "Cinder Quarry",
        summary:
          "The flare is not a beacon but a lure, and Blaze's path turns into a test of control and precision at the quarry furnace line.",
      },
    ],
    dialogueByKey: {
      mentor_path: {
        lines: [
          "Welcome to Mossgrove, Blaze.",
          "That watchtower should be dark, yet ember light keeps pulsing from Verdantveil.",
          "Beat me first, then follow the heat trail east.",
        ],
        defeatedLines: [
          "Good. You have the speed for this.",
          "Now go east and read every sign of fire without rushing past the details.",
        ],
      },
      healer_hint: {
        lines: [
          "I have been treating singed paws all morning.",
          "Whatever stirred in Verdantveil is driving hot-tempered creatures out toward town.",
        ],
      },
      storyteller_watchtower: {
        lines: [
          "That old watchtower once warned travelers when the castle road burned red at dusk.",
          "If you are chasing ember light, start with the tower and the grove below it.",
        ],
      },
      town_board_story: {
        lines: [
          "Notice Board: Ferry service stays closed until someone confirms whether the eastern ember flare is only a rumor or a real threat.",
        ],
        collectedLines: [
          "Notice Board: Ferry route request accepted. Report back once the ember flare is mapped and the route is calm again.",
        ],
      },
      house_guardian_story: {
        lines: [
          "Your family always ran toward a beacon instead of away from it.",
          "If the tower is calling again, keep your eyes open and your temper steady.",
        ],
      },
      house_journal_story: {
        lines: [
          "Journal: Ember trails do not only burn.",
          "Sometimes they glow on bark, stone, and water just long enough for a patient scout to follow them.",
        ],
      },
      route_sign_story: {
        lines: [
          "Route 01: Mossgrove to Verdantveil.",
          "The safe lane follows the road, but warm gusts near the tall grass suggest the ember trail has crossed here.",
        ],
      },
      forest_marker_story: {
        lines: [
          "Verdantveil Glen: keep to the light path if you want firm footing.",
          "Look for orange glimmers on leaves if you want the trail Blaze came to find.",
        ],
      },
      lake_notice_story: {
        lines: [
          "Ferry Notice: Service is paused until the eastern routes are safe and the strange reflected fire on Silvermere is explained.",
        ],
        collectedLines: [
          "Ferry Notice: The harbor master still wants proof that the ember reflections on the lake are harmless.",
        ],
      },
      grove_marker_story: {
        lines: [
          "Hidden Grove: the stones here stay strangely warm at sunset.",
          "If the tower flare has a source, the grove may be holding its oldest clue.",
        ],
      },
      blaze_ember_warning: {
        lines: [
          "Brazier Record: The signal jumps when the ridge wind turns east.",
          "Blaze can read the heat, but the real trick is learning which flare is bait and which flare is warning.",
        ],
        collectedLines: [
          "The brazier burns lower now. Its pattern points farther uphill toward the watch captain's station.",
        ],
      },
      blaze_watchtower_alarm: {
        lines: [
          "Captain Brann keeps the watch because the ridge alarms no longer answer in a straight line.",
          "Every flare you chase is pulling you closer to the quarry heart that feeds them.",
        ],
        defeatedLines: [
          "Brann lowers the alarm key and admits the ridge cannot be calmed from here alone.",
          "The next true clue lies in Cinder Quarry, where someone is forcing the signal to keep burning.",
        ],
      },
      blaze_quarry_heat: {
        lines: [
          "Furnace Warden Sol says the quarry heat is part test, part trap.",
          "If Blaze wants the road to the Citadel, the forge signal has to be shut down without letting the whole ridge ignite.",
        ],
        defeatedLines: [
          "The quarry quiets at last, and a cooled Meridian key plate points toward the old citadel road.",
        ],
      },
      mist_ferry_closure: {
        lines: [
          "Blaze sees the ferry closure as another route blocked by the same false lattice.",
          "The water is reflecting what the watchtower tries to hide.",
        ],
      },
      mist_tide_reflection: {
        lines: [
          "Even on Blaze's route, the mirrored tide proves the ridge alarm is touching more than stone and fire.",
        ],
      },
      mist_island_signal: {
        lines: [
          "The island beacons echo the watchtower rhythm. Blaze hears them like distant coals popping in rain.",
        ],
      },
      grove_forest_hush: {
        lines: [
          "The forest has gone still because it knows the signal line is cutting through old roots as well as old roads.",
        ],
      },
      grove_hidden_root: {
        lines: [
          "Even Blaze can tell the root sanctuary is listening to the same pressure building in the ridge vents.",
        ],
      },
      grove_shrine_seal: {
        lines: [
          "The shrine seal feels less like a relic and more like the forest's answer to the forge road.",
        ],
      },
    },
  },
  mist: {
    avatar: "mist",
    storyTitle: "The Silver Current",
    cardSubtitle: "Lake Seeker",
    startFlavor: "Silvermere's shifting waterline pulls Mist toward its hidden current.",
    openingMessage:
      "Mentor Liora wants you ready for the field, then she expects you to follow the strange ripples connecting Mossgrove to Silvermere Lake Edge.",
    startingObjective:
      "Defeat Mentor Liora, then investigate the changing current at Silvermere Lake Edge.",
    objectiveShort: "Study Silvermere's current.",
    regionalMystery:
      "The lake has started reflecting lights that are not in the sky, and the ferry route remains closed until someone understands why.",
    mentorHook:
      "Liora trusts Mist to notice patterns that faster trainers miss, especially when the region starts hiding answers in reflections and tides.",
    longArc:
      "Mist tracks Silvermere's shifting current from the closed ferry route to the mirror isles, discovering that the lake, the island beacons, and Astera's flooded roads are all carrying the same hidden signal.",
    routeMapIds: [
      "mossgrove_town",
      "route_01_fields",
      "lake_edge_01",
      "mist_silvermere_ferry",
      "mist_mirror_isles",
    ],
    routeLabel: "Mossgrove -> Silvermere -> Ferry Docks -> Mirror Isles",
    chapters: [
      {
        id: "mist-opening",
        title: "Act I - First Ripple",
        objective: "Defeat Mentor Liora, then investigate the changing current at Silvermere Lake Edge.",
        objectiveShort: "Defeat Liora and study Silvermere.",
        nextLandmark: "Silvermere Lake Edge",
        summary:
          "Mist leaves town with a notebook mindset, following a current that seems to remember routes older than the road above it.",
      },
      {
        id: "mist-ferry",
        title: "Act II - Closed Crossing",
        objective:
          "Reach Silvermere Ferry, defeat Tide Captain Neris, and read the harbor charts that track the impossible reflections across the dockline.",
        objectiveShort: "Reach the Silvermere Ferry.",
        nextLandmark: "Silvermere Ferry",
        summary:
          "The ferry closure stops looking like bad weather and starts looking like a deliberate quarantine around the reflected signal.",
      },
      {
        id: "mist-isles",
        title: "Act III - Mirror Route",
        objective:
          "Cross to the Mirror Isles, defeat Weather Watcher Pell, and map the island signal chain leading toward the flooded citadel road.",
        objectiveShort: "Map the island signal chain.",
        nextLandmark: "Mirror Isles",
        summary:
          "Mist discovers that the lake is acting like a memory surface, carrying the same hidden route information that other heroes find in fire and roots.",
      },
    ],
    dialogueByKey: {
      mentor_path: {
        lines: [
          "Welcome to Mossgrove, Mist.",
          "The lake has been changing by the hour, and I need someone observant enough to read it.",
          "Beat me first, then take your notes east toward Silvermere.",
        ],
        defeatedLines: [
          "That was clean and patient.",
          "Now head out and study every ripple between the fields and the lake edge.",
        ],
      },
      healer_hint: {
        lines: [
          "Travelers coming back from the lake all say the same thing.",
          "The water looks calm until it starts moving against the wind.",
        ],
      },
      storyteller_watchtower: {
        lines: [
          "That tower does not interest me as much as the water below it.",
          "On clear nights, Silvermere mirrors shapes that should be hidden under the surface.",
        ],
      },
      town_board_story: {
        lines: [
          "Notice Board: Ferry service stays closed until the strange current beyond Route 01 is understood and travel is safe again.",
        ],
        collectedLines: [
          "Notice Board: Ferry route request accepted. Report on the changing waterline at Silvermere Lake Edge.",
        ],
      },
      house_guardian_story: {
        lines: [
          "You always listened before you leaped.",
          "That will matter if the lake keeps speaking in ripples instead of words.",
        ],
      },
      house_journal_story: {
        lines: [
          "Journal: When a road ends at water, look twice.",
          "Currents remember routes that maps have forgotten.",
        ],
      },
      route_sign_story: {
        lines: [
          "Route 01: Mossgrove to Verdantveil.",
          "The road stays safe, but the lake branch carries the real clue for anyone following Silvermere's hidden current.",
        ],
      },
      forest_marker_story: {
        lines: [
          "Verdantveil Glen: the light path is safe, but several pools deeper in the forest have started reflecting the lake's silver shimmer.",
        ],
      },
      lake_notice_story: {
        lines: [
          "Ferry Notice: Service is paused until the harbor master understands the strange current tugging at Silvermere's eastern pier.",
        ],
        collectedLines: [
          "Ferry Notice: The harbor master still needs one clear report on the mirrored light moving under the water.",
        ],
      },
      grove_marker_story: {
        lines: [
          "Hidden Grove: even the ponded roots here shine like polished glass after rain.",
          "Mist may find that the forest and the lake are hiding the same pattern.",
        ],
      },
      blaze_ember_warning: {
        lines: [
          "Mist notices the brazier timing before the heat itself. The signal flares in the same rhythm as the lake's reflected current.",
        ],
      },
      blaze_watchtower_alarm: {
        lines: [
          "The watchtower alarms look less like a fire problem and more like one part of a regional pulse.",
        ],
      },
      blaze_quarry_heat: {
        lines: [
          "Even the quarry exhaust matches the beat Mist has been tracing across Silvermere's surface.",
        ],
      },
      mist_ferry_closure: {
        lines: [
          "Harbor Log: The ferry closed when the lake began pulling against the wind and flashing beacon-light where no lanterns stood.",
          "Mist can follow the dockline next if the charts prove the pattern is real.",
        ],
        collectedLines: [
          "The ferry log now has a clean margin note: the route beyond the dock is opening toward the Mirror Isles.",
        ],
      },
      mist_tide_reflection: {
        lines: [
          "Tide Captain Neris has learned to trust Mist's eye more than the old harbor clock.",
          "The current is carrying a reflected route map toward the islands.",
        ],
        defeatedLines: [
          "Neris hands over the harbor chart and admits the mirror line points beyond the dock, not back to town.",
        ],
      },
      mist_island_signal: {
        lines: [
          "Weather Watcher Pell says the isles are ringing with light again.",
          "Mist only needs one clean reading to prove the island chain is part of Astera's lost transit route.",
        ],
        defeatedLines: [
          "The island beacons finally line up, and the flooded road to the Citadel can be drawn in full.",
        ],
      },
      grove_forest_hush: {
        lines: [
          "Mist hears the hush in Verdantveil as a missing sound in the same pattern the lake keeps repeating.",
        ],
      },
      grove_hidden_root: {
        lines: [
          "The sanctuary pools mirror the lake's silver shimmer. Whatever is moving through the water is also moving through the roots.",
        ],
      },
      grove_shrine_seal: {
        lines: [
          "The shrine seal glows like wet stone after rain. Mist reads it as another signal node waiting to be decoded.",
        ],
      },
    },
  },
  grove: {
    avatar: "grove",
    storyTitle: "Song of the Grove",
    cardSubtitle: "Forest Listener",
    startFlavor: "A restless forest calls Grove to the hidden places others ignore.",
    openingMessage:
      "Mentor Liora wants your first battle done, then she expects you to follow the land's warning from Mossgrove into Verdantveil Glen and the Hidden Grove.",
    startingObjective:
      "Defeat Mentor Liora, then follow the forest's warning signs into Verdantveil Glen and the Hidden Grove.",
    objectiveShort: "Answer the forest's warning.",
    regionalMystery:
      "Verdantveil's balance is slipping, and the quiet grove beyond Route 01 feels more like a sealed shrine than a simple side path.",
    mentorHook:
      "Liora trusts Grove's instinct for the land, but she worries that sympathy alone will not be enough if something old is waking up in the roots.",
    longArc:
      "Grove follows Verdantveil's hush into sealed root sanctuaries and shrine roads, learning that the forest is acting like a living memory system that has been straining against the same Meridian signal shaking the rest of Astera.",
    routeMapIds: [
      "mossgrove_town",
      "route_01_fields",
      "forest_01_glen",
      "sidepath_01_hidden_grove",
      "grove_root_sanctuary",
      "grove_old_shrine",
    ],
    routeLabel: "Mossgrove -> Verdantveil -> Hidden Grove -> Root Sanctuary",
    chapters: [
      {
        id: "grove-opening",
        title: "Act I - Quiet Road",
        objective:
          "Defeat Mentor Liora, then follow the forest's warning signs into Verdantveil Glen and the Hidden Grove.",
        objectiveShort: "Defeat Liora and follow the hush.",
        nextLandmark: "Hidden Grove",
        summary:
          "Grove leaves town listening rather than chasing, following the places where the world feels wrong before it looks wrong.",
      },
      {
        id: "grove-sanctuary",
        title: "Act II - Root Sanctuary",
        objective:
          "Reach the Root Sanctuary, defeat Root Matron Thalia, and learn why Verdantveil's old root paths were sealed away.",
        objectiveShort: "Reach the Root Sanctuary.",
        nextLandmark: "Root Sanctuary",
        summary:
          "The Hidden Grove stops being a side path and starts acting like the first locked chamber in a much older woodland route.",
      },
      {
        id: "grove-shrine",
        title: "Act III - Shrine Seal",
        objective:
          "Climb to the Old Shrine, defeat Keeper Yarrow, and restore the shrine seal guarding the road toward Astera's broken canopy gate.",
        objectiveShort: "Restore the shrine seal.",
        nextLandmark: "Old Shrine",
        summary:
          "Grove learns the forest is not asking for conquest at all; it is asking for balance to be restored without breaking the seal entirely.",
      },
    ],
    dialogueByKey: {
      mentor_path: {
        lines: [
          "Welcome to Mossgrove, Grove.",
          "The trees east of town have gone too quiet, and the hidden grove feels like it is waiting for someone.",
          "Beat me first, then listen to what the forest is trying to say.",
        ],
        defeatedLines: [
          "You kept your balance.",
          "Now take that calm into Verdantveil and follow the path that feels oldest, not loudest.",
        ],
      },
      healer_hint: {
        lines: [
          "Even the gentlest forest creatures are coming back uneasy.",
          "Something in Verdantveil is pressing on the whole woodland at once.",
        ],
      },
      storyteller_watchtower: {
        lines: [
          "That watchtower points toward the road, but the real history of this region is rooted underneath it.",
          "Old paths, ruins, and the hidden grove all seem tied to the same forgotten promise.",
        ],
      },
      town_board_story: {
        lines: [
          "Notice Board: Ferry service stays closed until the eastern routes settle and the woodland disturbances near Verdantveil are explained.",
        ],
        collectedLines: [
          "Notice Board: Ferry route request accepted. Bring back news once Verdantveil stops feeling so unsettled.",
        ],
      },
      house_guardian_story: {
        lines: [
          "You always knew when the garden wanted tending before anyone else noticed.",
          "If the forest is warning you now, do not ignore it.",
        ],
      },
      house_journal_story: {
        lines: [
          "Journal: A healthy route hums.",
          "When the land falls silent, follow the silence until you learn what it wants restored.",
        ],
      },
      route_sign_story: {
        lines: [
          "Route 01: Mossgrove to Verdantveil.",
          "Stay on the safe lane if you must, but the old side paths and the hidden grove carry the clues Grove came to hear.",
        ],
      },
      forest_marker_story: {
        lines: [
          "Verdantveil Glen: stay on the light path for safety.",
          "If the hush deepens around you, the grove's warning is close.",
        ],
      },
      lake_notice_story: {
        lines: [
          "Ferry Notice: Service is paused until the eastern routes are declared safe and the woodland unrest around the shore has eased.",
        ],
        collectedLines: [
          "Ferry Notice: The harbor master still wants to know why the reeds go quiet before dusk.",
        ],
      },
      grove_marker_story: {
        lines: [
          "Hidden Grove: this place rewards trainers who notice what the forest protects.",
          "The silence here is not empty. It is waiting for Grove to answer it.",
        ],
      },
      blaze_ember_warning: {
        lines: [
          "Grove reads the brazier smoke as stress, not spectacle. The ridge heat is upsetting the woodland balance below it.",
        ],
      },
      blaze_watchtower_alarm: {
        lines: [
          "The watchtower alarm feels like a wound in the mountain wind. Grove would rather heal the land than chase the fire.",
        ],
      },
      blaze_quarry_heat: {
        lines: [
          "The quarry heat is drying the roots from below, which is why Verdantveil's warning has grown so sharp.",
        ],
      },
      mist_ferry_closure: {
        lines: [
          "The ferry closure matters because the reeds go silent before dusk. Even the shore plants know the current is wrong.",
        ],
      },
      mist_tide_reflection: {
        lines: [
          "The mirrored tide shows Grove that the lake and the woodland are carrying the same old memory in different forms.",
        ],
      },
      mist_island_signal: {
        lines: [
          "The island signal is another echo of the buried route, but Grove trusts the roots more than the beacons.",
        ],
      },
      grove_forest_hush: {
        lines: [
          "Verdantveil Hush: the birds are still, the roots are tense, and the old sanctuary path is starting to remember you.",
          "Grove can follow this silence deeper if they keep listening instead of forcing the way open.",
        ],
        collectedLines: [
          "The hush softens slightly. Something deeper in the sanctuary has answered back.",
        ],
      },
      grove_hidden_root: {
        lines: [
          "Root Matron Thalia keeps the sanctuary because the forest sealed this path to protect a living memory, not a treasure.",
          "Only a calm trainer can keep the seal from breaking the wrong way.",
        ],
        defeatedLines: [
          "Thalia steps aside and admits the old shrine can be faced now that the sanctuary has accepted you.",
        ],
      },
      grove_shrine_seal: {
        lines: [
          "Keeper Yarrow says the shrine was meant to balance the road beyond, not erase it.",
          "Grove only needs to restore the seal well enough for the forest to trust them again.",
        ],
        defeatedLines: [
          "The shrine seal steadies, and a root-marked Meridian path points toward Astera's broken canopy road.",
        ],
      },
    },
  },
};

function getStoryChapterIndex(state: Pick<WorldState, "selectedAvatar" | "defeatedBattles">): number {
  switch (state.selectedAvatar) {
    case "blaze":
      if (!state.defeatedBattles.mentorBattle) {
        return 0;
      }
      if (!state.defeatedBattles.watchCaptainBrannBattle) {
        return 1;
      }
      return 2;
    case "mist":
      if (!state.defeatedBattles.mentorBattle) {
        return 0;
      }
      if (!state.defeatedBattles.tideCaptainNerisBattle) {
        return 1;
      }
      return 2;
    case "grove":
      if (!state.defeatedBattles.mentorBattle) {
        return 0;
      }
      if (!state.defeatedBattles.rootMatronThaliaBattle) {
        return 1;
      }
      return 2;
  }
}

export function getStoryProfile(avatar: PlayerAvatar): StoryProfile {
  return storyProfiles[avatar];
}

export function getStoryStatus(
  state: Pick<WorldState, "selectedAvatar" | "defeatedBattles" | "currentMapId">,
): StoryStatus {
  const story = getStoryProfile(state.selectedAvatar);
  const chapter = story.chapters[getStoryChapterIndex(state)];
  const routePosition = story.routeMapIds.indexOf(state.currentMapId);
  const routeLabel =
    routePosition >= 0
      ? `${story.routeLabel} (${routePosition + 1}/${story.routeMapIds.length})`
      : story.routeLabel;

  return {
    actLabel: chapter.title,
    chapterTitle: chapter.title,
    currentObjective: chapter.objective,
    objectiveShort: chapter.objectiveShort,
    nextLandmark: chapter.nextLandmark,
    chapterSummary: chapter.summary,
    routeLabel,
  };
}
