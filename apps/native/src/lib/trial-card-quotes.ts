// Pool of philosophical quotes for the Trial Card back. Rotated
// deterministically by date so the same calendar day always shows the
// same quote, but consecutive days rotate through the pool.

export const TRIAL_CARD_QUOTES: readonly string[] = [
  "Discipline begins with the choice to begin.",
  "The path is silent. Walk it anyway.",
  "What you do today shapes who you are.",
  "Suffer now. Live as a champion later.",
  "The obstacle was the way.",
  "You have power over your mind, not events.",
  "Memento mori. Live this day with weight.",
  "Be hard to discourage. Easy to recover.",
  "The hardest task first.",
  "No one is coming. Move.",
] as const;

const FALLBACK = "Discipline does not announce itself.";
const MS_PER_DAY = 86_400_000;

export function getTrialCardQuote(now: Date): string {
  const ms = now.getTime();
  if (!Number.isFinite(ms)) {
    return TRIAL_CARD_QUOTES[0] ?? FALLBACK;
  }
  const daysSinceEpoch = Math.floor(ms / MS_PER_DAY);
  const idx =
    ((daysSinceEpoch % TRIAL_CARD_QUOTES.length) + TRIAL_CARD_QUOTES.length) %
    TRIAL_CARD_QUOTES.length;
  return TRIAL_CARD_QUOTES[idx] ?? FALLBACK;
}
