import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

const WOLF_IDLE = require("../../assets/fenrir/wolf_idle.png");

export function SplashScreen() {
  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: "#0E0E0E" }}
    >
      <Image
        contentFit="contain"
        source={WOLF_IDLE}
        style={{ width: 220, height: 220 }}
      />
      <View style={{ height: 24 }} />
      <Text className="font-serif text-[30px] text-white">Ronin</Text>
    </View>
  );
}
