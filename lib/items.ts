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

// Populated as game content grows — start empty
export const GAME_ITEMS: CollectableItem[] = [];
