import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Dining Room — 8×7 units (≈ 4m × 3.5m).
 * Accessed from the west end of the hallway.
 *
 * Inner wall faces (W=8, D=7, T=0.2):
 *   North z = -(3.5 - 0.1) = -3.4
 *   South z = +(3.5 - 0.1) =  3.4   (camera side — panels hidden)
 *   West  x = -(4.0 - 0.1) = -3.9
 *   East  x = +(4.0 - 0.1) =  3.9
 *
 * Top-down layout:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ [Lamp]   [Win]  [Sideboard]  [Win]      │
 *   │                                          │
 *   [China Cabinet]   [Dining Table]           │
 *   │                                          │
 *   │                           [Switch][Hall]→│
 *   └─────────────────[Kitchen↓]───────────────┘
 */
export const DINING_ROOM: RoomManifest = {
  id:         "dining",
  background: 0xD8C8A0,
  dimensions: { width: 8, depth: 7, wallHeight: 3, wallThick: 0.2 },

  // East bounds allow the bunny to reach the east-wall door (x=3.5)
  bounds: { min: -3.0, max: 3.0, minX: -3.6, maxX: 3.6, minZ: -3.0, maxZ: 3.0 },

  bunnyStart: [3.0, 0],

  wallColor:  0xE8D8B0,
  floorColor: 0xA07850,

  // Two windows on the north (back) wall, flanking the sideboard
  windows: [
    { x: -1.5, y: 1.75 },
    { x:  1.5, y: 1.75 },
  ],
  windowModelPath: MODELS.window,

  // South wall has the kitchen door — doorId creates the wall cutout.
  // The flanking panels are still hidden so the camera can see in from the south.
  doorId:      "door-kitchen",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [3, 8, 5],
    sunIntensity:     1.0,
    ambientIntensity: 0.68,
    ambientColor:     0xFFF8E8,
  },

  objects: [
    // ── East wall — door back to hallway ──────────────────────────────────────
    // East inner face x = 3.9; door depth = 0.15; center x = 3.9 − 0.4 = 3.5
    {
      id:          "door-hallway",
      type:        "furniture",
      label:       "Hallway",
      position:    [3.5, 1.1, 0],
      size:        [0.15, 2.2, 0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "hallway" },
      modelPath:     MODELS.door,
      modelRotation: [0, Math.PI / 2, 0],
    },

    // ── Dining table — slightly south of centre ───────────────────────────────
    // y = size[1]/2 = 0.8/2 = 0.4
    {
      id:          "dining-table",
      type:        "furniture",
      label:       "Dining Table",
      position:    [0, 0.4, 0.5],
      size:        [2.4, 0.8, 1.4],
      color:       0x6B4423,
      interaction: { kind: "dialog", message: "The family dining table. Enough seats for everyone and then some. 🍽️" },
    },

    // ── North wall — sideboard centred below the two windows ─────────────────
    // North inner face z = −3.4; depth 0.5; center z = −3.4 + 0.25 = −3.15
    {
      id:          "sideboard",
      type:        "furniture",
      label:       "Sideboard",
      position:    [0, 0.45, -3.15],
      size:        [1.8, 0.9, 0.5],
      color:       0x7A5230,
      interaction: { kind: "dialog", message: "A sideboard with a vase of fresh flowers and a bowl of fruit on top. 🌷🍎" },
    },

    // ── South wall — door to kitchen ─────────────────────────────────────────
    // South inner face z = 3.4; door depth 0.15; center z = 3.4 − 0.4 = 3.0
    // Centred at x = 0 (matches kitchen's north door entry point)
    {
      id:          "door-kitchen",
      type:        "furniture",
      label:       "Kitchen",
      position:    [0, 1.1, 3.0],
      size:        [0.9, 2.2, 0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "kitchen" },
      modelPath:   MODELS.door,
    },

    // ── West wall — china cabinet ─────────────────────────────────────────────
    // West inner face x = −3.9; width 0.5; center x = −3.9 + 0.25 = −3.65
    {
      id:          "china-cabinet",
      type:        "furniture",
      label:       "China Cabinet",
      position:    [-3.65, 1.1, 0],
      size:        [0.5, 2.2, 1.6],
      color:       0x8B6040,
      interaction: { kind: "dialog", message: "A glass-fronted china cabinet. Nana's fine china lives here — no touching! 🫖" },
    },

    // ── East wall — light switch south of the door ───────────────────────────
    // East inner face x = 3.9; center x = 3.9 − 0.03 = 3.87
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [3.87, 1.2, 2.0],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Floor lamp — north-west corner ───────────────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [-2.5, 0, -2.5],
    },
  ],
};
