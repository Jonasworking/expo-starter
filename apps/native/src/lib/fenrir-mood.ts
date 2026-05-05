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

  // Streak broken: yesterday wasn't sealed, but the user has been sealing
  // days before. Without the prior-history check, brand-new users would land
  // on the sad wolf on day one — that's not the mood we want for them.
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDay = state.days[toDateKey(yesterday)];
  const hasPriorSealed = Object.values(state.days).some((d) => d.sealed);
  if (hasPriorSealed && !yesterdayDay?.sealed) {
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
