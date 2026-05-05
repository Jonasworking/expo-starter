import { router } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { BellBoldIcon } from "@/components/icons/ph/bell-bold";
import { CaretRightBoldIcon } from "@/components/icons/ph/caret-right-bold";
import { ShieldBoldIcon } from "@/components/icons/ph/shield-bold";
import { TrashBoldIcon } from "@/components/icons/ph/trash-bold";
import { UserCircleBoldIcon } from "@/components/icons/ph/user-circle-bold";
import { Text } from "@/components/ui/text";
import { getRankTitle, useAppState } from "@/contexts/app-state-context";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { state, resetProgress } = useAppState();

  const handleReset = () => {
    Alert.alert(
      "Reset Progress",
      "This will erase all your streaks, trials, and Fenrir progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetProgress();
            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="h-16 flex-row items-center px-8">
        <Pressable
          className="-ml-2 p-2"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon className="size-6 text-foreground" />
        </Pressable>
        <Text className="flex-1 pr-10 text-center font-heading-bold text-[26px] text-foreground">
          settings.
        </Text>
      </View>

      <View className="mt-10 flex-col gap-4 px-8">
        {/* Profile card */}
        <View className="mb-4 flex-row items-center gap-4 rounded-[22px] border border-border bg-card p-6">
          <Avatar
            emojiFontSize={Math.round(64 * 0.55)}
            letterFontSize={Math.round(64 * 0.4)}
            name={state.userName}
            size={64}
          />
          <View className="flex-col">
            <Text className="font-bold text-[18px] text-foreground">
              {state.userName}
            </Text>
            <Text className="text-[13px] text-muted-foreground uppercase tracking-widest">
              {getRankTitle(state.fenrir.rank)}
            </Text>
          </View>
        </View>

        {/* Settings rows */}
        <View className="flex-col overflow-hidden rounded-[22px] border border-border bg-card">
          <Pressable
            className="h-16 flex-row items-center justify-between border-border border-b px-6 active:bg-muted/50"
            onPress={() => router.push("/reminder")}
          >
            <View className="flex-row items-center gap-3">
              <BellBoldIcon className="size-6 text-foreground" />
              <Text className="font-medium text-base text-foreground">
                Daily Reminder
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base text-muted-foreground">
                {state.reminderTime}
              </Text>
              <CaretRightBoldIcon className="size-4 text-muted-foreground" />
            </View>
          </Pressable>

          <Pressable
            className="h-16 flex-row items-center justify-between border-border border-b px-6 active:bg-muted/50"
            onPress={() => router.push("/edit-profile")}
          >
            <View className="flex-row items-center gap-3">
              <UserCircleBoldIcon className="size-6 text-foreground" />
              <Text className="font-medium text-base text-foreground">
                Edit Profile
              </Text>
            </View>
            <CaretRightBoldIcon className="size-4 text-muted-foreground" />
          </Pressable>

          <Pressable
            className="h-16 flex-row items-center justify-between px-6 active:bg-muted/50"
            onPress={() => router.push("/privacy-policy")}
          >
            <View className="flex-row items-center gap-3">
              <ShieldBoldIcon className="size-6 text-foreground" />
              <Text className="font-medium text-base text-foreground">
                Privacy Policy
              </Text>
            </View>
            <CaretRightBoldIcon className="size-4 text-muted-foreground" />
          </Pressable>
        </View>

        {/* Reset button */}
        <Pressable
          className="mt-4 h-14 w-full flex-row items-center justify-center gap-2 rounded-full border border-border bg-card active:scale-95"
          onPress={handleReset}
        >
          <TrashBoldIcon className="size-5 text-destructive" />
          <Text className="font-semibold text-base text-destructive">
            Reset Progress
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
