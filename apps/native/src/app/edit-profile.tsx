import { router } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const MAX_NAME_LENGTH = 24;

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { state, setUserName } = useAppState();
  const [name, setName] = useState(state.userName);
  const [foreground, mutedForeground] = useThemeColor([
    "foreground",
    "muted-foreground",
  ]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== state.userName;

  const handleSave = () => {
    if (!canSave) {
      return;
    }
    setUserName(trimmed);
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
          profile.
        </Text>
      </View>

      <View className="flex-1 px-8 pt-6">
        <Text className="mb-2 font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
          Username
        </Text>
        <View className="rounded-[22px] border border-border bg-card px-5 py-4">
          <TextInput
            autoFocus
            maxLength={MAX_NAME_LENGTH}
            onChangeText={setName}
            onSubmitEditing={handleSave}
            placeholder="Warrior"
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
        <Text className="mt-3 text-[13px] text-muted-foreground">
          {trimmed.length} / {MAX_NAME_LENGTH}
        </Text>
      </View>

      <View
        className="px-8"
        style={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
          disabled={!canSave}
          onPress={handleSave}
          style={{ opacity: canSave ? 1 : 0.4 }}
        >
          <Text className="font-semibold text-[17px] text-primary-foreground">
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
