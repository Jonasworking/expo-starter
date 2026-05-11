import { Image } from "expo-image";
import {
  Platform,
  ScrollView,
  type TextStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmberPill } from "@/components/ember-pill";
import { HeaderAvatar } from "@/components/header-avatar";
import { FireFillIcon } from "@/components/icons/ph/fire-fill";
import { ShieldCheckFillIcon } from "@/components/icons/ph/shield-check-fill";
import { SkullBoldIcon } from "@/components/icons/ph/skull-bold";
import { Text } from "@/components/ui/text";
import {
  getRankTitle,
  HABIT_AUTOMATICITY_DAYS,
  useAppState,
} from "@/contexts/app-state-context";
import { getFenrirMoodImage, getFenrirQuote } from "@/lib/fenrir-mood";

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
  const { state, rollingStats, totalActiveDays } = useAppState();
  const { fenrir, streak } = state;
  const habitPct = Math.min(
    Math.round((totalActiveDays / HABIT_AUTOMATICITY_DAYS) * 100),
    100
  );
  const habitReached = totalActiveDays >= HABIT_AUTOMATICITY_DAYS;

  const wolfAreaHeight = windowHeight * 0.48;
  const wolfWidth = windowWidth * 0.75;
  const wolfHeight = wolfAreaHeight * 0.62;
  const progressPct = Math.min(
    fenrir.embersTowardNextRank / EMBERS_PER_RANK,
    1
  );
  const now = new Date();
  const wolfImage = getFenrirMoodImage(state, now);
  const fenrirQuote = getFenrirQuote(state, now);

  return (
    <View className="flex-1 bg-background">
      {/* Header overlay (above wolf) — mirror the Today layout exactly so
          both tabs share one header silhouette: fixed side slots, same badge
          and avatar dimensions, identical horizontal padding. */}
      <View
        className="absolute right-0 left-0 z-10 flex-row items-center px-6"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="w-16 items-start">
          <EmberPill />
        </View>
        <View className="flex-1" />
        <View className="w-16 items-end">
          <HeaderAvatar name={state.userName} />
        </View>
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
          source={wolfImage}
          style={{ width: wolfWidth, height: wolfHeight }}
          transition={150}
        />

        {/* Speech bubble */}
        <View className="mx-10 mb-4 rounded-[22px] border border-border bg-card px-5 py-3">
          <Text
            className="select-none text-center font-serif text-[18px] text-foreground"
            // The base Text component opts into `user-select: text` on web,
            // which lets the browser drop a blinking caret here. The bubble
            // is decorative — disable selection and hide any caret on web.
            style={Platform.select({
              web: { caretColor: "transparent" } as TextStyle,
              default: undefined,
            })}
          >
            {fenrirQuote}
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

        {/* 66-day habit automaticity */}
        <View className="gap-3 rounded-[22px] border border-border bg-card p-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Habit Automaticity
            </Text>
            {habitReached ? (
              <View className="rounded-full bg-primary px-3 py-1">
                <Text className="font-semibold text-[10px] text-primary-foreground uppercase tracking-widest">
                  Achieved
                </Text>
              </View>
            ) : (
              <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
                {habitPct}%
              </Text>
            )}
          </View>
          <Text className="font-heading-bold text-[24px] text-foreground">
            {totalActiveDays} of {HABIT_AUTOMATICITY_DAYS} days
          </Text>
          <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${habitPct}%` }}
            />
          </View>
          <Text className="text-[13px] text-muted-foreground leading-relaxed">
            {habitReached
              ? "The practice has become the path. The path has become you."
              : "Research suggests it takes ~66 days for a behavior to become automatic. Each day of practice counts."}
          </Text>
        </View>

        {/* Stats grid */}
        <View className="flex-row gap-3">
          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <FireFillIcon className="size-6 text-accent" />
            <Text className="font-bold text-[26px] text-foreground">
              {streak}
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Embers
            </Text>
          </View>

          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <ShieldCheckFillIcon className="size-6 text-foreground" />
            <Text className="font-bold text-[26px] text-foreground">
              {fenrir.totalTrials}
            </Text>
            <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
              Trials
            </Text>
          </View>

          <View className="flex-1 items-center gap-2 rounded-[18px] border border-border bg-card p-4">
            <SkullBoldIcon className="size-6 text-foreground" />
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
