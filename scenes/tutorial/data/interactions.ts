export type DialogFn    = (message: string) => void;
export type InventorySource = "wardrobe" | "dresser";
export type InventoryFn = (source: InventorySource) => void;

export interface TutorialInteractions {
  wardrobe: () => void;
  dresser:  () => void;
  door:     () => void;
  bed:      () => void;
}

export function createInteractions(
  onDialog:    DialogFn,
  onInventory: InventoryFn,
): TutorialInteractions {
  return {
    wardrobe: () => onInventory("wardrobe"),
    dresser:  () => onInventory("dresser"),
    door:     () => onDialog("This door leads to the living room. Almost ready for the day!"),
    bed:      () => onDialog("Mr. Bunny yawns... maybe just five more minutes? 😴"),
  };
}
