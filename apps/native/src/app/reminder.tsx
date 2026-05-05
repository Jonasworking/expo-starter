import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { ensureNotificationPermission } from "@/lib/notifications";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const HOUR_MIN = 0;
const HOUR_MAX = 23;
const MINUTE_MIN = 0;
const MINUTE_MAX = 59;
const MINUTE_STEP = 5;

const pad = (n: number) => String(n).padStart(2, "0");

const wrap = (value: number, min: number, max: number) => {
  const span = max - min + 1;
  return ((((value - min) % span) + span) % span) + min;
};

export default function Reminder() {
  const insets = useSafeAreaInsets();
  const { state, setReminderTime, setReminderEnabled } = useAppState();
  const [hourStr, minuteStr] = state.reminderTime.split(":");
  const [hour, setHour] = useState<number>(Number(hourStr) || 0);
  const [minute, setMinute] = useState<number>(Number(minuteStr) || 0);
  const [enabled, setEnabled] = useState<boolean>(state.reminderEnabled);
  const [primary, muted] = useThemeColor(["primary", "muted"]);

  const handleSave = () => {
    setReminderTime(`${pad(hour)}:${pad(minute)}`);
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

        <View className="mb-12 w-full flex-row items-center justify-between rounded-[18px] border border-border bg-card px-5 py-4">
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
          className="flex-row items-center justify-center gap-6"
          style={{ opacity: enabled ? 1 : 0.4 }}
        >
          <TimeColumn
            disabled={!enabled}
            label="Hour"
            onChange={(next) => setHour(wrap(next, HOUR_MIN, HOUR_MAX))}
            value={hour}
          />
          <Text className="font-heading-bold text-[48px] text-foreground">
            :
          </Text>
          <TimeColumn
            disabled={!enabled}
            label="Minute"
            onChange={(next) => setMinute(wrap(next, MINUTE_MIN, MINUTE_MAX))}
            step={MINUTE_STEP}
            value={minute}
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

function TimeColumn({
  label,
  onChange,
  step = 1,
  value,
  disabled = false,
}: {
  label: string;
  onChange: (next: number) => void;
  step?: number;
  value: number;
  disabled?: boolean;
}) {
  return (
    <View className="items-center gap-3">
      <Pressable
        className="size-12 items-center justify-center rounded-full border border-border bg-card active:scale-95"
        disabled={disabled}
        hitSlop={8}
        onPress={() => onChange(value + step)}
      >
        <Text className="font-bold text-[22px] text-foreground">+</Text>
      </Pressable>

      <View className="w-24 items-center justify-center rounded-[18px] border border-border bg-card py-4">
        <Text className="font-heading-bold text-[40px] text-foreground">
          {String(value).padStart(2, "0")}
        </Text>
        <Text className="mt-1 font-semibold text-[11px] text-muted-foreground uppercase tracking-widest">
          {label}
        </Text>
      </View>

      <Pressable
        className="size-12 items-center justify-center rounded-full border border-border bg-card active:scale-95"
        disabled={disabled}
        hitSlop={8}
        onPress={() => onChange(value - step)}
      >
        <Text className="font-bold text-[22px] text-foreground">−</Text>
      </Pressable>
    </View>
  );
}
