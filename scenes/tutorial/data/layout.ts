/** Room dimensions */
export const ROOM = {
  width:      8,
  depth:      8,
  wallHeight: 3,
  wallThick:  0.2,
} as const;

/** Walkable bounds (inset from walls so bunny stays clear of furniture) */
export const BOUNDS = { min: -3.0, max: 3.0 } as const;

/** Bunny starting position [x, z] */
export const BUNNY_START = [0, 1] as const;

/** Interactable objects: position [x, y, z], size [w, h, d] */
export const OBJECTS = {
  // Left wall (west) — tall, thin depth into room, wide face along wall
  wardrobe: {
    name:     "Wardrobe",
    position: [-3.65, 0, 0] as const,
    size:     [0.5, 2.2, 1.2] as const,
    color:    0x8B5A3C,
  },
  // North wall — wide dresser centered under the windows
  dresser: {
    name:     "Dresser",
    position: [0, 0, -3.65] as const,
    size:     [1.6, 1.0, 0.5] as const,
    color:    0x6B4423,
  },
  // South wall — door (unchanged)
  door: {
    name:     "Door",
    position: [0, 0, 3.5] as const,
    size:     [0.9, 2.2, 0.15] as const,
    color:    0x5C3D1E,
  },
  // Right wall (east) — bed laid along z, headboard toward north wall
  bed: {
    name:     "Bed",
    position: [3.4, 0, -0.5] as const,
    size:     [1.0, 0.5, 2.2] as const,
    color:    0x8B4513,
  },
} as const;

/** Pickup items: world [x, z] positions (y is set by the item factory) */
export const ITEMS = {
  goldenKey: {
    position: [0.8, 1.2] as const,
  },
} as const;

/** Window positions on the north wall [x, y] pairs */
export const WINDOWS = [
  { x: -1.0, y: 1.75 },
  { x:  1.0, y: 1.75 },
] as const;

/** Wall color */
export const WALL_COLOR  = 0xEDD9B4;
/** Floor color */
export const FLOOR_COLOR = 0xC8A878;
