export type ItemCategory = "top" | "bottom" | "outerwear";

export interface InventoryItem {
  id:       string;
  name:     string;
  emoji:    string;
  category: ItemCategory;
  colorHex: number; // reserved for future 3D clothing mesh color
}

export const WARDROBE_ITEMS: InventoryItem[] = [
  { id: "raincoat", name: "Raincoat",  emoji: "🧥", category: "outerwear", colorHex: 0x4A90D9 },
  { id: "longcoat", name: "Long Coat", emoji: "🥼", category: "outerwear", colorHex: 0xD4B896 },
  { id: "hoodie",   name: "Hoodie",    emoji: "🎽", category: "outerwear", colorHex: 0x7A7A7A },
  { id: "scarf",    name: "Scarf",     emoji: "🧣", category: "outerwear", colorHex: 0xC0392B },
];

export const DRESSER_ITEMS: InventoryItem[] = [
  { id: "tshirt",   name: "T-Shirt",   emoji: "👕", category: "top",    colorHex: 0xFFFFFF },
  { id: "vest",     name: "Vest",      emoji: "🦺", category: "top",    colorHex: 0xFFA500 },
  { id: "buttonup", name: "Button-Up", emoji: "👔", category: "top",    colorHex: 0x4FC3F7 },
  { id: "jeans",    name: "Jeans",     emoji: "👖", category: "bottom", colorHex: 0x1A237E },
  { id: "shorts",   name: "Shorts",    emoji: "🩳", category: "bottom", colorHex: 0x388E3C },
  { id: "sundress", name: "Sundress",  emoji: "👗", category: "bottom", colorHex: 0xF06292 },
];
