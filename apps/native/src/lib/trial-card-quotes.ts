// Pool of philosophical quotes for the Trial Card back. Rotated
// deterministically by trial id so each trial carries one consistent
// philosophical line for its entire run; picking a new trial picks a
// (likely) new line.

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

export function getTrialCardQuote(trialId: string): string {
  if (!trialId) {
    return TRIAL_CARD_QUOTES[0] ?? FALLBACK;
  }
  let hash = 0;
  for (let i = 0; i < trialId.length; i++) {
    hash = (hash * 31 + trialId.charCodeAt(i)) | 0;
  }
  const idx =
    ((hash % TRIAL_CARD_QUOTES.length) + TRIAL_CARD_QUOTES.length) %
    TRIAL_CARD_QUOTES.length;
  return TRIAL_CARD_QUOTES[idx] ?? FALLBACK;
}
