import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { ensureNotificationPermission } from "@/lib/notifications";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const pad = (n: number) => String(n).padStart(2, "0");

function parseReminderTime(value: string): Date {
  const [hourStr, minuteStr] = value.split(":");
  const date = new Date();
  date.setHours(Number(hourStr) || 0, Number(minuteStr) || 0, 0, 0);
  return date;
}

export default function Reminder() {
  const insets = useSafeAreaInsets();
  const { state, setReminderTime, setReminderEnabled } = useAppState();
  const [reminderDate, setReminderDate] = useState<Date>(() =>
    parseReminderTime(state.reminderTime)
  );
  const [enabled, setEnabled] = useState<boolean>(state.reminderEnabled);
  const [primary, muted] = useThemeColor(["primary", "muted"]);

  const handleSave = () => {
    setReminderTime(
      `${pad(reminderDate.getHours())}:${pad(reminderDate.getMinutes())}`
    );
    setReminderEnabled(enabled);
    router.back();
  };

  // Switching ON triggers the iOS permission prompt the very first time. If
  // the user denies (or has previously denied and can't be re-prompted), keep
  // the toggle off — silently scheduling without permission would mean the
  // reminder never fires.
  const handleToggle = async (next: boolean) => {
    if (!next) {
      setEnabled(false);
      return;
    }
    const granted = await ensureNotificationPermission();
    if (granted) {
      setEnabled(true);
      return;
    }
    setEnabled(false);
    Alert.alert(
      "Notifications disabled",
      "Enable notifications for Ronin in iOS Settings to receive your daily reminder."
    );
  };

  const handlePickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setReminderDate(date);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="h-16 flex-row items-center px-8">
        <Pressable
          className="-ml-2 p-2"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon className="size-6 text-foreground" />
        </Pressable>
        <Text className="flex-1 pr-10 text-center font-heading-bold text-[26px] text-foreground">
          reminder.
        </Text>
      </View>

      <View className="flex-1 items-center px-8">
        <Text className="mt-4 mb-8 text-center font-medium text-[15px] text-muted-foreground">
          Choose when Fenrir should remind you to begin the day.
        </Text>

        <View className="mb-8 w-full flex-row items-center justify-between rounded-[18px] border border-border bg-card px-5 py-4">
          <Text className="font-medium text-[15px] text-foreground">
            Daily reminder
          </Text>
          <Switch
            onValueChange={handleToggle}
            thumbColor="#ffffff"
            trackColor={{ false: muted, true: primary }}
            value={enabled}
          />
        </View>

        <View
          className="w-full items-center"
          pointerEvents={enabled ? "auto" : "none"}
          style={{ opacity: enabled ? 1 : 0.4 }}
        >
          <DateTimePicker
            display="spinner"
            mode="time"
            onChange={handlePickerChange}
            style={{ width: "100%", backgroundColor: "transparent" }}
            value={reminderDate}
          />
        </View>
      </View>

      <View
        className="px-8"
        style={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          onPress={handleSave}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
