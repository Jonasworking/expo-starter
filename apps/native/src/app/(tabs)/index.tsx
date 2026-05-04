import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { FireBoldIcon } from "@/components/icons/solar/fire-bold";
import { Text } from "@/components/ui/text";
import { toDateKey, useAppState } from "@/contexts/app-state-context";
import { ReflectionBottomSheet } from "./reflection-bottom-sheet";

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
  "XXI",
  "XXII",
  "XXIII",
  "XXIV",
  "XXV",
];
const toRoman = (n: number) =>
  n >= 1 && n <= ROMAN.length ? ROMAN[n - 1] : String(n);

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "good morning.";
  }
  if (hour >= 12 && hour < 18) {
    return "good afternoon.";
  }
  if (hour >= 18 && hour < 23) {
    return "good evening.";
  }
  return "good night.";
}

function formatReflectionDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) {
    return "Today";
  }
  if (date.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getWeekDays(days: Record<string, { sealed?: boolean }>) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);

  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = toDateKey(d);
    const isToday = d.toDateString() === today.toDateString();
    const isPast = d < today && !isToday;
    return {
      label: DAY_LABELS[i],
      date: d.getDate(),
      isToday,
      isPast,
      isFuture: d > today,
      completed: Boolean(days[key]?.sealed),
      key,
    };
  });
}

const REFLECTION_QUESTION = "What is within your control today?";
const REFLECTION_HISTORY_LIMIT = 5;
const REFLECTION_PREVIEW_CHARS = 90;

export default function Today() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const sealedNavigatedRef = useRef(false);
  const { state, activeTrial, completeTrial } = useAppState();

  const todayKey = toDateKey();
  const todayData = state.days[todayKey];
  const reflected = Boolean(todayData?.reflected);
  const trialCompleted = Boolean(todayData?.trialCompleted);
  const daySealed = Boolean(todayData?.sealed);
  const bothDone = reflected && trialCompleted;

  const weekDays = useMemo(() => getWeekDays(state.days), [state.days]);

  const reflectionHistory = useMemo(() => {
    return Object.entries(state.days)
      .filter(
        ([, day]) => day.reflected && day.reflectionText.trim().length > 0
      )
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, REFLECTION_HISTORY_LIMIT)
      .map(([key, day]) => ({ key, text: day.reflectionText }));
  }, [state.days]);

  useEffect(() => {
    if (daySealed) {
      sealedNavigatedRef.current = false;
      return;
    }
    if (!bothDone || sealedNavigatedRef.current) {
      return;
    }
    sealedNavigatedRef.current = true;
    const t = setTimeout(() => router.replace("/sealed"), 600);
    return () => clearTimeout(t);
  }, [bothDone, daySealed]);

  const handleOpenReflection = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const userInitial = state.userName.charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-8"
          style={{ paddingTop: insets.top + 16, height: insets.top + 64 }}
        >
          <Pressable className="flex-row items-center rounded-full border border-border bg-card px-3.5 py-1.5">
            <FireBoldIcon className="size-4 text-accent" />
            <Text className="ml-1.5 font-semibold text-base text-foreground">
              {state.streak}
            </Text>
          </Pressable>

          <Text className="font-heading-bold text-[32px] text-foreground">
            {getGreeting()}
          </Text>

          <Pressable
            className="size-12 items-center justify-center rounded-full bg-primary active:scale-95"
            hitSlop={8}
            onPress={() => router.push("/settings")}
          >
            <Text className="font-bold text-[18px] text-primary-foreground">
              {userInitial}
            </Text>
          </Pressable>
        </View>

        {/* Week strip */}
        <View className="mt-8 flex-row items-center justify-between px-8">
          {weekDays.map((day) => {
            if (day.isToday) {
              return (
                <View
                  className="h-14 w-11 items-center justify-center rounded-xl bg-muted"
                  key={day.key}
                >
                  <Text className="font-medium text-[13px] text-muted-foreground">
                    {day.label}
                  </Text>
                  <Text className="font-semibold text-[18px] text-foreground leading-tight">
                    {day.date}
                  </Text>
                </View>
              );
            }
            if (day.isPast && day.completed) {
              return (
                <View className="w-11 items-center gap-1" key={day.key}>
                  <Text className="font-medium text-[13px] text-muted-foreground">
                    {day.label}
                  </Text>
                  <CheckBoldIcon className="size-5 text-foreground" />
                </View>
              );
            }
            return (
              <View className="w-11 items-center gap-1" key={day.key}>
                <Text className="font-medium text-[13px] text-muted-foreground">
                  {day.label}
                </Text>
                <Text
                  className={`font-semibold text-[18px] leading-tight ${day.isFuture ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {day.date}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Cards */}
        <View className="mt-10 flex-col gap-6 px-8">
          {/* Morning Reflection card */}
          <View className="min-h-[280px] flex-col items-center rounded-[22px] bg-foreground p-8">
            <Text className="mb-auto font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Morning Reflection
            </Text>
            <Text className="mb-8 text-center font-heading-bold text-[28px] text-card leading-tight">
              {REFLECTION_QUESTION}
            </Text>
            {reflected ? (
              <View className="h-12 flex-row items-center gap-2 rounded-full bg-white/20 px-6">
                <CheckBoldIcon className="size-4 text-white" />
                <Text className="font-semibold text-[16px] text-white">
                  Reflected
                </Text>
              </View>
            ) : (
              <Pressable
                className="h-12 items-center justify-center rounded-full bg-card px-8 active:scale-95"
                onPress={handleOpenReflection}
              >
                <Text className="font-semibold text-[17px] text-foreground">
                  Reflect
                </Text>
              </Pressable>
            )}
          </View>

          {/* Trial card */}
          <View className="items-center rounded-[22px] border border-border bg-card p-8">
            <Text className="mb-1 font-heading-bold text-[26px] text-foreground">
              {activeTrial.title}
            </Text>
            <Text className="mb-6 font-medium text-[13px] text-muted-foreground">
              Day {toRoman(state.fenrir.currentDayInTrial)} of{" "}
              {toRoman(activeTrial.days)}
            </Text>
            <Text className="mb-8 px-4 text-center font-medium text-[18px] text-foreground leading-relaxed">
              {activeTrial.description}
            </Text>
            {trialCompleted ? (
              <View className="h-14 w-full flex-row items-center justify-center gap-2 rounded-full bg-muted">
                <CheckBoldIcon className="size-5 text-muted-foreground" />
                <Text className="font-semibold text-[17px] text-muted-foreground">
                  Completed
                </Text>
              </View>
            ) : (
              <Pressable
                className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
                onPress={completeTrial}
              >
                <Text className="font-semibold text-[17px] text-primary-foreground">
                  Complete Trial
                </Text>
              </Pressable>
            )}
          </View>

          {/* Reflection history */}
          {reflectionHistory.length > 0 && (
            <View className="flex-col gap-3">
              <Text className="px-2 font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                Past Reflections
              </Text>
              <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
                {reflectionHistory.map((entry, index) => {
                  const preview =
                    entry.text.length > REFLECTION_PREVIEW_CHARS
                      ? `${entry.text.slice(0, REFLECTION_PREVIEW_CHARS).trimEnd()}…`
                      : entry.text;
                  const isLast = index === reflectionHistory.length - 1;
                  return (
                    <View
                      className={`flex-col gap-1 px-5 py-4 ${isLast ? "" : "border-border border-b"}`}
                      key={entry.key}
                    >
                      <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                        {formatReflectionDate(entry.key)}
                      </Text>
                      <Text
                        className="text-[15px] text-foreground leading-relaxed"
                        numberOfLines={2}
                      >
                        {preview}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ReflectionBottomSheet ref={bottomSheetRef} />
    </View>
  );
}
