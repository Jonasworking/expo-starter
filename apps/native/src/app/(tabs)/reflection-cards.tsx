import { Pressable, View } from "react-native";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { MoonBoldIcon } from "@/components/icons/ph/moon-bold";
import { Text } from "@/components/ui/text";
import type { ReflectionKind } from "@/contexts/app-state-context";

const PROMPTS: Record<ReflectionKind, string> = {
  morning: "What is within your control today?",
  evening: "What did you do well today?",
};

const LABELS: Record<ReflectionKind, string> = {
  morning: "Morning Reflection",
  evening: "Evening Reflection",
};

interface ReflectionPromptCardProps {
  kind: ReflectionKind;
  done: boolean;
  onReflect: () => void;
}

export function ReflectionPromptCard({
  kind,
  done,
  onReflect,
}: ReflectionPromptCardProps) {
  return (
    <View className="min-h-[280px] flex-col items-center rounded-[22px] bg-foreground p-8">
      <Text className="mb-auto font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
        {LABELS[kind]}
      </Text>
      <Text className="mb-8 text-center font-heading-bold text-[28px] text-card leading-tight">
        {PROMPTS[kind]}
      </Text>
      {done ? (
        <View className="h-12 flex-row items-center gap-2 rounded-full bg-white/20 px-6">
          <CheckBoldIcon className="size-4 text-white" />
          <Text className="font-semibold text-[16px] text-white">
            Reflected
          </Text>
        </View>
      ) : (
        <Pressable
          className="h-12 items-center justify-center rounded-full bg-card px-8 active:scale-95"
          onPress={onReflect}
        >
          <Text className="font-semibold text-[17px] text-foreground">
            Reflect
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface CompactReflectionRowProps {
  kind: ReflectionKind;
  done: boolean;
  onReflect: () => void;
  onView?: () => void;
  dimmed?: boolean;
}

export function CompactReflectionRow({
  kind,
  done,
  onReflect,
  onView,
  dimmed = false,
}: CompactReflectionRowProps) {
  const label = LABELS[kind];
  const doneText =
    kind === "morning" ? "Reflected this morning" : "Reflected this evening";
  return (
    <Pressable
      className={`flex-row items-center justify-between rounded-[22px] border border-border bg-card px-5 py-4 active:scale-[0.99] ${dimmed ? "opacity-50" : ""}`}
      onPress={done ? onView : onReflect}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 items-center justify-center rounded-full bg-muted">
          <MoonBoldIcon
            className={`size-5 ${done ? "text-muted-foreground" : "text-foreground"}`}
          />
        </View>
        <View className="flex-col gap-0.5">
          <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
            {label}
          </Text>
          <Text
            className={`text-[14px] ${done ? "text-muted-foreground" : "text-foreground"}`}
            numberOfLines={1}
          >
            {done ? doneText : "Tap to reflect"}
          </Text>
        </View>
      </View>
      {done ? (
        <View className="size-7 items-center justify-center rounded-full bg-primary">
          <CheckBoldIcon className="size-4 text-primary-foreground" />
        </View>
      ) : (
        <View className="size-7 rounded-full border border-border bg-background" />
      )}
    </Pressable>
  );
}
