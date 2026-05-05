import "@/global.css";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { Lexend_400Regular, Lexend_700Bold } from "@expo-google-fonts/lexend";
import { PlayfairDisplay_400Regular_Italic } from "@expo-google-fonts/playfair-display";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppStateProvider } from "@/contexts/app-state-context";
import { AppThemeProvider } from "@/contexts/app-theme-context";

preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

function RootStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="reminder" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="trial-select" options={{ headerShown: false }} />
      <Stack.Screen name="practice-select" options={{ headerShown: false }} />
      <Stack.Screen
        name="sealed"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lexend_400Regular,
    Lexend_700Bold,
    PlayfairDisplay_400Regular_Italic,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppStateProvider>
          <AppThemeProvider>
            <BottomSheetModalProvider>
              <RootStack />
              <PortalHost />
            </BottomSheetModalProvider>
          </AppThemeProvider>
        </AppStateProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
