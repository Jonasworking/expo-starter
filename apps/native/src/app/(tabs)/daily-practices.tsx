import type { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { MoonBoldIcon } from "@/components/icons/ph/moon-bold";
import { ScalesBoldIcon } from "@/components/icons/ph/scales-bold";
import { SkullBoldIcon } from "@/components/icons/ph/skull-bold";
import { WindBoldIcon } from "@/components/icons/ph/wind-bold";
import { Text } from "@/components/ui/text";
import type {
  DailyPractices,
  PracticeId,
  Virtue,
} from "@/contexts/app-state-context";

type IconComponent = ComponentType<{ className?: string }>;

interface PracticeRow {
  id: PracticeId;
  title: string;
  description: string;
  Icon: IconComponent;
}

interface DailyPracticesSectionProps {
  practices: DailyPractices;
  virtue: Virtue;
  onTap: (id: PracticeId) => void;
}

export function DailyPracticesSection({
  practices,
  virtue,
  onTap,
}: DailyPracticesSectionProps) {
  const rows: PracticeRow[] = [
    {
      id: "silence",
      title: "5 min Silence",
      description: "Sit. Breathe. Observe.",
      Icon: WindBoldIcon,
    },
    {
      id: "mementoMori",
      title: "Memento Mori",
      description: "Reflect on mortality. Live with intention.",
      Icon: SkullBoldIcon,
    },
    {
      id: "virtue",
      title: `Practice ${virtue.name}`,
      description: virtue.description,
      Icon: ScalesBoldIcon,
    },
    {
      id: "eveningReflection",
      title: "Evening Reflection",
      description: "What did you do well today?",
      Icon: MoonBoldIcon,
    },
  ];

  const completedCount = rows.filter((r) => practices[r.id]).length;

  return (
    <View className="flex-col gap-3">
      <View className="flex-row items-center justify-between px-2">
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          Daily Practices
        </Text>
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          {completedCount} of {rows.length}
        </Text>
      </View>

      <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
        {rows.map((row, index) => {
          const done = practices[row.id];
          const isLast = index === rows.length - 1;
          const { Icon } = row;
          return (
            <Pressable
              className={`flex-row items-center gap-4 px-5 py-4 active:bg-muted/50 ${isLast ? "" : "border-border border-b"}`}
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
                  className="text-[13px] text-muted-foreground"
                  numberOfLines={1}
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
