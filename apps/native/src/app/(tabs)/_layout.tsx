import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCallback } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useThemeColor } from "@/lib/theme/use-theme-color";

export default function TabLayout() {
  const [themeColorBackground, themeColorForeground] = useThemeColor([
    "background",
    "foreground",
  ]);
  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColorBackground,
        },
        headerTintColor: themeColorForeground,
        headerTitleStyle: {
          color: themeColorForeground,
          fontWeight: "600",
        },
        headerRight: renderThemeToggle,
        tabBarStyle: {
          backgroundColor: themeColorBackground,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons color={color} name="home" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons color={color} name="compass" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
