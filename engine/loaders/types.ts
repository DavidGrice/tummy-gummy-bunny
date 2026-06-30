// ─── Shared primitive types ────────────────────────────────────────────────────

export type InventorySource = "wardrobe" | "dresser";

// ─── Interaction descriptors ──────────────────────────────────────────────────

export type InteractionDef =
  | { kind: "inventory";       source:       InventorySource }
  | { kind: "journal" }
  | { kind: "map" }
  | { kind: "dialog";          message:      string }
  | { kind: "dialog-template"; template:     string }    // {playerName} replaced at runtime
  | { kind: "lamp-toggle";     lampId:       string }    // toggles a lamp object by id
  | { kind: "scene-change";    targetRoomId: string };   // transitions to another room

// ─── Object definitions ───────────────────────────────────────────────────────

/**
 * Shared by any ObjectDef that can swap its procedural mesh for a GLB model.
 * When `modelPath` is set, the GLB is rendered instead of the procedural mesh;
 * collision and interaction still use that def's `size`/`position` as normal.
 */
export interface GLBModelFields {
  /** Path to a GLB model in /public (e.g. MODELS.bed from models/registry.ts). */
  modelPath?:     string;
  /** Optional Euler rotation [x, y, z] in radians applied to the loaded model. */
  modelRotation?: [number, number, number];
  /** Uniform scale or per-axis [x, y, z] scale applied to the loaded model. */
  modelScale?:    number | [number, number, number];
}

export interface FurnitureObjectDef extends GLBModelFields {
  id:          string;
  type:        "furniture";
  label:       string;
  position:    [number, number, number];
  /** [width, height, depth] */
  size:        [number, number, number];
  color:       number;
  interaction: InteractionDef;
  /** If set, writes this localStorage key as "true" whenever the object is interacted with. */
  flagKey?:    string;
}

export interface BookObjectDef extends GLBModelFields {
  id:          string;
  type:        "book";
  label:       string;
  position:    [number, number, number];
  size:        [number, number, number];
  color:       number;
  interaction: InteractionDef;
  /** If set, writes this localStorage key as "true" whenever the object is interacted with. */
  flagKey?:    string;
}

/** World-space collectable — clicked to add to inventory */
export interface PickupObjectDef {
  id:        string;
  type:      "pickup";
  /** Key into the PICKUP_MESH_BUILDERS registry */
  modelType: string;
  /** Must match a CollectableItem id in GAME_ITEMS */
  itemId:    string;
  position:  [number, number, number];
  rotation?: [number, number, number];
}

/** Decorative floor lamp — toggled via a separate outlet/switch object */
export interface LampObjectDef {
  id:       string;
  type:     "lamp";
  position: [number, number, number];
}

/**
 * Wall-mounted sconce lamp — brown bracket arm + shade + point light.
 * Starts ON by default. Toggled via a lamp-toggle interaction elsewhere.
 * `facing` controls which direction the arm extends from the wall.
 */
export interface WallLampObjectDef {
  id:       string;
  type:     "wallLamp";
  position: [number, number, number];
  /** Direction the arm protrudes into the room (default "south"). */
  facing?:  "north" | "south" | "east" | "west";
}

export type ObjectDef =
  | FurnitureObjectDef
  | BookObjectDef
  | PickupObjectDef
  | LampObjectDef
  | WallLampObjectDef;

// ─── Room manifest ────────────────────────────────────────────────────────────

/** Optional override for a room's directional sun light. Defaults shown in comments. */
export interface RoomLighting {
  sunPosition?:      [number, number, number]; // default [4, 10, 6]
  sunColor?:         number;                   // default 0xFFD080
  sunIntensity?:     number;                   // default 1.4
  ambientColor?:     number;                   // default 0xFFF5E6
  ambientIntensity?: number;                   // default 0.7
}

/** Named wall keys matching the WallSet interface in engine/builders/Walls.ts */
export type WallName = "north" | "west" | "east" | "southLeft" | "southRight" | "southLintel";

export interface RoomManifest {
  id:         string;
  background: number;
  dimensions: { width: number; depth: number; wallHeight: number; wallThick: number };
  /**
   * Walkable clamp bounds. Square rooms: set min/max only.
   * Rectangular corridors: also set minX/maxX and minZ/maxZ overrides.
   * Override values take precedence over min/max for their axis.
   */
  bounds:     { min: number; max: number; minX?: number; maxX?: number; minZ?: number; maxZ?: number };
  /** Bunny spawn position [x, z] */
  bunnyStart: [number, number];
  wallColor:  number;
  floorColor: number;
  windows:    { x: number; y: number }[];
  /** GLB model to use for all windows in this room instead of the procedural frame. */
  windowModelPath?:     string;
  /** Euler rotation [x, y, z] in radians applied to each window model. */
  windowModelRotation?: [number, number, number];
  /** Uniform or per-axis scale applied to each window model. */
  windowModelScale?:    number | [number, number, number];
  objects:    ObjectDef[];
  /** id of the object in `objects` that represents the south door (for wall frame cutout) */
  doorId?:     string;
  /** Wall panels to hide — south panels face the camera and are often hidden */
  hiddenWalls?: WallName[];
  /** Optional lighting overrides; sensible daylight defaults are used when omitted */
  lighting?:   RoomLighting;
}

// ─── Loader callbacks ─────────────────────────────────────────────────────────

export interface RoomCallbacks {
  onDialog:       (message: string)       => void;
  onInventory:    (source: InventorySource) => void;
  onJournal:      ()                      => void;
  onPickup:       (itemId: string)        => void;
  onSceneChange?: (targetRoomId: string)  => void;
  onMap?:         ()                      => void;
  /** Called whenever a flagKey is written to localStorage via object interaction. */
  onFlag?:        (key: string)           => void;
  playerName:     string;
  /** Item IDs already collected — matching pickups are skipped at load time. */
  collectedIds?:  Set<string>;
}
