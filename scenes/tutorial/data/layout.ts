/** Room dimensions */
export const ROOM = {
  width:      8,
  depth:      8,
  wallHeight: 3,
  wallThick:  0.2,
} as const;

/** Walkable bounds (inset from walls so bunny stays clear) */
export const BOUNDS = { min: -3.0, max: 3.0 } as const;

/** Bunny starting position [x, z] */
export const BUNNY_START = [0, 1] as const;

/** Interactable objects: position [x, y, z], size [w, h, d] */
export const OBJECTS = {
  wardrobe: {
    name:     "Wardrobe",
    position: [-2.5, 0, -3.0] as const,
    size:     [1.2,  2.2,  0.5] as const,
    color:    0x8B5A3C,
  },
  dresser: {
    name:     "Dresser",
    position: [2.5, 0, -3.0] as const,
    size:     [1.2, 1.0, 0.6] as const,
    color:    0x6B4423,
  },
  door: {
    name:     "Door",
    position: [0, 0, 3.5] as const,
    size:     [0.9, 2.2, 0.15] as const,
    color:    0x5C3D1E,
  },
} as const;

/** Wall color */
export const WALL_COLOR  = 0xEDD9B4;
/** Floor color */
export const FLOOR_COLOR = 0xC8A878;
