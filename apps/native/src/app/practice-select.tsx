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
  type Practice,
  type PracticeCategory,
  type PracticeIconName,
  PRACTICE_POOL,
  PRACTICES_PER_DAY,
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

const CATEGORY_ORDER: readonly PracticeCategory[] = [
  "stillness",
  "virtue",
  "reflection",
  "body",
  "mind",
];

export default function PracticeSelect() {
  const insets = useSafeAreaInsets();
  const { todaysPractices, selectTodaysPractices } = useAppState();
  const [picked, setPicked] = useState<string[]>(todaysPractices.selectedIds);

  const grouped = useMemo(() => {
    const map = new Map<PracticeCategory, Practice[]>();
    for (const cat of CATEGORY_ORDER) {
      map.set(cat, []);
    }
    for (const practice of PRACTICE_POOL) {
      map.get(practice.category)?.push(practice);
    }
    return map;
  }, []);

  const togglePick = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= PRACTICES_PER_DAY) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const canConfirm = picked.length === PRACTICES_PER_DAY;

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }
    selectTodaysPractices(picked);
    router.back();
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
          practices.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 32) + 96,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between px-1">
          <Text className="font-medium text-[15px] text-muted-foreground leading-relaxed">
            Pick {PRACTICES_PER_DAY} for today.
          </Text>
          <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
            {picked.length} of {PRACTICES_PER_DAY}
          </Text>
        </View>

        {CATEGORY_ORDER.map((category) => {
          const items = grouped.get(category) ?? [];
          if (items.length === 0) {
            return null;
          }
          return (
            <View className="flex-col gap-3" key={category}>
              <Text className="px-2 font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                {CATEGORY_LABELS[category]}
              </Text>
              <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
                {items.map((practice, index) => {
                  const isSelected = picked.includes(practice.id);
                  const isLast = index === items.length - 1;
                  const Icon = ICON_MAP[practice.icon];
                  const disabled =
                    !isSelected && picked.length >= PRACTICES_PER_DAY;
                  return (
                    <Pressable
                      className={`flex-row items-center gap-4 px-5 py-4 active:bg-muted/50 ${isLast ? "" : "border-border border-b"} ${disabled ? "opacity-40" : ""}`}
                      disabled={disabled}
                      key={practice.id}
                      onPress={() => togglePick(practice.id)}
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
        className="absolute right-0 left-0 bottom-0 border-border border-t bg-background px-8 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
      >
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          disabled={!canConfirm}
          onPress={handleConfirm}
          style={{ opacity: canConfirm ? 1 : 0.4 }}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Confirm Selection
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
