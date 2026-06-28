export type DialogFn        = (message: string) => void;
export type InventorySource = "wardrobe" | "dresser";
export type InventoryFn     = (source: InventorySource) => void;
export type PickupFn        = (itemId: string) => void;
export type JournalFn       = () => void;

export interface TutorialInteractions {
  wardrobe: () => void;
  dresser:  () => void;
  door:     () => void;
  bed:      () => void;
  journal:  () => void;
}

export function createInteractions(
  onDialog:    DialogFn,
  onInventory: InventoryFn,
  onJournal:   JournalFn,
  playerName:  string,
): TutorialInteractions {
  return {
    wardrobe: () => onInventory("wardrobe"),
    dresser:  () => onInventory("dresser"),
    door:     () => onDialog("This door leads to the living room. Almost ready for the day!"),
    bed:      () => onDialog(`${playerName} yawns... maybe just five more minutes? 😴`),
    journal:  () => onJournal(),
  };
}
