import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

const WOLF_IDLE = require("../../../assets/fenrir/wolf_idle.png");

export default function Threshold() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 px-8"
      style={{
        backgroundColor: "#0E0E0E",
        paddingTop: insets.top,
      }}
    >
      <View className="flex-1 items-center justify-center">
        <Image
          contentFit="contain"
          source={WOLF_IDLE}
          style={{ width: 240, height: 240 }}
        />

        <View className="mt-12 max-w-sm">
          <Text className="text-center font-serif text-[26px] text-white leading-snug">
            This is not an app for habits.
          </Text>

          <Text className="mt-6 text-center font-medium text-[17px] text-white/80 leading-relaxed">
            Ronin is for those who want to become harder.{"\n"}
            Stoic. Disciplined. Quiet.
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full active:scale-95"
          onPress={() => router.push("/onboarding/why")}
          style={{
            backgroundColor: "#1f1f1f",
            borderColor: "rgba(255,255,255,0.18)",
            borderWidth: 1,
          }}
        >
          <Text className="font-semibold text-[17px] text-white">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
