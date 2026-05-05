import { router } from "expo-router";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { MoonBoldIcon } from "@/components/icons/ph/moon-bold";
import { PencilSimpleBoldIcon } from "@/components/icons/ph/pencil-simple-bold";
import { ScalesBoldIcon } from "@/components/icons/ph/scales-bold";
import { ShieldBoldIcon } from "@/components/icons/ph/shield-bold";
import { SkullBoldIcon } from "@/components/icons/ph/skull-bold";
import { WindBoldIcon } from "@/components/icons/ph/wind-bold";
import { BoltBoldIcon } from "@/components/icons/solar/bolt-bold";
import { Text } from "@/components/ui/text";
import {
  PRACTICE_POOL,
  type Practice,
  type PracticeCategory,
  type PracticeIconName,
  useAppState,
} from "@/contexts/app-state-context";

type IconComponent = ComponentType<{ className?: string }>;

const ICON_MAP: Record<PracticeIconName, IconComponent> = {
  wind: WindBoldIcon,
  skull: SkullBoldIcon,
  scales: ScalesBoldIcon,
  moon: MoonBoldIcon,
  bolt: BoltBoldIcon,
  pencil: PencilSimpleBoldIcon,
  shield: ShieldBoldIcon,
};

const CATEGORY_LABELS: Record<PracticeCategory, string> = {
  stillness: "Stillness & Meditation",
  virtue: "Virtues",
  reflection: "Reflection",
  body: "Body",
  mind: "Mind",
};

// Selection enforces one practice per category. Mind is intentionally not
// part of the selection flow — the user picks one from each of these four.
const SELECTABLE_CATEGORIES: readonly PracticeCategory[] = [
  "stillness",
  "virtue",
  "reflection",
  "body",
];

type Selection = Partial<Record<PracticeCategory, string>>;

export default function PracticeSelect() {
  const insets = useSafeAreaInsets();
  const { selectTodaysPractices } = useAppState();
  // Always start fresh: no pre-selection from yesterday's pool, no
  // mirroring of an earlier same-day pick. The user must actively tap
  // each category to commit a practice for the day.
  const [selection, setSelection] = useState<Selection>({});

  const grouped = useMemo(() => {
    const map = new Map<PracticeCategory, Practice[]>();
    for (const cat of SELECTABLE_CATEGORIES) {
      map.set(cat, []);
    }
    for (const practice of PRACTICE_POOL) {
      map.get(practice.category)?.push(practice);
    }
    return map;
  }, []);

  // Replacement, not blocking: tapping a different practice in the same
  // category swaps it in. Tapping the already-selected practice clears the
  // slot so the user can re-pick later.
  const togglePick = (practice: Practice) => {
    setSelection((prev) => {
      if (prev[practice.category] === practice.id) {
        const { [practice.category]: _cleared, ...rest } = prev;
        return rest;
      }
      return { ...prev, [practice.category]: practice.id };
    });
  };

  const filledCount = SELECTABLE_CATEGORIES.filter((cat) =>
    Boolean(selection[cat])
  ).length;
  const canConfirm = filledCount === SELECTABLE_CATEGORIES.length;

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    const ids = SELECTABLE_CATEGORIES.map((cat) => selection[cat]).filter(
      (id): id is string => Boolean(id)
    );
    selectTodaysPractices(ids);
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header — explicit insets.top + breathing room so the title never
          collides with the notch and the back button is always tappable. */}
      <View
        className="h-16 flex-row items-center px-6"
        style={{ paddingTop: insets.top + 16, height: insets.top + 64 }}
      >
        <Pressable
          className="size-10 items-center justify-center rounded-full border border-border bg-card active:scale-95"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon className="size-5 text-foreground" />
        </Pressable>
        <Text className="flex-1 pr-10 text-center font-heading-bold text-[26px] text-foreground">
          practices.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 32) + 96,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-4 px-1">
          <Text className="flex-1 font-medium text-[15px] text-muted-foreground leading-relaxed">
            Pick one from each category.
          </Text>
          <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
            {filledCount} of {SELECTABLE_CATEGORIES.length}
          </Text>
        </View>

        {SELECTABLE_CATEGORIES.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) {
            return null;
          }
          const categorySelectedId = selection[category];
          return (
            <View className="flex-col gap-3" key={category}>
              <View className="flex-row items-center justify-between px-2">
                <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                  {CATEGORY_LABELS[category]}
                </Text>
                <Text
                  className={`font-semibold text-[12px] uppercase tracking-widest ${categorySelectedId ? "text-foreground" : "text-muted-foreground/60"}`}
                >
                  {categorySelectedId ? "1" : "0"} of 1
                </Text>
              </View>
              <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
                {items.map((practice, index) => {
                  const isSelected = categorySelectedId === practice.id;
                  const isLast = index === items.length - 1;
                  const Icon = ICON_MAP[practice.icon];
                  return (
                    <Pressable
                      className={`flex-row items-center gap-4 px-5 py-4 active:bg-muted/50 ${isLast ? "" : "border-border border-b"}`}
                      key={practice.id}
                      onPress={() => togglePick(practice)}
                    >
                      <View className="size-10 items-center justify-center rounded-full bg-muted">
                        <Icon className="size-5 text-foreground" />
                      </View>
                      <View className="flex-1 flex-col gap-0.5">
                        <Text className="font-semibold text-[15px] text-foreground">
                          {practice.title}
                        </Text>
                        <Text
                          className="font-medium text-[13px] text-muted-foreground leading-relaxed"
                          numberOfLines={2}
                        >
                          {practice.description}
                        </Text>
                      </View>
                      <View
                        className={`size-7 items-center justify-center rounded-full ${isSelected ? "bg-primary" : "border border-border bg-background"}`}
                      >
                        {isSelected ? (
                          <CheckBoldIcon className="size-4 text-primary-foreground" />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        className="absolute right-0 bottom-0 left-0 border-border border-t bg-background px-8 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          disabled={!canConfirm}
          onPress={handleConfirm}
          style={{ opacity: canConfirm ? 1 : 0.5 }}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            {canConfirm ? "Confirm Selection" : "Pick one from each"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
