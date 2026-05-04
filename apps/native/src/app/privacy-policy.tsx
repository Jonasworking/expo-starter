import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftIcon } from "@/components/icons/ph/arrow-left";
import { Text } from "@/components/ui/text";

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();

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
          privacy.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 32) + 16,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="In short">
          Ronin is built to be private by design. Your reflections, trial
          history, streak, and Fenrir's progress live only on this device.
        </Section>

        <Section title="What we store">
          Your username, daily reminder time, daily reflections, completed
          trials, and streak data. Everything is kept in the device's local
          secure storage and never leaves it.
        </Section>

        <Section title="What we don't do">
          We do not run servers. We do not collect analytics. We do not show
          ads. We do not have accounts, sign-ins, or cloud sync. There is
          nothing for us to share, because nothing is sent.
        </Section>

        <Section title="Your data, your control">
          You can erase everything at any time using "Reset Progress" in
          Settings. Uninstalling the app also removes all stored data.
        </Section>

        <Section title="Changes">
          If this policy ever changes, the updated text will appear on this
          screen with a new release of the app.
        </Section>

        <Text className="pt-2 text-[13px] text-muted-foreground">
          Last updated: 2026
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-semibold text-[12px] text-muted-foreground uppercase tracking-widest">
        {title}
      </Text>
      <Text className="text-[15px] text-foreground leading-relaxed">
        {children}
      </Text>
    </View>
  );
}
