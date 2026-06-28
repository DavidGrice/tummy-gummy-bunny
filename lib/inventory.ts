export type ItemCategory = "top" | "bottom" | "outerwear";

export interface InventoryItem {
  id:          string;
  name:        string;
  emoji:       string;
  category:    ItemCategory;
  colorHex:    number;
  description: string;
}

export const WARDROBE_ITEMS: InventoryItem[] = [
  { id: "raincoat", name: "Raincoat",  emoji: "🧥", category: "outerwear", colorHex: 0x4A90D9, description: "A waterproof blue coat, perfect for drizzly mornings in the countryside." },
  { id: "longcoat", name: "Long Coat", emoji: "🥼", category: "outerwear", colorHex: 0xD4B896, description: "A warm, elegant coat in earthy tones. Very distinguished." },
  { id: "hoodie",   name: "Hoodie",    emoji: "🎽", category: "outerwear", colorHex: 0x7A7A7A, description: "Soft, grey, and oh-so-comfortable. The weekend essential." },
  { id: "scarf",    name: "Scarf",     emoji: "🧣", category: "outerwear", colorHex: 0xC0392B, description: "A bright red scarf to keep your neck toasty on chilly days." },
];

// Shared snapshot type — used by both engine (ClothingLayers) and React hooks
export interface EquippedClothing {
  outerwear: InventoryItem | null;
  top:       InventoryItem | null;
  bottom:    InventoryItem | null;
}

export const DRESSER_ITEMS: InventoryItem[] = [
  { id: "tshirt",   name: "T-Shirt",   emoji: "👕", category: "top",    colorHex: 0xFFFFFF, description: "A crisp white tee. Simple, clean, and ready for anything." },
  { id: "vest",     name: "Vest",      emoji: "🦺", category: "top",    colorHex: 0xFFA500, description: "A bright orange vest. Stand out from the crowd!" },
  { id: "buttonup", name: "Button-Up", emoji: "👔", category: "top",    colorHex: 0x4FC3F7, description: "A smart light-blue button-up. Perfect for busy days." },
  { id: "jeans",    name: "Jeans",     emoji: "👖", category: "bottom", colorHex: 0x1A237E, description: "Classic navy jeans that go with absolutely everything." },
  { id: "shorts",   name: "Shorts",    emoji: "🩳", category: "bottom", colorHex: 0x388E3C, description: "Breezy green shorts for warmer, sunnier days." },
  { id: "sundress", name: "Sundress",  emoji: "👗", category: "bottom", colorHex: 0xF06292, description: "A cheerful pink sundress, as bright as summer itself." },
];
