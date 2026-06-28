import type { RoomManifest } from "@/engine/loaders/types";

/**
 * The landing / upstairs hallway — 12×5 units (≈ 6m × 2.5m real-world).
 * A wide horizontal landing connecting all the rooms on this floor.
 *
 * Top-down layout (north = -Z, south = +Z, east = +X, west = -X):
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │        [Sibling's]            [Bunny's Room]         │
 *   │                                              [Bath]  │
 *   │                                                      │
 *   │                   [Parents']                         │
 *   [Family Area] ────────────────────────────────────────
 *
 *   North wall (-Z) : Sibling x≈−1.5 | Bunny x≈+4.5 (spread across wall)
 *   East wall  (+X) : bathroom (z=0, centred)
 *   South wall (+Z) : parents' bedroom x≈+1.5 (midpoint of kids, camera side)
 *   West wall  (-X) : family area / corridor to kitchen + dining room
 */
export const HALLWAY_ROOM: RoomManifest = {
  id:         "hallway",
  background: 0xBFB5A0,
  dimensions: { width: 12, depth: 5, wallHeight: 3, wallThick: 0.2 },

  // Wide X range for the corridor, narrow Z (the hallway is shallow)
  bounds: { min: -4.5, max: 4.5, minX: -4.8, maxX: 4.8, minZ: -1.8, maxZ: 1.8 },

  bunnyStart: [2.0, -1.0],   // spawns near Bunny's Room door on the north wall

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

    // Mr. Bunny's bedroom — right-centre of north wall, 2 units left of original
    {
      id:          "door-bedroom",
      type:        "furniture",
      label:       "Bunny's Room",
      position:    [2.5,  1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "tutorial" },
    },

    // Sibling's room — further left on the north wall
    {
      id:          "door-sibling",
      type:        "furniture",
      label:       "Sibling's Room",
      position:    [-3.5, 1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "sibling" },
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
      interaction: { kind: "scene-change", targetRoomId: "bathroom" },
    },

    // ── South wall — parents' bedroom ─────────────────────────────────────────
    // Midpoint of the two kids' door x-coordinates: (2.5 + -3.5) / 2 = -0.5

    {
      id:          "door-parents",
      type:        "furniture",
      label:       "Parents' Room",
      position:    [-0.5, 1.1,  2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "parents" },
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
