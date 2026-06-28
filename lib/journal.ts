export interface Quest {
  id:        string;
  title:     string;   // short name shown in left sidebar
  heading:   string;   // large title on right page
  date:      string;   // e.g. "Day 1, Morning"
  body:      string;   // multi-paragraph quest body
  completed: boolean;
  hints:     string[]; // progressive hints shown below body
}

export const QUESTS: Quest[] = [
  {
    id:        "getting-dressed",
    title:     "Getting Dressed",
    heading:   "Time to Get Ready!",
    date:      "Day 1, Morning",
    body:      "Good morning! Before heading out, you'll want to look your best.\n\nVisit the Wardrobe on the left wall to pick an outerwear — a raincoat, hoodie, or something cozy. Then head to the Dresser against the back wall to choose a top and bottoms.\n\nYou can always check what you're wearing by tapping the bag icon in the corner.",
    completed: false,
    hints:     [
      "The Wardrobe is on the left wall.",
      "The Dresser is against the back wall.",
      "Tap 🎒 any time to see what you're wearing.",
    ],
  },
  {
    id:        "ready-to-go",
    title:     "Ready to Go?",
    heading:   "Checking the Door",
    date:      "Day 1, Morning",
    body:      "Once you're all dressed and feeling good, head to the door to see if you're ready to step out into the world.\n\nIt looks like there might be something you need to take care of first, though...\n\nDon't rush — take your time getting ready!",
    completed: false,
    hints:     [
      "Click on the door to check if you're ready.",
    ],
  },
  {
    id:        "good-rest",
    title:     "A Good Night's Rest",
    heading:   "Sweet Dreams",
    date:      "Day 1, Evening",
    body:      "After a long and busy day, every bunny deserves some rest.\n\nClick on the cozy bed on the right side of the room to take a well-earned nap. You've done wonderfully today!\n\nSweet dreams.",
    completed: false,
    hints:     [
      "The bed is on the right side of the room.",
    ],
  },
];
