import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Sibling's bedroom — 7×7 units (slightly smaller than Bunny's 8×8).
 * Located north of the hallway, west side. Entered from the south wall.
 *
 * Top-down layout (north = −Z, south = +Z, east = +X, west = −X):
 *
 *   ┌────────────────────────────────┐
 *   │  [Bookshelf]    [Desk]         │
 *   │                                │
 *   [Bed]                            │
 *   │                    [Crate]     │
 *   │             [Door to Hallway]  │
 *   └────────────────────────────────┘
 *
 *   South wall (+Z) : door to hallway (centred) — wall is hidden (camera side)
 *   West wall (−X)  : bed (horizontal placement)
 *   North wall (−Z) : bookshelf (west) + desk (east)
 *   South-east      : supply crate
 */
export const SIBLING_ROOM: RoomManifest = {
  id:         "sibling",
  background: 0xD0D4E8,
  dimensions: { width: 7, depth: 7, wallHeight: 3, wallThick: 0.2 },

  bounds: { min: -2.6, max: 2.6 },

  // Spawn just inside the south door
  bunnyStart: [0, 2.5],

  wallColor:  0xDCDFF0,
  floorColor: 0xA8A8C4,

  // Two windows on the north wall — one above the bookshelf gap, one above the desk
  windows: [
    { x: -2.2, y: 1.75 },
    { x:  1.8, y: 1.75 },
  ],
  windowModelPath: MODELS.window,

  // South door faces camera
  doorId:      "door",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [1, 9, 5],
    sunIntensity:     1.05,
    ambientIntensity: 0.68,
    ambientColor:     0xF5F0FF, // soft purple-white
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

    // ── West wall — bed ───────────────────────────────────────────────────────
    // West inner face at x = -(7/2 - 0.1) = -3.4. Left face flush: x = -3.4 + 1.0/2 = -2.9
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [-2.9, 0.25, -0.5],
      size:        [1.0, 0.5, 2.2],
      color:       0x7B5EA7,  // purple bedding
      interaction: { kind: "dialog", message: "This bed looks like a very comfortable nest. Very on-brand. 🛏️" },
    },

    // ── North wall, west side — tall bookshelf ────────────────────────────────
    // North inner face at z = -(7/2 - 0.1) = -3.4. Back face flush: z = -3.4 + 0.5/2 = -3.15
    {
      id:          "bookshelf",
      type:        "furniture",
      label:       "Bookshelf",
      position:    [-0.5, 1.1, -3.15],
      size:        [1.4, 2.2, 0.5],
      color:       0x6B4A2A,
      interaction: { kind: "dialog", message: "Comics, sketchbooks, and a wobbly tower of puzzle boxes. 📚" },
    },

    // ── North wall, east side — desk ──────────────────────────────────────────
    // Back face flush: z = -3.4 + 0.6/2 = -3.1
    {
      id:          "desk",
      type:        "furniture",
      label:       "Desk",
      position:    [1.5, 0.45, -3.1],
      size:        [1.4, 0.9, 0.6],
      color:       0x4A6B8A,  // blue-grey desk — different from Bunny's white
      interaction: { kind: "dialog", message: "A desk buried under pencil shavings and half-finished drawings. ✏️" },
    },

    // ── Sketchbook on the desk ────────────────────────────────────────────────
    // Desk top = 0.45 + 0.9/2 = 0.9. Book center y = 0.9 + 0.04/2 = 0.92
    {
      id:          "sketchbook",
      type:        "book",
      label:       "Sketchbook",
      position:    [1.2, 0.92, -3.0],
      size:        [0.3, 0.04, 0.24],
      color:       0x3A5A7A,
      interaction: { kind: "dialog", message: "Your sibling's sketchbook. Page after page of wild creature doodles. Don't show these to anyone. 🎨" },
    },

    // ── Light switch — west wall, near the south entrance ────────────────────
    // West inner face at x = -(7/2 - 0.1) = -3.4. Front face flush: x = -3.4 + 0.06/2 = -3.37
    // z=2.5 puts it at the south end of the west wall so the player reaches it on entry
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [-3.37, 1.2, 2.5],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Supply crate — south-east corner ──────────────────────────────────────
    {
      id:          "supply-crate",
      type:        "furniture",
      label:       "Crate",
      position:    [2.5, 0.3, 2.7],
      size:        [1.2, 0.6, 0.7],
      color:       0x8B6B3A,
      interaction: { kind: "dialog", message: "A crate stuffed with art supplies and building blocks. Everything has glitter on it. ✨" },
    },

    // ── Floor lamp — east wall, centre ───────────────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [2.5, 0, 0],
    },
  ],
};
