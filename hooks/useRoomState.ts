"use client";

import { useCallback, useRef } from "react";

const makeKey = (roomId: string) => `tgb_room_${roomId}_collected`;

function load(roomId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(makeKey(roomId));
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Tracks which pickup items the player has already collected in a given room.
 * Persists to localStorage so collected items don't respawn across sessions.
 *
 * collectedIds is a stable Set reference — mutated in-place, never triggers re-render.
 * markCollected writes to localStorage immediately.
 */
export function useRoomState(roomId: string) {
  const collectedRef = useRef<Set<string>>(load(roomId));

  const markCollected = useCallback((itemId: string) => {
    if (collectedRef.current.has(itemId)) return;
    collectedRef.current.add(itemId);
    try {
      localStorage.setItem(makeKey(roomId), JSON.stringify([...collectedRef.current]));
    } catch {}
  }, [roomId]);

  return {
    /** Stable Set reference — safe to capture in a closure at scene setup time. */
    collectedIds: collectedRef.current,
    /** Call this when a pickup fires to persist it across sessions. */
    markCollected,
  };
}
