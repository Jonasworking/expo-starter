import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const MAX_NAME_LENGTH = 24;

export default function Name() {
  const insets = useSafeAreaInsets();
  const { setUserName } = useAppState();
  const [name, setName] = useState("");
  const [foreground, mutedForeground] = useThemeColor([
    "foreground",
    "muted-foreground",
  ]);

  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }
    setUserName(trimmed);
    router.push("/onboarding/reminder");
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-8 pt-12"
        keyboardVerticalOffset={insets.top}
      >
        <View className="flex-1">
          <Text className="font-serif text-[36px] text-foreground leading-tight">
            What shall we call you?
          </Text>

          <View className="mt-8 rounded-[22px] border border-border bg-card px-5 py-4">
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              maxLength={MAX_NAME_LENGTH}
              onChangeText={setName}
              onSubmitEditing={handleContinue}
              placeholder="Name"
              placeholderTextColor={mutedForeground}
              returnKeyType="done"
              style={{
                fontSize: 18,
                color: foreground,
                fontFamily: "Inter_500Medium",
                padding: 0,
              }}
              value={name}
            />
          </View>

          <Text className="mt-4 text-[14px] text-muted-foreground">
            This is between you and Fenrir.
          </Text>
        </View>

        <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Pressable
            className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
            disabled={!canContinue}
            onPress={handleContinue}
            style={{ opacity: canContinue ? 1 : 0.4 }}
          >
            <Text className="font-semibold text-[17px] text-primary-foreground">
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
