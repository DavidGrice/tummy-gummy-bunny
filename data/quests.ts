import type { Quest } from "@/lib/journal";

/**
 * All quest data for the game.
 * Add new quests here — no component or hook changes needed.
 *
 * Objective triggers:
 *   { kind: "item",   itemId: "..." }  — complete when item is picked up
 *   { kind: "flag",   key:    "..." }  — complete when localStorage flag === "true"
 *   { kind: "manual" }                 — complete via explicit game event
 */
export const QUESTS: Quest[] = [
  {
    id:      "getting-dressed",
    title:   "Getting Dressed",
    heading: "Time to Get Ready!",
    date:    "Day 1, Morning",
    body:    "Good morning! Before heading out into the world, you'll want to look your best.\n\nPick something cozy from the Wardrobe, then mix and match at the Dresser. You can check what you're wearing any time by tapping the bag icon in the corner.",
    objectives: [
      {
        id:      "visit-wardrobe",
        label:   "Open the Wardrobe",
        trigger: { kind: "flag", key: "tgb_wardrobe_visited" },
      },
      {
        id:      "visit-dresser",
        label:   "Browse the Dresser",
        trigger: { kind: "flag", key: "tgb_dresser_visited" },
      },
    ],
    completed: false,
    hints: [
      "The Wardrobe is on the left wall.",
      "The Dresser is against the back wall.",
      "Tap 🎒 any time to see what you're wearing.",
    ],
  },
  {
    id:      "ready-to-go",
    title:   "Ready to Go?",
    heading: "Checking the Door",
    date:    "Day 1, Morning",
    body:    "Once you're all dressed and feeling good, it's time to head out.\n\nBut wait — something feels missing. Have a look around the room before you go. You never know what you might find.",
    objectives: [
      {
        id:      "find-golden-key",
        label:   "Find the golden key",
        trigger: { kind: "item", itemId: "golden-key" },
      },
    ],
    completed: false,
    hints: [
      "Look carefully around the room — something sparkles!",
      "Click the door once you feel ready.",
    ],
  },
  {
    id:      "good-rest",
    title:   "A Good Night's Rest",
    heading: "Sweet Dreams",
    date:    "Day 1, Evening",
    body:    "After a long and busy day, every bunny deserves some rest.\n\nClick on the cozy bed on the right side of the room to take a well-earned nap. You've done wonderfully today!\n\nSweet dreams.",
    objectives: [
      {
        id:      "sleep-in-bed",
        label:   "Rest in the cozy bed",
        trigger: { kind: "flag", key: "tgb_bed_rested" },
      },
    ],
    completed: false,
    hints: [
      "The bed is on the right side of the room.",
    ],
  },
];
