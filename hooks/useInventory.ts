"use client";

import { useState, useCallback } from "react";
import type { InventoryItem, ItemCategory } from "@/lib/inventory";

export interface EquippedItems {
  top:      InventoryItem | null;
  bottom:   InventoryItem | null;
  outerwear: InventoryItem | null;
}

export interface UseInventoryResult {
  equipped: EquippedItems;
  equip:    (item: InventoryItem) => void;
  unequip:  (category: ItemCategory) => void;
}

export function useInventory(): UseInventoryResult {
  const [equipped, setEquipped] = useState<EquippedItems>({
    top: null, bottom: null, outerwear: null,
  });

  const equip = useCallback((item: InventoryItem) => {
    setEquipped((prev) => ({ ...prev, [item.category]: item }));
  }, []);

  const unequip = useCallback((category: ItemCategory) => {
    setEquipped((prev) => ({ ...prev, [category]: null }));
  }, []);

  return { equipped, equip, unequip };
}
