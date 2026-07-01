import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Single source of truth for Mr. Bunny's room.
 * Add, move, or remove objects here — no factory files or scene code changes needed.
 *
 * Room is 8×8 units. Coordinate convention (top-down):
 *   -Z = back wall (north), +Z = front wall with door (south)
 *   -X = left wall (west),  +X = right wall (east)
 *   Windows on back wall at x=−1.0 (left) and x=+1.0 (right), y=1.75
 */
export const TUTORIAL_ROOM: RoomManifest = {
  id:         "tutorial",
  background: 0xE8D0A8,
  dimensions: { width: 8, depth: 8, wallHeight: 3, wallThick: 0.2 },
  bounds:     { min: -3.0, max: 3.0 },
  bunnyStart: [0, 1],
  wallColor:  0xEDD9B4,
  floorColor: 0xC8A878,
  windows: [
    { x: -1.0, y: 1.75 },
    { x:  1.0, y: 1.75 },
  ],
  windowModelPath: MODELS.window,
  doorId:      "door",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],
  objects: [
    // ── Furniture ─────────────────────────────────────────────────────────────

    // Left wall — wardrobe stays centre of west wall
    {
      id:            "wardrobe",
      type:          "furniture",
      label:         "Wardrobe",
      position:      [-3.55, 1.1,  0],
      size:          [0.5,   2.2,  1.2],
      color:         0x8B5A3C,
      interaction:   { kind: "inventory", source: "wardrobe" },
      modelPath:     MODELS.wardrobe,
      // Model is authored facing south (+Z); rotate to face east (+X) into the room from the west wall.
      modelRotation: [0, Math.PI / 2, 0],
    },

    // Back-left area — dresser moved near the left (west) window
    {
      id:          "dresser",
      type:        "furniture",
      label:       "Dresser",
      position:    [-2.2,  0.5,  -3.55],
      size:        [1.6,   1.0,   0.5],
      color:       0x6B4423,
      interaction: { kind: "inventory", source: "dresser" },
      modelPath:   MODELS.dresser,
    },

    // Back-right area — white desk under the right (east) window
    {
      id:          "desk",
      type:        "furniture",
      label:       "Desk",
      position:    [1.0,   0.45, -3.5],
      size:        [1.4,   0.9,   0.6],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A clean white desk. Great for homework… or doodles. 📝" },
      modelPath:   MODELS.desk,
    },

    // Front wall — door leads to the hallway (locked until both items collected)
    {
      id:                  "door",
      type:                "furniture",
      label:               "Hallway",
      position:            [0,     1.1,  3.5],
      size:                [0.9,   2.2,  0.15],
      color:               0x5C3D1E,
      interaction:         { kind: "scene-change", targetRoomId: "hallway" },
      modelPath:           MODELS.door,
      requiredItems:       ["house-map", "golden-key"],
      requiredItemMessage: "You'll need the house map and the golden key before heading out. 🗺️🔑",
    },

    // Right wall — bed (GLB model)
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [3.4,   0.25, -0.5],
      size:        [1.0,   0.5,   2.2],
      color:       0x5C8A50,  // sage green — gender-neutral; customisation planned
      interaction: { kind: "dialog-template", template: "{playerName} yawns… maybe just five more minutes? 😴" },
      flagKey:     "tgb_bed_rested",
      modelPath:         MODELS.bed,
      materialOverrides: { Blanket: 0x5C8A50, Pillow: 0x7AAF6E },
    },

    // Right wall near the door — light switch for the floor lamp
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [3.75,  1.2,   2.5],
      size:        [0.06,  0.12,  0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
      modelPath:     MODELS.lightSwitch,
      // Model faces south (+Z); rotate to face west (−X) into the room from the east wall.
      modelRotation: [0, -Math.PI / 2, 0],
    },

    // ── Books / special meshes ────────────────────────────────────────────────

    // Journal — sits on top of the dresser; z=-3.38 puts it on the front half
    // of the dresser top surface so it's clearly visible from the camera.
    {
      id:          "journal",
      type:        "book",
      label:       "Journal",
      position:    [-2.0,  1.05, -3.38],
      size:        [0.22,  0.04,  0.28],
      color:       0x5C2E0A,
      interaction: { kind: "journal" },
      modelPath:     MODELS.journal,
      modelRotation: [Math.PI / 2, 0, 0],
    },

    // Map — pick it up to unlock the minimap HUD
    {
      id:        "room-map",
      type:      "pickup",
      modelType: "map",
      itemId:    "house-map",
      position:  [0.85, 0.906, -3.28],
    },

    // ── Decorative lamp (toggled via outlet above) ────────────────────────────
    {
      id:        "floor-lamp",
      type:      "lamp",
      position:  [2.8, 0, -2.8],
      modelPath: MODELS.lamp,
    },

    // ── Pickup items ──────────────────────────────────────────────────────────
    {
      id:        "golden-key-pickup",
      type:      "pickup",
      modelType: "key",
      itemId:    "golden-key",
      position:  [0.8, 0.042, 1.2],
      rotation:  [-Math.PI / 2, 0, Math.PI / 8],
    },
  ],
};
