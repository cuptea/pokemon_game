import type { EncounterZone, Rect } from "../types/world";

export type RoamBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeAxis(min: number, max: number, fallback: number): [number, number] {
  if (min <= max) {
    return [min, max];
  }

  return [fallback, fallback];
}

export function createCenteredRoamBounds(
  x: number,
  y: number,
  radius: number,
  mapWidth: number,
  mapHeight: number,
  padding = 56,
): RoamBounds {
  const minX = clamp(x - radius, padding, Math.max(padding, mapWidth - padding));
  const maxX = clamp(x + radius, padding, Math.max(padding, mapWidth - padding));
  const minY = clamp(y - radius, padding, Math.max(padding, mapHeight - padding));
  const maxY = clamp(y + radius, padding, Math.max(padding, mapHeight - padding));
  const [safeMinX, safeMaxX] = normalizeAxis(minX, maxX, x);
  const [safeMinY, safeMaxY] = normalizeAxis(minY, maxY, y);

  return {
    minX: safeMinX,
    maxX: safeMaxX,
    minY: safeMinY,
    maxY: safeMaxY,
  };
}

export function createZoneRoamBounds(zone: Rect | EncounterZone, inset = 28): RoamBounds {
  const centerX = zone.x + zone.width / 2;
  const centerY = zone.y + zone.height / 2;
  const [minX, maxX] = normalizeAxis(zone.x + inset, zone.x + zone.width - inset, centerX);
  const [minY, maxY] = normalizeAxis(zone.y + inset, zone.y + zone.height - inset, centerY);

  return { minX, maxX, minY, maxY };
}

export function pickRoamTarget(
  bounds: RoamBounds,
  random = Math.random,
): { x: number; y: number } {
  return {
    x: bounds.minX + (bounds.maxX - bounds.minX) * random(),
    y: bounds.minY + (bounds.maxY - bounds.minY) * random(),
  };
}
