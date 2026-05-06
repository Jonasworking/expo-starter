import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";

export default function Oath() {
  const insets = useSafeAreaInsets();
  const { state, completeOnboarding } = useAppState();

  const handleBegin = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1">
      {/* Split background — dark at top, cream at bottom (sunrise feeling) */}
      <View
        className="absolute top-0 right-0 left-0"
        style={{ height: "55%", backgroundColor: "#0E0E0E" }}
      />
      <View
        className="absolute right-0 bottom-0 left-0 bg-background"
        style={{ height: "45%" }}
      />

      <View
        className="flex-1 px-8"
        style={{
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 32),
        }}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-center font-serif text-[36px] text-white leading-tight">
            The path begins,{"\n"}
            {state.userName}.
          </Text>

          <View className="mt-12 max-w-sm">
            <Text className="text-center font-medium text-[16px] text-white/70 leading-relaxed">
              Your data stays on this device.{"\n"}
              No accounts. No cloud. No tracking.
            </Text>
            <Text className="mt-6 text-center font-medium text-[17px] text-foreground/80 leading-relaxed">
              Just you, the work, and Fenrir.
            </Text>
          </View>
        </View>

        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          onPress={handleBegin}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Begin
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
