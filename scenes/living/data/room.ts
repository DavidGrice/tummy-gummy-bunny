import type { RoomManifest } from "@/engine/loaders/types";

/**
 * Living Room — 9×8 units (≈ 4.5m × 4m).
 * Accessed from the east wall of the Kitchen.
 * The front door on the south wall leads out to the Front Garden.
 *
 * Inner wall faces (W=9, D=8, T=0.2):
 *   North z = -(4.0 - 0.1) = -3.9
 *   South z = +(4.0 - 0.1) =  3.9   (camera side — front door here)
 *   West  x = -(4.5 - 0.1) = -4.4
 *   East  x = +(4.5 - 0.1) =  4.4
 *
 * Top-down layout:
 *
 *   ┌─[Bookshelf]─────[TV Console]──────────────┐
 *   [Kitchen]                        [Lamp]      │
 *   │         [Coffee Table]                     │
 *   │            [Sofa]    [Armchair] [Switch]   │
 *   └──────────────[Front Door]─────────────────┘
 */
export const LIVING_ROOM: RoomManifest = {
  id:         "living",
  background: 0xE8DCC8,
  dimensions: { width: 9, depth: 8, wallHeight: 3, wallThick: 0.2 },

  bounds: { min: -3.5, max: 3.5, minX: -4.1, maxX: 4.1, minZ: -3.5, maxZ: 3.5 },

  bunnyStart: [0, 0],

  wallColor:  0xF0E4D0,
  floorColor: 0x7A5230,

  // Two windows above the TV on the north wall
  windows: [
    { x: -1.5, y: 1.75 },
    { x:  1.5, y: 1.75 },
  ],

  // South wall has the front door — doorId creates the wall cutout.
  doorId:      "door-outside",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [3, 8, 4],
    sunIntensity:     1.0,
    ambientIntensity: 0.70,
    ambientColor:     0xFFF8F0,
  },

  objects: [
    // ── West wall — door back to kitchen ──────────────────────────────────────
    // West inner face x = −4.4; center x = −4.4 + 0.4 = −4.0; z = 0 (centred)
    {
      id:          "door-kitchen",
      type:        "furniture",
      label:       "Kitchen",
      position:    [-4.0, 1.1, 0],
      size:        [0.15, 2.2, 0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "kitchen" },
    },

    // ── South wall — front door to garden ────────────────────────────────────
    // South inner face z = 3.9; center z = 3.9 − 0.4 = 3.5; x = 0 (centred)
    {
      id:          "door-outside",
      type:        "furniture",
      label:       "Front Garden",
      position:    [0, 1.1, 3.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x4A3020,
      interaction: { kind: "scene-change", targetRoomId: "outside" },
    },

    // ── North wall — TV console ───────────────────────────────────────────────
    // North inner face z = −3.9; depth 0.4; center z = −3.9 + 0.2 = −3.7
    {
      id:          "tv-console",
      type:        "furniture",
      label:       "TV",
      position:    [0, 0.3, -3.7],
      size:        [2.2, 0.6, 0.4],
      color:       0x252525,
      interaction: { kind: "dialog", message: "The family TV. It's showing cartoons — obviously. 📺" },
    },

    // ── West wall — tall bookshelf (north half) ───────────────────────────────
    {
      id:          "bookshelf",
      type:        "furniture",
      label:       "Bookshelf",
      position:    [-3.9, 1.1, -2.0],
      size:        [0.4, 2.2, 1.6],
      color:       0x8B6040,
      interaction: { kind: "dialog", message: "Shelves of family books, photo albums, and a few odd trophies. 📚" },
    },

    // ── Centre — sofa facing south (toward camera / front door) ─────────────
    {
      id:          "sofa",
      type:        "furniture",
      label:       "Sofa",
      position:    [-0.5, 0.45, 1.5],
      size:        [2.4, 0.9, 0.9],
      color:       0x8B6B4C,
      interaction: { kind: "dialog", message: "A big comfy family sofa. There's definitely a TV remote lost in the cushions. 🛋️" },
    },

    // ── Coffee table — north of sofa, between sofa and TV ────────────────────
    {
      id:          "coffee-table",
      type:        "furniture",
      label:       "Coffee Table",
      position:    [-0.5, 0.25, -0.5],
      size:        [1.2, 0.5, 0.6],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "A low coffee table. There's a half-full mug and today's newspaper on it. ☕" },
    },

    // ── East area — armchair ──────────────────────────────────────────────────
    {
      id:          "armchair",
      type:        "furniture",
      label:       "Armchair",
      position:    [2.8, 0.4, 0.5],
      size:        [0.9, 0.8, 0.9],
      color:       0xA07050,
      interaction: { kind: "dialog", message: "Dad's armchair. Sat in this spot for so long it's moulded to him. 🪑" },
    },

    // ── East wall — light switch ──────────────────────────────────────────────
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [4.37, 1.2, 3.0],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Floor lamp — east of TV, north-east area ──────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [3.5, 0, -2.0],
    },
  ],
};
