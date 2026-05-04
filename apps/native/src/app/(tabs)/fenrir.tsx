import { Image } from "expo-image";
import { Platform, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderAvatar } from "@/components/header-avatar";
import { CrownBoldIcon } from "@/components/icons/solar/crown-bold";
import { FireBoldIcon } from "@/components/icons/solar/fire-bold";
import { ShieldCheckBoldIcon } from "@/components/icons/solar/shield-check-bold";
import { Text } from "@/components/ui/text";
import { getRankTitle, useAppState } from "@/contexts/app-state-context";

const WOLF_URI =
  "https://ggrhecslgdflloszjkwl.supabase.co/storage/v1/object/public/user-assets/7oidmK6IZjC/ai/wolf-idle-png-vTNeWnkfaQr.png";

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
];
const toRoman = (n: number) =>
  n >= 1 && n <= ROMAN.length ? ROMAN[n - 1] : String(n);

const EMBERS_PER_RANK = 300;

export default function Fenrir() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { state, rollingStats } = useAppState();
  const { fenrir, streak } = state;

  const wolfAreaHeight = windowHeight * 0.48;
  const wolfWidth = windowWidth * 0.75;
  const wolfHeight = wolfAreaHeight * 0.62;
  const progressPct = Math.min(
    fenrir.embersTowardNextRank / EMBERS_PER_RANK,
    1
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header overlay (above wolf) */}
      <View
        className="absolute right-0 left-0 z-10 flex-row items-center justify-between px-8"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center rounded-full border border-border bg-card px-3.5 py-1.5">
          <FireBoldIcon className="size-4 text-accent" />
          <Text className="ml-1.5 font-semibold text-base text-foreground">
            {streak}
          </Text>
        </View>
        <HeaderAvatar name={state.userName} />
      </View>

      {/* Wolf area */}
      <View
        className="items-center justify-end overflow-hidden"
        style={{ height: wolfAreaHeight, paddingTop: insets.top }}
      >
        <Image
          cachePolicy="memory-disk"
          contentFit="contain"
          priority="high"
          source={{ uri: WOLF_URI }}
          style={{ width: wolfWidth, height: wolfHeight }}
          transition={200}
        />

        {/* Speech bubble */}
        <View className="mx-10 mb-4 rounded-[22px] border border-border bg-card px-5 py-3">
          <Text
            className="select-none text-center font-serif text-[18px] text-foreground"
            // The base Text component opts into `user-select: text` on web,
            // which lets the browser drop a blinking caret here. The bubble
            // is decorative — disable selection and hide any caret on web.
            style={Platform.select({
              web: { caretColor: "transparent" },
              default: undefined,
            })}
          >
            Fenrir watches in silence.
          </Text>
        </View>
      </View>

      {/* Stats section */}
      <ScrollView
        contentContainerStyle={{ padding: 32, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Rank progress card */}
        <View className="gap-4 rounded-[22px] bg-primary p-8">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-[12px] text-primary-foreground/60 uppercase tracking-widest">
              Rank {toRoman(fenrir.rank)}
            </Text>
            <Text className="font-semibold text-[12px] text-primary-foreground/60 uppercase tracking-widest">
              {getRankTitle(fenrir.rank).replace("Ronin ", "")}
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
            <View
              className="h-full rounded-full bg-primary-foreground"
              style={{ width: `${progressPct * 100}%` }}
            />
          </View>

          <Text className="text-[14px] text-primary-foreground/60">
            {fenrir.embersTowardNextRank} / {EMBERS_PER_RANK} Embers to next
            rank
          </Text>
        </View>

        {/* Rolling completion */}
        <View className="gap-3 rounded-[22px] border border-border bg-card p-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Last 7 Days
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              {rollingStats.pct}%
            </Text>
          </View>
          <Text className="font-heading-bold text-[24px] text-foreground">
            Sealed {rollingStats.completed} of {rollingStats.window} days
          </Text>
          <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${rollingStats.pct}%` }}
            />
          </View>
          <Text className="text-[13px] text-muted-foreground leading-relaxed">
            A rolling window beats a brittle streak. Miss a day or two — the
            path remains.
          </Text>
        </View>

        {/* Stats grid */}
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <FireBoldIcon className="size-6 text-accent" />
            <Text className="font-bold text-[26px] text-foreground">
              {streak}
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Embers
            </Text>
          </View>

          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <ShieldCheckBoldIcon className="size-6 text-foreground" />
            <Text className="font-bold text-[26px] text-foreground">
              {fenrir.totalTrials}
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Trials
            </Text>
          </View>

          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <CrownBoldIcon className="size-6 text-foreground" />
            <Text className="font-bold text-[26px] text-foreground">
              {toRoman(fenrir.rank)}
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Rank
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
