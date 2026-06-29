// ─── Objective triggers ───────────────────────────────────────────────────────

export type ObjectiveTrigger =
  | { kind: "item";   itemId: string }   // complete when item is in inventory
  | { kind: "flag";   key:    string }   // complete when localStorage key === "true"
  | { kind: "manual" };                  // no auto-trigger — completed externally

export interface QuestObjective {
  id:      string;
  label:   string;
  trigger: ObjectiveTrigger;
}

// ─── Quest ────────────────────────────────────────────────────────────────────

export interface Quest {
  id:          string;
  title:       string;      // short name shown in left sidebar
  heading:     string;      // large title on right page
  date:        string;      // e.g. "Day 1, Morning"
  body:        string;      // narrative flavour text (not task instructions)
  objectives:  QuestObjective[];
  /** Hard override — true if quest is done regardless of objective state */
  completed:   boolean;
  hints:       string[];
  /** id of the quest that must be completed before this one becomes visible. */
  unlockedBy?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Derive whether a single objective is done. */
export function isObjectiveComplete(
  obj:              QuestObjective,
  collectedItemIds: Set<string>,
): boolean {
  const { trigger } = obj;
  if (trigger.kind === "item") return collectedItemIds.has(trigger.itemId);
  if (trigger.kind === "flag") {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(trigger.key) === "true";
  }
  return false;
}

/** A quest is done when every objective is done, or when completed is hard-set. */
export function isQuestDone(quest: Quest, collectedItemIds: Set<string>): boolean {
  if (quest.completed) return true;
  if (quest.objectives.length === 0) return false;
  return quest.objectives.every((o) => isObjectiveComplete(o, collectedItemIds));
}

/**
 * A quest is unlocked if it has no prerequisite, or if the prerequisite quest is done.
 * Missing prerequisite ids are treated as unlocked (safe fallback).
 */
export function isQuestUnlocked(
  quest:            Quest,
  allQuests:        Quest[],
  collectedItemIds: Set<string>,
): boolean {
  if (!quest.unlockedBy) return true;
  const prereq = allQuests.find((q) => q.id === quest.unlockedBy);
  if (!prereq) return true;
  return isQuestDone(prereq, collectedItemIds);
}
