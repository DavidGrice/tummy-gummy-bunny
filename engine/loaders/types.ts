// ─── Interaction descriptors ──────────────────────────────────────────────────

export type InteractionDef =
  | { kind: "inventory"; source: "wardrobe" | "dresser" }
  | { kind: "journal" }
  | { kind: "dialog";          message:  string }
  | { kind: "dialog-template"; template: string }; // {playerName} is replaced at runtime

// ─── Object definitions ───────────────────────────────────────────────────────

/** Generic box-geometry furniture — wardrobe, dresser, door, bed, etc. */
export interface FurnitureObjectDef {
  id:          string;
  type:        "furniture";
  label:       string;
  /** World-space position of the mesh centre */
  position:    [number, number, number];
  /** [width, height, depth] */
  size:        [number, number, number];
  color:       number;
  interaction: InteractionDef;
}

/** Multi-part book mesh — cover + spine + page-edge strip */
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
  id:         string;
  type:       "pickup";
  /** Key into the PICKUP_MESH_BUILDERS registry */
  modelType:  string;
  /** Must match a CollectableItem id in GAME_ITEMS */
  itemId:     string;
  position:   [number, number, number];
  /** Optional Euler rotation [x, y, z] in radians applied after position */
  rotation?:  [number, number, number];
}

export type ObjectDef = FurnitureObjectDef | BookObjectDef | PickupObjectDef;

// ─── Room manifest ────────────────────────────────────────────────────────────

export interface RoomManifest {
  id:         string;
  background: number;
  dimensions: { width: number; depth: number; wallHeight: number; wallThick: number };
  /** Walkable clamp bounds (x and z) */
  bounds:     { min: number; max: number };
  /** Bunny spawn position [x, z] */
  bunnyStart: [number, number];
  wallColor:  number;
  floorColor: number;
  windows:    { x: number; y: number }[];
  objects:    ObjectDef[];
}

// ─── Loader callbacks ─────────────────────────────────────────────────────────

export interface RoomCallbacks {
  onDialog:    (message: string) => void;
  onInventory: (source: "wardrobe" | "dresser") => void;
  onJournal:   () => void;
  onPickup:    (itemId: string) => void;
  playerName:  string;
}
