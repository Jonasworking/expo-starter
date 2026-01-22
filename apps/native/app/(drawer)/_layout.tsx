import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useCallback } from "react";
import { Pressable } from "react-native";

import { ThemeToggle } from "@/components/theme-toggle";
import { Text } from "@/components/ui/text";
import { useThemeColor } from "@/lib/theme/use-theme-color";

function DrawerLayout() {
  const [themeColorBackground, themeColorForeground] = useThemeColor([
    "background",
    "foreground",
  ]);
  const renderThemeToggle = useCallback(() => <ThemeToggle />, []);

  return (
    <Drawer
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerStyle: { backgroundColor: themeColorBackground },
        headerTitleStyle: {
          fontWeight: "600",
          color: themeColorForeground,
        },
        headerRight: renderThemeToggle,
        drawerStyle: { backgroundColor: themeColorBackground },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Home",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>
              Home
            </Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <Ionicons
              color={focused ? color : themeColorForeground}
              name="home-outline"
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Tabs",
          drawerLabel: ({ color, focused }) => (
            <Text style={{ color: focused ? color : themeColorForeground }}>
              Tabs
            </Text>
          ),
          drawerIcon: ({ size, color, focused }) => (
            <MaterialIcons
              color={focused ? color : themeColorForeground}
              name="border-bottom"
              size={size}
            />
          ),
          headerRight: () => (
            <Link asChild href="/modal">
              <Pressable className="mr-4">
                <Ionicons
                  color={themeColorForeground}
                  name="add-outline"
                  size={24}
                />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Drawer>
  );
}

export default DrawerLayout;
