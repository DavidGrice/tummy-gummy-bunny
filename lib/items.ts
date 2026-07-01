export type ItemCategory = "food" | "key" | "tool" | "quest" | "misc";

export interface CollectableItem {
  id:          string;
  name:        string;
  emoji:       string;
  category:    ItemCategory;
  description: string;
  /**
   * Side effect fired by GameCanvas when this item is first collected.
   * Add new unlock types here as puzzle complexity grows.
   */
  unlock?:     "minimap";
}

export interface CollectedItem {
  item:     CollectableItem;
  quantity: number;
}

export const INVENTORY_GRID_SIZE = 12; // 3 columns × 4 rows

export const GAME_ITEMS: CollectableItem[] = [
  {
    id:          "golden-key",
    name:        "Golden Key",
    emoji:       "🔑",
    category:    "key",
    description: "A small golden key, warm to the touch. It must open something important.",
  },
  {
    id:          "house-map",
    name:        "House Map",
    emoji:       "🗺️",
    category:    "quest",
    description: "A hand-drawn map of the whole house. Every room is labelled!",
    unlock:      "minimap",
  },
];
