import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Text } from "@/components/ui/text";
import { useAppState } from "@/contexts/app-state-context";
import { useThemeColor } from "@/lib/theme/use-theme-color";

const MIN_REASON_LENGTH = 20;
const MAX_REASON_LENGTH = 500;
// Fixed input height — bounded so the screen never grows past the keyboard;
// internal TextInput scrolling kicks in once the user types past it.
const INPUT_HEIGHT = 120;

export default function Why() {
  const insets = useSafeAreaInsets();
  const { setUserInitialReason } = useAppState();
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [foreground, mutedForeground] = useThemeColor([
    "foreground",
    "muted-foreground",
  ]);

  const trimmed = reason.trim();
  const canContinue = true;
  const hasReason = trimmed.length > 0;

  const handleConfirm = () => {
    setUserInitialReason(trimmed);
    setConfirmOpen(false);
    router.push("/onboarding/name");
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-8 pt-12"
        keyboardVerticalOffset={insets.top}
      >
        {/* Top section — headline, subtitle, input, counter (intrinsic height) */}
        <Text className="font-serif text-[36px] text-foreground leading-tight">
          Why are you here?
        </Text>
        <Text className="mt-3 font-medium text-[15px] text-muted-foreground leading-relaxed">
          Be honest. Be precise. No one will read this but you. You can set this later.
        </Text>

        <View className="mt-8 rounded-[22px] border border-border bg-card px-5 py-4">
          <TextInput
            autoFocus
            maxLength={MAX_REASON_LENGTH}
            multiline
            onChangeText={setReason}
            placeholder="I want to stop..."
            placeholderTextColor={mutedForeground}
            style={{
              height: INPUT_HEIGHT,
              fontSize: 17,
              color: foreground,
              fontFamily: "Inter_400Regular",
              padding: 0,
              // Small leading inset so the blinking cursor sits LEFT of the
              // placeholder's "I" instead of fusing into the I's stem.
              paddingLeft: 4,
              textAlignVertical: "top",
            }}
            value={reason}
          />
        </View>

        <Text
          className="text-[13px] text-muted-foreground"
          style={{ marginTop: 16, marginBottom: 16 }}
        >
          {hasReason ? `${trimmed.length} / ${MAX_REASON_LENGTH}` : ""}
        </Text>

        <View style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Pressable
            className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
            disabled={!canContinue}
            onPress={() => {
              if (hasReason) {
                setConfirmOpen(true);
              } else {
                handleConfirm();
              }
            }}
            style={{ opacity: canContinue ? 1 : 0.4 }}
          >
            <Text className="font-semibold text-[17px] text-primary-foreground">
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        cancelLabel="Rewrite"
        confirmLabel="Confirm"
        description={
          "This is your anchor. The reason you keep walking when the path gets hard.\n\nChoose carefully."
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Are you sure?"
        visible={confirmOpen}
      />
    </View>
  );
}
