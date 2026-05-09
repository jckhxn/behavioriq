/**
 * BehaviorIQ dashboard design tokens as CSS variable references.
 * Light/dark values are defined in globals.css under :root and .dark.
 * Use these in inline styles so they automatically respond to theme changes.
 */
export const C = {
  canvas:   "var(--dash-canvas)",
  surface:  "var(--dash-surface)",
  sunk:     "var(--dash-sunk)",
  ink900:   "var(--dash-ink-900)",
  ink700:   "var(--dash-ink-700)",
  ink500:   "var(--dash-ink-500)",
  ink300:   "var(--dash-ink-300)",
  ink200:   "var(--dash-ink-200)",
  ink100:   "var(--dash-ink-100)",
  indigo50:  "var(--dash-indigo-50)",
  indigo100: "var(--dash-indigo-100)",
  indigo500: "var(--dash-indigo-500)",
  indigo600: "var(--dash-indigo-600)",
  peach50:  "var(--dash-peach-50)",
  peach500: "var(--dash-peach-500)",
  mint50:   "var(--dash-mint-50)",
  mint700:  "var(--dash-mint-700)",
  amber50:  "var(--dash-amber-50)",
  amber700: "var(--dash-amber-700)",
  rose50:   "var(--dash-rose-50)",
  rose700:  "var(--dash-rose-700)",
} as const;
