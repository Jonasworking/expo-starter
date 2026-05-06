import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAppState } from "@/contexts/app-state-context";

export default function Index() {
  const { isLoaded, state } = useAppState();

  if (!isLoaded) {
    return <View className="flex-1 bg-background" />;
  }

  if (state.hasOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
