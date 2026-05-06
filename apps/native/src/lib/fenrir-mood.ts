import { type AppStateData, toDateKey } from "@/contexts/app-state-context";

// Static require() — Metro bundles these at build time so the wolf images
// ship with the app instead of being fetched over the network.
const wolfBattle = require("../../assets/fenrir/wolf_battle.png");
const wolfIdle = require("../../assets/fenrir/wolf_idle.png");
const wolfLevel20 = require("../../assets/fenrir/wolf_level20.png");
const wolfLevelup = require("../../assets/fenrir/wolf_levelup.png");
const wolfSad = require("../../assets/fenrir/wolf_sad.png");
const wolfSleeping = require("../../assets/fenrir/wolf_sleeping.png");

const NIGHT_START_HOUR = 22;
const MORNING_END_HOUR = 6;
const RANK_MATURE = 5;
const PRACTICES_REQUIRED = 4;

export type FenrirMood =
  | "sleeping"
  | "sad"
  | "levelup"
  | "battle"
  | "level20"
  | "idle";

const MOOD_TO_IMAGE = {
  sleeping: wolfSleeping,
  sad: wolfSad,
  levelup: wolfLevelup,
  battle: wolfBattle,
  level20: wolfLevel20,
  idle: wolfIdle,
} as const;

export function getFenrirMood(state: AppStateData, now: Date): FenrirMood {
  const hour = now.getHours();
  if (hour >= NIGHT_START_HOUR || hour < MORNING_END_HOUR) {
    return "sleeping";
  }

  const todayKey = toDateKey(now);
  const today = state.days[todayKey];

  // Streak broken: BOTH today and yesterday are unsealed AND the user has
  // sealed at least one day strictly before yesterday. The strict-before check
  // (using YYYY-MM-DD string comparison, which sorts chronologically) prevents
  // a first-time user who seals today from registering as "broken" — there
  // can't be a broken path if it was just laid down today.
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);
  const yesterdayDay = state.days[yesterdayKey];
  const todaySealed = today?.sealed ?? false;
  const yesterdaySealed = yesterdayDay?.sealed ?? false;
  const hasSealedBeforeYesterday = Object.entries(state.days).some(
    ([key, day]) => day.sealed && key < yesterdayKey
  );
  if (!(todaySealed || yesterdaySealed) && hasSealedBeforeYesterday) {
    return "sad";
  }

  const trialCompleted = today?.trialCompleted ?? false;
  const morningDone = today?.reflected ?? false;
  const eveningDone = today?.eveningReflected ?? false;
  const practicesToday =
    state.dailyPractices.date === todayKey ? state.dailyPractices : null;
  const allPracticesDone =
    practicesToday !== null &&
    practicesToday.completedIds.length >= PRACTICES_REQUIRED;

  if (trialCompleted && morningDone && eveningDone && allPracticesDone) {
    return "levelup";
  }

  if (state.fenrir.activeTrialId !== null && !trialCompleted) {
    return "battle";
  }

  if (state.fenrir.rank >= RANK_MATURE) {
    return "level20";
  }

  return "idle";
}

export function getFenrirMoodImage(state: AppStateData, now: Date) {
  return MOOD_TO_IMAGE[getFenrirMood(state, now)];
}

const MS_PER_DAY = 86_400_000;

export const FENRIR_QUOTES: Record<FenrirMood, readonly string[]> = {
  sleeping: [
    "Fenrir sleeps. The night is yours alone.",
    "Even wolves rest. Honor the silence.",
    "Tomorrow, the path begins again.",
  ],
  sad: [
    "Fenrir mourns. Return to the path.",
    "He waits. Wounded but loyal.",
    "One day broken is not the end.",
  ],
  battle: [
    "Fenrir watches you fight.",
    "The wolf hunts beside you.",
    "Steady. He follows your lead.",
  ],
  levelup: [
    "Fenrir is proud.",
    "The wolf grows stronger with you.",
    "Today, you fed the fire.",
  ],
  level20: [
    "Fenrir bows to no one. Neither do you.",
    "The pack of one walks alone.",
    "Mastery is silence under pressure.",
  ],
  idle: [
    "Fenrir watches in silence.",
    "The wolf is patient. So are you.",
    "Discipline does not announce itself.",
  ],
} as const;

const FALLBACK_QUOTE = "Fenrir watches in silence.";

// Pick a quote deterministically from the mood's pool, indexed by
// days-since-epoch so the same calendar day always shows the same line and
// consecutive days rotate through the pool.
export function getFenrirQuote(state: AppStateData, now: Date): string {
  const mood = getFenrirMood(state, now);
  const pool = FENRIR_QUOTES[mood];
  const ms = now.getTime();
  if (!Number.isFinite(ms)) {
    return pool[0] ?? FALLBACK_QUOTE;
  }
  const daysSinceEpoch = Math.floor(ms / MS_PER_DAY);
  const idx = ((daysSinceEpoch % pool.length) + pool.length) % pool.length;
  return pool[idx] ?? FALLBACK_QUOTE;
}
