import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DogFillIcon } from "@/components/icons/ph/dog-fill";
import { CalendarMinimalisticBoldIcon } from "@/components/icons/solar/calendar-minimalistic-bold";
import { CalendarMinimalisticOutlineIcon } from "@/components/icons/solar/calendar-minimalistic-outline";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/lib/theme/use-theme-color";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [background, foreground, mutedForeground, border] = useThemeColor([
    "background",
    "foreground",
    "muted-foreground",
    "border",
  ]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
          borderTopWidth: 0.5,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: foreground,
        tabBarInactiveTintColor: mutedForeground,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_600SemiBold",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) =>
            focused ? (
              <CalendarMinimalisticBoldIcon className="size-6 text-foreground" />
            ) : (
              <CalendarMinimalisticOutlineIcon className="size-6 text-muted-foreground" />
            ),
          tabBarLabel: ({ focused }) => (
            <Text
              className={`font-semibold text-[12px] ${focused ? "text-foreground" : "text-muted-foreground"}`}
            >
              Today
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="fenrir"
        options={{
          title: "Fenrir",
          tabBarIcon: ({ focused }) => (
            <DogFillIcon
              className={`size-6 ${focused ? "text-foreground" : "text-muted-foreground"}`}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              className={`font-semibold text-[12px] ${focused ? "text-foreground" : "text-muted-foreground"}`}
            >
              Fenrir
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
