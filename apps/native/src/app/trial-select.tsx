import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { CaretRightBoldIcon } from "@/components/icons/ph/caret-right-bold";
import { FireBoldIcon } from "@/components/icons/solar/fire-bold";
import { Text } from "@/components/ui/text";
import { TRIAL_POOL, useAppState } from "@/contexts/app-state-context";

const EMBERS_PER_DAY = 50;

export default function TrialSelect() {
  const insets = useSafeAreaInsets();
  const { state, selectTrial } = useAppState();
  const params = useLocalSearchParams<{ reroll?: string }>();
  const reroll = params.reroll === "1";

  const handleSelect = (id: string) => {
    selectTrial(id, { reroll });
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
          {reroll ? "switch trial." : "choose trial."}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 32) + 16,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-2 px-1 text-[15px] text-muted-foreground leading-relaxed">
          {reroll
            ? "Switching loses your current trial progress. Pick the path that fits today."
            : "Pick a trial to commit to. Self-chosen practices are stronger than imposed ones."}
        </Text>

        {TRIAL_POOL.map((trial) => {
          const isActive = trial.id === state.fenrir.activeTrialId;
          const totalEmbers = trial.days * EMBERS_PER_DAY;
          return (
            <Pressable
              className="flex-col gap-2 rounded-[22px] border border-border bg-card p-5 active:scale-[0.99]"
              key={trial.id}
              onPress={() => handleSelect(trial.id)}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-heading-bold text-[20px] text-foreground">
                  {trial.title}
                </Text>
                {isActive ? (
                  <View className="rounded-full bg-muted px-2 py-1">
                    <Text className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest">
                      Active
                    </Text>
                  </View>
                ) : (
                  <CaretRightBoldIcon className="size-4 text-muted-foreground" />
                )}
              </View>
              <Text className="text-[14px] text-foreground leading-relaxed">
                {trial.description}
              </Text>
              <View className="mt-1 flex-row items-center gap-4">
                <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                  {trial.days} days
                </Text>
                <View className="flex-row items-center gap-1">
                  <FireBoldIcon className="size-3.5 text-accent" />
                  <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                    {totalEmbers} embers
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
