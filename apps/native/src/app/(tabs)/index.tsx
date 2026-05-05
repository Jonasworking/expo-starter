import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderAvatar } from "@/components/header-avatar";
import { CaretRightBoldIcon } from "@/components/icons/ph/caret-right-bold";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { DotsThreeBoldIcon } from "@/components/icons/ph/dots-three-bold";
import { FireBoldIcon } from "@/components/icons/solar/fire-bold";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Text } from "@/components/ui/text";
import {
  findPractice,
  type ReflectionKind,
  toDateKey,
  useAppState,
} from "@/contexts/app-state-context";
import { DailyPracticesSection } from "./daily-practices";
import { ReflectionBottomSheet } from "./reflection-bottom-sheet";
import { CompactReflectionRow, ReflectionPromptCard } from "./reflection-cards";
import { ReflectionDetailSheet } from "./reflection-detail-sheet";

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

type TimePeriod = "morning" | "afternoon" | "evening";

function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }
  return "evening";
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

const REFLECTION_HISTORY_LIMIT = 5;
const REFLECTION_PREVIEW_CHARS = 90;

interface HistoryEntry {
  dateKey: string;
  kind: ReflectionKind;
  text: string;
}

const entryId = (entry: { dateKey: string; kind: ReflectionKind }) =>
  `${entry.dateKey}:${entry.kind}`;

export default function Today() {
  const insets = useSafeAreaInsets();
  const reflectSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const sealedNavigatedRef = useRef(false);
  const {
    state,
    activeTrial,
    todaysPractices,
    completeTrial,
    togglePractice,
    deleteReflection,
  } = useAppState();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{
    dateKey: string;
    kind: ReflectionKind;
    text: string;
  } | null>(null);
  const [composerKind, setComposerKind] = useState<ReflectionKind>("morning");
  const [confirmDelete, setConfirmDelete] = useState<{
    dateKey: string;
    kind: ReflectionKind;
  } | null>(null);
  const [confirmReroll, setConfirmReroll] = useState(false);
  const [reflectionsExpanded, setReflectionsExpanded] = useState(false);

  const todayKey = toDateKey();
  const todayData = state.days[todayKey];
  const reflected = Boolean(todayData?.reflected);
  const eveningReflected = Boolean(todayData?.eveningReflected);
  const trialCompleted = Boolean(todayData?.trialCompleted);
  const daySealed = Boolean(todayData?.sealed);
  const bothDone = reflected && trialCompleted;
  const period = getTimePeriod();

  const weekDays = useMemo(() => getWeekDays(state.days), [state.days]);

  const reflectionHistory = useMemo<HistoryEntry[]>(() => {
    const entries: HistoryEntry[] = [];
    for (const [key, day] of Object.entries(state.days)) {
      if (day.reflected && day.reflectionText.trim().length > 0) {
        entries.push({
          dateKey: key,
          kind: "morning",
          text: day.reflectionText,
        });
      }
      if (day.eveningReflected && day.eveningReflectionText.trim().length > 0) {
        entries.push({
          dateKey: key,
          kind: "evening",
          text: day.eveningReflectionText,
        });
      }
    }
    entries.sort((a, b) => {
      if (a.dateKey !== b.dateKey) {
        return a.dateKey < b.dateKey ? 1 : -1;
      }
      // same day: evening (later) first
      return a.kind === "evening" ? -1 : 1;
    });
    return entries.slice(0, REFLECTION_HISTORY_LIMIT);
  }, [state.days]);

  const selectedReflection = useMemo(
    () =>
      selectedId
        ? reflectionHistory.find((entry) => entryId(entry) === selectedId)
        : undefined,
    [selectedId, reflectionHistory]
  );

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

  const presentComposer = useCallback(
    (kind: ReflectionKind, target?: HistoryEntry) => {
      setComposerKind(kind);
      setEditTarget(
        target
          ? { dateKey: target.dateKey, kind: target.kind, text: target.text }
          : null
      );
      reflectSheetRef.current?.present();
    },
    []
  );

  const handleOpenMorningReflection = useCallback(() => {
    presentComposer("morning");
  }, [presentComposer]);

  const handleOpenEveningReflection = useCallback(() => {
    presentComposer("evening");
  }, [presentComposer]);

  const handleViewToday = useCallback(
    (kind: ReflectionKind) => {
      setSelectedId(entryId({ dateKey: todayKey, kind }));
      detailSheetRef.current?.present();
    },
    [todayKey]
  );

  const handlePracticeTap = useCallback(
    (id: string) => {
      const practice = findPractice(id);
      if (practice?.opensReflection) {
        const todayEvening = state.days[todayKey];
        if (todayEvening?.eveningReflected) {
          // Already reflected — show the saved entry instead of overwriting.
          setSelectedId(entryId({ dateKey: todayKey, kind: "evening" }));
          detailSheetRef.current?.present();
          return;
        }
        presentComposer("evening");
        return;
      }
      togglePractice(id);
    },
    [togglePractice, presentComposer, state.days, todayKey]
  );

  const handleOpenDetail = useCallback((entry: HistoryEntry) => {
    setSelectedId(entryId(entry));
    detailSheetRef.current?.present();
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedReflection) {
      return;
    }
    detailSheetRef.current?.dismiss();
    setTimeout(
      () => presentComposer(selectedReflection.kind, selectedReflection),
      250
    );
  }, [selectedReflection, presentComposer]);

  const handleAskDelete = useCallback(() => {
    if (!selectedReflection) {
      return;
    }
    detailSheetRef.current?.dismiss();
    setConfirmDelete({
      dateKey: selectedReflection.dateKey,
      kind: selectedReflection.kind,
    });
  }, [selectedReflection]);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      deleteReflection(confirmDelete.dateKey, confirmDelete.kind);
    }
    setConfirmDelete(null);
    setSelectedId(null);
  }, [confirmDelete, deleteReflection]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — fixed-width side slots so the greeting in the middle never
            fights for space and the avatar can't clip off-screen. */}
        <View
          className="flex-row items-center px-6"
          style={{ paddingTop: insets.top + 16, height: insets.top + 64 }}
        >
          <View className="w-16 items-start">
            <View className="flex-row items-center rounded-full bg-card px-3 py-1.5">
              <FireBoldIcon className="size-4 text-accent" />
              <Text className="ml-1.5 font-semibold text-[15px] text-foreground">
                {state.streak}
              </Text>
            </View>
          </View>

          <View className="flex-1 items-center px-2">
            <Text
              adjustsFontSizeToFit
              className="font-heading-bold text-[26px] text-foreground"
              numberOfLines={1}
            >
              {getGreeting()}
            </Text>
          </View>

          <View className="w-16 items-end">
            <HeaderAvatar name={state.userName} />
          </View>
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
          {period === "morning" && (
            <ReflectionPromptCard
              done={reflected}
              kind="morning"
              onReflect={handleOpenMorningReflection}
            />
          )}
          {period === "evening" && (
            <ReflectionPromptCard
              done={eveningReflected}
              kind="evening"
              onReflect={handleOpenEveningReflection}
            />
          )}

          {/* Trial card — Choose Your Trial CTA when none active, else active trial */}
          {activeTrial ? (
            <View className="items-center rounded-[22px] border border-border bg-card p-8">
              {!state.fenrir.rerollUsed && (
                <Pressable
                  className="absolute -top-1 -right-1 size-9 items-center justify-center rounded-full active:opacity-60"
                  hitSlop={6}
                  onPress={() => setConfirmReroll(true)}
                  style={{ top: 12, right: 12 }}
                >
                  <DotsThreeBoldIcon className="size-5 text-muted-foreground" />
                </Pressable>
              )}
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
          ) : (
            <Pressable
              className="items-center rounded-[22px] border border-border border-dashed bg-card p-8 active:scale-[0.99]"
              onPress={() => router.push("/trial-select")}
            >
              <Text className="mb-2 font-heading-bold text-[26px] text-foreground">
                choose your trial.
              </Text>
              <Text className="mb-6 px-2 text-center font-medium text-[15px] text-muted-foreground leading-relaxed">
                Self-chosen practice runs deeper than imposed routine.
              </Text>
              <View className="h-14 w-full items-center justify-center rounded-full bg-primary">
                <Text className="font-semibold text-[17px] text-primary-foreground">
                  Choose Trial
                </Text>
              </View>
            </Pressable>
          )}

          {period === "afternoon" && (
            <View className="flex-col gap-3">
              <CompactReflectionRow
                done={reflected}
                kind="morning"
                onReflect={handleOpenMorningReflection}
                onView={() => handleViewToday("morning")}
              />
              <CompactReflectionRow
                done={eveningReflected}
                kind="evening"
                onReflect={handleOpenEveningReflection}
                onView={() => handleViewToday("evening")}
              />
            </View>
          )}

          {period === "evening" && (
            <CompactReflectionRow
              dimmed
              done={reflected}
              kind="morning"
              onReflect={handleOpenMorningReflection}
              onView={() => handleViewToday("morning")}
            />
          )}

          {/* Daily practices — evening reflection dimmed in morning to signal
              it's a later step. Pool ids use snake_case. */}
          <DailyPracticesSection
            dimmedIds={period === "morning" ? ["evening_reflection"] : []}
            onTap={handlePracticeTap}
            practices={todaysPractices}
          />

          {/* Reflection history — collapsed by default to keep the home view
              focused on today; tap the header to reveal recent entries. */}
          <View className="flex-col gap-3">
            <Pressable
              className="flex-row items-center justify-between px-2 active:opacity-60"
              hitSlop={6}
              onPress={() => setReflectionsExpanded((prev) => !prev)}
            >
              <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                Past Reflections
                {reflectionHistory.length > 0
                  ? ` (${reflectionHistory.length})`
                  : ""}
              </Text>
              <CaretRightBoldIcon
                className="size-3 text-muted-foreground"
                style={{
                  transform: [
                    { rotate: reflectionsExpanded ? "90deg" : "0deg" },
                  ],
                }}
              />
            </Pressable>
            {reflectionsExpanded ? (
              reflectionHistory.length === 0 ? (
                <View className="items-center rounded-[22px] border border-border border-dashed bg-card px-6 py-8">
                  <Text className="text-center font-medium text-[15px] text-muted-foreground leading-relaxed">
                    Your reflections will appear here.{"\n"}Take a moment to
                    reflect.
                  </Text>
                </View>
              ) : (
                <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
                  {reflectionHistory.map((entry, index) => {
                    const preview =
                      entry.text.length > REFLECTION_PREVIEW_CHARS
                        ? `${entry.text.slice(0, REFLECTION_PREVIEW_CHARS).trimEnd()}…`
                        : entry.text;
                    const isLast = index === reflectionHistory.length - 1;
                    return (
                      <Pressable
                        className={`flex-col gap-1 px-5 py-4 active:bg-muted/50 ${isLast ? "" : "border-border border-b"}`}
                        key={entryId(entry)}
                        onPress={() => handleOpenDetail(entry)}
                      >
                        <View className="flex-row items-center gap-2">
                          <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                            {formatReflectionDate(entry.dateKey)}
                          </Text>
                          <Text className="font-semibold text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                            · {entry.kind}
                          </Text>
                        </View>
                        <Text
                          className="font-medium text-[15px] text-foreground leading-relaxed"
                          numberOfLines={2}
                        >
                          {preview}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )
            ) : null}
          </View>
        </View>
      </ScrollView>

      <ReflectionBottomSheet
        editDateKey={editTarget?.dateKey}
        initialText={editTarget?.text ?? ""}
        kind={editTarget?.kind ?? composerKind}
        mode={editTarget ? "edit" : "create"}
        ref={reflectSheetRef}
      />
      <ReflectionDetailSheet
        dateLabel={
          selectedReflection
            ? `${formatReflectionDate(selectedReflection.dateKey)} · ${selectedReflection.kind}`
            : ""
        }
        onDelete={handleAskDelete}
        onEdit={handleEdit}
        ref={detailSheetRef}
        text={selectedReflection?.text ?? ""}
      />
      <ConfirmDialog
        confirmLabel="Delete"
        description="This reflection will be permanently removed."
        destructive
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete reflection?"
        visible={confirmDelete !== null}
      />
      <ConfirmDialog
        confirmLabel="Switch"
        description="Switching loses your current trial progress. You can only switch once per trial."
        onCancel={() => setConfirmReroll(false)}
        onConfirm={() => {
          setConfirmReroll(false);
          router.push("/trial-select?reroll=1");
        }}
        title="Switch trial?"
        visible={confirmReroll}
      />
    </View>
  );
}
