export type DialogFn = (message: string) => void;

export interface TutorialInteractions {
  wardrobe: () => void;
  dresser:  () => void;
  door:     () => void;
}

export function createInteractions(onDialog: DialogFn): TutorialInteractions {
  return {
    wardrobe: () =>
      onDialog("Mr. Bunny opens the wardrobe... so many outfits to choose from! 🐰"),
    dresser: () =>
      onDialog("A hairbrush, some keys, and a carrot snack. Better not forget those!"),
    door: () =>
      onDialog("This door leads to the living room. Almost ready for the day!"),
  };
}
