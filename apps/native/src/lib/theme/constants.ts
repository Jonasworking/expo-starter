/**
 * Theme colors as const array for efficient mapping
 */
const THEME_COLORS = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
] as const;

/**
 * Theme colors type derived from THEME_COLORS array
 */
type ThemeColor = (typeof THEME_COLORS)[number];

export { THEME_COLORS };
export type { ThemeColor };
