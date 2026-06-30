import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Parents' bedroom — 9×8 units (≈ 4.5m × 4m). The largest bedroom on the floor.
 * Accessed from the south wall of the hallway.
 *
 * Inner wall faces (W=9, D=8, T=0.2):
 *   North z = -(4.0 - 0.1) = -3.9
 *   South z = +(4.0 - 0.1) =  3.9   (panels hidden — camera side)
 *   West  x = -(4.5 - 0.1) = -4.4
 *   East  x = +(4.5 - 0.1) =  4.4
 *
 * Top-down layout:
 *
 *   ┌──────────────────────────────────────────┐
 *   │  [Win]    [King Bed]    [Win]            │
 *   │  [L.Stand]          [R.Stand]            │
 *   │                                          │
 *   [Wardrobe]              [Vanity] [Lamp]    │
 *   │                                          │
 *   │  [Chair]              [Switch]  [Door]   │
 *   └──────────────────────────────────────────┘
 */
export const PARENTS_ROOM: RoomManifest = {
  id:         "parents",
  background: 0xDDD0C0,
  dimensions: { width: 9, depth: 8, wallHeight: 3, wallThick: 0.2 },

  // Rectangular room — override X bounds to use full width
  bounds: { min: -3.5, max: 3.5, minX: -4.2, maxX: 4.2, minZ: -3.5, maxZ: 3.5 },

  bunnyStart: [0, 2.8],

  wallColor:  0xECE0CC,
  floorColor: 0xA88C6C,

  // Two windows above the bed on the north wall
  windows: [
    { x: -1.5, y: 1.75 },
    { x:  1.5, y: 1.75 },
  ],
  windowModelPath: MODELS.window,

  doorId:      "door",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [3, 8, 5],
    sunIntensity:     1.0,
    ambientIntensity: 0.72,
    ambientColor:     0xFFF3E8,
  },

  objects: [
    // ── South wall — door to hallway ──────────────────────────────────────────
    {
      id:          "door",
      type:        "furniture",
      label:       "Hallway",
      position:    [0, 1.1, 3.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "hallway" },
    },

    // ── North wall — king bed (centred, back flush with north inner face) ──────
    // Back face: z = -3.9 + 2.0/2 = -2.9 → center z = -2.9
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [0, 0.35, -2.9],
      size:        [2.8, 0.7, 2.0],
      color:       0x7A5038,
      interaction: { kind: "dialog", message: "Mum and Dad's bed. Off limits, obviously. 🛏️" },
    },

    // ── Nightstands flanking the bed ──────────────────────────────────────────
    // Left: bed left edge = -1.4, nightstand center = -1.4 - 0.3 = -1.7
    {
      id:          "nightstand-left",
      type:        "furniture",
      label:       "Nightstand",
      position:    [-1.7, 0.3, -2.9],
      size:        [0.6, 0.6, 0.6],
      color:       0x6B4423,
      interaction: { kind: "dialog", message: "A nightstand with a reading lamp and a dog-eared novel. 📖" },
    },
    // Right: bed right edge = 1.4, nightstand center = 1.4 + 0.3 = 1.7
    {
      id:          "nightstand-right",
      type:        "furniture",
      label:       "Nightstand",
      position:    [1.7, 0.3, -2.9],
      size:        [0.6, 0.6, 0.6],
      color:       0x6B4423,
      interaction: { kind: "dialog", message: "A nightstand with a glass of water and some reading glasses. 👓" },
    },

    // ── West wall — wardrobe ──────────────────────────────────────────────────
    // Against west inner face (-4.4): center x = -4.4 + 0.5/2 = -4.15
    {
      id:          "wardrobe",
      type:        "furniture",
      label:       "Wardrobe",
      position:    [-4.15, 1.1, 0],
      size:        [0.5, 2.2, 1.8],
      color:       0x7A5840,
      interaction: { kind: "dialog", message: "A grand wardrobe. You can hear coat hangers clinking inside. 👔" },
    },

    // ── East wall — vanity / dresser ──────────────────────────────────────────
    // Against east inner face (4.4): center x = 4.4 - 0.5/2 = 4.15
    {
      id:          "vanity",
      type:        "furniture",
      label:       "Vanity",
      position:    [4.15, 0.5, -1.2],
      size:        [0.5, 1.0, 1.6],
      color:       0x8B6240,
      interaction: { kind: "dialog", message: "A vanity covered in trinkets, photo frames, and a small mirror. 🪞" },
    },

    // ── Armchair — south-west corner ─────────────────────────────────────────
    {
      id:          "armchair",
      type:        "furniture",
      label:       "Armchair",
      position:    [-2.8, 0.35, 2.0],
      size:        [0.85, 0.7, 0.85],
      color:       0x9B6B4A,
      interaction: { kind: "dialog-template", template: "A cosy armchair. {playerName} could curl up here for hours. ☕" },
    },

    // ── East wall — light switch (near south end) ─────────────────────────────
    // East inner face x=4.4. center x = 4.4 - 0.06/2 = 4.37
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [4.37, 1.2, 2.2],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Floor lamp — east side, near bed ─────────────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [3.8, 0, -2.5],
    },
  ],
};
