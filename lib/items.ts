export type ItemCategory = "food" | "key" | "tool" | "quest" | "misc";

export interface CollectableItem {
  id:          string;
  name:        string;
  emoji:       string;
  category:    ItemCategory;
  description: string;
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
    emoji:       "🗝",
    category:    "key",
    description: "A small golden key, warm to the touch. It must open something important.",
  },
];
