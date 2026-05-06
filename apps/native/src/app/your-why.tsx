import { router } from "expo-router";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatLongDate(dateKey: string | null): string | null {
  if (!dateKey) {
    return null;
  }
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!(y && m && d)) {
    return null;
  }
  const month = MONTH_LABELS[m - 1] ?? "";
  return `${String(d).padStart(2, "0")} ${month} ${y}`;
}

export default function YourWhy() {
  const insets = useSafeAreaInsets();
  const { state, clearUserInitialReason } = useAppState();

  const dateLabel = formatLongDate(state.userInitialReasonDate);
  const reason = state.userInitialReason ?? "";

  const handleErase = () => {
    Alert.alert(
      "Erase your why?",
      "Your original words will be lost. You will need to write a new anchor from scratch.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase",
          style: "destructive",
          onPress: () => {
            clearUserInitialReason();
            router.replace("/your-why-rewrite");
          },
        },
      ]
    );
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
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2">
          <Text className="font-heading-bold text-[32px] text-foreground">
            your why.
          </Text>
          {dateLabel ? (
            <Text className="mt-2 font-medium text-[13px] text-muted-foreground uppercase tracking-widest">
              Set on {dateLabel}
            </Text>
          ) : null}
        </View>

        <View className="mt-12 mb-12 flex-1 justify-center">
          <Text className="font-serif text-[24px] text-foreground leading-relaxed">
            {reason}
          </Text>
        </View>
      </ScrollView>

      <View
        className="px-8"
        style={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <Pressable
          className="h-12 w-full items-center justify-center rounded-full active:opacity-70"
          onPress={handleErase}
        >
          <Text className="font-semibold text-[14px] text-destructive">
            Delete and rewrite
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
