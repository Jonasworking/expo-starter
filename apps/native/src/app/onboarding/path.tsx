import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

export default function Path() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background px-8"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 32),
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Text className="text-center font-serif text-[36px] text-foreground leading-tight">
          The path.
        </Text>

        <View style={{ height: 48 }} />

        <Text className="text-center text-[15px] text-muted-foreground leading-relaxed">
          Each day: 4 practices, your choice.
        </Text>
        <View style={{ height: 12 }} />
        <Text className="text-center text-[15px] text-muted-foreground leading-relaxed">
          Each week: 1 trial, your commitment.
        </Text>

        <View style={{ height: 28 }} />

        <Text
          className="text-center text-[14px] text-muted-foreground/60 leading-relaxed"
          style={{ fontStyle: "italic" }}
        >
          Self-chosen runs deeper than imposed.
        </Text>

        <View style={{ height: 28 }} />

        <Text className="text-center text-[15px] text-muted-foreground leading-relaxed">
          No streaks. No freezes.
        </Text>
        <Text className="text-center text-[15px] text-muted-foreground leading-relaxed">
          Break it, you break.
        </Text>
      </View>

      <Pressable
        className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
        onPress={() => router.push("/onboarding/oath")}
      >
        <Text className="font-semibold text-[17px] text-primary-foreground">
          Continue
        </Text>
      </Pressable>
    </View>
  );
}
