export type GameState = "loading" | "playing" | "paused" | "cutscene";

export interface ClickTarget {
  id: string;
  label: string;
  onInteract: () => void;
}

export interface DialogLine {
  speaker: string;
  text: string;
}
