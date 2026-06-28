import type { RoomManifest } from "@/engine/loaders/types";

/**
 * The landing / upstairs hallway — 12×5 units (≈ 6m × 2.5m real-world).
 * A wide horizontal landing connecting all the rooms on this floor.
 *
 * Top-down layout (north = -Z, south = +Z, east = +X, west = -X):
 *
 *   ┌────────────────────────────────────────────────┐
 *   │  [Sibling's]      [Bunny's Room →tutorial]    │
 *   │                                         [Bath] │
 *   │                                                │
 *   │             [Parents']                         │
 *   [Family Area] ──────────────────────────────────
 *
 *   North wall (-Z) : children's rooms (right cluster)
 *   East wall  (+X) : bathroom
 *   South wall (+Z) : parents' bedroom  ← camera looks in from here (panels hidden)
 *   West wall  (-X) : family area / corridor to kitchen + dining room
 *
 * Door positions mirror real proportions: siblings at x≈+1.8, Bunny at x≈+4.0,
 * parents at x≈+2.9 (midpoint of the kids), bathroom and family area centred on
 * their respective walls.
 */
export const HALLWAY_ROOM: RoomManifest = {
  id:         "hallway",
  background: 0xBFB5A0,
  dimensions: { width: 12, depth: 5, wallHeight: 3, wallThick: 0.2 },

  // Wide X range for the corridor, narrow Z (the hallway is shallow)
  bounds: { min: -4.5, max: 4.5, minX: -4.8, maxX: 4.8, minZ: -1.8, maxZ: 1.8 },

  bunnyStart: [3.5, -1.0],   // spawns near Bunny's Room door on the north wall

  wallColor:  0xD4CABC,
  floorColor: 0x9E7E58,
  windows:    [],             // interior landing — no windows

  // Hide south panels so the camera (behind the south wall) can see the room
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [2, 8, 4],
    sunIntensity:     1.0,
    ambientIntensity: 0.65,
  },

  objects: [
    // ── North wall — children's rooms (right side cluster) ────────────────────

    // Mr. Bunny's bedroom — right side, near east wall
    {
      id:          "door-bedroom",
      type:        "furniture",
      label:       "Bunny's Room",
      position:    [4.0,  1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "tutorial" },
    },

    // Sibling's room — left of Bunny's room, proportional gap
    {
      id:          "door-sibling",
      type:        "furniture",
      label:       "Sibling's Room",
      position:    [1.8,  1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "Your sibling's room. It's suspiciously quiet in there… 🐾" },
    },

    // ── East wall — bathroom ──────────────────────────────────────────────────

    // Door width is along Z (0.9), thickness along X (0.15)
    {
      id:          "door-bathroom",
      type:        "furniture",
      label:       "Bathroom",
      position:    [5.5,  1.1,  0],
      size:        [0.15, 2.2,  0.9],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "The bathroom. Fresh towels, shiny tiles, and the scent of lavender. 🛁" },
    },

    // ── South wall — parents' bedroom ─────────────────────────────────────────
    // Positioned at the midpoint of the two kids' door x-coordinates (4.0 + 1.8) / 2 = 2.9

    {
      id:          "door-parents",
      type:        "furniture",
      label:       "Parents' Room",
      position:    [2.9,  1.1,  2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "Mum and Dad's room. Always best to knock first! 🚪" },
    },

    // ── West wall — corridor to family area ───────────────────────────────────

    // Door width is along Z (0.9), thickness along X (0.15)
    {
      id:          "door-family",
      type:        "furniture",
      label:       "Family Area",
      position:    [-5.5, 1.1,  0],
      size:        [0.15, 2.2,  0.9],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "A corridor leads to the kitchen and dining room. Coming soon! 🍽️" },
    },
  ],
};
