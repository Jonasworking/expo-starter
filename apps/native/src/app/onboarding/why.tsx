import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
  const canContinue = trimmed.length >= MIN_REASON_LENGTH;

  const handleConfirm = () => {
    setUserInitialReason(trimmed);
    setConfirmOpen(false);
    router.push("/onboarding/name");
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 pt-12">
            <Text className="font-heading-bold text-[32px] text-foreground leading-tight">
              Why are you here?
            </Text>
            <Text className="mt-3 font-medium text-[15px] text-muted-foreground leading-relaxed">
              Be honest. Be precise. No one will read this but you.
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
                  minHeight: 120,
                  fontSize: 17,
                  color: foreground,
                  fontFamily: "Inter_400Regular",
                  padding: 0,
                  textAlignVertical: "top",
                }}
                value={reason}
              />
            </View>

            <Text className="mt-3 text-[13px] text-muted-foreground">
              {trimmed.length < MIN_REASON_LENGTH
                ? `${MIN_REASON_LENGTH - trimmed.length} more characters required`
                : `${trimmed.length} / ${MAX_REASON_LENGTH}`}
            </Text>
          </View>
        </ScrollView>

        <View
          className="px-8"
          style={{ paddingBottom: Math.max(insets.bottom, 32) }}
        >
          <Pressable
            className="h-14 w-full items-center justify-center rounded-full bg-primary active:scale-95"
            disabled={!canContinue}
            onPress={() => setConfirmOpen(true)}
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
          "This is your anchor. The reason you keep walking when the path gets hard.\n\nOnce written, it stays."
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Are you sure?"
        visible={confirmOpen}
      />
    </View>
  );
}
