import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import { RoninFlame } from "@/components/ronin-flame";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";

// Mirror the constant declared in app-state-context — kept local to avoid
// exporting an internal from the context file.
const EMBERS_PER_RANK = 300;
const PULSE_SCALE = 1.08;
const PULSE_HALF_DURATION_MS = 200;

export function EmberPill() {
  const { state } = useAppState();
  const totalEmbers =
    (state.fenrir.rank - 1) * EMBERS_PER_RANK +
    state.fenrir.embersTowardNextRank;

  const previousEmbers = useRef(totalEmbers);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (totalEmbers > previousEmbers.current) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: PULSE_SCALE,
          duration: PULSE_HALF_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: PULSE_HALF_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousEmbers.current = totalEmbers;
  }, [totalEmbers, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        className="flex-row items-center rounded-full bg-card px-3 py-1.5"
        hitSlop={6}
        onPress={() => router.push("/streak-path")}
      >
        <RoninFlame size={14} />
        <Text className="ml-1.5 font-semibold text-[15px] text-foreground">
          {state.streak}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
