import type {
  DecorationPlacement,
  ExitDefinition,
  PlayerAvatar,
  Rect,
  SpawnPoint,
  WorldPatch,
} from "../../types/world";

type TiledPropertyValue = boolean | number | string | null;

export type TiledProperty = {
  name: string;
  type?: string;
  value: TiledPropertyValue;
};

export type TiledObject = {
  id: number;
  name?: string;
  class?: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  point?: boolean;
  properties?: TiledProperty[];
};

export type TiledObjectLayer = {
  id: number;
  name: string;
  type: "objectgroup";
  objects: TiledObject[];
};

export type TiledMap = {
  height: number;
  layers: TiledObjectLayer[];
  properties?: TiledProperty[];
  tileheight: number;
  tilewidth: number;
  type: "map";
  width: number;
};

type PositionedAnchor = {
  id: string;
  x: number;
  y: number;
};

export type ImportedMapBase = {
  backgroundColor: string;
  height: number;
  id: string;
  title: string;
  width: number;
};

type PropertyMap = Map<string, TiledPropertyValue>;

export function importMapBase(map: TiledMap): ImportedMapBase {
  const props = toPropertyMap(map.properties);

  return {
    id: getStringProperty(props, "id") ?? "unknown_map",
    title: getStringProperty(props, "title") ?? "Untitled Map",
    backgroundColor: getStringProperty(props, "backgroundColor") ?? "#000000",
    width: map.width * map.tilewidth,
    height: map.height * map.tileheight,
  };
}

export function importPatches(map: TiledMap, layerName: string): WorldPatch[] {
  return getLayer(map, layerName).objects.map((object) => {
    const props = toPropertyMap(object.properties);

    return {
      x: object.x,
      y: object.y,
      width: object.width ?? 0,
      height: object.height ?? 0,
      color: getNumberProperty(props, "color") ?? 0,
      strokeColor: getNumberProperty(props, "strokeColor"),
      alpha: getNumberProperty(props, "alpha"),
    };
  });
}

export function importRects(map: TiledMap, layerName: string): Rect[] {
  return getLayer(map, layerName).objects.map((object) => ({
    x: object.x,
    y: object.y,
    width: object.width ?? 0,
    height: object.height ?? 0,
  }));
}

export function importDecorations(map: TiledMap, layerName: string): DecorationPlacement[] {
  return getLayer(map, layerName).objects.map((object) => {
    const props = toPropertyMap(object.properties);

    return {
      id: getObjectId(object, props),
      textureKey: getStringProperty(props, "textureKey") ?? "sign",
      x: object.x,
      y: object.y,
      tint: getNumberProperty(props, "tint"),
      scale: getNumberProperty(props, "scale"),
      alpha: getNumberProperty(props, "alpha"),
    };
  });
}

export function importAnchors(map: TiledMap, layerName: string): PositionedAnchor[] {
  return getLayer(map, layerName).objects.map((object) => ({
    id: getObjectId(object, toPropertyMap(object.properties)),
    x: object.x,
    y: object.y,
  }));
}

export function importExits(map: TiledMap, layerName: string): ExitDefinition[] {
  return getLayer(map, layerName).objects.map((object) => {
    const props = toPropertyMap(object.properties);
    const availableToValue = getStringProperty(props, "availableTo");

    return {
      id: getObjectId(object, props),
      x: object.x,
      y: object.y,
      width: object.width ?? 0,
      height: object.height ?? 0,
      prompt: getStringProperty(props, "prompt") ?? "Press E to travel",
      targetMapId: getStringProperty(props, "targetMapId") ?? "",
      targetSpawnId: getStringProperty(props, "targetSpawnId") ?? "",
      markerLabel: getStringProperty(props, "markerLabel"),
      markerTint: getNumberProperty(props, "markerTint"),
      markerFill: getNumberProperty(props, "markerFill"),
      availableTo: availableToValue
        ? (availableToValue.split(",").map((entry) => entry.trim()) as PlayerAvatar[])
        : undefined,
    };
  });
}

export function importSpawnPoints(map: TiledMap, layerName: string): Record<string, SpawnPoint> {
  return Object.fromEntries(
    importAnchors(map, layerName).map((anchor) => [
      anchor.id,
      {
        id: anchor.id,
        x: anchor.x,
        y: anchor.y,
      },
    ]),
  );
}

export function mergeAnchorsWithData<T extends { id: string; x: number; y: number }>(
  anchors: PositionedAnchor[],
  definitions: Record<string, Omit<T, "id" | "x" | "y">>,
): T[] {
  return anchors.map((anchor) => {
    const definition = definitions[anchor.id];

    if (!definition) {
      throw new Error(`Missing gameplay data for anchored object: ${anchor.id}`);
    }

    return {
      id: anchor.id,
      x: anchor.x,
      y: anchor.y,
      ...definition,
    } as T;
  });
}

function getLayer(map: TiledMap, layerName: string): TiledObjectLayer {
  const layer = map.layers.find((entry) => entry.name === layerName);

  if (!layer) {
    throw new Error(`Missing Tiled layer: ${layerName}`);
  }

  return layer;
}

function getObjectId(object: TiledObject, props: PropertyMap): string {
  return getStringProperty(props, "id") ?? object.name ?? `object_${object.id}`;
}

function getStringProperty(props: PropertyMap, name: string): string | undefined {
  const value = props.get(name);
  return typeof value === "string" ? value : undefined;
}

function getNumberProperty(props: PropertyMap, name: string): number | undefined {
  const value = props.get(name);
  return typeof value === "number" ? value : undefined;
}

function toPropertyMap(properties?: TiledProperty[]): PropertyMap {
  return new Map(properties?.map((property) => [property.name, property.value]) ?? []);
}
