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

export interface FurnitureObjectDef {
  id:          string;
  type:        "furniture";
  label:       string;
  position:    [number, number, number];
  /** [width, height, depth] */
  size:        [number, number, number];
  color:       number;
  interaction: InteractionDef;
}

export interface BookObjectDef {
  id:          string;
  type:        "book";
  label:       string;
  position:    [number, number, number];
  size:        [number, number, number];
  color:       number;
  interaction: InteractionDef;
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

export type ObjectDef =
  | FurnitureObjectDef
  | BookObjectDef
  | PickupObjectDef
  | LampObjectDef;

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
  playerName:     string;
  /** Item IDs already collected — matching pickups are skipped at load time. */
  collectedIds?:  Set<string>;
}
