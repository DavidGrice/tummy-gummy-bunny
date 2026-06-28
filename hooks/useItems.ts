"use client";

import { useState, useCallback } from "react";
import type { CollectableItem, CollectedItem } from "@/lib/items";

const KEY = "tgb_items";

function load(): CollectedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? (JSON.parse(saved) as CollectedItem[]) : [];
  } catch { return []; }
}

function persist(items: CollectedItem[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* unavailable */ }
}

export function useItems() {
  const [items, setItems] = useState<CollectedItem[]>(() => load());

  const addItem = useCallback((item: CollectableItem) => {
    setItems((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      const next = existing
        ? prev.map((c) => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { item, quantity: 1 }];
      persist(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev
        .map((c) => c.item.id === id ? { ...c, quantity: c.quantity - 1 } : c)
        .filter((c) => c.quantity > 0);
      persist(next);
      return next;
    });
  }, []);

  return { items, addItem, removeItem };
}
