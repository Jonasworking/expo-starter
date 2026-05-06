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
import { Image as ExpoImage } from "expo-image";
import { Stack } from "expo-router";
import { hideAsync, preventAutoHideAsync } from "expo-splash-screen";
import { useEffect } from "react";
import { Image as RNImage } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppStateProvider, useAppState } from "@/contexts/app-state-context";
import { AppThemeProvider } from "@/contexts/app-theme-context";
import { scheduleDailyReminder } from "@/lib/notifications";

preventAutoHideAsync();

// Bundled assets — resolved to URIs at module load so the Layout effect can
// hand them straight to expo-image's prefetch (which only accepts strings).
const FENRIR_WOLF_URIS = [
  require("../../assets/fenrir/wolf_idle.png"),
  require("../../assets/fenrir/wolf_battle.png"),
  require("../../assets/fenrir/wolf_levelup.png"),
  require("../../assets/fenrir/wolf_sad.png"),
  require("../../assets/fenrir/wolf_sleeping.png"),
  require("../../assets/fenrir/wolf_level20.png"),
]
  .map((src) => RNImage.resolveAssetSource(src)?.uri)
  .filter((uri): uri is string => Boolean(uri));

export const unstable_settings = {
  initialRouteName: "index",
};

// Re-schedule the daily reminder on every app open so today's pool message
// gets baked into the OS-scheduled notification. Lives here (rather than
// AppStateContext) so the refresh happens once per launch, independent of
// the in-session re-scheduling that fires on reminderTime/enabled changes.
function DailyReminderRefresher() {
  const { isLoaded, state } = useAppState();
  useEffect(() => {
    if (!(isLoaded && state?.hasOnboarded && state?.reminderEnabled)) {
      return;
    }
    const time = state.reminderTime;
    if (typeof time !== "string" || !time.includes(":")) {
      return;
    }
    scheduleDailyReminder(time).catch((_err) => {
      // Permission denied or platform unavailable — leave silently.
    });
    // Intentionally only re-runs when load completes; in-session changes
    // are handled by AppStateContext's own scheduling effect.
    // biome-ignore lint/correctness/useExhaustiveDependencies: see comment above
  }, [isLoaded]);
  return null;
}

function RootStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="reminder" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="your-why" options={{ headerShown: false }} />
      <Stack.Screen name="your-why-rewrite" options={{ headerShown: false }} />
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

  useEffect(() => {
    ExpoImage.prefetch(FENRIR_WOLF_URIS, "memory-disk").catch((_err) => {
      // Prefetch failures are non-fatal — the Fenrir tab will load images on
      // demand. Silently swallow so we don't surface noisy network errors.
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppStateProvider>
          <AppThemeProvider>
            <BottomSheetModalProvider>
              <DailyReminderRefresher />
              <RootStack />
              <PortalHost />
            </BottomSheetModalProvider>
          </AppThemeProvider>
        </AppStateProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
