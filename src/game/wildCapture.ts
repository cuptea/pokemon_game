import { normalizePartySelection } from "./party";
import type { WorldState } from "../types/world";

export type WildCaptureResult =
  | {
      outcome: "captured";
      addedToParty: boolean;
      creatureId: string;
    }
  | {
      outcome: "already-owned";
      addedToParty: false;
      creatureId: string;
    }
  | {
      outcome: "missing-creature";
      addedToParty: false;
    };

export function applyWildVictoryCapture(
  state: WorldState,
  capturedId: string | undefined,
): WildCaptureResult {
  if (!capturedId) {
    return {
      outcome: "missing-creature",
      addedToParty: false,
    };
  }

  if (state.ownedCreatureIds.includes(capturedId)) {
    return {
      outcome: "already-owned",
      addedToParty: false,
      creatureId: capturedId,
    };
  }

  state.ownedCreatureIds = [...state.ownedCreatureIds, capturedId];
  state.selectedPartyCreatureIds = normalizePartySelection(state.ownedCreatureIds, [
    ...state.selectedPartyCreatureIds,
    capturedId,
  ]);
  const addedToParty = state.selectedPartyCreatureIds.includes(capturedId);
  state.activeCreatureId = state.selectedPartyCreatureIds[0] ?? capturedId;

  return {
    outcome: "captured",
    addedToParty,
    creatureId: capturedId,
  };
}
