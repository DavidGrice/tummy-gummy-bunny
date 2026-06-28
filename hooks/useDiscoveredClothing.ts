"use client";

import { useState, useCallback } from "react";
import { WARDROBE_ITEMS, DRESSER_ITEMS } from "@/lib/inventory";

const KEY = "tgb_clothing_discovered";

function load(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
  } catch { return new Set(); }
}

function persist(ids: Set<string>): void {
  try { localStorage.setItem(KEY, JSON.stringify([...ids])); } catch { /* unavailable */ }
}

/**
 * Tracks which clothing items the player has "discovered" by visiting the
 * wardrobe or dresser. Starts empty — items only appear in the inventory
 * grid once the player has interacted with their source furniture.
 */
export function useDiscoveredClothing() {
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(() => load());

  const discoverSource = useCallback((source: "wardrobe" | "dresser") => {
    const newItems = source === "wardrobe" ? WARDROBE_ITEMS : DRESSER_ITEMS;
    setDiscoveredIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const item of newItems) {
        if (!next.has(item.id)) { next.add(item.id); changed = true; }
      }
      if (changed) persist(next);
      return changed ? next : prev;
    });
  }, []);

  return { discoveredIds, discoverSource };
}
