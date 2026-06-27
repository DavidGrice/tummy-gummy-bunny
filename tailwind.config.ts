import type { Config } from "tailwindcss";
import { themeColors } from "./config/theme.config";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.ts",
  ],
  theme: {
    extend: {
      /**
       * Summer evening palette.
       * Usage: bg-summer-coral, text-summer-soil, border-summer-ember …
       * Source of truth: config/theme.config.ts
       */
      colors: {
        summer: {
          char:  themeColors.char,
          soil:  themeColors.soil,
          ember: themeColors.ember,
          coral: themeColors.coral,
          bark:  themeColors.bark,
          sandy: themeColors.sandy,
          peach: themeColors.peach,
          gold:  themeColors.gold,
          cream: themeColors.cream,
          error: themeColors.error,
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'summer':    `0 20px 60px -10px ${themeColors.char}80`,
        'summer-sm': `0 4px 20px -4px ${themeColors.ember}40`,
        // Multi-layer 3-D card: top inner highlight + cascading depth shadows
        'card-3d': [
          'inset 0 1px 0 rgba(255,255,255,0.95)',
          'inset 0 -2px 4px rgba(0,0,0,0.04)',
          '0 1px 3px rgba(0,0,0,0.08)',
          '0 6px 12px rgba(0,0,0,0.12)',
          '0 18px 36px rgba(0,0,0,0.16)',
          '0 48px 96px rgba(24,10,0,0.38)',
        ].join(', '),
      },
    },
  },
  plugins: [],
};

export default config;
