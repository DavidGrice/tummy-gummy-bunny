/**
 * Summer Evening Theme Configuration
 *
 * This is the single source of truth for the app color palette.
 * Edit values here to retheme the entire application — components and
 * Tailwind both pull from this file.
 *
 * Tailwind class mapping (via tailwind.config.ts):
 *   themeColors.coral  →  bg-summer-coral, text-summer-coral, border-summer-coral …
 *
 * Gradients are applied as inline styles via themeGradients, since Tailwind
 * cannot purge multi-stop gradient strings reliably.
 */

export const themeColors = {
  // ── Dark anchors ──────────────────────────────────────────────
  char:  '#180A00',   // warm near-black     — shadows, darkest bg
  soil:  '#3D1C09',   // deep warm brown     — primary text
  ember: '#BF3F1E',   // burnt orange-red    — hover states, deep accents

  // ── Mid-range ─────────────────────────────────────────────────
  coral: '#E8604A',   // salmon/coral        — primary brand color
  bark:  '#8B5A3C',   // warm medium brown   — labels, secondary text

  // ── Light ─────────────────────────────────────────────────────
  sandy: '#F4923A',   // sandy orange        — gradient bright end
  peach: '#F7B97A',   // light peach-orange  — decorative, borders, muted
  gold:  '#FFCF47',   // warm yellow-gold    — success, accent pops
  cream: '#FFF5E6',   // warm off-white      — card bg, light text

  // ── Semantic ──────────────────────────────────────────────────
  error: '#8B1A1A',   // deep red            — validation errors
} as const;

export const themeGradients = {
  /** Full-page background: warm summer sky at TOP, fading to dark earth at BOTTOM */
  sky:    `linear-gradient(to bottom, ${themeColors.sandy} 0%, ${themeColors.coral} 40%, ${themeColors.ember} 70%, ${themeColors.char} 100%)`,
  /** Primary button: coral → deep ember */
  button: `linear-gradient(135deg, ${themeColors.coral} 0%, ${themeColors.ember} 100%)`,
} as const;

export const themeConfig = {
  colors:    themeColors,
  gradients: themeGradients,
} as const;

export type ThemeColor = keyof typeof themeColors;
