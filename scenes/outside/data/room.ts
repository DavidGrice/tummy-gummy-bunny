import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Front Garden — 12×8 units.
 * The exterior front of the house. Accessed via the Living Room front door.
 *
 * The north "wall" is the house facade (front door visible).
 * East/west "walls" are hedges / fence.
 * South is open — the camera looks in, garden stretches away.
 *
 * Top-down layout:
 *
 *   ┌──[Flower bed]──[Front Door]──[Flower bed]───┐
 *   │                                              │
 *   │                    [Path]         [Mailbox] │
 *   │                                              │
 *   └──────────────────────────────────────────────┘
 */
export const OUTSIDE_ROOM: RoomManifest = {
  id:         "outside",
  background: 0x87CEEB,
  dimensions: { width: 12, depth: 8, wallHeight: 2.4, wallThick: 0.2 },

  bounds: { min: -3.5, max: 3.5, minX: -5.6, maxX: 5.6, minZ: -3.5, maxZ: 3.5 },

  bunnyStart: [0, -1.5],

  wallColor:  0xC8BE9A,
  floorColor: 0x5A8A40,

  // Two ground-floor windows on the north wall (house facade)
  windows: [
    { x: -2.0, y: 1.35 },
    { x:  2.0, y: 1.35 },
  ],
  windowModelPath: MODELS.window,

  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [4, 12, 3],
    sunIntensity:     1.3,
    ambientIntensity: 0.80,
    ambientColor:     0xD8EEFF,
  },

  objects: [
    // ── North wall — front door back to living room ───────────────────────────
    // North inner face z = −3.9; center z = −3.5
    {
      id:          "door-living",
      type:        "furniture",
      label:       "Living Room",
      position:    [0, 1.1, -3.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x4A3020,
      interaction: { kind: "scene-change", targetRoomId: "living" },
    },

    // ── North wall — flower beds flanking the front door ─────────────────────
    {
      id:          "flower-bed-left",
      type:        "furniture",
      label:       "Flower Bed",
      position:    [-2.5, 0.2, -3.4],
      size:        [1.5, 0.4, 0.5],
      color:       0x4A7A30,
      interaction: { kind: "dialog", message: "A cheerful flower bed. Mum planted these last spring. 🌸" },
    },
    {
      id:          "flower-bed-right",
      type:        "furniture",
      label:       "Flower Bed",
      position:    [2.5, 0.2, -3.4],
      size:        [1.5, 0.4, 0.5],
      color:       0x4A7A30,
      interaction: { kind: "dialog", message: "Another flower bed. Mum would know what these are called. 🌷" },
    },

    // ── South boundary — white picket fence + gate to neighbourhood ──────────
    // Gate width 1.6 → padded gap between fence sections = 0.84 ≥ 0.76 min ✓
    {
      id:          "gate-neighbourhood",
      type:        "furniture",
      label:       "Neighbourhood",
      position:    [0, 0.55, 3.5],
      size:        [1.6, 1.1, 0.1],
      color:       0xF5F2EB,
      interaction: { kind: "scene-change", targetRoomId: "neighborhood" },
    },
    {
      id:          "fence-south-left",
      type:        "furniture",
      label:       "Fence",
      position:    [-3.35, 0.5, 3.5],
      size:        [5.1, 1.0, 0.1],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A neat white picket fence bordering the garden. 🌿" },
    },
    {
      id:          "fence-south-right",
      type:        "furniture",
      label:       "Fence",
      position:    [3.35, 0.5, 3.5],
      size:        [5.1, 1.0, 0.1],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A neat white picket fence bordering the garden. 🌿" },
    },

    // ── East side — mailbox ───────────────────────────────────────────────────
    {
      id:          "mailbox",
      type:        "furniture",
      label:       "Mailbox",
      position:    [4.8, 0.55, 1.5],
      size:        [0.28, 1.1, 0.32],
      color:       0x4A5A6A,
      interaction: { kind: "dialog", message: "The family mailbox. There's a letter sticking out… 📬" },
      flagKey:     "tgb_mailbox_checked",
    },
  ],
};
