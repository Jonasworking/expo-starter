import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckBoldIcon } from "@/components/icons/ph/check-bold";
import { CheckCircleFillIcon } from "@/components/icons/ph/check-circle-fill";
import { Text } from "@/components/ui/text";
import { toDateKey, useAppState } from "@/contexts/app-state-context";

const ROMAN_DAY = [
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
  "XXVI",
  "XXVII",
  "XXVIII",
  "XXIX",
  "XXX",
  "XXXI",
];
const toRoman = (n: number) =>
  n >= 1 && n <= ROMAN_DAY.length ? ROMAN_DAY[n - 1] : String(n);

export default function Sealed() {
  const insets = useSafeAreaInsets();
  const { state, sealDay } = useAppState();

  const todayData = state.days[toDateKey()];
  const reflected = Boolean(todayData?.reflected);
  const trialCompleted = Boolean(todayData?.trialCompleted);
  const dayNum = state.streak + 1;

  const handleContinue = () => {
    sealDay();
    router.replace("/(tabs)");
  };

  return (
    <View
      className="flex-1 bg-background px-8"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Day label */}
      <View className="items-center pt-4">
        <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          Day {toRoman(dayNum)} · Ember Lit
        </Text>
      </View>

      {/* Center content */}
      <View className="flex-1 items-center justify-center gap-12">
        {/* Check circle */}
        <View className="size-32 items-center justify-center rounded-full bg-primary">
          <CheckBoldIcon className="size-16 text-primary-foreground" />
        </View>

        <Text className="text-center font-serif text-[40px] text-foreground leading-tight">
          Sealed. The day is yours.
        </Text>

        {/* Completed tasks */}
        <View className="w-full gap-4 rounded-[22px] border border-border bg-card p-8">
          {reflected && (
            <View className="flex-row items-center gap-3">
              <CheckCircleFillIcon className="size-5 text-primary" />
              <Text className="text-base text-foreground">
                Morning Reflection
              </Text>
            </View>
          )}
          {trialCompleted && (
            <View className="flex-row items-center gap-3">
              <CheckCircleFillIcon className="size-5 text-primary" />
              <Text className="text-base text-foreground">
                Cold Shower Trial
              </Text>
            </View>
          )}
        </View>

        <Text className="font-serif text-[18px] text-muted-foreground">
          — Fenrir grows stronger —
        </Text>
      </View>

      {/* CTA */}
      <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          onPress={handleContinue}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
