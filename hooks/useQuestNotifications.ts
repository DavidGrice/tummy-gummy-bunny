"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUESTS } from "@/data/quests";
import { isObjectiveComplete } from "@/lib/journal";

const SEEN_KEY = "tgb_seen_objectives";

function loadSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(seen: Set<string>): void {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

/** Returns the "questId:objectiveId" keys for every objective currently complete. */
function getCompletedKeys(collectedItemIds: Set<string>): string[] {
  const result: string[] = [];
  for (const quest of QUESTS) {
    for (const obj of quest.objectives) {
      if (isObjectiveComplete(obj, collectedItemIds)) {
        result.push(`${quest.id}:${obj.id}`);
      }
    }
  }
  return result;
}

/**
 * Tracks whether any quest objectives have been newly completed since the
 * player last opened the journal.
 *
 * collectedItemIds — reactive set from useItems(); re-runs the check when items change.
 * flagTick         — increment this whenever a localStorage flag is written
 *                    (e.g. wardrobe/dresser visited) to re-check flag-based objectives.
 */
export function useQuestNotifications(
  collectedItemIds: Set<string>,
  flagTick:         number,
) {
  const seenRef  = useRef<Set<string>>(loadSeen());
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const completed = getCompletedKeys(collectedItemIds);
    setHasUnseen(completed.some((k) => !seenRef.current.has(k)));
  }, [collectedItemIds, flagTick]);

  /** Call when the player opens the journal — clears the dot and persists. */
  const markAllSeen = useCallback(() => {
    const completed = getCompletedKeys(collectedItemIds);
    completed.forEach((k) => seenRef.current.add(k));
    saveSeen(seenRef.current);
    setHasUnseen(false);
  }, [collectedItemIds]);

  return { hasUnseen, markAllSeen };
}
