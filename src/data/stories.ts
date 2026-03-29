import type { PlayerAvatar } from "../types/world";

type StoryDialogueOverride = {
  lines?: string[];
  defeatedLines?: string[];
  collectedLines?: string[];
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
    },
  },
};

export function getStoryProfile(avatar: PlayerAvatar): StoryProfile {
  return storyProfiles[avatar];
}
