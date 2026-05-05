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

const REMINDER_BODIES = [
  "Time to reflect on what's within your control.",
  "The path remains. Take a moment to walk it.",
  "Your daily practice awaits.",
  "Embrace today's discipline.",
  "Sit. Breathe. Begin again.",
] as const;

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

function pickBody(): string {
  const idx = Math.floor(Math.random() * REMINDER_BODIES.length);
  return REMINDER_BODIES[idx];
}

export async function scheduleDailyReminder(time: string): Promise<boolean> {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  const granted = await ensureNotificationPermission();
  if (!granted) {
    return false;
  }

  await cancelDailyReminder();

  await scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: "Ronin",
      body: pickBody(),
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
