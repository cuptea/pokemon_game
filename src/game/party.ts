export const MAX_PARTY_SIZE = 3;

export function normalizePartySelection(
  ownedCreatureIds: string[],
  selectedPartyCreatureIds: string[] | undefined,
): string[] {
  const owned = [...new Set(ownedCreatureIds)];
  const desiredSize = Math.min(MAX_PARTY_SIZE, owned.length);
  const selected = Array.isArray(selectedPartyCreatureIds)
    ? selectedPartyCreatureIds.filter((creatureId) => owned.includes(creatureId))
    : [];
  const normalized = [...new Set(selected)].slice(0, MAX_PARTY_SIZE);

  for (const creatureId of owned) {
    if (normalized.length >= desiredSize) {
      break;
    }
    if (!normalized.includes(creatureId)) {
      normalized.push(creatureId);
    }
  }

  return normalized.length > 0 ? normalized : owned.slice(0, desiredSize);
}

export function movePartyCreatureToLead(
  selectedPartyCreatureIds: string[],
  creatureId: string,
): string[] {
  if (!selectedPartyCreatureIds.includes(creatureId)) {
    return selectedPartyCreatureIds;
  }

  return [
    creatureId,
    ...selectedPartyCreatureIds.filter((selectedCreatureId) => selectedCreatureId !== creatureId),
  ];
}

export function togglePartyCreature(
  ownedCreatureIds: string[],
  selectedPartyCreatureIds: string[],
  creatureId: string,
): string[] {
  if (!ownedCreatureIds.includes(creatureId)) {
    return selectedPartyCreatureIds;
  }

  if (selectedPartyCreatureIds.includes(creatureId)) {
    return selectedPartyCreatureIds.filter((selectedCreatureId) => selectedCreatureId !== creatureId);
  }

  if (selectedPartyCreatureIds.length >= MAX_PARTY_SIZE) {
    return selectedPartyCreatureIds;
  }

  return [...selectedPartyCreatureIds, creatureId];
}

export function getRequiredPartySize(ownedCreatureIds: string[]): number {
  return Math.min(MAX_PARTY_SIZE, ownedCreatureIds.length);
}
