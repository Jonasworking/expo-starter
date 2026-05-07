import {
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  IosAuthorizationStatus,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationHandler,
} from "expo-notifications";
import { Platform } from "react-native";

const REMINDER_IDENTIFIER = "ronin-daily-reminder";

export const MORNING_POOL = [
  "Begin the day. Fenrir is watching.",
  "Stand up. The day will not wait.",
  "Discipline equals freedom.",
  "What you do today shapes who you are.",
  "No one is coming. Move.",
  "The hardest task first.",
  "Suffer now. Live as a champion later.",
  "Be hard to discourage. Easy to recover.",
] as const;

export const EVENING_POOL = [
  "Time to reflect on what's within your control.",
  "Memento mori. Live this day with weight.",
  "What did you do well today?",
  "The obstacle was the way.",
  "You have power over your mind — not events.",
  "Examine the day. Stand firm tomorrow.",
  "The path is silent. Walk it anyway.",
  "Sealed or not — Fenrir watches.",
] as const;

const MS_PER_DAY = 86_400_000;

// setNotificationHandler controls how notifications behave
// while the app is foregrounded. The defaults swallow alerts in-app, which
// makes the reminder feel broken when the user is testing it.
setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await getPermissionsAsync();
  if (
    settings.granted ||
    settings.ios?.status === IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  if (settings.canAskAgain === false) {
    return false;
  }
  const next = await requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return next.granted;
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch {
    // No matching scheduled notification — safe to ignore.
  }
}

const FALLBACK_REMINDER_BODY = "Ronin.";

// Pick a stoic reminder body deterministically by day-of-epoch so the same
// calendar day always shows the same message and consecutive days rotate
// through the full pool. Morning vs evening pool is chosen by reminder hour.
// Always returns a non-empty string so callers can hand the result straight
// to scheduleNotificationAsync without further guarding.
function pickReminderMessage(hour: number, date: Date): string {
  const pool = hour < 12 ? MORNING_POOL : EVENING_POOL;
  const ms = date.getTime();
  if (!Number.isFinite(ms)) {
    return pool[0] ?? FALLBACK_REMINDER_BODY;
  }
  const daysSinceEpoch = Math.floor(ms / MS_PER_DAY);
  const idx = ((daysSinceEpoch % pool.length) + pool.length) % pool.length;
  return pool[idx] ?? FALLBACK_REMINDER_BODY;
}

export async function scheduleDailyReminder(time: string): Promise<boolean> {
  if (typeof time !== "string" || !time.includes(":")) {
    return false;
  }
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (
    !(Number.isFinite(hour) && Number.isFinite(minute)) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return false;
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    return false;
  }

  await cancelDailyReminder();

  // Resolve body up front so the object literal handed to expo-notifications
  // can never carry an undefined `body` field — that crashes some plugin
  // paths with "Cannot read properties of undefined (reading 'body')".
  const body = pickReminderMessage(hour, new Date()) || FALLBACK_REMINDER_BODY;

  await scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: "Ronin",
      body,
      sound: false,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
  });
  return true;
}
