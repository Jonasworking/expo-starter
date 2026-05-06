import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import {
  ensureNotificationPermission,
  scheduleDailyReminder,
} from "@/lib/notifications";

const pad = (n: number) => String(n).padStart(2, "0");

const DEFAULT_HOUR = 7;
const DEFAULT_MINUTE = 0;

function defaultReminderDate(): Date {
  const d = new Date();
  d.setHours(DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0);
  return d;
}

export default function Reminder() {
  const insets = useSafeAreaInsets();
  const { setReminderTime, setReminderEnabled } = useAppState();
  const [reminderDate, setReminderDate] = useState<Date>(defaultReminderDate);
  const [submitting, setSubmitting] = useState(false);

  const handlePickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setReminderDate(date);
    }
  };

  const handleSetReminder = async () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    const time = `${pad(reminderDate.getHours())}:${pad(reminderDate.getMinutes())}`;
    setReminderTime(time);

    const granted = await ensureNotificationPermission();
    setReminderEnabled(granted);

    if (granted) {
      // Idempotent — the state context will also re-schedule once
      // hasOnboarded flips true, but firing it now means the OS has the
      // notification queued before the user reaches the oath.
      try {
        await scheduleDailyReminder(time);
      } catch {
        // Permission flipped or platform unavailable — safe to ignore.
      }
    } else {
      Alert.alert(
        "Notifications disabled",
        "Notifications are disabled. You can enable them later in Settings."
      );
    }

    router.push("/onboarding/oath");
  };

  return (
    <View
      className="flex-1 bg-background px-8"
      style={{ paddingTop: insets.top + 24 }}
    >
      <View className="flex-1">
        <Text className="font-serif text-[36px] text-foreground leading-tight">
          When shall Fenrir wake you?
        </Text>

        <View className="mt-8 w-full items-center">
          <DateTimePicker
            display="spinner"
            mode="time"
            onChange={handlePickerChange}
            style={{ width: "100%", backgroundColor: "transparent" }}
            value={reminderDate}
          />
        </View>

        <View className="mt-6">
          <Text className="font-medium text-[15px] text-muted-foreground leading-relaxed">
            Discipline begins with consistency.{"\n"}
            Choose a time. Honor it.
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          disabled={submitting}
          onPress={handleSetReminder}
          style={{ opacity: submitting ? 0.6 : 1 }}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Set Reminder
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
