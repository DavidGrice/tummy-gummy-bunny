import type { Quest } from "@/lib/journal";

/**
 * All quest data — 11 sequential quests for Day 1.
 * Each quest is locked until its prerequisite (`unlockedBy`) is complete.
 * No fail states; objectives auto-complete when their flag/item condition is met.
 *
 * Flag keys written by:
 *   tgb_journal_found       — handleJournalOpen() in GameCanvas (book object or FAB)
 *   tgb_wardrobe_visited    — useEffect on inventorySource in GameCanvas
 *   tgb_dresser_visited     — useEffect on inventorySource in GameCanvas
 *   tgb_visited_{roomId}    — switchRoom() in useGame
 *   tgb_sink_used           — flagKey on bathroom sink object
 *   tgb_tv_watched          — flagKey on living room TV object
 *   tgb_mailbox_checked     — flagKey on outside mailbox object
 *   tgb_bench_used          — flagKey on neighbourhood bench object
 *   tgb_bed_rested          — flagKey on tutorial bed object
 */
export const QUESTS: Quest[] = [
  // ─── 1 ───────────────────────────────────────────────────────────────────────
  {
    id:      "first-steps",
    title:   "First Steps",
    heading: "A Brand New Day!",
    date:    "Day 1, Morning",
    body:    "Good morning! It looks like it's going to be a wonderful day full of adventures.\n\nYour journal is sitting right there — tap it to see what adventures are waiting for you today. It'll keep track of everything you do!",
    objectives: [
      {
        id:      "open-journal",
        label:   "Find your journal",
        trigger: { kind: "flag", key: "tgb_journal_found" },
      },
    ],
    completed: false,
    hints:     ["The journal is on top of the Dresser near the back wall — or just tap the book icon!"],
  },

  // ─── 2 ───────────────────────────────────────────────────────────────────────
  {
    id:         "get-dressed",
    title:      "Getting Dressed",
    heading:    "Time to Get Ready!",
    date:       "Day 1, Morning",
    unlockedBy: "first-steps",
    body:       "Great start! Now let's get dressed and ready for the day.\n\nPick something cozy from the Wardrobe, then mix and match at the Dresser. You can check what you're wearing any time by tapping the bag icon in the corner.",
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
      "The Dresser is against the back wall near the windows.",
    ],
  },

  // ─── 3 ───────────────────────────────────────────────────────────────────────
  {
    id:         "find-the-key",
    title:      "Ready to Go",
    heading:    "Before You Head Out!",
    date:       "Day 1, Morning",
    unlockedBy: "get-dressed",
    body:       "You're looking sharp! But before you head out, take a moment to explore your room.\n\nThere's a house map on the desk — grab it so you don't get lost out there. And look carefully around the floor too… something glints in the morning light. 🗺️🔑",
    objectives: [
      {
        id:      "find-house-map",
        label:   "Pick up the house map",
        trigger: { kind: "item", itemId: "house-map" },
      },
      {
        id:      "find-golden-key",
        label:   "Find the golden key",
        trigger: { kind: "item", itemId: "golden-key" },
      },
    ],
    completed: false,
    hints: [
      "The house map is on the Desk near the back wall — grab it before you go!",
      "Something glints on the floor near the door…",
    ],
  },

  // ─── 4 ───────────────────────────────────────────────────────────────────────
  {
    id:         "explore-upstairs",
    title:      "Explore Upstairs",
    heading:    "Out Into the Hall!",
    date:       "Day 1, Morning",
    unlockedBy: "find-the-key",
    body:       "Key in pocket — time to explore! The upstairs landing connects all the family rooms.\n\nStep out into the Hallway and have a peek in the Bathroom while you're up here. Every adventure starts with fresh ears.",
    objectives: [
      {
        id:      "visit-hallway",
        label:   "Step into the Hallway",
        trigger: { kind: "flag", key: "tgb_visited_hallway" },
      },
      {
        id:      "visit-bathroom",
        label:   "Peek in the Bathroom",
        trigger: { kind: "flag", key: "tgb_visited_bathroom" },
      },
    ],
    completed: false,
    hints: [
      "The door on the south wall of your room leads to the Hallway.",
      "The Bathroom is through the east side of the Hallway.",
    ],
  },

  // ─── 5 ───────────────────────────────────────────────────────────────────────
  {
    id:         "freshen-up",
    title:      "Freshen Up",
    heading:    "A Quick Wash!",
    date:       "Day 1, Morning",
    unlockedBy: "explore-upstairs",
    body:       "You found the Bathroom! You're in the right place.\n\nGive your face a quick wash at the sink before the big day begins. You'll feel much better for it.",
    objectives: [
      {
        id:      "use-sink",
        label:   "Use the bathroom sink",
        trigger: { kind: "flag", key: "tgb_sink_used" },
      },
    ],
    completed: false,
    hints:     ["The sink is on the east wall of the Bathroom."],
  },

  // ─── 6 ───────────────────────────────────────────────────────────────────────
  {
    id:         "downstairs",
    title:      "Heading Downstairs",
    heading:    "Down We Go!",
    date:       "Day 1, Morning",
    unlockedBy: "freshen-up",
    body:       "Fresh face — check! Now it's time to see the rest of the house.\n\nMake your way downstairs. Pass through the Dining Room and find the Kitchen. Someone might have left breakfast on the counter…",
    objectives: [
      {
        id:      "visit-kitchen",
        label:   "Find the Kitchen",
        trigger: { kind: "flag", key: "tgb_visited_kitchen" },
      },
    ],
    completed: false,
    hints: [
      "Head west through the Hallway to the Dining Room.",
      "The Kitchen is south of the Dining Room.",
    ],
  },

  // ─── 7 ───────────────────────────────────────────────────────────────────────
  {
    id:         "family-morning",
    title:      "A Family Morning",
    heading:    "Cosy Family Time",
    date:       "Day 1, Morning",
    unlockedBy: "downstairs",
    body:       "The kitchen smells amazing! After a bite, it's time to settle in with the family.\n\nHead through to the Living Room and catch a bit of telly. The best adventures always start with a good sit-down.",
    objectives: [
      {
        id:      "watch-tv",
        label:   "Watch the TV",
        trigger: { kind: "flag", key: "tgb_tv_watched" },
      },
    ],
    completed: false,
    hints:     ["The Living Room is east of the Kitchen. Click the TV to watch cartoons!"],
  },

  // ─── 8 ───────────────────────────────────────────────────────────────────────
  {
    id:         "check-the-post",
    title:      "Check the Post",
    heading:    "Any Letters Today?",
    date:       "Day 1, Midday",
    unlockedBy: "family-morning",
    body:       "Right, time to get some fresh air!\n\nHead out to the Front Garden through the living room door. Check the mailbox on the east side of the garden — it looks like something arrived for the family today.",
    objectives: [
      {
        id:      "visit-outside",
        label:   "Head to the Front Garden",
        trigger: { kind: "flag", key: "tgb_visited_outside" },
      },
      {
        id:      "check-mailbox",
        label:   "Check the Mailbox",
        trigger: { kind: "flag", key: "tgb_mailbox_checked" },
      },
    ],
    completed: false,
    hints: [
      "The front door is on the south wall of the Living Room.",
      "The Mailbox is on the east side of the garden.",
    ],
  },

  // ─── 9 ───────────────────────────────────────────────────────────────────────
  {
    id:         "neighbourhood-stroll",
    title:      "A Neighbourhood Stroll",
    heading:    "Beyond the Fence!",
    date:       "Day 1, Afternoon",
    unlockedBy: "check-the-post",
    body:       "The white gate at the bottom of the garden leads to the street outside.\n\nThere's a whole neighbourhood out there! Take a stroll and find somewhere to sit for a moment. Watch the world go by.",
    objectives: [
      {
        id:      "visit-neighbourhood",
        label:   "Explore the Neighbourhood",
        trigger: { kind: "flag", key: "tgb_visited_neighborhood" },
      },
      {
        id:      "sit-on-bench",
        label:   "Sit on the bench",
        trigger: { kind: "flag", key: "tgb_bench_used" },
      },
    ],
    completed: false,
    hints: [
      "Click the white gate at the south of the Front Garden.",
      "There's a bench near the north of the Neighbourhood street.",
    ],
  },

  // ─── 10 ──────────────────────────────────────────────────────────────────────
  {
    id:         "back-home",
    title:      "Back Home",
    heading:    "Home Sweet Home",
    date:       "Day 1, Evening",
    unlockedBy: "neighbourhood-stroll",
    body:       "What a day! It's time to head back inside and say goodnight to everyone.\n\nPop in to see Mum and Dad in the Parents' Room before bed — they'd love to hear about your adventures today.",
    objectives: [
      {
        id:      "visit-parents",
        label:   "Say goodnight to Parents",
        trigger: { kind: "flag", key: "tgb_visited_parents" },
      },
    ],
    completed: false,
    hints:     ["The Parents' Room is on the south side of the Hallway."],
  },

  // ─── 11 ──────────────────────────────────────────────────────────────────────
  {
    id:         "goodnight",
    title:      "Sweet Dreams",
    heading:    "Time for Bed!",
    date:       "Day 1, Night",
    unlockedBy: "back-home",
    body:       "What an amazing day! You've explored every corner of the house, ventured out into the neighbourhood, and made some wonderful memories.\n\nNow it's time to rest. Head back to your room and snuggle up in that cosy bed. You've earned it. Sweet dreams! 🌙",
    objectives: [
      {
        id:      "rest-in-bed",
        label:   "Rest in your cosy bed",
        trigger: { kind: "flag", key: "tgb_bed_rested" },
      },
    ],
    completed: false,
    hints:     ["Your bed is in your room — right where you started this morning!"],
  },
];
