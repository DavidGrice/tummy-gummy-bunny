/**
 * Credits Configuration
 *
 * Edit this file to update what appears on the rolling credits screen.
 * All sections are optional — remove or add entries freely.
 */

export const CREDITS_CONFIG = {
  game: {
    title:    "Tummy Gummy Bunny",
    subtitle: "A Three.js Point & Click Adventure",
  },

  developer: {
    name: "David Grice",
    role: "Developer & Designer",
  },

  year: 2026,

  /** Each entry appears as "Name — Role" */
  tech: [
    { name: "Next.js 15",   role: "React framework"  },
    { name: "React 19",     role: "UI library"        },
    { name: "Three.js",     role: "3D rendering"      },
    { name: "TypeScript",   role: "Type safety"       },
    { name: "Tailwind CSS", role: "Styling"           },
    { name: "Vercel",       role: "Deployment"        },
  ],

  specialThanks: [
    "The Three.js Community",
    "The Next.js Team",
    "Open Source Contributors Everywhere",
  ],

  closingLine: "Made with ♥",
} as const;
