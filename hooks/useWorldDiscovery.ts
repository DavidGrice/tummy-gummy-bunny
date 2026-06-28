"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "tgb_discovered_rooms";

function load(): Set<string> {
  if (typeof window === "undefined") return new Set(["tutorial"]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : ["tutorial"]);
  } catch {
    return new Set(["tutorial"]);
  }
}

function persist(ids: Set<string>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch { /* */ }
}

export function useWorldDiscovery() {
  const [discoveredIds, setDiscoveredIds] = useState<Set<string>>(load);

  const discover = useCallback((roomId: string) => {
    setDiscoveredIds((prev) => {
      if (prev.has(roomId)) return prev;
      const next = new Set(prev);
      next.add(roomId);
      persist(next);
      return next;
    });
  }, []);

  return { discoveredIds, discover };
}
