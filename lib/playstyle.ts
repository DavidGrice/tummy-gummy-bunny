export type Playstyle = "story" | "explorer";

const KEY = "tgb_playstyle";

export function getPlaystyle(): Playstyle | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "story" || v === "explorer" ? v : null;
}

export function setPlaystyle(ps: Playstyle): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, ps);
}
