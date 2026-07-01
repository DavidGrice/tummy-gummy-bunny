import type { RoomManifest } from "@/engine/loaders/types";
import { PALETTE } from "@/lib/palette";
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
    // Natural: 1.524W × 0.762H × 0.914D, base-at-origin, cY=0.381.
    // fitSize [2.4, 0.82, 1.4]: autoScale=1.076 → 1.640W × 0.820H × 0.984D.
    // position Y = 0.381 × 1.076 = 0.410.
    {
      id:                "dining-table",
      type:              "furniture",
      label:             "Dining Table",
      position:          [0, 0.41, 0.5],
      size:              [2.4, 0.82, 1.4],
      color:             PALETTE.woodWarm,
      interaction:       { kind: "dialog", message: "The family dining table. Enough seats for everyone and then some. 🍽️" },
      modelPath:         MODELS.diningTable,
      materialOverrides: { Table_Whitewash_Wood: PALETTE.woodWarm, Table_Wood_Shadow: PALETTE.woodMahogany, Table_Hardware_Pewter: PALETTE.pewter },
    },

    // ── Dining chairs — 2 north, 2 south of the table ────────────────────────
    // Natural: 0.470W × 0.966H × 0.414D, base-at-origin, cY=0.482.
    // fitSize [0.5, 1.0, 0.45]: autoScale=1.035 → Y=0.482×1.035=0.499.
    // Table edges: north Z=−0.20, south Z=+1.20. Chairs offset ±0.25 from edge.
    {
      id:                "chair-n-left",
      type:              "furniture",
      label:             "Chair",
      position:          [-0.65, 0.50, -0.45],
      size:              [0.5, 1.0, 0.45],
      color:             PALETTE.woodLight,
      interaction:       { kind: "dialog", message: "A cosy dining chair. Pull it out and take a seat! 🪑" },
      modelPath:         MODELS.diningChair,
      modelRotation:     [0, Math.PI, 0],
      materialOverrides: { Chair_Light_Wood: PALETTE.woodWarm, Chair_Cream_Fabric: PALETTE.fabricCream, Chair_Button: PALETTE.woodWalnut },
    },
    {
      id:                "chair-n-right",
      type:              "furniture",
      label:             "Chair",
      position:          [0.65, 0.50, -0.45],
      size:              [0.5, 1.0, 0.45],
      color:             PALETTE.woodLight,
      interaction:       { kind: "dialog", message: "A cosy dining chair. Pull it out and take a seat! 🪑" },
      modelPath:         MODELS.diningChair,
      modelRotation:     [0, Math.PI, 0],
      materialOverrides: { Chair_Light_Wood: PALETTE.woodWarm, Chair_Cream_Fabric: PALETTE.fabricCream, Chair_Button: PALETTE.woodWalnut },
    },
    {
      id:                "chair-s-left",
      type:              "furniture",
      label:             "Chair",
      position:          [-0.65, 0.50, 1.45],
      size:              [0.5, 1.0, 0.45],
      color:             PALETTE.woodLight,
      interaction:       { kind: "dialog", message: "A cosy dining chair. Pull it out and take a seat! 🪑" },
      modelPath:         MODELS.diningChair,
      materialOverrides: { Chair_Light_Wood: PALETTE.woodWarm, Chair_Cream_Fabric: PALETTE.fabricCream, Chair_Button: PALETTE.woodWalnut },
    },
    {
      id:                "chair-s-right",
      type:              "furniture",
      label:             "Chair",
      position:          [0.65, 0.50, 1.45],
      size:              [0.5, 1.0, 0.45],
      color:             PALETTE.woodLight,
      interaction:       { kind: "dialog", message: "A cosy dining chair. Pull it out and take a seat! 🪑" },
      modelPath:         MODELS.diningChair,
      materialOverrides: { Chair_Light_Wood: PALETTE.woodWarm, Chair_Cream_Fabric: PALETTE.fabricCream, Chair_Button: PALETTE.woodWalnut },
    },

    // ── North wall — sideboard centred below the two windows ─────────────────
    // Natural: 1.670W × 0.858H × 0.362D, base-at-origin, cY=0.427.
    // fitSize [1.7, 0.9, 0.4]: autoScale 1.018 → 1.700W × 0.873H × 0.368D.
    // position Y = 0.427 × 1.018 = 0.435. North z=−3.4; center z=−3.4+0.184=−3.22.
    {
      id:          "sideboard",
      type:        "furniture",
      label:       "Sideboard",
      position:    [0, 0.44, -3.22],
      size:        [1.7, 0.9, 0.4],
      color:       0x7A5230,
      interaction: { kind: "dialog", message: "A sideboard with a vase of fresh flowers and a bowl of fruit on top. 🌷🍎" },
      modelPath:   MODELS.sideboard,
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
    // Natural: 1.750W × 1.930H × 0.570D, base-at-origin, cY=0.965.
    // Rotated [0,π/2,0]: post-rotation X=0.570 (depth), Z=1.750 (along wall).
    // fitSize [0.6, 2.0, 1.75]: autoScale 1.0 → exact natural size.
    // position Y = 0.965. West inner face x=−3.9; center x=−3.9+0.570/2=−3.62.
    {
      id:          "china-cabinet",
      type:        "furniture",
      label:       "China Cabinet",
      position:    [-3.62, 0.965, 0],
      size:        [0.6, 2.0, 1.75],
      color:       0x8B6040,
      interaction: { kind: "dialog", message: "A glass-fronted china cabinet. Nana's fine china lives here — no touching! 🫖" },
      modelPath:     MODELS.chinaCabinet,
      modelRotation: [0, Math.PI / 2, 0],
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
      modelPath:     MODELS.lightSwitch,
      // East wall — rotate to face west (−X) into the room.
      modelRotation: [0, -Math.PI / 2, 0],
    },

    // ── Floor lamp — north-west corner ───────────────────────────────────────
    {
      id:        "floor-lamp",
      type:      "lamp",
      position:  [-2.5, 0, -2.5],
      modelPath: MODELS.lamp,
    },
  ],
};
