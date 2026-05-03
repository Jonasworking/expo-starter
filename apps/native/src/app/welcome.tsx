import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";

export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAppState();

  const handleContinue = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <View
      className="flex-1 bg-background px-8"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-1 items-center" style={{ paddingTop: "25%" }}>
        <Text className="mb-6 text-center font-serif text-[40px] text-foreground leading-tight">
          Welcome to Ronin.
        </Text>
        <Text className="max-w-xs text-center text-base text-muted-foreground leading-relaxed">
          A daily path to discipline and stoic reflection.{"\n"}Forge your mind,
          fuel your embers, and let{"\n"}your companion grow.
        </Text>
      </View>

      <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-[0.97]"
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
