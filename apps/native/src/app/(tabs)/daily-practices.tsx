import { router } from "expo-router";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { BoltBoldIcon } from "@/components/icons/solar/bolt-bold";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { MoonBoldIcon } from "@/components/icons/ph/moon-bold";
import { PencilSimpleBoldIcon } from "@/components/icons/ph/pencil-simple-bold";
import { ScalesBoldIcon } from "@/components/icons/ph/scales-bold";
import { ShieldBoldIcon } from "@/components/icons/ph/shield-bold";
import { SkullBoldIcon } from "@/components/icons/ph/skull-bold";
import { WindBoldIcon } from "@/components/icons/ph/wind-bold";
import { Text } from "@/components/ui/text";
import {
  type DailyPractices,
  findPractice,
  type Practice,
  type PracticeIconName,
  PRACTICES_PER_DAY,
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

interface DailyPracticesSectionProps {
  practices: DailyPractices;
  onTap: (id: string) => void;
  dimmedIds?: readonly string[];
}

export function DailyPracticesSection({
  practices,
  onTap,
  dimmedIds = [],
}: DailyPracticesSectionProps) {
  // No selection yet for today → prompt the user to pick four.
  if (practices.selectedIds.length === 0) {
    return (
      <View className="flex-col gap-3">
        <Text className="px-2 font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          Daily Practices
        </Text>
        <Pressable
          className="items-center rounded-[22px] border border-border border-dashed bg-card p-8 active:scale-[0.99]"
          onPress={() => router.push("/practice-select")}
        >
          <Text className="mb-2 font-heading-bold text-[22px] text-foreground">
            choose today's {PRACTICES_PER_DAY} practices.
          </Text>
          <Text className="mb-6 px-2 text-center font-medium text-[14px] text-muted-foreground leading-relaxed">
            A self-chosen practice runs deeper than an imposed routine.
          </Text>
          <View className="h-12 w-full items-center justify-center rounded-full bg-primary">
            <Text className="font-semibold text-[15px] text-primary-foreground">
              Choose Practices
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  const rows: Practice[] = practices.selectedIds
    .map((id) => findPractice(id))
    .filter((p): p is Practice => p !== undefined);
  const completedCount = rows.filter((r) =>
    practices.completedIds.includes(r.id)
  ).length;

  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-2">
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          Daily Practices
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable
            hitSlop={6}
            onPress={() => router.push("/practice-select")}
          >
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Edit
            </Text>
          </Pressable>
          <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
            {completedCount} of {rows.length}
          </Text>
        </View>
      </View>

      <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
        {rows.map((row, index) => {
          const done = practices.completedIds.includes(row.id);
          const isLast = index === rows.length - 1;
          const Icon = ICON_MAP[row.icon];
          const dimmed = dimmedIds.includes(row.id);
          return (
            <Pressable
              className={`flex-row items-center gap-4 px-5 py-4 active:bg-muted/50 ${isLast ? "" : "border-border border-b"} ${dimmed ? "opacity-50" : ""}`}
              key={row.id}
              onPress={() => onTap(row.id)}
            >
              <View className="size-10 items-center justify-center rounded-full bg-muted">
                <Icon
                  className={`size-5 ${done ? "text-muted-foreground" : "text-foreground"}`}
                />
              </View>

              <View className="flex-1 flex-col gap-0.5">
                <Text
                  className={`font-semibold text-[15px] ${done ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {row.title}
                </Text>
                <Text
                  className="font-medium text-[13px] text-muted-foreground leading-relaxed"
                  numberOfLines={2}
                >
                  {row.description}
                </Text>
              </View>

              <View
                className={`size-7 items-center justify-center rounded-full ${done ? "bg-primary" : "border border-border bg-background"}`}
              >
                {done ? (
                  <CheckBoldIcon className="size-4 text-primary-foreground" />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
