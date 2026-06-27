/**
 * Auth / Username Validation Configuration
 *
 * All validation rules, character policies, and user-facing messages live here.
 * Hooks and components import from this file, so a single edit propagates everywhere.
 *
 * ⚠  If you change allowedSpecialChars you MUST also update the three regex
 *    patterns below (pattern, allowedCharPattern, consecutiveSpecialPattern)
 *    to stay in sync.
 */

export const AUTH_CONFIG = {
  username: {
    // ── Length ────────────────────────────────────────────────────
    minLength: 3,
    maxLength: 32,

    // ── Character policy ─────────────────────────────────────────
    /** Extra chars allowed beyond a–z A–Z 0–9. Displayed as a hint to users. */
    allowedSpecialChars: ['_', '-', '.', '!', '@', '#', '$', '%', '^', '&', '*'],

    /**
     * Full regex — the entire value must satisfy this.
     * Rule: first char alphanumeric, then 2–31 more allowed chars (total 3–32).
     */
    pattern: /^[a-zA-Z0-9][a-zA-Z0-9_\-.!@#$%^&*]{2,31}$/,

    /**
     * Single-character allowlist — used to filter keystrokes before they reach
     * the input value. Prevents disallowed chars from ever appearing.
     */
    allowedCharPattern: /^[a-zA-Z0-9_\-.!@#$%^&*]$/,

    /**
     * Flags two or more consecutive special characters (e.g. "__", ".-").
     */
    consecutiveSpecialPattern: /[_\-.!@#$%^&*]{2,}/,

    // ── Enabled rule toggles ──────────────────────────────────────
    rules: {
      mustStartWithAlphanumeric: true,
      noConsecutiveSpecials:     true,
    },

    // ── User-facing messages ──────────────────────────────────────
    messages: {
      required:            'Player name is required',
      tooShort:            'Must be at least 3 characters',
      tooLong:             'Cannot exceed 32 characters',
      invalidStart:        'Must start with a letter or number',
      consecutiveSpecials: 'No consecutive special characters',
      invalidPattern:      'Contains invalid characters',
    },
  },
} as const;
